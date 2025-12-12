const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET /drug/info?name=ibuprofen
router.get("/info", async (req, res) => {
  const drugName = req.query.name;

  if (!drugName) {
    return res.status(400).json({ msg: "Please provide drug name" });
  }

  try {
    const url = `https://api.fda.gov/drug/label.json?search=active_ingredient:${drugName}`;
    const response = await axios.get(url);

    const drug = response.data.results[0];

    res.json({
      drug_name: drugName,
      usage: drug.indications_and_usage || "Not available",
      warnings: drug.warnings || "Not available",
      side_effects: drug.adverse_reactions || "Not available"
    });

  } catch (error) {
    res.status(500).json({
      msg: "Drug not found or external API error"
    });
  }
});

module.exports = router;
