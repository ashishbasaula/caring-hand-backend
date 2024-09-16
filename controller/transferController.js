// controller/transferController.js

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const db = require('../models/db');  

// Create a new transfer
exports.createTransfer = (req, res) => {
  const { funeral_home_id, agent_id, pickup_location, delivery_location, scheduled_time } = req.body;

  if (!funeral_home_id || !pickup_location || !delivery_location || !scheduled_time) {
    return sendErrorResponse(res, 400, 'All required fields are not provided');
  }

  const query = 'INSERT INTO transfers (funeral_home_id, agent_id, pickup_location, delivery_location, scheduled_time) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [funeral_home_id, agent_id, pickup_location, delivery_location, scheduled_time], (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Error creating transfer', err.message);
    sendSuccessResponse(res, 201, { id: results.insertId }, 'Transfer created successfully');
  });
};

// Get all transfers
exports.getAllTransfers = (req, res) => {
  db.query('SELECT * FROM transfers', (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
    sendSuccessResponse(res, 200, results, 'Retrieved all transfers');
  });
};

// Get a transfer by ID
exports.getTransferById = (req, res) => {
  const { id } = req.query;

  db.query('SELECT * FROM transfers WHERE id = ?', [id], (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
    if (results.length === 0) return sendErrorResponse(res, 404, 'Transfer not found');
    sendSuccessResponse(res, 200, results[0], 'Retrieved transfer');
  });
};

// Update transfer details
exports.updateTransfer = (req, res) => {
    const { id } = req.query;
    const { agent_id, pickup_location, delivery_location, scheduled_time, status } = req.body;
  
    // Start with an array of fields to update and their corresponding values
    let updateFields = [];
    let updateValues = [];
  
    // Add fields to updateFields and updateValues only if they are present in the request body
    if (agent_id !== undefined) {
      updateFields.push('agent_id = ?');
      updateValues.push(agent_id);
    }
    if (pickup_location !== undefined) {
      updateFields.push('pickup_location = ?');
      updateValues.push(pickup_location);
    }
    if (delivery_location !== undefined) {
      updateFields.push('delivery_location = ?');
      updateValues.push(delivery_location);
    }
    if (scheduled_time !== undefined) {
      updateFields.push('scheduled_time = ?');
      updateValues.push(scheduled_time);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
  
    // Ensure there are fields to update
    if (updateFields.length === 0) {
      return sendErrorResponse(res, 400, 'No fields to update');
    }
  
    // Add the ID to the values
    updateValues.push(id);
  
    // Construct the SQL query with dynamic field updates
    const query = `UPDATE transfers SET ${updateFields.join(', ')} WHERE id = ?`;
  
    // Execute the query
    db.query(query, updateValues, (err, results) => {
      if (err) return sendErrorResponse(res, 500, 'Error updating transfer', err.message);
      if (results.affectedRows === 0) return sendErrorResponse(res, 404, 'Transfer not found');
      sendSuccessResponse(res, 200, null, 'Transfer updated successfully');
    });
  };
  

// Delete a transfer
exports.deleteTransfer = (req, res) => {
  const { id } = req.query;

  db.query('DELETE FROM transfers WHERE id = ?', [id], (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Error deleting transfer', err.message);
    if (results.affectedRows === 0) return sendErrorResponse(res, 404, 'Transfer not found');
    sendSuccessResponse(res, 200, null, 'Transfer deleted successfully');
  });
};
