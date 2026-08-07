const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const Listing = require('../../models/Listing');
const Booking = require('../../models/Booking');
const Review = require('../../models/Review');

// Public marketplace stats — powers the dynamic numbers on the home page
// (active listings, happy renters, average rating) instead of static copy.
const getStats = asyncHandler(async (req, res) => {
  const [activeListings, happyRenters, ratingAgg] = await Promise.all([
    Listing.countDocuments({ status: 'published' }),
    Booking.distinct('renter', { status: { $in: ['confirmed', 'active', 'completed'] } }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  return new ApiResponse(
    200,
    {
      activeListings,
      happyRenters: happyRenters.length,
      averageRating: ratingAgg.length ? ratingAgg[0].avg : 0,
    },
    'Marketplace stats'
  ).send(res);
});

module.exports = { getStats };
