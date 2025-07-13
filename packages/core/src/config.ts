import { z } from 'zod';

// Environment configuration schema
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Service configuration
export const SERVICES = {
  AIDE: {
    name: 'aide',
    url: process.env.AIDE_URL || 'https://aide.codai.ro',
    port: 3001,
  },
  MEMORAI: {
    name: 'memorai',
    url: process.env.MEMORAI_URL || 'https://memorai.ro',
    port: 3004,
  },
  LOGAI: {
    name: 'logai',
    url: process.env.LOGAI_URL || 'https://logai.ro',
    port: 3002,
  },
  BANCAI: {
    name: 'bancai',
    url: process.env.BANCAI_URL || 'https://bancai.ro',
    port: 3003,
  },
  FABRICAI: {
    name: 'fabricai',
    url: process.env.FABRICAI_URL || 'https://fabricai.ro',
    port: 3005,
  },
} as const;

// Domain mappings
export const DOMAINS = {
  MAIN: 'codai.ro',
  AIDE: 'aide.codai.ro',
  MEMORAI: 'memorai.ro',
  LOGAI: 'logai.ro',
  BANCAI: 'bancai.ro',
  FABRICAI: 'fabricai.ro',
  API: 'api.codai.ro',
  STATUS: 'status.codai.ro',
} as const;

// API routes configuration
export const API_ROUTES = {
  '/auth/*': DOMAINS.LOGAI,
  '/memory/*': DOMAINS.MEMORAI,
  '/aide/*': DOMAINS.AIDE,
  '/status': DOMAINS.STATUS,
  '/health': 'internal-health-check',
} as const;

export function validateEnv(env: Record<string, any>): EnvConfig {
  return envSchema.parse(env);
}

export function getServiceConfig(serviceName: keyof typeof SERVICES) {
  return SERVICES[serviceName];
}
