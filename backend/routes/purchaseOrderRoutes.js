const express = require('express');
const router = express.Router();
const { createPO, getPOs, getPO, updatePO, deletePO } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.route('/').post(createPO).get(getPOs);
router.route('/:id').get(getPO).put(updatePO).delete(deletePO);

module.exports = router;
