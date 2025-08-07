'use client';

import React, { useState } from 'react';
import {
    Clock,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    MapPin,
    Activity,
    Users,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Search,
    Filter,
    RefreshCw,
    Download,
    MoreVertical,
    Trash2,
    Lock,
    Unlock,
    Calendar,
    BarChart3,
    TrendingUp,
    TrendingDown,
    User,
    Wifi,
    WifiOff,
    Server,
    Database,
    Chrome,
    Firefox,
    Safari,
    Edge,
    Settings,
    Info,
    Bell,
    Flag,
    Copy,
    ExternalLink,
    Zap,
    LogOut,
    RotateCcw
} from 'lucide-react';

interface UserSession {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    ipAddress: string;
    location: string;
    country: string;
    city: string;
    startTime: string;
    lastActivity: string;
    duration: string;
    status: 'active' | 'idle' | 'expired' | 'terminated';
    authMethod: string;
    sessionToken: string;
    refreshToken?: string;
    permissions: string[];
    riskScore: number;
    isSuspicious: boolean;
    deviceFingerprint: string;
    userAgent: string;
}

interface SessionMetrics {
    totalSessions: number;
    activeSessions: number;
    idleSessions: number;
    expiredSessions: number;
    averageDuration: string;
    peakConcurrent: number;
    suspiciousSessions: number;
    deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
}

