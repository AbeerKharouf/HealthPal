const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========== إضافة محتوى جديد ==========
router.post("/add", (req, res) => {
  const { title, description, resource_type, url } = req.body;

  db.query(
    "INSERT INTO mental_health_resources (title, description, resource_type, url) VALUES (?, ?, ?, ?)",
    [title, description, resource_type, url],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Resource added", id: result.insertId });
    }
  );
});

// ========== عرض كل المحتوى ==========
router.get("/all", (req, res) => {
  db.query("SELECT * FROM mental_health_resources", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ========== حذف محتوى ==========
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM mental_health_resources WHERE resource_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Resource deleted" });
    }
  );
});

module.exports = router;
