const db = require('../db');

// -------------------------
// Add a gallery image
// -------------------------
exports.addGalleryImage = async (req, res) => {
  const { salon_id, image_url } = req.body;
  if (!salon_id || !image_url)
    return res.status(400).json({ success: false, message: "All fields are required" });

  try {
    const [salon] = await db.promise().query(
      "SELECT * FROM salon WHERE salon_id = ? AND user_id = ? AND is_deleted = 0",
      [salon_id, req.user.id]
    );
    if (!salon.length)
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this salon" });

    const [result] = await db.promise().query(
      "INSERT INTO gallery (salon_id, image_url, created_at) VALUES (?, ?, NOW())",
      [salon_id, image_url]
    );
    res.status(201).json({ success: true, message: "Image added", gallery_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error while adding image" });
  }
};

// -------------------------
// Get gallery images by salon
// -------------------------
exports.getGalleryBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [images] = await db.promise().query(
      "SELECT * FROM gallery WHERE salon_id = ? ORDER BY created_at DESC",
      [salon_id]
    );
    res.status(200).json({ success: true, gallery: images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error while fetching gallery" });
  }
};

// -------------------------
// Delete a gallery image
// -------------------------
exports.deleteGalleryImage = async (req, res) => {
  const gallery_id = Number(req.params.gallery_id);
  if (!gallery_id) return res.status(400).json({ success: false, message: "Invalid gallery ID" });

  try {
    const [image] = await db.promise().query(
      `SELECT g.gallery_id FROM gallery g
       JOIN salon s ON g.salon_id = s.salon_id
       WHERE g.gallery_id = ? AND s.user_id = ?`,
      [gallery_id, req.user.id]
    );
    if (!image.length)
      return res.status(403).json({ success: false, message: "Unauthorized or image not found" });

    await db.promise().query("DELETE FROM gallery WHERE gallery_id = ?", [gallery_id]);
    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error while deleting image" });
  }
};
