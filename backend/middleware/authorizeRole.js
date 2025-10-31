/**
 * Middleware to authorize users based on roles
 * @param {Array<string>} roles - Allowed roles, e.g., ['Customer', 'SalonOwner', 'Admin']
 */
const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role?.trim();
      if (!userRole) {
        return res
          .status(401)
          .json({ success: false, message: "User role not found. Please login again." });
      }

      // Normalize roles to lowercase for comparison
      const allowedRoles = roles.map((r) => r.trim().toLowerCase());

      if (!allowedRoles.includes(userRole.toLowerCase())) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied: Insufficient role permissions." });
      }

      next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };
};

module.exports = authorizeRole;
