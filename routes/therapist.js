const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all therapists
router.get("/all", (req, res) => {
  db.query(
    "SELECT therapist_id, email, specialty FROM therapist",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

module.exports = router;
