const asyncHandler = require('../middleware/asyncHandler');
const CompanyDocument = require('../models/CompanyDocument');
const cloudinary = require('cloudinary').v2;

// Upload company document
exports.uploadCompanyDocument = asyncHandler(async (req, res) => {
  const { documentType, name, description } = req.body;

  if (!documentType) {
    res.status(400);
    throw new Error('Document type is required');
  }

  if (!req.cloudinaryResult) {
    res.status(400);
    throw new Error('File upload to Cloudinary failed');
  }

  const doc = await CompanyDocument.create({
    documentType,
    name: name || req.file.originalname,
    description: description || '',
    fileUrl: req.cloudinaryResult.secure_url,
    cloudinaryPublicId: req.cloudinaryResult.public_id,
    uploadedBy: req.user.id,
  });

  res.status(201).json({ success: true, document: doc });
});

// Get all company documents
exports.getCompanyDocuments = asyncHandler(async (req, res) => {
  const documents = await CompanyDocument.find().sort('-createdAt').populate('uploadedBy', 'name');
  res.json({ success: true, count: documents.length, documents });
});

// Get document by type
exports.getCompanyDocumentsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const documents = await CompanyDocument.find({ documentType: type }).sort('-createdAt');
  res.json({ success: true, documents });
});

// Update company document
exports.updateCompanyDocument = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const doc = await CompanyDocument.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.json({ success: true, document: doc });
});

// Delete company document
exports.deleteCompanyDocument = asyncHandler(async (req, res) => {
  const doc = await CompanyDocument.findById(req.params.id);

  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Delete from Cloudinary
  if (doc.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
  }

  await CompanyDocument.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Document deleted successfully' });
});
