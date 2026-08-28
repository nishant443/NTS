const asyncHandler = require('../middleware/asyncHandler');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const DailyWork = require('../models/DailyWork');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const Quotation = require('../models/Quotation');

// @desc Admin dashboard - full visibility
// @route GET /api/dashboard/admin
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalCustomers,
    pendingPaymentsAgg,
    receivedPaymentsAgg,
    totalRevenueAgg,
    todaysWorkReports,
    pendingFollowUps,
    activeEmployees,
    pendingQuotations,
  ] = await Promise.all([
    Customer.countDocuments(),
    Payment.aggregate([{ $match: { paymentStatus: { $in: ['Pending', 'Partial'] } } }, { $group: { _id: null, total: { $sum: '$balanceAmount' } } }]),
    Payment.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amountReceived' } } }]),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$invoiceAmount' } } }]),
    DailyWork.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
    FollowUp.countDocuments({ status: 'Open' }),
    User.countDocuments({ role: 'employee', isActive: true }),
    Quotation.countDocuments({ status: { $in: ['Draft', 'Sent'] } }),
  ]);

  // Monthly revenue - last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const monthlyRevenue = await Payment.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amountReceived' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const pendingVsPaid = await Payment.aggregate([
    { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$invoiceAmount' } } },
  ]);

  const employeeActivity = await DailyWork.aggregate([
    { $group: { _id: '$employee', reportCount: { $sum: 1 } } },
    { $sort: { reportCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employee' } },
    { $unwind: '$employee' },
    { $project: { reportCount: 1, 'employee.name': 1 } },
  ]);

  const customerGrowth = await Customer.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const recentPayments = await Payment.find().populate('customer', 'companyName').sort('-createdAt').limit(5);
  const recentWorkLogs = await DailyWork.find().populate('employee', 'name').populate('customer', 'companyName').sort('-createdAt').limit(5);
  const recentCustomers = await Customer.find().sort('-createdAt').limit(5);

  res.json({
    success: true,
    cards: {
      totalCustomers,
      pendingPayments: pendingPaymentsAgg[0]?.total || 0,
      receivedPayments: receivedPaymentsAgg[0]?.total || 0,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      todaysWorkReports,
      pendingFollowUps,
      activeEmployees,
      pendingQuotations,
    },
    graphs: {
      monthlyRevenue,
      pendingVsPaid,
      employeeActivity,
      customerGrowth,
    },
    latestActivity: {
      recentPayments,
      recentWorkLogs,
      recentCustomers,
    },
  });
});

// @desc Employee dashboard - scoped to self only
// @route GET /api/dashboard/employee
exports.getEmployeeDashboard = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todaysWork, pendingFollowUps, pendingPayments, assignedCustomers, latestActivities] = await Promise.all([
    DailyWork.countDocuments({ employee: req.user.id, date: { $gte: todayStart, $lte: todayEnd } }),
    FollowUp.countDocuments({ createdBy: req.user.id, status: 'Open' }),
    Payment.countDocuments({ paymentStatus: { $in: ['Pending', 'Partial'] } }), // employees see pending payments only
    Customer.countDocuments(), // TODO: scope to "assigned" customers once assignment field is added to Customer
    DailyWork.find({ employee: req.user.id }).sort('-createdAt').limit(5),
  ]);

  res.json({
    success: true,
    cards: {
      todaysWork,
      pendingFollowUps,
      pendingPayments,
      assignedCustomers,
    },
    latestActivities,
  });
});
