import React from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    Target,
    Lightbulb,
    Zap,
    Server,
    Database,
    HardDrive,
    Clock,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Settings,
    Download
} from 'lucide-react';

export function CostOptimizationTab() {
    const costMetrics = [
        { label: 'Monthly Spend', value: '$2,847', change: '-$125', trend: 'down', icon: DollarSign },
        { label: 'Savings Opportunities', value: '$456', change: '+$89', trend: 'up', icon: Target },
        { label: 'Cost per Resource', value: '$22.43', change: '-$3.21', trend: 'down', icon: BarChart3 },
        { label: 'Optimization Score', value: '87/100', change: '+5', trend: 'up', icon: TrendingUp }
    ];

    const recommendations = [
        {
            id: 'rec_001',
            title: 'Right-size underutilized instances',
            description: 'Several EC2 instances are running at less than 20% CPU utilization',
            impact: 'High',
            savings: '$234/month',
            effort: 'Low',
            resources: 8,
            status: 'new'
        },
        {
            id: 'rec_002',
            title: 'Use Reserved Instances for stable workloads',
            description: 'Production workloads can benefit from 1-year Reserved Instance pricing',
            impact: 'High',
            savings: '$189/month',
            effort: 'Medium',
            resources: 12,
            status: 'in-progress'
        },
        {
            id: 'rec_003',
            title: 'Delete unused EBS volumes',
            description: 'Multiple unattached EBS volumes are incurring storage costs',
            impact: 'Medium',
            savings: '$33/month',
            effort: 'Low',
            resources: 6,
            status: 'new'
        }
    ];

    const costBreakdown = [
        { service: 'EC2 Instances', cost: 1245.67, percentage: 44, trend: 'up' },
        { service: 'RDS Databases', cost: 567.89, percentage: 20, trend: 'stable' },
        { service: 'S3 Storage', cost: 234.56, percentage: 8, trend: 'down' },
        { service: 'CloudFront CDN', cost: 123.45, percentage: 4, trend: 'up' },
        { service: 'Load Balancers', cost: 98.76, percentage: 3, trend: 'stable' },
        { service: 'Other Services', cost: 576.67, percentage: 21, trend: 'up' }
    ];

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High': return 'text-red-600 bg-red-100 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'Low': return 'text-green-600 bg-green-100 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'High': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />;
            case 'stable': return <span className="w-4 h-4 border-b-2 border-gray-400"></span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Cost Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {costMetrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <metric.icon className="w-8 h-8 text-blue-600" />
                            <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-gray-600 text-sm">{metric.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Optimization Recommendations */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(rec.impact)}`}>
                                                {rec.impact} Impact
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEffortColor(rec.effort)}`}>
                                                {rec.effort} Effort
                                            </span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{rec.description}</p>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="text-green-600 font-medium">{rec.savings} savings</span>
                                            <span className="text-gray-500">{rec.resources} resources</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {rec.status === 'new' && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                                                New
                                            </span>
                                        )}
                                        {rec.status === 'in-progress' && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                                                In Progress
                                            </span>
                                        )}
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Apply Selected Recommendations
                    </button>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
                        <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {costBreakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        {item.service === 'EC2 Instances' && <Server className="w-4 h-4 text-blue-600" />}
                                        {item.service === 'RDS Databases' && <Database className="w-4 h-4 text-green-600" />}
                                        {item.service === 'S3 Storage' && <HardDrive className="w-4 h-4 text-purple-600" />}
                                        {!['EC2 Instances', 'RDS Databases', 'S3 Storage'].includes(item.service) && (
                                            <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                        )}
                                        <span className="text-sm font-medium text-gray-900">{item.service}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">${item.cost.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                                    </div>
                                    {getTrendIcon(item.trend)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">Total Monthly Cost</span>
                            <span className="text-lg font-bold text-gray-900">
                                ${costBreakdown.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Alerts & Forecasting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Alerts */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Alerts</h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="font-medium text-yellow-800">Budget Alert</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                                You've used 87% of your monthly budget ($3,000). Current spend: $2,610
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">On Track</span>
                            </div>
                            <p className="text-sm text-green-700">
                                Development environment is 15% under budget this month
                            </p>
                        </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        Configure Budget Alerts
                    </button>
                </div>

                {/* Cost Forecasting */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Forecasting</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-900">Next Month</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">$2,950</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-gray-900">Next Quarter</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">$8,750</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-gray-900">Annual Projection</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">$34,200</span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Optimization Impact</span>
                        </div>
                        <p className="text-sm text-blue-700">
                            Implementing current recommendations could save $456/month
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
