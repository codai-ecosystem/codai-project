import React from 'react';
import {
    GitBranch,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    TrendingUp,
    Users,
    Target,
    PlayCircle,
    Zap,
    Shield,
    Rocket
} from 'lucide-react';

export function PipelineOverview() {
    const stats = [
        {
            label: 'Active Pipelines',
            value: '24',
            change: '+3',
            icon: GitBranch,
            color: 'blue'
        },
        {
            label: 'Success Rate',
            value: '94.2%',
            change: '+2.1%',
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'Avg Deploy Time',
            value: '3.5m',
            change: '-45s',
            icon: Clock,
            color: 'purple'
        },
        {
            label: 'Daily Deployments',
            value: '47',
            change: '+12',
            icon: Rocket,
            color: 'orange'
        }
    ];

    const recentPipelines = [
        {
            name: 'CODAI Frontend',
            branch: 'main',
            status: 'success',
            duration: '2m 34s',
            time: '5 minutes ago',
            commit: 'feat: add new dashboard'
        },
        {
            name: 'API Service',
            branch: 'develop',
            status: 'running',
            duration: '1m 12s',
            time: '8 minutes ago',
            commit: 'fix: authentication middleware'
        },
        {
            name: 'Database Migration',
            branch: 'main',
            status: 'failed',
            duration: '45s',
            time: '15 minutes ago',
            commit: 'migrate: user permissions'
        },
        {
            name: 'MemorAI Service',
            branch: 'feature/optimization',
            status: 'success',
            duration: '3m 45s',
            time: '1 hour ago',
            commit: 'perf: optimize memory usage'
        }
    ];

    const environments = [
        { name: 'Production', pipelines: 8, deployments: 12, uptime: 99.98 },
        { name: 'Staging', pipelines: 12, deployments: 28, uptime: 99.95 },
        { name: 'Development', pipelines: 4, deployments: 67, uptime: 98.5 }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <PlayCircle className="w-4 h-4 text-blue-600 animate-pulse" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

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
                {/* Recent Pipeline Runs */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Pipeline Runs</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</button>
                    </div>

                    <div className="space-y-4">
                        {recentPipelines.map((pipeline, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(pipeline.status)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                                            {pipeline.status}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{pipeline.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {pipeline.branch} • {pipeline.commit}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-900">{pipeline.duration}</div>
                                    <div className="text-xs text-gray-500">{pipeline.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Environment Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Environment Status</h3>

                    <div className="space-y-4">
                        {environments.map((env, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${env.uptime > 99.9 ? 'bg-green-500' :
                                                env.uptime > 99 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                        <div>
                                            <div className="font-medium text-gray-900">{env.name}</div>
                                            <div className="text-sm text-gray-500">Uptime: {env.uptime}%</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{env.deployments} deployments</div>
                                        <div className="text-xs text-gray-500">{env.pipelines} pipelines</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pipeline Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Performance Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">94.2%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                        <div className="text-xs text-green-600 mt-1">+2.1% this week</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">3.5m</div>
                        <div className="text-sm text-gray-500">Avg Deploy Time</div>
                        <div className="text-xs text-green-600 mt-1">-45s improvement</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">167</div>
                        <div className="text-sm text-gray-500">Weekly Deployments</div>
                        <div className="text-xs text-blue-600 mt-1">+23 this week</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        {
                            icon: GitBranch,
                            label: 'Create Pipeline',
                            desc: 'Set up new CI/CD pipeline',
                            color: 'blue'
                        },
                        {
                            icon: PlayCircle,
                            label: 'Run Deployment',
                            desc: 'Deploy to environment',
                            color: 'green'
                        },
                        {
                            icon: Shield,
                            label: 'Security Scan',
                            desc: 'Run security checks',
                            color: 'red'
                        },
                        {
                            icon: Target,
                            label: 'Performance Test',
                            desc: 'Execute load tests',
                            color: 'purple'
                        }
                    ].map((action, index) => (
                        <button key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                            <action.icon className={`w-6 h-6 text-${action.color}-600 mb-2`} />
                            <div className="font-medium text-gray-900">{action.label}</div>
                            <div className="text-sm text-gray-500">{action.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
