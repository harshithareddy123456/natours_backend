const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewmodel');
const { deleteOne, updateOne } = require('./handlersfactory');

const getallreview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) filter = { tours: req.params.id };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

const getareview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const addreview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const updatereview = updateOne(Review);
const deletereview = deleteOne(Review);
module.exports = {
  getallreview,
  getareview,
  addreview,
  deletereview,
  updatereview,
};
