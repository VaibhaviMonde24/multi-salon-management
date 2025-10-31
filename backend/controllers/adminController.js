const db = require("../db");

// -------------------------
// Dashboard summary
exports.getDashboardCounts = async (req, res) => {
  try {
    const [[counts]] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM user WHERE is_deleted = 0) AS total_users,   -- all users
        (SELECT COUNT(*) FROM user WHERE role = 'Customer' AND is_deleted = 0) AS total_customers,
        (SELECT COUNT(*) FROM user WHERE role = 'SalonOwner' AND is_deleted = 0) AS total_owners,
        (SELECT COUNT(*) FROM salon WHERE is_deleted = 0) AS total_salons,
        (SELECT COUNT(*) FROM appointment WHERE status = 'Completed' AND is_deleted = 0) AS completed_appointments,
        (SELECT COUNT(*) FROM appointment WHERE status = 'Booked' AND is_deleted = 0) AS pending_appointments,
        (SELECT COUNT(*) FROM review WHERE is_deleted = 0) AS total_reviews,
        (SELECT IFNULL(SUM(amount), 0) FROM payment) AS total_revenue
    `);

    res.status(200).json({ success: true, data: counts });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Users
// -------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT user_id, username, email, role, created_at 
      FROM user 
      WHERE is_deleted = 0
      ORDER BY created_at DESC
    `);
    res.status(200).json({ success: true, users: rows });
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.promoteToOwner = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the user's current role
    const [rows] = await db.promise().query(
      `SELECT role FROM user WHERE user_id = ? AND is_deleted = 0`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentRole = rows[0].role;

    // 2. Prevent promoting Admin or already Owner
    if (currentRole === "Admin") {
      return res.status(400).json({ success: false, message: "Admins cannot be promoted" });
    }
    if (currentRole === "SalonOwner") {
      return res.status(400).json({ success: false, message: "User is already a Salon Owner" });
    }

    // 3. Promote Customer → SalonOwner
    const [result] = await db.promise().query(
      `UPDATE user 
       SET role = 'SalonOwner', updated_at = NOW() 
       WHERE user_id = ? AND is_deleted = 0`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Promotion failed" });
    }

    res.status(200).json({ success: true, message: "User promoted to Salon Owner" });

  } catch (err) {
    console.error("PromoteToOwner Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(`
      UPDATE user SET is_deleted = 1, updated_at = NOW()
      WHERE user_id = ? AND is_deleted = 0
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Salons
// -------------------------
exports.getAllSalons = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT s.*, u.username AS owner_name
      FROM salon s
      JOIN user u ON s.user_id = u.user_id
      WHERE s.is_deleted = 0
      ORDER BY s.created_at DESC
    `);
    res.status(200).json({ success: true, salons: rows });
  } catch (err) {
    console.error("Get Salons Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.updateSalonStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }
  try {
    const [result] = await db.promise().query(`
      UPDATE salon SET status = ?, updated_at = NOW()
      WHERE salon_id = ? AND is_deleted = 0
    `, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    res.status(200).json({ success: true, message: "Salon status updated" });
  } catch (err) {
    console.error("Update Salon Status Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.deleteSalonAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(`
      UPDATE salon SET is_deleted = 1, updated_at = NOW()
      WHERE salon_id = ? AND is_deleted = 0
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    res.status(200).json({ success: true, message: "Salon deleted successfully" });
  } catch (err) {
    console.error("Delete Salon Admin Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.promise().query(`
      SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        u.username AS customer_name,
        s.salon_name,
        b.branch_name,
        st.name AS staff_name,
        srv.service_name
      FROM appointment a
      JOIN user u ON a.customer_id = u.user_id
      JOIN salon s ON a.salon_id = s.salon_id
      LEFT JOIN branch b ON a.branch_id = b.branch_id
      LEFT JOIN staff st ON a.staff_id = st.staff_id
      LEFT JOIN service srv ON a.service_id = srv.service_id
      WHERE a.is_deleted = 0
      ORDER BY a.appointment_datetime DESC
    `);

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("Get Appointments Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Booked', 'Completed', 'Cancelled', 'Rescheduled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    const [result] = await db.promise().query(`
      UPDATE appointment
      SET status = ?, updated_at = NOW()
      WHERE appointment_id = ? AND is_deleted = 0
    `, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, message: "Appointment status updated" });
  } catch (err) {
    console.error("Update Appointment Status Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Reviews
// -------------------------
exports.getAllReviews = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let offset = (page - 1) * limit;

    const [rows] = await db.promise().query(`
  SELECT r.review_id, r.rating, r.review_text AS comment, r.is_edited, r.created_at,
         u.username AS customer_name,
         s.salon_name,
         srv.service_name,
         r.appointment_id
  FROM review r
  JOIN user u ON r.customer_id = u.user_id
  JOIN salon s ON r.salon_id = s.salon_id
  LEFT JOIN service srv ON r.service_id = srv.service_id
  WHERE r.is_deleted = 0
  ORDER BY r.created_at DESC
  LIMIT ? OFFSET ?
`, [limit, offset]);


    res.status(200).json({ success: true, page, limit, reviews: rows });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.promise().query(`
      UPDATE review
      SET is_deleted = 1, updated_at = NOW()
      WHERE review_id = ? AND is_deleted = 0
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
// -------------------------
// Pending Salons
// -------------------------
exports.getPendingSalons = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT * FROM salon WHERE status = 'pending' AND is_deleted = 0
    `);
    res.status(200).json({ success: true, salons: rows });
  } catch (err) {
    console.error("Get Pending Salons Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.approveSalon = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query(
      `UPDATE salon SET status = 'approved', updated_at = NOW() WHERE salon_id = ? AND is_deleted = 0`,
      [id]
    );
    res.status(200).json({ success: true, message: "Salon approved" });
  } catch (err) {
    console.error("Approve Salon Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.approveBranch = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query(
      `UPDATE branch SET status = 'approved', updated_at = NOW() WHERE branch_id = ? AND is_deleted = 0`,
      [id]
    );
    res.status(200).json({ success: true, message: "Branch approved" });
  } catch (err) {
    console.error("Approve Branch Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Payments
// -------------------------
exports.getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
          p.payment_id,
          p.amount,
          p.payment_method,
          p.payment_status,
          p.created_at,
          u.username AS customer_name,
          s.salon_name
      FROM payment p
      JOIN appointment a ON p.appointment_id = a.appointment_id
      JOIN user u ON a.customer_id = u.user_id
      JOIN salon s ON a.salon_id = s.salon_id
      ORDER BY p.created_at DESC
    `);

    res.status(200).json({ success: true, payments: rows });
  } catch (err) {
    console.error("Get Payments Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Notifications
// -------------------------
exports.getAllNotifications = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT * FROM notification ORDER BY created_at DESC
    `);
    res.status(200).json({ success: true, notifications: rows });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.sendNotification = async (req, res) => {
  const { title, message } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO notification (title, message, created_at) VALUES (?, ?, NOW())`,
      [title, message]
    );
    res.status(201).json({ success: true, message: "Notification sent" });
  } catch (err) {
    console.error("Send Notification Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

