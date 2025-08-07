import React, { useState } from 'react';
import {
    Server,
    Database,
    Globe,
    Settings,
    Plus,
    Edit3,
    Trash2,
    Power,
    Activity,
    Shield,
    Clock,
    Monitor,
    HardDrive,
    Cpu,
    MemoryStick,
    Network,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    Copy,
    Download,
    Upload,
    Filter,
    Search,
    MoreVertical,
    Terminal,
    Lock,
    Unlock
} from 'lucide-react';

export function TestEnvironmentsTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const testEnvironments = [
        {
            id: 1,
            name: 'Development',
            type: 'development',
            status: 'active',
            url: 'https://dev.codai.app',
            lastDeployed: '2024-01-15 14:30:00',
            version: 'v2.1.0-dev.45',
            branch: 'develop',
            resources: {
                cpu: '2 vCPUs',
                memory: '4 GB',
                storage: '50 GB',
                database: 'PostgreSQL 14'
            },
            health: {
                uptime: '99.2%',
                responseTime: '120ms',
                throughput: '45 req/s',
                errorRate: '0.3%'
            },
            tests: {
                running: 3,
                lastRun: '5 minutes ago',
                successRate: '94.2%',
                coverage: '87.3%'
            },
            access: 'public',
            owner: 'Development Team',
            tags: ['frontend', 'api', 'database']
        },
        {
            id: 2,
            name: 'Staging',
            type: 'staging',
            status: 'active',
            url: 'https://staging.codai.app',
            lastDeployed: '2024-01-15 10:15:00',
            version: 'v2.0.8',
            branch: 'release/v2.1.0',
            resources: {
                cpu: '4 vCPUs',
                memory: '8 GB',
                storage: '100 GB',
                database: 'PostgreSQL 14'
            },
            health: {
                uptime: '99.8%',
                responseTime: '85ms',
                throughput: '120 req/s',
                errorRate: '0.1%'
            },
            tests: {
                running: 0,
                lastRun: '2 hours ago',
                successRate: '97.1%',
                coverage: '91.5%'
            },
            access: 'restricted',
            owner: 'QA Team',
            tags: ['integration', 'e2e', 'performance']
        },
        {
            id: 3,
            name: 'Production Mirror',
            type: 'production',
            status: 'maintenance',
            url: 'https://prod-mirror.codai.app',
            lastDeployed: '2024-01-14 22:00:00',
            version: 'v2.0.7',
            branch: 'main',
            resources: {
                cpu: '8 vCPUs',
                memory: '16 GB',
                storage: '500 GB',
                database: 'PostgreSQL 14 (HA)'
            },
            health: {
                uptime: '99.9%',
                responseTime: '45ms',
                throughput: '450 req/s',
                errorRate: '0.05%'
            },
            tests: {
                running: 0,
                lastRun: '12 hours ago',
                successRate: '99.2%',
                coverage: '94.7%'
            },
            access: 'private',
            owner: 'SRE Team',
            tags: ['production', 'mirror', 'monitoring']
        },
        {
            id: 4,
            name: 'Security Testing',
            type: 'security',
            status: 'active',
            url: 'https://security.codai.app',
            lastDeployed: '2024-01-15 09:30:00',
            version: 'v2.1.0-security.12',
            branch: 'security/penetration-tests',
            resources: {
                cpu: '2 vCPUs',
                memory: '4 GB',
                storage: '25 GB',
                database: 'PostgreSQL 14'
            },
            health: {
                uptime: '98.5%',
                responseTime: '180ms',
                throughput: '25 req/s',
                errorRate: '1.2%'
            },
            tests: {
                running: 5,
                lastRun: '10 minutes ago',
                successRate: '88.7%',
                coverage: '76.4%'
            },
            access: 'private',
            owner: 'Security Team',
            tags: ['security', 'penetration', 'vulnerability']
        },
        {
            id: 5,
            name: 'Performance Lab',
            type: 'performance',
            status: 'offline',
            url: 'https://perf.codai.app',
            lastDeployed: '2024-01-13 16:45:00',
            version: 'v2.0.9-perf.3',
            branch: 'performance/load-testing',
            resources: {
                cpu: '16 vCPUs',
                memory: '32 GB',
                storage: '1 TB',
                database: 'PostgreSQL 14 (Cluster)'
            },
            health: {
                uptime: '95.3%',
                responseTime: '35ms',
                throughput: '1200 req/s',
                errorRate: '0.02%'
            },
            tests: {
                running: 0,
                lastRun: '2 days ago',
                successRate: '96.8%',
                coverage: '82.1%'
            },
            access: 'restricted',
            owner: 'Performance Team',
            tags: ['performance', 'load', 'stress']
        }
    ];

    const environmentTypes = [
        { id: 'development', name: 'Development', color: 'bg-blue-100 text-blue-600', icon: <Globe className="w-4 h-4" /> },
        { id: 'staging', name: 'Staging', color: 'bg-yellow-100 text-yellow-600', icon: <Monitor className="w-4 h-4" /> },
        { id: 'production', name: 'Production', color: 'bg-green-100 text-green-600', icon: <Server className="w-4 h-4" /> },
        { id: 'security', name: 'Security', color: 'bg-red-100 text-red-600', icon: <Shield className="w-4 h-4" /> },
        { id: 'performance', name: 'Performance', color: 'bg-purple-100 text-purple-600', icon: <Activity className="w-4 h-4" /> }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'offline': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'maintenance': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'starting': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 border-green-200';
            case 'offline': return 'text-red-600 bg-red-100 border-red-200';
            case 'maintenance': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'starting': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getAccessIcon = (access: string) => {
        switch (access) {
            case 'public': return <Unlock className="w-4 h-4 text-green-600" />;
            case 'restricted': return <Shield className="w-4 h-4 text-yellow-600" />;
            case 'private': return <Lock className="w-4 h-4 text-red-600" />;
            default: return <Lock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTypeConfig = (type: string) => {
        return environmentTypes.find(t => t.id === type) || environmentTypes[0];
    };

    const filteredEnvironments = testEnvironments.filter(env => {
        const matchesFilter = selectedFilter === 'all' || env.type === selectedFilter || env.status === selectedFilter;
        const matchesSearch = env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            env.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            env.owner.toLowerCase().includes(searchTerm.toLowerCase());
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
                            placeholder="Search environments..."
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
                        <option value="all">All Environments</option>
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                        <option value="security">Security</option>
                        <option value="performance">Performance</option>
                        <option value="active">Active</option>
                        <option value="offline">Offline</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export Config
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Config
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Environment
                    </button>
                </div>
            </div>

            {/* Environment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Environments</p>
                            <p className="text-2xl font-bold text-gray-900">{testEnvironments.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Server className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {testEnvironments.filter(env => env.status === 'active').length}
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Running Tests</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {testEnvironments.reduce((sum, env) => sum + env.tests.running, 0)}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {(testEnvironments.reduce((sum, env) => sum + parseFloat(env.health.uptime), 0) / testEnvironments.length).toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total vCPUs</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {testEnvironments.reduce((sum, env) => sum + parseInt(env.resources.cpu), 0)}
                            </p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Cpu className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Environments Grid */}
            <div className="grid gap-6">
                {filteredEnvironments.map((environment) => (
                    <div key={environment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${getTypeConfig(environment.type).color}`}>
                                    {getTypeConfig(environment.type).icon}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{environment.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeConfig(environment.type).color}`}>
                                            {environment.type}
                                        </span>
                                        {getAccessIcon(environment.access)}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>{environment.version}</span>
                                        <span>•</span>
                                        <span>{environment.branch}</span>
                                        <span>•</span>
                                        <span>Owner: {environment.owner}</span>
                                        <span>•</span>
                                        <span>Last deployed: {new Date(environment.lastDeployed).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(environment.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(environment.status)}`}>
                                        {environment.status}
                                    </span>
                                </div>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Environment Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                            {/* Resources */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Resources</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">CPU:</span>
                                        <span className="font-medium">{environment.resources.cpu}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Memory:</span>
                                        <span className="font-medium">{environment.resources.memory}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Storage:</span>
                                        <span className="font-medium">{environment.resources.storage}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Database:</span>
                                        <span className="font-medium">{environment.resources.database}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Health Metrics */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Health</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Uptime:</span>
                                        <span className="font-medium text-green-600">{environment.health.uptime}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Response:</span>
                                        <span className="font-medium">{environment.health.responseTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Throughput:</span>
                                        <span className="font-medium">{environment.health.throughput}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Error Rate:</span>
                                        <span className="font-medium text-red-600">{environment.health.errorRate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Test Metrics */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Testing</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Running:</span>
                                        <span className="font-medium text-blue-600">{environment.tests.running} tests</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Last Run:</span>
                                        <span className="font-medium">{environment.tests.lastRun}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Success Rate:</span>
                                        <span className="font-medium text-green-600">{environment.tests.successRate}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Coverage:</span>
                                        <span className="font-medium text-purple-600">{environment.tests.coverage}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Actions</h4>
                                <div className="space-y-2">
                                    <a
                                        href={environment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Visit
                                    </a>
                                    <button className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                                        <Terminal className="w-4 h-4 mr-2" />
                                        SSH
                                    </button>
                                    <button className="flex items-center justify-center w-full px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Monitor
                                    </button>
                                    <button className="flex items-center justify-center w-full px-3 py-2 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Configure
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Tags:</span>
                            {environment.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Environment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Environment</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Environment Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Feature Branch Testing"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="development">Development</option>
                                        <option value="staging">Staging</option>
                                        <option value="production">Production</option>
                                        <option value="security">Security</option>
                                        <option value="performance">Performance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CPU
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="1">1 vCPU</option>
                                        <option value="2">2 vCPUs</option>
                                        <option value="4">4 vCPUs</option>
                                        <option value="8">8 vCPUs</option>
                                        <option value="16">16 vCPUs</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Memory
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="2">2 GB</option>
                                        <option value="4">4 GB</option>
                                        <option value="8">8 GB</option>
                                        <option value="16">16 GB</option>
                                        <option value="32">32 GB</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Storage
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="25">25 GB</option>
                                        <option value="50">50 GB</option>
                                        <option value="100">100 GB</option>
                                        <option value="500">500 GB</option>
                                        <option value="1000">1 TB</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Access Level
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="public">Public</option>
                                        <option value="restricted">Restricted</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="frontend, api, database"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Create Environment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
