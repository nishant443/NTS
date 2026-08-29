const asyncHandler = require('../middleware/asyncHandler');
const Document = require('../models/Document');
const cloudinary = require('cloudinary').v2;

// Upload document to Cloudinary
exports.uploadDocument = asyncHandler(async (req, res) => {
  const { customer, category, name } = req.body;

  if (!customer) {
    res.status(400);
    throw new Error('Customer ID is required');
  }

  if (!req.cloudinaryResult) {
    res.status(400);
    throw new Error('File upload to Cloudinary failed');
  }

  const doc = await Document.create({
    customer,
    category: category || 'Other',
    name: name || req.file.originalname,
    fileUrl: req.cloudinaryResult.secure_url,
    cloudinaryPublicId: req.cloudinaryResult.public_id,
    uploadedBy: req.user.id,
  });

  res.status(201).json({ success: true, document: doc });
});

// Get documents with filters
exports.getDocuments = asyncHandler(async (req, res) => {
  const { customerId, category } = req.query;
  const query = {};
  if (customerId) query.customer = customerId;
  if (category) query.category = category;
  const documents = await Document.find(query).sort('-createdAt').populate('customer', 'companyName');
  res.json({ success: true, count: documents.length, documents });
});

// Delete document from Cloudinary and database
exports.deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Delete from Cloudinary if public ID exists
  if (doc.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
  }

  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Document deleted successfully' });
});
