const asyncHandler = require('../middleware/asyncHandler');
const Document = require('../models/Document');

// Actual file storage: wire up multer (local /uploads) or Cloudinary in routes/documents.js
exports.uploadDocument = asyncHandler(async (req, res) => {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
  if (!fileUrl) {
    res.status(400);
    throw new Error('No file provided');
  }
  const doc = await Document.create({
    ...req.body,
    fileUrl,
    uploadedBy: req.user.id,
  });
  res.status(201).json({ success: true, document: doc });
});

exports.getDocuments = asyncHandler(async (req, res) => {
  const { customerId, category } = req.query;
  const query = {};
  if (customerId) query.customer = customerId;
  if (category) query.category = category;
  const documents = await Document.find(query).sort('-createdAt');
  res.json({ success: true, count: documents.length, documents });
});

exports.deleteDocument = asyncHandler(async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Document deleted' });
});
