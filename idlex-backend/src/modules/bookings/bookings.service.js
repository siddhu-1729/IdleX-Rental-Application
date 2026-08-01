const Listing = require('../../models/Listing');
const Booking = require('../../models/Booking');
const ApiError = require('../../utils/ApiError');

const SERVICE_FEE_RATE = 0.1; // 10% platform fee — same "plain business logic" note as the Django doc

function daysBetween(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}

// Preventing double-booking on overlapping dates: checked against both
// the listing's blocked availability and existing active bookings —
// same overlap-check pattern used for listing availability itself.
async function assertDatesAvailable(listingId, startDate, endDate, excludeBookingId = null) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.status !== 'published') throw ApiError.badRequest('Listing is not available for booking');

  const blockOverlap = listing.availability.some(
    (b) => new Date(startDate) <= new Date(b.endDate) && new Date(endDate) >= new Date(b.startDate)
  );
  if (blockOverlap) throw ApiError.conflict('Selected dates are blocked by the owner');

  const bookingQuery = {
    listing: listingId,
    status: { $in: ['requested', 'confirmed', 'active'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };
  if (excludeBookingId) bookingQuery._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(bookingQuery);
  if (conflict) throw ApiError.conflict('Selected dates overlap an existing booking');

  return listing;
}

async function createBooking(renterId, { listingId, startDate, endDate }) {
  const listing = await assertDatesAvailable(listingId, startDate, endDate);

  const totalDays = daysBetween(startDate, endDate);
  if (totalDays < 1) throw ApiError.badRequest('endDate must be after startDate');

  const subtotal = totalDays * listing.pricePerDay;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalAmount = subtotal + serviceFee + (listing.securityDeposit || 0);

  const booking = await Booking.create({
    listing: listing._id,
    renter: renterId,
    owner: listing.owner,
    startDate,
    endDate,
    pricePerDay: listing.pricePerDay,
    totalDays,
    subtotal,
    serviceFee,
    securityDeposit: listing.securityDeposit || 0,
    totalAmount,
  });

  return booking;
}

module.exports = { assertDatesAvailable, createBooking, daysBetween };
