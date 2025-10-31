// File: controllers/appointmentController.js
const db = require('../db');

// -------------------------
// Book an appointment
// -------------------------
exports.bookAppointment = async (req, res) => {
  const customerId = req.user.user_id;
  const { salon_id, branch_id, service_id, staff_id, appointment_datetime, notes } = req.body;

  if (!salon_id || !service_id || !appointment_datetime) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  const appointmentTime = new Date(appointment_datetime);
  if (isNaN(appointmentTime.getTime()) || appointmentTime < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or past date/time" });
  }

  try {
    // Validate salon
    const [[salon]] = await db.promise().query(
      `SELECT salon_id FROM salon WHERE salon_id = ? AND is_deleted = 0`,
      [salon_id]
    );
    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    // Validate branch if provided
    if (branch_id) {
      const [[branch]] = await db.promise().query(
        `SELECT branch_id FROM branch WHERE branch_id = ? AND salon_id = ? AND is_deleted = 0`,
        [branch_id, salon_id]
      );
      if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // Check staff double booking
    if (staff_id) {
      const [existing] = await db.promise().query(
        `SELECT * FROM appointment WHERE staff_id = ? AND appointment_datetime = ? AND status = 'Booked'`,
        [staff_id, appointment_datetime]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: "Staff already booked at this time" });
      }
    }

    // Insert appointment
    const [result] = await db.promise().query(
      `INSERT INTO appointment
        (customer_id, salon_id, branch_id, service_id, staff_id, appointment_datetime, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Booked', NOW())`,
      [customerId, salon_id, branch_id || null, service_id, staff_id || null, appointment_datetime, notes || null]
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked",
      data: { appointment_id: result.insertId }
    });

  } catch (err) {
    console.error("Book Appointment Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get my appointments
// -------------------------
exports.getMyAppointments = async (req, res) => {
  const customerId = req.user.user_id;
  try {
    const [appointments] = await db.promise().query(
      `SELECT a.appointment_id, a.appointment_datetime, a.status, a.notes,
              s.service_name, st.name AS staff_name, b.branch_name, sl.salon_name
       FROM appointment a
       LEFT JOIN service s ON a.service_id = s.service_id
       LEFT JOIN staff st ON a.staff_id = st.staff_id AND st.is_deleted = 0
       LEFT JOIN branch b ON a.branch_id = b.branch_id
       LEFT JOIN salon sl ON a.salon_id = sl.salon_id
       WHERE a.customer_id = ? AND a.is_deleted = 0
       ORDER BY a.appointment_datetime DESC`,
      [customerId]
    );

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    console.error("Get My Appointments Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Cancel appointment
// -------------------------
exports.cancelAppointment = async (req, res) => {
  const customerId = req.user.user_id;
  const appointmentId = req.params.id;

  if (!appointmentId || isNaN(appointmentId)) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  try {
    const [result] = await db.promise().query(
      `UPDATE appointment
       SET status = 'Cancelled', updated_at = NOW()
       WHERE appointment_id = ? AND customer_id = ? AND status = 'Booked'`,
      [appointmentId, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found or already cancelled" });
    }

    res.status(200).json({ success: true, message: "Appointment cancelled", data: { appointment_id: Number(appointmentId) } });

  } catch (err) {
    console.error("Cancel Appointment Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Reschedule appointment
// -------------------------
exports.rescheduleAppointment = async (req, res) => {
  const customerId = req.user.user_id;
  const appointmentId = req.params.id;
  const { appointment_datetime } = req.body;

  if (!appointment_datetime) {
    return res.status(400).json({ success: false, message: "New appointment datetime required" });
  }

  const newTime = new Date(appointment_datetime);
  if (isNaN(newTime.getTime()) || newTime < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or past date/time" });
  }

  try {
    const [check] = await db.promise().query(
      `SELECT * FROM appointment WHERE appointment_id = ? AND customer_id = ? AND status != 'Cancelled'`,
      [appointmentId, customerId]
    );

    if (check.length === 0) return res.status(404).json({ success: false, message: "Appointment not found" });

    const staffId = check[0].staff_id;
    if (staffId) {
      const [existing] = await db.promise().query(
        `SELECT * FROM appointment WHERE staff_id = ? AND appointment_datetime = ? AND status = 'Booked'`,
        [staffId, appointment_datetime]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: "Staff already booked at this time" });
      }
    }

    await db.promise().query(
      `UPDATE appointment
       SET appointment_datetime = ?, status = 'Rescheduled', updated_at = NOW()
       WHERE appointment_id = ?`,
      [appointment_datetime, appointmentId]
    );

    res.status(200).json({ success: true, message: "Appointment rescheduled" });

  } catch (err) {
    console.error("Reschedule Appointment Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// -------------------------
// Get my appointments (Customer)
// -------------------------
exports.getMyAppointments = async (req, res) => {
  const customerId = req.user.user_id;

  try {
    //  Mark past booked appointments as Completed
    await db.promise().query(
      `UPDATE appointment
       SET status = 'Completed', updated_at = NOW()
       WHERE customer_id = ? AND status = 'Booked' AND appointment_datetime <= NOW()`,
      [customerId]
    );

    //  Fetch all appointments for customer
    const [appointments] = await db.promise().query(
      `SELECT a.appointment_id, a.appointment_datetime, a.status, a.notes,
              s.service_name, st.name AS staff_name, b.branch_name, sl.salon_name
       FROM appointment a
       LEFT JOIN service s ON a.service_id = s.service_id
       LEFT JOIN staff st ON a.staff_id = st.staff_id AND st.is_deleted = 0
       LEFT JOIN branch b ON a.branch_id = b.branch_id
       LEFT JOIN salon sl ON a.salon_id = sl.salon_id
       WHERE a.customer_id = ? AND a.is_deleted = 0
       ORDER BY a.appointment_datetime DESC`,
      [customerId]
    );

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    console.error("Get My Appointments Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
