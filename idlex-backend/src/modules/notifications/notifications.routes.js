const express = require('express');
const controller = require('./notifications.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', controller.listMine);
router.get('/unread-count', controller.unreadCount);
router.post('/:id/read', controller.markRead);
router.post('/read-all', controller.markAllRead);

module.exports = router;