import React, { useState } from 'react';
import {
    Plus,
    Code,
    FileText,
    Settings,
    Play,
    Pause,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    GitBranch,
    Package,
    Server,
    Database,
    HardDrive,
    Network,
    Cloud,
    Terminal,
    Eye,
    Download,
    Upload,
    RefreshCw
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    type: 'terraform' | 'cloudformation' | 'pulumi' | 'ansible';
    category: 'compute' | 'database' | 'storage' | 'network' | 'security';
    provider: string[];
    estimatedCost: string;
    deployTime: string;
    complexity: 'simple' | 'moderate' | 'complex';
}

interface Deployment {
    id: string;
    name: string;
    template: string;
    status: 'running' | 'completed' | 'failed' | 'pending';
    environment: string;
    startTime: Date;
    duration?: number;
    resources: number;
    cost: number;
    progress: number;
}

export function ProvisioningTab() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProvider, setSelectedProvider] = useState('all');

    const templates: Template[] = [
        {
            id: 'tpl_001',
            name: 'Production Web Application',
            description: 'Complete infrastructure for scalable web application with load balancer, auto-scaling, and database',
            type: 'terraform',
            category: 'compute',
            provider: ['aws', 'azure'],
            estimatedCost: '$450-650/month',
            deployTime: '15-20 min',
            complexity: 'moderate'
        },
        {
            id: 'tpl_002',
            name: 'High-Availability Database Cluster',
            description: 'Multi-AZ PostgreSQL cluster with read replicas and automated backups',
            type: 'terraform',
            category: 'database',
            provider: ['aws', 'gcp'],
            estimatedCost: '$800-1200/month',
            deployTime: '25-30 min',
            complexity: 'complex'
        },
        {
            id: 'tpl_003',
            name: 'Development Environment',
            description: 'Lightweight development setup with basic compute and storage resources',
            type: 'cloudformation',
            category: 'compute',
            provider: ['aws'],
            estimatedCost: '$50-100/month',
            deployTime: '8-12 min',
            complexity: 'simple'
        }
    ];

    const deployments: Deployment[] = [
        {
            id: 'dep_001',
            name: 'Production API Scaling',
            template: 'Production Web Application',
            status: 'running',
            environment: 'production',
            startTime: new Date(Date.now() - 8 * 60 * 1000),
            resources: 12,
            cost: 0,
            progress: 65
        },
        {
            id: 'dep_002',
            name: 'Staging Database Refresh',
            template: 'High-Availability Database Cluster',
            status: 'completed',
            environment: 'staging',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            duration: 1847,
            resources: 8,
            cost: 45.50,
            progress: 100
        }
    ];

    const getTemplateIcon = (type: string) => {
        switch (type) {
            case 'terraform': return <Package className="w-5 h-5 text-purple-600" />;
            case 'cloudformation': return <Cloud className="w-5 h-5 text-orange-600" />;
            case 'pulumi': return <Code className="w-5 h-5 text-blue-600" />;
            case 'ansible': return <Settings className="w-5 h-5 text-red-600" />;
            default: return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'compute': return <Server className="w-4 h-4 text-blue-600" />;
            case 'database': return <Database className="w-4 h-4 text-green-600" />;
            case 'storage': return <HardDrive className="w-4 h-4 text-purple-600" />;
            case 'network': return <Network className="w-4 h-4 text-orange-600" />;
            case 'security': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <Play className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'simple': return 'text-green-600 bg-green-100 border-green-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'complex': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: Plus, label: 'New Template', desc: 'Create infrastructure template' },
                    { icon: Upload, label: 'Import', desc: 'Import existing template' },
                    { icon: GitBranch, label: 'Version Control', desc: 'Manage template versions' },
                    { icon: Terminal, label: 'CLI Tools', desc: 'Command line interface' }
                ].map((action, index) => (
                    <button key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-left">
                        <action.icon className="w-6 h-6 text-blue-600 mb-2" />
                        <div className="font-medium text-gray-900">{action.label}</div>
                        <div className="text-sm text-gray-500">{action.desc}</div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Templates */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Infrastructure Templates</h3>
                        <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                            <span>New</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-2 mb-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="all">All Categories</option>
                            <option value="compute">Compute</option>
                            <option value="database">Database</option>
                            <option value="storage">Storage</option>
                            <option value="network">Network</option>
                            <option value="security">Security</option>
                        </select>

                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="all">All Providers</option>
                            <option value="aws">AWS</option>
                            <option value="azure">Azure</option>
                            <option value="gcp">Google Cloud</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {templates.map((template) => (
                            <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getTemplateIcon(template.type)}
                                        <div>
                                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {getCategoryIcon(template.category)}
                                                <span className="text-sm text-gray-500 capitalize">{template.category}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getComplexityColor(template.complexity)}`}>
                                                    {template.complexity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-blue-600">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Cost:</span>
                                        <span className="ml-1 font-medium">{template.estimatedCost}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Deploy time:</span>
                                        <span className="ml-1 font-medium">{template.deployTime}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-500">
                                        Providers: {template.provider.join(', ')}
                                    </div>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        Deploy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Deployments */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Active Deployments</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {deployments.map((deployment) => (
                            <div key={deployment.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(deployment.status)}
                                        <div>
                                            <h4 className="font-medium text-gray-900">{deployment.name}</h4>
                                            <div className="text-sm text-gray-500">{deployment.template}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${deployment.environment === 'production' ? 'text-red-600 bg-red-100' :
                                            deployment.environment === 'staging' ? 'text-yellow-600 bg-yellow-100' :
                                                'text-green-600 bg-green-100'
                                        }`}>
                                        {deployment.environment}
                                    </span>
                                </div>

                                {deployment.status === 'running' && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="font-medium">{deployment.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${deployment.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Resources:</span>
                                        <span className="ml-1 font-medium">{deployment.resources}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Cost:</span>
                                        <span className="ml-1 font-medium">${deployment.cost.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Started:</span>
                                        <span className="ml-1 font-medium">{deployment.startTime.toLocaleTimeString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="ml-1 font-medium">
                                            {deployment.duration ?
                                                `${Math.floor(deployment.duration / 60)}m ${deployment.duration % 60}s` :
                                                'Running...'
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-500">ID: {deployment.id}</div>
                                    <div className="flex items-center space-x-2">
                                        <button className="text-gray-400 hover:text-blue-600" title="View Logs">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-400 hover:text-green-600" title="Terminal">
                                            <Terminal className="w-4 h-4" />
                                        </button>
                                        {deployment.status === 'running' && (
                                            <button className="text-gray-400 hover:text-red-600" title="Cancel">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Deployment History */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Recent Deployments</h4>
                        <div className="space-y-2">
                            {[
                                { name: 'Development Environment', time: '2 hours ago', status: 'completed' },
                                { name: 'Security Group Update', time: '5 hours ago', status: 'completed' },
                                { name: 'Storage Volume Expansion', time: '1 day ago', status: 'completed' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-gray-900">{item.name}</span>
                                    </div>
                                    <span className="text-gray-500">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
