const Notification = require('../../models/Notification');

// Single entry point for creating notifications — called from other
// modules (bookings, etc.) whenever a user-triggered event needs to
// reach the other party.
async function notify(recipientId, { type = 'info', title, body = '', link = null }) {
  if (!recipientId) return null;
  return Notification.create({ recipient: recipientId, type, title, body, link });
}

function toSafeJSON(notification) {
  const obj = notification.toObject ? notification.toObject() : notification;
  return obj;
}

module.exports = { notify, toSafeJSON };