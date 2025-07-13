import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { AI_PROVIDERS } from './index';

// Smart Monitoring & Anomaly Detection
export interface MetricsData {
  timestamp: number;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  latency: number;
  customMetrics?: Record<string, number>;
}

export interface AnomalyDetectionRequest {
  metrics: MetricsData[];
  timeWindow: number; // minutes
  sensitivity: 'low' | 'medium' | 'high';
  baseline?: MetricsData[];
}

export interface AnomalyDetectionResponse {
  anomalies: Array<{
    timestamp: number;
    metric: string;
    value: number;
    expectedValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
    recommendedActions: string[];
  }>;
  overallHealth: 'healthy' | 'warning' | 'critical';
  insights: string[];
  predictions: Array<{
    metric: string;
    nextHour: number;
    nextDay: number;
    confidence: number;
  }>;
}

const anomalySchema = z.object({
  anomalies: z.array(z.object({
    timestamp: z.number(),
    metric: z.string(),
    value: z.number(),
    expectedValue: z.number(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    confidence: z.number().min(0).max(1),
    description: z.string(),
    recommendedActions: z.array(z.string()),
  })),
  overallHealth: z.enum(['healthy', 'warning', 'critical']),
  insights: z.array(z.string()),
  predictions: z.array(z.object({
    metric: z.string(),
    nextHour: z.number(),
    nextDay: z.number(),
    confidence: z.number().min(0).max(1),
  })),
});

export async function detectAnomalies(
  request: AnomalyDetectionRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-sonnet'
): Promise<AnomalyDetectionResponse> {
  const model = AI_PROVIDERS.anthropic[provider];

  const metricsJson = JSON.stringify(request.metrics, null, 2);
  const baselineJson = request.baseline ? JSON.stringify(request.baseline, null, 2) : null;

  const result = await generateObject({
    model,
    schema: anomalySchema,
    system: `You are an expert system monitoring engineer with deep knowledge of performance metrics, anomaly detection, and predictive analysis. Analyze system metrics to identify anomalies, patterns, and provide actionable insights.`,
    prompt: `Analyze the following system metrics for anomalies:

Time Window: ${request.timeWindow} minutes
Sensitivity: ${request.sensitivity}

Current Metrics:
${metricsJson}

${baselineJson ? `Baseline Metrics:
${baselineJson}` : ''}

Tasks:
1. Identify anomalies in CPU, memory, requests, errors, latency, and custom metrics
2. Assess severity and confidence levels
3. Provide clear descriptions and recommended actions
4. Evaluate overall system health
5. Generate insights about patterns and trends
6. Predict future metric values for the next hour and day

Consider:
- Seasonal patterns and normal variations
- Correlation between different metrics
- Historical context and trends
- Potential root causes
- Impact on system performance and user experience`,
  });

  return result.object as any;
}

// AI-Powered Alert Generation
export interface AlertRequest {
  anomaly: AnomalyDetectionResponse['anomalies'][0];
  context: {
    systemName: string;
    environment: 'development' | 'staging' | 'production';
    userImpact?: string;
    recentDeployments?: string[];
    relatedIncidents?: string[];
  };
}

export async function generateAlert(
  request: AlertRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o-mini'
): Promise<{
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  tags: string[];
  runbook?: string;
  escalationPath?: string[];
}> {
  const model = AI_PROVIDERS.openai[provider];

  const alertSchema = z.object({
    title: z.string().describe('Clear, actionable alert title'),
    description: z.string().describe('Detailed description of the issue'),
    priority: z.enum(['P1', 'P2', 'P3', 'P4']).describe('Alert priority level'),
    tags: z.array(z.string()).describe('Relevant tags for categorization'),
    runbook: z.string().optional().describe('Step-by-step troubleshooting guide'),
    escalationPath: z.array(z.string()).optional().describe('Who to notify at each level'),
  });

  const result = await generateObject({
    model,
    schema: alertSchema,
    system: `You are an SRE expert creating actionable alerts for production systems. Generate clear, informative alerts that help engineers quickly understand and resolve issues.`,
    prompt: `Generate an alert for the following anomaly:

System: ${request.context.systemName}
Environment: ${request.context.environment}
Metric: ${request.anomaly.metric}
Current Value: ${request.anomaly.value}
Expected Value: ${request.anomaly.expectedValue}
Severity: ${request.anomaly.severity}
Confidence: ${(request.anomaly.confidence * 100).toFixed(1)}%

Description: ${request.anomaly.description}
Recommended Actions: ${request.anomaly.recommendedActions.join(', ')}

${request.context.userImpact ? `User Impact: ${request.context.userImpact}` : ''}
${request.context.recentDeployments?.length ? `Recent Deployments: ${request.context.recentDeployments.join(', ')}` : ''}
${request.context.relatedIncidents?.length ? `Related Incidents: ${request.context.relatedIncidents.join(', ')}` : ''}

Create a clear, actionable alert that includes:
- Concise but informative title
- Detailed description with context
- Appropriate priority level
- Relevant tags for filtering
- Troubleshooting runbook if applicable
- Escalation path for critical issues`,
  });

  return result.object as any;
}

// Performance Optimization Recommendations
export interface PerformanceAnalysisRequest {
  metrics: MetricsData[];
  codeProfile?: {
    functions: Array<{
      name: string;
      executionTime: number;
      callCount: number;
      memoryUsage: number;
    }>;
    queries: Array<{
      query: string;
      executionTime: number;
      frequency: number;
    }>;
  };
  infrastructure?: {
    instances: number;
    cpu: string;
    memory: string;
    storage: string;
    network: string;
  };
}

export async function analyzePerformance(
  request: PerformanceAnalysisRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-sonnet'
): Promise<{
  bottlenecks: Array<{
    type: 'cpu' | 'memory' | 'network' | 'database' | 'code';
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    estimatedImprovement: string;
  }>;
  optimizations: Array<{
    category: string;
    priority: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    description: string;
    implementation: string;
  }>;
  insights: string[];
}> {
  const model = AI_PROVIDERS.anthropic[provider];

  const analysisSchema = z.object({
    bottlenecks: z.array(z.object({
      type: z.enum(['cpu', 'memory', 'network', 'database', 'code']),
      description: z.string(),
      impact: z.enum(['low', 'medium', 'high', 'critical']),
      recommendations: z.array(z.string()),
      estimatedImprovement: z.string(),
    })),
    optimizations: z.array(z.object({
      category: z.string(),
      priority: z.number().min(1).max(10),
      effort: z.enum(['low', 'medium', 'high']),
      impact: z.enum(['low', 'medium', 'high']),
      description: z.string(),
      implementation: z.string(),
    })),
    insights: z.array(z.string()),
  });

  const metricsJson = JSON.stringify(request.metrics, null, 2);
  const profileJson = request.codeProfile ? JSON.stringify(request.codeProfile, null, 2) : null;
  const infraJson = request.infrastructure ? JSON.stringify(request.infrastructure, null, 2) : null;

  const result = await generateObject({
    model,
    schema: analysisSchema,
    system: `You are a performance optimization expert with deep knowledge of system architecture, database optimization, and application performance tuning. Analyze performance data to identify bottlenecks and provide actionable optimization recommendations.`,
    prompt: `Analyze the following performance data and provide optimization recommendations:

System Metrics:
${metricsJson}

${profileJson ? `Code Profiling Data:
${profileJson}` : ''}

${infraJson ? `Infrastructure Configuration:
${infraJson}` : ''}

Provide:
1. Identified bottlenecks with type, impact assessment, and specific recommendations
2. Prioritized optimization opportunities with effort vs impact analysis
3. Implementation strategies for each recommendation
4. Performance insights and patterns
5. Estimated improvements for each optimization

Consider:
- Resource utilization patterns
- Database query optimization
- Caching strategies
- Code-level optimizations
- Infrastructure scaling
- Network optimization
- Memory management`,
  });

  return result.object as any;
}

// Predictive Scaling Recommendations
export interface ScalingRequest {
  currentMetrics: MetricsData[];
  historicalData: MetricsData[];
  upcomingEvents?: Array<{
    name: string;
    date: string;
    expectedTraffic: number;
    duration: number;
  }>;
  constraints?: {
    maxInstances?: number;
    budgetLimit?: number;
    latencyTarget?: number;
  };
}

export async function generateScalingRecommendations(
  request: ScalingRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o'
): Promise<{
  recommendations: Array<{
    timeframe: string;
    action: 'scale_up' | 'scale_down' | 'maintain';
    targetInstances: number;
    confidence: number;
    reasoning: string;
    costImpact: string;
  }>;
  triggers: Array<{
    metric: string;
    threshold: number;
    action: string;
    description: string;
  }>;
  insights: string[];
}> {
  const model = AI_PROVIDERS.openai[provider];

  const scalingSchema = z.object({
    recommendations: z.array(z.object({
      timeframe: z.string(),
      action: z.enum(['scale_up', 'scale_down', 'maintain']),
      targetInstances: z.number(),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
      costImpact: z.string(),
    })),
    triggers: z.array(z.object({
      metric: z.string(),
      threshold: z.number(),
      action: z.string(),
      description: z.string(),
    })),
    insights: z.array(z.string()),
  });

  const currentJson = JSON.stringify(request.currentMetrics, null, 2);
  const historicalJson = JSON.stringify(request.historicalData, null, 2);
  const eventsJson = request.upcomingEvents ? JSON.stringify(request.upcomingEvents, null, 2) : null;
  const constraintsJson = request.constraints ? JSON.stringify(request.constraints, null, 2) : null;

  const result = await generateObject({
    model,
    schema: scalingSchema,
    system: `You are a cloud infrastructure expert specializing in predictive scaling and cost optimization. Analyze system metrics and usage patterns to provide intelligent scaling recommendations.`,
    prompt: `Analyze the following data to provide predictive scaling recommendations:

Current Metrics:
${currentJson}

Historical Data:
${historicalJson}

${eventsJson ? `Upcoming Events:
${eventsJson}` : ''}

${constraintsJson ? `Constraints:
${constraintsJson}` : ''}

Provide:
1. Time-based scaling recommendations with confidence levels
2. Automated scaling triggers and thresholds
3. Cost impact analysis for each recommendation
4. Insights about usage patterns and trends
5. Optimization opportunities

Consider:
- Historical usage patterns and seasonality
- Upcoming events and traffic spikes
- Resource utilization efficiency
- Cost optimization opportunities
- Performance requirements and SLA compliance
- Auto-scaling policies and triggers`,
  });

  return result.object as any;
}
