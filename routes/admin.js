const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate, isAdmin } = require("../middleware/auth");

router.get("/purchases", authenticate, isAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT t.transaction_id, t.product_id, t.quantity, t.total_price, t.created_at,
             p.name AS product_name,
             u.user_id, u.first_name, u.last_name, u.email
      FROM transactions t
      JOIN products p ON t.product_id = p.product_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.type = 'purchase'
      ORDER BY t.created_at DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Fetch purchases error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

module.exports = router;
