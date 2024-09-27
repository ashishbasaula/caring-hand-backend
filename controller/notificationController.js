const axios = require('axios');
const db = require('../models/db');  // Database connection
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');

// OneSignal API keys (Store them securely in environment variables)
const ONE_SIGNAL_APP_ID ='4e5708fc-8ef6-4c66-98de-afacae6a1c69';
const ONE_SIGNAL_REST_API_KEY ='ZTIyODVlYWQtZTdkZS00OGQwLTk3NzEtZjYwY2Q4YWZlOWU3';

// Function to send notification via OneSignal
const sendNotification = (title, message, tokens, callback) => {
  console.log(tokens);
  const url = 'https://onesignal.com/api/v1/notifications';
  
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Basic ${ONE_SIGNAL_REST_API_KEY}`
  };

  const data = {
    app_id: ONE_SIGNAL_APP_ID,
    contents: { "en": message },
    headings: { "en": title },
    include_player_ids: tokens,
  };

  axios.post(url, data, { headers })
    .then((response) => {
      console.log('Notification sent successfully:', response.data);
      callback(null, response.data);
    })
    .catch((error) => {
      console.error('Error sending notification:', error.message);
      callback(new Error('Failed to send notification'));
    });
};

// Function to store notification in the database
const postNotification = (user_id, title, message, notification_type = 'info') => {
  return new Promise((resolve, reject) => {
    if (!user_id || !title || !message) {
      return reject(new Error('User ID, title, and message are required'));
    }

    const query = `INSERT INTO notifications (user_id, title, message, notification_type) 
                   VALUES (?, ?, ?, ?)`;
    const values = [user_id, title, message, notification_type];

    db.query(query, values, (err, result) => {
      if (err) {
        return reject(new Error('Error posting notification: ' + err.message));
      }
      resolve(result.insertId);
    });
  });
};

// API to retrieve notifications for a specific user
const getNotifications = (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return sendErrorResponse(res, 400, 'User ID is required');
  }

  const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Error retrieving notifications', err.message);
    }

    if (results.length === 0) {
      return sendSuccessResponse(res, 200, [], 'No notifications found');
    }

    return sendSuccessResponse(res, 200, results, 'Notifications retrieved successfully');
  });
};

// Function to send and store notification
const postAndSendNotification = (req, res) => {
  const { user_id, title, message, notification_type = 'info' } = req.body;

  // Validate input
  if (!user_id || !title || !message) {
    return sendErrorResponse(res, 400, 'User ID, title, and message are required');
  }

  // Fetch the user's notification tokens
  const getUserTokensQuery = 'SELECT notification_tokens FROM users WHERE id = ?';
  
  db.query(getUserTokensQuery, [user_id], (err, result) => {
    if (err) {
      console.error('Error fetching user tokens:', err.message);
      return sendErrorResponse(res, 500, 'Error fetching user tokens');
    }

    if (!result || !result[0] || !result[0].notification_tokens) {
      return sendErrorResponse(res, 404, 'No notification tokens found for the user');
    }

    const tokens = JSON.parse(result[0].notification_tokens); // Parse JSON array of tokens
    if (tokens.length === 0) {
      return sendErrorResponse(res, 404, 'No tokens to send the notification to');
    }

    // Step 1: Send notification using OneSignal
    sendNotification(title, message, tokens, (err, response) => {
      if (err) {
        return sendErrorResponse(res, 500, err.message);
      }

      console.log('OneSignal notification sent:', response);

      // Step 2: Store the notification in the database
      postNotification(user_id, title, message, notification_type)
        .then((notificationId) => {
          console.log('Notification stored in DB with ID:', notificationId);
          return sendSuccessResponse(res, 200, { success: true, notificationId }, 'Notification sent and stored successfully');
        })
        .catch((err) => {
          console.error('Error storing notification:', err.message);
          return sendErrorResponse(res, 500, 'Error storing notification in the database');
        });
    });
  });
};

module.exports = {
  postAndSendNotification,
  getNotifications
};
