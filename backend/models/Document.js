const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    category: {
      type: String,
      enum: ['GST Certificate', 'PAN', 'Purchase Order', 'Invoice', 'Payment Receipt', 'Warranty', 'AMC', 'Service Report', 'Other'],
      default: 'Other',
    },
    name: String,
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: String, // Store public ID for deletion
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
