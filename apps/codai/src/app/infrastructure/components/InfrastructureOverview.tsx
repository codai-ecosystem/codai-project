import React from 'react';
import {
    Server,
    Database,
    HardDrive,
    Cpu,
    Activity,
    Users,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    Target
} from 'lucide-react';

export function InfrastructureOverview() {
    const stats = [
        {
            label: 'Total Resources',
            value: '127',
            change: '+5',
            icon: Server,
            color: 'blue'
        },
        {
            label: 'Active Environments',
            value: '8',
            change: '+2',
            icon: Target,
            color: 'green'
        },
        {
            label: 'Monthly Cost',
            value: '$2,847',
            change: '-$125',
            icon: TrendingUp,
            color: 'purple'
        },
        {
            label: 'Uptime',
            value: '99.97%',
            change: '+0.02%',
            icon: Activity,
            color: 'emerald'
        }
    ];

    const environments = [
        { name: 'Production', resources: 45, status: 'healthy', cost: 1247.50 },
        { name: 'Staging', resources: 28, status: 'healthy', cost: 845.25 },
        { name: 'Development', resources: 35, status: 'warning', cost: 654.75 },
        { name: 'Testing', resources: 19, status: 'healthy', cost: 299.50 }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Environment Health */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Environment Health</h3>

                    <div className="space-y-4">
                        {environments.map((env, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${env.status === 'healthy' ? 'bg-green-500' :
                                            env.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900">{env.name}</div>
                                        <div className="text-sm text-gray-500">{env.resources} resources</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">${env.cost.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">monthly</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Resource Distribution</h3>

                    <div className="space-y-4">
                        {[
                            { type: 'Compute Instances', count: 42, usage: 78, icon: Cpu },
                            { type: 'Databases', count: 15, usage: 65, icon: Database },
                            { type: 'Storage Volumes', count: 38, usage: 82, icon: HardDrive },
                            { type: 'Load Balancers', count: 8, usage: 45, icon: Server }
                        ].map((resource, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <resource.icon className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">{resource.type}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{resource.count} active</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${resource.usage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10">{resource.usage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Infrastructure Activities</h3>

                <div className="space-y-4">
                    {[
                        {
                            action: 'Auto-scaling triggered for Production API cluster',
                            time: '2 minutes ago',
                            status: 'success',
                            details: 'Scaled from 3 to 5 instances due to high traffic'
                        },
                        {
                            action: 'Database backup completed for PostgreSQL Primary',
                            time: '15 minutes ago',
                            status: 'success',
                            details: 'Weekly backup stored in S3 (2.4 GB)'
                        },
                        {
                            action: 'Security group updated for Development environment',
                            time: '1 hour ago',
                            status: 'info',
                            details: 'Added new SSH access rule for team member'
                        },
                        {
                            action: 'Load balancer health check failed for Staging API',
                            time: '2 hours ago',
                            status: 'warning',
                            details: 'Instance sg-12345 marked unhealthy, investigating'
                        }
                    ].map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'success' ? 'bg-green-500' :
                                    activity.status === 'warning' ? 'bg-yellow-500' :
                                        activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`}></div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{activity.action}</div>
                                <div className="text-sm text-gray-500 mt-1">{activity.details}</div>
                                <div className="text-xs text-gray-400 mt-2">{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
