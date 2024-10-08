// controller/tagImageController.js

const { executeQuery } = require("../models/db");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/responseUtils");

 
// Create a new tag image
exports.createTagImage = async (req, res) => {
  const { transfer_id, imageUrl } = req.body;

  // Validate required fields
  if (!transfer_id || !imageUrl) {
    return sendErrorResponse(res, 400, 'Transfer ID and Image URL are required');
  }

  const query = 'INSERT INTO tagImages (transfer_id, imageUrl) VALUES (?, ?)';

  try {
    const results = await executeQuery(query, [transfer_id, imageUrl]);
    sendSuccessResponse(res, 201, { id: results.insertId }, 'Tag image created successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error creating tag image', err.message);
  }
};

// Retrieve all tag images by transfer_id
exports.getImagesByTransferId = async (req, res) => {
  const { transfer_id } = req.query;

  if (!transfer_id) {
    return sendErrorResponse(res, 400, 'Transfer ID is required');
  }

  const query = 'SELECT * FROM tagImages WHERE transfer_id = ?';

  try {
    const results = await executeQuery(query, [transfer_id]);
    if (results.length === 0) {
      return sendErrorResponse(res, 404, 'No images found for the given transfer ID');
    }
    sendSuccessResponse(res, 200, results, 'Images retrieved successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error retrieving tag images', err.message);
  }
};

// Update a tag image by ID
exports.updateTagImage = async (req, res) => {
  const { id } = req.query;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return sendErrorResponse(res, 400, 'Image URL is required');
  }

  const query = 'UPDATE tagImages SET imageUrl = ? WHERE id = ?';

  try {
    const results = await executeQuery(query, [imageUrl, id]);
    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Tag image not found');
    }
    sendSuccessResponse(res, 200, null, 'Tag image updated successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error updating tag image', err.message);
  }
};

// Delete a tag image by ID
exports.deleteTagImage = async (req, res) => {
  const { id } = req.query;

  const query = 'DELETE FROM tagImages WHERE id = ?';

  try {
    const results = await executeQuery(query, [id]);
    if (results.affectedRows === 0) {
      return sendErrorResponse(res, 404, 'Tag image not found');
    }
    sendSuccessResponse(res, 200, null, 'Tag image deleted successfully');
  } catch (err) {
    sendErrorResponse(res, 500, 'Error deleting tag image', err.message);
  }
};
