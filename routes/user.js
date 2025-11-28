<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
/* =======================
        REGISTER
   ======================= */
router.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: "All fields required" });
    }

    // Check if email exists
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert new user
        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err, result) => {
                if (err) return res.json(err);
                res.json({ msg: "User registered successfully" });
            }
        );
    });
});

/* =======================
          LOGIN
   ======================= */
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "All fields required" });
    }

    // Check if user exists
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ msg: "User not found" });
        }

        const user = results[0];

        // Compare password
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ msg: "Wrong password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.json({
            msg: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
<<<<<<< HEAD
=======
=======
/* ===================================
                REGISTER
   =================================== */
router.post("/register", (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
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

/* ===================================
                LOGIN
   =================================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "All fields required" });
  }

  // Find user
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = results[0];

    // Compare passwords
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  });
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
});

module.exports = router;
