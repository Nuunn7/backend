const { query, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

// GET /participations (query string filters)
const validateListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PENDING', 'VERIFIED', 'REJECTED'])
    .withMessage('Status must be PENDING, VERIFIED, or REJECTED'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer'),
  query('activityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('activityId must be a positive integer'),
  handleValidation,
];

module.exports = {
  validateListQuery,
};