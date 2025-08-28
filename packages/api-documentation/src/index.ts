/**
 * CodAI API Documentation Package
 * Main entry point for the interactive OpenAPI documentation system
 */

// Core exports
export { default as OpenApiGenerator } from './generator';
export { default as DocumentationServer } from './server';

// Type exports
export * from './types';

// Configuration exports
export {
  config,
  documentationConfig,
  documentationHub,
  interactiveFeatures,
  hubTheme,
  codeGenerationConfig,
  defaultOpenApiTemplate
} from './config';

// Default export - Documentation Server for easy instantiation
export { DocumentationServer as default } from './server';