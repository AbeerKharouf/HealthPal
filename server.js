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
app.use("/api", userRoutes);

console.log("🔥 appointments ROUTE MOUNTED");


const appointmentsRouter = require("./routes/appointments");
app.use("/appointments", appointmentsRouter);

const doctorsRouter = require("./routes/doctor");
app.use("/doctors", doctorsRouter);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});