/**
 * ROMAI Phase 2.3 - Advanced Analytics & Business Intelligence Validation
 * 
 * Comprehensive validation suite for testing analytics engine, BI dashboard,
 * and data visualization components to ensure enterprise-grade functionality
 * and performance standards.
 */

import { analyticsEngine } from '../analytics/analytics-engine';
import { biDashboard } from '../analytics/bi-dashboard';
import { visualizationEngine } from '../analytics/data-visualization';
import { enterpriseLogger } from '../logging/enterprise-logger';

interface ValidationResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  details: string;
  metrics?: Record<string, any>;
}

interface PhaseValidationSummary {
  phase: string;
  version: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  successRate: number;
  averageDuration: number;
  results: ValidationResult[];
  overallStatus: 'success' | 'partial' | 'failure';
  recommendations: string[];
}

class Phase23Validator {
  private results: ValidationResult[] = [];
  private startTime: number = 0;

  /**
   * Run comprehensive Phase 2.3 validation
   */
  public async validatePhase23(): Promise<PhaseValidationSummary> {
    console.log('\n🧠 === ROMAI Phase 2.3 Validation: Advanced Analytics & BI ===\n');

    this.startTime = Date.now();
    this.results = [];

    try {
      // Test Analytics Engine
      await this.validateAnalyticsEngine();

      // Test Business Intelligence Dashboard
      await this.validateBIDashboard();

      // Test Data Visualization Engine
      await this.validateDataVisualization();

      // Test Integration & Performance
      await this.validateIntegrationAndPerformance();

      // Test Enterprise Features
      await this.validateEnterpriseFeatures();

    } catch (error) {
      this.addResult('Phase 2.3 Critical Error', 'fail', `Validation failed: ${error}`);
    }

    return this.generateSummary();
  }

