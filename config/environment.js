import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['API_KEY'];

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
  },
  ai: {
    model: process.env.AI_MODEL || 'gemini-1.5-pro',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
    topK: parseInt(process.env.AI_TOP_K) || 40,
    topP: parseFloat(process.env.AI_TOP_P) || 0.8
  }
};

export const validateEnvironment = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (!config.apiKey) {
    throw new Error('API_KEY is required but not provided');
  }

  console.log('✅ Environment variables validated successfully');
};