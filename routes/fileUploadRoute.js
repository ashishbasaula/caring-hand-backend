const express = require('express');
const router = express.Router();
const fileController=require('../controller/fileUploadController');
const authenticateToken = require('../middleware/authMiddleware');

// Assuming you have token authentication

// File upload route with token authentication
router.post('/upload',authenticateToken, fileController.uploadFile);

module.exports = router;
