const mongoose = require('mongoose');

const companyDocumentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: ['GST Certificate', 'PAN Card', 'MSME Certificate', 'Cheque', 'Bank Details', 'Company Profile', 'License', 'Registration', 'Other'],
      required: true,
    },
    name: String,
    description: String,
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyDocument', companyDocumentSchema);
