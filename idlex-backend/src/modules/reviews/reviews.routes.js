const express = require('express');
const controller = require('./reviews.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/mine', protect, controller.myReviews);
router.post('/', protect, controller.createReview);

module.exports = router;
