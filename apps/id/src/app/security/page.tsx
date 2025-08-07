'use client';

import React, { useState } from 'react';
import {
    Shield,
    Lock,
    Unlock,
    Key,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    Users,
    Clock,
    Activity,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    RefreshCw,
    Download,
    Upload,
    Plus,
    Edit3,
    Trash2,
    MoreVertical,
    Bell,
    Flag,
    Info,
    Globe,
    Smartphone,
    Monitor,
    MapPin,
    Calendar,
    Database,
    Server,
    Cloud,
    Wifi,
    WifiOff,
    Zap,
    FileText,
    List,
    Grid,
    Copy,
    ExternalLink,
    UserCheck,
    UserX,
    Fingerprint,
    Scan,
    Bug,
    Target,
    Radio,
    Crosshair
} from 'lucide-react';

interface SecurityPolicy {
    id: string;
    name: string;
    category: 'access' | 'password' | 'session' | 'data' | 'network';
    description: string;
    status: 'active' | 'inactive' | 'draft';
    compliance: string[];
    lastUpdated: string;
    appliesTo: number;
    violations: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityIncident {
    id: string;
    title: string;
    type: 'breach' | 'vulnerability' | 'policy_violation' | 'suspicious_activity' | 'compliance_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    affectedUsers: number;
    detectedAt: string;
    resolvedAt?: string;
    assignedTo: string;
    description: string;
    impact: string;
    source: string;
}

interface ComplianceFramework {
    id: string;
    name: string;
    description: string;
    requirements: number;
    compliant: number;
    nonCompliant: number;
    lastAssessment: string;
    nextReview: string;
    status: 'compliant' | 'non_compliant' | 'partial' | 'pending';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetric {
    name: string;
    value: number;
    unit: string;
    change: number;
    status: 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
}

export default function SecurityPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    const securityPolicies: SecurityPolicy[] = [
        {
            id: '1',
            name: 'Multi-Factor Authentication Policy',
            category: 'access',
            description: 'Mandatory MFA for all administrative accounts and sensitive operations',
            status: 'active',
            compliance: ['SOX', 'PCI DSS', 'GDPR'],
            lastUpdated: '2 days ago',
            appliesTo: 150,
            violations: 3,
            severity: 'high'
        },
        {
            id: '2',
            name: 'Password Complexity Requirements',
            category: 'password',
            description: 'Minimum 12 characters with complexity requirements and rotation policy',
            status: 'active',
            compliance: ['ISO 27001', 'NIST'],
            lastUpdated: '1 week ago',
            appliesTo: 500,
            violations: 12,
            severity: 'medium'
        },
        {
            id: '3',
            name: 'Session Timeout Policy',
            category: 'session',
            description: 'Automatic session termination after 30 minutes of inactivity',
            status: 'active',
            compliance: ['PCI DSS'],
            lastUpdated: '3 days ago',
            appliesTo: 500,
            violations: 0,
            severity: 'low'
        },
        {
            id: '4',
            name: 'Data Encryption Standards',
            category: 'data',
            description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit',
            status: 'active',
            compliance: ['HIPAA', 'GDPR', 'SOX'],
            lastUpdated: '1 day ago',
            appliesTo: 50,
            violations: 0,
            severity: 'critical'
        },
        {
            id: '5',
            name: 'Network Access Control',
            category: 'network',
            description: 'Zero-trust network access with device verification and geo-restrictions',
            status: 'draft',
            compliance: ['NIST', 'ISO 27001'],
            lastUpdated: '5 days ago',
            appliesTo: 0,
            violations: 0,
            severity: 'high'
        }
    ];

