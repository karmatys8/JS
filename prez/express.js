const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Route with URL parameters
app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  res.send(`User ID: ${id}`);
});

// Route with query parameters
app.get("/search", (req, res) => {
  const { q } = req.query;

  if (q === undefined) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  res.send(`Search query: ${q}`);
});

// Route handling POST requests
app.post("/data", (req, res) => {
  const data = req.body;

  res.json({ receivedData: data });
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send("404: Page Not Found");
});

// Start the server
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
