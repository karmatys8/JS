/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

import express from "express";
import morgan from "morgan";

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

let students = [
  {
    firstName: "Jan",
    lastName: "Kowalski",
  },
  {
    firstName: "Anna",
    lastName: "Nowak",
  },
];

let locals = {
  students: students
}

/* ******** */
/* "Routes" */
/* ******** */

/* ------------- */
/* Route 'GET /' */
/* ------------- */
app.get("/", (request, response) => {
  response.status(200);
  response.render("index", locals); // Render the 'index' view
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
