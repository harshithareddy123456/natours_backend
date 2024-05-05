const mongoose = require('mongoose');
const Tour = require('../models/tourmodel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name',
  });
  next();
});

ReviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$Tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

ReviewSchema.post('save', function () {
  //this points to current review
  this.constructor.calculateAverageRatings(this.tour);
  //next();
});

//findByidandupdate
//findbyidanddelete
// ReviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = null; // Initialize _r property to store the document
//   this.r = await this.findOne(); // Save the query result to this.r
//   next();
// });

// ReviewSchema.post(/^findOneAnd/, async function (doc, next) {
//   if (this.r) {
//     await this.r.constructor.calcAverageRatings(this.r.tour);
//   }
//   next();
// });

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
