// backend/controllers/reviewController.js
const db = require("../db");

// -------------------------
// Add a review
// -------------------------
exports.addReview = async (req, res) => {
  const { salon_id, rating, review_text } = req.body;
  const customer_id = req.user.user_id; // corrected

  if (!salon_id || !rating || !review_text) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if salon exists
    const [[salon]] = await db.promise().query(
      "SELECT salon_id FROM salon WHERE salon_id = ? AND is_deleted = 0",
      [salon_id]
    );
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    const [result] = await db.promise().query(
      `INSERT INTO review (customer_id, salon_id, rating, review_text, is_deleted, is_edited, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`,
      [customer_id, salon_id, rating, review_text.trim()]
    );

    const [[review]] = await db.promise().query(
      "SELECT * FROM review WHERE review_id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get reviews for a salon
// -------------------------
exports.getSalonReviews = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [reviews] = await db.promise().query(
      `SELECT r.review_id, r.rating, r.review_text, r.created_at, r.is_edited, u.username AS customer_name
       FROM review r
       JOIN user u ON r.customer_id = u.user_id
       WHERE r.salon_id = ? AND r.is_deleted = 0
       ORDER BY r.created_at DESC`,
      [salon_id]
    );

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error("Get Salon Reviews Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get reviews by current customer
// -------------------------
exports.getMyReviews = async (req, res) => {
  const customer_id = req.user.user_id; // corrected

  try {
    const [reviews] = await db.promise().query(
      `SELECT r.review_id, r.rating, r.review_text, r.created_at, r.is_edited, s.salon_name
       FROM review r
       JOIN salon s ON r.salon_id = s.salon_id
       WHERE r.customer_id = ? AND r.is_deleted = 0
       ORDER BY r.created_at DESC`,
      [customer_id]
    );

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error("Get My Reviews Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Update a review
// -------------------------
exports.updateReview = async (req, res) => {
  const review_id = Number(req.params.id);
  const { rating, review_text } = req.body;
  const customer_id = req.user.user_id; // corrected

  if (!review_id) return res.status(400).json({ success: false, message: "Invalid review ID" });
  if (rating && (rating < 1 || rating > 5)) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

  try {
    const [result] = await db.promise().query(
      `UPDATE review
       SET rating = COALESCE(?, rating),
           review_text = COALESCE(?, review_text),
           is_edited = 1,
           updated_at = NOW()
       WHERE review_id = ? AND customer_id = ? AND is_deleted = 0`,
      [rating || null, review_text?.trim() || null, review_id, customer_id]
    );

    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Review not found or unauthorized" });

    res.status(200).json({ success: true, message: "Review updated successfully" });
  } catch (err) {
    console.error("Update Review Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Delete a review (soft delete)
// -------------------------
exports.deleteReview = async (req, res) => {
  const review_id = Number(req.params.id);
  const customer_id = req.user.user_id; 

  if (!review_id) return res.status(400).json({ success: false, message: "Invalid review ID" });

  try {
    const [result] = await db.promise().query(
      `UPDATE review
       SET is_deleted = 1, updated_at = NOW()
       WHERE review_id = ? AND customer_id = ? AND is_deleted = 0`,
      [review_id, customer_id]
    );

    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Review not found or unauthorized" });

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// -------------------------
// Get reviews for all salons of the logged-in owner
// -------------------------
exports.getOwnerReviews = async (req, res) => {
  const ownerId = req.user.user_id; // owner from auth middleware

  try {
    const [reviews] = await db.promise().query(
      `SELECT 
          r.review_id,
          r.rating,
          r.review_text AS comment,
          r.created_at,
          r.is_edited,
          u.username AS customer_name,
          s.salon_name,
          sv.service_name
       FROM review r
       JOIN salon s ON r.salon_id = s.salon_id
       JOIN user u ON r.customer_id = u.user_id
       LEFT JOIN service sv ON r.service_id = sv.service_id
       WHERE s.user_id = ? AND r.is_deleted = 0
       ORDER BY r.created_at DESC`,
      [ownerId]
    );

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error("GetOwnerReviews Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
