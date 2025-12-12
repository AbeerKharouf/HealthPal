const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ---------------------------
// ADD ARTICLE
// ---------------------------
router.post("/add", async (req, res) => {
  try {
    const { doctor_id, title, content } = req.body;

    if (!doctor_id || !title || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO research_articles (doctor_id, title, content)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.query(sql, [doctor_id, title, content]);

    res.json({
      message: "Article added successfully",
      article_id: result.insertId,
    });
  } catch (err) {
    console.error("Add article error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------------------------
// GET ALL ARTICLES
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT * FROM research_articles
    `;

    const [rows] = await db.query(sql);

    console.log("Fetched articles:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Fetch articles error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// ---------------------------
// GET SINGLE ARTICLE
// ---------------------------
router.get("/:id", async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.id AS article_id,
        a.title,
        a.content,
        a.created_at,
        u.first_name,
        u.last_name
      FROM research_articles a
      LEFT JOIN users u ON a.doctor_id = u.user_id
      WHERE a.id = ?
    `;

    const [rows] = await db.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch article error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// ---------------------------
// DELETE ARTICLE
// ---------------------------
router.delete("/:id", async (req, res) => {
  try {
    const sql = `DELETE FROM research_articles WHERE id = ?`;

    await db.query(sql, [req.params.id]);

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Delete article error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
