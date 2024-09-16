const { sendErrorResponse, sendSuccessResponse } = require("../utils/responseUtils");
const db = require('../models/db');
 

exports.createFormulaParameter = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return sendErrorResponse(res, 400, 'Name is required');
  }

  const query = 'INSERT INTO formula_parameters (name) VALUES (?)';
  db.query(query, [name], (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Error creating formula parameter', err.message);
    }
    sendSuccessResponse(res, 201, { id: results.insertId }, 'Formula parameter created successfully');
  });
};

exports.getAllFormulaParameters = (req, res) => {
  db.query('SELECT * FROM formula_parameters', (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Server error', err.message);
    }
    sendSuccessResponse(res, 200, results, 'Retrieved all formula parameters');
  });
};

exports.getFormulaParameterById = (req, res) => {
  const { id } = req.query;

  db.query('SELECT * FROM formula_parameters WHERE id = ?', [id], (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Server error', err.message);
    }
    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }
    sendSuccessResponse(res, 200, results[0], 'Retrieved formula parameter');
  });
};

exports.updateFormulaParameter = (req, res) => {
  const { id } = req.query;
  const { name } = req.body;

  if (!name) {
    return sendErrorResponse(res, 400, 'Name is required');
  }

  const query = 'UPDATE formula_parameters SET name = ? WHERE id = ?';
  db.query(query, [name, id], (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Error updating formula parameter', err.message);
    }
    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }
    sendSuccessResponse(res, 200, null, 'Formula parameter updated successfully');
  });
};

exports.deleteFormulaParameter = (req, res) => {
  const { id } = req.query;

  db.query('DELETE FROM formula_parameters WHERE id = ?', [id], (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Error deleting formula parameter', err.message);
    }
    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Formula parameter not found');
    }
    sendSuccessResponse(res, 200, null, 'Formula parameter deleted successfully');
  });
};
