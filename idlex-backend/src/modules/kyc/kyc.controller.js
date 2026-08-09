const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Kyc = require('../../models/Kyc');
const { logAudit } = require('../../utils/audit');

const getMyKyc = asyncHandler(async (req, res) => {
  let kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc) kyc = await Kyc.create({ user: req.user._id });
  return new ApiResponse(200, kyc, 'KYC status').send(res);
});

// Each step POST just updates fields on the one KycSubmission row —
// same save-and-resume pattern the Django doc calls for.
const submitStep = asyncHandler(async (req, res) => {
  const { step } = req.params;
  const validSteps = ['id-upload', 'selfie', 'bank-details'];
  if (!validSteps.includes(step)) throw ApiError.badRequest('Unknown KYC step');

  let kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc) kyc = await Kyc.create({ user: req.user._id });

  if (step === 'id-upload') {
    if (!req.file) throw ApiError.badRequest('ID document file is required');
    kyc.idDocument = {
      type: req.body.documentType || 'national_id',
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };
    kyc.currentStep = 'selfie';
  } else if (step === 'selfie') {
    if (!req.file) throw ApiError.badRequest('Selfie file is required');
    kyc.selfie = { fileUrl: `/uploads/${req.file.filename}`, uploadedAt: new Date() };
    kyc.currentStep = 'bank-details';
  } else if (step === 'bank-details') {
    const { accountHolderName, accountNumber, ifscOrRoutingNumber, bankName } = req.body;
    kyc.bankDetails = { accountHolderName, accountNumber, ifscOrRoutingNumber, bankName };
    kyc.currentStep = 'completed';
  }

  kyc.status = 'in_progress';
  await kyc.save();
  logAudit({
    actor: req.user._id,
    action: 'kyc.step_saved',
    category: 'kyc',
    resourceType: 'kyc',
    resourceId: kyc._id.toString(),
    summary: `Saved KYC step '${step}'`,
    req,
  });
  return new ApiResponse(200, kyc, `Step '${step}' saved`).send(res);
});

const finalizeSubmission = asyncHandler(async (req, res) => {
  const kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc) throw ApiError.notFound('No KYC submission found');
  if (!kyc.idDocument?.fileUrl || !kyc.selfie?.fileUrl || !kyc.bankDetails?.accountNumber) {
    throw ApiError.badRequest('All KYC steps must be completed before submitting');
  }
  kyc.status = 'pending';
  await kyc.save();
  logAudit({
    actor: req.user._id,
    action: 'kyc.submitted',
    category: 'kyc',
    resourceType: 'kyc',
    resourceId: kyc._id.toString(),
    summary: 'Submitted KYC for review',
    req,
  });
  return new ApiResponse(200, kyc, 'KYC submitted for review').send(res);
});

module.exports = { getMyKyc, submitStep, finalizeSubmission };
