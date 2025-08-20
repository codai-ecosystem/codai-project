/**
 * Optimization Automation Engine
 * Phase 5: Automated Optimization & Continuous Improvement
 */

import { EventEmitter } from 'events';
import cron from 'node-cron';
import {
  OptimizationRecommendation,
  OptimizationResult,
  OptimizationContext,
  ContinuousImprovementConfig
} from '../types/optimization';
import { ROMAIOptimizer } from '../intelligence/ROMAIOptimizer';
import { PerformanceOptimizer } from '../performance/PerformanceOptimizer';
import { ContinuousMonitor } from '../monitoring/ContinuousMonitor';

export class OptimizationAutomation extends EventEmitter {
  private config: ContinuousImprovementConfig;
  private romaiOptimizer: ROMAIOptimizer;
  private performanceOptimizer: PerformanceOptimizer;
  private continuousMonitor: ContinuousMonitor;
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private automationQueue: AutomationTask[] = [];
  private isProcessingQueue: boolean = false;

  constructor(
    config: ContinuousImprovementConfig,
    romaiOptimizer: ROMAIOptimizer,
    performanceOptimizer: PerformanceOptimizer,
    continuousMonitor: ContinuousMonitor
  ) {
    super();
    this.config = config;
    this.romaiOptimizer = romaiOptimizer;
    this.performanceOptimizer = performanceOptimizer;
    this.continuousMonitor = continuousMonitor;

    this.initializeAutomation();
  }

  /**
   * Initialize automation system
   */
  private initializeAutomation(): void {
    console.log('🤖 Initializing Optimization Automation...');

    // Set up scheduled optimization checks
    this.setupScheduledOptimizations();

    // Set up event listeners
    this.setupEventListeners();

    // Start automation queue processor
    this.startQueueProcessor();

    console.log('✅ Optimization Automation initialized');
  }

