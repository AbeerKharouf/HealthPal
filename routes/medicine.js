const express = require("express");
const router = express.Router();
const db = require("../config/db");

// إنشاء طلب دواء
router.post("/medicine/request", async (req, res) => {
  try {
    const { requester_id, medicine_name, quantity, location } = req.body;

    if (!requester_id || !medicine_name || !quantity || !location) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const [result] = await db.query(
      "INSERT INTO medicine_requests (requester_id, medicine_name, quantity, location, status) VALUES (?, ?, ?, ?, 'pending')",
      [requester_id, medicine_name, quantity, location]
    );

    res.json({
      msg: "Medicine request created successfully",
      request_id: result.insertId,
    });
  } catch (err) {
    console.error("DB INSERT ERROR:", err);
    res.status(500).json({ msg: "DB Insert Error", error: err });
  }
});

// جلب الطلبات الحالية
router.get("/medicine/requests", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM medicine_requests ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get requests of a specific user
// جلب طلبات مستخدم محدد
// جلب طلبات مستخدم محدد
router.get("/medicine/requests/:user_id", async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id);
    if (!user_id) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const [rows] = await db.query(
      "SELECT request_id, medicine_name, quantity, location, status, created_at FROM medicine_requests WHERE requester_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// تحديث حالة الطلب
router.put("/medicine/request/:request_id/status", async (req, res) => {
  try {
    const request_id = parseInt(req.params.request_id);
    const { status } = req.body;

    if (!request_id || !status) {
      return res
        .status(400)
        .json({ msg: "Request ID and status are required" });
    }

    const allowedStatuses = ["pending", "matched", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const [result] = await db.query(
      "UPDATE medicine_requests SET status = ? WHERE request_id = ?",
      [status, request_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Request not found" });
    }

    res.json({
      msg: "Status updated successfully",
      request_id,
      new_status: status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err });
  }
});

module.exports = router;
