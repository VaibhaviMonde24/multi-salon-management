const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const branchController = require('../controllers/branchController');

// Create a new branch
router.post('/', authenticateToken, branchController.createBranch);

// Get all branches (optional salon filter via query param)
router.get('/', authenticateToken, branchController.getBranches);

// Get a single branch by ID
router.get('/:branch_id', authenticateToken, branchController.getBranchById);

// Update a branch
router.put('/:branch_id', authenticateToken, branchController.updateBranch);

// Soft delete a branch
router.delete('/:branch_id', authenticateToken, branchController.deleteBranch);

module.exports = router;