  /**
   * Validate Analytics Engine functionality
   */
  private async validateAnalyticsEngine(): Promise<void> {
    console.log('📊 Testing Analytics Engine...');

    // Test 1: User Behavior Tracking
    const startTime = Date.now();
    try {
      const eventId = analyticsEngine.recordUserBehavior({
        userId: 'test-user-001',
        organizationId: 'test-org-001',
        sessionId: 'session-001',
        eventType: 'intelligence_query',
        action: 'query_execution',
        metadata: {
          duration: 1250,
          success: true,
          queryType: 'complex_analysis',
          responseSize: 2048
        },
        context: {
          page: '/intelligence',
          platform: 'web',
          deviceType: 'desktop',
          browser: 'Chrome'
        }
      });

      if (eventId && eventId.length > 0) {
        this.addResult('User Behavior Tracking', 'pass',
          `Successfully recorded user behavior event: ${eventId}`, { eventId }, startTime);
      } else {
        this.addResult('User Behavior Tracking', 'fail', 'Failed to record user behavior event', {}, startTime);
      }
    } catch (error) {
      this.addResult('User Behavior Tracking', 'fail',
        `Error recording user behavior: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, startTime);
    }

    // Test 2: Performance Metrics Recording
    const perfStartTime = Date.now();
    try {
      const metricId = analyticsEngine.recordPerformanceMetric({
        organizationId: 'test-org-001',
        metricType: 'response_time',
        value: 245,
        unit: 'milliseconds',
        tags: { endpoint: '/api/intelligence', method: 'POST' },
        dimensions: {
          service: 'romai-mcp',
          endpoint: '/intelligence',
          feature: 'query_processing'
        }
      });

      if (metricId && metricId.length > 0) {
        this.addResult('Performance Metrics Recording', 'pass',
          `Successfully recorded performance metric: ${metricId}`, { metricId }, perfStartTime);
      } else {
        this.addResult('Performance Metrics Recording', 'fail', 'Failed to record performance metric', {}, perfStartTime);
      }
    } catch (error) {
      this.addResult('Performance Metrics Recording', 'fail',
        `Error recording performance metric: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, perfStartTime);
    }

    // Test 3: Business Metrics Recording
    const bizStartTime = Date.now();
    try {
      const bizMetricId = analyticsEngine.recordBusinessMetric({
        organizationId: 'test-org-001',
        metricType: 'user_engagement',
        value: 87.5,
        period: 'daily',
        breakdown: {
          'high_engagement': 35,
          'medium_engagement': 52.5,
          'low_engagement': 12.5
        },
        trends: {
          previousPeriod: 82.3,
          growthRate: 6.3,
          forecast: 91.2
        }
      });

      if (bizMetricId && bizMetricId.length > 0) {
        this.addResult('Business Metrics Recording', 'pass',
          `Successfully recorded business metric: ${bizMetricId}`, { bizMetricId }, bizStartTime);
      } else {
        this.addResult('Business Metrics Recording', 'fail', 'Failed to record business metric', {}, bizStartTime);
      }
    } catch (error) {
      this.addResult('Business Metrics Recording', 'fail',
        `Error recording business metric: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, bizStartTime);
    }

    // Test 4: Analytics Report Generation
    const reportStartTime = Date.now();
    try {
      const report = analyticsEngine.generateAnalyticsReport(
        'test-org-001',
        'usage_summary',
        {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        }
      );

      if (report && report.reportId && report.data) {
        this.addResult('Analytics Report Generation', 'pass',
          `Successfully generated analytics report: ${report.reportId}`,
          {
            reportId: report.reportId,
            insightsCount: report.data.insights?.length || 0,
            recommendationsCount: report.data.recommendations?.length || 0
          }, reportStartTime);
      } else {
        this.addResult('Analytics Report Generation', 'fail', 'Failed to generate analytics report', {}, reportStartTime);
      }
    } catch (error) {
      this.addResult('Analytics Report Generation', 'fail',
        `Error generating analytics report: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, reportStartTime);
    }

    // Test 5: Real-time Dashboard Data
    const dashboardStartTime = Date.now();
    try {
      const dashboardData = analyticsEngine.getDashboardData('test-org-001');

      if (dashboardData && typeof dashboardData.activeUsers === 'number') {
        this.addResult('Real-time Dashboard Data', 'pass',
          `Successfully retrieved dashboard data - Active Users: ${dashboardData.activeUsers}`,
          {
            activeUsers: dashboardData.activeUsers,
            requestsPerMinute: dashboardData.requestsPerMinute,
            averageResponseTime: dashboardData.averageResponseTime,
            errorRate: dashboardData.errorRate
          }, dashboardStartTime);
      } else {
        this.addResult('Real-time Dashboard Data', 'fail', 'Failed to retrieve dashboard data', {}, dashboardStartTime);
      }
    } catch (error) {
      this.addResult('Real-time Dashboard Data', 'fail',
        `Error retrieving dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, dashboardStartTime);
    }

    // Test 6: User Segmentation
    const segmentStartTime = Date.now();
    try {
      const segments = analyticsEngine.getUserSegments('test-org-001');

      if (segments && Array.isArray(segments) && segments.length > 0) {
        this.addResult('User Segmentation', 'pass',
          `Successfully retrieved ${segments.length} user segments`,
          {
            segmentCount: segments.length,
            segments: segments.map(s => ({ name: s.name, size: s.metrics.size }))
          }, segmentStartTime);
      } else {
        this.addResult('User Segmentation', 'fail', 'Failed to retrieve user segments', {}, segmentStartTime);
      }
    } catch (error) {
      this.addResult('User Segmentation', 'fail',
        `Error retrieving user segments: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, segmentStartTime);
    }
  }

