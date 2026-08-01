const express = require('express');
const controller = require('./bookings.controller');
const { protect } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  createBookingSchema,
  cancelBookingSchema,
  extensionRequestSchema,
  extensionRespondSchema,
} = require('./bookings.validation');

const router = express.Router();

router.use(protect);

router.get('/', controller.myBookings); // renter view
router.post('/', validate(createBookingSchema), controller.createBooking);
router.get('/owner', controller.ownerBookings);
router.get('/:id', controller.getBooking);
router.post('/:id/confirm', controller.confirmBooking);
router.post('/:id/cancel', validate(cancelBookingSchema), controller.cancelBooking);
router.post('/:id/extension-request', validate(extensionRequestSchema), controller.requestExtension);
router.post('/:id/extension-request/:reqId/respond', validate(extensionRespondSchema), controller.respondExtension);

module.exports = router;
