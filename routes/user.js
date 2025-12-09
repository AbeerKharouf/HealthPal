const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2/promise
const bcrypt = require("bcryptjs");

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, extraData } =
      req.body;

    // تحقق من الحقول الأساسية
    if (!first_name || !last_name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // تحقق من البريد الإلكتروني
    const [existing] = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // تشفير كلمة السر
    const hashedPassword = await bcrypt.hash(password, 10);

    // إدخال البيانات الأساسية في جدول users
    const [userResult] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, role]
    );
    const userId = userResult.insertId;

    // إدخال البيانات الخاصة حسب الدور
    if (role === "doctor") {
      await db.query(
        "INSERT INTO doctors (user_id, specialty, phone, clinic) VALUES (?, ?, ?, ?)",
        [userId, extraData.specialty, extraData.phone, extraData.clinic || null]
      );
    } else if (role === "therapist") {
      await db.query(
        "INSERT INTO therapists (user_id, specialty, phone) VALUES (?, ?, ?)",
        [userId, extraData.specialty, extraData.phone]
      );
    } else if (role === "patient") {
      await db.query(
        "INSERT INTO patients (user_id, age, gender) VALUES (?, ?, ?)",
        [userId, extraData.age, extraData.gender]
      );
    } else if (role === "donor") {
      await db.query("INSERT INTO donors (user_id, blood_type) VALUES (?, ?)", [
        userId,
        extraData.blood_type,
      ]);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /signup:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
