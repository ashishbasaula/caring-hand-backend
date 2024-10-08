// routes/transferRoutes.js

const express = require('express');
const router = express.Router();
const {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  getTransferByFuneralHomeId
} = require('../controller/transferController');
const authenticateToken = require('../middleware/authMiddleware');

// Routes with authentication
router.post('/transfers', authenticateToken, createTransfer);
router.get('/transfers', authenticateToken, getAllTransfers);
router.get('/transfersById', authenticateToken, getTransferById);
router.get('/transfersByFuneralHomeId', authenticateToken, getTransferByFuneralHomeId);
router.patch('/transfers', authenticateToken, updateTransfer);
router.delete('/transfers', authenticateToken, deleteTransfer);

module.exports = router;
