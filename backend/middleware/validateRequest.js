/**
 * Middleware to validate required fields in req.body
 * @param {string[]} requiredFields - List of required field names
 */
module.exports = (requiredFields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body must be a valid JSON object.' 
      });
    }

    // Check for missing or empty fields
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or empty required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};
