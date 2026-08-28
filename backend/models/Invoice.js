const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    type: { type: String, enum: ['Tax Invoice', 'Proforma Invoice'], default: 'Tax Invoice' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    date: { type: Date, default: Date.now },
    amount: Number,
    pdfUpload: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
