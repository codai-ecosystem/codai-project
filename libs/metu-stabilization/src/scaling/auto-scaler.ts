/**
 * METU Auto Scaler
 * 
 * Intelligent auto-scaling system for METU applications.
 * Monitors resource usage, predicts scaling needs, and automatically
 * scales application resources to maintain optimal performance.
 */

import type {
  MetuScalingMetrics,
  MetuScalingConfig,
  MetuScalingStatus
} from '../types';

interface ScalingRule {
  name: string;
  metric: string;
  threshold: number;
  action: 'scale_up' | 'scale_down';
  cooldown: number;
  enabled: boolean;
  priority: number;
}

interface ScalingEvent {
  id: string;
  timestamp: Date;
  action: 'scale_up' | 'scale_down';
  reason: string;
  fromValue: number;
  toValue: number;
  metric: string;
  success: boolean;
  duration: number;
}

interface ResourceLimits {
  min: number;
  max: number;
  step: number;
  type: 'cpu' | 'memory' | 'instances' | 'bandwidth';
}

interface PredictionModel {
  name: string;
  accuracy: number;
  lastTrained: Date;
  predictions: Array<{
    timestamp: Date;
    value: number;
    confidence: number;
  }>;
}

export class MetuAutoScaler {
  private scalingRules: Map<string, ScalingRule> = new Map();
  private scalingEvents: ScalingEvent[] = [];
  private resourceLimits: Map<string, ResourceLimits> = new Map();
  private predictionModels: Map<string, PredictionModel> = new Map();
  private currentMetrics: MetuScalingMetrics | null = null;
  private scalingInProgress: Set<string> = new Set();
  private isEnabled: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(private config: MetuScalingConfig) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      predictionWindow: 300000, // 5 minutes
      scalingCooldown: 180000, // 3 minutes
      enablePredictiveScaling: true,
      maxScalingEvents: 1000,
      ...config
    };
  }

  /**
   * Initialize auto scaler
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing METU Auto Scaler...');

    try {
      // Setup default scaling rules
      await this.setupDefaultScalingRules();

      // Configure resource limits
      await this.configureResourceLimits();

      // Initialize prediction models
      if (this.config.enablePredictiveScaling) {
        await this.initializePredictionModels();
      }

      // Start monitoring
      await this.startMonitoring();

      this.isEnabled = true;
      console.log('✅ Auto Scaler initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Auto Scaler:', error);
      throw error;
    }
  }

  /**
   * Setup default scaling rules
   */
  private async setupDefaultScalingRules(): Promise<void> {
    // CPU-based scaling rules
    this.addScalingRule({
      name: 'cpu_scale_up',
      metric: 'cpu_usage',
      threshold: 0.75, // 75% CPU usage
      action: 'scale_up',
      cooldown: this.config.scalingCooldown,
      enabled: true,
      priority: 1
    });

    this.addScalingRule({
      name: 'cpu_scale_down',
      metric: 'cpu_usage',
      threshold: 0.25, // 25% CPU usage
      action: 'scale_down',
      cooldown: this.config.scalingCooldown * 2, // Longer cooldown for scale down
      enabled: true,
      priority: 2
    });

    // Memory-based scaling rules
    this.addScalingRule({
      name: 'memory_scale_up',
      metric: 'memory_usage',
      threshold: 0.80, // 80% memory usage
      action: 'scale_up',
      cooldown: this.config.scalingCooldown,
      enabled: true,
      priority: 1
    });

    this.addScalingRule({
      name: 'memory_scale_down',
      metric: 'memory_usage',
      threshold: 0.30, // 30% memory usage
      action: 'scale_down',
      cooldown: this.config.scalingCooldown * 2,
      enabled: true,
      priority: 3
    });

    // Response time-based scaling rules
    this.addScalingRule({
      name: 'response_time_scale_up',
      metric: 'avg_response_time',
      threshold: 2000, // 2 seconds
      action: 'scale_up',
      cooldown: this.config.scalingCooldown,
      enabled: true,
      priority: 1
    });

    // User load-based scaling rules
    this.addScalingRule({
      name: 'user_load_scale_up',
      metric: 'active_users',
      threshold: 100, // 100 active users
      action: 'scale_up',
      cooldown: this.config.scalingCooldown,
      enabled: true,
      priority: 2
    });

    this.addScalingRule({
      name: 'user_load_scale_down',
      metric: 'active_users',
      threshold: 20, // 20 active users
      action: 'scale_down',
      cooldown: this.config.scalingCooldown * 3,
      enabled: true,
      priority: 4
    });

    console.log(`⚙️ Configured ${this.scalingRules.size} default scaling rules`);
  }

  /**
   * Configure resource limits
   */
  private async configureResourceLimits(): Promise<void> {
    // CPU scaling limits
    this.resourceLimits.set('cpu', {
      min: 1,
      max: 8,
      step: 1,
      type: 'cpu'
    });

    // Memory scaling limits
    this.resourceLimits.set('memory', {
      min: 512, // 512MB
      max: 8192, // 8GB
      step: 512, // 512MB steps
      type: 'memory'
    });

    // Instance scaling limits
    this.resourceLimits.set('instances', {
      min: 1,
      max: 10,
      step: 1,
      type: 'instances'
    });

    // Bandwidth scaling limits
    this.resourceLimits.set('bandwidth', {
      min: 10, // 10 Mbps
      max: 1000, // 1 Gbps
      step: 50, // 50 Mbps steps
      type: 'bandwidth'
    });

    console.log(`📏 Configured ${this.resourceLimits.size} resource limits`);
  }

  /**
   * Initialize prediction models
   */
  private async initializePredictionModels(): Promise<void> {
    // CPU usage prediction model
    this.predictionModels.set('cpu_usage', {
      name: 'CPU Usage Predictor',
      accuracy: 0.85,
      lastTrained: new Date(),
      predictions: []
    });

    // Memory usage prediction model
    this.predictionModels.set('memory_usage', {
      name: 'Memory Usage Predictor',
      accuracy: 0.80,
      lastTrained: new Date(),
      predictions: []
    });

    // User load prediction model
    this.predictionModels.set('user_load', {
      name: 'User Load Predictor',
      accuracy: 0.75,
      lastTrained: new Date(),
      predictions: []
    });

    console.log(`🧠 Initialized ${this.predictionModels.size} prediction models`);
  }

  /**
   * Start monitoring for auto-scaling
   */
  private async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) return;

    const monitorAndScale = async () => {
      try {
        // Collect current metrics
        await this.collectMetrics();

        // Update prediction models
        if (this.config.enablePredictiveScaling) {
          await this.updatePredictions();
        }

        // Evaluate scaling rules
        await this.evaluateScalingRules();

        // Clean up old events
        this.cleanupOldEvents();

      } catch (error) {
        console.error('Error in auto-scaling monitoring:', error);
      }
    };

    // Initial monitoring
    await monitorAndScale();

    // Schedule periodic monitoring
    this.monitoringInterval = setInterval(monitorAndScale, this.config.checkInterval);

    console.log('📊 Auto-scaling monitoring started');
  }

  /**
   * Collect current metrics
   */
  private async collectMetrics(): Promise<void> {
    // Simulate metric collection (in real implementation, this would collect from monitoring systems)
    const now = new Date();

    this.currentMetrics = {
      timestamp: now,
      cpuUsage: Math.random() * 0.8 + 0.1, // 10-90% CPU usage
      memoryUsage: Math.random() * 0.7 + 0.2, // 20-90% memory usage
      activeUsers: Math.floor(Math.random() * 150 + 10), // 10-160 active users
      avgResponseTime: Math.random() * 3000 + 200, // 200-3200ms response time
      requestsPerSecond: Math.floor(Math.random() * 100 + 10), // 10-110 RPS
      errorRate: Math.random() * 0.05, // 0-5% error rate
      networkIO: Math.random() * 100, // 0-100 Mbps
      diskIO: Math.random() * 50 // 0-50 MB/s
    };
  }

  /**
   * Update prediction models
   */
  private async updatePredictions(): Promise<void> {
    if (!this.currentMetrics) return;

    const now = new Date();
    const predictionWindow = this.config.predictionWindow;

    // Update CPU usage predictions
    const cpuModel = this.predictionModels.get('cpu_usage');
    if (cpuModel) {
      const prediction = this.predictMetric('cpu_usage', this.currentMetrics.cpuUsage);
      cpuModel.predictions.push({
        timestamp: new Date(now.getTime() + predictionWindow),
        value: prediction.value,
        confidence: prediction.confidence
      });

      // Keep only recent predictions
      cpuModel.predictions = cpuModel.predictions.filter(
        p => now.getTime() - p.timestamp.getTime() < predictionWindow * 2
      );
    }

    // Update memory usage predictions
    const memoryModel = this.predictionModels.get('memory_usage');
    if (memoryModel) {
      const prediction = this.predictMetric('memory_usage', this.currentMetrics.memoryUsage);
      memoryModel.predictions.push({
        timestamp: new Date(now.getTime() + predictionWindow),
        value: prediction.value,
        confidence: prediction.confidence
      });

      memoryModel.predictions = memoryModel.predictions.filter(
        p => now.getTime() - p.timestamp.getTime() < predictionWindow * 2
      );
    }

    // Update user load predictions
    const userModel = this.predictionModels.get('user_load');
    if (userModel) {
      const prediction = this.predictMetric('user_load', this.currentMetrics.activeUsers);
      userModel.predictions.push({
        timestamp: new Date(now.getTime() + predictionWindow),
        value: prediction.value,
        confidence: prediction.confidence
      });

      userModel.predictions = userModel.predictions.filter(
        p => now.getTime() - p.timestamp.getTime() < predictionWindow * 2
      );
    }
  }

  /**
   * Predict metric value (simplified ML model)
   */
  private predictMetric(metricName: string, currentValue: number): { value: number; confidence: number } {
    // Simplified prediction algorithm (in real implementation, use proper ML models)
    const trend = Math.random() - 0.5; // Random trend between -0.5 and 0.5
    const noise = (Math.random() - 0.5) * 0.2; // Random noise

    let predictedValue = currentValue + (currentValue * trend * 0.3) + noise;

    // Apply bounds based on metric type
    if (metricName === 'cpu_usage' || metricName === 'memory_usage') {
      predictedValue = Math.max(0, Math.min(1, predictedValue));
    } else if (metricName === 'user_load') {
      predictedValue = Math.max(0, predictedValue);
    }

    const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence

    return { value: predictedValue, confidence };
  }

  /**
   * Evaluate scaling rules
   */
  private async evaluateScalingRules(): Promise<void> {
    if (!this.currentMetrics) return;

    const eligibleRules = Array.from(this.scalingRules.values())
      .filter(rule => rule.enabled)
      .filter(rule => !this.isInCooldown(rule))
      .sort((a, b) => a.priority - b.priority);

    for (const rule of eligibleRules) {
      const shouldScale = await this.shouldTriggerScaling(rule);

      if (shouldScale) {
        await this.executeScaling(rule);
        break; // Execute only one scaling action at a time
      }
    }
  }

  /**
   * Check if rule is in cooldown period
   */
  private isInCooldown(rule: ScalingRule): boolean {
    const now = Date.now();
    const lastEvent = this.scalingEvents
      .filter(event => event.metric === rule.metric && event.action === rule.action)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastEvent) return false;

    return now - lastEvent.timestamp.getTime() < rule.cooldown;
  }

  /**
   * Determine if scaling should be triggered
   */
  private async shouldTriggerScaling(rule: ScalingRule): Promise<boolean> {
    if (!this.currentMetrics) return false;

    const metricValue = this.getMetricValue(rule.metric);
    if (metricValue === null) return false;

    // Check current threshold
    const thresholdMet = rule.action === 'scale_up'
      ? metricValue > rule.threshold
      : metricValue < rule.threshold;

    if (!thresholdMet) return false;

    // Check predictive scaling if enabled
    if (this.config.enablePredictiveScaling) {
      const prediction = this.getPrediction(rule.metric);
      if (prediction) {
        const predictiveThresholdMet = rule.action === 'scale_up'
          ? prediction.value > rule.threshold
          : prediction.value < rule.threshold;

        // Require both current and predicted values to meet threshold
        return thresholdMet && predictiveThresholdMet && prediction.confidence > 0.7;
      }
    }

    return thresholdMet;
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(metricName: string): number | null {
    if (!this.currentMetrics) return null;

    switch (metricName) {
      case 'cpu_usage':
        return this.currentMetrics.cpuUsage;
      case 'memory_usage':
        return this.currentMetrics.memoryUsage;
      case 'active_users':
        return this.currentMetrics.activeUsers;
      case 'avg_response_time':
        return this.currentMetrics.avgResponseTime;
      case 'requests_per_second':
        return this.currentMetrics.requestsPerSecond;
      case 'error_rate':
        return this.currentMetrics.errorRate;
      case 'network_io':
        return this.currentMetrics.networkIO;
      case 'disk_io':
        return this.currentMetrics.diskIO;
      default:
        return null;
    }
  }

  /**
   * Get prediction for metric
   */
  private getPrediction(metricName: string): { value: number; confidence: number } | null {
    const model = this.predictionModels.get(metricName);
    if (!model || model.predictions.length === 0) return null;

    // Return the most recent prediction
    const sortedPredictions = model.predictions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return sortedPredictions[0];
  }

  /**
   * Execute scaling action
   */
  private async executeScaling(rule: ScalingRule): Promise<void> {
    if (this.scalingInProgress.has(rule.metric)) {
      console.log(`⏳ Scaling already in progress for ${rule.metric}`);
      return;
    }

    this.scalingInProgress.add(rule.metric);
    const startTime = Date.now();

    try {
      console.log(`🔄 Executing scaling: ${rule.action} for ${rule.metric}`);

      const currentValue = this.getMetricValue(rule.metric) || 0;
      const newValue = await this.performScaling(rule, currentValue);

      const scalingEvent: ScalingEvent = {
        id: `scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action: rule.action,
        reason: `${rule.metric} ${rule.action === 'scale_up' ? 'exceeded' : 'below'} threshold of ${rule.threshold}`,
        fromValue: currentValue,
        toValue: newValue,
        metric: rule.metric,
        success: true,
        duration: Date.now() - startTime
      };

      this.scalingEvents.push(scalingEvent);

      console.log(`✅ Scaling completed: ${rule.action} for ${rule.metric} (${currentValue} → ${newValue})`);

    } catch (error) {
      const scalingEvent: ScalingEvent = {
        id: `scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action: rule.action,
        reason: `Scaling failed: ${error}`,
        fromValue: this.getMetricValue(rule.metric) || 0,
        toValue: 0,
        metric: rule.metric,
        success: false,
        duration: Date.now() - startTime
      };

      this.scalingEvents.push(scalingEvent);

      console.error(`❌ Scaling failed for ${rule.metric}:`, error);
    } finally {
      this.scalingInProgress.delete(rule.metric);
    }
  }

  /**
   * Perform actual scaling (implementation depends on infrastructure)
   */
  private async performScaling(rule: ScalingRule, currentValue: number): Promise<number> {
    // Simulate scaling operation (in real implementation, this would interface with infrastructure)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate scaling delay

    const limits = this.resourceLimits.get(rule.metric.replace('_usage', ''));
    if (!limits) return currentValue;

    let newValue: number;

    if (rule.action === 'scale_up') {
      newValue = Math.min(limits.max, currentValue + limits.step);
    } else {
      newValue = Math.max(limits.min, currentValue - limits.step);
    }

    return newValue;
  }

  /**
   * Add scaling rule
   */
  addScalingRule(rule: ScalingRule): void {
    this.scalingRules.set(rule.name, rule);
    console.log(`➕ Added scaling rule: ${rule.name}`);
  }

  /**
   * Remove scaling rule
   */
  removeScalingRule(ruleName: string): boolean {
    const removed = this.scalingRules.delete(ruleName);
    if (removed) {
      console.log(`➖ Removed scaling rule: ${ruleName}`);
    }
    return removed;
  }

  /**
   * Enable/disable scaling rule
   */
  toggleScalingRule(ruleName: string, enabled: boolean): boolean {
    const rule = this.scalingRules.get(ruleName);
    if (rule) {
      rule.enabled = enabled;
      console.log(`🔄 ${enabled ? 'Enabled' : 'Disabled'} scaling rule: ${ruleName}`);
      return true;
    }
    return false;
  }

  /**
   * Get scaling status
   */
  async getScalingStatus(): Promise<MetuScalingStatus> {
    const recentEvents = this.scalingEvents
      .filter(event => Date.now() - event.timestamp.getTime() < 3600000) // Last hour
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      enabled: this.isEnabled,
      activeRules: Array.from(this.scalingRules.values()).filter(rule => rule.enabled).length,
      totalRules: this.scalingRules.size,
      recentEvents: recentEvents.slice(0, 10), // Last 10 events
      currentMetrics: this.currentMetrics,
      scalingInProgress: Array.from(this.scalingInProgress),
      predictionAccuracy: this.calculatePredictionAccuracy()
    };
  }

  /**
   * Calculate prediction accuracy
   */
  private calculatePredictionAccuracy(): Record<string, number> {
    const accuracy: Record<string, number> = {};

    for (const [modelName, model] of this.predictionModels) {
      accuracy[modelName] = model.accuracy;
    }

    return accuracy;
  }

  /**
   * Clean up old events
   */
  private cleanupOldEvents(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const oldCount = this.scalingEvents.length;

    this.scalingEvents = this.scalingEvents.filter(
      event => event.timestamp.getTime() > cutoff
    );

    // Also maintain maximum event count
    if (this.scalingEvents.length > this.config.maxScalingEvents) {
      this.scalingEvents = this.scalingEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.config.maxScalingEvents);
    }

    const removedCount = oldCount - this.scalingEvents.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old scaling events`);
    }
  }

  /**
   * Get scaling events
   */
  getScalingEvents(limit?: number): ScalingEvent[] {
    const sortedEvents = this.scalingEvents.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return limit ? sortedEvents.slice(0, limit) : sortedEvents;
  }

  /**
   * Stop auto scaling
   */
  async stop(): Promise<void> {
    this.isEnabled = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Wait for any ongoing scaling operations to complete
    while (this.scalingInProgress.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('⏹️ Auto Scaler stopped');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stop();

    this.scalingRules.clear();
    this.scalingEvents = [];
    this.resourceLimits.clear();
    this.predictionModels.clear();
    this.currentMetrics = null;
    this.scalingInProgress.clear();

    console.log('🧹 Auto Scaler cleaned up');
  }
}
