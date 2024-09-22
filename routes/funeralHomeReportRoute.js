// routes/reportRoutes.js
const express = require('express');
const reportController = require('../controller/funeral_home_report_controller');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// GET summary report for a funeral home (daily, weekly, monthly, yearly)
router.get('/funeral-home-summary',authenticateToken, reportController.getSummaryReport);

module.exports = router;
