'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Lock,
    Key,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    Smartphone,
    Laptop,
    Monitor,
    MapPin,
    RefreshCw,
    Download,
    Filter,
    Search,
    MoreVertical,
    Bell,
    Ban,
    UserCheck,
    Settings,
    Activity,
    Calendar,
    FileText,
    Database,
    Network,
    Zap,
    Fingerprint,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Users,
    Server,
    Wifi,
    HardDrive,
    Cpu,
    Mail,
    Phone,
    CreditCard,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Info,
    AlertCircle
} from 'lucide-react';

interface SecurityAlert {
    id: string;
    type: 'authentication' | 'authorization' | 'data_breach' | 'suspicious_activity' | 'policy_violation' | 'system_intrusion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    source: string;
    status: 'active' | 'investigating' | 'resolved' | 'dismissed';
    affectedUsers: number;
    recommendation: string;
}

interface LoginAttempt {
    id: string;
    userId: string;
    username: string;
    email: string;
    ip: string;
    location: string;
    device: string;
    userAgent: string;
    timestamp: string;
    status: 'success' | 'failed' | 'blocked' | 'suspicious';
    reason?: string;
    riskScore: number;
}

interface AccessControl {
    id: string;
    resource: string;
    user: string;
    role: string;
    action: string;
    timestamp: string;
    status: 'granted' | 'denied';
    reason?: string;
    ip: string;
    location: string;
}

interface SecurityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    status: 'good' | 'warning' | 'critical';
    description: string;
}

interface ComplianceCheck {
    id: string;
    name: string;
    category: 'authentication' | 'data_protection' | 'access_control' | 'audit' | 'encryption';
    status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
    score: number;
    lastCheck: string;
    requirements: number;
    passed: number;
    failed: number;
    description: string;
}

