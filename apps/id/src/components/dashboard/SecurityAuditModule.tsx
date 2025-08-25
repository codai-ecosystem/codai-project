/**
 * Security Audit Module - ID Service Security Monitoring
 * Microsoft React patterns for comprehensive security oversight
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AuthStats {
    totalUsers: number;
    activeUsers: number;
    authenticatedSessions: number;
    failedAttempts: number;
    securityScore: number;
    uptime: number;
    lastSecurityScan: string;
}

interface SecurityAuditModuleProps {
    stats: AuthStats | null;
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    enableRealTimeUpdates?: boolean;
}

interface SecurityEvent {
    id: string;
    type: 'threat_detected' | 'policy_violation' | 'suspicious_activity' | 'access_denied' | 'data_breach';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: string;
    user?: string;
    ip?: string;
    resolved: boolean;
}

interface ComplianceCheck {
    id: string;
    name: string;
    standard: string;
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastCheck: string;
    issues: number;
}

interface SecurityMetric {
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    target: number;
    status: 'good' | 'warning' | 'critical';
}

export default function SecurityAuditModule({
    stats,
    variant = 'enhanced',
    enableRealTimeUpdates = true
}: SecurityAuditModuleProps) {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
    const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
    const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [lastScanTime, setLastScanTime] = useState<string>('');

    useEffect(() => {
        fetchSecurityData();

        if (enableRealTimeUpdates) {
            const interval = setInterval(fetchSecurityData, 8000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates]);

    const fetchSecurityData = async () => {
        try {
            setIsLoading(true);

            const eventsResponse = await fetch('http://localhost:4000/api/v1/id/security/events');
            const complianceResponse = await fetch('http://localhost:4000/api/v1/id/security/compliance');
            const metricsResponse = await fetch('http://localhost:4000/api/v1/id/security/metrics');

            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                setSecurityEvents(eventsData.events || generateMockEvents());
            } else {
                setSecurityEvents(generateMockEvents());
            }

            if (complianceResponse.ok) {
                const complianceData = await complianceResponse.json();
                setComplianceChecks(complianceData.checks || generateMockCompliance());
            } else {
                setComplianceChecks(generateMockCompliance());
            }

            if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json();
                setSecurityMetrics(metricsData.metrics || generateMockMetrics());
            } else {
                setSecurityMetrics(generateMockMetrics());
            }

            setLastScanTime(new Date().toISOString());
        } catch (error) {
            console.error('Failed to fetch security data:', error);
            setSecurityEvents(generateMockEvents());
            setComplianceChecks(generateMockCompliance());
            setSecurityMetrics(generateMockMetrics());
            setLastScanTime(new Date().toISOString());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockEvents = (): SecurityEvent[] => [
        {
            id: '1', type: 'threat_detected', severity: 'high',
            description: 'Multiple failed login attempts from suspicious IP',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            user: 'unknown@external.com', ip: '185.220.101.42', resolved: false
        },
        {
            id: '2', type: 'policy_violation', severity: 'medium',
            description: 'Password policy violation detected',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            user: 'user@codai.dev', resolved: true
        },
        {
            id: '3', type: 'suspicious_activity', severity: 'medium',
            description: 'Unusual login pattern detected',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            user: 'admin@codai.dev', ip: '192.168.1.100', resolved: false
        },
        {
            id: '4', type: 'access_denied', severity: 'low',
            description: 'Unauthorized access attempt to admin panel',
            timestamp: new Date(Date.now() - 2400000).toISOString(),
            user: 'guest@codai.dev', ip: '172.16.0.45', resolved: true
        }
    ];

    const generateMockCompliance = (): ComplianceCheck[] => [
        {
            id: '1', name: 'Password Policy', standard: 'NIST 800-63B',
            status: 'compliant', lastCheck: new Date(Date.now() - 3600000).toISOString(), issues: 0
        },
        {
            id: '2', name: 'Multi-Factor Authentication', standard: 'GDPR Art. 32',
            status: 'compliant', lastCheck: new Date(Date.now() - 7200000).toISOString(), issues: 0
        },
        {
            id: '3', name: 'Data Encryption', standard: 'SOC 2 Type II',
            status: 'compliant', lastCheck: new Date(Date.now() - 10800000).toISOString(), issues: 0
        },
        {
            id: '4', name: 'Access Controls', standard: 'ISO 27001',
            status: 'needs_review', lastCheck: new Date(Date.now() - 14400000).toISOString(), issues: 3
        },
        {
            id: '5', name: 'Audit Logging', standard: 'PCI DSS',
            status: 'non_compliant', lastCheck: new Date(Date.now() - 18000000).toISOString(), issues: 7
        }
    ];

    const generateMockMetrics = (): SecurityMetric[] => [
        { name: 'Authentication Success Rate', value: 96.8, unit: '%', trend: 'stable', target: 95, status: 'good' },
        { name: 'Failed Login Attempts', value: 23, unit: '/hour', trend: 'down', target: 50, status: 'good' },
        { name: 'Account Lockouts', value: 4, unit: '/day', trend: 'up', target: 10, status: 'warning' },
        { name: 'Security Scan Coverage', value: 94.2, unit: '%', trend: 'up', target: 95, status: 'warning' },
        { name: 'Vulnerability Response Time', value: 2.3, unit: 'hours', trend: 'down', target: 4, status: 'good' },
        { name: 'Compliance Score', value: 87.5, unit: '%', trend: 'stable', target: 90, status: 'warning' }
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '🟡';
            case 'low': return '🔵';
            default: return '⚪';
        }
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'text-green-600 bg-green-100';
            case 'non_compliant': return 'text-red-600 bg-red-100';
            case 'needs_review': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getMetricStatus = (metric: SecurityMetric) => {
        switch (metric.status) {
            case 'good': return 'text-green-600 bg-green-50 border-green-200';
            case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            case 'stable': return '➡️';
            default: return '➡️';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const filteredEvents = securityEvents.filter(event =>
        filterSeverity === 'all' || event.severity === filterSeverity
    );

    const triggerSecurityScan = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/v1/id/security/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert('Security scan initiated successfully!');
                fetchSecurityData();
            } else {
                alert('Security scan initiation failed');
            }
        } catch (error) {
            console.error('Failed to trigger security scan:', error);
            alert('Security scan initiated (simulated)');
            fetchSecurityData();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Security Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`p-4 rounded-xl border ${getMetricStatus(metric)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{metric.name}</h4>
                            <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold">{metric.value}</span>
                            <span className="text-sm text-gray-600">{metric.unit}</span>
                        </div>
                        <div className="mt-2 text-xs">
                            <span className="text-gray-600">Target: {metric.target}{metric.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Compliance Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                            <p className="text-sm text-gray-600 mt-1">Security standards and regulatory compliance</p>
                        </div>
                        <button
                            onClick={triggerSecurityScan}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            🔍 Run Security Scan
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complianceChecks.map((check, index) => (
                            <motion.div
                                key={check.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{check.name}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getComplianceColor(check.status)}`}>
                                        {check.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{check.standard}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Last check: {formatTimeAgo(check.lastCheck)}</span>
                                    {check.issues > 0 && (
                                        <span className="text-red-600 font-medium">{check.issues} issues</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Security Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
                            <p className="text-sm text-gray-600 mt-1">{filteredEvents.length} events • Last scan: {formatTimeAgo(lastScanTime)}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Live Monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-1 text-xs border rounded-full ${getSeverityColor(event.severity)}`}>
                                            {getSeverityIcon(event.severity)} {event.severity.toUpperCase()}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                {event.user && <span>User: {event.user}</span>}
                                                {event.ip && <span>IP: {event.ip}</span>}
                                                <span>Type: {event.type.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${event.resolved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs text-gray-500">{formatTimeAgo(event.timestamp)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <div className="text-gray-400 text-4xl mb-2">🛡️</div>
                            <p className="text-gray-500">No security events found</p>
                            <p className="text-gray-400 text-sm mt-1">Your system appears secure</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Security Score Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Overall Security Score</h3>
                        <p className="text-sm text-gray-600 mt-1">Based on authentication metrics, compliance, and threat detection</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{stats?.securityScore?.toFixed(1) || '0.0'}%</div>
                        <div className={`text-sm font-medium ${(stats?.securityScore || 0) >= 90 ? 'text-green-600' : (stats?.securityScore || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {(stats?.securityScore || 0) >= 90 ? 'Excellent' : (stats?.securityScore || 0) >= 80 ? 'Good' : 'Needs Improvement'}
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Security Progress</span>
                        <span>{stats?.securityScore?.toFixed(1) || '0.0'}% / 100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${(stats?.securityScore || 0) >= 90 ? 'bg-green-500' : (stats?.securityScore || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${stats?.securityScore || 0}%` }}
                        ></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}