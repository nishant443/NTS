const asyncHandler = require('../middleware/asyncHandler');
const DailyWork = require('../models/DailyWork');

// Employees create their own report
exports.createDailyWork = asyncHandler(async (req, res) => {
  const work = await DailyWork.create({ ...req.body, employee: req.user.id });
  res.status(201).json({ success: true, work });
});

// Admin sees all, employee sees only their own
exports.getDailyWorks = asyncHandler(async (req, res) => {
  const { employeeId, date, startDate, endDate, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (req.user.role !== 'admin') {
    query.employee = req.user.id;
  } else if (employeeId) {
    query.employee = employeeId;
  }
  if (status) query.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lt = new Date(endDate);
  }

  const works = await DailyWork.find(query)
    .populate('employee', 'name email')
    .populate('customer', 'companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-date');
  const total = await DailyWork.countDocuments(query);
  res.json({ success: true, count: works.length, total, page: Number(page), works });
});

exports.getDailyWork = asyncHandler(async (req, res) => {
  const work = await DailyWork.findById(req.params.id).populate('employee', 'name email').populate('customer', 'companyName');
  if (!work) {
    res.status(404);
    throw new Error('Work report not found');
  }
  if (req.user.role !== 'admin' && String(work.employee._id) !== req.user.id) {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json({ success: true, work });
});

// Employee can edit their own pending report; Admin can edit any
exports.updateDailyWork = asyncHandler(async (req, res) => {
  const work = await DailyWork.findById(req.params.id);
  if (!work) {
    res.status(404);
    throw new Error('Work report not found');
  }
  if (req.user.role !== 'admin' && String(work.employee) !== req.user.id) {
    res.status(403);
    throw new Error('Forbidden');
  }
  Object.assign(work, req.body);
  await work.save();
  res.json({ success: true, work });
});

// Admin: approve/reject with comment
exports.reviewDailyWork = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body; // status: Completed | Cancelled
  const work = await DailyWork.findByIdAndUpdate(
    req.params.id,
    { status, adminComment },
    { new: true }
  );
  res.json({ success: true, work });
});

exports.deleteDailyWork = asyncHandler(async (req, res) => {
  await DailyWork.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Work report deleted' });
});
