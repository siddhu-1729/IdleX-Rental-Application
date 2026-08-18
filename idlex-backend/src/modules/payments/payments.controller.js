const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');
const paymentsService = require('./payments.service');
const { Payout, PayoutSettings } = require('../../models/Payout');
const { logAudit } = require('../../utils/audit');

// Step 1 of the pay-first flow: create a Razorpay order for the listing +
// dates. The client opens the Razorpay Checkout popup with the returned
// order id, then calls /verify once the payment completes.
const checkout = asyncHandler(async (req, res) => {
  const { listingId, startDate, endDate } = req.body;
  if (!listingId || !startDate || !endDate) {
    throw ApiError.badRequest('listingId, startDate and endDate are required');
  }

  const { payment, configured } = await paymentsService.createCheckoutOrder(req.user._id, {
    listingId,
    startDate,
    endDate,
  });

  logAudit({
    actor: req.user._id,
    action: 'payment.intent_created',
    category: 'payment',
    resourceType: 'payment',
    resourceId: payment._id?.toString(),
    summary: 'Initiated a payment',
    details: { listing: listingId, amount: payment.amount, status: payment.status, configured },
    req,
  });

  return new ApiResponse(
    201,
    {
      paymentId: payment._id,
      orderId: payment.gatewayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      gateway: payment.gateway,
      keyId: configured ? env.razorpay.keyId : null,
      configured,
    },
    'Payment order created'
  ).send(res);
});

// Step 2 of the pay-first flow: verify the signature Razorpay returned to
// the checkout popup, then materialise the booking (status 'requested')
// and notify the owner. Idempotent — safe to call again after a network
// blip, the same order returns the already-created booking.
const verify = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  if (!orderId || !paymentId || !signature) {
    throw ApiError.badRequest('orderId, paymentId and signature are required');
  }

  const valid = paymentsService.verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) throw ApiError.badRequest('Payment signature verification failed');

  const { booking, created } = await paymentsService.markPaymentCaptured({
    gatewayOrderId: orderId,
    gatewayPaymentId: paymentId,
    signature,
  });

  logAudit({
    actor: req.user._id,
    action: 'payment.verified',
    category: 'payment',
    resourceType: 'payment',
    resourceId: booking._id.toString(),
    summary: created ? 'Payment captured — booking requested' : 'Payment already captured',
    details: { orderId, paymentId, booking: booking._id },
    req,
  });

  return new ApiResponse(
    200,
    booking,
    created ? 'Payment verified — booking requested' : 'Booking already confirmed for this payment'
  ).send(res);
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
// by signature instead. Mounted on raw body (see app.js). Backup path:
// if the client never reaches /verify, the captured event still creates
// the booking.
const handleWebhook = asyncHandler(async (req, res) => {
  const signature =
    req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
  const valid = paymentsService.verifyWebhookSignature(req.rawBody, signature);
  if (!valid) throw ApiError.badRequest('Invalid webhook signature');

  const { event, payload } = req.body;
  if (event === 'payment.captured') {
    const gatewayPayment = payload?.payment?.entity || payload?.payment || {};
    const gatewayOrder = payload?.order?.entity || payload?.order || {};

    const result = await paymentsService.markPaymentCaptured({
      gatewayOrderId: gatewayOrder.id,
      gatewayPaymentId: gatewayPayment.id,
      signature: gatewayPayment.signature || signature,
    });

    // No session user here — the webhook is gateway-authenticated, so the
    // audit log has a null actor but still lands in the activity trail.
    logAudit({
      action: 'payment.captured',
      category: 'payment',
      resourceType: 'payment',
      resourceId: gatewayOrder.id || null,
      summary: 'Payment captured via gateway webhook',
      details: { orderId: gatewayOrder.id, paymentId: gatewayPayment.id, booking: result.booking?._id },
      req,
    });
  }

  res.status(200).json({ received: true });
});

module.exports = { checkout, verify, listPayoutHistory, getPayoutSettings, updatePayoutSettings, handleWebhook };