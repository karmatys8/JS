/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

import express from "express";
import morgan from "morgan";

const app = express();

/* ************************************************ */
/* Determining the contents of the middleware stack *
/* ************************************************ */

app.use(morgan("dev")); // Place an HTTP request recorder on the stack — each request will be logged in the console in 'dev' format
app.use(express.static("public"));

/* ******** */
/* "Routes" */
/* ******** */

/* ------------- */
/* Route 'GET /' */
/* ------------- */
app.get("/", (request, response) => {
  // Generating the form if the relative URL is '/', and the GET method was used to send data to the server'
  response.send(`
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>First Express application</title>
       </head>
       <body>
          <main>
             <h1>First Express application</h1>
             <form method="GET" action="/submit">
                <label for="name">Give your name</label>
                <input name="name">
                <br>
                <input type="submit">
                <input type="reset">
             </form>
             <img src="images/black-circle-white-bg.png" alt="black circle with white background" width="200">
          </main>
       </body>
    </html>    
           `); // Send the response to the browser
});

/* ------------------- */
/* Route 'GET /submit' */
/* ------------------- */
app.get("/submit", (request, response) => {
  // Processing the form content, if the relative URL is '/submit', and the GET method was used to send data to the server'
  /* ************************************************** */
  // Setting an answer header — we inform the browser that the returned data is plain text
  response.set("Content-Type", "text/plain");
  /* ************************************************** */
  // Place given data (here: 'Hello <name>') in the body of the answer
  response.send(`Hello ${request.query.name}`); // Send a response to the browser
});

/* ************************************************ */
// The application is to listen on port number 8000
app.listen(8000, () => {
  console.log("The server was started on port 8000");
  console.log('To stop the server, press "CTRL + C"');
});
