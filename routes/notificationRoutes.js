// routes/notification.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const authenticateToken = require('../middleware/authMiddleware');

 
 

// Route to get stored notifications for a user
router.get('/',authenticateToken, notificationController.getNotifications);
router.post('/',authenticateToken, notificationController.postAndSendNotification);

module.exports = router;
