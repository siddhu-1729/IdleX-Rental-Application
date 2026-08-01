const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Booking = require('../../models/Booking');
const bookingsService = require('./bookings.service');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingsService.createBooking(req.user._id, req.body);
  return new ApiResponse(201, booking, 'Booking requested').send(res);
});

// Renter's own bookings — powers the renter-facing booking list.
const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ renter: req.user._id })
    .sort('-createdAt')
    .populate('listing', 'title photos pricePerDay');
  return new ApiResponse(200, bookings, "Renter's bookings").send(res);
});

// Owner-facing list — 'my-rentals' counterpart from the owner side.
const ownerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id })
    .sort('-createdAt')
    .populate('listing', 'title photos pricePerDay')
    .populate('renter', 'name avatarUrl');
  return new ApiResponse(200, bookings, "Owner's bookings").send(res);
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('listing')
    .populate('renter', 'name avatarUrl')
    .populate('owner', 'name avatarUrl');
  if (!booking) throw ApiError.notFound('Booking not found');

  const isParty = [booking.renter._id, booking.owner._id].some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (!isParty && req.user.role !== 'admin') throw ApiError.forbidden('Not a party to this booking');

  return new ApiResponse(200, booking, 'Booking detail — StatusTimeline data').send(res);
});

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.owner.toString() !== req.user._id.toString()) throw ApiError.forbidden('Only the owner can confirm');
  if (booking.status !== 'requested') throw ApiError.badRequest(`Cannot confirm a booking in '${booking.status}' state`);

  booking.status = 'confirmed';
  await booking.save();
  return new ApiResponse(200, booking, 'Booking confirmed').send(res);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  const isParty = [booking.renter, booking.owner].some((id) => id.toString() === req.user._id.toString());
  if (!isParty) throw ApiError.forbidden('Not a party to this booking');
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw ApiError.badRequest(`Booking already ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.cancelledBy = req.user._id;
  booking.cancellationReason = req.body.reason;
  await booking.save();
  return new ApiResponse(200, booking, 'Booking cancelled').send(res);
});

// Renter requests an extension.
const requestExtension = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.renter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the renter can request an extension');
  }
  if (!['confirmed', 'active'].includes(booking.status)) {
    throw ApiError.badRequest('Can only extend a confirmed or active booking');
  }

  await bookingsService.assertDatesAvailable(booking.listing, booking.startDate, req.body.requestedNewEndDate, booking._id);

  booking.extensionRequests.push(req.body);
  await booking.save();
  return new ApiResponse(201, booking, 'Extension requested').send(res);
});

// Owner approves/rejects.
const respondExtension = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the owner can respond to an extension request');
  }

  const extension = booking.extensionRequests.id(req.params.reqId);
  if (!extension) throw ApiError.notFound('Extension request not found');
  if (extension.status !== 'pending') throw ApiError.badRequest('This request has already been responded to');

  extension.status = req.body.approve ? 'approved' : 'rejected';
  extension.respondedAt = new Date();
  if (req.body.approve) {
    booking.endDate = extension.requestedNewEndDate;
    booking.totalDays = require('./bookings.service').daysBetween(booking.startDate, booking.endDate);
  }

  await booking.save();
  return new ApiResponse(200, booking, `Extension request ${extension.status}`).send(res);
});

module.exports = {
  createBooking,
  myBookings,
  ownerBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  requestExtension,
  respondExtension,
};
