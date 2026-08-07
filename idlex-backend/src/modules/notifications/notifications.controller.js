const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Notification = require('../../models/Notification');

// The signed-in user's own notifications, newest first.
const listMine = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50);
  return new ApiResponse(200, notifications, 'Notifications fetched').send(res);
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  return new ApiResponse(200, { count }, 'Unread notification count').send(res);
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return new ApiResponse(200, notification, 'Notification marked as read').send(res);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { $set: { isRead: true } });
  return new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

module.exports = { listMine, unreadCount, markRead, markAllRead };