const express = require('express');
const controller = require('./kyc.controller');
const { protect } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);
router.get('/', controller.getMyKyc);
router.post('/step/:step', upload.single('file'), controller.submitStep);
router.post('/submit', controller.finalizeSubmission);

module.exports = router;
