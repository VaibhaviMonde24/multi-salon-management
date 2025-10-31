const db = require("../db");

// ----------------------
// Create a notification (Admin → Customers or SalonOwners)
// ----------------------
exports.createNotification = async (req, res) => {
  const { message, recipientRole, type } = req.body;

  if (!message || !recipientRole) {
    return res.status(400).json({
      success: false,
      message: "message and recipientRole are required",
    });
  }

  if (!["Customer", "SalonOwner"].includes(recipientRole)) {
    return res.status(400).json({
      success: false,
      message: "recipientRole must be either 'Customer' or 'SalonOwner'",
    });
  }

  try {
    // 1. Get all users with that role
    const [users] = await db
      .promise()
      .query(`SELECT user_id FROM user WHERE role = ? AND is_deleted = 0`, [
        recipientRole,
      ]);

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: `No users found with role ${recipientRole}`,
      });
    }

    // 2. Insert one notification per user
    const values = users.map((u) => [
      u.user_id,
      message,
      "Unread",
      new Date(),
      type || "System",
    ]);

    await db.promise().query(
      `INSERT INTO notification (user_id, message, notification_status, created_at, type)
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      success: true,
      message: `Notification sent to all ${recipientRole}s`,
      count: users.length,
    });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create notifications",
    });
  }
};

// ----------------------
// Get notifications for logged-in user
// ----------------------
exports.getMyNotifications = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [notifications] = await db.promise().query(
      `SELECT notification_id, message, notification_status, type, created_at
       FROM notification
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// ----------------------
// Mark as read
// ----------------------
exports.markAsRead = async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.user_id;

  if (!id) return res.status(400).json({ success: false, message: "Invalid notification ID." });

  try {
    const [result] = await db.promise().query(
      `UPDATE notification
       SET notification_status = 'Read'
       WHERE notification_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Notification not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ success: false, message: "Failed to update notification." });
  }
};

// ----------------------
// Delete notification
// ----------------------
exports.deleteNotification = async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.user_id;

  if (!id) return res.status(400).json({ success: false, message: "Invalid notification ID." });

  try {
    const [result] = await db.promise().query(
      `DELETE FROM notification
       WHERE notification_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Notification not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Notification deleted successfully." });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};
