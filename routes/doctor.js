const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================================
//  GET /doctors
//  جلب جميع الدكاترة مع معلومات الحساب
// =====================================
router.get("/", (req, res) => {
  const query = `
    SELECT 
      doctor.doctor_id,
      doctor.specialty,
      doctor.phone,
      doctor.email,
      doctor.first_name,
      doctor.last_name,
      doctor.email 
    FROM doctor
    JOIN users ON doctor.user_id = users.id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
