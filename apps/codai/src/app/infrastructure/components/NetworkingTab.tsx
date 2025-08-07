import React from 'react';
import {
    Network,
    Wifi,
    Shield,
    Globe,
    Router,
    Zap,
    Activity,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

export function NetworkingTab() {
    const networkComponents = [
        {
            name: 'Production VPC',
            type: 'VPC',
            status: 'healthy',
            cidr: '10.0.0.0/16',
            subnets: 6,
            instances: 24,
            throughput: '2.4 Gbps'
        },
        {
            name: 'Application Load Balancer',
            type: 'ALB',
            status: 'healthy',
            targets: 8,
            requests: '125K/hour',
            latency: '89ms'
        },
        {
            name: 'CDN Distribution',
            type: 'CDN',
            status: 'healthy',
            edges: 45,
            hitRatio: '94.2%',
            bandwidth: '1.2 TB'
        }
    ];

    const securityGroups = [
        {
            name: 'web-servers-sg',
            description: 'Security group for web servers',
            instances: 12,
            rules: { inbound: 3, outbound: 2 },
            lastModified: '2 days ago'
        },
        {
            name: 'database-sg',
            description: 'Security group for database servers',
            instances: 4,
            rules: { inbound: 2, outbound: 1 },
            lastModified: '1 week ago'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Network Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Bandwidth', value: '4.8 Gbps', change: '+12%', icon: TrendingUp },
                    { label: 'Network Latency', value: '23ms', change: '-5ms', icon: Zap },
                    { label: 'Active Connections', value: '2,847', change: '+156', icon: Network },
                    { label: 'Security Groups', value: '18', change: '+2', icon: Shield }
                ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className="w-8 h-8 text-blue-600" />
                            <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Network Components */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Network Components</h3>

                    <div className="space-y-4">
                        {networkComponents.map((component, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            {component.type === 'VPC' && <Network className="w-4 h-4 text-blue-600" />}
                                            {component.type === 'ALB' && <Router className="w-4 h-4 text-green-600" />}
                                            {component.type === 'CDN' && <Globe className="w-4 h-4 text-purple-600" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{component.name}</h4>
                                            <span className="text-sm text-gray-500">{component.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600">Healthy</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {component.cidr && (
                                        <>
                                            <div>
                                                <span className="text-gray-500">CIDR:</span>
                                                <span className="ml-1 font-medium">{component.cidr}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Subnets:</span>
                                                <span className="ml-1 font-medium">{component.subnets}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Instances:</span>
                                                <span className="ml-1 font-medium">{component.instances}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Throughput:</span>
                                                <span className="ml-1 font-medium">{component.throughput}</span>
                                            </div>
                                        </>
                                    )}
                                    {component.targets && (
                                        <>
                                            <div>
                                                <span className="text-gray-500">Targets:</span>
                                                <span className="ml-1 font-medium">{component.targets}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Requests:</span>
                                                <span className="ml-1 font-medium">{component.requests}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Latency:</span>
                                                <span className="ml-1 font-medium">{component.latency}</span>
                                            </div>
                                        </>
                                    )}
                                    {component.edges && (
                                        <>
                                            <div>
                                                <span className="text-gray-500">Edge Locations:</span>
                                                <span className="ml-1 font-medium">{component.edges}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Hit Ratio:</span>
                                                <span className="ml-1 font-medium">{component.hitRatio}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Bandwidth:</span>
                                                <span className="ml-1 font-medium">{component.bandwidth}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Groups */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Groups</h3>

                    <div className="space-y-4">
                        {securityGroups.map((sg, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-red-600" />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{sg.name}</h4>
                                            <p className="text-sm text-gray-500">{sg.description}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Instances:</span>
                                        <span className="ml-1 font-medium">{sg.instances}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Inbound:</span>
                                        <span className="ml-1 font-medium">{sg.rules.inbound} rules</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Outbound:</span>
                                        <span className="ml-1 font-medium">{sg.rules.outbound} rules</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                    Last modified: {sg.lastModified}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800">
                        + Add Security Group
                    </button>
                </div>
            </div>

            {/* Network Topology */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Network Topology</h3>

                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <Network className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Interactive network topology diagram</p>
                        <p className="text-sm text-gray-500 mt-1">Visualize network architecture and connections</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
