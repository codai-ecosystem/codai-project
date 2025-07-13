import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// AI Provider Configuration
export const AI_PROVIDERS = {
  openai: {
    'gpt-4o': openai('gpt-4o'),
    'gpt-4o-mini': openai('gpt-4o-mini'),
    'gpt-4-turbo': openai('gpt-4-turbo'),
  },
  anthropic: {
    'claude-3-5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
    'claude-3-5-haiku': anthropic('claude-3-5-haiku-20241022'),
    'claude-3-opus': anthropic('claude-3-opus-20240229'),
  },
} as const;

// Export all AI utilities
export * from './code-generation';
export * from './testing';
export * from './documentation';
export * from './review';
export * from './refactoring';
export * from './chat';
export * from './monitoring';
export * from './security';
export * from './optimization';
