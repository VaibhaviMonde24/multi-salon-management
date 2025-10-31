// File: controllers/ownerController.js
const db = require('../db');
// Helper Validators
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidPhone = (phone) => /^\d{7,15}$/.test(phone);
const isPositiveNumber = (n) => !isNaN(n) && n > 0;
// Owner CRUD (Admin Only)
exports.getAllOwners = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT user_id, username, email, phone_number, profile_image, created_at, updated_at
       FROM user WHERE role='SalonOwner' AND is_deleted=0`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("GetAllOwners Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getOwnerById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!isPositiveNumber(id)) return res.status(400).json({ success: false, message: "Invalid owner ID" });
  try {
    const [rows] = await db.promise().query(
      `SELECT user_id, username, email, phone_number, profile_image, created_at, updated_at
       FROM user WHERE user_id=? AND role='SalonOwner' AND is_deleted=0`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Owner not found" });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetOwnerById Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.addOwner = async (req, res) => {
  let { username, email, phone_number, password, profile_image = null } = req.body;
  username = username?.trim();
  email = email?.trim();
  phone_number = phone_number?.trim();
  password = password?.trim();
  if (!username || !email || !phone_number || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format" });
  if (!isValidPhone(phone_number)) return res.status(400).json({ success: false, message: "Invalid phone number" });
  try {
    const [result] = await db.promise().query(
      `INSERT INTO user (username,email,phone_number,password,role,profile_image)
       VALUES (?, ?, ?, ?, 'SalonOwner', ?)`,
      [username,email,phone_number,password,profile_image]
    );
    res.status(201).json({ success: true, message: "Owner added", data: { user_id: result.insertId } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Email or phone already exists" });
    console.error("AddOwner Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.updateOwner = async (req, res) => {
  const id = parseInt(req.params.id);
  let { username, email, phone_number, profile_image = null } = req.body;
  username = username?.trim();
  email = email?.trim();
  phone_number = phone_number?.trim();
  if (!isPositiveNumber(id)) return res.status(400).json({ success: false, message: "Invalid owner ID" });
  if (!username || !email || !phone_number)
    return res.status(400).json({ success: false, message: "All fields are required" });
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format" });
  if (!isValidPhone(phone_number)) return res.status(400).json({ success: false, message: "Invalid phone number" });
  try {
    const [result] = await db.promise().query(
      `UPDATE user SET username=?, email=?, phone_number=?, profile_image=?, updated_at=CURRENT_TIMESTAMP
       WHERE user_id=? AND role='SalonOwner' AND is_deleted=0`,
      [username,email,phone_number,profile_image,id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Owner not found" });
    res.status(200).json({ success: true, message: "Owner updated", data: { user_id: id } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Email or phone already exists" });
    console.error("UpdateOwner Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.deleteOwner = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!isPositiveNumber(id)) return res.status(400).json({ success: false, message: "Invalid owner ID" });
  try {
    const [result] = await db.promise().query(
      `UPDATE user SET is_deleted=1, updated_at=CURRENT_TIMESTAMP
       WHERE user_id=? AND role='SalonOwner' AND is_deleted=0`,
      [id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Owner not found" });
    res.status(200).json({ success: true, message: "Owner deleted", data: { user_id: id } });
  } catch (err) {
    console.error("DeleteOwner Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Owner Dashboard Counts
exports.getDashboardCounts = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    const [[{count: appointments}]] = await db.promise().query(
      `SELECT COUNT(*) AS count FROM appointment a
       JOIN salon s ON a.salon_id=s.salon_id
       WHERE s.user_id=? AND a.is_deleted=0`,
      [ownerId]
    );
    const [[{count: reviews}]] = await db.promise().query(
      `SELECT COUNT(*) AS count FROM review r
       JOIN salon s ON r.salon_id=s.salon_id
       WHERE s.user_id=? AND r.is_deleted=0`,
      [ownerId]
    );
    const [[{count: payments}]] = await db.promise().query(
      `SELECT COUNT(*) AS count FROM payment p
       JOIN appointment a ON p.appointment_id=a.appointment_id
       JOIN salon s ON a.salon_id=s.salon_id
       WHERE s.user_id=?`,
      [ownerId]
    );
    res.status(200).json({ success: true, counts: { appointments, reviews, payments } });
  } catch (err) {
    console.error("DashboardCounts Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Messages
exports.getMessages = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    const [rows] = await db.promise().query(
      `SELECT m.message_id, m.message_content AS content, m.sender_id, m.receiver_id, u.username AS sender_name, m.created_at
       FROM message m JOIN user u ON m.sender_id=u.user_id
       WHERE m.sender_id=? OR m.receiver_id=? ORDER BY m.created_at ASC`,
      [ownerId, ownerId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("GetMessages Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const senderId = req.user.user_id;
  const { receiver_id, content } = req.body;
  if (!receiver_id || !content)
    return res.status(400).json({ success: false, message: "Receiver and content required" });

  try {
    const [result] = await db.promise().query(
      `INSERT INTO message (sender_id, receiver_id, message_content, message_status, created_at)
       VALUES (?, ?, ?, 'Unread', NOW())`,
      [senderId, receiver_id, content]
    );
    res.status(201).json({ success: true, message: "Message sent", data: { message_id: result.insertId } });
  } catch (err) {
    console.error("SendMessage Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//update message status
exports.markMessageRead = async (req, res) => {
  const ownerId = req.user.user_id;
  const { message_id } = req.params;

  try {
    const [result] = await db.promise().query(
      `UPDATE message SET message_status = 'Read' 
       WHERE message_id = ? AND receiver_id = ?`,
      [message_id, ownerId]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Message not found" });

    res.status(200).json({ success: true, message: "Message marked as read", data: { message_id } });
  } catch (err) {
    console.error("Mark Message Read Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Payments (Owner Side)

// Get all payments for owner's salons
exports.getPayments = async (req, res) => {
  const ownerId = req.user.user_id;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
         p.payment_id, 
         p.amount, 
         p.payment_method, 
         p.payment_status,
         p.transaction_id,
         p.created_at, 
         a.appointment_id, 
         u.username AS customer_name,
         s.salon_name
       FROM payment p
       JOIN appointment a ON p.appointment_id = a.appointment_id
       JOIN user u ON a.customer_id = u.user_id
       JOIN salon s ON a.salon_id = s.salon_id
       WHERE s.user_id = ?
       ORDER BY p.created_at DESC`,
      [ownerId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("GetPayments Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update payment status by owner
exports.updatePaymentStatus = async (req, res) => {
  const ownerId = req.user.user_id;
  const paymentId = parseInt(req.params.payment_id);
  const { payment_status } = req.body;

  const validStatuses = ["Pending", "Completed", "Cancelled"];
  if (!validStatuses.includes(payment_status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
  }

  try {
    const [result] = await db.promise().query(
      `UPDATE payment p
       JOIN appointment a ON p.appointment_id = a.appointment_id
       JOIN salon s ON a.salon_id = s.salon_id
       SET p.payment_status = ?
       WHERE p.payment_id = ? AND s.user_id = ?`,
      [payment_status, paymentId, ownerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Payment not found or not owned by you" });
    }

    res.status(200).json({ success: true, message: "Payment status updated", data: { payment_id: paymentId, payment_status } });
  } catch (err) {
    console.error("UpdatePaymentStatus Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
{/*// Profile
exports.getProfile = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    const [rows] = await db.promise().query(
      `SELECT user_id, username, email, phone_number, profile_image, created_at, updated_at
       FROM user WHERE user_id=?`,
      [ownerId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Profile not found" });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GetProfile Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const ownerId = req.user.user_id;
  const { username, email, phone_number, profile_image } = req.body;
  if (!username || !email || !phone_number)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const [result] = await db.promise().query(
      `UPDATE user SET username=?, email=?, phone_number=?, profile_image=?, updated_at=NOW()
       WHERE user_id=?`,
      [username, email, phone_number, profile_image||null, ownerId]
    );
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Email or phone exists" });
    console.error("UpdateProfile Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};*/}

// Notifications
exports.getNotifications = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    const [rows] = await db.promise().query(
      `SELECT notification_id, message, notification_status, type, created_at
       FROM notification
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [ownerId]
    );
    res.status(200).json({ success: true, notifications: rows });
  } catch (err) {
    console.error("GetNotifications Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Mark notifications
exports.markNotificationRead = async (req, res) => {
  const ownerId = req.user.user_id;
  const notificationId = parseInt(req.params.notification_id);

  if (!notificationId) {
    return res.status(400).json({ success: false, message: "Notification ID is required" });
  }

  try {
    const [result] = await db.promise().query(
      `UPDATE notification SET is_read = 1 WHERE notification_id = ? AND user_id = ?`,
      [notificationId, ownerId]
    );

    if (!result.affectedRows) 
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification marked as read", data: { notification_id: notificationId } });
  } catch (err) {
    console.error("Mark Notification Read Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Notifications
exports.deleteNotification = async (req, res) => {
  const ownerId = req.user.user_id;
  const notificationId = parseInt(req.params.notification_id);

  if (!notificationId) {
    return res.status(400).json({ success: false, message: "Notification ID is required" });
  }

  try {
    const [result] = await db.promise().query(
      `DELETE FROM notification WHERE notification_id = ? AND user_id = ?`,
      [notificationId, ownerId]
    );

    if (!result.affectedRows) 
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification deleted successfully", data: { notification_id: notificationId } });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Get all appointments for the owner's salons
exports.getAppointments = async (req, res) => {
  const ownerId = req.user.user_id; // from auth middleware
  try {
    const [rows] = await db.promise().query(
      `SELECT 
          a.appointment_id,
          c.username AS customer_name,
          s.salon_name,
          sv.service_name,
          b.branch_name,
          a.appointment_datetime,
          a.status,
          a.notes
       FROM appointment a
       JOIN salon s ON a.salon_id = s.salon_id
       JOIN user c ON a.customer_id = c.user_id
       LEFT JOIN service sv ON a.service_id = sv.service_id
       LEFT JOIN branch b ON a.branch_id = b.branch_id
       WHERE s.user_id = ? AND a.is_deleted = 0
       ORDER BY a.appointment_datetime DESC`,
      [ownerId]
    );

    res.status(200).json({ success: true, appointments: rows });
  } catch (err) {
    console.error("GetAppointments Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Reports
exports.getReports = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    // Appointments per month
    const [appointmentsRows] = await db.promise().query(
      `SELECT DATE_FORMAT(a.created_at, '%Y-%m') AS month, COUNT(*) AS total_appointments
       FROM appointment a
       JOIN salon s ON a.salon_id = s.salon_id
       WHERE s.user_id = ? AND a.is_deleted = 0
       GROUP BY month
       ORDER BY month ASC`,
      [ownerId]
    );

    // Revenue per month
    const [revenueRows] = await db.promise().query(
      `SELECT DATE_FORMAT(p.created_at, '%Y-%m') AS month, IFNULL(SUM(p.amount),0) AS total_revenue
       FROM payment p
       JOIN appointment a ON p.appointment_id = a.appointment_id
       JOIN salon s ON a.salon_id = s.salon_id
       WHERE s.user_id = ?
       GROUP BY month
       ORDER BY month ASC`,
      [ownerId]
    );

    res.status(200).json({
      success: true,
      data: {
        appointments: appointmentsRows,  // array of {month, total_appointments}
        revenue: revenueRows,            // array of {month, total_revenue}
      },
    });
  } catch (err) {
    console.error("GetReports Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
