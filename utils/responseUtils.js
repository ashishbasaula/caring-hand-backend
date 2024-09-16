// responseUtil.js

const sendErrorResponse = (res, statusCode, message, details = null) => {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(details && { details })
      }
    });
  };
  
  const sendSuccessResponse = (res, statusCode, data, message = '') => {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  
  module.exports = {
    sendErrorResponse,
    sendSuccessResponse
  };
  