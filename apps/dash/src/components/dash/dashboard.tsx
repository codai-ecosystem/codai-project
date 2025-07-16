'use client';

import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, PieChartIcon, BarChartIcon, LineChartIcon, Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export function DashDashboard() {
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Sales',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
            },
        ],
    };

    const revenueData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Revenue',
                data: [8500, 12000, 9800, 15000],
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                tension: 0.4,
            },
        ],
    };

    const userDistribution = {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
            {
                data: [45, 35, 20],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
                borderWidth: 0,
            },
        ],
    };

    const kpiCards = [
        {
            title: 'Total Revenue',
            value: '$124,832',
            change: '+12.5%',
            isPositive: true,
            icon: DollarSign,
        },
        {
            title: 'Active Users',
            value: '8,429',
            change: '+5.2%',
            isPositive: true,
            icon: Users,
        },
        {
            title: 'Conversion Rate',
            value: '3.24%',
            change: '-0.8%',
            isPositive: false,
            icon: TrendingUpIcon,
        },
        {
            title: 'Orders',
            value: '1,249',
            change: '+8.1%',
            isPositive: true,
            icon: ShoppingCart,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <BarChartIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                DASH Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Real-time analytics, insights, and performance metrics
                            </p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((kpi, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                                    <div className="flex items-center mt-2">
                                        {kpi.isPositive ? (
                                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className={`text-sm font-medium ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpi.change}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                    <kpi.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Chart */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <BarChartIcon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Monthly Sales</h3>
                        </div>
                        <div className="h-80">
                            <Bar
                                data={salesData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)',
                                            },
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Revenue Trend */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <LineChartIcon className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
                        </div>
                        <div className="h-80">
                            <Line
                                data={revenueData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)',
                                            },
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* User Distribution and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Distribution */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-800">User Distribution</h3>
                        </div>
                        <div className="h-60">
                            <Doughnut
                                data={userDistribution}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Activity className="h-5 w-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { action: 'New order received', time: '2 minutes ago', type: 'order' },
                                { action: 'User registered', time: '5 minutes ago', type: 'user' },
                                { action: 'Payment processed', time: '12 minutes ago', type: 'payment' },
                                { action: 'Product review submitted', time: '18 minutes ago', type: 'review' },
                                { action: 'Inventory updated', time: '25 minutes ago', type: 'inventory' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'user' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                                                    activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                        }`}>
                                        <div className="w-2 h-2 rounded-full bg-current"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Generate Report', color: 'blue' },
                            { label: 'Export Data', color: 'green' },
                            { label: 'View Analytics', color: 'purple' },
                            { label: 'Manage Dashboard', color: 'orange' },
                        ].map((action, index) => (
                            <button
                                key={index}
                                className={`p-4 rounded-lg border-2 border-dashed border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors group`}
                            >
                                <span className={`text-${action.color}-700 font-medium group-hover:text-${action.color}-800`}>
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
