const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ErrorResponse = require('../utils/errorResponse');

// Configure Cloudinary using env variables.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

exports.uploadChatAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const fileBuffer = req.file.buffer;
    let resourceType = 'auto'; // Let cloudinary figure out if it's image, video (audio), or raw (pdf)
    
    // Explicit mappings based on mimetype if needed
    if (req.file.mimetype === 'application/pdf') {
      resourceType = 'image'; // PDFs are uploaded as images for rendering natively in Cloudinary
    } else if (req.file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses "video" resource_type for audio
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'aroundyou_chat',
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error details:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name
          });
          return next(new ErrorResponse(`File upload failed: ${error.message || 'Internal Error'}`, 500));
        }
        res.status(200).json({
          success: true,
          url: result.secure_url,
          format: result.format,
          type: result.resource_type
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);

  } catch (err) {
    next(err);
  }
};
