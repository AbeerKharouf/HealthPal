const express = require("express");
const cors = require("cors");
const db = require("./config/db");

// Routes
const userRoutes = require("./routes/user");
const mentalHealth = require("./routes/mentalHealth");

const app = express();

app.use(cors());
app.use(express.json());

// اختبار الاتصال
app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
});

// جلب كل المستخدمين (اختياري)
app.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

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
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
