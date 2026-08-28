const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: Date,
    invoiceAmount: { type: Number, required: true },
    amountReceived: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Cancelled'], default: 'Pending' },
    paymentDueDate: Date,
    mode: { type: String, enum: ['Cheque', 'NEFT', 'RTGS', 'UPI', 'Cash'] },
    remarks: String,
    invoiceUpload: String,
    paymentScreenshot: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  this.balanceAmount = (this.invoiceAmount || 0) - (this.amountReceived || 0);
  if (this.paymentStatus === 'Cancelled') return next();
  if (this.balanceAmount <= 0) this.paymentStatus = 'Paid';
  else if (this.amountReceived > 0) this.paymentStatus = 'Partial';
  else this.paymentStatus = 'Pending';
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
