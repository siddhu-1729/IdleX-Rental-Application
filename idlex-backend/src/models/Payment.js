const mongoose = require('mongoose');

// Mirrors the gateway's own status enum rather than inventing one, per
// the Django doc's guidance — only gateway transaction refs are stored,
// never raw card data.
const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    gateway: { type: String, enum: ['razorpay', 'stripe'], default: 'razorpay' },
    gatewayOrderId: { type: String, required: true },
    gatewayPaymentId: { type: String, default: null },
    signature: { type: String, default: null },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
