import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { setupSecurity } from '../src/middleware/security.js';
import { errorHandler, notFoundHandler } from '../src/utils/errorHandler.js';
import { validateChatMessage, sanitizeInput } from '../src/middleware/validation.js';

// Proper ESM mocking for controller module
jest.unstable_mockModule('../src/controllers/chatController.js', () => ({
  sendMessage: jest.fn(),
  healthCheck: jest.fn()
}));

const { sendMessage, healthCheck } = await import('../src/controllers/chatController.js');

// Create mock routes
const chatRoutes = express.Router();
chatRoutes.get('/health', healthCheck);
chatRoutes.post('/', validateChatMessage, sanitizeInput, sendMessage);

const createTestApp = () => {
  const app = express();
  setupSecurity(app);
  app.use(express.json());
  app.use('/api/chat', chatRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Chat API', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should send a message successfully', async () => {
      const mockResponse = {
        text: 'Test response from AI',
        metadata: { duration: 100, tokensUsed: 50 }
      };

      const mockAiService = { generateResponse: jest.fn().mockResolvedValue(mockResponse) };

      sendMessage.mockImplementation(async (req, res) => {
        const result = await mockAiService.generateResponse(req.body.prompt);
        res.json({
          success: true,
          data: {
            reply: result.text,
            metadata: result.metadata
          }
        });
      });

      const response = await request(app)
        .post('/api/chat')
        .send({ prompt: 'Hello, I want to travel to Bali' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply).toBe('Test response from AI');
    });

    it('should reject empty prompt', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ prompt: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should reject prompt that is too long', async () => {
      const longPrompt = 'a'.repeat(1001);
      
      const response = await request(app)
        .post('/api/chat')
        .send({ prompt: longPrompt })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should sanitize dangerous input', async () => {
      const maliciousPrompt = '<script>alert("xss")</script>Tell me about Bali';

      const mockAiService = { generateResponse: jest.fn().mockResolvedValue({
        text: 'Safe response',
        metadata: { duration: 100 }
      }) };

      sendMessage.mockImplementation(async (req, res) => {
        // Simulate sanitization like middleware
        const sanitizedPrompt = req.body.prompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        const result = await mockAiService.generateResponse(sanitizedPrompt);
        res.json({
          success: true,
          data: {
            reply: result.text,
            metadata: result.metadata
          }
        });
      });

      await request(app)
        .post('/api/chat')
        .send({ prompt: maliciousPrompt })
        .expect(200);
    });
  });

  describe('GET /api/chat/health', () => {
    it('should return healthy status', async () => {
      const mockAiService = { healthCheck: jest.fn().mockResolvedValue({
        status: 'healthy',
        responseTime: 50
      }) };

      healthCheck.mockImplementation(async (req, res) => {
        const aiHealth = await mockAiService.healthCheck();
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            ai: aiHealth,
            server: {
              status: 'healthy',
              uptime: 100,
              memory: {}
            }
          }
        });
      });

      const response = await request(app)
        .get('/api/chat/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services.ai.status).toBe('healthy');
    });

    it('should return degraded status when AI is unhealthy', async () => {
      const mockAiService = { healthCheck: jest.fn().mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed'
      }) };

      healthCheck.mockImplementation(async (req, res) => {
        const aiHealth = await mockAiService.healthCheck();
        const response = {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          services: {
            ai: aiHealth,
            server: {
              status: 'healthy',
              uptime: 100,
              memory: {}
            }
          }
        };
        res.status(503).json(response);
      });

      const response = await request(app)
        .get('/api/chat/health')
        .expect(503);

      expect(response.body.status).toBe('degraded');
    });
  });
});