const mongoose = require('mongoose');

// Photos are embedded subdocuments rather than a separate collection —
// Mongo's document model makes the Django doc's "related ListingPhoto
// model" unnecessary; we still keep it as its own subdocument (not a
// bare string array) so each photo can carry order/caption metadata.
const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

// Availability is blocked date ranges (owner marks unavailable windows);
// booking creation cross-checks against both this and existing bookings.
const availabilitySchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: 'blocked' }, // blocked | booked
  },
  { _id: true }
);

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },

    pricePerDay: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0 },

    location: {
      address: String,
      city: { type: String, index: true },
      state: String,
      country: String,
      lat: Number,
      lng: Number,
    },

    photos: [photoSchema],
    availability: [availabilitySchema],

    status: {
      type: String,
      enum: ['draft', 'published', 'paused'],
      default: 'draft',
      index: true,
    },

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Supports the search module's text search without a separate service.
listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
