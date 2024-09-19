// controller/transferController.js

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const db = require('../models/db');  

// Create a new transfer
// controller/transferController.js

exports.createTransfer = (req, res) => {
  const { 
    funeral_home_id, agent_id, pickup_location, delivery_location, 
    scheduled_time, distance, weight, price, doc 
  } = req.body;

  // Check for required fields, but allow agent_id and doc to be null
  if (!funeral_home_id || !pickup_location || !delivery_location || !scheduled_time || !distance || !weight || !price) {
    return sendErrorResponse(res, 400, 'All required fields are not provided');
  }

  // Prepare the SQL query with optional fields
  const query = `
    INSERT INTO transfers 
    (funeral_home_id, agent_id, pickup_location, delivery_location, scheduled_time, distance, weight, price, documents) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, 
    [funeral_home_id, agent_id || null, pickup_location, delivery_location, scheduled_time, distance, weight, price, doc || null], 
    (err, results) => {
      if (err) return sendErrorResponse(res, 500, 'Error creating transfer', err.message);
      sendSuccessResponse(res, 201, { id: results.insertId }, 'Transfer created successfully');
    }
  );
};


// Get all transfers
exports.getAllTransfers = (req, res) => {
  const { status } = req.query;
 

  let query = 'SELECT * FROM transfers';
  let queryParams = [];

  // If the status is provided, add it to the query
  if (status !== undefined && status!=="null") {
    query += ' WHERE status = ?';
    queryParams.push(status);
  }

  query += ' ORDER BY created_at DESC';

  db.query(query, queryParams, (err, results) => {
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

exports.getTransferByFuneralHomeId = (req, res) => {
  const { id, status } = req.query;

  let query = 'SELECT * FROM transfers  WHERE funeral_home_id = ?';
  let queryParams = [id];

  // If the status is provided, add it to the query
  if (status !== undefined) {
    query += ' AND status = ?';
    queryParams.push(status);
  }
  query += ' ORDER BY created_at DESC';
  db.query(query, queryParams, (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
    if (results.length === 0) return sendSuccessResponse(res, 200, results, 'Retrieved transfer');
    sendSuccessResponse(res, 200, results, 'Retrieved transfer');
  });
};

// Update transfer details
exports.updateTransfer = (req, res) => {
    const { id } = req.query;
    const { agent_id, pickup_location, delivery_location, scheduled_time, status, distance, weight, price } = req.body;
  
    let updateFields = [];
    let updateValues = [];
  
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
    if (distance !== undefined) {
      updateFields.push('distance = ?');
      updateValues.push(distance);
    }
    if (weight !== undefined) {
      updateFields.push('weight = ?');
      updateValues.push(weight);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
  
    if (updateFields.length === 0) {
      return sendErrorResponse(res, 400, 'No fields to update');
    }
  
    updateValues.push(id);
    const query = `UPDATE transfers SET ${updateFields.join(', ')} WHERE id = ?`;
  
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
