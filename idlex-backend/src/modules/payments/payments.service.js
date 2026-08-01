const crypto = require('crypto');
const env = require('../../config/env');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const { Payout, PayoutSettings } = require('../../models/Payout');
const ApiError = require('../../utils/ApiError');

// Payment gateway integration is an external concern, same call-out as
// the Django doc: only the gateway's own transaction id/status is
// stored, never card data. Swap this for the real Razorpay/Stripe SDK
// call in production; the shape returned is what those SDKs give back.
async function createCheckoutOrder(bookingId, payerId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.renter.toString() !== payerId.toString()) {
    throw ApiError.forbidden('Only the renter can pay for this booking');
  }

  // Real integration:
  // const razorpay = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  // const order = await razorpay.orders.create({ amount: booking.totalAmount * 100, currency: 'INR' });
  const fakeOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  const payment = await Payment.create({
    booking: booking._id,
    payer: payerId,
    gatewayOrderId: fakeOrderId,
    amount: booking.totalAmount,
    status: 'created',
  });

  return payment;
}

function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret || 'dev-secret')
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

async function markPaymentCaptured(gatewayOrderId, gatewayPaymentId, signature) {
  const payment = await Payment.findOne({ gatewayOrderId });
  if (!payment) throw ApiError.notFound('Payment not found for this order');

  payment.status = 'captured';
  payment.gatewayPaymentId = gatewayPaymentId;
  payment.signature = signature;
  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });
  return payment;
}

module.exports = { createCheckoutOrder, verifyWebhookSignature, markPaymentCaptured, Payout, PayoutSettings };
