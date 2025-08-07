/**
 * PerformanceAnalyticsDashboard Component
 * Real-time performance monitoring and analytics dashboard
 * 
 * Features:
 * - Real-time performance metrics visualization
 * - System resource monitoring
 * - Performance bottleneck identification
 * - Alert management and notifications
 * - Performance trend analysis
 * - Historical data analysis
 * - Automated recommendations
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Zap, AlertTriangle, Activity, Settings, RefreshCw, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#8b5cf6',
  info: '#06b6d4'
};

// Type definitions
interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  requestCount: number;
  errorRate: number;
  throughput: number;
  latencyPercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

interface SystemResourceMetrics {
  cpuPercent: number;
  memoryPercent: number;
  diskUsage: {
    used: number;
    total: number;
    percent: number;
  };
  networkTraffic: {
    bytesIn: number;
    bytesOut: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: string;
  resolved: boolean;
  recommendations: string[];
}

interface PerformanceBottleneck {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  estimatedImprovementPercent: number;
}

interface PerformanceTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  confidence: number;
  prediction: string;
}

interface PerformanceData {
  overview: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    totalRequests: number;
    avgResponseTime: number;
    currentThroughput: number;
  };
  realTimeMetrics: PerformanceMetrics;
  systemResources: SystemResourceMetrics;
  status: {
    isMonitoring: boolean;
    startTime: string;
    lastUpdate: string;
    metricsCount: number;
  };
  historicalData?: Array<{
    timestamp: string;
    metrics: PerformanceMetrics;
    systemResources: SystemResourceMetrics;
  }>;
  bottlenecks?: PerformanceBottleneck[];
  trends?: PerformanceTrend[];
  alerts?: PerformanceAlert[];
  recommendations?: string[];
}

// Performance Metrics Card Component
const MetricsCard: React.FC<{ title: string; value: string | number; trend?: 'up' | 'down' | 'stable'; color?: string; icon?: React.ReactNode }> = ({
  title,
  value,
  trend,
  color = COLORS.primary,
  icon
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            {getTrendIcon()}
          </div>
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Alert Component
const AlertCard: React.FC<{ alert: PerformanceAlert; onResolve: (id: string) => void }> = ({ alert, onResolve }) => {
  const getAlertColor = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card className={`border-l-4 ${getAlertColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getAlertIcon()}
            <div>
              <h4 className="font-semibold">{alert.message}</h4>
              <p className="text-sm text-gray-600">
                {alert.metric}: {alert.currentValue} (threshold: {alert.threshold})
              </p>
              <p className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
              {alert.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Recommendations:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {alert.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {!alert.resolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(alert.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Bottleneck Component
const BottleneckCard: React.FC<{ bottleneck: PerformanceBottleneck }> = ({ bottleneck }) => {
  const getSeverityColor = () => {
    switch (bottleneck.severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{bottleneck.type}</h4>
              <Badge variant={getSeverityColor()}>{bottleneck.severity}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{bottleneck.description}</p>
            <p className="text-sm text-gray-800 mb-2"><strong>Impact:</strong> {bottleneck.impact}</p>
            <p className="text-sm text-gray-800 mb-2"><strong>Recommendation:</strong> {bottleneck.recommendation}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              +{bottleneck.estimatedImprovementPercent}%
            </p>
            <p className="text-xs text-gray-500">potential improvement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Performance Analytics Dashboard Component
const PerformanceAnalyticsDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [includeHistorical, setIncludeHistorical] = useState(true);
  const [includeBottlenecks, setIncludeBottlenecks] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        includeHistorical: includeHistorical.toString(),
        includeBottlenecks: includeBottlenecks.toString(),
        includeTrends: includeTrends.toString(),
        includeAlerts: includeAlerts.toString(),
        timeRange: '24h'
      });

      const response = await fetch(`/api/analytics/performance?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch performance data');
      }

      setPerformanceData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [includeHistorical, includeBottlenecks, includeTrends, includeAlerts]);

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/analytics/performance/alerts/${alertId}/resolve`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Refresh data to update alert status
        fetchPerformanceData();
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  // Clean up old data
  const cleanupData = async () => {
    try {
      const response = await fetch('/api/analytics/performance/cleanup', {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPerformanceData();
      }
    } catch (err) {
      console.error('Error cleaning up data:', err);
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(fetchPerformanceData, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, fetchPerformanceData]);

  // Initial data fetch
  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Performance Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPerformanceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data Available</h3>
            <p className="text-gray-600">Performance monitoring may not be enabled.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, realTimeMetrics, systemResources, status, historicalData, bottlenecks, trends, alerts, recommendations } = performanceData;

  // Format historical data for charts
  const chartData = historicalData?.slice(-50).map((item, index) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    responseTime: item.metrics.responseTime,
    cpuUsage: item.systemResources.cpuPercent,
    memoryUsage: item.systemResources.memoryPercent,
    throughput: item.metrics.throughput,
    errorRate: item.metrics.errorRate * 100
  })) || [];

  // Get status color
  const getStatusColor = () => {
    switch (overview.status) {
      case 'healthy':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'critical':
        return COLORS.danger;
      default:
        return COLORS.secondary;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-gray-600">Real-time monitoring and performance insights</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>

          <Button variant="outline" onClick={fetchPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" onClick={cleanupData}>
            <Settings className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricsCard
          title="Status"
          value={overview.status.toUpperCase()}
          color={getStatusColor()}
          icon={<Activity className="h-6 w-6" />}
        />

        <MetricsCard
          title="Uptime"
          value={`${Math.floor(overview.uptime / 1000 / 60 / 60)}h`}
          icon={<Clock className="h-6 w-6" />}
        />

        <MetricsCard
          title="Response Time"
          value={`${overview.avgResponseTime}ms`}
          trend={trends?.find(t => t.metric === 'responseTime')?.direction}
          icon={<Zap className="h-6 w-6" />}
        />

        <MetricsCard
          title="Throughput"
          value={`${overview.currentThroughput}/s`}
          trend={trends?.find(t => t.metric === 'throughput')?.direction}
          icon={<TrendingUp className="h-6 w-6" />}
        />

        <MetricsCard
          title="Total Requests"
          value={overview.totalRequests.toLocaleString()}
          icon={<Activity className="h-6 w-6" />}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Performance</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>{realTimeMetrics.responseTime}ms</span>
                  </div>
                  <Progress value={Math.min(realTimeMetrics.responseTime / 10, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{realTimeMetrics.cpuUsage}%</span>
                  </div>
                  <Progress value={realTimeMetrics.cpuUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{realTimeMetrics.memoryUsage}%</span>
                  </div>
                  <Progress value={realTimeMetrics.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{(realTimeMetrics.errorRate * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={realTimeMetrics.errorRate * 100} />
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>{systemResources.cpuPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemResources.cpuPercent} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span>{systemResources.memoryPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemResources.memoryPercent} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk</span>
                    <span>{systemResources.diskUsage.percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemResources.diskUsage.percent} />
                </div>

                <div className="text-sm text-gray-600">
                  <p>Network: ↓{(systemResources.networkTraffic.bytesIn / 1024 / 1024).toFixed(2)}MB ↑{(systemResources.networkTraffic.bytesOut / 1024 / 1024).toFixed(2)}MB</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>AI-generated suggestions to improve performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Historical response time performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Throughput Analysis</CardTitle>
                  <CardDescription>Request throughput over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="throughput"
                        stroke={COLORS.success}
                        fill={COLORS.success}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Latency Percentiles */}
          <Card>
            <CardHeader>
              <CardTitle>Latency Percentiles</CardTitle>
              <CardDescription>Current latency distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.latencyPercentiles.p50}ms</p>
                  <p className="text-sm text-gray-600">50th percentile</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{realTimeMetrics.latencyPercentiles.p90}ms</p>
                  <p className="text-sm text-gray-600">90th percentile</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{realTimeMetrics.latencyPercentiles.p95}ms</p>
                  <p className="text-sm text-gray-600">95th percentile</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{realTimeMetrics.latencyPercentiles.p99}ms</p>
                  <p className="text-sm text-gray-600">99th percentile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPU & Memory Usage</CardTitle>
                  <CardDescription>System resource utilization over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cpuUsage"
                        stroke={COLORS.warning}
                        strokeWidth={2}
                        name="CPU Usage (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="memoryUsage"
                        stroke={COLORS.secondary}
                        strokeWidth={2}
                        name="Memory Usage (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Tracking</CardTitle>
                  <CardDescription>Error rate percentage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="errorRate"
                        stroke={COLORS.danger}
                        fill={COLORS.danger}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Bottlenecks Tab */}
        <TabsContent value="bottlenecks" className="space-y-6">
          {bottlenecks && bottlenecks.length > 0 ? (
            <div className="space-y-4">
              {bottlenecks.map((bottleneck) => (
                <BottleneckCard key={bottleneck.id} bottleneck={bottleneck} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No performance bottlenecks detected</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onResolve={resolveAlert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No active performance alerts</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {trends && trends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trends.map((trend, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{trend.metric}</h4>
                      {trend.direction === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      ) : trend.direction === 'down' ? (
                        <TrendingDown className="h-5 w-5 text-green-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Confidence: {(trend.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm">{trend.prediction}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No trend data available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Settings</CardTitle>
          <CardDescription>Configure performance monitoring preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeHistorical}
                onCheckedChange={setIncludeHistorical}
              />
              <span className="text-sm">Historical Data</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={includeBottlenecks}
                onCheckedChange={setIncludeBottlenecks}
              />
              <span className="text-sm">Bottleneck Analysis</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={includeTrends}
                onCheckedChange={setIncludeTrends}
              />
              <span className="text-sm">Trend Analysis</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={includeAlerts}
                onCheckedChange={setIncludeAlerts}
              />
              <span className="text-sm">Performance Alerts</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">
              Auto-refresh Interval: {refreshInterval} seconds
            </label>
            <Slider
              value={[refreshInterval]}
              onValueChange={(value) => setRefreshInterval(value[0])}
              max={300}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              Monitoring Status: {status.isMonitoring ? 'Active' : 'Inactive'}
            </p>
            {status.isMonitoring && (
              <Badge variant="default">
                {status.metricsCount} metrics collected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalyticsDashboard;
