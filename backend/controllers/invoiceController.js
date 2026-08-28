const asyncHandler = require('../middleware/asyncHandler');
const Invoice = require('../models/Invoice');

exports.createInvoice = asyncHandler(async (req, res) => {
  const count = await Invoice.countDocuments();
  const invoice = await Invoice.create({
    ...req.body,
    invoiceNumber: `INV-${String(count + 1).padStart(5, '0')}`,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, invoice });
});

exports.getInvoices = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = search ? { invoiceNumber: new RegExp(search, 'i') } : {};
  const invoices = await Invoice.find(query)
    .populate('customer', 'companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
  res.json({ success: true, count: invoices.length, invoices });
});

exports.getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer');
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  res.json({ success: true, invoice });
});

exports.deleteInvoice = asyncHandler(async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Invoice deleted' });
});
