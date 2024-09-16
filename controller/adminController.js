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
    db.query('SELECT * FROM users', (err, results) => {
      if (err) return sendErrorResponse(res, 500, 'Server error', err.message);
      return sendSuccessResponse(res, 200, results);
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
  

  




  



