const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const userRoutes = require("./routes/user");

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});
const appointmentsRouter = require("./routes/appointments");
app.use("/appointments", appointmentsRouter);


app.use("/api", userRoutes);


const doctorRouter = require("./routes/doctor");
app.use("/doctor", doctorRouter);

const medicalCasesRouter = require("./routes/medicalCases");
app.use("/medical-cases", medicalCasesRouter);

const donationsRouter = require("./routes/donations");
app.use("/donate", donationsRouter);

const medicalCasesRoutes = require("./routes/medicalHistory");
app.use("/medical-cases", medicalCasesRoutes);

app.use("/invoices", require("./routes/invoices"));

const feedbackRoutes = require("./routes/feedback");
app.use("/feedback", feedbackRoutes);



app.listen(5000, () => {
  console.log("Server running on port 5000");
});