import { aiService } from '../../services/aiService.js';
import { logger } from '../../utils/logger.js';
import { asyncHandler } from '../../utils/errorHandler.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const startTime = Date.now();

  logger.info('Processing chat message', {
    promptLength: prompt.length,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const result = await aiService.generateResponse(prompt);
  const totalDuration = Date.now() - startTime;

  logger.info('Chat message processed successfully', {
    totalDuration: `${totalDuration}ms`,
    aiDuration: result.metadata.duration,
    responseLength: result.text.length
  });

  res.json({
    success: true,
    data: {
      reply: result.text,
      metadata: {
        ...result.metadata,
        totalProcessingTime: totalDuration
      }
    }
  });
});

export const healthCheck = asyncHandler(async (req, res) => {
  const aiHealth = await aiService.healthCheck();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ai: aiHealth,
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    }
  };

  if (aiHealth.status !== 'healthy') {
    health.status = 'degraded';
    res.status(503);
  }

  res.json(health);
});