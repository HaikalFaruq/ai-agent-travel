import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export const validateChatMessage = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Prompt must be between 1 and 1000 characters')
    .matches(/^[a-zA-Z0-9\s.,?!;:()\-'"\/\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]+$/)
    .withMessage('Prompt contains invalid characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      logger.warn('Validation failed', {
        errors: errors.array(),
        body: req.body,
        ip: req.ip
      });
      
      const errorMessages = errors.array().map(error => error.msg);
      throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
    }
    
    next();
  }
];

export const sanitizeInput = (req, res, next) => {
  if (req.body.prompt) {
    // Remove potential script tags and dangerous content
    req.body.prompt = req.body.prompt
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  next();
};