const express = require('express');
const router = express.Router();
const pricingParameterController = require('../controller/pricingParameterController');
const authenticateToken = require('../middleware/authMiddleware');

// CRUD routes for pricing parameters
router.post('/pricing-parameters',authenticateToken, pricingParameterController.createPricingParameter); // Create
router.get('/pricing-parameters',authenticateToken, pricingParameterController.getPricingParameters);    // Read
router.patch('/pricing-parameters',authenticateToken, pricingParameterController.updatePricingParameter); // Update
router.delete('/pricing-parameters',authenticateToken, pricingParameterController.deletePricingParameter); // Delete

module.exports = router;
