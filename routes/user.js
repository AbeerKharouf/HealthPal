const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
});

module.exports = router;
