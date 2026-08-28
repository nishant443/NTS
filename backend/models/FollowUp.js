const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    date: { type: Date, default: Date.now },
    time: String,
    personContacted: String,
    phone: String,
    email: String,
    discussion: String,
    nextFollowUpDate: Date,
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    reminder: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
