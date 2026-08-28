const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema(
  { description: String, quantity: Number, price: Number, gst: Number },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true, required: true },
    supplier: String,
    poDate: { type: Date, default: Date.now },
    items: [poItemSchema],
    totalAmount: Number,
    status: { type: String, enum: ['Draft', 'Ordered', 'Received', 'Cancelled'], default: 'Draft' },
    pdfUpload: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