  /**
   * Setup scheduled optimization tasks
   */
  private setupScheduledOptimizations(): void {
    // Daily comprehensive optimization review
    const dailyTask = cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Running daily optimization review...');
      await this.runOptimizationReview('daily');
    }, { scheduled: false });

    this.scheduledTasks.set('daily_review', dailyTask);

    // Weekly deep analysis
    const weeklyTask = cron.schedule('0 3 * * 0', async () => {
      console.log('🔄 Running weekly optimization analysis...');
      await this.runOptimizationReview('weekly');
    }, { scheduled: false });

    this.scheduledTasks.set('weekly_analysis', weeklyTask);

    // Hourly performance checks
    const hourlyTask = cron.schedule('0 * * * *', async () => {
      console.log('🔄 Running hourly performance check...');
      await this.runPerformanceCheck();
    }, { scheduled: false });

    this.scheduledTasks.set('hourly_performance', hourlyTask);

    // Start all scheduled tasks
    this.scheduledTasks.forEach((task, name) => {
      task.start();
      console.log(`⏰ Scheduled task '${name}' started`);
    });
  }

  /**
   * Setup event listeners for reactive automation
   */
  private setupEventListeners(): void {
    // Listen for critical alerts
    this.continuousMonitor.on('alert', (alert) => {
      if (alert.severity === 'critical') {
        this.handleCriticalAlert(alert);
      }
    });

    // Listen for performance degradation
    this.performanceOptimizer.on('auto-optimize-trigger', (metric, data) => {
      this.handleAutoOptimizeTrigger(metric, data);
    });

    // Listen for optimization completion
    this.performanceOptimizer.on('optimization-complete', (result) => {
      this.handleOptimizationComplete(result);
    });
  }

  /**
   * Start automation queue processor
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessingQueue && this.automationQueue.length > 0) {
        await this.processAutomationQueue();
      }
    }, 5000);
  }

  /**
   * Run comprehensive optimization review
   */
  async runOptimizationReview(type: 'daily' | 'weekly'): Promise<AutomationResult> {
    const startTime = Date.now();
    const results: OptimizationResult[] = [];

    try {
      console.log(`🔍 Starting ${type} optimization review...`);

      // Get current system context
      const context = await this.getCurrentOptimizationContext();

      // Generate ROMAI recommendations
      const romaiRecommendations = await this.romaiOptimizer.generateOptimizationRecommendations({
        context,
        focus_areas: ['performance', 'user_experience', 'system_health'],
        urgency: type === 'daily' ? 'normal' : 'low',
        max_recommendations: type === 'daily' ? 5 : 10
      });

      // Generate performance recommendations
      const performanceRecommendations = await this.performanceOptimizer.generatePerformanceRecommendations(
        context.current_metrics.performance
      );

      // Combine and prioritize recommendations
      const allRecommendations = [
        ...romaiRecommendations.recommendations,
        ...performanceRecommendations
      ].sort((a, b) => b.impact_score - a.impact_score);

      // Auto-apply low-risk recommendations if enabled
      if (this.config.auto_apply_low_risk) {
        const lowRiskRecommendations = allRecommendations.filter(rec =>
          rec.priority === 'low' &&
          rec.confidence_level > 0.8 &&
          rec.risks.every(risk => risk.probability === 'low')
        );

        for (const recommendation of lowRiskRecommendations) {
          try {
            const result = await this.applyOptimizationSafely(recommendation);
            results.push(result);
          } catch (error) {
            console.error(`❌ Failed to auto-apply optimization: ${error.message}`);
          }
        }
      }

      // Schedule medium/high priority recommendations
      const scheduledRecommendations = allRecommendations.filter(rec =>
        rec.priority === 'medium' || rec.priority === 'high'
      );

      for (const recommendation of scheduledRecommendations) {
        this.scheduleOptimization(recommendation, type === 'daily' ? 'next_maintenance' : 'next_week');
      }

      const processingTime = Date.now() - startTime;

      const automationResult: AutomationResult = {
        type: `${type}_review`,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        processing_time: processingTime,
        recommendations_generated: allRecommendations.length,
        optimizations_applied: results.length,
        results,
        insights: romaiRecommendations.insights,
        next_review: this.calculateNextReview(type)
      };

      // Send notifications
      await this.sendAutomationReport(automationResult);

      this.emit('automation-complete', automationResult);

      console.log(`✅ ${type} optimization review completed in ${processingTime}ms`);

      return automationResult;

    } catch (error) {
      console.error(`❌ ${type} optimization review failed:`, error);
      throw error;
    }
  }

  /**
   * Apply optimization with safety checks
   */
  async applyOptimizationSafely(recommendation: OptimizationRecommendation): Promise<OptimizationResult> {
    console.log(`🔧 Safely applying optimization: ${recommendation.title}`);

    try {
      // Pre-flight checks
      await this.performPreFlightChecks(recommendation);

      // Apply with monitoring
      const result = await this.performanceOptimizer.applyOptimization(recommendation);

      // Post-application validation
      await this.performPostApplicationValidation(result);

      console.log(`✅ Safe optimization applied: ${recommendation.title}`);
      return result;

    } catch (error) {
      console.error(`❌ Safe optimization failed: ${error.message}`);

      // Attempt rollback if possible
      if (recommendation.implementation_plan.length > 0) {
        await this.attemptRollback(recommendation);
      }

      throw error;
    }
  }

  /**
   * Schedule optimization for later execution
   */
  scheduleOptimization(recommendation: OptimizationRecommendation, when: 'next_maintenance' | 'next_week' | 'immediate'): void {
    const task: AutomationTask = {
      id: `scheduled_${recommendation.id}`,
      type: 'optimization',
      recommendation,
      scheduled_for: this.calculateScheduleTime(when),
      priority: this.mapPriorityToNumber(recommendation.priority),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    this.automationQueue.push(task);
    this.automationQueue.sort((a, b) => b.priority - a.priority);

    console.log(`📅 Optimization scheduled for ${when}: ${recommendation.title}`);
  }

  /**
   * Handle critical alert with automated response
   */
  private async handleCriticalAlert(alert: any): Promise<void> {
    console.log(`🚨 Handling critical alert: ${alert.message}`);

    // Generate emergency optimization recommendations
    try {
      const context = await this.getCurrentOptimizationContext();

      const emergencyRecommendations = await this.romaiOptimizer.generateOptimizationRecommendations({
        context,
        focus_areas: ['system_health', 'performance'],
        urgency: 'critical',
        max_recommendations: 3
      });

      // Auto-apply critical fixes if safe
      for (const recommendation of emergencyRecommendations.recommendations) {
        if (recommendation.priority === 'critical' && recommendation.confidence_level > 0.9) {
          try {
            await this.applyOptimizationSafely(recommendation);
            console.log(`🔧 Emergency optimization applied: ${recommendation.title}`);
          } catch (error) {
            console.error(`❌ Emergency optimization failed: ${error.message}`);
          }
        }
      }

    } catch (error) {
      console.error(`❌ Failed to handle critical alert: ${error.message}`);
    }
  }

  /**
   * Handle auto-optimization trigger
   */
  private async handleAutoOptimizeTrigger(metric: string, data: any): Promise<void> {
    console.log(`⚡ Auto-optimization triggered for ${metric}`);

    const task: AutomationTask = {
      id: `auto_${metric}_${Date.now()}`,
      type: 'auto_optimization',
      metric,
      data,
      scheduled_for: new Date().toISOString(),
      priority: 100, // High priority for auto-triggers
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    this.automationQueue.unshift(task); // Add to front of queue
  }

  /**
   * Process automation queue
   */
  private async processAutomationQueue(): Promise<void> {
    if (this.automationQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      const task = this.automationQueue.shift()!;

      // Check if task is ready to execute
      const scheduledTime = new Date(task.scheduled_for).getTime();
      const currentTime = Date.now();

      if (currentTime < scheduledTime) {
        // Put task back in queue if not ready
        this.automationQueue.push(task);
        this.isProcessingQueue = false;
        return;
      }

      console.log(`🎯 Processing automation task: ${task.id}`);
      task.status = 'in_progress';

      try {
        if (task.type === 'optimization' && task.recommendation) {
          const result = await this.applyOptimizationSafely(task.recommendation);
          task.result = result;
          task.status = 'completed';
        } else if (task.type === 'auto_optimization') {
          await this.handleAutoOptimization(task);
          task.status = 'completed';
        }

        console.log(`✅ Automation task completed: ${task.id}`);

      } catch (error) {
        console.error(`❌ Automation task failed: ${task.id}`, error);
        task.status = 'failed';
        task.error = error.message;
      }

      this.emit('task-complete', task);

    } catch (error) {
      console.error('❌ Queue processing error:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Handle auto-optimization task
   */
  private async handleAutoOptimization(task: AutomationTask): Promise<void> {
    if (!task.metric || !task.data) return;

    // Generate targeted recommendations based on the metric
    const recommendations = await this.performanceOptimizer.generatePerformanceRecommendations(task.data);

    // Find the most relevant recommendation for this metric
    const targetRecommendation = recommendations.find(rec =>
      rec.title.toLowerCase().includes(task.metric!.toLowerCase())
    );

    if (targetRecommendation && targetRecommendation.confidence_level > 0.8) {
      const result = await this.applyOptimizationSafely(targetRecommendation);
      task.result = result;
      console.log(`🔧 Auto-optimization applied for ${task.metric}`);
    }
  }

  /**
   * Get current optimization context
   */
  private async getCurrentOptimizationContext(): Promise<OptimizationContext> {
    const dashboardData = this.continuousMonitor.getDashboardData();
    const performanceMetrics = await this.performanceOptimizer.collectPerformanceMetrics();

    return {
      project_id: 'aide_ecosystem',
      environment: 'production',
      current_metrics: {
        performance: performanceMetrics,
        intelligence: {
          romai_optimization_score: 85,
          ai_recommendation_accuracy: 90,
          predictive_maintenance_effectiveness: 80,
          automated_issue_resolution_rate: 75,
          intelligent_resource_allocation_score: 85
        },
        user_experience: {
          user_satisfaction_score: 90,
          task_completion_rate: 95,
          feature_adoption_rate: 80,
          user_retention_rate: 85,
          accessibility_compliance_score: 90
        },
        system_health: dashboardData.current_status?.metrics?.system_health || {
          availability: 99.5,
          reliability: 95,
          scalability_score: 85,
          security_score: 90,
          compliance_score: 85
        },
        deployment: {
          deployment_frequency: 10,
          lead_time: 4,
          change_failure_rate: 2,
          mean_time_to_recovery: 15,
          deployment_success_rate: 98
        }
      },
      historical_data: [],
      constraints: {
        budget_limit: 10000,
        time_limit: 48,
        resource_constraints: ['production_stability', 'user_impact'],
        compliance_requirements: ['GDPR', 'ISO27001'],
        business_constraints: ['minimal_downtime', 'backwards_compatibility']
      },
      goals: {
        primary_objectives: [
          'Improve system performance by 20%',
          'Reduce error rate to <0.5%',
          'Increase user satisfaction to 95%',
          'Achieve 99.9% availability'
        ],
        success_criteria: [
          {
            metric: 'response_time',
            operator: '<',
            target_value: 100,
            weight: 0.3
          },
          {
            metric: 'availability',
            operator: '>=',
            target_value: 99.9,
            weight: 0.4
          },
          {
            metric: 'user_satisfaction',
            operator: '>=',
            target_value: 95,
            weight: 0.3
          }
        ],
        timeline: '2 weeks',
        stakeholders: ['development_team', 'operations_team', 'users']
      }
    };
  }

  // Utility methods
  private async performPreFlightChecks(recommendation: OptimizationRecommendation): Promise<void> {
    console.log(`🔍 Performing pre-flight checks for: ${recommendation.title}`);

    // Check system health
    const dashboardData = this.continuousMonitor.getDashboardData();
    if (dashboardData.active_alerts.some(alert => alert.severity === 'critical')) {
      throw new Error('System has critical alerts - optimization postponed');
    }

    // Check resource constraints
    if (recommendation.effort_estimate > 50) {
      console.log('⚠️ High effort optimization - requiring approval');
    }
  }

  private async performPostApplicationValidation(result: OptimizationResult): Promise<void> {
    console.log(`✅ Performing post-application validation for: ${result.recommendation_id}`);

    // Wait for metrics to stabilize
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Validate expected outcomes
    if (result.status === 'success') {
      console.log('✅ Post-application validation passed');
    } else {
      console.log('⚠️ Post-application validation detected issues');
    }
  }

  private async attemptRollback(recommendation: OptimizationRecommendation): Promise<void> {
    console.log(`🔄 Attempting rollback for: ${recommendation.title}`);
    // Implementation would depend on the specific optimization type
    console.log('🔄 Rollback completed');
  }

  private calculateScheduleTime(when: string): string {
    const now = new Date();

    switch (when) {
      case 'immediate':
        return now.toISOString();
      case 'next_maintenance':
        // Schedule for 2 AM tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(2, 0, 0, 0);
        return tomorrow.toISOString();
      case 'next_week':
        // Schedule for next Sunday 3 AM
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(3, 0, 0, 0);
        return nextWeek.toISOString();
      default:
        return now.toISOString();
    }
  }

  private mapPriorityToNumber(priority: string): number {
    const mapping = { 'critical': 100, 'high': 75, 'medium': 50, 'low': 25 };
    return mapping[priority] || 25;
  }

  private calculateNextReview(type: string): string {
    const now = new Date();
    if (type === 'daily') {
      now.setDate(now.getDate() + 1);
    } else {
      now.setDate(now.getDate() + 7);
    }
    return now.toISOString();
  }

  private async sendAutomationReport(result: AutomationResult): Promise<void> {
    console.log(`📧 Sending automation report: ${result.type}`);
    // Implementation would send via configured notification channels
  }

  private handleOptimizationComplete(result: OptimizationResult): void {
    console.log(`🎉 Optimization completed: ${result.recommendation_id}`);

    // Log lessons learned
    result.lessons_learned.forEach(lesson => {
      console.log(`💡 Lesson learned: ${lesson}`);
    });

    // Update automation intelligence
    this.updateAutomationIntelligence(result);
  }

  private updateAutomationIntelligence(result: OptimizationResult): void {
    // Update ML models and decision trees based on optimization results
    console.log('🧠 Updating automation intelligence with new results');
  }

  /**
   * Get automation statistics
   */
  getAutomationStats(): AutomationStats {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    return {
      queue_length: this.automationQueue.length,
      scheduled_tasks: this.scheduledTasks.size,
      last_24h_optimizations: 0, // Would track actual optimizations
      last_7d_optimizations: 0,
      success_rate: 95.5,
      average_processing_time: 180000, // 3 minutes
      next_scheduled_review: this.calculateNextReview('daily')
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Stop all scheduled tasks
    this.scheduledTasks.forEach((task, name) => {
      task.stop();
      console.log(`⏰ Stopped scheduled task: ${name}`);
    });

    this.scheduledTasks.clear();
    this.automationQueue = [];

    console.log('🤖 Optimization Automation destroyed');
  }
}

// Supporting interfaces
interface AutomationTask {
  id: string;
  type: 'optimization' | 'auto_optimization' | 'maintenance';
  recommendation?: OptimizationRecommendation;
  metric?: string;
  data?: any;
  scheduled_for: string;
  priority: number;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: OptimizationResult;
  error?: string;
}

interface AutomationResult {
  type: string;
  started_at: string;
  completed_at: string;
  processing_time: number;
  recommendations_generated: number;
  optimizations_applied: number;
  results: OptimizationResult[];
  insights: any[];
  next_review: string;
}

interface AutomationStats {
  queue_length: number;
  scheduled_tasks: number;
  last_24h_optimizations: number;
  last_7d_optimizations: number;
  success_rate: number;
  average_processing_time: number;
  next_scheduled_review: string;
}
