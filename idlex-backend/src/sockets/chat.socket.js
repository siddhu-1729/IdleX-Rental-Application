const { verifyAccessToken } = require('../utils/tokens');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Django doc calls for Django Channels + Redis for real-time chat.
// Socket.IO is the direct Express/Node equivalent — no extra broker
// needed for single-instance deployments; add the socket.io-redis
// adapter here if you scale to multiple Node processes.
function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Equivalent of the Django Channels consumer at ws/chat/{conversation_id}/
    socket.on('message:send', async ({ conversationId, text }, ack) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === socket.userId)) {
          return ack?.({ error: 'Not a participant in this conversation' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text,
          readBy: [socket.userId],
        });

        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populated = await message.populate('sender', 'name avatarUrl');
        io.to(`conversation:${conversationId}`).emit('message:new', populated);
        ack?.({ success: true, message: populated });
      } catch (err) {
        ack?.({ error: err.message });
      }
    });
  });
}

module.exports = registerChatSocket;
