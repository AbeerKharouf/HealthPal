const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "YOUR_SECRET_KEY"; // خليها سرية

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, extraData } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const [existing] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, role]
    );
    const userId = userResult.insertId;

    // إدخال بيانات خاصة حسب الدور
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
    }

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /signup:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
/* ===================================
                REGISTER
   =================================== */
router.post("/register", (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  // Validate required fields
if (!first_name || !last_name || !email || !password || !role) {
  return res.status(400).json({ msg: "All fields are required" });
}

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [first_name, last_name, email, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.log("MYSQL ERROR:", err);
          return res.status(500).json(err);
        }
        res.json({ msg: "User registered successfully" });
      }
    );
  });
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "User not found" });

    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    // توليد JWT
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, first_name: user.first_name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: `Welcome ${user.role} ${user.first_name}`, token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
});
module.exports = router;