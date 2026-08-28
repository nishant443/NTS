const mongoose = require('mongoose');

const dailyWorkSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    companyVisited: String,
    location: String,
    purposeOfVisit: String,
    workDescription: String,
    productsDiscussed: String,
    servicePerformed: String,
    hoursWorked: Number,
    startTime: String,
    endTime: String,
    travelDistance: Number,
    expense: Number,
    remarks: String,
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    attachments: [{ url: String, type: String, name: String }],
    adminComment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyWork', dailyWorkSchema);
