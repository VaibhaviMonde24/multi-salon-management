const express = require('express');
const router = express.Router();
const db = require('../db');

// ----------------------
// Get all approved salons (public view)
// ----------------------
router.get('/salons', (req, res) => {
  const sql = `
    SELECT salon_id, salon_name, salon_description, salon_logo, city, category
    FROM salon
    WHERE status = 'approved'
    ORDER BY salon_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching public salons:", err);
      return res.status(500).json({ success: false, message: "Error loading salons." });
    }
    res.status(200).json({ success: true, count: results.length, salons: results });
  });
});

// ----------------------
// Search salons with optional filters
// ----------------------
router.get('/salons/search', (req, res) => {
  const { city, category } = req.query;

  let sql = `
    SELECT salon_id, salon_name, salon_description, salon_logo, city, category
    FROM salon
    WHERE status = 'approved'
  `;
  const params = [];

  if (city) {
    sql += " AND city LIKE ?";
    params.push(`%${city}%`);
  }

  if (category) {
    sql += " AND category LIKE ?";
    params.push(`%${category}%`);
  }

  sql += " ORDER BY salon_name ASC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error filtering salons:", err);
      return res.status(500).json({ success: false, message: "Search failed." });
    }
    res.status(200).json({ success: true, count: results.length, salons: results });
  });
});

module.exports = router;
