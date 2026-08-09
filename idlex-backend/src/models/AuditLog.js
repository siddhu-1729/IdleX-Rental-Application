const mongoose = require('mongoose');

// Immutable activity trail — every meaningful user/admin action across the
// platform is recorded here. The admin console reads from this collection
// to power the "Audit Logs" page and the activity charts on the dashboard.
const auditLogSchema = new mongoose.Schema(
  {
    // Who did it. Null for system/webhook events without a session user.
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    // Machine-readable action key, e.g. 'booking.created', 'user.login',
    // 'admin.kyc_reviewed'. Grouped by category on the admin dashboard.
    action: { type: String, required: true, index: true },

    // Coarse bucket used to slice the activity charts:
    // auth | listing | booking | payment | kyc | review | admin | system
    category: {
      type: String,
      enum: ['auth', 'listing', 'booking', 'payment', 'kyc', 'review', 'admin', 'system'],
      default: 'system',
      index: true,
    },

    // Which resource changed (e.g. a listing id, booking id, user id).
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null },

    // One-line human readable description shown in the audit log table.
    summary: { type: String, default: '' },

    // Optional structured context (ids, status changes, amounts...).
    details: { type: mongoose.Schema.Types.Mixed, default: null },

    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
