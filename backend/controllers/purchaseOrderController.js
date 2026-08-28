const asyncHandler = require('../middleware/asyncHandler');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.createPO = asyncHandler(async (req, res) => {
  const count = await PurchaseOrder.countDocuments();
  const totalAmount = (req.body.items || []).reduce(
    (sum, i) => sum + i.quantity * i.price * (1 + (i.gst || 0) / 100),
    0
  );
  const po = await PurchaseOrder.create({
    ...req.body,
    poNumber: `PO-${String(count + 1).padStart(5, '0')}`,
    totalAmount,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, po });
});

exports.getPOs = asyncHandler(async (req, res) => {
  const pos = await PurchaseOrder.find().sort('-createdAt');
  res.json({ success: true, count: pos.length, pos });
});

exports.getPO = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) {
    res.status(404);
    throw new Error('Purchase order not found');
  }
  res.json({ success: true, po });
});

exports.updatePO = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, po });
});

exports.deletePO = asyncHandler(async (req, res) => {
  await PurchaseOrder.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Purchase order deleted' });
});
