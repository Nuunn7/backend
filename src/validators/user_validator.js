const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Name must be between 2 and 150 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('identifier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Identifier must be at most 100 characters'),
  handleValidation,
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  handleValidation,
];

const validateChangeRole = [
  body('role')
    .isIn(['VOLUNTEER', 'ORGANIZER', 'ADMIN'])
    .withMessage('Role must be VOLUNTEER, ORGANIZER, or ADMIN'),
  handleValidation,
];

module.exports = {
  validateUpdateProfile,
  validateChangePassword,
  validateChangeRole,
};