export default function SecurityCenter() {
    const [selectedTab, setSelectedTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('24h');
    const [alertFilter, setAlertFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock security alerts
    const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
        {
            id: '1',
            type: 'suspicious_activity',
            severity: 'high',
            title: 'Multiple Failed Login Attempts',
            description: 'User admin@codai.com has 15 failed login attempts in the last hour from different IP addresses',
            timestamp: '2024-08-06T10:15:00Z',
            source: 'Authentication Service',
            status: 'investigating',
            affectedUsers: 1,
            recommendation: 'Consider temporarily locking the account and requiring 2FA verification'
        },
        {
            id: '2',
            type: 'data_breach',
            severity: 'critical',
            title: 'Unusual Data Access Pattern',
            description: 'Large volume of user data accessed from new IP address in suspicious location',
            timestamp: '2024-08-06T09:45:00Z',
            source: 'Data Access Monitor',
            status: 'active',
            affectedUsers: 150,
            recommendation: 'Immediately investigate the source IP and revoke suspicious access tokens'
        },
        {
            id: '3',
            type: 'policy_violation',
            severity: 'medium',
            title: 'Password Policy Violation',
            description: '8 users are using weak passwords that don\'t meet security requirements',
            timestamp: '2024-08-06T08:30:00Z',
            source: 'Password Policy Checker',
            status: 'active',
            affectedUsers: 8,
            recommendation: 'Force password reset for affected users and enable stronger password requirements'
        },
        {
            id: '4',
            type: 'authentication',
            severity: 'low',
            title: '2FA Setup Reminder',
            description: '25 users haven\'t enabled two-factor authentication',
            timestamp: '2024-08-06T07:00:00Z',
            source: 'Security Compliance',
            status: 'active',
            affectedUsers: 25,
            recommendation: 'Send reminder emails to users to enable 2FA for enhanced security'
        }
    ]);

    // Mock login attempts
    const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([
        {
            id: '1',
            userId: 'u1',
            username: 'admin',
            email: 'admin@codai.com',
            ip: '192.168.1.100',
            location: 'Bucharest, Romania',
            device: 'Desktop',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-08-06T10:30:00Z',
            status: 'success',
            riskScore: 2
        },
        {
            id: '2',
            userId: 'u2',
            username: 'demo_user',
            email: 'demo@example.com',
            ip: '45.123.45.67',
            location: 'Unknown',
            device: 'Mobile',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            timestamp: '2024-08-06T10:25:00Z',
            status: 'failed',
            reason: 'Invalid password',
            riskScore: 7
        },
        {
            id: '3',
            userId: 'u3',
            username: 'test_user',
            email: 'test@codai.com',
            ip: '203.45.67.89',
            location: 'Singapore',
            device: 'Desktop',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            timestamp: '2024-08-06T10:20:00Z',
            status: 'blocked',
            reason: 'Too many attempts',
            riskScore: 9
        }
    ]);

    // Mock security metrics
    const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([
        {
            id: 'failed_logins',
            name: 'Failed Login Attempts',
            value: 45,
            unit: 'attempts',
            trend: 'up',
            change: 12,
            status: 'warning',
            description: 'Number of failed login attempts in the last 24 hours'
        },
        {
            id: 'active_sessions',
            name: 'Active Sessions',
            value: 127,
            unit: 'sessions',
            trend: 'stable',
            change: 0,
            status: 'good',
            description: 'Currently active user sessions'
        },
        {
            id: 'security_score',
            name: 'Security Score',
            value: 85,
            unit: '%',
            trend: 'up',
            change: 5,
            status: 'good',
            description: 'Overall security posture score'
        },
        {
            id: 'vulnerabilities',
            name: 'Open Vulnerabilities',
            value: 3,
            unit: 'issues',
            trend: 'down',
            change: -2,
            status: 'warning',
            description: 'Number of unresolved security vulnerabilities'
        }
    ]);

    // Mock compliance checks
    const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([
        {
            id: '1',
            name: 'GDPR Compliance',
            category: 'data_protection',
            status: 'compliant',
            score: 95,
            lastCheck: '2024-08-06T09:00:00Z',
            requirements: 20,
            passed: 19,
            failed: 1,
            description: 'General Data Protection Regulation compliance check'
        },
        {
            id: '2',
            name: 'Password Policy',
            category: 'authentication',
            status: 'partial',
            score: 78,
            lastCheck: '2024-08-06T08:30:00Z',
            requirements: 10,
            passed: 8,
            failed: 2,
            description: 'Password strength and policy compliance'
        },
        {
            id: '3',
            name: 'Access Control',
            category: 'access_control',
            status: 'compliant',
            score: 92,
            lastCheck: '2024-08-06T08:00:00Z',
            requirements: 15,
            passed: 14,
            failed: 1,
            description: 'Role-based access control implementation'
        },
        {
            id: '4',
            name: 'Audit Logging',
            category: 'audit',
            status: 'compliant',
            score: 88,
            lastCheck: '2024-08-06T07:30:00Z',
            requirements: 12,
            passed: 11,
            failed: 1,
            description: 'Comprehensive audit trail logging'
        }
    ]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
            case 'granted':
            case 'resolved':
            case 'compliant':
                return 'text-green-600 bg-green-100';
            case 'failed':
            case 'denied':
            case 'non_compliant':
                return 'text-red-600 bg-red-100';
            case 'blocked':
            case 'investigating':
            case 'partial':
                return 'text-yellow-600 bg-yellow-100';
            case 'suspicious':
            case 'active':
                return 'text-orange-600 bg-orange-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getDeviceIcon = (device: string) => {
        switch (device.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="w-4 h-4" />;
            case 'tablet':
                return <Smartphone className="w-4 h-4" />;
            case 'desktop':
                return <Monitor className="w-4 h-4" />;
            case 'laptop':
                return <Laptop className="w-4 h-4" />;
            default:
                return <Monitor className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const refreshData = async () => {
        setRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const filteredAlerts = securityAlerts.filter(alert => {
        const matchesFilter = alertFilter === 'all' || alert.severity === alertFilter;
        const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
        { id: 'alerts', label: 'Security Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'access', label: 'Access Logs', icon: <Key className="w-4 h-4" /> },
        { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'policies', label: 'Security Policies', icon: <FileText className="w-4 h-4" /> }
    ];

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor security threats, compliance status, and access controls
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>

                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Security Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {securityMetrics.map((metric) => (
                        <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <div className="flex items-baseline space-x-2 mt-2">
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        <span className="text-sm text-gray-500">{metric.unit}</span>
                                    </div>

                                    {metric.change !== 0 && (
                                        <div className={`flex items-center mt-1 text-sm ${metric.trend === 'up' ?
                                                (metric.status === 'good' ? 'text-green-600' : 'text-red-600') :
                                                (metric.status === 'good' ? 'text-green-600' : 'text-red-600')
                                            }`}>
                                            {metric.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            {Math.abs(metric.change)}% from yesterday
                                        </div>
                                    )}
                                </div>

                                <div className={`p-3 rounded-lg ${metric.status === 'good' ? 'bg-green-100' :
                                        metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                                    }`}>
                                    {metric.status === 'good' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                    {metric.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                                    {metric.status === 'critical' && <XCircle className="w-6 h-6 text-red-600" />}
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">{metric.description}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${selectedTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {selectedTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Recent Security Alerts */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Recent Security Alerts</h3>
                                            <button
                                                onClick={() => setSelectedTab('alerts')}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {securityAlerts.slice(0, 3).map((alert) => (
                                                <div key={alert.id} className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                                                                    {alert.severity}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                                                            </div>
                                                            <h4 className="text-sm font-medium text-gray-900 mt-1">{alert.title}</h4>
                                                            <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compliance Status */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Compliance Status</h3>
                                            <button
                                                onClick={() => setSelectedTab('compliance')}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {complianceChecks.slice(0, 4).map((check) => (
                                                <div key={check.id} className="bg-white rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-3 h-3 rounded-full ${check.status === 'compliant' ? 'bg-green-500' :
                                                                    check.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`} />
                                                            <span className="text-sm font-medium text-gray-900">{check.name}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600">{check.score}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Alerts Tab */}
                        {selectedTab === 'alerts' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search alerts..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <select
                                            value={alertFilter}
                                            onChange={(e) => setAlertFilter(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Severities</option>
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredAlerts.map((alert) => (
                                        <div key={alert.id} className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                                                            {alert.severity}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                                                            {alert.status}
                                                        </span>
                                                        <span className="text-sm text-gray-500">{formatDate(alert.timestamp)}</span>
                                                    </div>

                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{alert.title}</h3>
                                                    <p className="text-gray-600 mb-3">{alert.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Source</p>
                                                            <p className="text-sm font-medium text-gray-900">{alert.source}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Affected Users</p>
                                                            <p className="text-sm font-medium text-gray-900">{alert.affectedUsers}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Recommendation:</strong> {alert.recommendation}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Access Logs Tab */}
                        {selectedTab === 'access' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Login Attempts</h3>
                                    <button className="flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export Logs
                                    </button>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP & Location</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loginAttempts.map((attempt) => (
                                                    <tr key={attempt.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{attempt.username}</div>
                                                                <div className="text-sm text-gray-500">{attempt.email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm text-gray-900">{attempt.ip}</div>
                                                                <div className="text-sm text-gray-500 flex items-center">
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {attempt.location}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center text-sm text-gray-900">
                                                                {getDeviceIcon(attempt.device)}
                                                                <span className="ml-2">{attempt.device}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attempt.status)}`}>
                                                                {attempt.status}
                                                            </span>
                                                            {attempt.reason && (
                                                                <div className="text-xs text-gray-500 mt-1">{attempt.reason}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className={`w-2 h-2 rounded-full mr-2 ${attempt.riskScore <= 3 ? 'bg-green-500' :
                                                                        attempt.riskScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`} />
                                                                <span className="text-sm text-gray-900">{attempt.riskScore}/10</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(attempt.timestamp)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Compliance Tab */}
                        {selectedTab === 'compliance' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {complianceChecks.map((check) => (
                                        <div key={check.id} className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-4 h-4 rounded-full ${check.status === 'compliant' ? 'bg-green-500' :
                                                            check.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <h3 className="text-lg font-medium text-gray-900">{check.name}</h3>
                                                </div>
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(check.status)}`}>
                                                    {check.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">{check.description}</p>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Overall Score</span>
                                                    <span className="text-lg font-semibold text-gray-900">{check.score}%</span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${check.score >= 90 ? 'bg-green-500' :
                                                                check.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${check.score}%` }}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Total</p>
                                                        <p className="font-medium text-gray-900">{check.requirements}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Passed</p>
                                                        <p className="font-medium text-green-600">{check.passed}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Failed</p>
                                                        <p className="font-medium text-red-600">{check.failed}</p>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Last checked: {formatDate(check.lastCheck)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Policies Tab */}
                        {selectedTab === 'policies' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security Policy Overview</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">Password Policy</h4>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Minimum 12 characters</li>
                                                <li>• Mixed case letters required</li>
                                                <li>• Numbers and symbols required</li>
                                                <li>• No dictionary words</li>
                                                <li>• 90-day rotation policy</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">Access Control</h4>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Role-based permissions</li>
                                                <li>• Principle of least privilege</li>
                                                <li>• Regular access reviews</li>
                                                <li>• Automatic session timeout</li>
                                                <li>• IP-based restrictions</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">Data Protection</h4>
                                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• End-to-end encryption</li>
                                                <li>• Data classification system</li>
                                                <li>• Backup encryption</li>
                                                <li>• Data retention policies</li>
                                                <li>• GDPR compliance</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">Incident Response</h4>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• 24/7 monitoring</li>
                                                <li>• Automated alerting</li>
                                                <li>• Response team protocols</li>
                                                <li>• Forensic capabilities</li>
                                                <li>• Communication plans</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
