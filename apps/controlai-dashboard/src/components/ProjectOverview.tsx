import React from 'react'
import { FolderKanban, Users, Clock, CheckCircle } from 'lucide-react'
import { DashboardData } from '../hooks/useControlAIApi'

interface ProjectOverviewProps {
    data?: DashboardData
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    const { metrics, projects } = data

    const stats = [
        {
            label: 'Total Projects',
            value: metrics.totalProjects,
            icon: FolderKanban,
            color: 'blue'
        },
        {
            label: 'Active Teams',
            value: projects.filter(p => p.status === 'active').length,
            icon: Users,
            color: 'green'
        },
        {
            label: 'Avg Progress',
            value: `${Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%`,
            icon: Clock,
            color: 'yellow'
        },
        {
            label: 'Completed',
            value: projects.filter(p => p.status === 'completed').length,
            icon: CheckCircle,
            color: 'purple'
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Project Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Monitor project progress and team performance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
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

            {/* Projects List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Active Projects
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                            {project.name}
                                        </h4>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : project.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}
                                        >
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Users className="h-4 w-4 mr-1" />
                                            {project.teamSize} members
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {project.progress}% complete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectOverview
