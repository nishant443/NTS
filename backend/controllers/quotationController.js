const asyncHandler = require('../middleware/asyncHandler');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');

const generateQuotationNumber = async () => {
  const count = await Quotation.countDocuments();
  return `QUO-${String(count + 1).padStart(5, '0')}`;
};

exports.createQuotation = asyncHandler(async (req, res) => {
  const quotationNumber = await generateQuotationNumber();
  const totalAmount = (req.body.items || []).reduce(
    (sum, i) => sum + i.quantity * i.price * (1 + (i.gst || 0) / 100),
    0
  );
  const quotation = await Quotation.create({
    ...req.body,
    quotationNumber,
    totalAmount,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, quotation });
});

exports.getQuotations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  const quotations = await Quotation.find(query)
    .populate('customer', 'companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
  res.json({ success: true, count: quotations.length, quotations });
});

exports.getQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id).populate('customer');
  if (!quotation) {
    res.status(404);
    throw new Error('Quotation not found');
  }
  res.json({ success: true, quotation });
});

// NOTE: PDF generation (e.g. via pdfkit) and email sending (Nodemailer) are wired here as TODOs
exports.sendQuotationEmail = asyncHandler(async (req, res) => {
  // TODO: integrate utils/sendEmail.js + PDF attachment
  res.json({ success: true, message: 'Quotation email sending not yet configured — add SMTP credentials in .env' });
});

// @desc Convert quotation into an invoice
exports.convertToInvoice = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    res.status(404);
    throw new Error('Quotation not found');
  }
  const count = await Invoice.countDocuments();
  const invoice = await Invoice.create({
    invoiceNumber: `INV-${String(count + 1).padStart(5, '0')}`,
    type: 'Tax Invoice',
    customer: quotation.customer,
    quotation: quotation._id,
    amount: quotation.totalAmount,
    createdBy: req.user.id,
  });
  quotation.status = 'Converted';
  quotation.convertedInvoice = invoice._id;
  await quotation.save();
  res.status(201).json({ success: true, invoice });
});

exports.deleteQuotation = asyncHandler(async (req, res) => {
  await Quotation.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Quotation deleted' });
});
