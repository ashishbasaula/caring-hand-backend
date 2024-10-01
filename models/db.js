const mysql = require('mysql2');

// Create a connection pool with optimized settings
const connection = mysql.createPool({
  host: '95.216.194.29',
  user: 'caring_hands',
  password: 'ashish54321',
  database: 'caring_hands',
  port: 3306,
  waitForConnections: true,  // Wait for a connection to be available
  connectionLimit: 20,       // Increase the connection limit
  queueLimit: 100,           // Limit the number of queued connections
  connectTimeout: 30000,     // Adjust timeout for new connections (30 seconds)
  enableKeepAlive: true,     // Enable keep-alive
  keepAliveInitialDelay: 10000, // Keep-alive initial delay (10 seconds)
  maxIdle: 10,               // Allow up to 10 idle connections
  idleTimeout: 60 * 1000,    // Close idle connections after 60 seconds
  ssl: {
    rejectUnauthorized: false // Disable SSL certificate verification
  }
});
// Function to handle queries with reconnection and retry logic
function executeQuery(query, params = [], retries = 3) {
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return reject(err);
      }

      conn.query(query, params, (err, results) => {
        conn.release();  // Always release the connection back to the pool

        if (err) {
          console.error('Query error:', err);
          // Retry the query if the connection was lost
          if ((err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') && retries > 0) {
            console.warn(`Reconnecting and retrying... Attempts left: ${retries - 1}`);
            return setTimeout(() => {
              resolve(executeQuery(query, params, retries - 1));
            }, 2000);  // Wait for 2 seconds before retrying
          }
          return reject(err);
        }

        resolve(results);  // Return the query result
      });
    });
  });
}

module.exports = {
  connection,
  executeQuery
};
