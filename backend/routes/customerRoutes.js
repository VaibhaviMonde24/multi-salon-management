const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');

// Controllers
const salonController = require('../controllers/salonController');
const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const paymentController = require('../controllers/paymentController');

// Middleware: Customer-only
const isCustomer = authorizeRole(['Customer']);

// -------------------------
// Public: Browse salons, branches, services
// -------------------------
router.get('/salons', salonController.getAllSalons);
router.get('/salons/:salon_id/branches', salonController.getBranchesBySalon);
router.get('/salons/:salon_id/services', serviceController.getServicesBySalon);

// -------------------------
// Customer-only: Appointments
// -------------------------
router.get('/appointments', authenticateToken, isCustomer, customerController.getMyAppointments);

// -------------------------
// Customer-only: Unpaid appointments (payments page)
// -------------------------
router.get('/unpaid-appointments', authenticateToken, isCustomer, paymentController.getUnpaidAppointments);

// -------------------------
// Customer-only: Paid appointments
// -------------------------
router.get('/paid-appointments', authenticateToken, isCustomer, paymentController.getPaidAppointments);

// -------------------------
// Customer-only: Make a payment
// -------------------------
router.post('/make', authenticateToken, isCustomer, paymentController.addPayment);

// -------------------------
// Customer-only: Messages
// -------------------------
router.get('/messages', authenticateToken, isCustomer, customerController.getMyMessages);

// -------------------------
// Customer-only: Notifications
// -------------------------
router.get('/notifications', authenticateToken, isCustomer, customerController.getMyNotifications);

// -------------------------
// Customer-only: Submit Review
// -------------------------
router.post('/reviews', authenticateToken, isCustomer, customerController.submitReview);

// -------------------------
// Customer-only: Dashboard counts
// -------------------------
router.get('/dashboard-counts', authenticateToken, isCustomer, customerController.getDashboardCounts);

module.exports = router;
