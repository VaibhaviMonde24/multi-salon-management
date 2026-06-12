const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/authMiddleware');
const staffController = require('../controllers/staffController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ✅ Public route — customer साठी (auth नाही लागत)
router.get('/salon/:salon_id', staffController.getStaffBySalon);

// Owner routes — auth लागतो
router.use(authenticateToken);

router.get('/', staffController.getStaff);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('salon_id').isInt().withMessage('Salon ID must be a number'),
    body('staff_role').notEmpty().withMessage('Staff role is required'),
    body('branch_id').optional().isInt().withMessage('Branch ID must be a number if provided'),
  ],
  validate,
  staffController.addStaff
);

router.put(
  '/:staff_id',
  [
    param('staff_id').isInt().withMessage('Staff ID must be a number'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('salon_id').isInt().withMessage('Salon ID must be a number'),
    body('staff_role').notEmpty().withMessage('Staff role is required'),
    body('staff_status').isIn(['Active', 'Inactive']).withMessage('Staff status must be Active or Inactive'),
    body('branch_id').optional().isInt().withMessage('Branch ID must be a number if provided'),
  ],
  validate,
  staffController.updateStaff
);

router.delete(
  '/:staff_id',
  [
    param('staff_id').isInt().withMessage('Staff ID must be a number'),
  ],
  validate,
  staffController.deleteStaff
);

module.exports = router;