const express = require('express');
const router = express.Router();
const {
  createPayment, getPayments, getPayment, updatePayment, deletePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').post(authorize('admin'), createPayment).get(getPayments); // employees see limited fields (enforced in controller)
router.route('/:id').get(getPayment).put(authorize('admin'), updatePayment).delete(authorize('admin'), deletePayment);

module.exports = router;
