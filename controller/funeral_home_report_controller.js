const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const { executeQuery } = require('../models/db');

exports.getSummaryReport = async (req, res) => {
  const { funeral_home_id, agent_id, period } = req.query;

  // Base query to fetch the total transfers and price
  let baseQuery = `
    SELECT 
      COUNT(*) AS total_transfers,
      SUM(price) AS total_price,
  `;

  // Define the period column based on the requested period
  let periodColumn = '';
  switch (period) {
    case 'weekly':
      periodColumn = 'WEEK(created_at) AS period';
      break;
    case 'monthly':
      periodColumn = 'MONTH(created_at) AS period';
      break;
    case 'yearly':
      periodColumn = 'YEAR(created_at) AS period';
      break;
    case 'hourly':
      periodColumn = 'HOUR(created_at) AS period';
      break;
    case 'daily':
    default:
      periodColumn = 'DATE(created_at) AS period';
      break;
  }

  baseQuery += `${periodColumn} FROM transfers WHERE `;

  // Define query parameters for filtering by funeral_home_id or agent_id
  let query = '', queryParams = [];

  if (funeral_home_id) {
    query = baseQuery + 'funeral_home_id = ? ';
    queryParams.push(funeral_home_id);
  } else if (agent_id) {
    query = baseQuery + 'agent_id = ? ';
    queryParams.push(agent_id);
  } else {
    query = baseQuery + '1=1 '; // No specific condition, fetch all records
  }

  // Add date range and group by clause based on the requested period
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
      query += `AND created_at >= CURDATE() GROUP BY HOUR(created_at) ORDER BY HOUR(created_at)`;
      break;
    case 'daily':
    default:
      query += `AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND CURDATE() GROUP BY DATE(created_at)`;
      break;
  }

  try {
    // Execute the query
    const results = await executeQuery(query, queryParams);

    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'No records found for the specified period');
    }

    // Send success response with the report data
    sendSuccessResponse(res, 200, results, 'Summary report retrieved successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Server error', err.message);
  }
};
