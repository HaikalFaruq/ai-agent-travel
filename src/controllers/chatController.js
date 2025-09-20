import { aiService } from "../services/aiService.js";
import { logger } from "../utils/logger.js";
import { asyncHandler } from "../utils/errorHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  const result = await aiService.generateResponse(prompt);

  res.json({
    success: true,
    data: {
      reply: result.text,
      metadata: result.metadata,
    },
  });
});

export const healthCheck = asyncHandler(async (req, res) => {
  const aiHealth = await aiService.healthCheck();

  const serverMetrics = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
  };

  const response = {
    status: aiHealth.status === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      ai: aiHealth,
      server: serverMetrics,
    },
  };

  if (aiHealth.status === 'healthy') {
    res.json(response);
  } else {
    res.status(503).json(response);
  }
});
