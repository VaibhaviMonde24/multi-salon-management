const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const inventoryController = require('../controllers/inventoryController');

// Add product
router.post('/', authenticateToken, inventoryController.addProduct);

// Get all products for a salon
router.get('/:salon_id', authenticateToken, inventoryController.getProductsBySalon);

// Update a product
router.put('/:inventory_id', authenticateToken, inventoryController.updateProduct);

// Delete a product
router.delete('/:inventory_id', authenticateToken, inventoryController.deleteProduct);

module.exports = router;
