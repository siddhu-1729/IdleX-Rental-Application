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

// Single-step submission: the user uploads a document (PDF) and a live
// selfie captured at submission time. Both go to the admin for review.
const submitKyc = asyncHandler(async (req, res) => {
  const files = req.files || {};
  if (!files.file || !files.file[0]) throw ApiError.badRequest('A document file (PDF) is required');
  if (!files.selfie || !files.selfie[0]) throw ApiError.badRequest('A live selfie is required');

  let kyc = await Kyc.findOne({ user: req.user._id });
  if (!kyc) kyc = await Kyc.create({ user: req.user._id });

  kyc.document = {
    fileUrl: `/uploads/${files.file[0].filename}`,
    uploadedAt: new Date(),
  };
  kyc.selfie = {
    fileUrl: `/uploads/${files.selfie[0].filename}`,
    uploadedAt: new Date(),
  };

  // Bank details are part of payment setup: on KYC approval they become
  // the user's PayoutSettings so owners can receive rental earnings.
  const { accountHolderName, accountNumber, ifsc, bankName, upiId } = req.body;
  if (!String(accountHolderName || '').trim() || !String(accountNumber || '').trim() ||
      !String(ifsc || '').trim() || !String(bankName || '').trim()) {
    throw ApiError.badRequest(
      'Bank details are required for payment setup: account holder name, account number, IFSC code and bank name'
    );
  }
  kyc.bankDetails = {
    accountHolderName: String(accountHolderName).trim(),
    accountNumber: String(accountNumber).trim(),
    ifsc: String(ifsc).trim().toUpperCase(),
    bankName: String(bankName).trim(),
    upiId: upiId ? String(upiId).trim() : undefined,
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
    summary: 'Submitted document and live selfie for KYC review',
    req,
  });
  return new ApiResponse(200, kyc, 'KYC submitted for review').send(res);
});

module.exports = { getMyKyc, submitKyc };