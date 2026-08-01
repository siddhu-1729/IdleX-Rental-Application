const mongoose = require('mongoose');

// One row per user, updated in place as each stepper step completes —
// same "save-and-resume on one record" pattern as the Django doc.
const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'pending', 'approved', 'rejected'],
      default: 'not_started',
    },
    currentStep: {
      type: String,
      enum: ['id-upload', 'selfie', 'bank-details', 'completed'],
      default: 'id-upload',
    },

    idDocument: {
      type: { type: String }, // passport, national_id, driving_license
      fileUrl: String,
      uploadedAt: Date,
    },
    selfie: {
      fileUrl: String,
      uploadedAt: Date,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscOrRoutingNumber: String,
      bankName: String,
    },

    rejectionReason: { type: String, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kyc', kycSchema);
