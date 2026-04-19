const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadChatAttachment } = require('../controllers/uploadController');

// Secure in-memory storage for Cloudinary streaming integration
const storage = multer.memoryStorage();

// File filter strictly rejecting dangerous or unsupported formats
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'audio/webm', 'audio/wav', 'audio/mpeg', 'audio/ogg'
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB strict limit for prod chat attachments
});

// Single endpoint for attachments
router.post('/attachment', protect, upload.single('file'), uploadChatAttachment);

module.exports = router;
