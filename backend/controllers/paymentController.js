const db = require('../db');

// ----------------------
// Add a payment (Customer only)
exports.addPayment = async (req, res) => {
  const { appointment_id, amount, payment_method, transaction_id } = req.body;
  const user_id = req.user.user_id;

  try {
    // Check if appointment exists and belongs to this customer
    const [appt] = await db.promise().query(
      `SELECT * FROM appointment WHERE appointment_id = ? AND customer_id = ? AND is_deleted = 0`,
      [appointment_id, user_id]
    );

    if (!appt.length) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Insert payment
    const [result] = await db.promise().query(
      `INSERT INTO payment (appointment_id, amount, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, 'Completed', ?)`,
      [appointment_id, amount, payment_method, transaction_id]
    );

    res.json({ success: true, message: 'Payment added successfully.', payment_id: result.insertId });
  } catch (err) {
    console.error('Add Payment Error:', err);
    res.status(500).json({ success: false, message: 'Database error adding payment.' });
  }
};

// ----------------------
// Get unpaid appointments
exports.getUnpaidAppointments = async (req, res) => {
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    let query = '';
    let params = [];

    if (role === 'Customer') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               COALESCE(p.amount, s.service_price) AS amount,
               COALESCE(p.payment_status, 'Pending') AS payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        LEFT JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE a.customer_id = ? AND (p.payment_status IS NULL OR p.payment_status = 'Pending')
        ORDER BY a.appointment_datetime DESC
      `;
      params = [userId];
    } else if (role === 'SalonOwner') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               COALESCE(p.amount, s.service_price) AS amount,
               COALESCE(p.payment_status, 'Pending') AS payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        LEFT JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE sl.user_id = ? AND (p.payment_status IS NULL OR p.payment_status = 'Pending')
        ORDER BY a.appointment_datetime DESC
      `;
      params = [userId];
    } else if (role === 'Admin') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               COALESCE(p.amount, s.service_price) AS amount,
               COALESCE(p.payment_status, 'Pending') AS payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        LEFT JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE p.payment_status IS NULL OR p.payment_status = 'Pending'
        ORDER BY a.appointment_datetime DESC
      `;
    }

    const [rows] = await db.promise().query(query, params);
    res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error('Get Unpaid Appointments Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------------
// Get paid appointments
exports.getPaidAppointments = async (req, res) => {
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    let query = '';
    let params = [];

    if (role === 'Customer') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               p.amount, p.payment_method, p.payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE a.customer_id = ? AND p.payment_status = 'Completed'
        ORDER BY a.appointment_datetime DESC
      `;
      params = [userId];
    } else if (role === 'SalonOwner') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               p.amount, p.payment_method, p.payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE sl.user_id = ? AND p.payment_status = 'Completed'
        ORDER BY a.appointment_datetime DESC
      `;
      params = [userId];
    } else if (role === 'Admin') {
      query = `
        SELECT a.appointment_id, a.appointment_datetime, s.service_name, sl.salon_name,
               p.amount, p.payment_method, p.payment_status
        FROM appointment a
        JOIN service s ON a.service_id = s.service_id
        JOIN salon sl ON a.salon_id = sl.salon_id
        JOIN payment p ON a.appointment_id = p.appointment_id
        WHERE p.payment_status = 'Completed'
        ORDER BY a.appointment_datetime DESC
      `;
    }

    const [rows] = await db.promise().query(query, params);
    res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error('Get Paid Appointments Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
