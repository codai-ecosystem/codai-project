import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, CheckCircle, Users } from 'lucide-react'
import { DashboardData } from '../hooks/useControlAIApi'

interface MetricsDashboardProps {
    data?: DashboardData
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    const { metrics, tasks, agents, projects } = data

    // Mock data for charts (in real app, this would come from API)
    const performanceData = [
        { month: 'Jan', completed: 45, efficiency: 78 },
        { month: 'Feb', completed: 52, efficiency: 82 },
        { month: 'Mar', completed: 48, efficiency: 79 },
        { month: 'Apr', completed: 61, efficiency: 85 },
        { month: 'May', completed: 55, efficiency: 83 },
        { month: 'Jun', completed: 67, efficiency: 88 },
        { month: 'Jul', completed: 73, efficiency: 92 }
    ]

    const taskDistribution = [
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
        { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#F59E0B' },
        { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#6B7280' }
    ]

    const agentPerformanceData = agents.map(agent => ({
        name: agent.name,
        performance: agent.performance,
        type: agent.type
    }))

    const keyMetrics = [
        {
            label: 'Task Completion Rate',
            value: `${Math.round((metrics.completedTasks / (metrics.completedTasks + metrics.activeTasks)) * 100)}%`,
            icon: CheckCircle,
            color: 'green',
            trend: '+12%'
        },
        {
            label: 'Average Efficiency',
            value: `${metrics.agentUtilization}%`,
            icon: TrendingUp,
            color: 'blue',
            trend: '+5%'
        },
        {
            label: 'Response Time',
            value: '2.3s',
            icon: Clock,
            color: 'yellow',
            trend: '-8%'
        },
        {
            label: 'Active Agents',
            value: agents.filter(a => a.status !== 'offline').length,
            icon: Users,
            color: 'purple',
            trend: '+2'
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Metrics Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Analyze performance and track key metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyMetrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                                <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                            </div>
                            <span className={`text-sm font-medium ${metric.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {metric.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {metric.label}
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {metric.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Performance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                name="Tasks Completed"
                            />
                            <Line
                                type="monotone"
                                dataKey="efficiency"
                                stroke="#10B981"
                                strokeWidth={2}
                                name="Efficiency %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Task Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Task Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {taskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Agent Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Agent Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={agentPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="performance" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* System Health */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        System Health
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Overall Health', value: metrics.systemHealth, color: 'green' },
                            { label: 'Agent Utilization', value: metrics.agentUtilization, color: 'blue' },
                            { label: 'Task Completion', value: Math.round((metrics.completedTasks / (metrics.completedTasks + metrics.activeTasks)) * 100), color: 'purple' },
                            { label: 'Response Time', value: 85, color: 'yellow' }
                        ].map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {item.label}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {item.value}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${item.color === 'green' ? 'bg-green-500' :
                                                item.color === 'blue' ? 'bg-blue-500' :
                                                    item.color === 'purple' ? 'bg-purple-500' : 'bg-yellow-500'
                                            }`}
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Detailed Metrics
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Metric
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Current
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Target
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {[
                                { metric: 'Active Projects', current: metrics.totalProjects, target: 15, status: 'on-track' },
                                { metric: 'Completed Tasks', current: metrics.completedTasks, target: 200, status: 'behind' },
                                { metric: 'Agent Utilization', current: `${metrics.agentUtilization}%`, target: '85%', status: 'ahead' },
                                { metric: 'System Uptime', current: '99.9%', target: '99.5%', status: 'ahead' }
                            ].map((row, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {row.metric}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {row.current}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {row.target}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.status === 'ahead' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                row.status === 'on-track' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MetricsDashboard
