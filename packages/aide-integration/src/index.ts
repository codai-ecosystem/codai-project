/**
 * AIDE Integration Layer
 * 
 * This module provides centralized service orchestration for connecting AIDE 
 * with all CODAI ecosystem services including SSO, analytics, monitoring, 
 * security, and deployment.
 */

export * from './services';
export * from './orchestrator';
export * from './types';
export * from './config';

// Main integration factory
export { createAIDEIntegration } from './integration-factory';

// Service registries
export { ServiceRegistry } from './service-registry';

// Event system
export { EventBus } from './event-bus';
