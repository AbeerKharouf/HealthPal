const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --------------------------------------
// 1) إضافة Feedback جديد
// POST /feedback/add
// --------------------------------------
router.post("/add", (req, res) => {
  const { case_id, patient_id, feedback_text, rating } = req.body;

  if (!case_id || !patient_id || !feedback_text) {
    return res.status(400).json({ msg: "case_id, patient_id, feedback_text required" });
  }

  // التأكد من الحالة
  const checkCase = `SELECT * FROM medical_cases WHERE case_id = ?`;
  db.query(checkCase, [case_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) {
      return res.status(404).json({ msg: "Medical case not found" });
    }

    // إدخال الفيدباك
    const insertFeedback = `
      INSERT INTO patient_feedback (case_id, patient_id, feedback_text, rating)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertFeedback, [case_id, patient_id, feedback_text, rating || null], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({ msg: "Feedback added successfully" });
    });
  });
});

// --------------------------------------
// 2) جلب كل الفيدباكات لكل الحالات
// GET /feedback/all
// --------------------------------------
router.get("/all", (req, res) => {
  const sql = `
    SELECT 
      f.feedback_id,
      f.case_id,
      f.patient_id,
      f.feedback_text,
      f.rating,
      f.created_at,
      mc.case_title,
      mc.case_description
    FROM patient_feedback f
    JOIN medical_cases mc ON f.case_id = mc.case_id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// --------------------------------------
// 3) جلب الفيدباكات لحالة معيّنة
// GET /feedback/case/:case_id
// --------------------------------------
router.get("/case/:case_id", (req, res) => {
  const case_id = req.params.case_id;

  const sql = `
    SELECT 
      f.feedback_id,
      f.case_id,
      f.patient_id,
      f.feedback_text,
      f.rating,
      f.created_at,
      u.first_name,
      u.last_name
    FROM patient_feedback f
    JOIN users u ON f.patient_id = u.user_id
    WHERE f.case_id = ?
    ORDER BY f.created_at DESC
  `;

  db.query(sql, [case_id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ msg: "No feedback found for this case" });
    }

    res.json(results);
  });
});

module.exports = router;
