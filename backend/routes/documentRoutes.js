const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

// Local disk storage by default; swap for Cloudinary storage engine if CLOUDINARY_* env vars are set
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);
router.post('/', authorize('admin'), upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', authorize('admin'), deleteDocument);

module.exports = router;
