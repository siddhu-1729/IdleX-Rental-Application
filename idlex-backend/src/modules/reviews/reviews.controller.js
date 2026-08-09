const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Review = require('../../models/Review');
const Booking = require('../../models/Booking');
const Listing = require('../../models/Listing');
const { logAudit } = require('../../utils/audit');

// Create, only if booking is completed.
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.renter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the renter on this booking can leave a review');
  }
  if (booking.status !== 'completed' && booking.status !== 'return_requested') {
    throw ApiError.badRequest('Can only review a completed booking or one where a return is in progress');
  }

  const review = await Review.create({
    booking: booking._id,
    listing: booking.listing,
    reviewer: req.user._id,
    rating,
    comment,
  }).catch((err) => {
    if (err.code === 11000) throw ApiError.conflict('You already reviewed this booking');
    throw err;
  });

  // Denormalized average rating on Listing, recomputed via aggregation —
  // same choice the Django doc offers as the "high read volume" option.
  const stats = await Review.aggregate([
    { $match: { listing: booking.listing } },
    { $group: { _id: '$listing', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Listing.findByIdAndUpdate(booking.listing, {
      ratingAvg: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }

  logAudit({
    actor: req.user._id,
    action: 'review.created',
    category: 'review',
    resourceType: 'review',
    resourceId: review._id.toString(),
    summary: `Left a ${rating}-star review`,
    details: { booking: booking._id, listing: booking.listing },
    req,
  });
  return new ApiResponse(201, review, 'Review created').send(res);
});

// ReviewList for a product page.
const listListingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ listing: req.params.id })
    .sort('-createdAt')
    .populate('reviewer', 'name avatarUrl');
  return new ApiResponse(200, reviews, 'Listing reviews').send(res);
});

// Reviews created by the signed-in user — lets the app mark which
// bookings have already been reviewed.
const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user._id })
    .sort('-createdAt')
    .populate('listing', 'title _id');
  return new ApiResponse(200, reviews, 'My reviews').send(res);
});

module.exports = { createReview, listListingReviews, myReviews };
