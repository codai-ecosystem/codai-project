/**
 * METU Stabilization System Types
 * 
 * Comprehensive type definitions for METU application stabilization system.
 * Provides type safety and IntelliSense support for all stabilization operations.
 */

export interface MetuStabilizationConfig {
  maxConcurrentUsers?: number;
  performanceThresholds?: {
    responseTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    errorRate?: number;
  };
  autoScaling?: {
    enabled?: boolean;
    minInstances?: number;
    maxInstances?: number;
    scaleUpThreshold?: number;
    scaleDownThreshold?: number;
  };
  monitoring?: {
    realTime?: boolean;
    interval?: number;
    retentionDays?: number;
  };
  crossPlatform?: {
    supportedPlatforms?: string[];
    adaptiveUI?: boolean;
    touchOptimization?: boolean;
  };
  web?: MetuWebConfig;
  desktop?: MetuDesktopConfig;
  performance?: MetuPerformanceConfig;
  ui?: MetuUIConfig;
  health?: MetuHealthConfig;
  errorHandling?: MetuErrorConfig;
  analytics?: MetuAnalyticsConfig;
}

export interface MetuWebConfig {
  nextjsOptimization?: boolean;
  bundleAnalyzer?: boolean;
  imageOptimization?: boolean;
  codesplitting?: boolean;
  lazyLoading?: boolean;
  serviceWorker?: boolean;
  caching?: {
    enabled?: boolean;
    strategy?: 'stale-while-revalidate' | 'cache-first' | 'network-first';
    ttl?: number;
  };
  performance?: {
    enableWebVitals?: boolean;
    enableResourceHints?: boolean;
    enablePreloading?: boolean;
  };
}

export interface MetuDesktopConfig {
  electronOptimization?: boolean;
  memoryManagement?: boolean;
  processIsolation?: boolean;
  nativeIntegration?: boolean;
  autoUpdate?: boolean;
  crashReporting?: boolean;
  security?: {
    nodeIntegration?: boolean;
    contextIsolation?: boolean;
    sandbox?: boolean;
  };
  performance?: {
    v8Optimization?: boolean;
    memoryProfiling?: boolean;
    cpuProfiling?: boolean;
  };
}

export interface MetuPerformanceConfig {
  realTimeMonitoring?: boolean;
  metricsCollection?: boolean;
  performanceBudgets?: {
    bundleSize?: number;
    loadTime?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
  };
  optimization?: {
    enableCDN?: boolean;
    enableCompression?: boolean;
    enableMinification?: boolean;
  };
}

export interface MetuUIConfig {
  responsiveDesign?: boolean;
  accessibilityCompliance?: boolean;
  darkModeSupport?: boolean;
  animationOptimization?: boolean;
  touchOptimization?: boolean;
  keyboardNavigation?: boolean;
  screenReaderSupport?: boolean;
  colorContrastCompliance?: boolean;
}

export interface MetuHealthConfig {
  healthCheckInterval?: number;
  healthCheckTimeout?: number;
  healthCheckEndpoints?: string[];
  alerting?: {
    enabled?: boolean;
    channels?: string[];
    thresholds?: {
      critical?: number;
      warning?: number;
    };
  };
}

export interface MetuErrorConfig {
  errorReporting?: boolean;
  errorTracking?: boolean;
  automaticRecovery?: boolean;
  fallbackStrategies?: string[];
  retryPolicies?: {
    maxRetries?: number;
    backoffStrategy?: 'linear' | 'exponential';
    baseDelay?: number;
  };
}

export interface MetuAnalyticsConfig {
  realTimeAnalytics?: boolean;
  userBehaviorTracking?: boolean;
  performanceAnalytics?: boolean;
  errorAnalytics?: boolean;
  customEvents?: boolean;
  dataRetention?: number;
}

export interface MetuStabilizationMetrics {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  activeUsers: number;
  systemLoad: number;
  performanceScore: number;
  userSatisfaction: number;
  systemEfficiency: number;
  stabilityIndex: number;
  webVitals?: {
    cls: number;
    fid: number;
    lcp: number;
    fcp: number;
    ttfb: number;
  };
  electron?: {
    memoryUsage: number;
    cpuUsage: number;
    processes: number;
    windowCount: number;
  };
}

