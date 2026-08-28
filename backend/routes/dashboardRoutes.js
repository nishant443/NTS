const express = require('express');
const router = express.Router();
const { getAdminDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/employee', getEmployeeDashboard);

module.exports = router;
