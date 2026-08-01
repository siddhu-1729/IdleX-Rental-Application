const crypto = require('crypto');
const env = require('../config/env');

// OTP generation/delivery is treated as an external concern, same as the
// Django doc calls out (Django/Express have no built-in SMS sending).
// Swap sendOtpSms's internals for Twilio, MSG91, etc. — the rest of the
// auth flow doesn't need to know which provider is behind it.
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

module.exports = { generateOtp, sendOtpSms };
