const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },

    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
    },
    gatewayPayoutId: { type: String, default: null },
  },
  { timestamps: true }
);

const payoutSettingsSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accountHolderName: String,
    accountNumber: String,
    ifscOrRoutingNumber: String,
    bankName: String,
    upiId: String,
  },
  { timestamps: true }
);

module.exports = {
  Payout: mongoose.model('Payout', payoutSchema),
  PayoutSettings: mongoose.model('PayoutSettings', payoutSettingsSchema),
};
