const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

// ----------------------
// Admin → Send Notifications
// ----------------------
router.post(
  "/send",
  authenticateToken,
  notificationController.createNotification
);

// ----------------------
// User → Fetch notifications
// ----------------------
router.get(
  "/",
  authenticateToken,
  notificationController.getMyNotifications
);

// ----------------------
// User → Mark as read
// ----------------------
router.put(
  "/:id/read",
  authenticateToken,
  notificationController.markAsRead
);

// ----------------------
// User → Delete notification
// ----------------------
router.delete(
  "/:id",
  authenticateToken,
  notificationController.deleteNotification
);

module.exports = router;
