const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===============================
//  إضافة حالة طبية جديدة للتبرع
//  POST /medical-cases
// ===============================
router.post("/", (req, res) => {
  const { patient_id, case_title, case_description, total_cost } = req.body;

  // 1) التحقق من البيانات الأساسية
  if (!patient_id || !case_title || !total_cost) {
    return res.status(400).json({
      msg: "patient_id, case_title, total_cost are required",
    });
  }

  // 2) التحقق من أن المريض موجود (اختياري بس أفضل)
  const checkPatientSql = `
    SELECT * FROM patient WHERE patient_id = ?
  `;

  db.query(checkPatientSql, [patient_id], (err, patientResult) => {
    if (err) return res.status(500).json(err);

    if (patientResult.length === 0) {
      return res.status(404).json({ msg: "Patient does not exist" });
    }

    // 3) إدخال الحالة الطبية في جدول medical_cases
    const insertSql = `
      INSERT INTO medical_cases 
        (patient_id, case_title, case_description, total_cost, amount_collected, status, created_at)
      VALUES (?, ?, ?, ?, 0, 'OPEN', NOW())
    `;

    db.query(
      insertSql,
      [patient_id, case_title, case_description || null, total_cost],
      (err, result) => {
        if (err) return res.status(500).json(err);

        return res.status(201).json({
          msg: "Medical case created successfully",
          case_id: result.insertId,
        });
      }
    );
  });
});
// ===============================
// Get all medical cases (OPEN or ALL)
// GET /medical-cases
// ===============================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      case_id,
      patient_id,
      case_title,
      case_description,
      total_cost,
      amount_collected,
      (total_cost - amount_collected) AS amount_remaining,
      status,
      created_at
    FROM medical_cases
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ===============================
// Get only OPEN cases
// GET /medical-cases/open
// ===============================
router.get("/open", (req, res) => {
  const sql = `
    SELECT 
      case_id,
      patient_id,
      case_title,
      case_description,
      total_cost,
      amount_collected,
      (total_cost - amount_collected) AS amount_remaining,
      status,
      created_at
    FROM medical_cases
    WHERE status = 'OPEN'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
//verify medical case 
router.patch("/verify/:case_id", (req, res) => {
  const { case_id } = req.params;
  const { doctor_id } = req.body;

  const sql = `
    UPDATE medical_cases
    SET is_verified = 1, verified_by = ?
    WHERE case_id = ?
  `;

  db.query(sql, [doctor_id, case_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Case not found" });
    }

    res.json({ msg: "Case verified successfully" });
  });
});


module.exports = router;
