const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// ----------------------
// Upload a gallery image
// ----------------------
router.post('/upload', authenticateToken, async (req, res) => {
  const { salon_id, image_url } = req.body;
  if (!salon_id || !image_url) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const sql = `INSERT INTO gallery (salon_id, image_url) VALUES (?, ?)`;
    const [result] = await db.promise().query(sql, [salon_id, image_url]);
    res.status(201).json({ success: true, message: "Image uploaded successfully.", gallery_id: result.insertId });
  } catch (err) {
    console.error("Gallery upload error:", err);
    res.status(500).json({ success: false, message: "Failed to upload image." });
  }
});

// ----------------------
// Get all gallery images for a salon
// ----------------------
router.get('/salon/:salon_id', async (req, res) => {
  const salon_id = req.params.salon_id;
  try {
    const sql = `SELECT * FROM gallery WHERE salon_id = ? ORDER BY created_at DESC`;
    const [results] = await db.promise().query(sql, [salon_id]);
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error("Fetch gallery error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch gallery images." });
  }
});

// ----------------------
// Delete a gallery image
// ----------------------
router.delete('/:id', authenticateToken, async (req, res) => {
  const image_id = req.params.id;
  try {
    const sql = `DELETE FROM gallery WHERE image_id = ?`;
    const [result] = await db.promise().query(sql, [image_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    res.json({ success: true, message: "Image deleted successfully." });
  } catch (err) {
    console.error("Delete gallery image error:", err);
    res.status(500).json({ success: false, message: "Failed to delete image." });
  }
});

module.exports = router;
