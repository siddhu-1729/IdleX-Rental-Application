const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const User = require('../../models/User');
const Listing = require('../../models/Listing');
const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');
const Dispute = require('../../models/Dispute');
const Kyc = require('../../models/Kyc');

// Dashboard numbers — Django's aggregation API equivalent via Mongo's
// countDocuments / aggregate.
const getStats = asyncHandler(async (req, res) => {
  const [users, listings, activeBookings, revenue] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } }),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  return new ApiResponse(200, {
    totalUsers: users,
    totalListings: listings,
    activeBookings,
    totalRevenue: revenue[0]?.total || 0,
  }, 'Dashboard stats').send(res);
});

const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return new ApiResponse(200, users, 'Users').send(res);
});

// Suspend/unsuspend a user.
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return new ApiResponse(200, user.toSafeJSON(), 'User updated').send(res);
});

const listListingsForModeration = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const listings = await Listing.find(filter).sort('-createdAt').populate('owner', 'name email');
  return new ApiResponse(200, listings, 'Listings for moderation').send(res);
});

const moderateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!listing) throw ApiError.notFound('Listing not found');
  return new ApiResponse(200, listing, 'Listing moderated').send(res);
});

const listDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find()
    .sort('-createdAt')
    .populate('booking')
    .populate('raisedBy', 'name email');
  return new ApiResponse(200, disputes, 'Disputes').send(res);
});

const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw ApiError.notFound('Dispute not found');

  dispute.status = req.body.status || 'resolved';
  dispute.resolutionNote = req.body.resolutionNote;
  dispute.resolvedBy = req.user._id;
  await dispute.save();

  return new ApiResponse(200, dispute, 'Dispute resolved').send(res);
});

// Flagged content queue — placeholder aggregation; wire to a Report
// model if/when content flagging is built out.
const listReports = asyncHandler(async (req, res) => {
  const openDisputes = await Dispute.find({ status: 'open' }).populate('raisedBy', 'name email');
  return new ApiResponse(200, openDisputes, 'Flagged content queue').send(res);
});

// KYC review queue — the admin half of the stepper flow: users submit
// (status -> pending), admins approve/reject here.
const listKyc = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const kycs = await Kyc.find(filter)
    .sort('-createdAt')
    .populate('user', 'name email phone isOwner role');
  return new ApiResponse(200, kycs, 'KYC submissions').send(res);
});

const reviewKyc = asyncHandler(async (req, res) => {
  const kyc = await Kyc.findById(req.params.id);
  if (!kyc) throw ApiError.notFound('KYC submission not found');
  if (kyc.status !== 'pending') {
    throw ApiError.badRequest(`Cannot review a submission in '${kyc.status}' state`);
  }

  const { status, rejectionReason } = req.body;
  kyc.status = status;
  kyc.reviewedBy = req.user._id;
  kyc.reviewedAt = new Date();
  kyc.rejectionReason = status === 'rejected' ? rejectionReason || 'Not approved' : null;
  await kyc.save();

  return new ApiResponse(200, kyc, `KYC ${status}`).send(res);
});

module.exports = {
  getStats,
  listUsers,
  updateUser,
  listListingsForModeration,
  moderateListing,
  listDisputes,
  resolveDispute,
  listReports,
  listKyc,
  reviewKyc,
};
