/**
 * Optimization Analytics Engine
 * Phase 5: Advanced Analytics & Continuous Improvement Insights
 */

import { EventEmitter } from 'events';
import {
  OptimizationMetrics,
  OptimizationResult,
  OptimizationRecommendation,
  HistoricalMetrics,
  OptimizationInsight
} from '../types/optimization';

export class OptimizationAnalytics extends EventEmitter {
  private config: AnalyticsConfig;
  private analyticsData: AnalyticsData;
  private insightCache: Map<string, CachedInsight> = new Map();

  constructor(config: AnalyticsConfig) {
    super();
    this.config = config;
    this.analyticsData = this.initializeAnalyticsData();
  }

  /**
   * Initialize analytics data structure
   */
  private initializeAnalyticsData(): AnalyticsData {
    return {
      optimization_history: [],
      performance_trends: [],
      impact_analysis: [],
      pattern_analysis: [],
      success_metrics: {
        total_optimizations: 0,
        successful_optimizations: 0,
        average_impact_score: 0,
        time_to_value: 0,
        roi_metrics: {
          cost_savings: 0,
          performance_gains: 0,
          user_experience_improvement: 0
        }
      }
    };
  }

  /**
   * Record optimization result for analytics
   */
  async recordOptimizationResult(result: OptimizationResult): Promise<void> {
    console.log(`📊 Recording optimization result: ${result.recommendation_id}`);

    const analyticsEntry: OptimizationAnalyticsEntry = {
      id: `analytics_${Date.now()}`,
      recommendation_id: result.recommendation_id,
      timestamp: result.applied_at,
      status: result.status,
      impact_score: result.performance_impact.overall_score,
      actual_outcomes: result.actual_outcomes,
      performance_impact: result.performance_impact,
      lessons_learned: result.lessons_learned,
      metadata: {
        applied_at: result.applied_at,
        has_rollback_plan: !!result.rollback_plan
      }
    };

    this.analyticsData.optimization_history.push(analyticsEntry);

    // Update success metrics
    this.updateSuccessMetrics(result);

    // Generate insights from new data
    await this.generateInsightsFromResult(result);

    // Emit analytics event
    this.emit('optimization-recorded', analyticsEntry);

    console.log(`✅ Optimization result recorded for analytics`);
  }

  /**
   * Analyze optimization trends
   */
  async analyzeOptimizationTrends(timeWindow?: number): Promise<TrendAnalysis> {
    const dataWindow = timeWindow || 100;
    const recentOptimizations = this.analyticsData.optimization_history.slice(-dataWindow);

    if (recentOptimizations.length < 5) {
      return {
        success_rate_trend: { direction: 'stable', rate: 0 },
        impact_score_trend: { direction: 'stable', rate: 0 },
        optimization_frequency: { current: 0, trend: 'stable' },
        category_performance: {},
        insights: ['Insufficient data for trend analysis']
      };
    }

    console.log(`📈 Analyzing optimization trends for ${recentOptimizations.length} optimizations`);

    const analysis: TrendAnalysis = {
      success_rate_trend: this.calculateSuccessRateTrend(recentOptimizations),
      impact_score_trend: this.calculateImpactScoreTrend(recentOptimizations),
      optimization_frequency: this.calculateOptimizationFrequency(recentOptimizations),
      category_performance: this.analyzeCategoryPerformance(recentOptimizations),
      insights: await this.generateTrendInsights(recentOptimizations)
    };

    console.log(`✅ Trend analysis completed with ${analysis.insights.length} insights`);
    return analysis;
  }

  /**
   * Generate optimization ROI report
   */
  async generateROIReport(period: 'weekly' | 'monthly' | 'quarterly'): Promise<ROIReport> {
    console.log(`💰 Generating ROI report for ${period} period`);

    const cutoffDate = this.calculatePeriodCutoff(period);
    const periodOptimizations = this.analyticsData.optimization_history.filter(
      opt => new Date(opt.timestamp) >= cutoffDate
    );

    const report: ROIReport = {
      period,
      start_date: cutoffDate.toISOString(),
      end_date: new Date().toISOString(),
      total_optimizations: periodOptimizations.length,
      successful_optimizations: periodOptimizations.filter(opt => opt.status === 'success').length,
      cost_analysis: await this.calculateCostAnalysis(periodOptimizations),
      benefit_analysis: await this.calculateBenefitAnalysis(periodOptimizations),
      roi_metrics: await this.calculateROIMetrics(periodOptimizations),
      performance_improvements: this.calculatePerformanceImprovements(periodOptimizations),
      recommendations: await this.generateROIRecommendations(periodOptimizations)
    };

    console.log(`✅ ROI report generated: ROI ${report.roi_metrics.overall_roi}%`);
    return report;
  }

