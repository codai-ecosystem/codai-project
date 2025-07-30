// Core Types and Interfaces for Advanced Analytics & Monitoring System
// Comprehensive type definitions for user behavior tracking, performance metrics,  
// business intelligence, predictive analytics, and A/B testing framework

import { EventEmitter } from 'eventemitter3';

// ===============================
// CORE ANALYTICS TYPES
// ===============================

export interface AnalyticsConfig {
    enabled: boolean;
    dataRetention: {
        events: number; // days
        metrics: number; // days  
        reports: number; // days
        predictions: number; // days
    };
    sampling: {
        userBehavior: number; // 0-1
        performance: number; // 0-1
        errors: number; // 0-1
    };
    storage: {
        primary: 'influxdb' | 'elasticsearch' | 'mongodb' | 'postgresql';
        cache: 'redis' | 'memcached' | 'in-memory';
        backup: 'aws-s3' | 'azure-blob' | 'gcp-storage' | 'local';
    };
    realTime: {
        enabled: boolean;
        batchSize: number;
        flushInterval: number; // ms
        maxRetries: number;
    };
    privacy: {
        anonymization: boolean;
        gdprCompliant: boolean;
        dataEncryption: boolean;
        userConsent: boolean;
    };
}

export interface AnalyticsContext {
    userId?: string;
    sessionId: string;
    userAgent: string;
    ipAddress?: string;
    geolocation?: {
        country: string;
        region: string;
        city: string;
        timezone: string;
    };
    device: {
        type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable';
        os: string;
        browser: string;
        screenResolution: string;
        touchCapability: boolean;
    };
    application: {
        name: string;
        version: string;
        environment: 'development' | 'staging' | 'production';
        buildId: string;
    };
}

// ===============================
// USER BEHAVIOR ANALYTICS
// ===============================

export interface UserBehaviorEvent {
    id: string;
    type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'search' | 'download' | 'custom';
    timestamp: Date;
    userId?: string;
    sessionId: string;
    properties: Record<string, any>;
    context: AnalyticsContext;
    metadata: {
        source: string;
        channel: string;
        campaign?: string;
        referrer?: string;
    };
}

export interface UserJourney {
    userId: string;
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    events: UserBehaviorEvent[];
    funnel: {
        stage: string;
        completionRate: number;
        dropoffPoints: string[];
    };
    conversion: {
        goals: string[];
        achieved: string[];
        value: number;
    };
    segmentation: {
        demographic: Record<string, any>;
        behavioral: Record<string, any>;
        psychographic: Record<string, any>;
    };
}

export interface BehaviorAnalyticsConfig {
    tracking: {
        pageViews: boolean;
        clicks: boolean;
        scrollDepth: boolean;
        formInteractions: boolean;
        heatmaps: boolean;
        sessionRecording: boolean;
    };
    segmentation: {
        enabled: boolean;
        criteria: SegmentationCriteria[];
        realTimeUpdate: boolean;
    };
    funnelAnalysis: {
        enabled: boolean;
        funnels: FunnelDefinition[];
        cohortTracking: boolean;
    };
}

export interface SegmentationCriteria {
    id: string;
    name: string;
    type: 'demographic' | 'behavioral' | 'psychographic' | 'technographic';
    conditions: SegmentCondition[];
    dynamicUpdate: boolean;
}

export interface SegmentCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    logicalOperator?: 'and' | 'or';
}

export interface FunnelDefinition {
    id: string;
    name: string;
    steps: FunnelStep[];
    timeWindow: number; // hours
    conversionGoals: string[];
}

export interface FunnelStep {
    id: string;
    name: string;
    eventType: string;
    conditions: SegmentCondition[];
    required: boolean;
}

// ===============================
// PERFORMANCE METRICS
// ===============================

