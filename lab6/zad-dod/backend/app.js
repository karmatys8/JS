const express = require("express");
const helmet = require("helmet");
const { mongoConnect } = require("./db");
const clientRouter = require("./routes/clientRouter");
const adminRouter = require("./routes/adminRouter");

/* *************************** */
/* Configuring the application */
/* *************************** */
// file deepcode ignore UseCsurfForExpress: <>
const app = express();

app.locals.pretty = app.get("env") === "development"; // The resulting HTML code will be indented in the development environment

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

app.use("/", clientRouter);
app.use("/admin", adminRouter);

/* ************************************************ */

mongoConnect(() => {
  app.listen(8008, () => {
    console.log("The server was started on port 8008");
    console.log('To stop the server, press "CTRL + C"');
  });
});
