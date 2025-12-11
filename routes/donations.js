const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /donate — المتبرع يتبرع لحالة
router.post("/", (req, res) => {
  const { donor_id, case_id, amount, notes } = req.body;

  if (!donor_id || !case_id || !amount) {
    return res.status(400).json({ msg: "donor_id, case_id and amount are required" });
  }

  // 1️⃣ تحقق أن المتبرع موجود
  const checkDonor = `SELECT * FROM donor WHERE donor_id = ?`;
  db.query(checkDonor, [donor_id], (err, donorResult) => {
    if (err) return res.status(500).json(err);

    if (donorResult.length === 0) {
      return res.status(404).json({ msg: "Donor does not exist" });
    }

    // 2️⃣ تحقق أن الحالة موجودة
    const checkCase = `SELECT * FROM medical_cases WHERE case_id = ?`;
    db.query(checkCase, [case_id], (err, caseResult) => {
      if (err) return res.status(500).json(err);

      if (caseResult.length === 0) {
        return res.status(404).json({ msg: "Medical case not found" });
      }

      const medicalCase = caseResult[0];
      const remaining = medicalCase.total_cost - medicalCase.amount_collected;

      if (amount > remaining) {
        return res.status(400).json({
          msg: `Donation exceeds remaining cost. Remaining: ${remaining}`
        });
      }

      // 3️⃣ إدخال التبرع في case_donations
      const insertDonation = `
        INSERT INTO case_donations (case_id, donor_id, amount)
        VALUES (?, ?, ?)
      `;

      db.query(insertDonation, [case_id, donor_id, amount], (err) => {
        if (err) return res.status(500).json(err);

        // 4️⃣ تحديث مقدار المبلغ المجموع للحالة
        const updateCase = `
          UPDATE medical_cases
          SET amount_collected = amount_collected + ?
          WHERE case_id = ?
        `;

        db.query(updateCase, [amount, case_id], (err) => {
          if (err) return res.status(500).json(err);

          // 5️⃣ لو اكتمل المبلغ → غير الحالة لـ COMPLETED
          const newCollected = medicalCase.amount_collected + amount;

          if (newCollected >= medicalCase.total_cost) {
            const completeCase = `
              UPDATE medical_cases
              SET status = 'COMPLETED'
              WHERE case_id = ?
            `;
            db.query(completeCase, [case_id]);
          }

          res.json({ msg: "Donation successful" });
        });
      });
    });
  });
});

module.exports = router;
