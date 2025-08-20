/**
 * 🤲 Gesture System Exports
 * 
 * Comprehensive gesture system exports including mobile optimization components
 * 
 * @version 2.0.0
 * @author CODAI Ecosystem
 * @created 2025-01-08
 */

// Core Gesture Engine
export * from './advanced-gesture-engine';

// Service Configurations  
export * from './gesture-service-configs';

// Mobile Touch Optimization
export * from './mobile-touch-optimization';
export * from './mobile-touch-react';

// React Integration (Main Export)
export * from './react-gesture-integration';

// Type Definitions
export type {
    GestureType,
    GestureEvent,
    GestureHandler,
    GestureConfig,
    TouchCapabilities,
    HapticPattern,
    TouchMetrics,
    DeviceInfo
} from './mobile-touch-optimization';

export type {
    GestureInfo,
    ServiceGestureHandlers,
    PerformanceMetrics
} from './react-gesture-integration';
