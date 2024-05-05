const express = require('express');

const {
  getallreview,
  getareview,
  addreview,
  deletereview,
  updatereview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });
router.use(protect);
router.route('/').get(getallreview).post(restrictTo('user'), addreview);
router
  .route('/:id')
  .get(getareview)
  .delete(restrictTo('user'), deletereview)
  .patch(restrictTo('user'), updatereview);

module.exports = router;
