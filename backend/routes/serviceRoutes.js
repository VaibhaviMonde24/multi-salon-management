// File: routes/serviceRoutes.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');
const serviceController = require('../controllers/serviceController');

// Middleware: SalonOwner only
const isOwner = [authenticateToken, authorizeRole(['SalonOwner'])];

// Public Routes
router.get("/", serviceController.getAllServices); 
router.get('/salon/:salon_id', serviceController.getServicesBySalon);

// Owner-only Routes
router.post('/', isOwner, serviceController.addService);
router.put('/:id', isOwner, serviceController.updateService);
router.delete('/:id', isOwner, serviceController.deleteService);

module.exports = router;
