const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================================
// GET /doctor
// جلب جميع الدكاترة مع معلوماتهم
// =====================================
router.get("/", (req, res) => {
  const query = `
    SELECT 
      doctor.doctor_id,
      doctor.first_name,
      doctor.last_name,
      doctor.specialty,
      doctor.phone,
      doctor.email
    FROM doctor
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
