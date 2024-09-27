const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models/db');
require('dotenv').config()
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');


const validRoles = ['admin', 'funeral_home', 'transport_agent'];

// user authentication 
exports.login = (req, res) => {
  const { email, password } = req.body;
   // Validate that all required fields are present
   if (!email ||  !password) {
    return sendErrorResponse(res, 400, 'All fields are required');
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send({ message: `Error:${err}` });
    if (results.length === 0) return res.status(404).send({ message: 'User not found' });

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return sendErrorResponse(res, 400, 'Invalid password');
    }

    const token = jwt.sign({ id: user.id,role: user.role }, process.env.SECRET_KEY, { expiresIn: '365d' });
    res.status(200).send({ token, user });
  });
};


// fetch user 
exports.getUsers = (req, res) => {
  const { id, role, status, name } = req.query; // Extract filters from query params

  let query = 'SELECT * FROM users WHERE 1 = 1'; // Default query, '1 = 1' ensures additional conditions can be appended easily
  let queryParams = [];

  // Add filters dynamically based on query parameters
  if (id) {
    query += ' AND id = ?';
    queryParams.push(id);
  }

  if (role) {
    query += ' AND role = ?';
    queryParams.push(role);
  }

  if (status) {
    query += ' AND status = ?';
    queryParams.push(status);
  }

  if (name) {
    query += ' AND name LIKE ?';
    queryParams.push(`%${name}%`); // Allow partial matching for name
  }

  db.query(query, queryParams, (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
    return sendSuccessResponse(res, 200, results, 'Users retrieved successfully');
  });
};

  //add user 
  exports.addUser = (req, res) => {
    const { name, role, email, phone, password } = req.body;
  
    // Validate that all required fields are present
    if (!name || !role || !email || !phone || !password) {
      return sendErrorResponse(res, 400, 'All fields are required');
    }
  
    // Validate that the role is one of the allowed enum values
    if (!validRoles.includes(role)) {
      return sendErrorResponse(res, 400, 'Invalid role. Allowed roles are admin, funeral_home, transport_agent');
    }
  
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
      if (results.length > 0) return sendErrorResponse(res, 400, 'User already exists');
  
      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 8);
  
      // Insert the user into the database
      const query = 'INSERT INTO users (name, role, email, phone, password) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [name, role, email, phone, hashedPassword], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Error adding user', err.message);
  
        return sendSuccessResponse(res, 201, { userId: results.insertId }, 'User created successfully');
      });
    });
  };
  // update user 
  exports.updateUser = (req, res) => {
    const { id } = req.query;
    const { name, email, phone } = req.body;
  
    if (!name && !email && !phone) {
      return res.status(400).send({ message: 'No fields to update' });
    }
  
    // Build the SQL query dynamically
    const fields = [];
    const values = [];
  
    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (phone) {
      fields.push('phone = ?');
      values.push(phone);
    }
  
    // If no fields are valid
    if (fields.length === 0) {
      return res.status(400).send({ message: 'No valid fields provided for update' });
    }
  
    // Append user ID to the values array
    values.push(id);
  
    // Construct the final query string
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  
  
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating user:', err.message);
        return res.status(500).send({ message: 'Error updating user', error: err.message });
      }
  
      res.status(200).send({ message: 'User updated successfully' });
    });
  };
  
  //delete user 
  exports.deleteUser = (req, res) => {
    const { id } = req.query;
 
    console.log(id);
    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).send({ message: 'Error deleting user' });
      res.status(200).send({ message: 'User deleted successfully' });
    });
  };
 

// Function to change user password
exports.changePassword = (req, res) => {
  const { userId } = req.query;
  const { old_password, new_password } = req.body;

  // Validate request
  if (!old_password || !new_password) {
    return sendErrorResponse(res, 400, 'Old and new passwords are required');
  }

  // Step 1: Fetch the user's current password hash from the database
  db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
    
    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    const currentPasswordHash = results[0].password;

    // Step 2: Compare the old password with the current password hash
    const isPasswordValid = bcrypt.compareSync(old_password, currentPasswordHash);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Old password is incorrect');
    }

    // Step 3: Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(new_password, salt);

    // Step 4: Update the password in the database
    db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPasswordHash, userId],
      (err, result) => {
        if (err) return sendErrorResponse(res, 500, 'Error updating password', err.message);

        if (result.affectedRows === 0) {
          return sendErrorResponse(res, 404, 'User not found');
        }

        // Step 5: Return success response
        sendSuccessResponse(res, 200, null, 'Password updated successfully');
      }
    );
  });
};

exports.addNotificationToken = (req, res) => {
  const { id } = req.query;  // User ID from query params
  const { token } = req.body; // New token from request body

  if (!id || !token) {
    return res.status(400).send({ message: 'User ID and token are required' });
  }

  // Step 1: Get the existing notification tokens for the user
  const getUserQuery = 'SELECT notification_tokens FROM users WHERE id = ?';
  
  db.query(getUserQuery, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).send({ message: 'Error fetching user', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Parse existing tokens (if any)
    let existingTokens = [];
    if (results[0].notification_tokens) {
      existingTokens = JSON.parse(results[0].notification_tokens);
    }

    // Step 2: Check if the token already exists
    if (existingTokens.includes(token)) {
      return res.status(200).send({ message: 'Token already exists' });
    }

    // Step 3: Add the new token to the array
    existingTokens.push(token);

    // Step 4: Update the user's notification_tokens field
    const updateQuery = 'UPDATE users SET notification_tokens = ? WHERE id = ?';
    db.query(updateQuery, [JSON.stringify(existingTokens), id], (err, updateResults) => {
      if (err) {
        console.error('Error updating notification tokens:', err.message);
        return res.status(500).send({ message: 'Error updating notification tokens', error: err.message });
      }

      res.status(200).send({ message: 'Notification token added successfully' });
    });
  });
};

  




  



