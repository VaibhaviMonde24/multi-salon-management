const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');
const reviewController = require('../controllers/reviewController');

const isCustomer = authorizeRole(['Customer']);

// ----------------------
// Review Routes
// ----------------------

// Add a review
router.post('/', authenticateToken, isCustomer, reviewController.addReview);

// Get reviews for a salon
router.get('/salon/:salon_id', reviewController.getSalonReviews);

// Get reviews of the logged-in customer
router.get('/my', authenticateToken, isCustomer, reviewController.getMyReviews);

// Edit a review
router.put('/:id', authenticateToken, isCustomer, reviewController.updateReview);

// Delete a review
router.delete('/:id', authenticateToken, isCustomer, reviewController.deleteReview);

module.exports = router;
