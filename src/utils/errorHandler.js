import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export class AIServiceError extends AppError {
  constructor(message = 'AI service error') {
    super(message, 503);
  }
}

export const errorHandler = (err, req, res, next) => {
  const error = err; // preserve prototype to keep instanceof checks

  // Log error with more details
  logger.error('Error occurred', {
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let message = 'Server Error';
  let statusCode = 500;

  // Handle known errors
  if (error instanceof AppError) {
    message = error.message;
    statusCode = error.statusCode;
    logger.info('Handled as AppError', { message, statusCode });
  } else if (err.name === 'ValidationError') {
    message = err.message || 'Validation failed';
    statusCode = 400;
    logger.info('Handled as ValidationError', { message, statusCode });
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  } else {
    logger.warn('Unhandled error type', { errorName: err.name, errorType: typeof err });
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};