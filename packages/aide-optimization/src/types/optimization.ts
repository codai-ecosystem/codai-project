/**
 * Optimization System Types
 */

export interface OptimizationMetrics {
  performance: PerformanceMetrics;
  intelligence: IntelligenceMetrics;
  user_experience: UserExperienceMetrics;
  system_health: SystemHealthMetrics;
  deployment: DeploymentMetrics;
}

export interface PerformanceMetrics {
  response_time: number;
  throughput: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  cache_hit_rate: number;
}

export interface IntelligenceMetrics {
  romai_optimization_score: number;
  ai_recommendation_accuracy: number;
  predictive_maintenance_effectiveness: number;
  automated_issue_resolution_rate: number;
  intelligent_resource_allocation_score: number;
}

export interface UserExperienceMetrics {
  user_satisfaction_score: number;
  task_completion_rate: number;
  feature_adoption_rate: number;
  user_retention_rate: number;
  accessibility_compliance_score: number;
}

export interface SystemHealthMetrics {
  availability: number;
  reliability: number;
  scalability_score: number;
  security_score: number;
  compliance_score: number;
}

export interface DeploymentMetrics {
  deployment_frequency: number;
  lead_time: number;
  change_failure_rate: number;
  mean_time_to_recovery: number;
  deployment_success_rate: number;
}

export interface OptimizationRecommendation {
  id: string;
  type: OptimizationType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: OptimizationCategory;
  title: string;
  description: string;
  impact_score: number;
  effort_estimate: number;
  confidence_level: number;
  implementation_plan: OptimizationStep[];
  expected_outcomes: ExpectedOutcome[];
  risks: OptimizationRisk[];
  dependencies: string[];
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export type OptimizationType =
  | 'performance'
  | 'intelligence'
  | 'user_experience'
  | 'system_health'
  | 'deployment'
  | 'security'
  | 'cost_optimization';

export type OptimizationCategory =
  | 'code_optimization'
  | 'infrastructure_scaling'
  | 'ui_ux_enhancement'
  | 'ai_model_tuning'
  | 'database_optimization'
  | 'caching_strategy'
  | 'monitoring_enhancement'
  | 'automation_improvement';

export interface OptimizationStep {
  id: string;
  title: string;
  description: string;
  estimated_duration: number;
  dependencies: string[];
  automation_available: boolean;
  verification_criteria: string[];
}

export interface ExpectedOutcome {
  metric: string;
  current_value: number;
  target_value: number;
  improvement_percentage: number;
  measurement_method: string;
}

export interface OptimizationRisk {
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
}

export interface OptimizationContext {
  project_id: string;
  environment: 'development' | 'staging' | 'production';
  current_metrics: OptimizationMetrics;
  historical_data: HistoricalMetrics[];
  constraints: OptimizationConstraints;
  goals: OptimizationGoals;
}

export interface HistoricalMetrics {
  timestamp: string;
  metrics: OptimizationMetrics;
  events: OptimizationEvent[];
}

export interface OptimizationEvent {
  id: string;
  type: 'deployment' | 'optimization' | 'incident' | 'configuration_change';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  metadata: Record<string, any>;
}

export interface OptimizationConstraints {
  budget_limit?: number;
  time_limit?: number;
  resource_constraints: string[];
  compliance_requirements: string[];
  business_constraints: string[];
}

export interface OptimizationGoals {
  primary_objectives: string[];
  success_criteria: SuccessCriteria[];
  timeline: string;
  stakeholders: string[];
}

export interface SuccessCriteria {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '=';
  target_value: number;
  weight: number;
}

export interface ROMAIOptimizationRequest {
  context: OptimizationContext;
  focus_areas: OptimizationType[];
  urgency: 'low' | 'normal' | 'high' | 'critical';
  max_recommendations: number;
}

export interface ROMAIOptimizationResponse {
  request_id: string;
  recommendations: OptimizationRecommendation[];
  overall_score: number;
  confidence_level: number;
  processing_time: number;
  insights: OptimizationInsight[];
  next_review_date: string;
}

export interface OptimizationInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  data_points: string[];
  visualization_hint?: string;
}

export interface ContinuousImprovementConfig {
  monitoring_interval: number;
  optimization_threshold: number;
  auto_apply_low_risk: boolean;
  notification_channels: string[];
  romai_integration: ROMAIIntegrationConfig;
}

export interface ROMAIIntegrationConfig {
  endpoint: string;
  api_key: string;
  model_preferences: Record<string, any>;
  optimization_parameters: OptimizationParameters;
}

export interface OptimizationParameters {
  learning_rate: number;
  exploration_factor: number;
  risk_tolerance: number;
  convergence_threshold: number;
}

export interface OptimizationResult {
  recommendation_id: string;
  status: 'success' | 'partial' | 'failed';
  applied_at: string;
  actual_outcomes: ActualOutcome[];
  performance_impact: PerformanceImpact;
  lessons_learned: string[];
  rollback_plan?: RollbackPlan;
}

export interface ActualOutcome {
  metric: string;
  before_value: number;
  after_value: number;
  improvement_achieved: number;
  measurement_confidence: number;
}

export interface PerformanceImpact {
  positive_impacts: string[];
  negative_impacts: string[];
  neutral_changes: string[];
  overall_score: number;
}

export interface RollbackPlan {
  steps: RollbackStep[];
  estimated_duration: number;
  success_criteria: string[];
  contacts: string[];
}

export interface RollbackStep {
  id: string;
  description: string;
  command?: string;
  manual_action?: string;
  verification: string;
}
