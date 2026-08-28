const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.route('/').post(createInvoice).get(getInvoices);
router.route('/:id').get(getInvoice).delete(deleteInvoice);

module.exports = router;
