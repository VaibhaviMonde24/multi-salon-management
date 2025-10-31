// File: routes/ownerRoutes.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');
const ownerController = require('../controllers/ownerController');
const salonController = require('../controllers/salonController');
const staffController = require('../controllers/staffController');
const inventoryController = require('../controllers/inventoryController');
const reviewController = require("../controllers/reviewController");

// -----------------------------------
// Middleware: All routes require SalonOwner role
// -----------------------------------
router.use(authenticateToken);
router.use(authorizeRole(['SalonOwner']));

// -----------------------------------
// Dashboard
// -----------------------------------
router.get('/dashboard', ownerController.getDashboardCounts);
// -----------------------------------
// Appointments (Owner)
// -----------------------------------
router.get('/appointments', ownerController.getAppointments);


// -----------------------------------
// Salon Management
// -----------------------------------
router.get('/salons', salonController.getOwnerSalons);
router.get('/salons/:salon_id', salonController.getSalonById);
router.post('/salons', salonController.createSalon);
router.put('/salons/:salon_id', salonController.updateSalon);
router.delete('/salons/:salon_id', salonController.deleteSalon);

// Dropdowns
router.get('/salons-dropdown', salonController.getOwnerSalonsDropdown);
router.get('/salons/:salon_id/branches', salonController.getBranchesBySalon);

// -----------------------------------
// Staff Management
// -----------------------------------
router.get('/staff', staffController.getStaff);
router.post('/staff', staffController.addStaff);
router.put('/staff/:staff_id', staffController.updateStaff);
router.delete('/staff/:staff_id', staffController.deleteStaff);

// -----------------------------------
// Messages (Owner ↔ Users)
// -----------------------------------
router.get('/messages', ownerController.getMessages);
router.post('/messages', ownerController.sendMessage);
router.put('/messages/:message_id/read', ownerController.markMessageRead);
// Get reviews for all salons of the logged-in owner
router.get("/reviews", reviewController.getOwnerReviews);


// -------------------------
// Inventory Management
// -------------------------
router.post('/inventory', inventoryController.addProduct);
router.get('/inventory/:salon_id', inventoryController.getProductsBySalon);
router.put('/inventory/:inventory_id', inventoryController.updateProduct);
router.delete('/inventory/:inventory_id', inventoryController.deleteProduct);


// -----------------------------------
// Payments
// -----------------------------------
router.get('/payments', ownerController.getPayments);
router.put('/payments/:payment_id/status', ownerController.updatePaymentStatus);

// -----------------------------------
// Profile
// -----------------------------------
//router.get('/profile', ownerController.getProfile);
//router.put('/profile', ownerController.updateProfile);

// -----------------------------------
// Notifications
// -----------------------------------
router.get('/notifications', ownerController.getNotifications);
router.put('/notifications/:notification_id/read', ownerController.markNotificationRead);
router.delete('/notifications/:notification_id', ownerController.deleteNotification);

// -----------------------------------
// Reports
// -----------------------------------
router.get('/reports', ownerController.getReports);

module.exports = router;
