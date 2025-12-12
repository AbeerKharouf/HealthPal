const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/create", (req, res) => {
  const { org_id, volunteer_id, title, description, location, mission_date, start_time, end_time, capacity } = req.body;

  const sql = `
    INSERT INTO missions (org_id, volunteer_id, title, description, location, mission_date, start_time, end_time, capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [org_id, volunteer_id, title, description, location, mission_date, start_time, end_time, capacity],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Mission created", mission_id: result.insertId });
    }
  );
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM missions", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get("/org/:id", (req, res) => {
  db.query("SELECT * FROM missions WHERE org_id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.post("/request", (req, res) => {
  const { mission_id, patient_id } = req.body;

  db.query(
    "INSERT INTO mission_requests (mission_id, patient_id) VALUES (?, ?)",
    [mission_id, patient_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Request submitted", request_id: result.insertId });
    }
  );
});

router.put("/request/:id", (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE mission_requests SET status = ? WHERE request_id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Request updated" });
    }
  );
});

router.get("/requests/:mission_id", (req, res) => {
  db.query(
    "SELECT * FROM mission_requests WHERE mission_id = ?",
    [req.params.mission_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

module.exports = router;
