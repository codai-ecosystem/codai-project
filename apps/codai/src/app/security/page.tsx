'use client';

import React, { useState } from 'react';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Play,
    Download,
    Settings,
    Eye,
    RefreshCw,
    FileText,
    Code,
    Lock,
    Key,
    Database,
    Server,
    Globe,
    Bug,
    Zap,
    Target,
    BarChart3,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

export default function SecurityScanPage() {
    const [selectedSeverity, setSelectedSeverity] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const securityScans = [
        {
            id: 1,
            name: 'CODAI Backend Security Scan',
            type: 'sast',
            status: 'completed',
            severity: 'high',
            lastRun: '2024-01-15 14:30:00',
            duration: '4m 32s',
            findings: {
                critical: 2,
                high: 5,
                medium: 12,
                low: 8,
                info: 3
            },
            repository: 'codai-backend',
            branch: 'main',
            commit: 'a1b2c3d',
            scanProgress: 100,
            trend: 'up'
        },
        {
            id: 2,
            name: 'Dependency Vulnerability Scan',
            type: 'dependency',
            status: 'completed',
            severity: 'medium',
            lastRun: '2024-01-15 16:15:00',
            duration: '2m 18s',
            findings: {
                critical: 0,
                high: 2,
                medium: 7,
                low: 15,
                info: 5
            },
            repository: 'codai-frontend',
            branch: 'develop',
            commit: 'e4f5g6h',
            scanProgress: 100,
            trend: 'down'
        },
        {
            id: 3,
            name: 'Infrastructure Security Scan',
            type: 'infrastructure',
            status: 'running',
            severity: 'medium',
            lastRun: '2024-01-15 17:00:00',
            duration: '1m 45s',
            findings: {
                critical: 0,
                high: 1,
                medium: 3,
                low: 6,
                info: 2
            },
            repository: 'codai-infrastructure',
            branch: 'main',
            commit: 'i7j8k9l',
            scanProgress: 67,
            trend: 'stable'
        },
        {
            id: 4,
            name: 'API Security Assessment',
            type: 'dast',
            status: 'completed',
            severity: 'low',
            lastRun: '2024-01-15 12:45:00',
            duration: '8m 12s',
            findings: {
                critical: 0,
                high: 0,
                medium: 2,
                low: 4,
                info: 1
            },
            repository: 'codai-api',
            branch: 'main',
            commit: 'm1n2o3p',
            scanProgress: 100,
            trend: 'down'
        },
        {
            id: 5,
            name: 'Secrets Detection Scan',
            type: 'secrets',
            status: 'failed',
            severity: 'critical',
            lastRun: '2024-01-15 11:30:00',
            duration: '0m 32s',
            findings: {
                critical: 1,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            },
            repository: 'codai-config',
            branch: 'main',
            commit: 'q4r5s6t',
            scanProgress: 100,
            trend: 'up'
        },
        {
            id: 6,
            name: 'Container Security Scan',
            type: 'container',
            status: 'queued',
            severity: 'info',
            lastRun: null,
            duration: null,
            findings: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            },
            repository: 'codai-docker',
            branch: 'main',
            commit: 'u7v8w9x',
            scanProgress: 0,
            trend: 'stable'
        }
    ];

    const vulnerabilityDetails = [
        {
            id: 'VULN-001',
            title: 'SQL Injection in User Authentication',
            severity: 'critical',
            type: 'sast',
            description: 'Unsanitized user input in login endpoint allows SQL injection attacks',
            file: 'src/auth/login.js',
            line: 42,
            cwe: 'CWE-89',
            cvss: 9.1,
            status: 'open',
            assignee: 'Alice Smith',
            repository: 'codai-backend',
            firstDetected: '2024-01-15 14:30:00',
            age: '2 hours'
        },
        {
            id: 'VULN-002',
            title: 'Cross-Site Scripting (XSS) in Comment System',
            severity: 'high',
            type: 'sast',
            description: 'User-generated content not properly escaped before rendering',
            file: 'src/components/CommentForm.tsx',
            line: 67,
            cwe: 'CWE-79',
            cvss: 7.2,
            status: 'in_progress',
            assignee: 'Bob Johnson',
            repository: 'codai-frontend',
            firstDetected: '2024-01-14 10:15:00',
            age: '1 day'
        },
        {
            id: 'VULN-003',
            title: 'Hardcoded API Key in Configuration',
            severity: 'critical',
            type: 'secrets',
            description: 'Production API key found hardcoded in configuration file',
            file: 'config/production.env',
            line: 12,
            cwe: 'CWE-798',
            cvss: 8.8,
            status: 'open',
            assignee: 'Carol Wilson',
            repository: 'codai-config',
            firstDetected: '2024-01-15 11:30:00',
            age: '6 hours'
        },
        {
            id: 'VULN-004',
            title: 'Outdated Dependency with Known Vulnerabilities',
            severity: 'high',
            type: 'dependency',
            description: 'lodash@4.17.15 contains known security vulnerabilities',
            file: 'package.json',
            line: 23,
            cwe: 'CWE-1104',
            cvss: 6.5,
            status: 'resolved',
            assignee: 'David Brown',
            repository: 'codai-frontend',
            firstDetected: '2024-01-12 09:20:00',
            age: '3 days'
        }
    ];

    const scanTypes = [
        { id: 'sast', name: 'Static Analysis (SAST)', icon: Code, color: 'text-blue-600 bg-blue-100' },
        { id: 'dast', name: 'Dynamic Analysis (DAST)', icon: Globe, color: 'text-green-600 bg-green-100' },
        { id: 'dependency', name: 'Dependency Scan', icon: Database, color: 'text-purple-600 bg-purple-100' },
        { id: 'secrets', name: 'Secrets Detection', icon: Key, color: 'text-red-600 bg-red-100' },
        { id: 'infrastructure', name: 'Infrastructure', icon: Server, color: 'text-orange-600 bg-orange-100' },
        { id: 'container', name: 'Container Scan', icon: Lock, color: 'text-indigo-600 bg-indigo-100' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'queued': return <Clock className="w-4 h-4 text-gray-400" />;
            default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'running': return 'text-blue-600 bg-blue-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'queued': return 'text-gray-600 bg-gray-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

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
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'low': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />;
            default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredScans = securityScans.filter(scan => {
        const matchesSeverity = selectedSeverity === 'all' || scan.severity === selectedSeverity;
        const matchesType = selectedType === 'all' || scan.type === selectedType;
        const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scan.repository.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSeverity && matchesType && matchesSearch;
    });

    const totalFindings = securityScans.reduce((total, scan) => ({
        critical: total.critical + scan.findings.critical,
        high: total.high + scan.findings.high,
        medium: total.medium + scan.findings.medium,
        low: total.low + scan.findings.low,
        info: total.info + scan.findings.info
    }), { critical: 0, high: 0, medium: 0, low: 0, info: 0 });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Scans</h1>
                    <p className="text-gray-600 mt-1">
                        Automated security vulnerability detection and analysis across your codebase
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Run Scan
                    </button>
                </div>
            </div>

            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-red-600">{totalFindings.critical}</div>
                            <div className="text-sm text-gray-500">Critical</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{totalFindings.high}</div>
                            <div className="text-sm text-gray-500">High</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">{totalFindings.medium}</div>
                            <div className="text-sm text-gray-500">Medium</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{totalFindings.low}</div>
                            <div className="text-sm text-gray-500">Low</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-600">{totalFindings.info}</div>
                            <div className="text-sm text-gray-500">Info</div>
                        </div>
                        <Shield className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Scan Types Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {scanTypes.map(type => {
                        const TypeIcon = type.icon;
                        const typeCount = securityScans.filter(scan => scan.type === type.id).length;

                        return (
                            <div key={type.id} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${type.color}`}>
                                    <TypeIcon className="w-6 h-6" />
                                </div>
                                <div className="text-lg font-bold text-gray-900">{typeCount}</div>
                                <div className="text-sm text-gray-500">{type.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search scans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="info">Info</option>
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        {scanTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                        Showing {filteredScans.length} of {securityScans.length} scans
                    </span>
                </div>
            </div>

            {/* Security Scans List */}
            <div className="space-y-4">
                {filteredScans.map((scan) => (
                    <div key={scan.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{scan.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                                            {getStatusIcon(scan.status)}
                                            <span className="ml-1">{scan.status}</span>
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(scan.severity)}`}>
                                            {scan.severity}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${scanTypes.find(t => t.id === scan.type)?.color || 'text-gray-600 bg-gray-100'
                                            }`}>
                                            {scanTypes.find(t => t.id === scan.type)?.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                        <span>Repository: {scan.repository}</span>
                                        <span>Branch: {scan.branch}</span>
                                        <span>Commit: {scan.commit}</span>
                                        {scan.lastRun && <span>Last run: {new Date(scan.lastRun).toLocaleString()}</span>}
                                        {scan.duration && <span>Duration: {scan.duration}</span>}
                                    </div>

                                    {scan.status === 'running' && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Scan Progress</span>
                                                <span className="text-gray-900 font-medium">{scan.scanProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${scan.scanProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {getTrendIcon(scan.trend)}
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Findings Summary */}
                            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-red-600">{scan.findings.critical}</div>
                                    <div className="text-xs text-gray-500">Critical</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-orange-600">{scan.findings.high}</div>
                                    <div className="text-xs text-gray-500">High</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-yellow-600">{scan.findings.medium}</div>
                                    <div className="text-xs text-gray-500">Medium</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{scan.findings.low}</div>
                                    <div className="text-xs text-gray-500">Low</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-600">{scan.findings.info}</div>
                                    <div className="text-xs text-gray-500">Info</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Vulnerabilities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Vulnerabilities</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vulnerability
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CVSS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assignee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Age
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vulnerabilityDetails.map((vuln) => (
                                <tr key={vuln.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{vuln.title}</div>
                                            <div className="text-sm text-gray-500">{vuln.id} • {vuln.cwe}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getSeverityIcon(vuln.severity)}
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                                                {vuln.severity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{vuln.file}</div>
                                        <div className="text-sm text-gray-500">Line {vuln.line}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-medium ${vuln.cvss >= 9 ? 'text-red-600' :
                                                vuln.cvss >= 7 ? 'text-orange-600' :
                                                    vuln.cvss >= 4 ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {vuln.cvss}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vuln.status === 'resolved' ? 'text-green-600 bg-green-100' :
                                                vuln.status === 'in_progress' ? 'text-blue-600 bg-blue-100' :
                                                    'text-red-600 bg-red-100'
                                            }`}>
                                            {vuln.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{vuln.assignee}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{vuln.age}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
