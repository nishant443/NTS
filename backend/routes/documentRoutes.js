const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
    }
  }
});

// Middleware to upload file to Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'auto',
      folder: 'nts-erp/documents',
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    },
    (error, result) => {
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      req.cloudinaryResult = result;
      next();
    }
  );

  // Convert buffer to stream
  const stream = Readable.from(req.file.buffer);
  stream.pipe(uploadStream);
};

router.use(protect);
router.post('/', authorize('admin'), upload.single('file'), uploadToCloudinary, uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', authorize('admin'), deleteDocument);

module.exports = router;
