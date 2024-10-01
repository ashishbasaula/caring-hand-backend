const { sendErrorResponse, sendSuccessResponse } = require("../utils/responseUtils");
const { executeQuery } = require('../models/db');

// Create a new formula parameter
exports.createFormulaParameter = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return sendErrorResponse(res, 400, 'Name is required');
  }

  try {
    const query = 'INSERT INTO formula_parameters (name) VALUES (?)';
    const results = await executeQuery(query, [name]);
    sendSuccessResponse(res, 201, { id: results.insertId }, 'Formula parameter created successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error creating formula parameter', err.message);
  }
};

// Get all formula parameters
exports.getAllFormulaParameters = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM formula_parameters');
    sendSuccessResponse(res, 200, results, 'Retrieved all formula parameters');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Get a formula parameter by ID
exports.getFormulaParameterById = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return sendErrorResponse(res, 400, 'ID is required');
  }

  try {
    const results = await executeQuery('SELECT * FROM formula_parameters WHERE id = ?', [id]);
    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }
    sendSuccessResponse(res, 200, results[0], 'Retrieved formula parameter');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Update a formula parameter
exports.updateFormulaParameter = async (req, res) => {
  const { id } = req.query;
  const { name } = req.body;

  if (!id) {
    return sendErrorResponse(res, 400, 'ID is required');
  }

  if (!name) {
    return sendErrorResponse(res, 400, 'Name is required');
  }

  try {
    const query = 'UPDATE formula_parameters SET name = ? WHERE id = ?';
    const results = await executeQuery(query, [name, id]);

    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }

    sendSuccessResponse(res, 200, null, 'Formula parameter updated successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error updating formula parameter', err.message);
  }
};

// Delete a formula parameter
exports.deleteFormulaParameter = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return sendErrorResponse(res, 400, 'ID is required');
  }

  try {
    const query = 'DELETE FROM formula_parameters WHERE id = ?';
    const results = await executeQuery(query, [id]);

    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }

    sendSuccessResponse(res, 200, null, 'Formula parameter deleted successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error deleting formula parameter', err.message);
  }
};
