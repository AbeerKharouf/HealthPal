const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const userRoutes = require("./routes/user");


const app = express();

app.use(cors());
app.use(express.json());

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


// مسارات المستخدم

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const userRoutes = require("./routes/user");

app.use("/api", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

