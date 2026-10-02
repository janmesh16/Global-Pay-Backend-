const ApiError = require('../utils/ApiError');

/**
 * Validation middleware using Joi schemas.
 * @param {Object} schema - Joi schema
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      errors: { wrap: { label: false } },
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw ApiError.validation(errors);
    }

    // Replace with validated and stripped value
    req[source] = value;
    next();
  };
};

module.exports = validate;
