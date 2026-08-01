const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const paymentsService = require('./payments.service');
const { Payout, PayoutSettings } = require('../../models/Payout');

const checkout = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) throw ApiError.badRequest('bookingId is required');
  const payment = await paymentsService.createCheckoutOrder(bookingId, req.user._id);
  return new ApiResponse(201, payment, 'Payment intent created').send(res);
});

const listPayoutHistory = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ owner: req.user._id }).sort('-createdAt');
  return new ApiResponse(200, payouts, "Owner's payout history").send(res);
});

const getPayoutSettings = asyncHandler(async (req, res) => {
  const settings = await PayoutSettings.findOne({ owner: req.user._id });
  return new ApiResponse(200, settings, 'Payout settings').send(res);
});

const updatePayoutSettings = asyncHandler(async (req, res) => {
  const settings = await PayoutSettings.findOneAndUpdate(
    { owner: req.user._id },
    { $set: { ...req.body, owner: req.user._id } },
    { upsert: true, new: true }
  );
  return new ApiResponse(200, settings, 'Payout settings updated').send(res);
});

// Gateway webhook receiver — not user-facing, no auth middleware, verified
// by signature instead. Mounted on raw body (see app.js).
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const valid = paymentsService.verifyWebhookSignature(req.rawBody, signature);
  if (!valid) throw ApiError.badRequest('Invalid webhook signature');

  const { event, order_id: orderId, payment_id: paymentId } = req.body;
  if (event === 'payment.captured') {
    await paymentsService.markPaymentCaptured(orderId, paymentId, signature);
  }

  res.status(200).json({ received: true });
});

module.exports = { checkout, listPayoutHistory, getPayoutSettings, updatePayoutSettings, handleWebhook };
