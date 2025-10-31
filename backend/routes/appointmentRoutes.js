const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");

// -------------------------
// Customer Appointment Routes
// -------------------------

// Book a new appointment
router.post("/book", authMiddleware, appointmentController.bookAppointment);

// Get all appointments of logged-in customer
router.get("/my-appointments", authMiddleware, appointmentController.getMyAppointments);

// Cancel an appointment
router.put("/cancel/:id", authMiddleware, appointmentController.cancelAppointment);

// Reschedule an appointment
router.put("/reschedule/:id", authMiddleware, appointmentController.rescheduleAppointment);

module.exports = router;
