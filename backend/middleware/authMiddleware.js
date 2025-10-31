// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token." });
      }

      // Attach user data to request
      req.user = {
        user_id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        username: decoded.username,
      };

      next();
    });
  } catch (error) {
    console.error("Token authentication error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

module.exports = authenticateToken;