export interface PerformanceMetrics {
    id: string;
    timestamp: Date;
    context: AnalyticsContext;
    webVitals: {
        lcp: number; // Largest Contentful Paint
        fid: number; // First Input Delay
        cls: number; // Cumulative Layout Shift
        fcp: number; // First Contentful Paint
        ttfb: number; // Time to First Byte
        inp: number; // Interaction to Next Paint
    };
    navigation: {
        domContentLoaded: number;
        loadComplete: number;
        firstByte: number;
        dnsLookup: number;
        tcpConnection: number;
        sslHandshake: number;
    };
    resources: {
        images: ResourceMetric[];
        scripts: ResourceMetric[];
        stylesheets: ResourceMetric[];
        fonts: ResourceMetric[];
        apis: ResourceMetric[];
    };
    runtime: {
        memoryUsage: MemoryUsage;
        cpuUsage: number;
        frameRate: number;
        longTasks: LongTask[];
        errors: ErrorMetric[];
    };
    network: {
        connectionType: string;
        effectiveType: string;
        rtt: number;
        downlink: number;
        saveData: boolean;
    };
}

export interface ResourceMetric {
    url: string;
    type: string;
    size: number;
    loadTime: number;
    cached: boolean;
    renderBlocking: boolean;
}

export interface MemoryUsage {
    used: number;
    total: number;
    limit: number;
    percentage: number;
}

export interface LongTask {
    startTime: number;
    duration: number;
    attribution: TaskAttribution[];
}

export interface TaskAttribution {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
}

