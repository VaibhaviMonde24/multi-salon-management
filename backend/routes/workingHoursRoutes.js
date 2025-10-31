// backend/routes/workingHoursRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Helper: Verify branch ownership
const verifyBranchOwnership = (branch_id, user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT b.branch_id FROM branch b
      JOIN salon s ON b.salon_id = s.salon_id
      WHERE b.branch_id = ? AND s.user_id = ?
    `;
    db.query(sql, [branch_id, user_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

// ----------------------
// Add working hours
// ----------------------
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { branch_id, day_of_week, open_time, close_time } = req.body;
    if (!branch_id || !day_of_week || !open_time || !close_time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const isOwner = await verifyBranchOwnership(branch_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: "Unauthorized or branch not found." });

    const sql = `
      INSERT INTO workinghours (branch_id, day_of_week, open_time, close_time)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [branch_id, day_of_week, open_time, close_time], (err, result) => {
      if (err) return res.status(500).json({ message: "Error adding working hours.", error: err });
      res.status(201).json({ message: "Working hours added successfully.", id: result.insertId });
    });
  } catch (err) {
    console.error("Add working hours error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----------------------
// Get working hours for a branch
// ----------------------
router.get('/:branch_id', authenticateToken, async (req, res) => {
  try {
    const branch_id = req.params.branch_id;

    // Optional: enforce ownership
    const isOwner = await verifyBranchOwnership(branch_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: "Unauthorized or branch not found." });

    const sql = `
      SELECT * FROM workinghours 
      WHERE branch_id = ? 
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `;
    db.query(sql, [branch_id], (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching working hours.", error: err });
      res.json({ message: "Working hours fetched successfully.", working_hours: results });
    });
  } catch (err) {
    console.error("Fetch working hours error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----------------------
// Update working hours
// ----------------------
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { open_time, close_time } = req.body;

    // Optional: verify branch ownership via workinghours table
    const checkSql = `
      SELECT wh.* FROM workinghours wh
      JOIN branch b ON wh.branch_id = b.branch_id
      JOIN salon s ON b.salon_id = s.salon_id
      WHERE wh.id = ? AND s.user_id = ?
    `;
    db.query(checkSql, [id, req.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(403).json({ message: "Unauthorized or working hours not found." });

      const updateSql = 'UPDATE workinghours SET open_time = ?, close_time = ? WHERE id = ?';
      db.query(updateSql, [open_time, close_time, id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating working hours.", error: err });
        res.json({ message: "Working hours updated successfully." });
      });
    });
  } catch (err) {
    console.error("Update working hours error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----------------------
// Delete working hours
// ----------------------
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Verify ownership
    const checkSql = `
      SELECT wh.* FROM workinghours wh
      JOIN branch b ON wh.branch_id = b.branch_id
      JOIN salon s ON b.salon_id = s.salon_id
      WHERE wh.id = ? AND s.user_id = ?
    `;
    db.query(checkSql, [id, req.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(403).json({ message: "Unauthorized or working hours not found." });

      db.query('DELETE FROM workinghours WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: "Error deleting working hours.", error: err });
        res.json({ message: "Working hours deleted successfully." });
      });
    });
  } catch (err) {
    console.error("Delete working hours error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
