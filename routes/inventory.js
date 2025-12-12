const express = require("express");
const router = express.Router();
const db = require("../config/db");

// إضافة عنصر جديد (donor)
router.post("/inventory/add", async (req, res) => {
  try {
    const { name, quantity, expiration_date, location } = req.body;
    const added_by = req.body.added_by || 17; // المستخدم الافتراضي

    const [result] = await db.query(
      "INSERT INTO inventory_items (name, quantity, expiration_date, location, added_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, quantity, expiration_date, location, added_by]
    );

    res.json({ msg: "تم إضافة العنصر بنجاح", item_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// عرض عناصر donor معين
router.get("/inventory/items/forDonor/:donor_id", async (req, res) => {
  try {
    const donor_id = parseInt(req.params.donor_id);
    const [rows] = await db.query(
      "SELECT * FROM inventory_items WHERE added_by = ? ORDER BY created_at DESC",
      [donor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// عرض جميع العناصر للمستخدم
router.get("/inventory/items/all", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT i.*, u.first_name AS donor_first_name, u.last_name AS donor_last_name FROM inventory_items i JOIN users u ON i.added_by = u.user_id ORDER BY i.created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// طلب عنصر من المستخدم
router.post("/inventory/request", async (req, res) => {
  try {
    const { item_id, user_id, quantity } = req.body;
    const uid = user_id || 17;

    const [result] = await db.query(
      "INSERT INTO inventory_requests (item_id, user_id, quantity, status, requested_at) VALUES (?, ?, ?, 'pending', NOW())",
      [item_id, uid, quantity]
    );

    res.json({ msg: "تم إرسال الطلب بنجاح", request_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// عرض الطلبات الخاصة بمستخدم
router.get("/inventory/requests/forUser/:user_id", async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id);
    const [rows] = await db.query(
      `SELECT r.request_id, r.quantity, r.status, r.requested_at, 
              i.name AS item_name, i.location, i.expiration_date
       FROM inventory_requests r
       JOIN inventory_items i ON r.item_id = i.item_id
       WHERE r.user_id = ?
       ORDER BY r.requested_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// عرض الطلبات على عناصر donor
router.get("/inventory/requests/forDonor/:donor_id", async (req, res) => {
  try {
    const donor_id = parseInt(req.params.donor_id);
    const [rows] = await db.query(
      `SELECT r.request_id, r.quantity, r.status, r.requested_at, 
              i.name AS item_name, i.location, i.expiration_date,
              u.first_name AS user_first_name, u.last_name AS user_last_name
       FROM inventory_requests r
       JOIN inventory_items i ON r.item_id = i.item_id
       JOIN users u ON r.user_id = u.user_id
       WHERE i.added_by = ?
       ORDER BY r.requested_at DESC`,
      [donor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// تحديث حالة الطلب
router.put("/inventory/request/:request_id/status", async (req, res) => {
  try {
    const request_id = parseInt(req.params.request_id);
    const { status } = req.body;
    await db.query(
      "UPDATE inventory_requests SET status = ? WHERE request_id = ?",
      [status, request_id]
    );
    res.json({ msg: "تم تحديث حالة الطلب" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

module.exports = router;