export interface ErrorMetric {
    id: string;
    timestamp: Date;
    type: 'javascript' | 'network' | 'resource' | 'csp' | 'unhandledrejection';
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    stack?: string;
    context: Record<string, any>;
    userImpact: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceThresholds {
    webVitals: {
        lcp: { good: number; needsImprovement: number; poor: number };
        fid: { good: number; needsImprovement: number; poor: number };
        cls: { good: number; needsImprovement: number; poor: number };
        fcp: { good: number; needsImprovement: number; poor: number };
        ttfb: { good: number; needsImprovement: number; poor: number };
    };
    customMetrics: Record<string, { target: number; warning: number; critical: number }>;
}

// ===============================
// BUSINESS INTELLIGENCE & REPORTING
// ===============================

export interface BusinessMetrics {
    id: string;
    timestamp: Date;
    period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    kpis: {
        users: {
            total: number;
            active: number;
            new: number;
            returning: number;
            churnRate: number;
            retentionRate: number;
        };
        engagement: {
            sessionsPerUser: number;
            avgSessionDuration: number;
            bounceRate: number;
            pageViewsPerSession: number;
            conversionRate: number;
        };
        performance: {
            avgLoadTime: number;
            errorRate: number;
            availability: number;
            throughput: number;
            p95ResponseTime: number;
        };
        business: {
            revenue: number;
            conversions: number;
            averageOrderValue: number;
            customerLifetimeValue: number;
            costPerAcquisition: number;
        };
    };
    dimensions: Record<string, any>;
    goals: GoalMetric[];
}

export interface GoalMetric {
    id: string;
    name: string;
    type: 'conversion' | 'engagement' | 'retention' | 'revenue' | 'custom';
    target: number;
    actual: number;
    progress: number; // percentage
    trend: 'up' | 'down' | 'stable';
    timeframe: string;
}

export interface ReportConfig {
    id: string;
    name: string;
    type: 'dashboard' | 'scheduled' | 'alert' | 'custom';
    schedule?: {
        frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
        time?: string;
        timezone: string;
    };
    recipients: string[];
    format: 'email' | 'pdf' | 'excel' | 'json' | 'webhook';
    filters: ReportFilter[];
    visualizations: VisualizationConfig[];
    automations: AutomationRule[];
}

export interface ReportFilter {
    field: string;
    operator: string;
    value: any;
    required: boolean;
}

export interface VisualizationConfig {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'funnel' | 'cohort' | 'geographic';
    title: string;
    dataSource: string;
    metrics: string[];
    dimensions: string[];
    filters: ReportFilter[];
    styling: {
        colors: string[];
        layout: 'grid' | 'flex' | 'absolute';
        responsive: boolean;
    };
}

export interface AutomationRule {
    id: string;
    name: string;
    trigger: {
        type: 'threshold' | 'anomaly' | 'schedule' | 'event';
        conditions: SegmentCondition[];
    };
    actions: AutomationAction[];
    enabled: boolean;
}

export interface AutomationAction {
    type: 'email' | 'slack' | 'webhook' | 'create_ticket' | 'scale_resources' | 'custom';
    parameters: Record<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// ===============================
// PREDICTIVE ANALYTICS
// ===============================

export interface PredictiveModel {
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'time_series' | 'anomaly_detection';
    algorithm: 'linear_regression' | 'random_forest' | 'neural_network' | 'lstm' | 'arima' | 'isolation_forest';
    status: 'training' | 'trained' | 'deployed' | 'deprecated';
    features: ModelFeature[];
    target: string;
    performance: ModelPerformance;
    metadata: {
        created: Date;
        lastTrained: Date;
        version: string;
        author: string;
        description: string;
    };
}

export interface ModelFeature {
    name: string;
    type: 'numeric' | 'categorical' | 'boolean' | 'text' | 'datetime';
    importance: number;
    preprocessing: string[];
    nullable: boolean;
}

export interface ModelPerformance {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    rmse?: number;
    mae?: number;
    r2?: number;
    crossValidation: {
        folds: number;
        averageScore: number;
        standardDeviation: number;
    };
}

export interface Prediction {
    id: string;
    modelId: string;
    timestamp: Date;
    input: Record<string, any>;
    output: {
        value: any;
        confidence: number;
        probability?: number;
        explanation?: FeatureImportance[];
    };
    context: AnalyticsContext;
}

export interface FeatureImportance {
    feature: string;
    importance: number;
    contribution: number;
}

export interface AnomalyDetection {
    id: string;
    timestamp: Date;
    type: 'point' | 'contextual' | 'collective';
    metric: string;
    value: number;
    expectedValue: number;
    anomalyScore: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: Record<string, any>;
    rootCause?: string[];
}

export interface ForecastResult {
    id: string;
    metric: string;
    timestamp: Date;
    horizon: number; // days
    predictions: TimeSeriesPoint[];
    confidence: {
        lower: TimeSeriesPoint[];
        upper: TimeSeriesPoint[];
    };
    trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    accuracy: number;
}

export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
}

// ===============================
// A/B TESTING FRAMEWORK
// ===============================

export interface Experiment {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
    type: 'ab_test' | 'multivariate' | 'split_url' | 'feature_flag';
    hypothesis: string;
    startDate: Date;
    endDate?: Date;
    duration?: number; // days
    traffic: {
        allocation: number; // percentage
        targeting: TargetingRule[];
    };
    variants: ExperimentVariant[];
    metrics: ExperimentMetric[];
    results?: ExperimentResults;
    settings: {
        minimumSampleSize: number;
        confidenceLevel: number;
        powerLevel: number;
        multipleComparisons: boolean;
        earlyTermination: boolean;
    };
}

export interface ExperimentVariant {
    id: string;
    name: string;
    description: string;
    traffic: number; // percentage
    isControl: boolean;
    changes: VariantChange[];
}

export interface VariantChange {
    type: 'element' | 'css' | 'javascript' | 'redirect' | 'feature_flag';
    selector?: string;
    property?: string;
    value: any;
    action: 'replace' | 'append' | 'prepend' | 'remove' | 'hide' | 'show';
}

export interface TargetingRule {
    type: 'url' | 'query_param' | 'cookie' | 'user_attribute' | 'device' | 'geo' | 'custom';
    field: string;
    operator: string;
    value: any;
    logicalOperator?: 'and' | 'or';
}

export interface ExperimentMetric {
    id: string;
    name: string;
    type: 'conversion' | 'revenue' | 'engagement' | 'custom';
    isPrimary: boolean;
    goal: 'increase' | 'decrease' | 'no_change';
    aggregation: 'sum' | 'count' | 'average' | 'median' | 'percentile';
    selector?: string;
    eventType?: string;
    valueProperty?: string;
}

export interface ExperimentResults {
    status: 'insufficient_data' | 'running' | 'significant' | 'not_significant' | 'inconclusive';
    duration: number; // days
    participants: number;
    confidence: number;
    pValue: number;
    effect: number; // percentage change
    variants: VariantResults[];
    recommendations: string[];
    statisticalPower: number;
}

export interface VariantResults {
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    confidence: {
        lower: number;
        upper: number;
    };
    metrics: MetricResult[];
    isWinner: boolean;
    improvement: number; // percentage vs control
}

export interface MetricResult {
    metricId: string;
    value: number;
    change: number; // percentage vs control
    significance: 'significant' | 'not_significant';
    pValue: number;
    confidence: {
        lower: number;
        upper: number;
    };
}

// ===============================
// DATA VISUALIZATION
// ===============================

export interface DashboardConfig {
    id: string;
    name: string;
    description: string;
    layout: 'grid' | 'flex' | 'masonry';
    refreshInterval: number; // seconds
    filters: DashboardFilter[];
    widgets: WidgetConfig[];
    sharing: {
        public: boolean;
        allowedUsers: string[];
        embedEnabled: boolean;
    };
    themes: {
        default: string;
        dark: string;
        light: string;
    };
}

export interface DashboardFilter {
    id: string;
    name: string;
    type: 'date_range' | 'dropdown' | 'multiselect' | 'text' | 'number';
    required: boolean;
    defaultValue: any;
    options?: FilterOption[];
}

export interface FilterOption {
    label: string;
    value: any;
    selected: boolean;
}

export interface WidgetConfig {
    id: string;
    type: 'metric' | 'chart' | 'table' | 'map' | 'text' | 'iframe';
    title: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dataSource: DataSourceConfig;
    visualization: VisualizationConfig;
    interactions: WidgetInteraction[];
}

export interface DataSourceConfig {
    type: 'analytics' | 'performance' | 'business' | 'custom';
    query: string;
    parameters: Record<string, any>;
    refreshRate: number; // seconds
    caching: {
        enabled: boolean;
        ttl: number; // seconds
    };
}

export interface WidgetInteraction {
    type: 'click' | 'hover' | 'drill_down' | 'filter' | 'export';
    action: string;
    parameters: Record<string, any>;
}

// ===============================
// REAL-TIME PROCESSING
// ===============================

export interface RealTimeConfig {
    enabled: boolean;
    processing: {
        windowSize: number; // seconds
        batchSize: number;
        processingDelay: number; // ms
        parallelism: number;
    };
    streaming: {
        provider: 'kafka' | 'pulsar' | 'kinesis' | 'pubsub' | 'rabbitmq';
        topics: string[];
        partitions: number;
        replicationFactor: number;
    };
    aggregations: RealTimeAggregation[];
    alerts: RealTimeAlert[];
}

export interface RealTimeAggregation {
    id: string;
    name: string;
    inputStream: string;
    outputStream: string;
    window: {
        type: 'tumbling' | 'sliding' | 'session';
        size: number; // seconds
        slide?: number; // seconds for sliding windows
    };
    aggregationType: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'percentile';
    groupBy: string[];
    filters: StreamFilter[];
}

export interface StreamFilter {
    field: string;
    operator: string;
    value: any;
}

export interface RealTimeAlert {
    id: string;
    name: string;
    condition: AlertCondition;
    actions: AlertAction[];
    enabled: boolean;
    cooldown: number; // seconds
}

export interface AlertCondition {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'anomaly';
    threshold: number;
    duration: number; // seconds
}

export interface AlertAction {
    type: 'email' | 'sms' | 'webhook' | 'slack' | 'pagerduty';
    recipients: string[];
    template: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// ===============================
// ENGINE INTERFACES
// ===============================

export interface AdvancedAnalyticsEngine extends EventEmitter {
    // Core Engine Management
    initialize(config: AnalyticsConfig): Promise<void>;
    shutdown(): Promise<void>;
    getConfig(): AnalyticsConfig;
    updateConfig(config: Partial<AnalyticsConfig>): Promise<void>;
    getStatus(): EngineStatus;

