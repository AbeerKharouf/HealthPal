const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/add", (req, res) => {
  const { user_id, org_name, address, phone, website } = req.body;

  const checkUserSql = `
    SELECT * FROM users 
    WHERE user_id = ? AND role = 'organization'
  `;

  db.query(checkUserSql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({
        success: false,
        message: "User not found OR user is not of role 'organization'"
      });
    }

    const insertSql = `
      INSERT INTO organization (user_id, org_name, address, phone, website)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [user_id, org_name, address, phone, website], (err, insertResult) => {
      if (err) return res.status(500).json(err);

      res.json({
        success: true,
        message: "Organization added successfully",
        id: insertResult.insertId
      });
    });
  });
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM organization", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM organization WHERE org_id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json(err);

      if (row.length === 0)
        return res.json({ success: false, message: "Organization not found" });

      res.json(row[0]);
    }
  );
});

router.put("/update/:id", (req, res) => {
  const { org_name, address, phone, website } = req.body;

  const sql = `
    UPDATE organization
    SET org_name = ?, address = ?, phone = ?, website = ?
    WHERE org_id = ?
  `;

  db.query(sql, [org_name, address, phone, website, req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Organization updated successfully"
    });
  });
});

router.delete("/delete/:id", (req, res) => {
  db.query("DELETE FROM organization WHERE org_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Organization deleted successfully"
    });
  });
});

module.exports = router;
