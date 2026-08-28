const express = require('express');
const router = express.Router();
const {
  createQuotation, getQuotations, getQuotation, sendQuotationEmail, convertToInvoice, deleteQuotation,
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin')); // quotations are admin-only in this scope

router.route('/').post(createQuotation).get(getQuotations);
router.route('/:id').get(getQuotation).delete(deleteQuotation);
router.post('/:id/send-email', sendQuotationEmail);
router.post('/:id/convert-to-invoice', convertToInvoice);

module.exports = router;
