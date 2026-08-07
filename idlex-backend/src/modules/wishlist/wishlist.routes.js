const express = require('express');
const controller = require('./wishlist.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', controller.myWishlist);
router.post('/:listingId', controller.addToWishlist);
router.delete('/:listingId', controller.removeFromWishlist);

module.exports = router;