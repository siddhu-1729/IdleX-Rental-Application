const crypto = require('crypto');
const env = require('../config/env');
const User = require('../models/User');
const PhoneOtp = require('../models/PhoneOtp');
const { sendOtpEmail } = require('./email');

// OTP generation/delivery is treated as an external concern, same as the
// Django doc calls out (Django/Express have no built-in SMS/email sending).
// Swap sendOtpSms's internals for Twilio, MSG91, etc. — the rest of the
// auth flow doesn't need to know which provider is behind it.

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_MAX_ATTEMPTS = 5;

function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

// Normalizes an Indian phone number to E.164 (+91XXXXXXXXXX). Accepts
// "+91 98765 43210", "9876543210", "919876543210", etc. Returns null for
// anything that isn't a valid 10-digit number.
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.length !== 10) return null;
  return `+91${digits}`;
}

// Sends an SMS OTP via Twilio. Never throws — on any provider problem the
// code is logged to the console so the flow still works in development.
async function sendOtpSms(phone, otp) {
  if (!env.twilio.accountSid || !env.twilio.authToken) {
    console.log(`[otp] (dev) OTP for ${phone}: ${otp}`);
    return;
  }
  if (env.twilio.accountSid.startsWith('SK')) {
    console.error(
      `[otp] TWILIO_ACCOUNT_SID starts with "SK" (API Key SID). Twilio needs the Account SID (starts with "AC") from twilio.com/console. Logging OTP instead.`
    );
    console.log(`[otp] (dev) OTP for ${phone}: ${otp}`);
    return;
  }
  if (!env.twilio.fromNumber) {
    console.error('[otp] TWILIO_FROM_NUMBER is empty. Logging OTP instead.');
    console.log(`[otp] (dev) OTP for ${phone}: ${otp}`);
    return;
  }
  try {
    const twilio = require('twilio')(env.twilio.accountSid, env.twilio.authToken);
    await twilio.messages.create({
      body: `Your IdleX verification code is ${otp}`,
      from: env.twilio.fromNumber,
      to: phone,
    });
  } catch (err) {
    console.error(`[otp] Twilio send failed (${err.message}). Logging OTP instead.`);
    console.log(`[otp] (dev) OTP for ${phone}: ${otp}`);
  }
}

// Stores a phone OTP (one per number+purpose) and sends it. Returns the
// normalized phone; the code is only returned for dev logging.
async function issuePhoneOtp(phone, purpose) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const code = generateOtp();
  await PhoneOtp.findOneAndUpdate(
    { phone: normalized, purpose },
    { $set: { code, expiresAt: new Date(Date.now() + PHONE_OTP_TTL_MS), attempts: 0 } },
    { upsert: true }
  );
  await sendOtpSms(normalized, code);
  return { phone: normalized };
}

// Validates a submitted phone OTP and consumes it on success. Returns
// { ok: true, phone } or { ok: false, reason: 'not_found' | 'invalid' |
// 'expired' | 'attempts' }.
async function verifyPhoneOtpRecord(phone, code, purpose) {
  const normalized = normalizePhone(phone);
  if (!normalized) return { ok: false, reason: 'not_found' };
  const record = await PhoneOtp.findOne({ phone: normalized, purpose });
  if (!record || !record.code) return { ok: false, reason: 'not_found' };
  if (record.expiresAt < new Date()) return { ok: false, reason: 'expired' };
  if (record.attempts >= PHONE_OTP_MAX_ATTEMPTS) return { ok: false, reason: 'attempts' };
  if (record.code !== code) {
    record.attempts += 1;
    await record.save();
    return { ok: false, reason: 'invalid' };
  }
  await record.deleteOne();
  return { ok: true, phone: normalized };
}

// Issues an email-delivered OTP on the user document. `purpose` tags the
// OTP ('email_verify' for account verification, 'listing' for per-listing
// verification) so the two flows can't consume each other's codes.
async function issueEmailOtp(userId, email, purpose = 'email_verify') {
  const code = generateOtp();
  await User.updateOne(
    { _id: userId },
    { $set: { emailOtp: { code, expiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS), purpose } } }
  );
  await sendOtpEmail({ to: email, otp: code, purpose });
  return code;
}

// Validates a submitted code against the stored one, consuming it on
// success. Returns { ok: true } or { ok: false, reason: 'no_request' |
// 'invalid' } — callers decide the ApiError to raise.
async function verifyEmailOtpRecord(userId, code, purpose) {
  const user = await User.findById(userId).select('+emailOtp.code +emailOtp.expiresAt +emailOtp.purpose');
  const otp = user?.emailOtp;
  if (!otp || !otp.code || otp.purpose !== purpose) return { ok: false, reason: 'no_request' };
  if (otp.code !== code || otp.expiresAt < new Date()) return { ok: false, reason: 'invalid' };
  user.emailOtp = undefined;
  await user.save();
  return { ok: true };
}

module.exports = {
  generateOtp,
  normalizePhone,
  sendOtpSms,
  issuePhoneOtp,
  verifyPhoneOtpRecord,
  issueEmailOtp,
  verifyEmailOtpRecord,
};