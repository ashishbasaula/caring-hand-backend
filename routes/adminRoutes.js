const express = require('express');
const router = express.Router();
const adminController=require('../controller/adminController');
const authenticateToken = require('../middleware/authMiddleware');

// Authentication
router.post('/login', adminController.login);

// User Management
router.get('/users',authenticateToken, adminController.getUsers);
router.post('/users',authenticateToken, adminController.addUser);
router.patch('/users',authenticateToken, adminController.updateUser);
router.delete('/users',authenticateToken, adminController.deleteUser);
router.post('/addNotificationToken',authenticateToken, adminController.addNotificationToken);

// Route to change user password
router.put('/change-password',authenticateToken, adminController.changePassword);

module.exports = router;


// Export the router
module.exports = router;
