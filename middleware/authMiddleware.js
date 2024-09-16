const jwt = require('jsonwebtoken');
const { sendErrorResponse } = require('../utils/responseUtils');
 
require('dotenv').config()
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendErrorResponse(res, 401, 'Access denied. No token provided.');
    }
  
    const token = authHeader.split(' ')[1];  // Extract token from 'Bearer <token>'
  
    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied. Token missing.');
    }
  
    // Verify token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err.message);  // Log the error
        return sendErrorResponse(res, 403, 'Invalid token');
      }
      console.log('Token verified, decoded payload:', decoded);  // Log the decoded token info
      req.user = decoded;
      next();
    });
  };
  

module.exports = authenticateToken;
