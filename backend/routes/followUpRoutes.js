const express = require('express');
const router = express.Router();
const { createFollowUp, getFollowUps, updateFollowUp, deleteFollowUp } = require('../controllers/followUpController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').post(createFollowUp).get(getFollowUps);
router.route('/:id').put(updateFollowUp).delete(authorize('admin'), deleteFollowUp);

module.exports = router;
