const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/add", (req, res) => {
  const { org_id, title, description } = req.body;

  const sql = `
    INSERT INTO ads (org_id, title, description, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [org_id, title, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Ad created", ad_id: result.insertId });
  });
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM ads", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get("/org/:id", (req, res) => {
  db.query(
    "SELECT * FROM ads WHERE org_id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

router.delete("/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM ads WHERE ad_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Ad deleted" });
    }
  );
});

module.exports = router;
