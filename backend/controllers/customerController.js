// backend/controllers/customerController.js
const db = require('../db');
const serviceController = require('./serviceController');

// -------------------------
// Get all salons
// -------------------------
exports.getAllSalons = async (req, res) => {
  try {
    const [salons] = await db.promise().query(
      `SELECT s.*, u.username AS owner_name
       FROM salon s
       JOIN user u ON s.user_id = u.user_id AND u.is_deleted = 0
       WHERE s.is_deleted = 0
       ORDER BY s.created_at DESC`
    );
    res.status(200).json({
      success: true,
      message: "Salons fetched successfully",
      data: salons
    });
  } catch (err) {
    console.error("Error fetching salons:", err);
    res.status(500).json({ success: false, message: "Error fetching salons" });
  }
};

// -------------------------
// Get all branches of a salon
// -------------------------
exports.getBranchesBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) {
    return res.status(400).json({ success: false, message: "Invalid salon ID" });
  }

  try {
    const [branches] = await db.promise().query(
      `SELECT * FROM branch WHERE salon_id = ? AND is_deleted = 0 ORDER BY created_at DESC`,
      [salon_id]
    );
    res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      data: branches
    });
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ success: false, message: "Error fetching branches" });
  }
};

// -------------------------
// Get all services of a salon (uses serviceController)
// -------------------------
exports.getServicesBySalon = (req, res) => {
  return serviceController.getServicesBySalon(req, res);
};

// -------------------------
// Get customer’s appointment history
// -------------------------
exports.getMyAppointments = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [appointments] = await db.promise().query(
      `SELECT a.appointment_id, a.appointment_datetime, a.status, a.notes, a.created_at, a.updated_at,
              s.service_name, b.branch_name, sa.salon_name
       FROM appointment a
       LEFT JOIN service s ON a.service_id = s.service_id AND s.is_deleted = 0
       LEFT JOIN branch b ON a.branch_id = b.branch_id AND b.is_deleted = 0
       LEFT JOIN salon sa ON a.salon_id = sa.salon_id AND sa.is_deleted = 0
       WHERE a.customer_id = ? AND a.is_deleted = 0
       ORDER BY a.appointment_datetime DESC`,
      [user_id]
    );
    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ success: false, message: "Error fetching appointments" });
  }
};

// -------------------------
// Get customer messages
// -------------------------
exports.getMyMessages = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [messages] = await db.promise().query(
      `SELECT m.message_id, m.message_content AS content, m.message_status, m.created_at, u.username AS sender_name
       FROM message m
       LEFT JOIN user u ON m.sender_id = u.user_id AND u.is_deleted = 0
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [user_id]
    );
    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};

// -------------------------
// Get customer notifications
// -------------------------
exports.getMyNotifications = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [notifications] = await db.promise().query(
      `SELECT notification_id, message, notification_status, created_at
       FROM notification
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// -------------------------
// Submit a new review
// -------------------------
exports.submitReview = async (req, res) => {
  const user_id = req.user.user_id;
  const { salon_id, rating, review_text } = req.body;

  if (!salon_id || !rating || !review_text) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
  }

  try {
    // (Optional) Check if user had at least 1 appointment in this salon
    const [appointments] = await db.promise().query(
      `SELECT appointment_id FROM appointment 
       WHERE customer_id = ? AND salon_id = ? AND status = 'Completed' AND is_deleted = 0
       LIMIT 1`,
      [user_id, salon_id]
    );

    if (appointments.length === 0) {
      return res.status(403).json({ success: false, message: "You must complete an appointment before reviewing this salon" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO review (customer_id, salon_id, rating, review_text, is_deleted, is_edited, created_at)
       VALUES (?, ?, ?, ?, 0, 0, NOW())`,
      [user_id, salon_id, rating, review_text]
    );
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: { review_id: result.insertId }
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ success: false, message: "Error submitting review" });
  }
};
// Get counts for dashboard widgets
exports.getDashboardCounts = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    // Count upcoming appointments (status 'Booked' and datetime >= now)
    const [[{ appointment_count }]] = await db.promise().query(
      `SELECT COUNT(*) AS appointment_count 
       FROM appointment 
       WHERE customer_id = ? AND status = 'Booked' AND appointment_datetime >= NOW() AND is_deleted = 0`,
      [user_id]
    );
    // Count unread notifications
    const [[{ notification_count }]] = await db.promise().query(
      `SELECT COUNT(*) AS notification_count 
       FROM notification 
       WHERE user_id = ? AND notification_status = 'unread'`,
      [user_id]
    );
    // Count unread messages
    const [[{ message_count }]] = await db.promise().query(
      `SELECT COUNT(*) AS message_count
       FROM message
       WHERE receiver_id = ? AND message_status = 'unread'`,
      [user_id]
    );
    res.status(200).json({
      success: true,
      data: {
        appointments: appointment_count,
        notifications: notification_count,
        messages: message_count
      }
    });
  } catch (err) {
    console.error("Error fetching dashboard counts:", err);
    res.status(500).json({ success: false, message: "Error fetching dashboard counts" });
  }
};
// -------------------------
// Get unpaid appointments for a customer
// -------------------------
exports.getUnpaidAppointments = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [appointments] = await db.promise().query(
      `SELECT 
          a.appointment_id, 
          sa.salon_name, 
          sv.service_name, 
          a.appointment_datetime,
          sv.service_price AS amount
       FROM appointment a
       LEFT JOIN salon sa ON a.salon_id = sa.salon_id AND sa.is_deleted = 0
       LEFT JOIN service sv ON a.service_id = sv.service_id AND sv.is_deleted = 0
       LEFT JOIN payment p ON a.appointment_id = p.appointment_id AND p.payment_status='Completed'
       WHERE a.customer_id = ? AND a.is_deleted = 0
         AND (p.payment_id IS NULL OR p.payment_status='Pending')
       ORDER BY a.appointment_datetime ASC`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (err) {
    console.error("Error fetching unpaid appointments:", err);
    res.status(500).json({ success: false, message: "Error fetching unpaid appointments" });
  }
};
