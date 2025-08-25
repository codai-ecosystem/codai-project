import React, { useState } from 'react';
import {
    Server,
    Database,
    HardDrive,
    Cpu,
    MemoryStick,
    Play,
    Pause,
    Square,
    RotateCcw,
    Settings,
    Monitor,
    Activity,
    Zap,
    AlertTriangle,
    CheckCircle,
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Terminal,
    Edit
} from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    type: 'compute' | 'database' | 'storage' | 'network';
    status: 'running' | 'stopped' | 'pending' | 'error';
    environment: 'production' | 'staging' | 'development';
    provider: string;
    region: string;
    specs: {
        cpu?: string;
        memory?: string;
        storage?: string;
        size?: string;
    };
    utilization: {
        cpu?: number;
        memory?: number;
        storage?: number;
    };
    cost: {
        hourly: number;
        monthly: number;
    };
    uptime: number;
    lastUpdated: Date;
}

export function ResourcesTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedEnvironment, setSelectedEnvironment] = useState('all');

    const mockResources: Resource[] = [
        {
            id: 'i-0a1b2c3d4e5f6g7h8',
            name: 'CODAI API Production',
            type: 'compute',
            status: 'running',
            environment: 'production',
            provider: 'AWS',
            region: 'us-east-1',
            specs: { cpu: '4 vCPU', memory: '16 GB', storage: '100 GB SSD' },
            utilization: { cpu: 65, memory: 78, storage: 45 },
            cost: { hourly: 0.384, monthly: 278.50 },
            uptime: 99.98,
            lastUpdated: new Date()
        },
        {
            id: 'db-cluster-001',
            name: 'PostgreSQL Primary',
            type: 'database',
            status: 'running',
            environment: 'production',
            provider: 'AWS',
            region: 'us-east-1',
            specs: { cpu: '8 vCPU', memory: '32 GB', storage: '500 GB SSD' },
            utilization: { cpu: 42, memory: 65, storage: 68 },
            cost: { hourly: 0.768, monthly: 557.00 },
            uptime: 99.95,
            lastUpdated: new Date()
        },
        {
            id: 'vol-0123456789abcdef0',
            name: 'App Data Volume',
            type: 'storage',
            status: 'running',
            environment: 'production',
            provider: 'AWS',
            region: 'us-east-1',
            specs: { size: '1 TB', storage: '1000 GB SSD' },
            utilization: { storage: 72 },
            cost: { hourly: 0.125, monthly: 90.00 },
            uptime: 100,
            lastUpdated: new Date()
        }
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'compute': return <Server className="w-4 h-4 text-blue-600" />;
            case 'database': return <Database className="w-4 h-4 text-green-600" />;
            case 'storage': return <HardDrive className="w-4 h-4 text-purple-600" />;
            case 'network': return <Zap className="w-4 h-4 text-orange-600" />;
            default: return <Server className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <Play className="w-4 h-4 text-green-600" />;
            case 'stopped': return <Square className="w-4 h-4 text-gray-600" />;
            case 'pending': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100 border-green-200';
            case 'stopped': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'pending': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'error': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getEnvironmentColor = (env: string) => {
        switch (env) {
            case 'production': return 'text-red-600 bg-red-100 border-red-200';
            case 'staging': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'development': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="compute">Compute</option>
                        <option value="database">Database</option>
                        <option value="storage">Storage</option>
                        <option value="network">Network</option>
                    </select>

                    <select
                        value={selectedEnvironment}
                        onChange={(e) => setSelectedEnvironment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Environments</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                    </select>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockResources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {getTypeIcon(resource.type)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEnvironmentColor(resource.environment)}`}>
                                            {resource.environment}
                                        </span>
                                        <span className="text-sm text-gray-500">{resource.provider} • {resource.region}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {getStatusIcon(resource.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                                    {resource.status}
                                </span>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {resource.specs.cpu && (
                                <div>
                                    <span className="text-sm text-gray-500">CPU:</span>
                                    <span className="ml-1 text-sm font-medium">{resource.specs.cpu}</span>
                                </div>
                            )}
                            {resource.specs.memory && (
                                <div>
                                    <span className="text-sm text-gray-500">Memory:</span>
                                    <span className="ml-1 text-sm font-medium">{resource.specs.memory}</span>
                                </div>
                            )}
                            {resource.specs.storage && (
                                <div>
                                    <span className="text-sm text-gray-500">Storage:</span>
                                    <span className="ml-1 text-sm font-medium">{resource.specs.storage}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-sm text-gray-500">Cost:</span>
                                <span className="ml-1 text-sm font-medium">${resource.cost.monthly}/mo</span>
                            </div>
                        </div>

                        {/* Utilization */}
                        {resource.utilization && (
                            <div className="space-y-3 mb-4">
                                {resource.utilization.cpu !== undefined && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-500">CPU Usage</span>
                                            <span className="font-medium">{resource.utilization.cpu}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${resource.utilization.cpu > 80 ? 'bg-red-500' : resource.utilization.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${resource.utilization.cpu}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {resource.utilization.memory !== undefined && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-500">Memory Usage</span>
                                            <span className="font-medium">{resource.utilization.memory}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${resource.utilization.memory > 80 ? 'bg-red-500' : resource.utilization.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                style={{ width: `${resource.utilization.memory}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {resource.utilization.storage !== undefined && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-500">Storage Usage</span>
                                            <span className="font-medium">{resource.utilization.storage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${resource.utilization.storage > 80 ? 'bg-red-500' : resource.utilization.storage > 60 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                                                style={{ width: `${resource.utilization.storage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Uptime: {resource.uptime}% • ID: {resource.id.substring(0, 10)}...
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="text-gray-400 hover:text-blue-600" title="Monitor">
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-green-600" title="Terminal">
                                    <Terminal className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-purple-600" title="Settings">
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-gray-600" title="More">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
