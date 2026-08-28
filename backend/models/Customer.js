const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    contactPerson: String,
    designation: String,
    email: String,
    phone: String,
    alternatePhone: String,
    website: String,
    industry: String,
    remarks: String,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Lead', 'Customer', 'Vendor'],
      default: 'Lead',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

customerSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
