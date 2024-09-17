const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');

// Create an uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp as filename
    }
});

// Configure multer for single file upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB
}).single('file');

// Controller function for file upload
exports.uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return sendErrorResponse(res, 500, 'Multer error occurred during upload', err.message);
        } else if (err) {
            return sendErrorResponse(res, 500, 'Error occurred during upload', err.message);
        }

        if (!req.file) {
            return sendErrorResponse(res, 400, 'No file uploaded');
        }

        // File uploaded successfully, return file URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        sendSuccessResponse(res, 201, { fileUrl }, 'File uploaded successfully');
    });
};
