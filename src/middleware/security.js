import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

export const setupSecurity = (app) => {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests from this IP, please try again later.'
        }
      });
    }
  });

  app.use('/api/', limiter);

  // Compression
  app.use(compression());

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(req, res, duration);
    });
    
    next();
  });

  logger.info('Security middleware configured successfully');
};