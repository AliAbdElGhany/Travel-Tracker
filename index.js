import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "EnAlAmAb_910",
  port: 5432, 
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisted() {
  const result = await db.query("SELECT country_code FROM country_visted");

  let visitedCountries=[];

  result.rows.forEach((country)=>{
    visitedCountries.push(country.country_code);
  });

  console.log(result.rows);

  return visitedCountries;
}

// GET home page
app.get("/", async (req, res) => {
  const visitedCountries = await checkVisted();

  res.render("index.ejs", { countries: visitedCountries, total:visitedCountries.length });
});

//INSERT new country
app.post("/add",async (req,res)=>{
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ; ",
      [input.toLowerCase()]
    );
  
      const data = result.rows[0];
      const countryCode = data.country_code;

      try {
        await db.query("INSERT INTO country_visted (country_code) VALUES ($1)",
          [countryCode] );
    
        res.redirect("/");

      } catch (error) {
        console.log(error);
        const visitedCountries = await checkVisted();
        res.render("index.ejs", {
          countries: visitedCountries, 
          total:visitedCountries.length, 
          error:"Country has already been added, try again." });
      }
     
    
  } catch (error) {
    console.log(error);
    const visitedCountries = await checkVisted();
    res.render("index.ejs", {
      countries: visitedCountries, 
      total:visitedCountries.length, 
      error:"Country name does not exist, try again." });
  
  }
  

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


