import React, { useState } from 'react';
import {
    Puzzle,
    Github,
    GitBranch,
    Cloud,
    Shield,
    Zap,
    Plus,
    Edit,
    Trash2,
    Settings,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Upload,
    ExternalLink,
    Key,
    Bell,
    Database,
    Server,
    Globe,
    Webhook,
    Activity,
    Users,
    Link
} from 'lucide-react';

export function IntegrationsTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const integrations = [
        {
            id: 1,
            name: 'GitHub Actions',
            category: 'version-control',
            provider: 'GitHub',
            status: 'connected',
            type: 'webhook',
            description: 'Automated CI/CD workflows triggered by repository events',
            webhook_url: 'https://api.github.com/repos/codai-project/webhooks',
            last_sync: '5 minutes ago',
            events: ['push', 'pull_request', 'release'],
            pipelines_connected: 8,
            health_score: 98.5,
            created: '2024-01-15',
            tags: ['git', 'automation', 'ci-cd']
        },
        {
            id: 2,
            name: 'Slack Notifications',
            category: 'notifications',
            provider: 'Slack',
            status: 'connected',
            type: 'api',
            description: 'Real-time deployment notifications and alerts',
            webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
            last_sync: '2 minutes ago',
            events: ['deployment_start', 'deployment_success', 'deployment_failure'],
            pipelines_connected: 12,
            health_score: 99.2,
            created: '2024-01-12',
            tags: ['notifications', 'alerts', 'communication']
        },
        {
            id: 3,
            name: 'AWS CodeDeploy',
            category: 'cloud-deployment',
            provider: 'AWS',
            status: 'connected',
            type: 'api',
            description: 'Automated deployment to AWS infrastructure',
            webhook_url: 'https://codedeploy.us-east-1.amazonaws.com',
            last_sync: '1 hour ago',
            events: ['deployment_created', 'deployment_succeeded', 'deployment_failed'],
            pipelines_connected: 6,
            health_score: 97.8,
            created: '2024-01-10',
            tags: ['aws', 'deployment', 'cloud']
        },
        {
            id: 4,
            name: 'Docker Registry',
            category: 'container-registry',
            provider: 'Docker Hub',
            status: 'connected',
            type: 'api',
            description: 'Container image storage and management',
            webhook_url: 'https://registry-1.docker.io/v2',
            last_sync: '30 minutes ago',
            events: ['image_pushed', 'image_pulled', 'tag_created'],
            pipelines_connected: 15,
            health_score: 96.4,
            created: '2024-01-08',
            tags: ['containers', 'registry', 'images']
        },
        {
            id: 5,
            name: 'Datadog Monitoring',
            category: 'monitoring',
            provider: 'Datadog',
            status: 'warning',
            type: 'api',
            description: 'Application performance monitoring and alerts',
            webhook_url: 'https://api.datadoghq.com/api/v1',
            last_sync: '2 hours ago',
            events: ['metric_threshold', 'error_rate', 'performance_alert'],
            pipelines_connected: 4,
            health_score: 89.6,
            created: '2024-01-05',
            tags: ['monitoring', 'metrics', 'alerts']
        },
        {
            id: 6,
            name: 'SonarQube',
            category: 'code-quality',
            provider: 'SonarSource',
            status: 'disconnected',
            type: 'webhook',
            description: 'Code quality analysis and security scanning',
            webhook_url: 'https://sonarcloud.io/api/webhooks',
            last_sync: '1 week ago',
            events: ['quality_gate', 'analysis_completed', 'security_hotspot'],
            pipelines_connected: 0,
            health_score: 0,
            created: '2024-01-03',
            tags: ['quality', 'security', 'analysis']
        }
    ];

    const integrationCategories = [
        {
            category: 'version-control',
            name: 'Version Control',
            icon: Github,
            color: 'blue',
            description: 'Git repositories and source control'
        },
        {
            category: 'cloud-deployment',
            name: 'Cloud Deployment',
            icon: Cloud,
            color: 'green',
            description: 'Cloud platform deployment services'
        },
        {
            category: 'notifications',
            name: 'Notifications',
            icon: Bell,
            color: 'purple',
            description: 'Communication and alert systems'
        },
        {
            category: 'monitoring',
            name: 'Monitoring',
            icon: Activity,
            color: 'orange',
            description: 'Performance and health monitoring'
        },
        {
            category: 'container-registry',
            name: 'Container Registry',
            icon: Database,
            color: 'indigo',
            description: 'Container image repositories'
        },
        {
            category: 'code-quality',
            name: 'Code Quality',
            icon: Shield,
            color: 'red',
            description: 'Code analysis and security scanning'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'disconnected': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-100 border-green-200';
            case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'disconnected': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 95) return 'text-green-600';
        if (score >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredIntegrations = integrations.filter(integration => {
        const matchesFilter = selectedFilter === 'all' || integration.category === selectedFilter;
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {integrationCategories.map((category) => (
                            <option key={category.category} value={category.category}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                    </button>
                </div>
            </div>

            {/* Integration Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {integrationCategories.map((category) => (
                        <button
                            key={category.category}
                            onClick={() => setSelectedFilter(category.category)}
                            className={`p-4 border rounded-lg hover:bg-gray-50 text-left ${selectedFilter === category.category ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <category.icon className={`w-6 h-6 text-${category.color}-600 mb-2`} />
                            <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Integrations Grid */}
            <div className="grid gap-6">
                {filteredIntegrations.map((integration) => (
                    <div key={integration.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Puzzle className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                        <span className="text-sm text-gray-500">by {integration.provider}</span>
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mt-1">{integration.description}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-gray-500">
                                            Type: {integration.type}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Created: {integration.created}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {integration.pipelines_connected} pipelines
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Link className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(integration.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                                    {integration.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Health:</span>
                                <span className={`ml-1 font-medium ${getHealthColor(integration.health_score)}`}>
                                    {integration.health_score}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Last sync:</span> {integration.last_sync}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Events:</span> {integration.events.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Pipelines:</span> {integration.pipelines_connected}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Webhook/API Endpoint:</div>
                            <div className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600 font-mono break-all">
                                {integration.webhook_url}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Supported Events:</div>
                            <div className="flex flex-wrap gap-2">
                                {integration.events.map((event, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {event}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {integration.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Integration Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Add New Integration</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Integration Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter integration name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {integrationCategories.map((category) => (
                                            <option key={category.category} value={category.category}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Provider
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., GitHub, AWS, Slack"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Integration Type
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>API</option>
                                        <option>Webhook</option>
                                        <option>OAuth</option>
                                        <option>Token</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Webhook/API URL
                                </label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://api.example.com/webhook"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Authentication
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="API Key / Token"
                                    />
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Secret (optional)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supported Events
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['push', 'pull_request', 'deployment_start', 'deployment_success', 'deployment_failure', 'error_alert'].map((event) => (
                                        <label key={event} className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="ml-2 text-sm text-gray-700">{event.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the integration purpose and functionality"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Test Connection
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Add Integration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
