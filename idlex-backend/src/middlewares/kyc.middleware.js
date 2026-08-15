const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Kyc = require('../models/Kyc');

// Listing-write gate: a user may only create/edit/publish listings once an
// admin has approved their KYC. Viewing and reading are never blocked.
// Admins (staff) bypass the check.
const requireApprovedKyc = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc || kyc.status !== 'approved') {
    throw ApiError.forbidden(
      'Your KYC has not been approved yet. An admin must approve your KYC before you can add listings.'
    );
  }
  next();
});

module.exports = { requireApprovedKyc };