const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort('-lastMessageAt')
    .populate('participants', 'name avatarUrl')
    .populate('listing', 'title photos');
  return new ApiResponse(200, conversations, 'Conversations').send(res);
});

const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  const isParticipant = conversation.participants.some((p) => p.toString() === req.user._id.toString());
  if (!isParticipant) throw ApiError.forbidden('Not a participant in this conversation');

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);

  const messages = await Message.find({ conversation: conversation._id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender', 'name avatarUrl');

  return new ApiResponse(200, messages.reverse(), 'Message history').send(res);
});

module.exports = { listConversations, getMessages };