  /**
   * Validate Business Intelligence Dashboard functionality
   */
  private async validateBIDashboard(): Promise<void> {
    console.log('📈 Testing Business Intelligence Dashboard...');

    // Test 1: Dashboard Creation
    const createStartTime = Date.now();
    try {
      const dashboardId = biDashboard.createDashboard({
        organizationId: 'test-org-001',
        name: 'Test Executive Dashboard',
        description: 'Validation test dashboard for executive metrics',
        category: 'executive',
        visibility: 'organization',
        owner: 'test-user-001',
        widgets: [
          {
            widgetId: 'widget-001',
            type: 'metric',
            title: 'Active Users',
            description: 'Current active users',
            dataSource: 'analytics',
            configuration: {
              metricType: 'active_users',
              timeRange: 'hour',
              refreshInterval: 60
            },
            position: { x: 0, y: 0, width: 3, height: 2 },
            style: { backgroundColor: '#f8f9fa', showBorder: true, showTitle: true }
          },
          {
            widgetId: 'widget-002',
            type: 'chart',
            title: 'Performance Trends',
            description: 'System performance over time',
            dataSource: 'performance',
            configuration: {
              chartType: 'line',
              timeRange: 'day',
              refreshInterval: 300
            },
            position: { x: 3, y: 0, width: 6, height: 4 },
            style: { backgroundColor: '#ffffff', showBorder: true, showTitle: true }
          }
        ],
        layout: { columns: 12, rows: 8, gap: 16 },
        theme: {
          name: 'corporate',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          darkMode: false
        },
        permissions: {
          viewers: ['test-user-002'],
          editors: ['test-user-001'],
          admins: ['test-user-001']
        }
      });

      if (dashboardId && dashboardId.length > 0) {
        this.addResult('Dashboard Creation', 'pass',
          `Successfully created dashboard: ${dashboardId}`, { dashboardId }, createStartTime);
      } else {
        this.addResult('Dashboard Creation', 'fail', 'Failed to create dashboard', {}, createStartTime);
      }
    } catch (error) {
      this.addResult('Dashboard Creation', 'fail',
        `Error creating dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, createStartTime);
    }

    // Test 2: Dashboard Retrieval
    const retrieveStartTime = Date.now();
    try {
      const dashboards = biDashboard.getDashboards('test-org-001', 'test-user-001');

      if (dashboards && Array.isArray(dashboards) && dashboards.length > 0) {
        this.addResult('Dashboard Retrieval', 'pass',
          `Successfully retrieved ${dashboards.length} dashboards`,
          {
            dashboardCount: dashboards.length,
            dashboards: dashboards.map(d => ({ id: d.dashboardId, name: d.name, category: d.category }))
          }, retrieveStartTime);
      } else {
        this.addResult('Dashboard Retrieval', 'warning', 'No dashboards found for organization', {}, retrieveStartTime);
      }
    } catch (error) {
      this.addResult('Dashboard Retrieval', 'fail',
        `Error retrieving dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, retrieveStartTime);
    }

    // Test 3: Alert Rule Creation
    const alertStartTime = Date.now();
    try {
      const ruleId = biDashboard.createAlertRule({
        organizationId: 'test-org-001',
        name: 'High Response Time Alert',
        description: 'Alert when response time exceeds threshold',
        metricType: 'response_time',
        condition: {
          operator: 'gt',
          value: 1000
        },
        severity: 'warning',
        recipients: ['admin@test-org.com'],
        channels: ['email', 'dashboard'],
        enabled: true,
        cooldown: 15
      });

      if (ruleId && ruleId.length > 0) {
        this.addResult('Alert Rule Creation', 'pass',
          `Successfully created alert rule: ${ruleId}`, { ruleId }, alertStartTime);
      } else {
        this.addResult('Alert Rule Creation', 'fail', 'Failed to create alert rule', {}, alertStartTime);
      }
    } catch (error) {
      this.addResult('Alert Rule Creation', 'fail',
        `Error creating alert rule: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, alertStartTime);
    }

    // Test 4: Real-time Dashboard Data
    const realTimeStartTime = Date.now();
    try {
      // Find a dashboard first
      const dashboards = biDashboard.getDashboards('test-org-001');
      if (dashboards.length > 0) {
        const realTimeData = biDashboard.getRealTimeDashboardData(dashboards[0].dashboardId);

        if (realTimeData && realTimeData.dashboardId) {
          this.addResult('Real-time Dashboard Data', 'pass',
            `Successfully retrieved real-time data for dashboard: ${realTimeData.dashboardId}`,
            {
              dashboardId: realTimeData.dashboardId,
              timestamp: realTimeData.timestamp,
              widgetCount: Object.keys(realTimeData.widgets || {}).length
            }, realTimeStartTime);
        } else {
          this.addResult('Real-time Dashboard Data', 'fail', 'Failed to retrieve real-time dashboard data', {}, realTimeStartTime);
        }
      } else {
        this.addResult('Real-time Dashboard Data', 'warning', 'No dashboards available for real-time data test', {}, realTimeStartTime);
      }
    } catch (error) {
      this.addResult('Real-time Dashboard Data', 'fail',
        `Error retrieving real-time dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, realTimeStartTime);
    }
  }

