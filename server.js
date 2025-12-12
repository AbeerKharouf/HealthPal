const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Test root
app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
});

// Example: Get all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// ROUTES
app.use("/api", require("./routes/user")); // Signup + Login
app.use("/api/articles", require("./routes/articles")); //  مقالات الأطباء
app.use("/api/products", require("./routes/products"));


// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
