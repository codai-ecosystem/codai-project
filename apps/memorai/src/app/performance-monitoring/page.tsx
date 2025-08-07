import React from 'react'
/**
 * Advanced Performance Monitoring
 * 
 * Real-time performance monitoring dashboard with live metrics
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { useNotificationContext } from '@/components/notifications';
import { PerformanceChart, PerformanceGauge, PerformanceTrend } from '@/components/performance-charts';

interface RealTimeMetrics {
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    current: number;
    average: number;
    peak: number;
  };
  memory: {
    used: number;
    total: number;
    heap: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  errors: {
    rate: number;
    count: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface TrendData {
  timestamp: number;
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  errorRate: number;
}

export default function AdvancedPerformanceMonitoringPage() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState(5); // seconds
  const [alerts, setAlerts] = useState<Array<{ id: string; type: string; message: string; timestamp: number }>>([]);
  const notifications = useNotificationContext();

  // Performance thresholds
  const thresholds = {
    responseTime: { good: 200, warning: 500, critical: 1000 },
    throughput: { good: 10, warning: 5, critical: 1 },
    memoryUsage: { good: 50, warning: 75, critical: 90 }, // percentage
    errorRate: { good: 1, warning: 5, critical: 10 }, // percentage
  };

  // Fetch real-time metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/performance');

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const { performance, system, cache } = data.data;

        const newMetrics: RealTimeMetrics = {
          responseTime: {
            current: performance.averageResponseTime || 0,
            average: performance.averageResponseTime || 0,
            p95: performance.p95ResponseTime || 0,
            p99: performance.p99ResponseTime || 0,
          },
          throughput: {
            current: performance.throughput || 0,
            average: performance.throughput || 0,
            peak: performance.throughput || 0,
          },
          memory: {
            used: system.memoryUsage.rss / 1024 / 1024, // MB
            total: system.memoryUsage.heapTotal / 1024 / 1024, // MB
            heap: system.memoryUsage.heapUsed / 1024 / 1024, // MB
          },
          cpu: {
            user: system.cpuUsage.user || 0,
            system: system.cpuUsage.system || 0,
          },
          errors: {
            rate: performance.errorRate || 0,
            count: performance.totalRequests - (performance.totalRequests * (1 - (performance.errorRate || 0) / 100)),
          },
          requests: {
            total: performance.totalRequests || 0,
            successful: performance.totalRequests - (performance.totalRequests * (performance.errorRate || 0) / 100) || 0,
            failed: performance.totalRequests * (performance.errorRate || 0) / 100 || 0,
          }
        };

        setMetrics(newMetrics);

        // Add to trend data
        const trendPoint: TrendData = {
          timestamp: Date.now(),
          responseTime: newMetrics.responseTime.current,
          throughput: newMetrics.throughput.current,
          memoryUsage: (newMetrics.memory.used / newMetrics.memory.total) * 100,
          errorRate: newMetrics.errors.rate,
        };

        setTrendData(prev => {
          const updated = [...prev, trendPoint];
          // Keep only last 50 data points
          return updated.slice(-50);
        });

        // Check for alerts
        checkForAlerts(newMetrics);

      } else {
        throw new Error(data.error?.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);

      if (isMonitoring) {
        notifications.error('Failed to fetch performance metrics');
      }
    }
  }, [isMonitoring, notifications]);

  // Check for performance alerts
  const checkForAlerts = useCallback((metrics: RealTimeMetrics) => {
    const newAlerts: Array<{ id: string; type: string; message: string; timestamp: number }> = [];
    const now = Date.now();

    // Response time alerts
    if (metrics.responseTime.current > thresholds.responseTime.critical) {
      newAlerts.push({
        id: `rt-critical-${now}`,
        type: 'critical',
        message: `Critical response time: ${Math.round(metrics.responseTime.current)}ms`,
        timestamp: now,
      });
    } else if (metrics.responseTime.current > thresholds.responseTime.warning) {
      newAlerts.push({
        id: `rt-warning-${now}`,
        type: 'warning',
        message: `High response time: ${Math.round(metrics.responseTime.current)}ms`,
        timestamp: now,
      });
    }

    // Throughput alerts
    if (metrics.throughput.current < thresholds.throughput.critical) {
      newAlerts.push({
        id: `tp-critical-${now}`,
        type: 'critical',
        message: `Critical low throughput: ${Math.round(metrics.throughput.current)} req/s`,
        timestamp: now,
      });
    } else if (metrics.throughput.current < thresholds.throughput.warning) {
      newAlerts.push({
        id: `tp-warning-${now}`,
        type: 'warning',
        message: `Low throughput: ${Math.round(metrics.throughput.current)} req/s`,
        timestamp: now,
      });
    }

    // Memory alerts
    const memoryPercentage = (metrics.memory.used / metrics.memory.total) * 100;
    if (memoryPercentage > thresholds.memoryUsage.critical) {
      newAlerts.push({
        id: `mem-critical-${now}`,
        type: 'critical',
        message: `Critical memory usage: ${Math.round(memoryPercentage)}%`,
        timestamp: now,
      });
    } else if (memoryPercentage > thresholds.memoryUsage.warning) {
      newAlerts.push({
        id: `mem-warning-${now}`,
        type: 'warning',
        message: `High memory usage: ${Math.round(memoryPercentage)}%`,
        timestamp: now,
      });
    }

    // Error rate alerts
    if (metrics.errors.rate > thresholds.errorRate.critical) {
      newAlerts.push({
        id: `err-critical-${now}`,
        type: 'critical',
        message: `Critical error rate: ${Math.round(metrics.errors.rate * 100) / 100}%`,
        timestamp: now,
      });
    } else if (metrics.errors.rate > thresholds.errorRate.warning) {
      newAlerts.push({
        id: `err-warning-${now}`,
        type: 'warning',
        message: `High error rate: ${Math.round(metrics.errors.rate * 100) / 100}%`,
        timestamp: now,
      });
    }

    // Add new alerts and show notifications
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev.slice(-10), ...newAlerts]); // Keep last 10 alerts

      newAlerts.forEach(alert => {
        if (alert.type === 'critical') {
          notifications.error(alert.message);
        } else {
          notifications.warning(alert.message);
        }
      });
    }
  }, [notifications, thresholds]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => {
      const newState = !prev;

      if (newState) {
        notifications.success(`Started performance monitoring (${monitoringInterval}s intervals)`);
      } else {
        notifications.info('Stopped performance monitoring');
      }

      return newState;
    });
  }, [monitoringInterval, notifications]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    notifications.info('Alerts cleared');
  }, [notifications]);

  // Reset metrics
  const resetMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/performance?action=reset-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setTrendData([]);
        setAlerts([]);
        notifications.success('Performance metrics reset');
      } else {
        throw new Error('Failed to reset metrics');
      }
    } catch (error) {
      notifications.error('Failed to reset metrics');
    }
  }, [notifications]);

  // Monitoring effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isMonitoring) {
      // Fetch immediately
      fetchMetrics();

      // Set up interval
      interval = setInterval(fetchMetrics, monitoringInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring, monitoringInterval, fetchMetrics]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Monitoring</h1>
          <p className="text-gray-600 mb-6">
            Real-time performance monitoring with alerts and trend analysis
          </p>

          {/* Control Panel */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={toggleMonitoring}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isMonitoring
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {isMonitoring ? '🛑 Stop Monitoring' : '🚀 Start Monitoring'}
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Interval:</label>
              <select
                value={monitoringInterval}
                onChange={(e) => setMonitoringInterval(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                disabled={isMonitoring}
              >
                <option value={1}>1s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
              </select>
            </div>

            <button
              onClick={clearAlerts}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              🧹 Clear Alerts
            </button>

            <button
              onClick={resetMetrics}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Reset Metrics
            </button>
          </div>
        </div>

        {/* Current Status */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PerformanceGauge
              value={metrics.responseTime.current}
              max={thresholds.responseTime.critical}
              label="Response Time"
              unit="ms"
              thresholds={{
                good: thresholds.responseTime.good,
                warning: thresholds.responseTime.warning,
              }}
            />

            <PerformanceGauge
              value={metrics.throughput.current}
              max={50}
              label="Throughput"
              unit="req/s"
              thresholds={{
                good: thresholds.throughput.good,
                warning: thresholds.throughput.warning,
              }}
            />

            <PerformanceGauge
              value={(metrics.memory.used / metrics.memory.total) * 100}
              max={100}
              label="Memory Usage"
              unit="%"
              thresholds={{
                good: thresholds.memoryUsage.good,
                warning: thresholds.memoryUsage.warning,
              }}
            />

            <PerformanceGauge
              value={metrics.errors.rate}
              max={20}
              label="Error Rate"
              unit="%"
              thresholds={{
                good: thresholds.errorRate.good,
                warning: thresholds.errorRate.warning,
              }}
            />
          </div>
        )}

        {/* Trend Charts */}
        {trendData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceTrend
              data={trendData.map(d => ({ timestamp: d.timestamp, value: d.responseTime }))}
              title="Response Time Trend"
              color="#3B82F6"
              height={200}
            />

            <PerformanceTrend
              data={trendData.map(d => ({ timestamp: d.timestamp, value: d.throughput }))}
              title="Throughput Trend"
              color="#10B981"
              height={200}
            />

            <PerformanceTrend
              data={trendData.map(d => ({ timestamp: d.timestamp, value: d.memoryUsage }))}
              title="Memory Usage Trend"
              color="#F59E0B"
              height={200}
            />

            <PerformanceTrend
              data={trendData.map(d => ({ timestamp: d.timestamp, value: d.errorRate }))}
              title="Error Rate Trend"
              color="#EF4444"
              height={200}
            />
          </div>
        )}

        {/* Performance Summary */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.responseTime.average)}ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-xs text-gray-500 mt-1">
                  P95: {Math.round(metrics.responseTime.p95)}ms | P99: {Math.round(metrics.responseTime.p99)}ms
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(metrics.throughput.current)}</div>
                <div className="text-sm text-gray-600">Current Throughput</div>
                <div className="text-xs text-gray-500 mt-1">requests per second</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.memory.used)}MB</div>
                <div className="text-sm text-gray-600">Memory Used</div>
                <div className="text-xs text-gray-500 mt-1">
                  Heap: {Math.round(metrics.memory.heap)}MB
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{metrics.requests.total}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-xs text-gray-500 mt-1">
                  Success: {Math.round(metrics.requests.successful)} | Failed: {Math.round(metrics.requests.failed)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.slice().reverse().map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${alert.type === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`font-semibold ${alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                        {alert.type === 'critical' ? '🚨' : '⚠️'} {alert.message}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data message */}
        {!metrics && !isMonitoring && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Performance Data</h3>
            <p className="text-gray-500 mb-4">
              Start monitoring to see real-time performance metrics and trends
            </p>
            <button
              onClick={toggleMonitoring}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              🚀 Start Monitoring
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

