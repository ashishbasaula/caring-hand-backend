// controller/reportController.js
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const db = require('../models/db');

exports.getFuneralHomeSummaryReport = (req, res) => {
  const { funeral_home_id, period } = req.query;

  // Validate required fields
  if (!funeral_home_id) {
    return sendErrorResponse(res, 400, 'funeral_home_id is required');
  }

  // Define the query and parameters based on the selected period
  let query, queryParams;

  switch (period) {
    case 'weekly':
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          WEEK(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()
        GROUP BY WEEK(created_at)
      `;
      queryParams = [funeral_home_id];
      break;

    case 'monthly':
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          MONTH(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()
        GROUP BY MONTH(created_at)
      `;
      queryParams = [funeral_home_id];
      break;

    case 'yearly':
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          YEAR(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND CURDATE()
        GROUP BY YEAR(created_at)
      `;
      queryParams = [funeral_home_id];
      break;

    case 'hourly':
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          HOUR(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN CURDATE() AND NOW()
        GROUP BY HOUR(created_at)
        ORDER BY HOUR(created_at)
      `;
      queryParams = [funeral_home_id];
      break;

    case 'daily':
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          DATE(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND CURDATE()
        GROUP BY DATE(created_at)
      `;
      queryParams = [funeral_home_id];
      break;

    default:
      // Default to daily report
      query = `
        SELECT 
          COUNT(*) AS total_transfers,
          SUM(price) AS total_price,
          DATE(created_at) AS period
        FROM transfers 
        WHERE funeral_home_id = ?
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND CURDATE()
        GROUP BY DATE(created_at)
      `;
      queryParams = [funeral_home_id];
  }

  // Execute the query
  db.query(query, queryParams, (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Server error', err.message);
    }

    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'No records found for the specified period');
    }

    // Send success response with report summary data
    sendSuccessResponse(res, 200, results, 'Funeral home report summary retrieved successfully');
  });
};
