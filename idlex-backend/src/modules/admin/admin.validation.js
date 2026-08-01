const { z } = require('zod');

const kycReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

module.exports = { kycReviewSchema };
