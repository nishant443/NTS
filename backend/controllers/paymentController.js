const asyncHandler = require('../middleware/asyncHandler');
const Payment = require('../models/Payment');

// Employee-safe projection: hide revenue-sensitive fields
const EMPLOYEE_FIELDS = 'customer invoiceNumber balanceAmount paymentDueDate paymentStatus';

exports.createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, payment });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const { status, customerId, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.paymentStatus = status;
  if (customerId) query.customer = customerId;
  if (req.user.role !== 'admin') query.paymentStatus = { $in: ['Pending', 'Partial'] };

  let queryBuilder = Payment.find(query)
    .populate('customer', 'companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');

  if (req.user.role !== 'admin') {
    queryBuilder = queryBuilder.select(EMPLOYEE_FIELDS);
  }

  const payments = await queryBuilder;
  const total = await Payment.countDocuments(query);
  res.json({ success: true, count: payments.length, total, page: Number(page), payments });
});

exports.getPayment = asyncHandler(async (req, res) => {
  let queryBuilder = Payment.findById(req.params.id).populate('customer', 'companyName');
  if (req.user.role !== 'admin') queryBuilder = queryBuilder.select(EMPLOYEE_FIELDS);
  const payment = await queryBuilder;
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  res.json({ success: true, payment });
});

// Admin only (enforced by route middleware too)
exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  Object.assign(payment, req.body);
  await payment.save(); // triggers pre-save balance/status recalculation
  res.json({ success: true, payment });
});

exports.deletePayment = asyncHandler(async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Payment deleted' });
});
