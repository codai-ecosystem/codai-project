// Advanced Analytics Index - Main export file for the advanced analytics package
// Provides unified access to all analytics and monitoring components

// Core Analytics Engine
export { default as AdvancedAnalyticsEngine } from './AdvancedAnalyticsEngine';

// Analytics Components
export { default as UserBehaviorAnalyzer } from './analytics/UserBehaviorAnalyzer';
export { default as PerformanceMonitor } from './monitoring/PerformanceMonitor';
export { default as BusinessIntelligenceEngine } from './reporting/BusinessIntelligenceEngine';
export { default as PredictiveAnalyticsEngine } from './predictive/PredictiveAnalyticsEngine';
export { default as ABTestingFramework } from './testing/ABTestingFramework';

// Storage Managers
export { DatabaseManager } from './storage/DatabaseManager';
export { CacheManager } from './storage/CacheManager';

// Utility Functions
export { createLogger } from './utils/logger';
export { validateConfig } from './utils/validation';
export { formatMetrics } from './utils/formatting';

// Type Definitions
export * from './types';

// Configuration Helpers
export {
    DEFAULT_ANALYTICS_CONFIG,
    DEFAULT_PERFORMANCE_THRESHOLDS,
    createAnalyticsConfig,
    validateAnalyticsConfig
} from './config/defaults';

