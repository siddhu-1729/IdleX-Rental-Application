const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const User = require('../../models/User');
const Listing = require('../../models/Listing');

async function loadedWishlist(userId) {
  const user = await User.findById(userId).populate('wishlist');
  return user ? user.wishlist : [];
}

// GET /api/wishlist — the signed-in user's saved listings.
const myWishlist = asyncHandler(async (req, res) => {
  const wishlist = await loadedWishlist(req.user._id);
  return new ApiResponse(200, wishlist, 'Wishlist fetched').send(res);
});

// POST /api/wishlist/:listingId — save a listing (idempotent).
const addToWishlist = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);
  if (!listing) throw ApiError.notFound('Listing not found');

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: listing._id } });
  const wishlist = await loadedWishlist(req.user._id);
  return new ApiResponse(200, wishlist, 'Added to wishlist').send(res);
});

// DELETE /api/wishlist/:listingId — remove a saved listing (idempotent).
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.listingId } });
  const wishlist = await loadedWishlist(req.user._id);
  return new ApiResponse(200, wishlist, 'Removed from wishlist').send(res);
});

module.exports = { myWishlist, addToWishlist, removeFromWishlist };