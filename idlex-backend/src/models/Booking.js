const mongoose = require('mongoose');

const extensionRequestSchema = new mongoose.Schema(
  {
    requestedNewEndDate: { type: Date, required: true },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
      default: 'requested',
      index: true,
    },

    pricePerDay: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancellationReason: { type: String, default: null },

    extensionRequests: [extensionRequestSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
