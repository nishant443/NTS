const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['Payment Reminder', 'Follow-up Reminder', 'Due Date', 'New Work Submission', 'General'],
      default: 'General',
    },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