    const securityIncidents: SecurityIncident[] = [
        {
            id: '1',
            title: 'Multiple Failed Login Attempts',
            type: 'suspicious_activity',
            severity: 'medium',
            status: 'investigating',
            affectedUsers: 1,
            detectedAt: '2 hours ago',
            assignedTo: 'Security Team',
            description: 'Unusual number of failed login attempts from multiple IP addresses',
            impact: 'Potential brute force attack attempt',
            source: 'Authentication System'
        },
        {
            id: '2',
            title: 'Unauthorized API Access Attempt',
            type: 'breach',
            severity: 'high',
            status: 'open',
            affectedUsers: 0,
            detectedAt: '6 hours ago',
            assignedTo: 'John Smith',
            description: 'API access attempted with invalid credentials from suspicious IP',
            impact: 'No data accessed, blocked by security controls',
            source: 'API Gateway'
        },
        {
            id: '3',
            title: 'Password Policy Violation',
            type: 'policy_violation',
            severity: 'low',
            status: 'resolved',
            affectedUsers: 5,
            detectedAt: '1 day ago',
            resolvedAt: '18 hours ago',
            assignedTo: 'Alice Johnson',
            description: 'Users found using weak passwords not meeting policy requirements',
            impact: 'Users forced to reset passwords',
            source: 'Password Audit'
        },
        {
            id: '4',
            title: 'GDPR Compliance Gap',
            type: 'compliance_issue',
            severity: 'medium',
            status: 'open',
            affectedUsers: 100,
            detectedAt: '3 days ago',
            assignedTo: 'Compliance Team',
            description: 'Data retention period exceeded for some user records',
            impact: 'Potential GDPR violation, requires data cleanup',
            source: 'Compliance Audit'
        }
    ];

    const complianceFrameworks: ComplianceFramework[] = [
        {
            id: '1',
            name: 'SOX (Sarbanes-Oxley)',
            description: 'Financial reporting and internal controls compliance',
            requirements: 25,
            compliant: 23,
            nonCompliant: 2,
            lastAssessment: '1 month ago',
            nextReview: 'In 2 months',
            status: 'partial',
            riskLevel: 'medium'
        },
        {
            id: '2',
            name: 'GDPR',
            description: 'European Union data protection regulation compliance',
            requirements: 35,
            compliant: 32,
            nonCompliant: 3,
            lastAssessment: '2 weeks ago',
            nextReview: 'In 6 weeks',
            status: 'partial',
            riskLevel: 'medium'
        },
        {
            id: '3',
            name: 'ISO 27001',
            description: 'Information security management system standard',
            requirements: 50,
            compliant: 48,
            nonCompliant: 2,
            lastAssessment: '3 weeks ago',
            nextReview: 'In 9 weeks',
            status: 'compliant',
            riskLevel: 'low'
        },
        {
            id: '4',
            name: 'PCI DSS',
            description: 'Payment card industry data security standard',
            requirements: 12,
            compliant: 12,
            nonCompliant: 0,
            lastAssessment: '1 week ago',
            nextReview: 'In 11 weeks',
            status: 'compliant',
            riskLevel: 'low'
        }
    ];

    const securityMetrics: SecurityMetric[] = [
        { name: 'Security Score', value: 92, unit: '%', change: 2.3, status: 'good', trend: 'up' },
        { name: 'Incidents This Month', value: 4, unit: '', change: -2, status: 'good', trend: 'down' },
        { name: 'Policy Violations', value: 15, unit: '', change: -5, status: 'warning', trend: 'down' },
        { name: 'MFA Adoption', value: 87, unit: '%', change: 3.1, status: 'good', trend: 'up' },
        { name: 'Vulnerability Score', value: 7.2, unit: '/10', change: -0.8, status: 'warning', trend: 'down' },
        { name: 'Compliance Rate', value: 94, unit: '%', change: 1.2, status: 'good', trend: 'up' }
    ];

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'access': return <Key className="w-4 h-4 text-blue-600" />;
            case 'password': return <Lock className="w-4 h-4 text-green-600" />;
            case 'session': return <Clock className="w-4 h-4 text-purple-600" />;
            case 'data': return <Database className="w-4 h-4 text-indigo-600" />;
            case 'network': return <Globe className="w-4 h-4 text-orange-600" />;
            default: return <Shield className="w-4 h-4 text-gray-600" />;
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': case 'compliant': case 'resolved': case 'closed':
                return 'bg-green-100 text-green-800';
            case 'inactive': case 'draft': case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'open': case 'investigating': case 'partial': case 'non_compliant':
                return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getIncidentIcon = (type: string) => {
        switch (type) {
            case 'breach': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'vulnerability': return <Bug className="w-4 h-4 text-orange-600" />;
            case 'policy_violation': return <Flag className="w-4 h-4 text-yellow-600" />;
            case 'suspicious_activity': return <Eye className="w-4 h-4 text-purple-600" />;
            case 'compliance_issue': return <FileText className="w-4 h-4 text-blue-600" />;
            default: return <Shield className="w-4 h-4 text-gray-600" />;
        }
    };

