// controller/reportController.js
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const db = require('../models/db');

exports.getSummaryReport = (req, res) => {
  const { funeral_home_id, agent_id, period } = req.query;

  // Determine the query and parameters based on whether funeral_home_id, agent_id, or neither is passed
  let query, queryParams;

  // Define the base query, which will be extended based on the context
  let baseQuery = `
    SELECT 
      COUNT(*) AS total_transfers,
      SUM(price) AS total_price,
  `;

  // Add period groupings based on the requested period
  switch (period) {
    case 'weekly':
      baseQuery += `WEEK(created_at) AS period `;
      break;

    case 'monthly':
      baseQuery += `MONTH(created_at) AS period `;
      break;

    case 'yearly':
      baseQuery += `YEAR(created_at) AS period `;
      break;

    case 'hourly':
      baseQuery += `HOUR(created_at) AS period `;
      break;

    case 'daily':
    default:
      baseQuery += `DATE(created_at) AS period `;
      break;
  }

  baseQuery += `FROM transfers WHERE `; // Start the WHERE clause

  // Determine which condition to apply based on the input
  if (funeral_home_id) {
    // If funeral_home_id is passed, fetch report for the funeral home
    query = baseQuery + `funeral_home_id = ? `;
    queryParams = [funeral_home_id];
  } else if (agent_id) {
    // If agent_id is passed, fetch report for the transport agent
    query = baseQuery + `agent_id = ? `;
    queryParams = [agent_id];
  } else {
    // If neither funeral_home_id nor agent_id is passed, fetch report for the admin (all transfers)
    query = baseQuery + `1=1 `; // 1=1 means no specific condition (select all records)
    queryParams = [];
  }

  // Add date filtering based on the period
  switch (period) {
    case 'weekly':
      query += `AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() GROUP BY WEEK(created_at)`;
      break;
    case 'monthly':
      query += `AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE() GROUP BY MONTH(created_at)`;
      break;
    case 'yearly':
      query += `AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND CURDATE() GROUP BY YEAR(created_at)`;
      break;
    case 'hourly':
      query += `AND created_at BETWEEN CURDATE() AND NOW() GROUP BY HOUR(created_at) ORDER BY HOUR(created_at)`;
      break;
    case 'daily':
    default:
      query += `AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND CURDATE() GROUP BY DATE(created_at)`;
      break;
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
    sendSuccessResponse(res, 200, results, 'Summary report retrieved successfully');
  });
};
