const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const { executeQuery } = require('../models/db');

// Create new pricing parameter
exports.createPricingParameter = async (req, res) => {
  const { service_type, base_rate, mileage_rate, heavy_body_charge, decomposition_charge, leaking_fluids_charge, body_over_250lbs_charge } = req.body;

  if (!service_type || base_rate === undefined || mileage_rate === undefined) {
    return sendErrorResponse(res, 400, 'Missing required fields');
  }

  try {
    await executeQuery(
      'INSERT INTO pricing_parameters (service_type, base_rate, mileage_rate, heavy_body_charge, decomposition_charge, leaking_fluids_charge, body_over_250lbs_charge) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [service_type, base_rate, mileage_rate, heavy_body_charge, decomposition_charge, leaking_fluids_charge, body_over_250lbs_charge]
    );

    sendSuccessResponse(res, 201, null, 'Pricing parameter created successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Get all pricing parameters or a specific one by ID
exports.getPricingParameters = async (req, res) => {
  const { id } = req.query;

  let query = 'SELECT * FROM pricing_parameters';
  let queryParams = [];

  if (id) {
    query += ' WHERE id = ?';
    queryParams.push(id);
  }

  try {
    const results = await executeQuery(query, queryParams);

    if (results.length === 0) {
      return sendSuccessResponse(res, 200, results, 'Pricing parameter not found');
    }

    sendSuccessResponse(res, 200, results, 'Pricing parameters retrieved successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

// Update existing pricing parameter by ID
exports.updatePricingParameter = async (req, res) => {
  const { id } = req.query;  // Adjusted to `req.query` for query parameters
  const {
    service_type,
    base_rate,
    mileage_rate,
    heavy_body_charge,
    decomposition_charge,
    leaking_fluids_charge,
    body_over_250lbs_charge,
  } = req.body;

  if (!id) {
    return sendErrorResponse(res, 400, 'Pricing parameter ID is required');
  }

  // Collect fields to be updated
  const fieldsToUpdate = [];
  const values = [];

  if (service_type !== undefined) {
    fieldsToUpdate.push('service_type = ?');
    values.push(service_type);
  }
  if (base_rate !== undefined) {
    fieldsToUpdate.push('base_rate = ?');
    values.push(base_rate);
  }
  if (mileage_rate !== undefined) {
    fieldsToUpdate.push('mileage_rate = ?');
    values.push(mileage_rate);
  }
  if (heavy_body_charge !== undefined) {
    fieldsToUpdate.push('heavy_body_charge = ?');
    values.push(heavy_body_charge);
  }
  if (decomposition_charge !== undefined) {
    fieldsToUpdate.push('decomposition_charge = ?');
    values.push(decomposition_charge);
  }
  if (leaking_fluids_charge !== undefined) {
    fieldsToUpdate.push('leaking_fluids_charge = ?');
    values.push(leaking_fluids_charge);
  }
  if (body_over_250lbs_charge !== undefined) {
    fieldsToUpdate.push('body_over_250lbs_charge = ?');
    values.push(body_over_250lbs_charge);
  }

  // If there are no fields to update, return an error
  if (fieldsToUpdate.length === 0) {
    return sendErrorResponse(res, 400, 'No fields provided for update');
  }

  // Add `id` to the end of the values array for the WHERE clause
  values.push(id);

  // Construct the SQL query dynamically
  const query = `
    UPDATE pricing_parameters
    SET ${fieldsToUpdate.join(', ')}
    WHERE id = ?
  `;

  try {
    const result = await executeQuery(query, values);

    if (result.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Pricing parameter not found');
    }

    sendSuccessResponse(res, 200, null, 'Pricing parameter updated successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete a pricing parameter by ID
exports.deletePricingParameter = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return sendErrorResponse(res, 400, 'Pricing parameter ID is required');
  }

  try {
    const result = await executeQuery('DELETE FROM pricing_parameters WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Pricing parameter not found');
    }

    sendSuccessResponse(res, 200, null, 'Pricing parameter deleted successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};
