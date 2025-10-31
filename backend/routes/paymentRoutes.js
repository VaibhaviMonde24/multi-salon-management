const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');
const paymentController = require('../controllers/paymentController');

// Role middlewares
const isCustomer = authorizeRole(['Customer']);
const isOwner = authorizeRole(['SalonOwner']);
const isAdmin = authorizeRole(['Admin']);

// ----------------------
// Customer routes
// ----------------------

// Make a payment
router.post('/', authenticateToken, isCustomer, paymentController.addPayment);

// Get unpaid appointments
router.get('/unpaid-appointments', authenticateToken, isCustomer, paymentController.getUnpaidAppointments);

// Get paid appointments
router.get('/paid-appointments', authenticateToken, isCustomer, paymentController.getPaidAppointments);

// ----------------------
// Owner/Admin routes (optional for future features)
// ----------------------
// Example: Update payment status by Admin or Owner
// router.put('/:payment_id/status', authenticateToken, isAdmin, paymentController.updatePaymentStatus);

module.exports = router;
