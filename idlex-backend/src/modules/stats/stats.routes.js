const express = require('express');
const controller = require('./stats.controller');

const router = express.Router();

// Public
router.get('/', controller.getStats);

module.exports = router;