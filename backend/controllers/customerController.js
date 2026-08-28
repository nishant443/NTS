const asyncHandler = require('../middleware/asyncHandler');
const Customer = require('../models/Customer');

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, customer });
});

exports.getCustomers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const customers = await Customer.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
  const total = await Customer.countDocuments(query);
  res.json({ success: true, count: customers.length, total, page: Number(page), customers });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  res.json({ success: true, customer });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, customer });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});

// @desc Bulk delete
exports.bulkDeleteCustomers = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await Customer.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, message: `${ids.length} customers deleted` });
});
