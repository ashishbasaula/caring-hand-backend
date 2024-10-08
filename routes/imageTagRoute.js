// routes/tagImageRoutes.js

const express = require('express');
const router = express.Router();
const tagImageController = require('../controller/tagImageController');
const authenticateToken = require('../middleware/authMiddleware');

// Route to create a tag image
router.post('/tagImages',authenticateToken, tagImageController.createTagImage);

// Route to get images by transfer_id
router.get('/tagImages/transfer/', authenticateToken,tagImageController.getImagesByTransferId);

// Route to update a tag image by ID
router.put('/tagImages/', authenticateToken,tagImageController.updateTagImage);

// Route to delete a tag image by ID
router.delete('/tagImages/',authenticateToken, tagImageController.deleteTagImage);

module.exports = router;
