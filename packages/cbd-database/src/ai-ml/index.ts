/**
 * AI/ML Integration Module
 * 
 * Comprehensive AI/ML capabilities for the CBD Database including:
 * - AutoML engine with neural architecture search
 * - Model registry with versioning and governance
 * - Feature store with online/offline serving
 * - Inference pipeline with real-time and batch processing
 * - Complete MLOps lifecycle management
 */

// Core AI/ML types and interfaces
export * from './AIMLTypes';

// Main classes for AI/ML components
export { AutoMLEngine } from './AutoMLEngine';
export { ModelRegistry } from './ModelRegistry';
export { FeatureStore } from './FeatureStore';
export { InferencePipelineEngine } from './InferencePipeline';
export { FederatedLearningManager } from './FederatedLearningManager';