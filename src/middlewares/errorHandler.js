const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.code === '23505') error = new AppError('Duplicate field value', 400);
  if (err.code === '23503') error = new AppError('Referenced record not found', 400);
  if (err.code === '22P02') error = new AppError('Invalid input format', 400);
  if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401);
  if (err.name === 'TokenExpiredError') error = new AppError('Token expired', 401);

  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : 'Internal server error';

  if (statusCode === 500) {
    logger.error(`${err.message}\n${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;