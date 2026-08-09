const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const paymentsService = require('./payments.service');
const { Payout, PayoutSettings } = require('../../models/Payout');
const { logAudit } = require('../../utils/audit');

const checkout = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) throw ApiError.badRequest('bookingId is required');
  const payment = await paymentsService.createCheckoutOrder(bookingId, req.user._id);
  logAudit({
    actor: req.user._id,
    action: 'payment.intent_created',
    category: 'payment',
    resourceType: 'payment',
    resourceId: payment._id?.toString(),
    summary: 'Initiated a payment',
    details: { booking: bookingId, amount: payment.amount, status: payment.status },
    req,
  });
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
    // No session user here — the webhook is gateway-authenticated, so the
    // audit log has a null actor but still lands in the activity trail.
    logAudit({
      action: 'payment.captured',
      category: 'payment',
      resourceType: 'payment',
      resourceId: orderId || null,
      summary: 'Payment captured via gateway',
      details: { orderId, paymentId },
      req,
    });
  }

  res.status(200).json({ received: true });
});

module.exports = { checkout, listPayoutHistory, getPayoutSettings, updatePayoutSettings, handleWebhook };