    // User Behavior Analytics
    trackEvent(event: UserBehaviorEvent): Promise<void>;
    trackUserJourney(journey: UserJourney): Promise<void>;
    getSegments(userId?: string): Promise<SegmentationCriteria[]>;
    analyzeFunnel(funnelId: string, dateRange: DateRange): Promise<FunnelAnalysis>;
    getCohortAnalysis(cohortId: string): Promise<CohortAnalysis>;

    // Performance Monitoring
    recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void>;
    getPerformanceReport(dateRange: DateRange): Promise<PerformanceReport>;
    detectPerformanceAnomalies(): Promise<AnomalyDetection[]>;
    optimizePerformance(): Promise<OptimizationRecommendation[]>;

    // Business Intelligence
    generateBusinessReport(config: ReportConfig): Promise<BusinessReport>;
    calculateKPIs(period: string, filters?: ReportFilter[]): Promise<BusinessMetrics>;
    scheduleReport(config: ReportConfig): Promise<string>;
    exportData(format: string, filters?: ReportFilter[]): Promise<Buffer>;

    // Predictive Analytics
    trainModel(config: ModelTrainingConfig): Promise<PredictiveModel>;
    makePrediction(modelId: string, input: Record<string, any>): Promise<Prediction>;
    detectAnomalies(metric: string, data: TimeSeriesPoint[]): Promise<AnomalyDetection[]>;
    generateForecast(metric: string, horizon: number): Promise<ForecastResult>;

