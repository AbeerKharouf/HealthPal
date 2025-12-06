const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Generate random session code
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ==========================
    1) Create Anonymous Session
========================== */
router.post("/create-session", (req, res) => {
  const { therapist_id } = req.body;

  const sessionCode = generateSessionCode();

  db.query(
    "INSERT INTO anonymous_sessions (therapist_id, session_code) VALUES (?, ?)",
    [therapist_id, sessionCode],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ 
        msg: "Session created",
        session_id: result.insertId,
        session_code: sessionCode 
      });
    }
  );
});

/* ==========================
    2) Send Message 
========================== */
router.post("/send-message", (req, res) => {
  const { session_id, sender, message } = req.body;

  db.query(
    "INSERT INTO anonymous_chat_messages (session_id, sender, message) VALUES (?, ?, ?)",
    [session_id, sender, message],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Message sent" });
    }
  );
});

/* ==========================
    3) Get All Messages in Session
========================== */
router.get("/messages/:session_id", (req, res) => {
  db.query(
    "SELECT * FROM anonymous_chat_messages WHERE session_id = ? ORDER BY sent_at ASC",
    [req.params.session_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});
// Delete entire anonymous session
router.delete("/delete-session/:session_id", (req, res) => {
  const sessionId = req.params.session_id;

  // حذف الرسائل أولاً
  db.query(
    "DELETE FROM anonymous_chat_messages WHERE session_id = ?",
    [sessionId],
    (err) => {
      if (err) return res.status(500).json(err);

      // حذف الجلسة نفسها
      db.query(
        "DELETE FROM anonymous_sessions WHERE session_id = ?",
        [sessionId],
        (err, result) => {
          if (err) return res.status(500).json(err);

          if (result.affectedRows === 0)
            return res.status(404).json({ msg: "Session not found" });

          res.json({ msg: "Session deleted successfully" });
        }
      );
    }
  );
});

module.exports = router;
