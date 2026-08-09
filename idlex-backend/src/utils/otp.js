const crypto = require('crypto');
const env = require('../config/env');
const User = require('../models/User');
const { sendOtpEmail } = require('./email');

// OTP generation/delivery is treated as an external concern, same as the
// Django doc calls out (Django/Express have no built-in SMS/email sending).
// Swap sendOtpSms's internals for Twilio, MSG91, etc. — the rest of the
// auth flow doesn't need to know which provider is behind it.

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

async function sendOtpSms(phone, otp) {
  if (!env.twilio.accountSid || !env.twilio.authToken) {
    // No provider configured (e.g. local dev) — log instead of sending.
    console.log(`[otp] (dev) OTP for ${phone}: ${otp}`);
    return;
  }
  const twilio = require('twilio')(env.twilio.accountSid, env.twilio.authToken);
  await twilio.messages.create({
    body: `Your IdleX verification code is ${otp}`,
    from: env.twilio.fromNumber,
    to: phone,
  });
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

module.exports = { generateOtp, sendOtpSms, issueEmailOtp, verifyEmailOtpRecord };