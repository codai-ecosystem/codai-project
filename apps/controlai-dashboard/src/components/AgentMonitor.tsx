import React from 'react'
import { Users, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { DashboardData, Agent } from '../hooks/useControlAIApi'

interface AgentMonitorProps {
    data?: DashboardData
}

const AgentMonitor: React.FC<AgentMonitorProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    const { agents, metrics } = data

    const getStatusIcon = (status: Agent['status']) => {
        switch (status) {
            case 'online':
                return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            case 'busy':
                return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            case 'offline':
                return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            default:
                return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        }
    }

    const getStatusColor = (status: Agent['status']) => {
        switch (status) {
            case 'online':
                return 'text-green-600 dark:text-green-400'
            case 'busy':
                return 'text-yellow-600 dark:text-yellow-400'
            case 'offline':
                return 'text-gray-600 dark:text-gray-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getPerformanceColor = (performance: number) => {
        if (performance >= 90) return 'text-green-600 dark:text-green-400'
        if (performance >= 75) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    {getStatusIcon(agent.status)}
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.type}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                    </div>
                    <div className={`text-lg font-bold ${getPerformanceColor(agent.performance)}`}>
                        {agent.performance}%
                    </div>
                </div>
            </div>

            {agent.currentTask && (
                <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Clock className="h-4 w-4 mr-2" />
                        Current Task
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.currentTask}
                    </p>
                </div>
            )}

            <div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Activity className="h-4 w-4 mr-2" />
                    Capabilities
                </div>
                <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((capability, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                        >
                            {capability}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )

    const overviewStats = [
        {
            label: 'Total Agents',
            value: metrics.totalAgents,
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Online',
            value: agents.filter(a => a.status === 'online').length,
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'Busy',
            value: agents.filter(a => a.status === 'busy').length,
            icon: Clock,
            color: 'yellow'
        },
        {
            label: 'Offline',
            value: agents.filter(a => a.status === 'offline').length,
            icon: AlertCircle,
            color: 'red'
        }
    ]

    const averagePerformance = Math.round(
        agents.reduce((acc, agent) => acc + agent.performance, 0) / agents.length
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Agent Monitor
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Monitor agent status and performance in real-time
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${getPerformanceColor(averagePerformance)}`}>
                            {averagePerformance}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Average Performance
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {metrics.agentUtilization}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Utilization Rate
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {metrics.systemHealth}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            System Health
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Cards */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Agent Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            </div>

            {/* Agent Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Status Distribution
                </h3>
                <div className="space-y-4">
                    {['online', 'busy', 'offline'].map((status) => {
                        const count = agents.filter(a => a.status === status).length
                        const percentage = Math.round((count / agents.length) * 100)

                        return (
                            <div key={status} className="flex items-center">
                                <div className="flex items-center w-20">
                                    {getStatusIcon(status as Agent['status'])}
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {status}
                                    </span>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${status === 'online' ? 'bg-green-500' :
                                                    status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                                    {count} ({percentage}%)
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AgentMonitor
