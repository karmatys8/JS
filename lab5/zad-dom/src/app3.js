import express from "express";
import morgan from "morgan";
import { MongoClient } from "mongodb";

/* *************************** */
/* Configuring the application */
/* *************************** */
const app = express();

app.set("views", "./views");
app.set("view engine", "pug");

app.locals.pretty = app.get("env") === "development"; // The resulting HTML code will be indented in the development environment

/* ************************************************ */

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const getFromMongoDB = async (response, query = {}) => {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  let conn;
  try {
    conn = await client.connect();
    const db = conn.db("AGH");
    const collection = db.collection("students");
    const students = await collection.find(query).toArray();
    
    response.status(200);
    response.render("index", { students: students }); // Render the 'index' view
  } catch (e) {
    console.error(e);
    response.status(500).send("Błąd serwera");
  } finally {
    if (conn) {
      await conn.close();
    }
  }
};

/* ******** */
/* "Routes" */
/* ******** */

/* ------------- */
/* Route 'GET /' */
/* ------------- */
app.get("/", async (request, response) => {
  getFromMongoDB(response);
});

/* ------------- */
/* Route 'GET /:department' */
/* ------------- */
app.get("/:department", async (request, response) => {
  getFromMongoDB(response, { department: request.params.department });
});

/* ------------- */
/* Route 'GET /submit' */
/* ------------- */
app.get("/submit", (request, response) => {
  response.status(200);
  response.send(`Hello ${request.query.name}`);
});

/* ------------- */
/* Route 'POST /' */
/* ------------- */
app.post("/", (request, response) => {
  response.status(200);
  response.send(`Hello ${request.body?.name}`);
});

/* ************************************************ */

app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
