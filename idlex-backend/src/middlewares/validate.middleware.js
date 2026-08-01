const ApiError = require('../utils/ApiError');

// Equivalent of DRF serializer .validate() failing -> 400. Pass a Zod
// schema; the middleware parses req.body and replaces it with the
// parsed (and type-coerced) result.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors);
  }
  req.body = result.data;
  next();
};

module.exports = validate;
