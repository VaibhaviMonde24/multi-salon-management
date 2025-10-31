const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", authenticateToken, adminController.getDashboardCounts);

// Users
router.get("/users", authenticateToken, adminController.getAllUsers);
router.put("/users/:id/promote", authenticateToken, adminController.promoteToOwner);
router.delete("/users/:id", authenticateToken, adminController.deleteUser);

// Salons
router.get("/salons", authenticateToken, adminController.getAllSalons);
router.put("/salons/:id/status", authenticateToken, adminController.updateSalonStatus);
router.delete("/salons/:id", authenticateToken, adminController.deleteSalonAdmin);

// Appointments
router.get("/appointments", authenticateToken, adminController.getAllAppointments);
router.put("/appointments/:id/status", authenticateToken, adminController.updateAppointmentStatus);

// Reviews
router.get("/reviews", authenticateToken, adminController.getAllReviews);
router.delete("/reviews/:id", authenticateToken, adminController.deleteReview);

// Pending Salons
router.get("/pending-salons", authenticateToken, adminController.getPendingSalons);
router.put("/salons/:id/approve", authenticateToken, adminController.approveSalon);
router.put("/branches/:id/approve", authenticateToken, adminController.approveBranch);

// Payments
router.get("/payments", authenticateToken, adminController.getAllPayments);

// -------------------------
// Notifications (from notificationController)
// -------------------------
router.post("/notifications", authenticateToken, notificationController.createNotification);
router.get("/notifications", authenticateToken, notificationController.getMyNotifications);
router.put("/notifications/:id/read", authenticateToken, notificationController.markAsRead);
router.delete("/notifications/:id", authenticateToken, notificationController.deleteNotification);

// Reports
//router.get("/reports", authenticateToken, adminController.getReportsData);

// Settings
//router.get("/settings", authenticateToken, adminController.getSettings);
//router.put("/settings", authenticateToken, adminController.updateSettings);

module.exports = router;
