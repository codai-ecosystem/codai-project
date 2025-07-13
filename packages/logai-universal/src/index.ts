export * from './types'
export * from './logger'
export * from './analytics'

// Main exports
export { LogAI, createLogAI } from './logger'
export { LogAIAnalytics } from './analytics'

// Pre-configured loggers
export {
  CodaiLogger,
  RomaiLogger,
  DexaiLogger,
  ConversaiLogger,
  DonaiLogger
} from './logger'

// Version
export const VERSION = '2.0.0'

// Default configuration
export const DEFAULT_CONFIG = {
  batchSize: 50,
  flushInterval: 5000,
  realtimeEnabled: true,
  endpoint: 'ws://localhost:4036/ws',
  locale: 'ro-RO',
  features: ['real-time', 'analytics']
} as const
