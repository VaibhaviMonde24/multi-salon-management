// File: controllers/userController.js
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // nodemailer helper

// -------------------------
// Helper: Normalize role exactly as DB enum
// -------------------------
const normalizeRole = (role) => {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === 'salonowner') return 'SalonOwner';
  if (r === 'admin') return 'Admin';
  if (r === 'customer') return 'Customer';
  return null;
};

// -------------------------
// Register User
// -------------------------
exports.registerUser = async (req, res) => {
  let { username, email, password, phone_number, role } = req.body;

  username = username?.trim();
  email = email?.trim();
  phone_number = phone_number?.trim();
  role = role?.trim();

  if (!username || !email || !password || !role)
    return res.status(400).json({ success: false, message: "All required fields must be provided." });

  const normalizedRole = normalizeRole(role);
  if (!normalizedRole)
    return res.status(400).json({ success: false, message: "Invalid role. Allowed: Customer, SalonOwner, Admin" });

  try {
    const [result] = await db.promise().query(
      `INSERT INTO user (username, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)`,
      [username, email, password, phone_number || null, normalizedRole]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user_id: result.insertId, role: normalizedRole }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Email or phone number already exists." });
    }
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Login User
// -------------------------
exports.loginUser = async (req, res) => {
  let { identifier, password } = req.body; // email or phone
  identifier = identifier?.trim();

  if (!identifier || !password)
    return res.status(400).json({ success: false, message: "Email/phone and password required." });

  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM user WHERE (email = ? OR phone_number = ?) AND is_deleted = 0`,
      [identifier, identifier]
    );

    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    if (user.password !== password)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) return res.status(500).json({ success: false, message: "User role invalid." });

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        username: user.username,
        role: normalizedRole
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: normalizedRole,
        phone_number: user.phone_number,
        profile_image: user.profile_image
      },
      token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get user profile
// -------------------------
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await db.promise().query(
      `SELECT user_id, username, email, role, phone_number, profile_image, created_at, updated_at 
       FROM user 
       WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// -------------------------
// Update user profile
// -------------------------
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { username, phone_number, profile_image } = req.body;

    username = username?.trim();
    phone_number = phone_number?.trim();

    if (!username) return res.status(400).json({ success: false, message: "Username is required." });

    const [result] = await db.promise().query(
      `UPDATE user SET username = ?, phone_number = ?, profile_image = ?, updated_at = NOW() 
       WHERE user_id = ? AND is_deleted = 0`,
      [username, phone_number || null, profile_image || null, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "User not found or no changes applied." });

    res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
// -------------------------
// Forgot Password
// -------------------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });

  try {
    // Check if user exists
    const [users] = await db.promise().query(
      "SELECT * FROM user WHERE email = ? AND is_deleted = 0",
      [email]
    );
    if (users.length === 0) 
      return res.status(404).json({ success: false, message: "User not found." });

    const user = users[0];

    // Generate unique token
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Insert token in DB
    await db.promise().query(
      "INSERT INTO password_reset (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.user_id, token, expiresAt]
    );

    // Instead of sending email, just log and return link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log(`Reset link for ${user.email}: ${resetLink}`);

    res.json({ 
      success: true, 
      message: "Password reset link generated. Check console for link.", 
      resetLink // send in response for frontend testing
    });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
// -------------------------
// Reset Password 
// -------------------------
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { new_password } = req.body;

  if (!new_password) return res.status(400).json({ success: false, message: "New password is required." });

  try {
    // Check if token exists and is valid
    const [rows] = await db.promise().query(
      "SELECT * FROM password_reset WHERE token = ? AND is_used = 0 AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      console.log(`Invalid or expired token: ${token}`);
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    const resetRequest = rows[0];

    // Update user password
    await db.promise().query(
      "UPDATE user SET password = ? WHERE user_id = ?",
      [new_password, resetRequest.user_id]
    );

    // Mark token as used
    await db.promise().query(
      "UPDATE password_reset SET is_used = 1 WHERE reset_id = ?",
      [resetRequest.reset_id]
    );

    // Console log for testing
    console.log(`Password reset successful for user_id: ${resetRequest.user_id}`);

    res.json({ success: true, message: "Password has been reset successfully (simulated)." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
