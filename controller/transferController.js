const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const { executeQuery } = require('../models/db'); // Use executeQuery function

// Create a new transfer
exports.createTransfer = async (req, res) => {
  const { 
    funeral_home_id, agent_id, pickup_location, delivery_location, 
    scheduled_time, distance, weight, price, doc, pick_lat, pick_long, drop_lat, drop_long, transferName, pickup_type 
  } = req.body;
console.log(transferName);
  // Required fields validation
  if (!funeral_home_id || !pickup_location || !delivery_location || !scheduled_time || !distance || !weight || !price || !transferName || !pickup_type) {
    return sendErrorResponse(res, 400, 'All required fields are not provided');
  }

  try {
    // Insert the new transfer
    const query = `
      INSERT INTO transfers 
      (funeral_home_id, agent_id, pickup_location, delivery_location, scheduled_time, distance, weight, price, documents, pickup_lat, pickup_lng, drop_lat, drop_lng, transferName, pickup_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      funeral_home_id, JSON.stringify(agent_id), pickup_location, delivery_location, 
      scheduled_time, distance, weight, price, doc, pick_lat, pick_long, drop_lat, drop_long, transferName, pickup_type
    ]);

    sendSuccessResponse(res, 201, { id: result.insertId }, 'Transfer created successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error creating transfer', err.message);
  }
};

// Get all transfers
exports.getAllTransfers = async (req, res) => {
  const { 
    status, funeral_home_id, agent_id, pickup_location, delivery_location, 
    start_date, end_date, isUpcoming 
  } = req.query;

  let query = 'SELECT * FROM transfers WHERE 1=1'; // Default clause to append conditions
  const queryParams = [];
  
  
  // Conditionally add filters
  if (status && status !== "null") {
    query += ' AND status = ?';
    queryParams.push(status);
  }
  if (funeral_home_id) {
    query += ' AND funeral_home_id = ?';
    queryParams.push(funeral_home_id);
  }
  if (agent_id && agent_id !== "all") {
    // Ensure that the query works for both single and multi-agent cases
    query += ` AND (JSON_CONTAINS(agent_id, ?, '$') OR (agent_id = ? AND JSON_TYPE(agent_id) = 'ARRAY'))`;
    queryParams.push(agent_id,agent_id);  // JSON_CONTAINS expects a JSON formatted string
} else if (agent_id === "all") {
    // If 'all' is specified, we are checking for any non-null, non-empty agent IDs
    query += ' AND (JSON_LENGTH(agent_id) > 0 OR agent_id IS NOT NULL)';
}

  
  
  if (pickup_location) {
    query += ' AND pickup_location LIKE ?';
    queryParams.push(`%${pickup_location}%`);
  }
  if (delivery_location) {
    query += ' AND delivery_location LIKE ?';
    queryParams.push(`%${delivery_location}%`);
  }
  if (start_date && end_date) {
    query += ' AND created_at BETWEEN ? AND ?';
    queryParams.push(start_date, end_date);
  } else if (start_date) {
    query += ' AND created_at >= ?';
    queryParams.push(start_date);
  } else if (end_date) {
    query += ' AND created_at <= ?';
    queryParams.push(end_date);
  }
  if (isUpcoming === "true") {
    query += ' AND scheduled_time > NOW()';
  }

  query += ' ORDER BY created_at DESC';
  console.log('Query:', query);
  console.log('Params:', queryParams);
  try {
    const results = await executeQuery(query, queryParams);
    sendSuccessResponse(res, 200, results, 'Retrieved all transfers');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Get a transfer by ID
exports.getTransferById = async (req, res) => {
  const { id } = req.query;

  try {
    const result = await executeQuery('SELECT * FROM transfers WHERE id = ?', [id]);
    if (result.length === 0) return sendErrorResponse(res, 404, 'Transfer not found');
    sendSuccessResponse(res, 200, result[0], 'Retrieved transfer');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Get transfers by Funeral Home ID
exports.getTransferByFuneralHomeId = async (req, res) => {
  const { id, status } = req.query;

  let query = 'SELECT * FROM transfers WHERE funeral_home_id = ?';
  const queryParams = [id];

  if (status) {
    query += ' AND status = ?';
    queryParams.push(status);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const results = await executeQuery(query, queryParams);
    sendSuccessResponse(res, 200, results, 'Retrieved transfers');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Update transfer details
exports.updateTransfer = async (req, res) => {
  const { id } = req.query;
  const { agent_id, pickup_location, delivery_location, scheduled_time, status, distance, weight, price, compliances } = req.body;

  const fieldsToUpdate = [];
  const values = [];

  if (agent_id !== undefined) {
    fieldsToUpdate.push('agent_id = ?');
    values.push(JSON.stringify(agent_id));
  }
  if (pickup_location !== undefined) {
    fieldsToUpdate.push('pickup_location = ?');
    values.push(pickup_location);
  }
  if (delivery_location !== undefined) {
    fieldsToUpdate.push('delivery_location = ?');
    values.push(delivery_location);
  }
  if (scheduled_time !== undefined) {
    fieldsToUpdate.push('scheduled_time = ?');
    values.push(scheduled_time);
  }
  if (status !== undefined) {
    fieldsToUpdate.push('status = ?');
    values.push(status);
  }
  if (distance !== undefined) {
    fieldsToUpdate.push('distance = ?');
    values.push(distance);
  }
  if (weight !== undefined) {
    fieldsToUpdate.push('weight = ?');
    values.push(weight);
  }
  if (price !== undefined) {
    fieldsToUpdate.push('price = ?');
    values.push(price);
  }
  if (compliances !== undefined) {
    fieldsToUpdate.push('compliances = ?');
    values.push(compliances);
  }

  if (fieldsToUpdate.length === 0) {
    return sendErrorResponse(res, 400, 'No fields to update');
  }

  values.push(id);
  const query = `UPDATE transfers SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  try {
    const result = await executeQuery(query, values);
    if (result.affectedRows === 0) return sendErrorResponse(res, 404, 'Transfer not found');
    sendSuccessResponse(res, 200, null, 'Transfer updated successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error updating transfer', err.message);
  }
};

// Delete a transfer
exports.deleteTransfer = async (req, res) => {
  const { id } = req.query;

  try {
    const result = await executeQuery('DELETE FROM transfers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return sendErrorResponse(res, 404, 'Transfer not found');
    sendSuccessResponse(res, 200, null, 'Transfer deleted successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error deleting transfer', err.message);
  }
};
