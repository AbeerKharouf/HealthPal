const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("🔥 appointments.js WAS LOADED");

// ============================
// إنشاء موعد جديد (Patient يحجز)
// POST /appointments
// ============================
router.post("/", (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, notes } = req.body;

  if (!patient_id || !doctor_id || !appointment_datetime) {
    return res.status(400).json({
      msg: "patient_id, doctor_id, appointment_datetime are required"
    });
  }

  // التحقق من تعارض الموعد
  const checkQuery = `
      SELECT * FROM appointments
      WHERE doctor_id = ?
      AND appointment_datetime = ?
      AND status != 'CANCELLED'
  `;

  db.query(checkQuery, [doctor_id, appointment_datetime], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      return res.status(400).json({
        msg: "Doctor is already booked at this time"
      });
    }

    // إدخال الموعد
    const insertQuery = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, notes)
      VALUES (?, ?, ?, 'PENDING', ?)
    `;

    db.query(
      insertQuery,
      [patient_id, doctor_id, appointment_datetime, notes || null],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          msg: "Appointment created successfully (PENDING)",
          appointment_id: result.insertId,
        });
      }
    );
  });
});

module.exports = router;
