import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: string;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  lastChecked: string;
  replicas: {
    running: number;
    desired: number;
  };
}

interface DeploymentMetrics {
  version: string;
  deployedAt: string;
  environment: 'staging' | 'production';
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  throughput: number;
}

export const ProductionDeploymentDashboard: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    // Simulate real-time data fetching
    const fetchData = () => {
      // Mock service status data
      setServices([
        {
          name: 'CODAI Platform',
          status: 'healthy',
          uptime: '99.9%',
          responseTime: 145,
          cpuUsage: 35,
          memoryUsage: 68,
          lastChecked: new Date().toISOString(),
          replicas: { running: 3, desired: 3 },
        },
        {
          name: 'MEMORAI Service',
          status: 'healthy',
          uptime: '99.8%',
          responseTime: 280,
          cpuUsage: 72,
          memoryUsage: 85,
          lastChecked: new Date().toISOString(),
          replicas: { running: 2, desired: 2 },
        },
        {
          name: 'BANCAI Service',
          status: 'healthy',
          uptime: '99.9%',
          responseTime: 120,
          cpuUsage: 28,
          memoryUsage: 45,
          lastChecked: new Date().toISOString(),
          replicas: { running: 2, desired: 2 },
        },
        {
          name: 'API Gateway',
          status: 'healthy',
          uptime: '99.95%',
          responseTime: 95,
          cpuUsage: 18,
          memoryUsage: 32,
          lastChecked: new Date().toISOString(),
          replicas: { running: 2, desired: 2 },
        },
        {
          name: 'MongoDB Cluster',
          status: 'healthy',
          uptime: '99.99%',
          responseTime: 15,
          cpuUsage: 45,
          memoryUsage: 78,
          lastChecked: new Date().toISOString(),
          replicas: { running: 3, desired: 3 },
        },
        {
          name: 'Redis Cache',
          status: 'healthy',
          uptime: '99.97%',
          responseTime: 2,
          cpuUsage: 12,
          memoryUsage: 34,
          lastChecked: new Date().toISOString(),
          replicas: { running: 1, desired: 1 },
        },
      ]);

      setDeploymentMetrics({
        version: 'v2.1.3',
        deployedAt: '2024-12-20T15:30:00Z',
        environment: 'production',
        totalRequests: 2847521,
        errorRate: 0.02,
        averageResponseTime: 142,
        throughput: 1850,
      });

      setLoading(false);
    };

    fetchData();

    // Set up real-time updates
    const interval = setInterval(fetchData, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMetricColor = (value: number, threshold: number) => {
    if (value > threshold) return 'text-red-600';
    if (value > threshold * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Production Deployment Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring and deployment status for CODAI ecosystem
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  Auto-refresh: {refreshInterval}s
                </span>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Deployment Overview */}
        {deploymentMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Version</p>
                  <p className="text-2xl font-bold text-gray-900">{deploymentMetrics.version}</p>
                  <p className="text-xs text-gray-500">
                    Deployed {new Date(deploymentMetrics.deployedAt).toLocaleDateString()}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deploymentMetrics.totalRequests.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                    <p className="text-xs text-green-600">+12.5% vs yesterday</p>
                  </div>
                </div>
                <BarChart className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(deploymentMetrics.errorRate * 100).toFixed(3)}%
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 text-green-600 mr-1" />
                    <p className="text-xs text-green-600">-0.005% vs yesterday</p>
                  </div>
                </div>
                <Shield className={`w-8 h-8 ${deploymentMetrics.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Throughput</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deploymentMetrics.throughput} req/min
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg response: {deploymentMetrics.averageResponseTime}ms
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {services.map((service, index) => (
            <div key={service.name} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {service.name.includes('Database') || service.name.includes('MongoDB') ? (
                    <Database className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Server className="w-6 h-6 text-blue-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-lg font-semibold text-gray-900">{service.uptime}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className={`text-lg font-semibold ${getMetricColor(service.responseTime, 200)}`}>
                    {service.responseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Replicas</p>
                  <p className={`text-lg font-semibold ${service.replicas.running === service.replicas.desired ? 'text-green-600' : 'text-red-600'}`}>
                    {service.replicas.running}/{service.replicas.desired}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 flex items-center">
                      <Cpu className="w-4 h-4 mr-1" />
                      CPU Usage
                    </span>
                    <span className={`font-medium ${getMetricColor(service.cpuUsage, 80)}`}>
                      {service.cpuUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${service.cpuUsage > 80 ? 'bg-red-500' : service.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${service.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 flex items-center">
                      <HardDrive className="w-4 h-4 mr-1" />
                      Memory Usage
                    </span>
                    <span className={`font-medium ${getMetricColor(service.memoryUsage, 85)}`}>
                      {service.memoryUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${service.memoryUsage > 85 ? 'bg-red-500' : service.memoryUsage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${service.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            Network & Infrastructure Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Load Balancer</p>
              <p className="text-xs text-green-600">Healthy - 99.99% uptime</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">SSL Certificates</p>
              <p className="text-xs text-green-600">Valid - Expires in 87 days</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">CDN</p>
              <p className="text-xs text-green-600">Optimal - 15ms global latency</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
