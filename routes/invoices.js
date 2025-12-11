const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/add", (req, res) => {
  const { case_id, uploaded_by, file_url, amount, description, invoice_type } = req.body;

  // 1️ Validate required fields
  if (!case_id || !uploaded_by || !file_url || !amount || !invoice_type) {
    return res.status(400).json({ 
      msg: "case_id, uploaded_by, file_url, amount and invoice_type are required" 
    });
  }

  // 2️ Check if medical case exists
  const checkCase = `SELECT * FROM medical_cases WHERE case_id = ?`;

  db.query(checkCase, [case_id], (err, caseResult) => {
    if (err) return res.status(500).json(err);

    if (caseResult.length === 0) {
      return res.status(404).json({ msg: "Medical case not found" });
    }

    // 3️⃣ (اختياري) Check if uploader exists in users table
    const checkUser = `SELECT * FROM users WHERE user_id = ?`;

    db.query(checkUser, [uploaded_by], (err, userResult) => {
      if (err) return res.status(500).json(err);

      if (userResult.length === 0) {
        return res.status(404).json({ msg: "Uploader user not found" });
      }

      // 4️ Insert the invoice into database
      const insertInvoice = `
        INSERT INTO invoices (case_id, uploaded_by, file_url, amount, description, invoice_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertInvoice,
        [case_id, uploaded_by, file_url, amount, description || null, invoice_type],
        (err, result) => {
          if (err) return res.status(500).json(err);

          res.json({
            msg: "Invoice added successfully",
            invoice_id: result.insertId
          });
        }
      );
    });
  });
});
router.get("/:case_id", (req, res) => {
  const case_id = req.params.case_id;

  //️⃣ تحقق أن الحالة موجودة
  const checkCase = `SELECT * FROM medical_cases WHERE case_id = ?`;
  db.query(checkCase, [case_id], (err, caseResult) => {
    if (err) return res.status(500).json(err);

    if (caseResult.length === 0) {
      return res.status(404).json({ msg: "Medical case not found" });
    }

    // 2️⃣ جلب الفواتير
    const getInvoices = `
      SELECT 
        invoice_id,
        case_id,
        uploaded_by,
        file_url,
        amount,
        description,
        invoice_type,
        created_at
      FROM invoices
      WHERE case_id = ?
      ORDER BY created_at DESC
    `;

    db.query(getInvoices, [case_id], (err, invoices) => {
      if (err) return res.status(500).json(err);

      res.json({
        case_id,
        total_invoices: invoices.length,
        invoices
      });
    });
  });
});

module.exports = router;
