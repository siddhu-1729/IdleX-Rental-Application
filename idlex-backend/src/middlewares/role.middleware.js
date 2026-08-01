const ApiError = require('../utils/ApiError');

// Equivalent of DRF's custom permission classes (IsAdminUser, etc).
// Usage: router.get('/', protect, authorize('admin'), handler)
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

// Equivalent of DRF's object-level IsOwnerOrReadOnly. `getOwnerId` extracts
// the owning user's id from the loaded resource (attached earlier in req).
const isResourceOwner = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);
  if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
    return next(ApiError.forbidden('You do not own this resource'));
  }
  next();
};

module.exports = { authorize, isResourceOwner };
