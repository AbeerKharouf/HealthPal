const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ==========================
    1) إنشاء مجموعة دعم
========================== */
router.post("/create-group", (req, res) => {
  const { group_name, category } = req.body;

  db.query(
    "INSERT INTO support_groups (group_name, category) VALUES (?, ?)",
    [group_name, category],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Support group created", group_id: result.insertId });
    }
  );
});

/* ==========================
    2) انضمام مريض للمجموعة
========================== */
router.post("/join-group", (req, res) => {
  const { group_id, patient_id } = req.body;

  db.query(
    "INSERT INTO group_members (group_id, patient_id) VALUES (?, ?)",
    [group_id, patient_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Patient joined group" });
    }
  );
});

/* ==========================
    3) إرسال رسالة في الجروب
========================== */
router.post("/send-message", (req, res) => {
  const { group_id, patient_id, message } = req.body;

  db.query(
    "INSERT INTO support_group_messages (group_id, patient_id, message) VALUES (?, ?, ?)",
    [group_id, patient_id, message],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Message sent" });
    }
  );
});

/* ==========================
    4) عرض رسائل الجروب
========================== */
router.get("/messages/:group_id", (req, res) => {
  db.query(
    "SELECT * FROM support_group_messages WHERE group_id = ? ORDER BY sent_at ASC",
    [req.params.group_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

/* ==========================
    5) عرض جميع مجموعات الدعم
========================== */
router.get("/all-groups", (req, res) => {
  db.query("SELECT * FROM support_groups", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// ==========================
// 6) Delete message
// ==========================
router.delete("/delete-message/:message_id", (req, res) => {
  db.query(
    "DELETE FROM support_group_messages WHERE message_id = ?",
    [req.params.message_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "Message not found" });
      }

      res.json({ msg: "Message deleted" });
    }
  );
});

// ==========================
// 7) Delete a support group
// ==========================
router.delete("/delete-group/:group_id", (req, res) => {
  const groupId = req.params.group_id;

  // Step 1: احذف رسائل الجروب
  db.query("DELETE FROM support_group_messages WHERE group_id = ?", [groupId], (err) => {
    if (err) return res.status(500).json(err);

    // Step 2: احذف أعضاء الجروب
    db.query("DELETE FROM group_members WHERE group_id = ?", [groupId], (err) => {
      if (err) return res.status(500).json(err);

      // Step 3: احذف الجروب نفسه
      db.query("DELETE FROM support_groups WHERE group_id = ?", [groupId], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
          return res.status(404).json({ msg: "Group not found" });
        }

        res.json({ msg: "Support group deleted successfully" });
      });
    });
  });
});

module.exports = router;