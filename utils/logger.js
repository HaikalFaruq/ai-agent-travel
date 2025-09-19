import { config } from '../config/environment.js';

class Logger {
  constructor() {
    this.isProduction = config.nodeEnv === 'production';
  }

  info(message, meta = {}) {
    const logData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    if (this.isProduction) {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`ℹ️ [INFO] ${message}`, meta);
    }
  }

  error(message, error = null, meta = {}) {
    const logData = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null,
      ...meta
    };
    
    if (this.isProduction) {
      console.error(JSON.stringify(logData));
    } else {
      console.error(`❌ [ERROR] ${message}`, error || '', meta);
    }
  }

  warn(message, meta = {}) {
    const logData = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    if (this.isProduction) {
      console.warn(JSON.stringify(logData));
    } else {
      console.warn(`⚠️ [WARN] ${message}`, meta);
    }
  }

  debug(message, meta = {}) {
    if (!this.isProduction) {
      console.debug(`🐛 [DEBUG] ${message}`, meta);
    }
  }

  http(req, res, responseTime) {
    const logData = {
      level: 'http',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    };

    if (this.isProduction) {
      console.log(JSON.stringify(logData));
    } else {
      const status = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${status} ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    }
  }
}

export const logger = new Logger();