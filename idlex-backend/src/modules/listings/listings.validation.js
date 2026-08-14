const { z } = require('zod');

// Shared listing fields. `otpCode` exists only on create — every listing
// must be confirmed with an emailed OTP before it is saved.
const listingFields = {
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  pricePerDay: z.coerce.number().positive(),
  securityDeposit: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'published', 'paused']).optional(),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
    })
    .optional(),
  extension: z
    .object({
      allowed: z.boolean().optional(),
      pricing: z.enum(['same', 'custom']).optional(),
      ratePercent: z.coerce.number().min(0).optional(),
      requestBeforeHours: z.coerce.number().min(0).optional(),
      maxExtensionDays: z.coerce.number().min(0).optional(),
    })
    .optional(),
};

const createListingSchema = z.object({
  ...listingFields,
  otpCode: z.string().length(6),
});

const updateListingSchema = z.object(listingFields).partial();

const availabilitySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().optional(),
});

module.exports = { createListingSchema, updateListingSchema, availabilitySchema };
