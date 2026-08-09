const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const otpRequestSchema = z.object({
  phone: z.string().min(7),
});

const otpVerifySchema = z.object({
  phone: z.string().min(7),
  code: z.string().length(6),
});

const emailOtpRequestSchema = z.object({
  email: z.string().email(),
});

const emailOtpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

// Profile update — `becomeOwner` flips the renter->owner dual-capability
// flag (role + isOwner), the documented way a renter starts listing.
const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  avatarUrl: z.string().optional(),
  becomeOwner: z.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  emailOtpRequestSchema,
  emailOtpVerifySchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  updateMeSchema,
};
