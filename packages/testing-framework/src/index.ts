/**
 * 🧪 CODAI Testing Framework
 * Comprehensive testing utilities for the entire CODAI ecosystem
 */

export * from './generators';
export * from './utilities';
export * from './templates';
export * from './matchers';
export * from './mocks';

// Core testing configuration
export const CODAI_TEST_CONFIG = {
    coverage: {
        thresholds: {
            sdk: 80,
            service: 70,
            frontend: 60,
            critical: 90,
        },
    },
    timeouts: {
        unit: 5000,
        integration: 15000,
        e2e: 30000,
    },
    environments: {
        node: ['sdk', 'service', 'cli'],
        jsdom: ['frontend', 'component'],
        playwright: ['e2e', 'visual'],
    },
} as const;

// Test categories
export type TestCategory = 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
export type ComponentType = 'sdk' | 'service' | 'frontend' | 'cli' | 'mcp';

// Re-export common testing utilities
export { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
export { render, screen, fireEvent, waitFor } from '@testing-library/react';
export { http } from 'msw';
export { setupServer } from 'msw/node';
