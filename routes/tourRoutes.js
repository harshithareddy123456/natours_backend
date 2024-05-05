const express = require('express');
const fs = require('fs');
const {
  gettours,
  aliaToptours,
  gettour,
  posttour,
  updatetour,
  deletetour,
  Tourstats,
  monthlyPlan,
  toursnearby,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
// const {
//   getallreview,
//   getareview,
//   addreview,
// } = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();
router.use('/:id/reviews', reviewRouter);
router.route('/top-5-cheap').get(aliaToptours, gettours);
router.route('/tour-stats').get(Tourstats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), monthlyPlan);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursnearby);
// router.route('/:latlng/unit/:unit', getdistances).get(toursnearby);
router
  .route('/')
  .get(gettours)
  .post(protect, restrictTo('admin', 'lead-guide'), posttour);
router
  .route('/:id')
  .get(gettour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updatetour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deletetour);

// router
//   .route('/:id/reviews')
//   .get(restrictTo('user'), getallreview)
//   .post(protect, restrictTo('user'), addreview);
// router.route(':id/reviews/:reviewid').get(getareview);

module.exports = router;
