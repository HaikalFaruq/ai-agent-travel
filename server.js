import express from "express";
import { config, validateEnvironment } from "./src/config/environment.js";
import { setupSecurity } from "./src/middleware/security.js";
import { errorHandler, notFoundHandler } from "./src/utils/errorHandler.js";
import { logger } from "./src/utils/logger.js";
import chatRoutes from "./src/routes/chat.js";

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

const app = express();

// Setup security middleware
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
console.log('Registering chat routes...');
app.use("/api/chat", chatRoutes);
console.log('Chat routes registered successfully');

// Static files (UI)
app.use(express.static("public"));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('Server closed. Process exiting...');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', err);
  gracefulShutdown('unhandledRejection');
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

const server = app.listen(config.port, () => {
  logger.info(`🚀 Travel Chatbot Server running on port ${config.port}`, {
    environment: config.nodeEnv,
    port: config.port,
    nodeVersion: process.version,
    pid: process.pid
  });
});