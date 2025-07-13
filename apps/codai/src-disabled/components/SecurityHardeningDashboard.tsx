/**
 * Security Hardening Dashboard Component
 * Comprehensive security monitoring and management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Activity,
  Users,
  Globe,
  Smartphone,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Fingerprint,
  Wifi,
  Server
} from 'lucide-react';

interface SecurityMetrics {
  zeroTrust: {
    enabled: boolean;
    compliance: number;
    activeSessions: number;
    blockedAttempts: number;
  };
  threats: {
    active: number;
    mitigated: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  biometric: {
    enrolledUsers: number;
    verificationSuccess: number;
    spoofingAttempts: number;
    averageConfidence: number;
  };
  encryption: {
    quantumResistant: boolean;
    keyRotations: number;
    encryptedSessions: number;
    encryptionLevel: string;
  };
  riskAssessment: {
    averageRiskScore: number;
    highRiskUsers: number;
    anomaliesDetected: number;
    mitigationActions: number;
  };
}

export default function SecurityHardeningDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    // Simulate real-time security metrics
    const updateMetrics = () => {
      setMetrics({
        zeroTrust: {
          enabled: true,
          compliance: 0.96,
          activeSessions: 1247,
          blockedAttempts: 23
        },
        threats: {
          active: 3,
          mitigated: 17,
          critical: 0,
          high: 1,
          medium: 2,
          low: 0
        },
        biometric: {
          enrolledUsers: 3892,
          verificationSuccess: 0.987,
          spoofingAttempts: 2,
          averageConfidence: 0.94
        },
        encryption: {
          quantumResistant: true,
          keyRotations: 8,
          encryptedSessions: 1247,
          encryptionLevel: 'Post-Quantum'
        },
        riskAssessment: {
          averageRiskScore: 0.23,
          highRiskUsers: 12,
          anomaliesDetected: 7,
          mitigationActions: 15
        }
      });

      setSecurityAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Suspicious Login Pattern Detected',
          description: 'User attempting access from unusual location',
          timestamp: new Date(Date.now() - 300000),
          severity: 'medium'
        },
        {
          id: '2',
          type: 'info',
          title: 'Biometric Enrollment Spike',
          description: '47 new biometric enrollments in the last hour',
          timestamp: new Date(Date.now() - 180000),
          severity: 'low'
        },
        {
          id: '3',
          type: 'success',
          title: 'Threat Mitigated',
          description: 'Potential SQL injection attempt blocked automatically',
          timestamp: new Date(Date.now() - 120000),
          severity: 'high'
        }
      ]);
    };

    updateMetrics();

    if (realTimeUpdates) {
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Security Hardening Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Phase 6: Zero Trust Architecture & Advanced Security
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${realTimeUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {realTimeUpdates ? 'Live Updates' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {realTimeUpdates ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Zero Trust Status */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Zero Trust</p>
              <p className="text-2xl font-bold text-gray-900">
                {(metrics.zeroTrust.compliance * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Fully Operational
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Active Sessions: {metrics.zeroTrust.activeSessions}</span>
              <span>Blocked: {metrics.zeroTrust.blockedAttempts}</span>
            </div>
          </div>
        </motion.div>

        {/* Threat Detection */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Threats</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.threats.active}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {metrics.threats.mitigated} Mitigated Today
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-red-500 rounded"
                  style={{ width: `${(metrics.threats.critical / (metrics.threats.active || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Risk Level</span>
            </div>
          </div>
        </motion.div>

        {/* Biometric Security */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Biometric Auth</p>
              <p className="text-2xl font-bold text-gray-900">
                {(metrics.biometric.verificationSuccess * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {metrics.biometric.enrolledUsers.toLocaleString()} Enrolled
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Fingerprint className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Confidence: {(metrics.biometric.averageConfidence * 100).toFixed(0)}%</span>
              <span>Spoofing: {metrics.biometric.spoofingAttempts}</span>
            </div>
          </div>
        </motion.div>

        {/* Quantum Encryption */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encryption</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.encryption.encryptionLevel}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ✓ Quantum Resistant
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Key Rotations: {metrics.encryption.keyRotations}</span>
              <span>Sessions: {metrics.encryption.encryptedSessions}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Real-Time Security Alerts
          </h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              All
            </button>
            <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200">
              Critical
            </button>
            <button className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200">
              High
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {securityAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-orange-500' :
                    'bg-green-500'
                }`} />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Risk Assessment
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Average Risk Score</span>
                <span className="text-sm font-bold text-green-600">
                  {(metrics.riskAssessment.averageRiskScore * 100).toFixed(1)}% (Low)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.riskAssessment.averageRiskScore * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {metrics.riskAssessment.highRiskUsers}
                </p>
                <p className="text-xs text-red-600">High Risk Users</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.riskAssessment.anomaliesDetected}
                </p>
                <p className="text-xs text-blue-600">Anomalies Detected</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mitigation Actions</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Automated Responses</span>
                  <span className="font-medium">{metrics.riskAssessment.mitigationActions}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Manual Reviews</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Policy Updates</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Infrastructure */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            Security Infrastructure
          </h2>

          <div className="space-y-4">
            {/* Zero Trust Architecture */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Zero Trust Architecture</p>
                  <p className="text-xs text-gray-500">Never trust, always verify</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            {/* Quantum Encryption */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Quantum Encryption</p>
                  <p className="text-xs text-gray-500">Post-quantum cryptography</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-blue-600">Active</span>
              </div>
            </div>

            {/* Biometric Security */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Biometric Authentication</p>
                  <p className="text-xs text-gray-500">Multi-modal biometric verification</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm text-purple-600">Active</span>
              </div>
            </div>

            {/* Threat Intelligence */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">Threat Intelligence</p>
                  <p className="text-xs text-gray-500">Real-time threat feeds</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm text-orange-600">Active</span>
              </div>
            </div>

            {/* Network Security */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Network Security</p>
                  <p className="text-xs text-gray-500">Advanced firewall & DDoS protection</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Score Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Security Score</h2>
            <p className="text-blue-100">
              Based on Zero Trust compliance, threat mitigation, and security infrastructure
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">96.4</div>
            <div className="text-blue-100 text-sm">
              ✓ Enterprise Grade Security
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-blue-100">Protected Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">99.7%</div>
            <div className="text-xs text-blue-100">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">23</div>
            <div className="text-xs text-blue-100">Threats Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-blue-100">Security Incidents</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Supporting interfaces
interface SecurityAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
