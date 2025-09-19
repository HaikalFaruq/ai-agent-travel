import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import chatRoutes from '../src/routes/chat.js';
import { setupSecurity } from '../middleware/security.js';
import { errorHandler, notFoundHandler } from '../utils/errorHandler.js';

// Mock AI service for testing
const mockAiService = {
  generateResponse: jest.fn(),
  healthCheck: jest.fn()
};

jest.mock('../services/aiService.js', () => ({
  aiService: mockAiService
}));

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

      mockAiService.generateResponse.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({ prompt: 'Hello, I want to travel to Bali' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply).toBe('Test response from AI');
      expect(mockAiService.generateResponse).toHaveBeenCalledWith('Hello, I want to travel to Bali');
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
      
      mockAiService.generateResponse.mockResolvedValue({
        text: 'Safe response',
        metadata: { duration: 100 }
      });

      await request(app)
        .post('/api/chat')
        .send({ prompt: maliciousPrompt })
        .expect(200);

      // Check that the script tag was removed
      expect(mockAiService.generateResponse).toHaveBeenCalledWith('Tell me about Bali');
    });
  });

  describe('GET /api/chat/health', () => {
    it('should return healthy status', async () => {
      mockAiService.healthCheck.mockResolvedValue({
        status: 'healthy',
        responseTime: 50
      });

      const response = await request(app)
        .get('/api/chat/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services.ai.status).toBe('healthy');
    });

    it('should return degraded status when AI is unhealthy', async () => {
      mockAiService.healthCheck.mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed'
      });

      const response = await request(app)
        .get('/api/chat/health')
        .expect(503);

      expect(response.body.status).toBe('degraded');
    });
  });
});