export default function SessionsPage() {
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDevice, setSelectedDevice] = useState('all');
    const [showSessionDetails, setShowSessionDetails] = useState(false);
    const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const sessions: UserSession[] = [
        {
            id: 'sess_001',
            userId: 'user_001',
            userEmail: 'john.doe@company.com',
            userName: 'John Doe',
            deviceType: 'desktop',
            browser: 'Chrome 91.0',
            os: 'Windows 10',
            ipAddress: '192.168.1.100',
            location: 'San Francisco, CA',
            country: 'United States',
            city: 'San Francisco',
            startTime: '2 hours ago',
            lastActivity: '5 minutes ago',
            duration: '1h 55m',
            status: 'active',
            authMethod: 'OAuth 2.0',
            sessionToken: 'eyJhbGciOiJIUzI1NiIs...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
            permissions: ['read', 'write', 'admin'],
            riskScore: 0.2,
            isSuspicious: false,
            deviceFingerprint: 'fp_desktop_chrome_001',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
            id: 'sess_002',
            userId: 'user_002',
            userEmail: 'alice.smith@company.com',
            userName: 'Alice Smith',
            deviceType: 'mobile',
            browser: 'Safari 14.0',
            os: 'iOS 14.6',
            ipAddress: '10.0.0.50',
            location: 'New York, NY',
            country: 'United States',
            city: 'New York',
            startTime: '4 hours ago',
            lastActivity: '15 minutes ago',
            duration: '3h 45m',
            status: 'idle',
            authMethod: 'LDAP',
            sessionToken: 'eyJhbGciOiJIUzI1NiIs...',
            permissions: ['read', 'write'],
            riskScore: 0.1,
            isSuspicious: false,
            deviceFingerprint: 'fp_mobile_safari_002',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)'
        },
        {
            id: 'sess_003',
            userId: 'user_003',
            userEmail: 'bob.wilson@company.com',
            userName: 'Bob Wilson',
            deviceType: 'tablet',
            browser: 'Firefox 89.0',
            os: 'Android 11',
            ipAddress: '172.16.0.25',
            location: 'London, UK',
            country: 'United Kingdom',
            city: 'London',
            startTime: '1 day ago',
            lastActivity: '2 hours ago',
            duration: '22h 30m',
            status: 'expired',
            authMethod: 'Password',
            sessionToken: 'expired',
            permissions: ['read'],
            riskScore: 0.3,
            isSuspicious: false,
            deviceFingerprint: 'fp_tablet_firefox_003',
            userAgent: 'Mozilla/5.0 (Android 11; Tablet) Gecko/20100101 Firefox/89.0'
        },
        {
            id: 'sess_004',
            userId: 'user_004',
            userEmail: 'sarah.jones@company.com',
            userName: 'Sarah Jones',
            deviceType: 'desktop',
            browser: 'Edge 91.0',
            os: 'Windows 11',
            ipAddress: '203.0.113.45',
            location: 'Tokyo, Japan',
            country: 'Japan',
            city: 'Tokyo',
            startTime: '3 hours ago',
            lastActivity: '1 hour ago',
            duration: '2h 15m',
            status: 'active',
            authMethod: 'MFA + OAuth',
            sessionToken: 'eyJhbGciOiJIUzI1NiIs...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
            permissions: ['read', 'write', 'admin', 'ai_admin'],
            riskScore: 0.8,
            isSuspicious: true,
            deviceFingerprint: 'fp_desktop_edge_004',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
            id: 'sess_005',
            userId: 'user_005',
            userEmail: 'mike.brown@company.com',
            userName: 'Mike Brown',
            deviceType: 'mobile',
            browser: 'Chrome 91.0',
            os: 'Android 12',
            ipAddress: '198.51.100.30',
            location: 'Sydney, Australia',
            country: 'Australia',
            city: 'Sydney',
            startTime: '6 hours ago',
            lastActivity: '3 hours ago',
            duration: '3h 10m',
            status: 'terminated',
            authMethod: 'API Key',
            sessionToken: 'terminated',
            permissions: ['read'],
            riskScore: 0.4,
            isSuspicious: false,
            deviceFingerprint: 'fp_mobile_chrome_005',
            userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36'
        }
    ];

    const sessionMetrics: SessionMetrics = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        idleSessions: sessions.filter(s => s.status === 'idle').length,
        expiredSessions: sessions.filter(s => s.status === 'expired').length,
        averageDuration: '2h 45m',
        peakConcurrent: 15,
        suspiciousSessions: sessions.filter(s => s.isSuspicious).length,
        deviceBreakdown: {
            desktop: sessions.filter(s => s.deviceType === 'desktop').length,
            mobile: sessions.filter(s => s.deviceType === 'mobile').length,
            tablet: sessions.filter(s => s.deviceType === 'tablet').length
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'idle': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            case 'terminated': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'idle': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'expired': return <XCircle className="w-4 h-4 text-gray-600" />;
            case 'terminated': return <Lock className="w-4 h-4 text-red-600" />;
            default: return <XCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'desktop': return <Monitor className="w-4 h-4" />;
            case 'mobile': return <Smartphone className="w-4 h-4" />;
            case 'tablet': return <Tablet className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const getBrowserIcon = (browser: string) => {
        if (browser.includes('Chrome')) return <Chrome className="w-4 h-4 text-blue-600" />;
        if (browser.includes('Firefox')) return <Firefox className="w-4 h-4 text-orange-600" />;
        if (browser.includes('Safari')) return <Safari className="w-4 h-4 text-gray-600" />;
        if (browser.includes('Edge')) return <Edge className="w-4 h-4 text-blue-600" />;
        return <Globe className="w-4 h-4 text-gray-600" />;
    };

    const getRiskColor = (riskScore: number) => {
        if (riskScore < 0.3) return 'text-green-600';
        if (riskScore < 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus;
        const matchesDevice = selectedDevice === 'all' || session.deviceType === selectedDevice;
        return matchesSearch && matchesStatus && matchesDevice;
    });

    const handleBulkAction = (action: string) => {
        console.log(`Performing ${action} on sessions:`, selectedSessions);
        setSelectedSessions([]);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and manage active user sessions across all devices and platforms
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Auto-refresh</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
                        <LogOut className="w-4 h-4 mr-2" />
                        Terminate All
                    </button>
                </div>
            </div>

            {/* Session Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.totalSessions}</div>
                            <div className="text-sm text-gray-500">Total Sessions</div>
                        </div>
                        <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.activeSessions}</div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.idleSessions}</div>
                            <div className="text-sm text-gray-500">Idle</div>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.suspiciousSessions}</div>
                            <div className="text-sm text-gray-500">Suspicious</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.deviceBreakdown.desktop}</div>
                            <div className="text-sm text-gray-500">Desktop</div>
                        </div>
                        <Monitor className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.deviceBreakdown.mobile}</div>
                            <div className="text-sm text-gray-500">Mobile</div>
                        </div>
                        <Smartphone className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{sessionMetrics.averageDuration}</div>
                            <div className="text-sm text-gray-500">Avg Duration</div>
                        </div>
                        <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Suspicious Sessions Alert */}
            {sessionMetrics.suspiciousSessions > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">
                                {sessionMetrics.suspiciousSessions} Suspicious Session{sessionMetrics.suspiciousSessions > 1 ? 's' : ''} Detected
                            </h3>
                            <p className="text-sm text-red-600 mt-1">
                                High-risk sessions detected. Please review and take appropriate action.
                            </p>
                        </div>
                        <button className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            Review Now
                        </button>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search sessions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="idle">Idle</option>
                                <option value="expired">Expired</option>
                                <option value="terminated">Terminated</option>
                            </select>

                            <select
                                value={selectedDevice}
                                onChange={(e) => setSelectedDevice(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Devices</option>
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile</option>
                                <option value="tablet">Tablet</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            {selectedSessions.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{selectedSessions.length} selected</span>
                                    <button
                                        onClick={() => handleBulkAction('terminate')}
                                        className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                                    >
                                        Terminate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('extend')}
                                        className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                    >
                                        Extend
                                    </button>
                                </div>
                            )}

                            <button className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="divide-y divide-gray-200">
                    {filteredSessions.map((session) => (
                        <div key={session.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedSessions.includes(session.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedSessions([...selectedSessions, session.id]);
                                        } else {
                                            setSelectedSessions(selectedSessions.filter(id => id !== session.id));
                                        }
                                    }}
                                    className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />

                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-gray-900">{session.userName}</h3>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(session.status)}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            {session.isSuspicious && (
                                                <div className="flex items-center space-x-1">
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Suspicious
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-6 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="w-3 h-3 mr-1" />
                                                {session.userEmail}
                                            </div>
                                            <div className="flex items-center">
                                                {getDeviceIcon(session.deviceType)}
                                                <span className="ml-1">{session.deviceType}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {getBrowserIcon(session.browser)}
                                                <span className="ml-1">{session.browser}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {session.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Duration: {session.duration}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Globe className="w-3 h-3" />
                                                <span>{session.ipAddress}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Shield className="w-3 h-3" />
                                                <span>{session.authMethod}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs">
                                                <span className="text-gray-500">Risk:</span>
                                                <span className={`font-medium ${getRiskColor(session.riskScore)}`}>
                                                    {(session.riskScore * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Activity className="w-3 h-3" />
                                                <span>Last: {session.lastActivity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedSession(session);
                                            setShowSessionDetails(true);
                                        }}
                                        className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                    >
                                        Details
                                    </button>
                                    {session.status === 'active' && (
                                        <button className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50">
                                            Terminate
                                        </button>
                                    )}
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSessions.length === 0 && (
                    <div className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No sessions found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Session Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Session Distribution</h2>
                    </div>
                    <div className="p-6">
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Session distribution chart would be rendered here</p>
                                <p className="text-sm">Integration with charting library required</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Geographic Sessions</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[
                                { country: 'United States', sessions: 2, percentage: 40 },
                                { country: 'United Kingdom', sessions: 1, percentage: 20 },
                                { country: 'Japan', sessions: 1, percentage: 20 },
                                { country: 'Australia', sessions: 1, percentage: 20 }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900">{item.country}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{item.sessions} sessions</span>
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
