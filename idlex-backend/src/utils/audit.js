const AuditLog = require('../models/AuditLog');

/**
 * Fire-and-forget audit logger. Never blocks or fails the request it is
 * called from — failures are logged to the server console only.
 *
 * @param {object} entry
 * @param {import('mongoose').Types.ObjectId} [entry.actor]
 * @param {string} entry.action   e.g. 'booking.confirmed'
 * @param {string} [entry.category] auth | listing | booking | payment | kyc | review | admin | system
 * @param {string} [entry.resourceType]
 * @param {string} [entry.resourceId]
 * @param {string} [entry.summary]
 * @param {unknown} [entry.details]
 * @param {object}  [entry.req]   Express request — used to capture ip + user agent.
 */
function logAudit({ actor = null, action, category = 'system', resourceType = null, resourceId = null, summary = '', details = null, req = null }) {
  AuditLog.create({
    actor: actor || null,
    action,
    category,
    resourceType,
    resourceId: resourceId || null,
    summary,
    details,
    ip: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
  }).catch((err) => {
    console.error(`[audit] failed to write log (${action}):`, err.message);
  });
}

module.exports = { logAudit };
