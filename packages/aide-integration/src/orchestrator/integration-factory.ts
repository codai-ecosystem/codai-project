import { ServiceOrchestrator, type OrchestrationConfig } from './service-orchestrator';

/**
 * Factory function to create and configure the AIDE integration layer
 */
export async function createAIDEIntegration(
  config: Partial<OrchestrationConfig> = {}
): Promise<ServiceOrchestrator> {
  const orchestrator = new ServiceOrchestrator(config);
  await orchestrator.initialize();
  return orchestrator;
}

/**
 * Create AIDE integration with default production configuration
 */
export async function createProductionIntegration(): Promise<ServiceOrchestrator> {
  return createAIDEIntegration({
    environment: 'production',
    services: {
      analytics: true,
      auth: true,
      memory: true,
      ai: true,
      realtime: true,
    },
  });
}

/**
 * Create AIDE integration with development configuration
 */
export async function createDevelopmentIntegration(): Promise<ServiceOrchestrator> {
  return createAIDEIntegration({
    environment: 'development',
    services: {
      analytics: true,
      auth: true,
      memory: true,
      ai: true,
      realtime: false, // Disable realtime in development
    },
  });
}
