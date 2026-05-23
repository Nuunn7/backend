const { body, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

const validateActivity = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid ISO8601 date is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 255 })
    .withMessage('Location must be at most 255 characters'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),
  handleValidation,
];

const validateActivityUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid ISO8601 date is required'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Location must be at most 255 characters'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),
  body('status')
    .optional()
    .isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be UPCOMING, ONGOING, COMPLETED, or CANCELLED'),
  handleValidation,
];

const validateVerify = [
  body('hours')
    .notEmpty()
    .withMessage('Hours is required')
    .isFloat({ min: 0.1, max: 999.99 })
    .withMessage('Hours must be a positive number between 0.1 and 999.99'),
  handleValidation,
];

// GET /activities (query string)
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
    .isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be UPCOMING, ONGOING, COMPLETED, or CANCELLED'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search term must be at most 200 characters'),
  handleValidation,
];

module.exports = {
  validateActivity,
  validateActivityUpdate,
  validateVerify,
  validateListQuery,
};