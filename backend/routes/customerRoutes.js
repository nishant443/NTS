const express = require('express');
const router = express.Router();
const {
  createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer, bulkDeleteCustomers,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').post(authorize('admin'), createCustomer).get(getCustomers); // employees can view customer list
router.post('/bulk-delete', authorize('admin'), bulkDeleteCustomers);
router.route('/:id').get(getCustomer).put(authorize('admin'), updateCustomer).delete(authorize('admin'), deleteCustomer);

module.exports = router;
