const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '95.216.194.29',  
  user: 'caring_hands',    
  password: 'ashish54321',  
  database: 'caring_hands',  
  port: 3306,
  connectTimeout:60000,               
  ssl: {
    rejectUnauthorized: false 
  }
});

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '', // your MySQL root password if any
//   database: 'caring_hands'
// });


// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Export the connection for use in other parts of your application
module.exports = connection;