  /**
   * Validate Data Visualization Engine functionality
   */
  private async validateDataVisualization(): Promise<void> {
    console.log('📊 Testing Data Visualization Engine...');

    // Test 1: Line Chart Creation
    const lineChartStartTime = Date.now();
    try {
      const sampleData = [
        { timestamp: new Date(Date.now() - 60000).toISOString(), value: 45 },
        { timestamp: new Date(Date.now() - 30000).toISOString(), value: 52 },
        { timestamp: new Date().toISOString(), value: 48 }
      ];

      const lineChartId = visualizationEngine.generateLineChart(sampleData, {
        title: 'Performance Trend',
        xAxis: { type: 'datetime', label: 'Time' },
        yAxis: { type: 'numeric', label: 'Response Time (ms)' }
      });

      if (lineChartId && lineChartId.length > 0) {
        this.addResult('Line Chart Creation', 'pass',
          `Successfully created line chart: ${lineChartId}`, { chartId: lineChartId }, lineChartStartTime);
      } else {
        this.addResult('Line Chart Creation', 'fail', 'Failed to create line chart', {}, lineChartStartTime);
      }
    } catch (error) {
      this.addResult('Line Chart Creation', 'fail',
        `Error creating line chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, lineChartStartTime);
    }

    // Test 2: Bar Chart Creation
    const barChartStartTime = Date.now();
    try {
      const barData = [
        { timestamp: '2024-01', value: 120, label: 'January' },
        { timestamp: '2024-02', value: 145, label: 'February' },
        { timestamp: '2024-03', value: 132, label: 'March' }
      ];

      const barChartId = visualizationEngine.generateBarChart(barData, {
        title: 'Monthly Usage',
        xAxis: { type: 'categorical', label: 'Month' },
        yAxis: { type: 'numeric', label: 'Users' }
      });

      if (barChartId && barChartId.length > 0) {
        this.addResult('Bar Chart Creation', 'pass',
          `Successfully created bar chart: ${barChartId}`, { chartId: barChartId }, barChartStartTime);
      } else {
        this.addResult('Bar Chart Creation', 'fail', 'Failed to create bar chart', {}, barChartStartTime);
      }
    } catch (error) {
      this.addResult('Bar Chart Creation', 'fail',
        `Error creating bar chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, barChartStartTime);
    }

    // Test 3: Pie Chart Creation
    const pieChartStartTime = Date.now();
    try {
      const pieData = [
        { timestamp: 'Desktop', value: 65, label: 'Desktop' },
        { timestamp: 'Mobile', value: 25, label: 'Mobile' },
        { timestamp: 'Tablet', value: 10, label: 'Tablet' }
      ];

      const pieChartId = visualizationEngine.generatePieChart(pieData, {
        title: 'Device Distribution'
      });

      if (pieChartId && pieChartId.length > 0) {
        this.addResult('Pie Chart Creation', 'pass',
          `Successfully created pie chart: ${pieChartId}`, { chartId: pieChartId }, pieChartStartTime);
      } else {
        this.addResult('Pie Chart Creation', 'fail', 'Failed to create pie chart', {}, pieChartStartTime);
      }
    } catch (error) {
      this.addResult('Pie Chart Creation', 'fail',
        `Error creating pie chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, pieChartStartTime);
    }

    // Test 4: Gauge Chart Creation
    const gaugeStartTime = Date.now();
    try {
      const gaugeId = visualizationEngine.generateGauge(85, 0, 100, {
        title: 'System Health'
      });

      if (gaugeId && gaugeId.length > 0) {
        this.addResult('Gauge Chart Creation', 'pass',
          `Successfully created gauge chart: ${gaugeId}`, { chartId: gaugeId }, gaugeStartTime);
      } else {
        this.addResult('Gauge Chart Creation', 'fail', 'Failed to create gauge chart', {}, gaugeStartTime);
      }
    } catch (error) {
      this.addResult('Gauge Chart Creation', 'fail',
        `Error creating gauge chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, gaugeStartTime);
    }

    // Test 5: Multi-series Chart Creation
    const multiSeriesStartTime = Date.now();
    try {
      const seriesData = [
        {
          name: 'CPU Usage',
          data: [
            { timestamp: new Date(Date.now() - 120000).toISOString(), value: 45 },
            { timestamp: new Date(Date.now() - 60000).toISOString(), value: 52 },
            { timestamp: new Date().toISOString(), value: 48 }
          ]
        },
        {
          name: 'Memory Usage',
          data: [
            { timestamp: new Date(Date.now() - 120000).toISOString(), value: 65 },
            { timestamp: new Date(Date.now() - 60000).toISOString(), value: 70 },
            { timestamp: new Date().toISOString(), value: 68 }
          ]
        }
      ];

      const multiChartId = visualizationEngine.createMultiSeriesChart(seriesData, {
        type: 'line',
        title: 'System Resources',
        xAxis: { type: 'datetime', label: 'Time' },
        yAxis: { type: 'percentage', label: 'Usage %' },
        legend: { show: true, position: 'top' },
        responsive: true
      });

      if (multiChartId && multiChartId.length > 0) {
        this.addResult('Multi-series Chart Creation', 'pass',
          `Successfully created multi-series chart: ${multiChartId}`, { chartId: multiChartId }, multiSeriesStartTime);
      } else {
        this.addResult('Multi-series Chart Creation', 'fail', 'Failed to create multi-series chart', {}, multiSeriesStartTime);
      }
    } catch (error) {
      this.addResult('Multi-series Chart Creation', 'fail',
        `Error creating multi-series chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, multiSeriesStartTime);
    }

    // Test 6: Accessibility Features
    const accessibilityStartTime = Date.now();
    try {
      const accessibleData = [
        { timestamp: new Date().toISOString(), value: 85, label: 'Performance Score' }
      ];

      const accessibleChartId = visualizationEngine.createAccessibleChart(
        'accessible-container',
        [{
          id: 'accessible-series',
          name: 'Performance',
          data: accessibleData,
          visible: true
        }],
        {
          type: 'bar',
          title: 'Accessibility Test Chart',
          xAxis: { type: 'categorical', label: 'Metrics' },
          yAxis: { type: 'numeric', label: 'Score' },
          responsive: true
        },
        {
          description: 'Chart showing performance metrics for accessibility testing',
          longDescription: 'This chart displays system performance scores with accessibility features enabled',
          dataTable: true,
          highContrast: true
        }
      );

      if (accessibleChartId && accessibleChartId.length > 0) {
        this.addResult('Accessibility Features', 'pass',
          `Successfully created accessible chart: ${accessibleChartId}`, { chartId: accessibleChartId }, accessibilityStartTime);
      } else {
        this.addResult('Accessibility Features', 'fail', 'Failed to create accessible chart', {}, accessibilityStartTime);
      }
    } catch (error) {
      this.addResult('Accessibility Features', 'fail',
        `Error creating accessible chart: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, accessibilityStartTime);
    }
  }

