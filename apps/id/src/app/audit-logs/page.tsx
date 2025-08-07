'use client';

import React, { useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Calendar,
    Clock,
    User,
    Shield,
    Activity,
    Eye,
    Settings,
    Database,
    Server,
    Globe,
    Smartphone,
    Monitor,
    MapPin,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    RefreshCw,
    MoreVertical,
    ArrowUpDown,
    ChevronDown,
    ExternalLink,
    Copy,
    Archive,
    Trash2,
    Plus,
    Edit3,
    Flag,
    Target,
    Zap,
    Lock,
    Unlock,
    Key,
    UserCheck,
    UserX,
    LogIn,
    LogOut,
    RotateCcw,
    AlertCircle,
    TrendingUp,
    BarChart3,
    PieChart,
    List,
    Grid,
    Calendar as CalendarIcon,
    Clock3,
    HardDrive,
    Wifi,
    CloudOff
} from 'lucide-react';

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'security' | 'user_management' | 'configuration';
    severity: 'low' | 'medium' | 'high' | 'critical';
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    resource: string;
    details: string;
    outcome: 'success' | 'failure' | 'warning';
    ipAddress: string;
    userAgent: string;
    location: string;
    sessionId: string;
    metadata?: Record<string, any>;
}

interface AuditFilter {
    dateRange: {
        start: string;
        end: string;
    };
    categories: string[];
    severities: string[];
    outcomes: string[];
    users: string[];
    resources: string[];
    searchQuery: string;
}

interface AuditStats {
    totalEvents: number;
    todayEvents: number;
    successRate: number;
    criticalEvents: number;
    topUsers: Array<{ name: string; count: number }>;
    topActions: Array<{ action: string; count: number }>;
    categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
}

