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

// Single-step submission: the user uploads their password-protected
// E-Aadhaar ZIP (downloaded from the e-Aadhaar website), the password
// that unlocks it, and a live selfie captured at submission time. All
// three go to the admin for review.
const submitKyc = asyncHandler(async (req, res) => {
  const files = req.files || {};
  if (!files.file || !files.file[0]) throw ApiError.badRequest('E-Aadhaar ZIP file is required');
  if (!files.selfie || !files.selfie[0]) throw ApiError.badRequest('A live selfie is required');
  if (!req.body.password || !String(req.body.password).trim()) {
    throw ApiError.badRequest('The password for your E-Aadhaar ZIP is required');
  }

  let kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc) kyc = await Kyc.create({ user: req.user._id });

  kyc.eAadhaar = {
    fileUrl: `/uploads/${files.file[0].filename}`,
    password: String(req.body.password).trim(),
    uploadedAt: new Date(),
  };
  kyc.selfie = {
    fileUrl: `/uploads/${files.selfie[0].filename}`,
    uploadedAt: new Date(),
  };
  kyc.status = 'pending';
  kyc.rejectionReason = null;
  kyc.reviewedBy = null;
  kyc.reviewedAt = null;
  await kyc.save();

  logAudit({
    actor: req.user._id,
    action: 'kyc.submitted',
    category: 'kyc',
    resourceType: 'kyc',
    resourceId: kyc._id.toString(),
    summary: 'Submitted E-Aadhaar ZIP and live selfie for KYC review',
    req,
  });
  return new ApiResponse(200, kyc, 'KYC submitted for review').send(res);
});

module.exports = { getMyKyc, submitKyc };