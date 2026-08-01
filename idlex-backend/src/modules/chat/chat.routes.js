const express = require('express');
const controller = require('./chat.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
// Frontend fetches these on page load, then upgrades to the socket
// connection (see src/sockets/chat.socket.js) for live updates —
// same REST-then-socket pattern the Django doc lays out for Channels.
router.get('/conversations', controller.listConversations);
router.get('/conversations/:id/messages', controller.getMessages);

module.exports = router;
