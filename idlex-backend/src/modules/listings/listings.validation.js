const { z } = require('zod');

const createListingSchema = z.object({
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
});

const updateListingSchema = createListingSchema.partial();

const availabilitySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().optional(),
});

module.exports = { createListingSchema, updateListingSchema, availabilitySchema };
