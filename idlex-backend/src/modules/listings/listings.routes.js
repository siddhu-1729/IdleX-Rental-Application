const express = require('express');
const controller = require('./listings.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const upload = require('../../middlewares/upload.middleware');
const { createListingSchema, updateListingSchema, availabilitySchema } = require('./listings.validation');

const router = express.Router();

// Public
router.get('/', controller.listListings);
router.get('/:id', controller.getListing);
router.get('/:id/availability', controller.getAvailability);

// Owner-only
router.use(protect);
router.get('/mine/all', controller.myListings); // -> maps to my-listings page
router.post('/', authorize('owner', 'admin'), validate(createListingSchema), controller.createListing);
router.put('/:id', authorize('owner', 'admin'), validate(updateListingSchema), controller.updateListing);
router.patch('/:id', authorize('owner', 'admin'), validate(updateListingSchema), controller.updateListing);
router.delete('/:id', authorize('owner', 'admin'), controller.deleteListing);

router.post('/:id/photos', authorize('owner', 'admin'), upload.array('photos', 10), controller.addPhotos);
router.delete('/:id/photos/:photoId', authorize('owner', 'admin'), controller.deletePhoto);

router.post(
  '/:id/availability',
  authorize('owner', 'admin'),
  validate(availabilitySchema),
  controller.addAvailabilityBlock
);

module.exports = router;