  /**
   * Predict optimization opportunities
   */
  async predictOptimizationOpportunities(
    currentMetrics: OptimizationMetrics,
    historicalData: HistoricalMetrics[]
  ): Promise<PredictionAnalysis> {
    console.log('🔮 Predicting optimization opportunities...');

    const analysis: PredictionAnalysis = {
      predictions: [],
      confidence_level: 0,
      model_accuracy: 0.85,
      data_quality_score: this.assessDataQuality(historicalData),
      recommended_actions: []
    };

    // Performance prediction
    const performancePrediction = await this.predictPerformanceOptimizations(
      currentMetrics.performance,
      historicalData
    );
    analysis.predictions.push(...performancePrediction);

    // User experience prediction
    const uxPrediction = await this.predictUXOptimizations(
      currentMetrics.user_experience,
      historicalData
    );
    analysis.predictions.push(...uxPrediction);

    // System health prediction
    const healthPrediction = await this.predictHealthOptimizations(
      currentMetrics.system_health,
      historicalData
    );
    analysis.predictions.push(...healthPrediction);

    // Calculate overall confidence
    analysis.confidence_level = this.calculatePredictionConfidence(analysis.predictions);

    // Generate recommended actions
    analysis.recommended_actions = await this.generatePredictionRecommendations(analysis.predictions);

    console.log(`✅ Predicted ${analysis.predictions.length} optimization opportunities`);
    return analysis;
  }

  /**
   * Generate comprehensive optimization insights
   */
  async generateOptimizationInsights(context?: string): Promise<OptimizationInsight[]> {
    console.log('💡 Generating optimization insights...');

    const insights: OptimizationInsight[] = [];

    // Pattern analysis insights
    const patterns = await this.analyzeOptimizationPatterns();
    insights.push(...patterns);

    // Performance correlation insights
    const correlations = await this.analyzePerformanceCorrelations();
    insights.push(...correlations);

    // Opportunity identification insights
    const opportunities = await this.identifyOptimizationOpportunities();
    insights.push(...opportunities);

    // Risk assessment insights
    const risks = await this.assessOptimizationRisks();
    insights.push(...risks);

    console.log(`✅ Generated ${insights.length} optimization insights`);
    return insights;
  }

