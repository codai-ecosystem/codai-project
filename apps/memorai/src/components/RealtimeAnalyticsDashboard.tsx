/**
 * RealtimeAnalyticsDashboard Component
 * Live streaming analytics dashboard with WebSocket integration
 * 
 * Features:
 * - Real-time data streaming with auto-refresh
 * - Live performance metrics visualization
 * - Real-time alert notifications
 * - Connection status monitoring
 * - Interactive charts with live updates
 * - Multi-tab interface with live indicators
 * - WebSocket subscription management
 * - Live system resource monitoring
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Wifi, WifiOff, Clock, Bell, BellRing, Activity, Zap, TrendingUp, TrendingDown, RefreshCw, Settings, Users, Database, Network } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useRealtimeAnalytics, type UseRealtimeAnalyticsReturn, type ConnectionState } from '../hooks/useRealtimeAnalytics';

// Color palette for real-time visualization
const REALTIME_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  live: '#ec4899',
  connected: '#10b981',
  disconnected: '#ef4444'
};

// Connection status indicator component
const ConnectionStatus: React.FC<{
  connectionState: ConnectionState;
  clientId: string | null;
  reconnectAttempts: number;
  onConnect: () => void;
  onDisconnect: () => void;
}> = ({ connectionState, clientId, reconnectAttempts, onConnect, onDisconnect }) => {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4" />;
      case 'connecting':
      case 'reconnecting':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return `Connected${clientId ? ` (${clientId.substring(0, 8)}...)` : ''}`;
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return `Reconnecting... (${reconnectAttempts}/10)`;
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </span>

      {connectionState === 'connected' && (
        <Button size="sm" variant="outline" onClick={onDisconnect}>
          Disconnect
        </Button>
      )}

      {(connectionState === 'disconnected' || connectionState === 'error') && (
        <Button size="sm" variant="outline" onClick={onConnect}>
          Connect
        </Button>
      )}
    </div>
  );
};

// Real-time metrics card component
const RealtimeMetricsCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: React.ReactNode;
  isLive?: boolean;
}> = ({
  title,
  value,
  unit = '',
  trend,
  color = REALTIME_COLORS.primary,
  icon,
  isLive = false
}) => {
    const getTrendIcon = () => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="h-3 w-3 text-red-500" />;
        case 'down':
          return <TrendingDown className="h-3 w-3 text-green-500" />;
        default:
          return null;
      }
    };

    return (
      <Card className={`transition-all duration-300 ${isLive ? 'ring-2 ring-pink-200 animate-pulse' : ''}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {isLive && <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold" style={{ color }}>
                {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 1) : value}{unit}
              </p>
              {getTrendIcon()}
            </div>
          </div>
          {icon && (
            <div className="text-gray-400 ml-3">
              {icon}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

// Live alert component
const LiveAlert: React.FC<{
  alert: any;
  onResolve: (id: string) => void;
  isNew?: boolean;
}> = ({ alert, onResolve, isNew = false }) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className={`border-l-4 ${getAlertColor()} ${isNew ? 'animate-pulse ring-2 ring-pink-200' : ''} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getAlertIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{alert.title}</h4>
                {isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
              </div>
              <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
              <p className="text-xs text-gray-500">
                {alert.source} • {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
              {alert.recommendations && alert.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">Recommendations:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside">
                    {alert.recommendations.slice(0, 2).map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(alert.id)}
            className="ml-2"
          >
            Resolve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main real-time analytics dashboard component
const RealtimeAnalyticsDashboard: React.FC = () => {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [chartTimeRange, setChartTimeRange] = useState(50); // Number of data points to show
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());

  // Use real-time analytics hook
  const realtime = useRealtimeAnalytics({
    agentId: 'github-copilot',
    autoConnect: true,
    subscriptions: ['performance', 'memory', 'alerts', 'system']
  });

  // Track new alerts for animation
  useEffect(() => {
    const currentAlertIds = new Set(realtime.state.alerts.map(a => a.id));
    const previousAlertIds = newAlertIds;

    // Find truly new alerts (not just state updates)
    const newIds = new Set<string>();
    currentAlertIds.forEach(id => {
      if (!previousAlertIds.has(id)) {
        newIds.add(id);
      }
    });

    if (newIds.size > 0) {
      setNewAlertIds(currentAlertIds);

      // Clear "new" status after 5 seconds
      setTimeout(() => {
        setNewAlertIds(new Set());
      }, 5000);
    }
  }, [realtime.state.alerts, newAlertIds]);

  // Generate chart data from real-time performance data
  const generateChartData = () => {
    if (!realtime.state.performanceData) return [];

    // In a real implementation, you'd maintain a history of data points
    // For this demo, we'll generate sample historical data
    const currentData = realtime.state.performanceData;
    const chartData = [];

    for (let i = chartTimeRange - 1; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 5000); // 5-second intervals
      const variation = Math.sin(i / 10) * 20 + Math.random() * 10;

      chartData.push({
        time: timestamp.toLocaleTimeString(),
        timestamp: timestamp.getTime(),
        responseTime: i === 0 ? currentData.metrics.responseTime :
          Math.max(50, currentData.metrics.responseTime + variation),
        cpuUsage: i === 0 ? currentData.metrics.cpuUsage :
          Math.max(10, currentData.metrics.cpuUsage + variation * 0.5),
        memoryUsage: i === 0 ? currentData.metrics.memoryUsage :
          Math.max(20, currentData.metrics.memoryUsage + variation * 0.8),
        throughput: i === 0 ? currentData.metrics.throughput :
          Math.max(5, currentData.metrics.throughput + variation * 0.3)
      });
    }

    return chartData;
  };

  const chartData = generateChartData();
  const { state: realtimeState, isConnected } = realtime;

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Real-time Analytics
            {isConnected && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
          </h2>
          <p className="text-gray-600">Live streaming analytics dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus
            connectionState={realtimeState.connectionState}
            clientId={realtimeState.clientId}
            reconnectAttempts={realtimeState.reconnectAttempts}
            onConnect={realtime.connect}
            onDisconnect={realtime.disconnect}
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={isLiveMode}
              onCheckedChange={setIsLiveMode}
            />
            <span className="text-sm">Live Mode</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={showNotifications}
              onCheckedChange={setShowNotifications}
            />
            <span className="text-sm">Notifications</span>
          </div>
        </div>
      </div>

      {/* Connection Error Notice */}
      {realtimeState.connectionState === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Connection Error</p>
                <p className="text-sm text-red-600">{realtimeState.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Metrics Overview */}
      {realtimeState.performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RealtimeMetricsCard
            title="Response Time"
            value={realtimeState.performanceData.metrics.responseTime}
            unit="ms"
            icon={<Zap className="h-6 w-6" />}
            isLive={isLiveMode && isConnected}
          />

          <RealtimeMetricsCard
            title="CPU Usage"
            value={realtimeState.performanceData.metrics.cpuUsage}
            unit="%"
            color={realtimeState.performanceData.metrics.cpuUsage > 80 ? REALTIME_COLORS.danger : REALTIME_COLORS.success}
            icon={<Activity className="h-6 w-6" />}
            isLive={isLiveMode && isConnected}
          />

          <RealtimeMetricsCard
            title="Memory Usage"
            value={realtimeState.performanceData.metrics.memoryUsage}
            unit="%"
            color={realtimeState.performanceData.metrics.memoryUsage > 85 ? REALTIME_COLORS.danger : REALTIME_COLORS.warning}
            icon={<Database className="h-6 w-6" />}
            isLive={isLiveMode && isConnected}
          />

          <RealtimeMetricsCard
            title="Throughput"
            value={realtimeState.performanceData.metrics.throughput}
            unit="/sec"
            icon={<TrendingUp className="h-6 w-6" />}
            isLive={isLiveMode && isConnected}
          />
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="live-performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-performance" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Performance
            {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </TabsTrigger>
          <TabsTrigger value="memory-analytics" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Memory Analytics
          </TabsTrigger>
          <TabsTrigger value="live-alerts" className="flex items-center gap-2">
            {realtimeState.alerts.length > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            Live Alerts
            {realtimeState.alerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {realtimeState.alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="connection-info" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Connection Info
          </TabsTrigger>
        </TabsList>

        {/* Live Performance Tab */}
        <TabsContent value="live-performance" className="space-y-6">
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Response Time Trends
                    {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </CardTitle>
                  <CardDescription>Live response time monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: any, name: string) => [`${value}ms`, 'Response Time']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke={REALTIME_COLORS.primary}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={isLiveMode}
                      />
                      <ReferenceLine y={200} stroke={REALTIME_COLORS.warning} strokeDasharray="2 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* System Resources Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    System Resources
                    {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </CardTitle>
                  <CardDescription>Real-time resource utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          const labels = {
                            cpuUsage: 'CPU Usage',
                            memoryUsage: 'Memory Usage'
                          };
                          return [`${value}%`, labels[name as keyof typeof labels] || name];
                        }}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpuUsage"
                        stackId="1"
                        stroke={REALTIME_COLORS.warning}
                        fill={REALTIME_COLORS.warning}
                        fillOpacity={0.6}
                        isAnimationActive={isLiveMode}
                      />
                      <Area
                        type="monotone"
                        dataKey="memoryUsage"
                        stackId="2"
                        stroke={REALTIME_COLORS.info}
                        fill={REALTIME_COLORS.info}
                        fillOpacity={0.6}
                        isAnimationActive={isLiveMode}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Status Overview */}
          {realtimeState.performanceData && (
            <Card>
              <CardHeader>
                <CardTitle>System Status Overview</CardTitle>
                <CardDescription>Current system health and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Time</span>
                          <span>{realtimeState.performanceData.metrics.responseTime}ms</span>
                        </div>
                        <Progress value={Math.min(realtimeState.performanceData.metrics.responseTime / 5, 100)} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Throughput</span>
                          <span>{realtimeState.performanceData.metrics.throughput}/sec</span>
                        </div>
                        <Progress value={realtimeState.performanceData.metrics.throughput} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Resource Usage</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span>{realtimeState.performanceData.systemResources.cpuPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={realtimeState.performanceData.systemResources.cpuPercent} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory</span>
                          <span>{realtimeState.performanceData.systemResources.memoryPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={realtimeState.performanceData.systemResources.memoryPercent} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">System Health</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${realtimeState.performanceData.status === 'healthy' ? 'bg-green-500' :
                            realtimeState.performanceData.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                          }`} />
                        <span className="text-sm font-medium">
                          {realtimeState.performanceData.status.charAt(0).toUpperCase() +
                            realtimeState.performanceData.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Network: ↓{(realtimeState.performanceData.systemResources.networkBytesIn / 1024 / 1024).toFixed(2)}MB
                        ↑{(realtimeState.performanceData.systemResources.networkBytesOut / 1024 / 1024).toFixed(2)}MB
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Memory Analytics Tab */}
        <TabsContent value="memory-analytics" className="space-y-6">
          {realtimeState.memoryData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <RealtimeMetricsCard
                title="Total Memories"
                value={realtimeState.memoryData.totalMemories}
                icon={<Database className="h-6 w-6" />}
                isLive={isLiveMode && isConnected}
              />

              <RealtimeMetricsCard
                title="Recent Additions"
                value={realtimeState.memoryData.recentAdditions}
                icon={<TrendingUp className="h-6 w-6" />}
                color={REALTIME_COLORS.success}
                isLive={isLiveMode && isConnected}
              />

              <RealtimeMetricsCard
                title="Search Activity"
                value={realtimeState.memoryData.searchActivity}
                unit="/min"
                icon={<Activity className="h-6 w-6" />}
                color={REALTIME_COLORS.info}
                isLive={isLiveMode && isConnected}
              />

              <RealtimeMetricsCard
                title="Active Agents"
                value={realtimeState.memoryData.activeAgents}
                icon={<Users className="h-6 w-6" />}
                color={REALTIME_COLORS.purple}
                isLive={isLiveMode && isConnected}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Waiting for memory analytics data...</p>
                  {!isConnected && (
                    <p className="text-sm text-gray-500">Connect to start receiving data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Alerts Tab */}
        <TabsContent value="live-alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Live Alerts</h3>
              <p className="text-sm text-gray-600">
                {realtimeState.alerts.length} active alerts
                {realtimeState.lastMessageTime && (
                  <span className="ml-2">• Last update: {realtimeState.lastMessageTime.toLocaleTimeString()}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={realtime.clearAlerts}
                disabled={realtimeState.alerts.length === 0}
              >
                Clear All
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => realtime.sendAlert({
                  title: 'Test Alert',
                  message: 'This is a test alert from the dashboard',
                  type: 'info',
                  source: 'system'
                })}
                disabled={!isConnected}
              >
                Send Test Alert
              </Button>
            </div>
          </div>

          {realtimeState.alerts.length > 0 ? (
            <div className="space-y-4">
              {realtimeState.alerts.map((alert) => (
                <LiveAlert
                  key={alert.id}
                  alert={alert}
                  onResolve={realtime.resolveAlert}
                  isNew={newAlertIds.has(alert.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No active alerts</p>
                  <p className="text-sm text-gray-500">System is operating normally</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connection Info Tab */}
        <TabsContent value="connection-info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
                <CardDescription>WebSocket connection information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Status</p>
                    <p className="capitalize">{realtimeState.connectionState}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Client ID</p>
                    <p className="font-mono text-xs">{realtimeState.clientId || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Connected At</p>
                    <p>{realtimeState.connectedAt?.toLocaleString() || 'Not connected'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Reconnect Attempts</p>
                    <p>{realtimeState.reconnectAttempts}/10</p>
                  </div>
                </div>

                {realtimeState.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600 font-medium">Connection Error:</p>
                    <p className="text-sm text-red-700">{realtimeState.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Statistics</CardTitle>
                <CardDescription>Real-time data transfer statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Messages Received</p>
                    <p className="text-lg font-semibold">{realtimeState.messagesReceived}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Data Transfer</p>
                    <p className="text-lg font-semibold">{(realtimeState.dataTransferBytes / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Last Message</p>
                    <p>{realtimeState.lastMessageTime?.toLocaleTimeString() || 'Never'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Active Subscriptions</p>
                    <p>{realtimeState.activeSubscriptions.size}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-medium text-gray-600 mb-2">Subscribed Streams:</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(realtimeState.activeSubscriptions).map(stream => (
                      <Badge key={stream} variant="outline" className="text-xs">
                        {stream}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage real-time data stream subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {realtimeState.availableStreams.map(stream => {
                    const isSubscribed = realtimeState.activeSubscriptions.has(stream);
                    return (
                      <div key={stream} className="flex items-center gap-2">
                        <Switch
                          checked={isSubscribed}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              realtime.subscribe([stream]);
                            } else {
                              realtime.unsubscribe([stream]);
                            }
                          }}
                          disabled={!isConnected}
                        />
                        <span className="text-sm capitalize">{stream}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => realtime.subscribe(['performance', 'memory', 'alerts', 'system'])}
                    disabled={!isConnected}
                  >
                    Subscribe All
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => realtime.unsubscribe(Array.from(realtimeState.activeSubscriptions))}
                    disabled={!isConnected || realtimeState.activeSubscriptions.size === 0}
                  >
                    Unsubscribe All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeAnalyticsDashboard;
