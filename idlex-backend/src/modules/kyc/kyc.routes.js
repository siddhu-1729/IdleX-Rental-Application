const express = require('express');
const controller = require('./kyc.controller');
const { protect } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);
router.get('/', controller.getMyKyc);
router.post(
  '/submit',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  controller.submitKyc
);

module.exports = router;