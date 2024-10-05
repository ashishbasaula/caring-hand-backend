const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
 
 
require('dotenv').config()
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const { executeQuery } = require('../models/db');

const validRoles = ['admin', 'funeral_home', 'transport_agent'];

// User authentication 
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Validate that all required fields are present
  if (!email || !password) {
    return sendErrorResponse(res, 400, 'All fields are required');
  }
  try {
    const results = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(404).send({ message: 'User not found' });

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return sendErrorResponse(res, 400, 'Invalid password');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '365d' });
    res.status(200).send({ token, user });
  } catch (err) {
    return res.status(500).send({ message: `Error:${err.message}` });
  }
};

// Fetch users
exports.getUsers = async (req, res) => {
  const { id, role, status, name } = req.query; // Extract filters from query params

  let query = 'SELECT * FROM users WHERE 1 = 1'; // Default query
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

  try {
    const results = await executeQuery(query, queryParams);
    return sendSuccessResponse(res, 200, results, 'Users retrieved successfully');
  } catch (err) {
    return sendErrorResponse(res, 500, 'Server error', err.message);
  }
};

// Add user
exports.addUser = async (req, res) => {
  const { name, role, email, phone, password } = req.body;

  // Validate that all required fields are present
  if (!name || !role || !email || !phone || !password) {
    return sendErrorResponse(res, 400, 'All fields are required');
  }

  // Validate that the role is one of the allowed enum values
  if (!validRoles.includes(role)) {
    return sendErrorResponse(res, 400, 'Invalid role. Allowed roles are admin, funeral_home, transport_agent');
  }

  try {
    const results = await  executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length > 0) return sendErrorResponse(res, 400, 'User already exists');

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert the user into the database
    const insertResult = await executeQuery(
      'INSERT INTO users (name, role, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [name, role, email, phone, hashedPassword]
    );

    return sendSuccessResponse(res, 201, { userId: insertResult.insertId }, 'User created successfully');
  } catch (err) {
    return sendErrorResponse(res, 500, 'Error adding user', err.message);
  }
};

// Update user
exports.updateUser = async (req, res) => {
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

  try {
    await db. executeQuery(query, values);
    res.status(200).send({ message: 'User updated successfully' });
  } catch (err) {
    return res.status(500).send({ message: 'Error updating user', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.query;
console.log(id);
  try {
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Error deleting user' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { userId } = req.query;
  const { old_password, new_password } = req.body;

  // Validate request
  if (!old_password || !new_password) {
    return sendErrorResponse(res, 400, 'Old and new passwords are required');
  }

  try {
    const results = await executeQuery('SELECT password FROM users WHERE id = ?', [userId]);
    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    const currentPasswordHash = results[0].password;

    // Compare the old password with the current password hash
    const isPasswordValid = bcrypt.compareSync(old_password, currentPasswordHash);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Old password is incorrect');
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(new_password, salt);

    // Update the password in the database
    await executeQuery('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, userId]);

    sendSuccessResponse(res, 200, null, 'Password updated successfully');
  } catch (err) {
    return sendErrorResponse(res, 500, 'Error updating password', err.message);
  }
};

// Add notification token
exports.addNotificationToken = async (req, res) => {
  const { id } = req.query; // User ID from query params
  const { token } = req.body; // New token from request body

  if (!id || !token) {
    return res.status(400).send({ message: 'User ID and token are required' });
  }

  try {
    // Get the existing notification tokens for the user
    const results = await executeQuery('SELECT notification_tokens FROM users WHERE id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Parse existing tokens (if any)
    let existingTokens = [];
    if (results[0].notification_tokens) {
      existingTokens = JSON.parse(results[0].notification_tokens);
    }

    // Check if the token already exists
    if (existingTokens.includes(token)) {
      return res.status(200).send({ message: 'Token already exists' });
    }

    // Add the new token to the array
    existingTokens.push(token);

    // Update the user's notification_tokens field
    await executeQuery('UPDATE users SET notification_tokens = ? WHERE id = ?', [JSON.stringify(existingTokens), id]);

    res.status(200).send({ message: 'Notification token added successfully' });
  } catch (err) {
    return res.status(500).send({ message: 'Error updating notification tokens', error: err.message });
  }
};
