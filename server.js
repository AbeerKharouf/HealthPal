const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

// Routes
const userRoutes = require("./routes/user");
const mentalHealth = require("./routes/mentalHealth");
const userRoutes = require("./routes/user");

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

// جلب كل المستخدمين (اختياري)

// Example: Get all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});
const appointmentsRouter = require("./routes/appointments");
app.use("/appointments", appointmentsRouter);

// ================= ROUTES =================
console.log("Loaded mentalHealth router");
app.use("/api", userRoutes);
app.use("/mental-health", mentalHealth);


const supportGroups = require("./routes/supportGroups");
console.log("Support Groups Router Loaded");
app.use("/support-groups", supportGroups);

const anonymousChat = require("./routes/anonymousChat");
app.use("/anonymous-chat", anonymousChat);

const therapistRoutes = require("./routes/therapist");
app.use("/therapists", therapistRoutes);

const organizationRoutes = require("./routes/organization");
app.use("/organizations", organizationRoutes);

const missions = require("./routes/missions");
app.use("/missions", missions);

app.use("/ads", require("./routes/ads"));

// ===========================================

// تشغيل السيرفر (مرة واحدة فقط)
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


// ROUTES
app.use("/api", require("./routes/user")); // Signup + Login
app.use("/api/articles", require("./routes/articles")); //  مقالات الأطباء
app.use("/api/products", require("./routes/products"));
app.use("/api/admin", require("./routes/admin"));

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
