const crypto = require('crypto');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const { signAccessToken, signRefreshToken } = require('../../utils/tokens');
const { generateOtp, sendOtpSms } = require('../../utils/otp');

// Business logic lives here, controllers stay thin (parse req -> call
// service -> shape response) — mirrors keeping Django views thin and
// pushing logic into a services.py module.

async function register({ name, email, phone, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await User.create({ name, email, phone, password });
  return issueTokens(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account is suspended');
  return issueTokens(user);
}

function issueTokens(user) {
  return {
    user: user.toSafeJSON(),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

async function requestOtp(phone) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 50 * 60 * 1000); // 50 min

  await User.findOneAndUpdate(
    { phone },
    { $set: { otp: { code, expiresAt } } },
    { upsert: false }
  );

  await sendOtpSms(phone, code);
}

async function verifyOtp(phone, code) {
  const user = await User.findOne({ phone }).select('+otp.code +otp.expiresAt');
  if (!user || !user.otp || !user.otp.code) {
    throw ApiError.badRequest('No OTP requested for this number');
  }
  if (user.otp.code !== code || user.otp.expiresAt < new Date()) {
    throw ApiError.badRequest('OTP is invalid or expired');
  }
  user.isPhoneVerified = true;
  user.otp = undefined;
  await user.save();
  return user.toSafeJSON();
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) return; // don't leak whether the email exists

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  // In production: send `token` via an email provider (SendGrid/SES).
  console.log(`[auth] Password reset token for ${email}: ${token}`);
}

async function confirmPasswordReset(token, newPassword) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Reset token is invalid or expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}

// Profile updates + renter->owner upgrade. `becomeOwner` is the only
// path that sets the owner role — registration never accepts it, so
// there is no privilege-escalation surface via register.
async function updateMe(userId, { name, phone, avatarUrl, becomeOwner }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (becomeOwner) {
    user.role = 'owner';
    user.isOwner = true;
  }

  await user.save();
  return user.toSafeJSON();
}

module.exports = {
  register,
  login,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  confirmPasswordReset,
  updateMe,
};