export default function AuditLogsPage() {
    const [activeTab, setActiveTab] = useState('logs');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [exportModal, setExportModal] = useState(false);

    const [filters, setFilters] = useState<AuditFilter>({
        dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        },
        categories: [],
        severities: [],
        outcomes: [],
        users: [],
        resources: [],
        searchQuery: ''
    });

    const auditLogs: AuditLog[] = [
        {
            id: '1',
            timestamp: '2025-08-06T14:30:00Z',
            action: 'User Login',
            category: 'authentication',
            severity: 'low',
            user: {
                id: 'user1',
                name: 'John Smith',
                email: 'john.smith@company.com',
                role: 'Senior Developer'
            },
            resource: 'Authentication Service',
            details: 'Successful login with MFA',
            outcome: 'success',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'New York, US',
            sessionId: 'sess_123456789',
            metadata: {
                mfaMethod: 'TOTP',
                deviceFingerprint: 'fp_abcd1234'
            }
        },
        {
            id: '2',
            timestamp: '2025-08-06T14:25:00Z',
            action: 'Password Reset',
            category: 'security',
            severity: 'medium',
            user: {
                id: 'user2',
                name: 'Alice Johnson',
                email: 'alice.johnson@company.com',
                role: 'Admin'
            },
            resource: 'User Management',
            details: 'Password reset requested for user ID: user123',
            outcome: 'success',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            location: 'San Francisco, US',
            sessionId: 'sess_987654321',
            metadata: {
                targetUserId: 'user123',
                resetMethod: 'email'
            }
        },
        {
            id: '3',
            timestamp: '2025-08-06T14:20:00Z',
            action: 'Failed Login Attempt',
            category: 'authentication',
            severity: 'high',
            user: {
                id: 'unknown',
                name: 'Unknown User',
                email: 'suspicious@example.com',
                role: 'None'
            },
            resource: 'Authentication Service',
            details: 'Multiple failed login attempts detected',
            outcome: 'failure',
            ipAddress: '203.0.113.42',
            userAgent: 'curl/7.68.0',
            location: 'Unknown',
            sessionId: 'N/A',
            metadata: {
                attemptCount: 5,
                lastAttempt: '2025-08-06T14:20:00Z',
                blocked: true
            }
        },
        {
            id: '4',
            timestamp: '2025-08-06T14:15:00Z',
            action: 'Role Assignment',
            category: 'authorization',
            severity: 'medium',
            user: {
                id: 'admin1',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@company.com',
                role: 'System Admin'
            },
            resource: 'User Role Management',
            details: 'Assigned "Developer" role to user Mike Chen',
            outcome: 'success',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Chicago, US',
            sessionId: 'sess_456789123',
            metadata: {
                targetUserId: 'user456',
                previousRole: 'Viewer',
                newRole: 'Developer'
            }
        },
        {
            id: '5',
            timestamp: '2025-08-06T14:10:00Z',
            action: 'Data Export',
            category: 'data_access',
            severity: 'high',
            user: {
                id: 'user3',
                name: 'Mike Chen',
                email: 'mike.chen@company.com',
                role: 'Data Analyst'
            },
            resource: 'User Database',
            details: 'Exported user data report containing 1,000 records',
            outcome: 'success',
            ipAddress: '192.168.1.103',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Seattle, US',
            sessionId: 'sess_789123456',
            metadata: {
                recordCount: 1000,
                exportFormat: 'CSV',
                includesPII: true
            }
        },
        {
            id: '6',
            timestamp: '2025-08-06T14:05:00Z',
            action: 'System Configuration Change',
            category: 'configuration',
            severity: 'critical',
            user: {
                id: 'admin2',
                name: 'David Rodriguez',
                email: 'david.rodriguez@company.com',
                role: 'System Admin'
            },
            resource: 'Authentication Settings',
            details: 'Modified MFA requirement policy',
            outcome: 'success',
            ipAddress: '192.168.1.104',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            location: 'Austin, US',
            sessionId: 'sess_321654987',
            metadata: {
                previousSetting: 'MFA Optional',
                newSetting: 'MFA Required',
                affectedUsers: 500
            }
        }
    ];

    const auditStats: AuditStats = {
        totalEvents: 15247,
        todayEvents: 234,
        successRate: 94.5,
        criticalEvents: 12,
        topUsers: [
            { name: 'Sarah Wilson', count: 45 },
            { name: 'John Smith', count: 38 },
            { name: 'Alice Johnson', count: 32 },
            { name: 'Mike Chen', count: 28 },
            { name: 'David Rodriguez', count: 22 }
        ],
        topActions: [
            { action: 'User Login', count: 1245 },
            { action: 'Data Access', count: 856 },
            { action: 'Configuration Change', count: 234 },
            { action: 'Role Assignment', count: 178 },
            { action: 'Password Reset', count: 156 }
        ],
        categoryBreakdown: [
            { category: 'Authentication', count: 8945, percentage: 58.7 },
            { category: 'Data Access', count: 3421, percentage: 22.4 },
            { category: 'Authorization', count: 1567, percentage: 10.3 },
            { category: 'Configuration', count: 856, percentage: 5.6 },
            { category: 'Security', count: 458, percentage: 3.0 }
        ]
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'authentication': return <Key className="w-4 h-4 text-blue-600" />;
            case 'authorization': return <Shield className="w-4 h-4 text-green-600" />;
            case 'data_access': return <Database className="w-4 h-4 text-purple-600" />;
            case 'system': return <Server className="w-4 h-4 text-gray-600" />;
            case 'security': return <Lock className="w-4 h-4 text-red-600" />;
            case 'user_management': return <User className="w-4 h-4 text-indigo-600" />;
            case 'configuration': return <Settings className="w-4 h-4 text-orange-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOutcomeIcon = (outcome: string) => {
        switch (outcome) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failure': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'failure': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const tabs = [
        { id: 'logs', name: 'Audit Logs', icon: FileText },
        { id: 'analytics', name: 'Analytics', icon: BarChart3 },
        { id: 'compliance', name: 'Compliance Reports', icon: Shield },
        { id: 'settings', name: 'Audit Settings', icon: Settings }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and track all system activities, user actions, and security events
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                    <button
                        onClick={() => setExportModal(true)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">All Categories</option>
                                <option value="authentication">Authentication</option>
                                <option value="authorization">Authorization</option>
                                <option value="data_access">Data Access</option>
                                <option value="system">System</option>
                                <option value="security">Security</option>
                                <option value="user_management">User Management</option>
                                <option value="configuration">Configuration</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">All Outcomes</option>
                                <option value="success">Success</option>
                                <option value="failure">Failure</option>
                                <option value="warning">Warning</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs by action, user, resource, or details..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => setFilters({
                                dateRange: {
                                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    end: new Date().toISOString().split('T')[0]
                                },
                                categories: [],
                                severities: [],
                                outcomes: [],
                                users: [],
                                resources: [],
                                searchQuery: ''
                            })}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Reset Filters
                        </button>
                        <div className="text-sm text-gray-600">
                            {auditLogs.length} events found
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'logs' && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{auditStats.totalEvents.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Total Events</div>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{auditStats.todayEvents}</div>
                                    <div className="text-sm text-gray-500">Today's Events</div>
                                </div>
                                <Clock className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{auditStats.successRate}%</div>
                                    <div className="text-sm text-gray-500">Success Rate</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{auditStats.criticalEvents}</div>
                                    <div className="text-sm text-gray-500">Critical Events</div>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Audit Events</h2>
                                <button className="flex items-center text-gray-600 hover:text-gray-800">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button className="flex items-center space-x-1 hover:text-gray-700">
                                                <span>Timestamp</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resource
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outcome
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {getCategoryIcon(log.category)}
                                                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                                                        <div className="text-sm text-gray-500">{log.user.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.resource}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {getOutcomeIcon(log.outcome)}
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                                                        {log.outcome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Users */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {auditStats.topUsers.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{user.count} events</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Most Common Actions</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {auditStats.topActions.map((action, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">{action.action}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{action.count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Event Categories</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {auditStats.categoryBreakdown.map((category, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{category.category}</span>
                                            <span className="text-sm text-gray-600">{category.count.toLocaleString()} ({category.percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${category.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Reports Tab */}
            {activeTab === 'compliance' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Compliance Reports</h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">SOX Compliance Report</h3>
                                    <p className="text-sm text-gray-600 mb-4">Financial controls and access auditing</p>
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Generate Report
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">GDPR Compliance Report</h3>
                                    <p className="text-sm text-gray-600 mb-4">Data access and privacy auditing</p>
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Generate Report
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">ISO 27001 Report</h3>
                                    <p className="text-sm text-gray-600 mb-4">Information security management</p>
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Audit Configuration</h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Policies</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Log all authentication events</span>
                                            <input type="checkbox" defaultChecked className="rounded" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Log data access events</span>
                                            <input type="checkbox" defaultChecked className="rounded" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Log configuration changes</span>
                                            <input type="checkbox" defaultChecked className="rounded" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Log failed access attempts</span>
                                            <input type="checkbox" defaultChecked className="rounded" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Settings</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-4">
                                            <label className="text-sm text-gray-700 w-32">Log retention period:</label>
                                            <select className="px-3 py-2 border border-gray-300 rounded-lg">
                                                <option value="30">30 days</option>
                                                <option value="90">90 days</option>
                                                <option value="365" selected>1 year</option>
                                                <option value="2555">7 years</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <label className="text-sm text-gray-700 w-32">Archive after:</label>
                                            <select className="px-3 py-2 border border-gray-300 rounded-lg">
                                                <option value="90">90 days</option>
                                                <option value="180" selected>6 months</option>
                                                <option value="365">1 year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Audit Log Details</h2>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Timestamp</label>
                                    <div className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Action</label>
                                    <div className="text-sm text-gray-900">{selectedLog.action}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">User</label>
                                    <div className="text-sm text-gray-900">{selectedLog.user.name} ({selectedLog.user.email})</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <div className="text-sm text-gray-900">{selectedLog.user.role}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Resource</label>
                                    <div className="text-sm text-gray-900">{selectedLog.resource}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Outcome</label>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(selectedLog.outcome)}`}>
                                        {selectedLog.outcome}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                                    <div className="text-sm text-gray-900">{selectedLog.ipAddress}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Location</label>
                                    <div className="text-sm text-gray-900">{selectedLog.location}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Details</label>
                                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">User Agent</label>
                                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg break-all">{selectedLog.userAgent}</div>
                            </div>

                            {selectedLog.metadata && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Additional Metadata</label>
                                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                        <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                Export Event
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {exportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Export Audit Logs</h2>
                                <button
                                    onClick={() => setExportModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                    <option value="pdf">PDF Report</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-sm text-gray-700">Include metadata</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setExportModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setExportModal(false)}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
