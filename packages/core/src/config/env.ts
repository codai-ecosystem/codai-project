import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional(),
  DEFAULT_AI_PROVIDER: z.enum(['openai', 'anthropic', 'azure']).default('openai'),

  // Memory Services
  MEMORAI_API_URL: z.string().default('http://localhost:3001'),
  MEMORAI_API_KEY: z.string().default('dev_key_123'),

  // Real-time Services
  WEBSOCKET_URL: z.string().default('ws://localhost:3002'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Analytics
  ANALYTICS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  ANALYTICS_API_URL: z.string().default('http://localhost:3003'),

  // Database
  DATABASE_URL: z.string().default('postgresql://localhost:5432/codai_dev'),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
});

export type Environment = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// AI Provider configuration
export const aiConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
  },
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com',
  },
  azure: {
    apiKey: env.AZURE_OPENAI_API_KEY,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    deploymentName: env.AZURE_OPENAI_DEPLOYMENT_NAME,
  },
  default: env.DEFAULT_AI_PROVIDER,
};

// Service URLs
export const serviceUrls = {
  memorai: env.MEMORAI_API_URL,
  analytics: env.ANALYTICS_API_URL,
  websocket: env.WEBSOCKET_URL,
  redis: env.REDIS_URL,
};

// Feature flags
export const features = {
  analytics: env.ANALYTICS_ENABLED,
  realTimeUpdates: true,
  aiAssistant: true,
  multiProvider: true,
};

export default env;
