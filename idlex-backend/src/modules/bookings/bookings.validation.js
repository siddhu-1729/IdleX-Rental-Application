const { z } = require('zod');

const createBookingSchema = z.object({
  listingId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const cancelBookingSchema = z.object({
  reason: z.string().min(1),
});

const extensionRequestSchema = z.object({
  requestedNewEndDate: z.coerce.date(),
  reason: z.string().optional(),
});

const extensionRespondSchema = z.object({
  approve: z.boolean(),
});

module.exports = {
  createBookingSchema,
  cancelBookingSchema,
  extensionRequestSchema,
  extensionRespondSchema,
};
