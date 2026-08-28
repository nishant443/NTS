const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: Number,
    price: Number,
    gst: Number,
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    date: { type: Date, default: Date.now },
    items: [quotationItemSchema],
    totalAmount: Number,
    status: { type: String, enum: ['Draft', 'Sent', 'Converted', 'Rejected'], default: 'Draft' },
    pdfUrl: String,
    convertedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);
