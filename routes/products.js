const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ---------------------------
// ADD NEW PRODUCT
// ---------------------------
router.post("/add", async (req, res) => {
  try {
    const { name, type, quantity, price } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO products (name, type, quantity, price)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name,
      type,
      quantity || 0,
      price || 0,
    ]);
    res.json({
      message: "Product added successfully",
      product_id: result.insertId,
    });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// ---------------------------
// PURCHASE PRODUCT
// ---------------------------
router.post("/purchase", async (req, res) => {
  try {
    const { product_id, user_id, quantity } = req.body;
    if (!product_id || !user_id || !quantity)
      return res.status(400).json({ message: "Missing required fields" });

    // جلب المنتج
    const [rows] = await db.query(
      "SELECT price, quantity AS current_qty FROM products WHERE product_id = ?",
      [product_id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const product = rows[0];
    if (product.current_qty < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    const total_price = product.price * quantity;

    // تحديث الكمية
    await db.query(
      "UPDATE products SET quantity = quantity - ? WHERE product_id = ?",
      [quantity, product_id]
    );

    // إضافة سجل العملية مع user_id
    await db.query(
      "INSERT INTO transactions (product_id, user_id, quantity, total_price, type) VALUES (?, ?, ?, ?, 'purchase')",
      [product_id, user_id, quantity, total_price]
    );

    res.json({ message: "Purchase successful", total_price });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// ---------------------------
// GET ALL PRODUCTS
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// ---------------------------
// GET SINGLE PRODUCT
// ---------------------------
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE product_id = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch product error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