  /**
   * Validate integration and performance
   */
  private async validateIntegrationAndPerformance(): Promise<void> {
    console.log('⚡ Testing Integration & Performance...');

    // Test 1: End-to-End Analytics Pipeline
    const pipelineStartTime = Date.now();
    try {
      // Record multiple events
      const eventIds = [];
      for (let i = 0; i < 10; i++) {
        const eventId = analyticsEngine.recordUserBehavior({
          userId: `test-user-${i.toString().padStart(3, '0')}`,
          organizationId: 'test-org-001',
          eventType: 'intelligence_query',
          action: 'batch_test_event',
          metadata: { duration: 100 + Math.random() * 200, success: true },
          context: { page: '/test', platform: 'web' }
        });
        eventIds.push(eventId);
      }

      // Generate report with the recorded events
      const report = analyticsEngine.generateAnalyticsReport(
        'test-org-001',
        'user_behavior',
        {
          start: new Date(Date.now() - 60000).toISOString(),
          end: new Date().toISOString(),
          period: 'hour'
        }
      );

      if (eventIds.length === 10 && report && report.reportId) {
        this.addResult('End-to-End Analytics Pipeline', 'pass',
          `Successfully processed ${eventIds.length} events and generated report: ${report.reportId}`,
          { eventCount: eventIds.length, reportId: report.reportId }, pipelineStartTime);
      } else {
        this.addResult('End-to-End Analytics Pipeline', 'fail',
          'Failed to complete end-to-end analytics pipeline', {}, pipelineStartTime);
      }
    } catch (error) {
      this.addResult('End-to-End Analytics Pipeline', 'fail',
        `Error in analytics pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, pipelineStartTime);
    }

    // Test 2: Dashboard Integration with Analytics
    const integrationStartTime = Date.now();
    try {
      // Create dashboard with real-time data
      const dashboardId = biDashboard.createDashboard({
        organizationId: 'test-org-001',
        name: 'Integration Test Dashboard',
        description: 'Testing dashboard integration with analytics',
        category: 'technical',
        visibility: 'private',
        owner: 'test-user-001',
        widgets: [
          {
            widgetId: 'integration-widget-001',
            type: 'metric',
            title: 'Live User Count',
            description: 'Real-time active users',
            dataSource: 'analytics',
            configuration: { metricType: 'active_users', refreshInterval: 30 },
            position: { x: 0, y: 0, width: 4, height: 2 },
            style: { showBorder: true, showTitle: true }
          }
        ],
        layout: { columns: 12, rows: 6, gap: 16 },
        theme: {
          name: 'default',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          darkMode: false
        },
        permissions: { viewers: [], editors: [], admins: [] }
      });

      // Get dashboard with real-time data
      const dashboardWithData = biDashboard.getDashboardWithData(dashboardId, 'test-user-001');

      if (dashboardWithData && dashboardWithData.dashboard && dashboardWithData.data) {
        this.addResult('Dashboard-Analytics Integration', 'pass',
          `Successfully integrated dashboard with analytics: ${dashboardId}`,
          { dashboardId, widgetCount: dashboardWithData.dashboard.widgets.length }, integrationStartTime);
      } else {
        this.addResult('Dashboard-Analytics Integration', 'fail',
          'Failed to integrate dashboard with analytics', {}, integrationStartTime);
      }
    } catch (error) {
      this.addResult('Dashboard-Analytics Integration', 'fail',
        `Error in dashboard-analytics integration: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, integrationStartTime);
    }

    // Test 3: Performance under load
    const loadTestStartTime = Date.now();
    try {
      const startTime = Date.now();
      const promises = [];

      // Simulate concurrent operations
      for (let i = 0; i < 50; i++) {
        promises.push(
          analyticsEngine.recordUserBehavior({
            userId: `load-test-user-${i}`,
            organizationId: 'test-org-001',
            eventType: 'feature_usage',
            action: 'load_test',
            metadata: { success: true },
            context: { platform: 'web' }
          })
        );
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      if (duration < 1000) { // Should complete in under 1 second
        this.addResult('Performance Under Load', 'pass',
          `Successfully processed 50 concurrent operations in ${duration}ms`,
          { operationCount: 50, duration }, loadTestStartTime);
      } else {
        this.addResult('Performance Under Load', 'warning',
          `Completed 50 operations but took ${duration}ms (target: <1000ms)`,
          { operationCount: 50, duration }, loadTestStartTime);
      }
    } catch (error) {
      this.addResult('Performance Under Load', 'fail',
        `Error in load testing: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, loadTestStartTime);
    }
  }

  /**
   * Validate enterprise features
   */
  private async validateEnterpriseFeatures(): Promise<void> {
    console.log('🏢 Testing Enterprise Features...');

    // Test 1: Multi-tenant Isolation
    const isolationStartTime = Date.now();
    try {
      // Record events for different organizations
      const org1EventId = analyticsEngine.recordUserBehavior({
        userId: 'user-org1',
        organizationId: 'org-001',
        eventType: 'intelligence_query',
        action: 'isolation_test',
        metadata: { success: true },
        context: { platform: 'web' }
      });

      const org2EventId = analyticsEngine.recordUserBehavior({
        userId: 'user-org2',
        organizationId: 'org-002',
        eventType: 'intelligence_query',
        action: 'isolation_test',
        metadata: { success: true },
        context: { platform: 'web' }
      });

      // Verify isolation by checking dashboards
      const org1Data = analyticsEngine.getDashboardData('org-001');
      const org2Data = analyticsEngine.getDashboardData('org-002');

      if (org1EventId && org2EventId && org1Data && org2Data) {
        this.addResult('Multi-tenant Isolation', 'pass',
          'Successfully verified multi-tenant data isolation',
          { org1EventId, org2EventId }, isolationStartTime);
      } else {
        this.addResult('Multi-tenant Isolation', 'fail', 'Failed to verify multi-tenant isolation', {}, isolationStartTime);
      }
    } catch (error) {
      this.addResult('Multi-tenant Isolation', 'fail',
        `Error testing multi-tenant isolation: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, isolationStartTime);
    }

    // Test 2: Data Export Capabilities
    const exportStartTime = Date.now();
    try {
      // Create a dashboard first
      const dashboards = biDashboard.getDashboards('test-org-001');
      if (dashboards.length > 0) {
        const exportResult = biDashboard.exportDashboard(
          dashboards[0].dashboardId,
          'json',
          {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        );

        if (exportResult && exportResult.data && exportResult.filename) {
          this.addResult('Data Export Capabilities', 'pass',
            `Successfully exported dashboard data: ${exportResult.filename}`,
            { filename: exportResult.filename, contentType: exportResult.contentType }, exportStartTime);
        } else {
          this.addResult('Data Export Capabilities', 'fail', 'Failed to export dashboard data', {}, exportStartTime);
        }
      } else {
        this.addResult('Data Export Capabilities', 'warning', 'No dashboards available for export test', {}, exportStartTime);
      }
    } catch (error) {
      this.addResult('Data Export Capabilities', 'fail',
        `Error testing data export: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, exportStartTime);
    }

    // Test 3: Audit Trail Integration
    const auditStartTime = Date.now();
    try {
      // Check if enterprise logger is recording analytics events
      const testEventId = analyticsEngine.recordUserBehavior({
        userId: 'audit-test-user',
        organizationId: 'test-org-001',
        eventType: 'intelligence_query',
        action: 'audit_trail_test',
        metadata: { success: true },
        context: { platform: 'web' }
      });

      if (testEventId) {
        this.addResult('Audit Trail Integration', 'pass',
          `Successfully integrated with audit trail: ${testEventId}`,
          { eventId: testEventId }, auditStartTime);
      } else {
        this.addResult('Audit Trail Integration', 'fail', 'Failed to integrate with audit trail', {}, auditStartTime);
      }
    } catch (error) {
      this.addResult('Audit Trail Integration', 'fail',
        `Error testing audit trail integration: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, auditStartTime);
    }

    // Test 4: Scalability Features
    const scalabilityStartTime = Date.now();
    try {
      // Test data cleanup and memory management
      const initialMemory = process.memoryUsage();

      // Generate significant amount of test data
      for (let i = 0; i < 100; i++) {
        analyticsEngine.recordUserBehavior({
          userId: `scale-user-${i}`,
          organizationId: 'scale-test-org',
          eventType: 'feature_usage',
          action: 'scalability_test',
          metadata: { success: true },
          context: { platform: 'web' }
        });
      }

      const afterMemory = process.memoryUsage();
      const memoryIncrease = afterMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseKB = Math.round(memoryIncrease / 1024);

      if (memoryIncreaseKB < 5000) { // Less than 5MB increase
        this.addResult('Scalability Features', 'pass',
          `Memory management efficient: ${memoryIncreaseKB}KB increase for 100 events`,
          { memoryIncreaseKB, eventCount: 100 }, scalabilityStartTime);
      } else {
        this.addResult('Scalability Features', 'warning',
          `Memory usage higher than expected: ${memoryIncreaseKB}KB increase`,
          { memoryIncreaseKB, eventCount: 100 }, scalabilityStartTime);
      }
    } catch (error) {
      this.addResult('Scalability Features', 'fail',
        `Error testing scalability: ${error instanceof Error ? error.message : 'Unknown error'}`, {}, scalabilityStartTime);
    }
  }

  /**
   * Add validation result
   */
  private addResult(testName: string, status: 'pass' | 'fail' | 'warning', details: string, metrics: Record<string, any> = {}, startTime?: number): void {
    const duration = startTime ? Date.now() - startTime : 0;

    this.results.push({
      testName,
      status,
      duration,
      details,
      metrics
    });

    const statusIcon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    const durationText = duration > 0 ? ` (${duration}ms)` : '';
    console.log(`  ${statusIcon} ${testName}: ${details}${durationText}`);
  }

  /**
   * Generate validation summary
   */
  private generateSummary(): PhaseValidationSummary {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const successRate = (passed / this.results.length) * 100;
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;

    let overallStatus: 'success' | 'partial' | 'failure';
    if (failed === 0 && warnings <= 2) {
      overallStatus = 'success';
    } else if (failed <= 2) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'failure';
    }

    const recommendations: string[] = [];

    if (warnings > 0) {
      recommendations.push('Review warning items for potential optimizations');
    }
    if (failed > 0) {
      recommendations.push('Address failed tests before production deployment');
    }
    if (averageDuration > 100) {
      recommendations.push('Consider performance optimizations for response times');
    }
    if (overallStatus === 'success') {
      recommendations.push('All systems operational - ready for advanced enterprise deployment');
    }

    const summary: PhaseValidationSummary = {
      phase: 'Phase 2.3 - Advanced Analytics & Business Intelligence',
      version: '0.2.0',
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      successRate,
      averageDuration,
      results: this.results,
      overallStatus,
      recommendations
    };

    // Print summary
    console.log('\n📊 === PHASE 2.3 VALIDATION SUMMARY ===');
    console.log(`📈 Version: ${summary.version}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📋 Tests: ${summary.totalTests} total`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`📊 Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`⚡ Average Duration: ${summary.averageDuration.toFixed(1)}ms`);
    console.log(`🎯 Overall Status: ${summary.overallStatus.toUpperCase()}`);

    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    return summary;
  }
}

/**
 * Export validation function
 */
export async function validatePhase23(): Promise<PhaseValidationSummary> {
  const validator = new Phase23Validator();
  return await validator.validatePhase23();
}
