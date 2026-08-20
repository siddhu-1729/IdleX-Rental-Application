const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../../config/env');
const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const { Payout, PayoutSettings } = require('../../models/Payout');
const ApiError = require('../../utils/ApiError');
const bookingsService = require('../bookings/bookings.service');

// Accepted in dev only (RAZORPAY_KEY_ID/SECRET unset) so the full
// pay → verify → booking flow can be tested before real keys exist.
const DEV_SIGNATURE = 'dev-signature';

const RAZORPAY_API_BASE = 'https://api.razorpay.com';

function getRazorpayClient() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) return null;
  return new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
}

// Raw REST call to the Razorpay API (Payouts endpoints are not exposed by
// the installed SDK). Basic auth with the key pair; works from localhost
// and serverless hosts (Vercel) alike — no IP whitelisting needed.
async function razorpayRequest(method, path, data) {
  const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString('base64');
  const res = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error?.description || `Razorpay API error (${res.status})`);
    err.status = res.status;
    err.details = json.error || json;
    throw err;
  }
  return json;
}

// Idempotent contact + fund-account resolution for a payout beneficiary.
// Reuses an existing contact by email and an existing fund account by
// bank identifiers so repeated payouts to the same owner don't duplicate.
async function findOrCreatePayoutContact(user) {
  const list = await razorpayRequest('GET', `/v1/contacts?email=${encodeURIComponent(user.email)}`);
  const existing = (list.items || []).find((c) => c.email === user.email);
  if (existing) return existing;
  return razorpayRequest('POST', '/v1/contacts', {
    name: user.name || 'IdleX user',
    email: user.email,
    contact: user.phone || undefined,
    type: 'customer',
  });
}

async function findOrCreateFundAccount(contactId, settings) {
  const list = await razorpayRequest('GET', `/v1/fund_accounts?contact_id=${contactId}`);
  const existing = (list.items || []).find(
    (fa) =>
      fa.bank_account?.ifsc === settings.ifscOrRoutingNumber &&
      fa.bank_account?.account_number === settings.accountNumber
  );
  if (existing) return existing;
  return razorpayRequest('POST', '/v1/fund_accounts', {
    contact_id: contactId,
    account_type: 'bank_account',
    bank_account: {
      name: settings.accountHolderName,
      ifsc: settings.ifscOrRoutingNumber,
      account_number: settings.accountNumber,
    },
  });
}

// Owner payout for a captured payment. The owner receives the rental
// subtotal; the platform keeps the service fee and the deposit stays
// refundable to the renter. If Razorpay keys or the settlement account or
// the owner's payout settings are missing, the payout is recorded as
// 'pending' and the API is skipped (dev/test mode) — the booking flow
// itself never fails because of a payout problem.
async function settleOwnerPayout(payment, booking) {
  const listing = await require('../../models/Listing').findById(payment.listing).select('owner title');
  if (!listing) return null;
  const settings = await PayoutSettings.findOne({ owner: listing.owner });
  if (!settings) return null;

  const payout = await Payout.create({
    owner: listing.owner,
    booking: booking._id,
    amount: booking.subtotal,
    status: 'pending',
  });

  const client = getRazorpayClient();
  if (!client || !env.razorpay.payoutAccountNumber) return payout;

  try {
    const User = require('../../models/User');
    const owner = await User.findById(listing.owner).select('name email phone');
    if (!owner) return payout;

    const contact = await findOrCreatePayoutContact(owner);
    const fundAccount = await findOrCreateFundAccount(contact.id, settings);
    const referenceId = `idlex_${booking._id}`;

    const result = await razorpayRequest('POST', '/v1/payouts', {
      account_number: env.razorpay.payoutAccountNumber,
      fund_account_id: fundAccount.id,
      amount: Math.round(booking.subtotal * 100), // paise
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      reference_id: referenceId,
      narration: `Rental payout for booking ${booking._id}`,
      queue_if_low_balance: true,
    });

    payout.gatewayPayoutId = result.id;
    payout.status = 'paid';
    await payout.save();
    return payout;
  } catch (err) {
    console.error(`[payout] failed for booking ${booking._id}:`, err.message);
    payout.status = 'failed';
    payout.gatewayPayoutId = err.details?.metadata?.payout_id || null;
    await payout.save();
    return payout;
  }
}

