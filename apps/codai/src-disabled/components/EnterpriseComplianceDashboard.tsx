import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Key,
  BarChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Lock,
  Globe,
  Settings,
  Database,
  Activity,
} from 'lucide-react';

// Mock data for demonstration
interface ComplianceMetrics {
  pciCompliance: {
    status: 'compliant' | 'non-compliant' | 'pending';
    score: number;
    lastAudit: string;
    violations: string[];
  };
  soxCompliance: {
    status: 'compliant' | 'non-compliant' | 'pending';
    score: number;
    lastAudit: string;
    violations: string[];
  };
  kycAml: {
    verifiedUsers: number;
    pendingVerifications: number;
    flaggedTransactions: number;
    riskScore: number;
  };
  auditLogs: Array<{
    timestamp: string;
    event: string;
    user: string;
    details: string;
  }>;
}

interface TenantMetrics {
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  rateLimitHits: number;
}

export const EnterpriseComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'gateway' | 'audit'>('overview');
  const [complianceData, setComplianceData] = useState<ComplianceMetrics | null>(null);
  const [tenantMetrics, setTenantMetrics] = useState<TenantMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setComplianceData({
        pciCompliance: {
          status: 'compliant',
          score: 95,
          lastAudit: '2024-12-15',
          violations: [],
        },
        soxCompliance: {
          status: 'compliant',
          score: 88,
          lastAudit: '2024-12-10',
          violations: ['Missing approval workflow for large transactions'],
        },
        kycAml: {
          verifiedUsers: 1247,
          pendingVerifications: 23,
          flaggedTransactions: 5,
          riskScore: 15,
        },
        auditLogs: [
          {
            timestamp: '2024-12-20 14:30:00',
            event: 'PCI_DSS_SCAN_COMPLETED',
            user: 'system',
            details: 'Automated compliance scan completed successfully',
          },
          {
            timestamp: '2024-12-20 13:15:00',
            event: 'USER_KYC_VERIFIED',
            user: 'john.doe@example.com',
            details: 'KYC verification completed with enhanced due diligence',
          },
        ],
      });

      setTenantMetrics({
        activeUsers: 89,
        totalRequests: 15420,
        errorRate: 0.02,
        averageResponseTime: 145,
        rateLimitHits: 3,
      });

      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'gateway', label: 'API Gateway', icon: Globe },
    { id: 'audit', label: 'Audit Logs', icon: Database },
  ];

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enterprise Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor compliance frameworks, API gateway, and security metrics
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{tenantMetrics?.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tenantMetrics?.totalRequests.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((tenantMetrics?.errorRate || 0) * 100).toFixed(2)}%
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tenantMetrics?.averageResponseTime}ms
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && complianceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Compliance Framework Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PCI DSS */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">PCI DSS Compliance</h3>
                  {complianceData.pciCompliance.status === 'compliant' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance Score</span>
                    <span className="font-semibold text-gray-900">
                      {complianceData.pciCompliance.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${complianceData.pciCompliance.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Audit</span>
                    <span className="text-gray-900">{complianceData.pciCompliance.lastAudit}</span>
                  </div>
                </div>
              </div>

              {/* SOX */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">SOX Compliance</h3>
                  {complianceData.soxCompliance.status === 'compliant' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance Score</span>
                    <span className="font-semibold text-gray-900">
                      {complianceData.soxCompliance.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${complianceData.soxCompliance.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Audit</span>
                    <span className="text-gray-900">{complianceData.soxCompliance.lastAudit}</span>
                  </div>
                </div>
                {complianceData.soxCompliance.violations.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Violations:</strong>
                    </p>
                    <ul className="text-sm text-yellow-700 mt-1">
                      {complianceData.soxCompliance.violations.map((violation, index) => (
                        <li key={index}>• {violation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* KYC/AML Metrics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC/AML Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceData.kycAml.verifiedUsers}
                  </div>
                  <div className="text-sm text-blue-800">Verified Users</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceData.kycAml.pendingVerifications}
                  </div>
                  <div className="text-sm text-yellow-800">Pending Verifications</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {complianceData.kycAml.flaggedTransactions}
                  </div>
                  <div className="text-sm text-red-800">Flagged Transactions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceData.kycAml.riskScore}%
                  </div>
                  <div className="text-sm text-green-800">Overall Risk Score</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Gateway Tab */}
        {activeTab === 'gateway' && tenantMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gateway Health</h3>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="text-gray-900">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate Limit Hits</span>
                    <span className="text-gray-900">{tenantMetrics.rateLimitHits}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="text-gray-900">{tenantMetrics.averageResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Throughput</span>
                    <span className="text-gray-900">1,240 req/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate</span>
                    <span className="text-gray-900">
                      {(tenantMetrics.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active API Keys</span>
                    <span className="text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Failures</span>
                    <span className="text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MFA Enabled</span>
                    <span className="text-gray-900">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && complianceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Audit Events</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {complianceData.auditLogs.map((log, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{log.event}</p>
                        <p className="text-sm text-gray-500">{log.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      <p className="text-xs text-gray-500 mt-1">User: {log.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
