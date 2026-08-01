const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const authService = require('./auth.service');
const { verifyRefreshToken, signAccessToken } = require('../../utils/tokens');
const User = require('../../models/User');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return new ApiResponse(201, result, 'Registered successfully').send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return new ApiResponse(200, result, 'Logged in successfully').send(res);
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw ApiError.badRequest('refreshToken is required');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Refresh token expired or invalid');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const accessToken = signAccessToken(user);
  return new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
});

const requestOtp = asyncHandler(async (req, res) => {
  await authService.requestOtp(req.body.phone);
  return new ApiResponse(200, null, 'OTP sent').send(res);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const user = await authService.verifyOtp(req.body.phone, req.body.code);
  return new ApiResponse(200, user, 'Phone verified').send(res);
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  return new ApiResponse(200, null, 'If that email exists, a reset link has been sent').send(res);
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
  await authService.confirmPasswordReset(req.body.token, req.body.newPassword);
  return new ApiResponse(200, null, 'Password reset successfully').send(res);
});

const me = asyncHandler(async (req, res) => {
  return new ApiResponse(200, req.user.toSafeJSON(), 'Current user').send(res);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateMe(req.user._id, req.body);
  return new ApiResponse(200, user, 'Profile updated').send(res);
});

module.exports = {
  register,
  login,
  refreshToken,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  confirmPasswordReset,
  me,
  updateMe,
};