// Pay-first checkout: an order is created against the listing + dates and
// the booking only materialises once the payment is captured (see
// markPaymentCaptured). Only the gateway's order id is stored, never card
// data — the same rule as the original Django doc.
async function createCheckoutOrder(payerId, { listingId, startDate, endDate }) {
  const listing = await bookingsService.assertDatesAvailable(listingId, startDate, endDate);
  if (listing.owner.toString() === payerId.toString()) {
    throw ApiError.forbidden('You cannot book your own listing');
  }

  const cost = bookingsService.computeCost(listing, startDate, endDate);
  const client = getRazorpayClient();

  let gatewayOrderId;
  if (client) {
    const order = await client.orders.create({
      amount: Math.round(cost.totalAmount * 100), // paise
      currency: 'INR',
      receipt: `rental_${Date.now()}`,
      notes: { listing: listing._id.toString(), startDate, endDate },
    });
    gatewayOrderId = order.id;
  } else {
    // Dev fallback — same shape as a real order id, so nothing downstream
    // has to know whether the gateway was actually called.
    gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  }

  const payment = await Payment.create({
    payer: payerId,
    listing: listing._id,
    startDate,
    endDate,
    gatewayOrderId,
    amount: cost.totalAmount,
    currency: 'INR',
    status: 'created',
  });

  return { payment, configured: !! client };  
}

// Client-side payment verification: Razorpay signs `${orderId}|${paymentId}`
// with the key secret; the signature returned by the checkout popup must
// match. In dev (no keys) the fixed dev signature is accepted.
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const client = getRazorpayClient();
  if (!client) return signature === DEV_SIGNATURE;

  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// Gateway webhook signature: HMAC-SHA256 of the raw request body, signed
// with the webhook secret set in the Razorpay dashboard.
function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpay.webhookSecret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

// Shared capture path for the client-side verification endpoint and the
// gateway webhook. Idempotent: a second capture for the same order is a
// no-op once the booking already exists. The booking is created with
// status 'requested' and the owner is notified inside createBooking —
// payment first, booking request second, exactly the pay-first flow.
async function markPaymentCaptured({ gatewayOrderId, gatewayPaymentId, signature }) {
  const payment = await Payment.findOne({ gatewayOrderId });
  if (!payment) throw ApiError.notFound('Payment not found for this order');

  if (payment.status === 'captured' && payment.booking) {
    const existing = await Booking.findById(payment.booking);
    if (existing) return { payment, booking: existing, created: false };
  }
  if (payment.status === 'failed') {
    throw ApiError.badRequest('Payment was failed at the gateway');
  }

  const booking = await bookingsService.createBooking(payment.payer, {
    listingId: payment.listing,
    startDate: payment.startDate,
    endDate: payment.endDate,
  });

  payment.status = 'captured';
  payment.gatewayPaymentId = gatewayPaymentId;
  payment.signature = signature;
  payment.booking = booking._id;
  await payment.save();

  // Owner payout for the rental subtotal. Never blocks or fails the
  // capture — failures leave the payout as 'pending'/'failed' to retry.
  await settleOwnerPayout(payment, booking).catch((err) => {
    console.error(`[payout] skipped for booking ${booking._id}:`, err.message);
  });

  await notifyAdminsOfCapture(payment, booking);

  return { payment, booking, created: true };
}

// Revenue event: every first-time capture is announced to all admins so the
// dashboard doesn't have to be polled. Only runs when a booking was actually
// created (idempotent replays of the same order are skipped).
async function notifyAdminsOfCapture(payment, booking) {
  try {
    const User = require('../../models/User');
    const { notify } = require('../notifications/notifications.service');

    const [admins, listing, renter] = await Promise.all([
      User.find({ role: 'admin' }).select('_id'),
      require('../../models/Listing').findById(payment.listing).select('title'),
      User.findById(payment.payer).select('name'),
    ]);

    const listingTitle = listing ? listing.title : 'a listing';
    const renterName = renter ? renter.name : 'A user';
    const amount = payment.amount.toFixed(2);

    await Promise.all(
      admins.map((admin) =>
        notify(admin._id, {
          type: 'payment_captured',
          title: `New payment of ₹${amount} received`,
          body: `${renterName} paid for "${listingTitle}" (booking ${booking._id}). Revenue updated.`,
          link: '/admin/payments',
        })
      )
    );
  } catch {
    // Notification failures must never fail the payment capture itself.
  }
}

module.exports = {
  createCheckoutOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  markPaymentCaptured,
  settleOwnerPayout,
  Payout,
  PayoutSettings,
};