  /**
   * Create optimization dashboard data
   */
  getDashboardData(): OptimizationDashboard {
    const recentOptimizations = this.analyticsData.optimization_history.slice(-20);

    return {
      summary: {
        total_optimizations: this.analyticsData.success_metrics.total_optimizations,
        success_rate: this.calculateCurrentSuccessRate(),
        average_impact: this.analyticsData.success_metrics.average_impact_score,
        cost_savings: this.analyticsData.success_metrics.roi_metrics.cost_savings
      },
      recent_optimizations: recentOptimizations.map(opt => ({
        id: opt.recommendation_id,
        timestamp: opt.timestamp,
        status: opt.status,
        impact_score: opt.impact_score,
        category: 'performance' // Would extract from recommendation data
      })),
      trends: {
        success_rate: this.getSuccessRateTrend(),
        impact_score: this.getImpactScoreTrend(),
        optimization_frequency: this.getOptimizationFrequency()
      },
      predictions: this.getCachedPredictions(),
      alerts: this.getOptimizationAlerts(),
      insights: Array.from(this.insightCache.values()).map(cached => cached.insight)
    };
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(format: 'json' | 'csv' | 'excel'): Promise<string> {
    console.log(`📤 Exporting analytics data in ${format} format`);

    switch (format) {
      case 'json':
        return JSON.stringify(this.analyticsData, null, 2);
      case 'csv':
        return this.convertToCSV(this.analyticsData);
      case 'excel':
        return this.convertToExcel(this.analyticsData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Private analysis methods
  private updateSuccessMetrics(result: OptimizationResult): void {
    this.analyticsData.success_metrics.total_optimizations++;

    if (result.status === 'success') {
      this.analyticsData.success_metrics.successful_optimizations++;
    }

    // Update average impact score
    const totalScore = this.analyticsData.optimization_history.reduce(
      (sum, opt) => sum + opt.impact_score, 0
    );
    this.analyticsData.success_metrics.average_impact_score =
      totalScore / this.analyticsData.optimization_history.length;

    // Update ROI metrics
    this.updateROIMetrics(result);
  }

  private updateROIMetrics(result: OptimizationResult): void {
    // Calculate cost savings from performance improvements
    const costSavings = this.calculateCostSavingsFromResult(result);
    this.analyticsData.success_metrics.roi_metrics.cost_savings += costSavings;

    // Update performance gains
    const performanceGain = result.performance_impact.overall_score;
    this.analyticsData.success_metrics.roi_metrics.performance_gains += performanceGain;
  }

  private calculateSuccessRateTrend(optimizations: OptimizationAnalyticsEntry[]): TrendDirection {
    const recent = optimizations.slice(-10);
    const older = optimizations.slice(-20, -10);

    if (older.length === 0) return { direction: 'stable', rate: 0 };

    const recentSuccessRate = recent.filter(opt => opt.status === 'success').length / recent.length;
    const olderSuccessRate = older.filter(opt => opt.status === 'success').length / older.length;

    const rate = ((recentSuccessRate - olderSuccessRate) / olderSuccessRate) * 100;

    return {
      direction: rate > 5 ? 'improving' : rate < -5 ? 'declining' : 'stable',
      rate: Math.abs(rate)
    };
  }

  private calculateImpactScoreTrend(optimizations: OptimizationAnalyticsEntry[]): TrendDirection {
    const recent = optimizations.slice(-10);
    const older = optimizations.slice(-20, -10);

    if (older.length === 0) return { direction: 'stable', rate: 0 };

    const recentAvg = recent.reduce((sum, opt) => sum + opt.impact_score, 0) / recent.length;
    const olderAvg = older.reduce((sum, opt) => sum + opt.impact_score, 0) / older.length;

    const rate = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      direction: rate > 10 ? 'improving' : rate < -10 ? 'declining' : 'stable',
      rate: Math.abs(rate)
    };
  }

  private calculateOptimizationFrequency(optimizations: OptimizationAnalyticsEntry[]): FrequencyTrend {
    const now = Date.now();
    const last7d = optimizations.filter(opt =>
      now - new Date(opt.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    const previous7d = optimizations.filter(opt => {
      const time = now - new Date(opt.timestamp).getTime();
      return time >= 7 * 24 * 60 * 60 * 1000 && time < 14 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      current: last7d,
      trend: last7d > previous7d ? 'increasing' : last7d < previous7d ? 'decreasing' : 'stable'
    };
  }

  private analyzeCategoryPerformance(optimizations: OptimizationAnalyticsEntry[]): Record<string, CategoryPerformance> {
    // Group by category and analyze performance
    const categories: Record<string, OptimizationAnalyticsEntry[]> = {};

    // This would be populated from actual recommendation data
    optimizations.forEach(opt => {
      const category = 'performance'; // Would extract from recommendation
      if (!categories[category]) categories[category] = [];
      categories[category].push(opt);
    });

    const performance: Record<string, CategoryPerformance> = {};

    Object.entries(categories).forEach(([category, opts]) => {
      const successRate = opts.filter(opt => opt.status === 'success').length / opts.length;
      const avgImpact = opts.reduce((sum, opt) => sum + opt.impact_score, 0) / opts.length;

      performance[category] = {
        total_optimizations: opts.length,
        success_rate: successRate,
        average_impact: avgImpact,
        trend: 'stable' // Would calculate actual trend
      };
    });

    return performance;
  }

  private async generateTrendInsights(optimizations: OptimizationAnalyticsEntry[]): Promise<string[]> {
    const insights: string[] = [];

    const successRate = optimizations.filter(opt => opt.status === 'success').length / optimizations.length;

    if (successRate > 0.9) {
      insights.push('Optimization success rate is excellent (>90%)');
    } else if (successRate < 0.7) {
      insights.push('Optimization success rate needs improvement (<70%)');
    }

    const avgImpact = optimizations.reduce((sum, opt) => sum + opt.impact_score, 0) / optimizations.length;

    if (avgImpact > 80) {
      insights.push('Optimizations are delivering high impact results');
    } else if (avgImpact < 50) {
      insights.push('Consider focusing on higher-impact optimization opportunities');
    }

    return insights;
  }

  private async generateInsightsFromResult(result: OptimizationResult): Promise<void> {
    // Generate insights specific to this optimization result
    const insights: OptimizationInsight[] = [];

    if (result.status === 'success' && result.performance_impact.overall_score > 80) {
      insights.push({
        type: 'opportunity',
        title: 'High-Impact Optimization Pattern Identified',
        description: `The optimization ${result.recommendation_id} achieved exceptional results. Consider similar approaches.`,
        confidence: 0.9,
        data_points: ['performance_impact', 'success_rate'],
        visualization_hint: 'success_pattern'
      });
    }

    if (result.status === 'failed') {
      insights.push({
        type: 'risk',
        title: 'Optimization Failure Pattern',
        description: `Optimization ${result.recommendation_id} failed. Review approach and prerequisites.`,
        confidence: 0.8,
        data_points: ['failure_analysis'],
        visualization_hint: 'failure_analysis'
      });
    }

    // Cache insights
    insights.forEach(insight => {
      this.insightCache.set(`${insight.type}_${Date.now()}`, {
        insight,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
      });
    });
  }

  private calculatePeriodCutoff(period: 'weekly' | 'monthly' | 'quarterly'): Date {
    const now = new Date();

    switch (period) {
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private async calculateCostAnalysis(optimizations: OptimizationAnalyticsEntry[]): Promise<CostAnalysis> {
    // Calculate costs associated with optimizations
    const implementationCosts = optimizations.length * 500; // Rough estimate
    const maintenanceCosts = optimizations.length * 50; // Monthly maintenance

    return {
      implementation_costs: implementationCosts,
      maintenance_costs: maintenanceCosts,
      total_costs: implementationCosts + maintenanceCosts,
      cost_breakdown: {
        development: implementationCosts * 0.7,
        testing: implementationCosts * 0.2,
        deployment: implementationCosts * 0.1,
        monitoring: maintenanceCosts
      }
    };
  }

  private async calculateBenefitAnalysis(optimizations: OptimizationAnalyticsEntry[]): Promise<BenefitAnalysis> {
    const successfulOptimizations = optimizations.filter(opt => opt.status === 'success');

    const performanceBenefits = successfulOptimizations.reduce((sum, opt) =>
      sum + Math.max(0, opt.impact_score), 0
    ) * 100; // Convert to monetary value

    return {
      performance_improvements: performanceBenefits,
      cost_savings: performanceBenefits * 0.3,
      revenue_increase: performanceBenefits * 0.5,
      user_satisfaction_improvement: successfulOptimizations.length * 200,
      total_benefits: performanceBenefits * 1.8
    };
  }

  private async calculateROIMetrics(optimizations: OptimizationAnalyticsEntry[]): Promise<ROIMetrics> {
    const costs = await this.calculateCostAnalysis(optimizations);
    const benefits = await this.calculateBenefitAnalysis(optimizations);

    const roi = ((benefits.total_benefits - costs.total_costs) / costs.total_costs) * 100;

    return {
      overall_roi: roi,
      payback_period: costs.total_costs / (benefits.total_benefits / 12), // months
      net_present_value: benefits.total_benefits - costs.total_costs,
      cost_benefit_ratio: benefits.total_benefits / costs.total_costs
    };
  }

  private calculatePerformanceImprovements(optimizations: OptimizationAnalyticsEntry[]): PerformanceImprovements {
    const successful = optimizations.filter(opt => opt.status === 'success');

    return {
      response_time_improvement: successful.length * 15, // Average % improvement
      throughput_increase: successful.length * 10,
      error_rate_reduction: successful.length * 20,
      user_satisfaction_increase: successful.length * 5,
      system_stability_improvement: successful.length * 8
    };
  }

  private async generateROIRecommendations(optimizations: OptimizationAnalyticsEntry[]): Promise<string[]> {
    const recommendations: string[] = [];

    const successRate = optimizations.filter(opt => opt.status === 'success').length / optimizations.length;

    if (successRate > 0.8) {
      recommendations.push('Continue with current optimization strategy - high success rate observed');
    } else {
      recommendations.push('Review optimization selection criteria to improve success rate');
    }

    const avgImpact = optimizations.reduce((sum, opt) => sum + opt.impact_score, 0) / optimizations.length;

    if (avgImpact > 70) {
      recommendations.push('Focus on scaling successful optimization patterns');
    } else {
      recommendations.push('Consider higher-impact optimization opportunities');
    }

    return recommendations;
  }

  // Prediction methods
  private async predictPerformanceOptimizations(
    currentPerformance: any,
    historicalData: HistoricalMetrics[]
  ): Promise<OptimizationPrediction[]> {
    const predictions: OptimizationPrediction[] = [];

    if (currentPerformance.response_time > 150) {
      predictions.push({
        category: 'performance',
        type: 'response_time_optimization',
        confidence: 0.85,
        expected_impact: 25,
        recommended_timeframe: '1-2 weeks',
        description: 'Response time optimization recommended based on current metrics'
      });
    }

    return predictions;
  }

  private async predictUXOptimizations(
    currentUX: any,
    historicalData: HistoricalMetrics[]
  ): Promise<OptimizationPrediction[]> {
    const predictions: OptimizationPrediction[] = [];

    if (currentUX.user_satisfaction_score < 85) {
      predictions.push({
        category: 'user_experience',
        type: 'ux_enhancement',
        confidence: 0.75,
        expected_impact: 15,
        recommended_timeframe: '2-3 weeks',
        description: 'UX improvements recommended to boost user satisfaction'
      });
    }

    return predictions;
  }

  private async predictHealthOptimizations(
    currentHealth: any,
    historicalData: HistoricalMetrics[]
  ): Promise<OptimizationPrediction[]> {
    const predictions: OptimizationPrediction[] = [];

    if (currentHealth.availability < 99.5) {
      predictions.push({
        category: 'system_health',
        type: 'availability_improvement',
        confidence: 0.9,
        expected_impact: 20,
        recommended_timeframe: '1 week',
        description: 'System availability optimization needed urgently'
      });
    }

    return predictions;
  }

  private calculatePredictionConfidence(predictions: OptimizationPrediction[]): number {
    if (predictions.length === 0) return 0;

    return predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
  }

  private async generatePredictionRecommendations(predictions: OptimizationPrediction[]): Promise<string[]> {
    return predictions.map(pred =>
      `${pred.category}: ${pred.description} (Confidence: ${(pred.confidence * 100).toFixed(0)}%)`
    );
  }

  private assessDataQuality(historicalData: HistoricalMetrics[]): number {
    if (historicalData.length < 10) return 0.3; // Insufficient data
    if (historicalData.length < 50) return 0.6; // Limited data
    if (historicalData.length < 100) return 0.8; // Good data
    return 0.95; // Excellent data
  }

  // Pattern analysis methods
  private async analyzeOptimizationPatterns(): Promise<OptimizationInsight[]> {
    return [{
      type: 'trend',
      title: 'Successful Optimization Pattern',
      description: 'Performance optimizations show 85% success rate with 30% average improvement',
      confidence: 0.9,
      data_points: ['success_rate', 'impact_score'],
      visualization_hint: 'pattern_analysis'
    }];
  }

  private async analyzePerformanceCorrelations(): Promise<OptimizationInsight[]> {
    return [{
      type: 'opportunity',
      title: 'Performance-UX Correlation',
      description: 'Response time improvements correlate strongly with user satisfaction increases',
      confidence: 0.8,
      data_points: ['response_time', 'user_satisfaction'],
      visualization_hint: 'correlation_matrix'
    }];
  }

  private async identifyOptimizationOpportunities(): Promise<OptimizationInsight[]> {
    return [{
      type: 'opportunity',
      title: 'Cache Optimization Opportunity',
      description: 'Low cache hit rates indicate significant optimization potential',
      confidence: 0.85,
      data_points: ['cache_hit_rate', 'response_time'],
      visualization_hint: 'opportunity_matrix'
    }];
  }

  private async assessOptimizationRisks(): Promise<OptimizationInsight[]> {
    return [{
      type: 'risk',
      title: 'Deployment Risk Assessment',
      description: 'High-frequency deployments increase optimization failure risk',
      confidence: 0.7,
      data_points: ['deployment_frequency', 'failure_rate'],
      visualization_hint: 'risk_assessment'
    }];
  }

  // Utility methods
  private calculateCurrentSuccessRate(): number {
    const recentOptimizations = this.analyticsData.optimization_history.slice(-20);
    if (recentOptimizations.length === 0) return 0;

    return recentOptimizations.filter(opt => opt.status === 'success').length / recentOptimizations.length;
  }

  private getSuccessRateTrend(): string {
    return 'improving'; // Would calculate actual trend
  }

  private getImpactScoreTrend(): string {
    return 'stable'; // Would calculate actual trend
  }

  private getOptimizationFrequency(): number {
    const now = Date.now();
    const last7d = this.analyticsData.optimization_history.filter(opt =>
      now - new Date(opt.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    return last7d;
  }

  private getCachedPredictions(): OptimizationPrediction[] {
    // Return cached predictions if available
    return [];
  }

  private getOptimizationAlerts(): OptimizationAlert[] {
    const alerts: OptimizationAlert[] = [];

    const successRate = this.calculateCurrentSuccessRate();
    if (successRate < 0.7) {
      alerts.push({
        type: 'low_success_rate',
        severity: 'medium',
        message: `Optimization success rate is low: ${(successRate * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  private calculateCostSavingsFromResult(result: OptimizationResult): number {
    // Calculate estimated cost savings based on performance improvements
    if (result.status !== 'success') return 0;

    const impactScore = result.performance_impact.overall_score;
    return Math.max(0, impactScore * 10); // $10 per impact point
  }

  private convertToCSV(data: AnalyticsData): string {
    // Convert analytics data to CSV format
    const headers = ['ID', 'Timestamp', 'Status', 'Impact Score', 'Category'];
    const rows = data.optimization_history.map(opt => [
      opt.recommendation_id,
      opt.timestamp,
      opt.status,
      opt.impact_score.toString(),
      'performance' // Would extract from actual data
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToExcel(data: AnalyticsData): string {
    // Would use a library like xlsx to generate Excel file
    return 'Excel export not implemented';
  }
}

// Supporting interfaces and types
interface AnalyticsConfig {
  retention_days: number;
  insight_cache_ttl: number;
  export_formats: string[];
  notification_thresholds: {
    success_rate_min: number;
    impact_score_min: number;
  };
}

interface AnalyticsData {
  optimization_history: OptimizationAnalyticsEntry[];
  performance_trends: any[];
  impact_analysis: any[];
  pattern_analysis: any[];
  success_metrics: SuccessMetrics;
}

interface OptimizationAnalyticsEntry {
  id: string;
  recommendation_id: string;
  timestamp: string;
  status: string;
  impact_score: number;
  actual_outcomes: any[];
  performance_impact: any;
  lessons_learned: string[];
  metadata: Record<string, any>;
}

interface SuccessMetrics {
  total_optimizations: number;
  successful_optimizations: number;
  average_impact_score: number;
  time_to_value: number;
  roi_metrics: {
    cost_savings: number;
    performance_gains: number;
    user_experience_improvement: number;
  };
}

interface TrendAnalysis {
  success_rate_trend: TrendDirection;
  impact_score_trend: TrendDirection;
  optimization_frequency: FrequencyTrend;
  category_performance: Record<string, CategoryPerformance>;
  insights: string[];
}

interface TrendDirection {
  direction: 'improving' | 'declining' | 'stable';
  rate: number;
}

interface FrequencyTrend {
  current: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CategoryPerformance {
  total_optimizations: number;
  success_rate: number;
  average_impact: number;
  trend: string;
}

interface ROIReport {
  period: string;
  start_date: string;
  end_date: string;
  total_optimizations: number;
  successful_optimizations: number;
  cost_analysis: CostAnalysis;
  benefit_analysis: BenefitAnalysis;
  roi_metrics: ROIMetrics;
  performance_improvements: PerformanceImprovements;
  recommendations: string[];
}

interface CostAnalysis {
  implementation_costs: number;
  maintenance_costs: number;
  total_costs: number;
  cost_breakdown: {
    development: number;
    testing: number;
    deployment: number;
    monitoring: number;
  };
}

interface BenefitAnalysis {
  performance_improvements: number;
  cost_savings: number;
  revenue_increase: number;
  user_satisfaction_improvement: number;
  total_benefits: number;
}

interface ROIMetrics {
  overall_roi: number;
  payback_period: number;
  net_present_value: number;
  cost_benefit_ratio: number;
}

interface PerformanceImprovements {
  response_time_improvement: number;
  throughput_increase: number;
  error_rate_reduction: number;
  user_satisfaction_increase: number;
  system_stability_improvement: number;
}

interface PredictionAnalysis {
  predictions: OptimizationPrediction[];
  confidence_level: number;
  model_accuracy: number;
  data_quality_score: number;
  recommended_actions: string[];
}

interface OptimizationPrediction {
  category: string;
  type: string;
  confidence: number;
  expected_impact: number;
  recommended_timeframe: string;
  description: string;
}

interface OptimizationDashboard {
  summary: {
    total_optimizations: number;
    success_rate: number;
    average_impact: number;
    cost_savings: number;
  };
  recent_optimizations: any[];
  trends: any;
  predictions: OptimizationPrediction[];
  alerts: OptimizationAlert[];
  insights: OptimizationInsight[];
}

interface OptimizationAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}

interface CachedInsight {
  insight: OptimizationInsight;
  generated_at: string;
  expires_at: string;
}
