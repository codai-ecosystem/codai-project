import React from 'react';
import {
    Shield,
    Lock,
    Key,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Scan,
    FileShield,
    UserCheck,
    Globe,
    Server,
    Database,
    Settings,
    RefreshCw,
    Download
} from 'lucide-react';

export function SecurityTab() {
    const securityOverview = [
        { label: 'Security Score', value: '94/100', status: 'good', icon: Shield },
        { label: 'Vulnerabilities', value: '3 Low', status: 'warning', icon: AlertTriangle },
        { label: 'Compliance', value: '98.5%', status: 'good', icon: CheckCircle },
        { label: 'Last Scan', value: '2h ago', status: 'info', icon: Clock }
    ];

    const vulnerabilities = [
        {
            id: 'CVE-2024-001',
            severity: 'low',
            title: 'Outdated SSL certificate on staging server',
            affected: 'staging-web-01',
            discovered: '2 days ago',
            status: 'pending'
        },
        {
            id: 'CVE-2024-002',
            severity: 'low',
            title: 'Unused security group with overly permissive rules',
            affected: 'legacy-sg-01',
            discovered: '1 week ago',
            status: 'acknowledged'
        },
        {
            id: 'CVE-2024-003',
            severity: 'low',
            title: 'Default password on development database',
            affected: 'dev-postgres-01',
            discovered: '3 days ago',
            status: 'in-progress'
        }
    ];

    const complianceChecks = [
        { name: 'SOC 2 Type II', status: 'compliant', lastCheck: '1 week ago', score: 100 },
        { name: 'ISO 27001', status: 'compliant', lastCheck: '2 weeks ago', score: 98 },
        { name: 'GDPR', status: 'compliant', lastCheck: '3 days ago', score: 96 },
        { name: 'PCI DSS', status: 'minor-issues', lastCheck: '1 day ago', score: 94 }
    ];

    const accessPolicies = [
        {
            name: 'Production Read-Only',
            type: 'IAM Policy',
            users: 12,
            resources: 45,
            lastModified: '1 week ago'
        },
        {
            name: 'Database Administrators',
            type: 'IAM Role',
            users: 3,
            resources: 8,
            lastModified: '2 days ago'
        },
        {
            name: 'Developer Access',
            type: 'IAM Group',
            users: 18,
            resources: 67,
            lastModified: '3 days ago'
        }
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'info': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
            case 'minor-issues': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'non-compliant': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {securityOverview.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <item.icon className={`w-8 h-8 ${getStatusColor(item.status)}`} />
                            {item.status === 'good' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                            {item.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <p className="text-gray-600 text-sm">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vulnerabilities */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Security Vulnerabilities</h3>
                        <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Scan className="w-4 h-4" />
                            <span>Scan</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {vulnerabilities.map((vuln, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                                                {vuln.severity.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">{vuln.id}</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">{vuln.title}</h4>
                                        <p className="text-sm text-gray-500">Affected: {vuln.affected}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Discovered {vuln.discovered}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${vuln.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                                            vuln.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                                                vuln.status === 'resolved' ? 'text-green-600 bg-green-100' :
                                                    'text-gray-600 bg-gray-100'
                                        }`}>
                                        {vuln.status.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        View All Vulnerabilities
                    </button>
                </div>

                {/* Compliance Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {complianceChecks.map((check, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{check.name}</h4>
                                        <p className="text-sm text-gray-500">Last check: {check.lastCheck}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">{check.score}%</div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getComplianceColor(check.status)}`}>
                                            {check.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${check.score >= 95 ? 'bg-green-500' : check.score >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${check.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Access Management */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Access Management</h3>
                    <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Key className="w-4 h-4" />
                            <span>New Policy</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {accessPolicies.map((policy, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <UserCheck className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{policy.name}</h4>
                                        <p className="text-sm text-gray-500">{policy.type}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                    <span className="text-gray-500">Users:</span>
                                    <span className="ml-1 font-medium">{policy.users}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Resources:</span>
                                    <span className="ml-1 font-medium">{policy.resources}</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">
                                Modified: {policy.lastModified}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileShield className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">128</div>
                        <div className="text-sm text-gray-500">Security Policies</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">256</div>
                        <div className="text-sm text-gray-500">Encrypted Resources</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Globe className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">24/7</div>
                        <div className="text-sm text-gray-500">Threat Monitoring</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