/**
 * Advanced Analytics Package
 * 
 * A comprehensive analytics and monitoring solution for the CODAI ecosystem providing:
 * 
 * ## Core Capabilities
 * - **User Behavior Analytics**: Track user journeys, segments, funnels, and cohorts
 * - **Performance Monitoring**: Real-time Core Web Vitals, resource optimization
 * - **Business Intelligence**: KPI calculation, automated reporting, forecasting
 * - **Predictive Analytics**: Machine learning models, time series forecasting
 * - **A/B Testing**: Experiment design, statistical analysis, conversion optimization
 * 
 * ## Enterprise Features
 * - Real-time data processing with sub-second latency
 * - Scalable architecture supporting millions of events per day
 * - Advanced caching and database optimization
 * - Comprehensive error handling and health monitoring
 * - Extensible plugin architecture for custom analytics
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { AdvancedAnalyticsEngine, createAnalyticsConfig } from '@codai/advanced-analytics';
 * 
 * // Initialize analytics engine
 * const config = createAnalyticsConfig({
 *   storage: {
 *     database: { type: 'postgresql', url: 'postgresql://...' },
 *     cache: { type: 'redis', url: 'redis://...' }
 *   },
 *   realTime: {
 *     enabled: true,
 *     batchSize: 100,
 *     flushInterval: 5000
 *   }
 * });
 * 
 * const analytics = new AdvancedAnalyticsEngine(config);
 * await analytics.initialize();
 * 
 * // Track user behavior
 * await analytics.trackEvent({
 *   type: 'page_view',
 *   userId: 'user123',
 *   properties: { page: '/dashboard', referrer: '/login' }
 * });
 * 
 * // Monitor performance
 * await analytics.recordPerformanceMetrics({
 *   webVitals: { lcp: 2100, fid: 80, cls: 0.05 },
 *   navigation: { domContentLoaded: 1200, loadComplete: 2500 }
 * });
 * 
 * // Generate business report
 * const report = await analytics.generateBusinessReport('executive', {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-31')
 * });
 * ```
 * 
 * ## Component Architecture
 * 
 * ### AdvancedAnalyticsEngine
 * Main orchestration engine that coordinates all analytics components
 * - Event tracking and processing
 * - Component lifecycle management
 * - Configuration and health monitoring
 * 
 * ### UserBehaviorAnalyzer
 * Comprehensive user behavior tracking and analysis
 * - Event processing and aggregation
 * - User journey mapping and funnel analysis
 * - Segmentation and cohort tracking
 * 
 * ### PerformanceMonitor
 * Real-time performance monitoring and optimization
 * - Core Web Vitals tracking (LCP, FID, CLS)
 * - Resource performance analysis
 * - Anomaly detection and recommendations
 * 
 * ### BusinessIntelligenceEngine
 * Enterprise business analytics and reporting
 * - KPI calculation and tracking
 * - Automated report generation
 * - Executive dashboards and insights
 * 
 * ### PredictiveAnalyticsEngine
 * Machine learning and forecasting capabilities
 * - Model training and deployment
 * - Time series forecasting
 * - Anomaly detection and predictions
 * 
 * ### ABTestingFramework
 * Advanced experimentation and conversion optimization
 * - Experiment design and management
 * - Statistical significance testing
 * - Multi-variate testing support
 * 
 * ## Integration Examples
 * 
 * ### React Integration
 * ```typescript
 * import { useAnalytics } from '@codai/advanced-analytics/react';
 * 
 * function MyComponent() {
 *   const analytics = useAnalytics();
 *   
 *   const handleClick = () => {
 *     analytics.trackEvent({
 *       type: 'button_click',
 *       properties: { button: 'cta', location: 'header' }
 *     });
 *   };
 *   
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 * 
 * ### Node.js API Integration
 * ```typescript
 * import express from 'express';
 * import { AdvancedAnalyticsEngine } from '@codai/advanced-analytics';
 * 
 * const app = express();
 * const analytics = new AdvancedAnalyticsEngine(config);
 * 
 * app.use(async (req, res, next) => {
 *   // Track API usage
 *   await analytics.trackEvent({
 *     type: 'api_request',
 *     properties: {
 *       endpoint: req.path,
 *       method: req.method,
 *       userAgent: req.get('User-Agent')
 *     }
 *   });
 *   next();
 * });
 * ```
 * 
 * ### A/B Testing Integration
 * ```typescript
 * import { ABTestingFramework } from '@codai/advanced-analytics';
 * 
 * const abTesting = new ABTestingFramework(config);
 * 
 * // Create experiment
 * const experiment = await abTesting.createExperiment({
 *   name: 'Checkout Flow Test',
 *   variants: [
 *     { id: 'control', name: 'Original', allocation: 0.5 },
 *     { id: 'variant_a', name: 'Simplified', allocation: 0.5 }
 *   ],
 *   goals: [{ metric: 'conversion_rate', target: 0.05 }]
 * });
 * 
 * // Get user assignment
 * const variant = await abTesting.getUserAssignment('user123', experiment.id);
 * 
 * // Track conversion
 * await abTesting.trackConversion('user123', experiment.id, 'purchase', 99.99);
 * ```
 * 
 * ## Configuration Options
 * 
 * ### Storage Configuration
 * ```typescript
 * const config = {
 *   storage: {
 *     database: {
 *       type: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
 *       url: 'postgresql://localhost:5432/analytics',
 *       pool: { min: 2, max: 10 },
 *       ssl: true
 *     },
 *     cache: {
 *       type: 'redis', // 'redis' | 'memory'
 *       url: 'redis://localhost:6379',
 *       ttl: 3600,
 *       keyPrefix: 'analytics:'
 *     }
 *   }
 * };
 * ```
 * 
 * ### Real-time Processing
 * ```typescript
 * const config = {
 *   realTime: {
 *     enabled: true,
 *     batchSize: 100,
 *     flushInterval: 5000,
 *     maxRetries: 3,
 *     retryDelay: 1000
 *   }
 * };
 * ```
 * 
 * ### Performance Monitoring
 * ```typescript
 * const config = {
 *   performance: {
 *     enabled: true,
 *     thresholds: {
 *       lcp: { good: 2500, needsImprovement: 4000, poor: 4000 },
 *       fid: { good: 100, needsImprovement: 300, poor: 300 },
 *       cls: { good: 0.1, needsImprovement: 0.25, poor: 0.25 }
 *     },
 *     sampling: 0.1 // 10% sampling rate
 *   }
 * };
 * ```
 * 
 * ## Best Practices
 * 
 * ### Event Tracking
 * - Use consistent event naming conventions
 * - Include relevant context in event properties
 * - Implement client-side buffering for offline scenarios
 * - Use sampling for high-volume events
 * 
 * ### Performance Monitoring
 * - Monitor Core Web Vitals continuously
 * - Set appropriate performance thresholds
 * - Implement automated alerting for performance regressions
 * - Use performance budgets in CI/CD pipelines
 * 
 * ### A/B Testing
 * - Design experiments with proper statistical power
 * - Use consistent user assignment across sessions
 * - Monitor experiment performance in real-time
 * - Document experiment results and learnings
 * 
 * ### Data Privacy
 * - Implement proper data anonymization
 * - Respect user privacy preferences
 * - Comply with GDPR, CCPA, and other regulations
 * - Use data retention policies
 * 
 * ## Support and Documentation
 * 
 * - **GitHub**: https://github.com/codai-project/advanced-analytics
 * - **Documentation**: https://docs.codai.dev/analytics
 * - **Examples**: https://github.com/codai-project/analytics-examples
 * - **Community**: https://discord.gg/codai
 * 
 * ## License
 * 
 * MIT License - see LICENSE file for details
 */

// Default export for convenient importing
export default AdvancedAnalyticsEngine;