    const tabs = [
        { id: 'overview', name: 'Security Overview', icon: Shield },
        { id: 'policies', name: 'Security Policies', icon: Lock },
        { id: 'incidents', name: 'Security Incidents', icon: AlertTriangle },
        { id: 'compliance', name: 'Compliance', icon: CheckCircle },
        { id: 'monitoring', name: 'Monitoring', icon: Activity }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and manage security policies, incidents, and compliance across your organization
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Security Report
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report Incident
                    </button>
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

            {/* Security Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Security Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {securityMetrics.map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-2xl font-bold text-gray-900">{metric.value}{metric.unit}</div>
                                    <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' :
                                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                            metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                                                <Activity className="w-4 h-4" />}
                                        <span className="ml-1">{Math.abs(metric.change)}%</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">{metric.name}</div>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                                        metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {metric.status}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Critical Alerts */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    2 Critical Security Issues Require Attention
                                </h3>
                                <p className="text-sm text-red-600 mt-1">
                                    High-severity incidents detected. Immediate action required.
                                </p>
                            </div>
                            <button className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                                Review Issues
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Incidents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Security Incidents</h2>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View All
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {securityIncidents.slice(0, 3).map((incident) => (
                                    <div key={incident.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIncidentIcon(incident.type)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900">{incident.title}</h3>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                                        {incident.severity}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1">{incident.description}</p>

                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>Detected {incident.detectedAt}</span>
                                                    <span>Assigned to {incident.assignedTo}</span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                                        {incident.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Policy Compliance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Policy Compliance</h2>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View Policies
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {securityPolicies.slice(0, 4).map((policy) => (
                                        <div key={policy.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getCategoryIcon(policy.category)}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {policy.appliesTo} users • {policy.violations} violations
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                                                    {policy.status}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(policy.severity)}`}>
                                                    {policy.severity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Policies Tab */}
            {activeTab === 'policies' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Security Policies</h2>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search policies..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowPolicyModal(true)}
                                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Policy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {securityPolicies.map((policy) => (
                                <div key={policy.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {getCategoryIcon(policy.category)}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{policy.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                                                        {policy.status}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(policy.severity)}`}>
                                                        {policy.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Applies to {policy.appliesTo} users
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {policy.violations} violations
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Updated {policy.lastUpdated}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    {policy.compliance.map((framework, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {framework}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Security Incidents Tab */}
            {activeTab === 'incidents' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Security Incidents</h2>
                                <div className="flex items-center space-x-3">
                                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="all">All Severities</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="all">All Status</option>
                                        <option value="open">Open</option>
                                        <option value="investigating">Investigating</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {securityIncidents.map((incident) => (
                                <div key={incident.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {getIncidentIcon(incident.type)}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{incident.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                                        {incident.severity}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                                        {incident.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {incident.affectedUsers} users affected
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Detected {incident.detectedAt}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Assigned to {incident.assignedTo}
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Impact:</span> {incident.impact}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Source:</span> {incident.source}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedIncident(incident)}
                                                className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                            >
                                                Details
                                            </button>
                                            <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                                Assign
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {complianceFrameworks.map((framework) => (
                            <div key={framework.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">{framework.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                                        {framework.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{framework.description}</p>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Compliant</span>
                                        <span className="font-medium text-green-600">{framework.compliant}/{framework.requirements}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(framework.compliant / framework.requirements) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Last assessment: {framework.lastAssessment}</span>
                                        <span>Next review: {framework.nextReview}</span>
                                    </div>
                                </div>

                                <button className="mt-4 w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Security Monitoring Dashboard</h2>
                        </div>

                        <div className="p-6">
                            <div className="h-96 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Real-time security monitoring charts would be rendered here</p>
                                    <p className="text-sm">Integration with monitoring systems and charting library required</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
