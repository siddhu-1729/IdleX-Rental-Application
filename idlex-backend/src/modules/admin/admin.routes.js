const express = require('express');
const controller = require('./admin.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { kycReviewSchema } = require('./admin.validation');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', controller.getStats);
router.get('/analytics', controller.getAnalytics);
router.get('/audit-logs', controller.listAuditLogs);
router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUser);
router.get('/listings', controller.listListingsForModeration);
router.patch('/listings/:id', controller.moderateListing);
router.get('/bookings', controller.listBookings);
router.get('/payments', controller.listPayments);
router.get('/disputes', controller.listDisputes);
router.post('/disputes/:id/resolve', controller.resolveDispute);
router.get('/reports', controller.listReports);
router.get('/kyc', controller.listKyc);
router.patch('/kyc/:id', validate(kycReviewSchema), controller.reviewKyc);

module.exports = router;
