const express = require('express');
const router = express.Router();
const {
  createDailyWork, getDailyWorks, getDailyWork, updateDailyWork, reviewDailyWork, deleteDailyWork,
} = require('../controllers/dailyWorkController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').post(createDailyWork).get(getDailyWorks);
router.route('/:id').get(getDailyWork).put(updateDailyWork).delete(authorize('admin'), deleteDailyWork);
router.put('/:id/review', authorize('admin'), reviewDailyWork);

module.exports = router;
