const asyncHandler = require('../middleware/asyncHandler');
const FollowUp = require('../models/FollowUp');

exports.createFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, followUp });
});

exports.getFollowUps = asyncHandler(async (req, res) => {
  const { paymentId, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (paymentId) query.payment = paymentId;
  if (status) query.status = status;

  const followUps = await FollowUp.find(query)
    .populate('customer', 'companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-date');
  const total = await FollowUp.countDocuments(query);
  res.json({ success: true, count: followUps.length, total, followUps });
});

exports.updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, followUp });
});

exports.deleteFollowUp = asyncHandler(async (req, res) => {
  await FollowUp.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Follow-up deleted' });
});