    // A/B Testing
    createExperiment(experiment: Experiment): Promise<string>;
    runExperiment(experimentId: string): Promise<void>;
    getExperimentResults(experimentId: string): Promise<ExperimentResults>;
    optimizeExperiment(experimentId: string): Promise<OptimizationRecommendation[]>;

    // Data Management
    query(sql: string, parameters?: any[]): Promise<QueryResult>;
    aggregate(pipeline: AggregationPipeline): Promise<AggregationResult>;
    backup(destination: string): Promise<BackupResult>;
    restore(source: string): Promise<RestoreResult>;
}

export interface EngineStatus {
    status: 'initializing' | 'running' | 'paused' | 'error' | 'shutdown';
    uptime: number; // seconds
    version: string;
    components: ComponentStatus[];
    performance: {
        eventsPerSecond: number;
        avgProcessingTime: number;
        memoryUsage: MemoryUsage;
        errorRate: number;
    };
    health: {
        score: number; // 0-100
        issues: HealthIssue[];
        lastCheck: Date;
    };
}

export interface ComponentStatus {
    name: string;
    status: 'healthy' | 'warning' | 'error' | 'disabled';
    uptime: number;
    lastActivity: Date;
    metrics: Record<string, number>;
}

export interface HealthIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
}

// ===============================
// UTILITY TYPES
// ===============================

export interface DateRange {
    start: Date;
    end: Date;
    timezone?: string;
}

export interface QueryResult {
    data: any[];
    totalCount: number;
    duration: number;
    cached: boolean;
}

export interface AggregationPipeline {
    stages: AggregationStage[];
    options?: {
        timeout: number;
        allowDiskUse: boolean;
    };
}

export interface AggregationStage {
    operation: string;
    parameters: Record<string, any>;
}

export interface AggregationResult {
    data: any[];
    stages: number;
    duration: number;
    documentsProcessed: number;
}

export interface BackupResult {
    id: string;
    size: number;
    duration: number;
    location: string;
    checksum: string;
}

export interface RestoreResult {
    success: boolean;
    duration: number;
    recordsRestored: number;
    errors: string[];
}

// Additional Analytics Types
export interface FunnelAnalysis {
    funnelId: string;
    totalUsers: number;
    steps: FunnelStepAnalysis[];
    conversionRate: number;
    dropoffRate: number;
    averageTime: number;
}

export interface FunnelStepAnalysis {
    stepId: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
    averageTime: number;
}

export interface CohortAnalysis {
    cohortId: string;
    periods: CohortPeriod[];
    retentionMatrix: number[][];
    averageRetention: number;
}

export interface CohortPeriod {
    period: string;
    users: number;
    retention: number[];
}

export interface PerformanceReport {
    summary: PerformanceSummary;
    trends: PerformanceTrend[];
    recommendations: OptimizationRecommendation[];
    comparisons: PerformanceComparison[];
}

export interface PerformanceSummary {
    averageLoadTime: number;
    p95LoadTime: number;
    errorRate: number;
    availability: number;
    throughput: number;
}

export interface PerformanceTrend {
    metric: string;
    trend: 'improving' | 'degrading' | 'stable';
    changePercent: number;
    periodComparison: string;
}

export interface OptimizationRecommendation {
    type: 'performance' | 'user_experience' | 'conversion' | 'cost';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
    actions: string[];
}

export interface PerformanceComparison {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

export interface BusinessReport {
    id: string;
    name: string;
    generatedAt: Date;
    period: DateRange;
    summary: BusinessReportSummary;
    sections: BusinessReportSection[];
    attachments: ReportAttachment[];
}

export interface BusinessReportSummary {
    keyMetrics: Record<string, number>;
    highlights: string[];
    concerns: string[];
    recommendations: string[];
}

export interface BusinessReportSection {
    title: string;
    type: 'metrics' | 'chart' | 'table' | 'text';
    content: any;
    insights: string[];
}

export interface ReportAttachment {
    name: string;
    type: string;
    size: number;
    url: string;
}

export interface ModelTrainingConfig {
    name: string;
    type: PredictiveModel['type'];
    algorithm: PredictiveModel['algorithm'];
    features: string[];
    target: string;
    trainingData: {
        source: string;
        dateRange: DateRange;
        filters?: ReportFilter[];
    };
    validation: {
        method: 'holdout' | 'cross_validation' | 'time_series_split';
        testSize: number;
        folds?: number;
    };
    hyperparameters: Record<string, any>;
}

// Event types for EventEmitter
export interface AnalyticsEvents {
    'engine:initialized': () => void;
    'engine:shutdown': () => void;
    'engine:error': (error: Error) => void;
    'event:tracked': (event: UserBehaviorEvent) => void;
    'metrics:recorded': (metrics: PerformanceMetrics) => void;
    'anomaly:detected': (anomaly: AnomalyDetection) => void;
    'experiment:started': (experimentId: string) => void;
    'experiment:completed': (experimentId: string, results: ExperimentResults) => void;
    'model:trained': (model: PredictiveModel) => void;
    'prediction:made': (prediction: Prediction) => void;
    'report:generated': (report: BusinessReport) => void;
    'alert:triggered': (alert: RealTimeAlert) => void;
}

// Default configurations
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
    enabled: true,
    dataRetention: {
        events: 90,
        metrics: 365,
        reports: 730,
        predictions: 30
    },
    sampling: {
        userBehavior: 1.0,
        performance: 1.0,
        errors: 1.0
    },
    storage: {
        primary: 'influxdb',
        cache: 'redis',
        backup: 'aws-s3'
    },
    realTime: {
        enabled: true,
        batchSize: 1000,
        flushInterval: 5000,
        maxRetries: 3
    },
    privacy: {
        anonymization: true,
        gdprCompliant: true,
        dataEncryption: true,
        userConsent: true
    }
};

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
    webVitals: {
        lcp: { good: 2500, needsImprovement: 4000, poor: 4000 },
        fid: { good: 100, needsImprovement: 300, poor: 300 },
        cls: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
        fcp: { good: 1800, needsImprovement: 3000, poor: 3000 },
        ttfb: { good: 800, needsImprovement: 1800, poor: 1800 }
    },
    customMetrics: {
        'api_response_time': { target: 200, warning: 500, critical: 1000 },
        'database_query_time': { target: 100, warning: 300, critical: 1000 },
        'memory_usage_percent': { target: 70, warning: 85, critical: 95 },
        'cpu_usage_percent': { target: 60, warning: 80, critical: 95 },
        'error_rate_percent': { target: 0.1, warning: 1, critical: 5 }
    }
};

export default AdvancedAnalyticsEngine;