export interface MetuApplicationStatus {
  overall: 'healthy' | 'warning' | 'critical';
  web: MetuWebStatus;
  desktop: MetuDesktopStatus;
  performance: MetuPerformanceStatus;
  platform: MetuPlatformStatus;
  uptime: number;
  lastOptimization: string;
  activeUsers: number;
  systemLoad: number;
}

export interface MetuWebStatus {
  status: 'online' | 'offline' | 'degraded';
  performanceScore: number;
  loadTime: number;
  bundleSize: number;
  cacheHitRate: number;
  errorRate: number;
  activeConnections: number;
}

export interface MetuDesktopStatus {
  status: 'running' | 'stopped' | 'crashed';
  stability: number;
  memoryUsage: number;
  cpuUsage: number;
  processCount: number;
  windowCount: number;
  crashCount: number;
}

export interface MetuPerformanceStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
  bottlenecks: string[];
}

export interface MetuPlatformStatus {
  supportedPlatforms: string[];
  activeUsers: Record<string, number>;
  compatibility: Record<string, number>;
  adaptations: string[];
}

export interface MetuOptimizationResult {
  success: boolean;
  improvements: string[];
  performanceGain: number;
  stabilityScore?: number;
  memoryOptimization?: number;
  uiScore?: number;
  accessibilityScore?: number;
  metrics: {
    before: Partial<MetuStabilizationMetrics>;
    after: Partial<MetuStabilizationMetrics>;
    improvement: Partial<MetuStabilizationMetrics>;
  };
  recommendations: string[];
  timestamp: string;
}

export interface MetuStabilizationReport {
  timestamp: string;
  status: MetuApplicationStatus;
  metrics: MetuStabilizationMetrics;
  analytics: MetuAnalyticsReport;
  recommendations: string[];
  summary: {
    overallHealth: string;
    performanceScore: number;
    userSatisfaction: number;
    systemEfficiency: number;
    stabilityIndex: number;
  };
}

export interface MetuAnalyticsReport {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    sessionDuration: number;
    bounceRate: number;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    successRate: number;
    performanceTrend: number;
  };
  platform: {
    webUsers: number;
    desktopUsers: number;
    mobileUsers: number;
    crossPlatformUsers: number;
  };
  features: {
    mostUsedFeatures: string[];
    leastUsedFeatures: string[];
    featureAdoption: Record<string, number>;
  };
}

export interface MetuHealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: string;
  details?: {
    message?: string;
    error?: string;
    checks?: Record<string, boolean>;
  };
}

export interface MetuScalingEvent {
  type: 'scale-up' | 'scale-down';
  trigger: string;
  instances: {
    before: number;
    after: number;
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    activeUsers: number;
  };
  timestamp: string;
}

export interface MetuErrorEvent {
  id: string;
  type: 'web' | 'desktop' | 'api' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: Record<string, any>;
  user?: {
    id?: string;
    platform?: string;
    version?: string;
  };
  timestamp: string;
  resolved: boolean;
  resolutionTime?: number;
}

export interface MetuPerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  status: 'pass' | 'warn' | 'fail';
  impact: 'low' | 'medium' | 'high';
}

export interface MetuCrossPlatformAdaptation {
  platform: string;
  adaptations: {
    ui: string[];
    performance: string[];
    features: string[];
  };
  compatibility: number;
  userFeedback: number;
}

// Event types for real-time updates
export interface MetuStabilizationEvents {
  'system:started': {};
  'system:stopped': {};
  'optimization:completed': MetuOptimizationResult;
  'performance:threshold-exceeded': { metric: string; value: number; threshold: number };
  'error:critical': MetuErrorEvent;
  'scaling:event': MetuScalingEvent;
  'health:status-changed': { service: string; status: string };
  'user:satisfaction-updated': { score: number; trend: number };
}

// Utility types
export type MetuPlatform = 'web' | 'desktop' | 'mobile';
export type MetuEnvironment = 'development' | 'staging' | 'production';
export type MetuOptimizationType = 'web' | 'desktop' | 'ui' | 'performance' | 'all';

export interface MetuStabilizationEventEmitter {
  on<K extends keyof MetuStabilizationEvents>(
    event: K,
    listener: (data: MetuStabilizationEvents[K]) => void
  ): void;
  emit<K extends keyof MetuStabilizationEvents>(
    event: K,
    data: MetuStabilizationEvents[K]
  ): void;
  off<K extends keyof MetuStabilizationEvents>(
    event: K,
    listener: (data: MetuStabilizationEvents[K]) => void
  ): void;
}
