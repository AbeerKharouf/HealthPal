const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ملفات static (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// اختبار الاتصال
app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
});

// مثال: جلب كل المستخدمين
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// Routes
const userRoutes = require("./routes/user");
app.use("/api", userRoutes);

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
