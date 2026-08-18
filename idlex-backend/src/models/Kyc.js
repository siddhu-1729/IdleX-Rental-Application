const mongoose = require('mongoose');

// One row per user, updated in place each time the user submits KYC.
// The only accepted proof of identity is the password-protected E-Aadhaar
// ZIP downloaded from the UIDAI e-Aadhaar portal. The password the user
// provides unlocks the ZIP for the admin reviewer.
const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'pending', 'approved', 'rejected'],
      default: 'not_started',
    },

    eAadhaar: {
      fileUrl: String,
      password: String,
      uploadedAt: Date,
    },
    // Live selfie captured at submission time — the admin compares it with
    // the photo inside the E-Aadhaar ZIP before approving.
    selfie: {
      fileUrl: String,
      uploadedAt: Date,
    },

    // Payment setup details collected alongside identity verification.
    // On approval these populate the user's PayoutSettings so owners can
    // receive their rental earnings.
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      upiId: String,
    },

    rejectionReason: { type: String, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kyc', kycSchema);