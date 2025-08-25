'use client'

import React from 'react'
/**
 * Project Timeline Component - Gantt chart view
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, ChevronLeft, ChevronRight, MoreHorizontal,
    Flag, AlertCircle, Clock, CheckCircle2, Users
} from 'lucide-react'
import { Project } from '../page'

interface ProjectTimelineProps {
    projects: Project[]
    onProjectUpdate: (projectId: string, updates: Partial<Project>) => void
}

export function ProjectTimeline({ projects, onProjectUpdate }: ProjectTimelineProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month')

    // Generate timeline grid
    const generateTimelineGrid = () => {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        const days = []

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d))
        }

        return days
    }

    const timelineGrid = generateTimelineGrid()

    const getProjectPosition = (project: Project) => {
        const startDate = new Date(project.startDate)
        const endDate = new Date(project.endDate)
        const gridStart = timelineGrid[0]
        const gridEnd = timelineGrid[timelineGrid.length - 1]

        const totalDays = timelineGrid.length
        const projectStart = Math.max(0, Math.floor((startDate.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)))
        const projectEnd = Math.min(totalDays, Math.floor((endDate.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)))

        return {
            left: `${(projectStart / totalDays) * 100}%`,
            width: `${((projectEnd - projectStart) / totalDays) * 100}%`,
            startDay: projectStart,
            endDay: projectEnd
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500'
            case 'planning': return 'bg-blue-500'
            case 'on_hold': return 'bg-yellow-500'
            case 'review': return 'bg-purple-500'
            case 'completed': return 'bg-gray-500'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return Flag
            case 'high': return AlertCircle
            case 'medium': return Clock
            case 'low': return CheckCircle2
            default: return CheckCircle2
        }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth)
        if (direction === 'prev') {
            newMonth.setMonth(currentMonth.getMonth() - 1)
        } else {
            newMonth.setMonth(currentMonth.getMonth() + 1)
        }
        setCurrentMonth(newMonth)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Timeline header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Project Timeline
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as 'month' | 'quarter' | 'year')}
                            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="month">Month View</option>
                            <option value="quarter">Quarter View</option>
                            <option value="year">Year View</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Timeline grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Date headers */}
                    <div className="bg-gray-100 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-500">
                        <div className="flex">
                            <div className="w-64 px-4 py-3 border-r border-gray-200 dark:border-gray-500">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</span>
                            </div>
                            <div className="flex-1 flex">
                                {timelineGrid.map((date, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 px-1 py-3 text-center border-r border-gray-200 dark:border-gray-500 last:border-r-0"
                                    >
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {date.getDate()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Project rows */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {projects.map((project, index) => {
                            const position = getProjectPosition(project)
                            const PriorityIcon = getPriorityIcon(project.priority)

                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    {/* Project info */}
                                    <div className="w-64 px-4 py-4 border-r border-gray-200 dark:border-gray-500">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
                                                    {project.name}
                                                </h4>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <PriorityIcon className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {project.priority}
                                                    </span>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                            project.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex -space-x-1">
                                                        {project.teamMembers.slice(0, 2).map((member) => (
                                                            <div
                                                                key={member.id}
                                                                className="w-5 h-5 bg-gradient-to-br from-blue-400 to-green-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                                                                title={member.name}
                                                            >
                                                                {member.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {project.teamSize}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline bar */}
                                    <div className="flex-1 relative py-4 px-2">
                                        <div className="relative h-8">
                                            {/* Timeline bar */}
                                            <div
                                                className={`absolute top-1 h-6 rounded-lg ${getStatusColor(project.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    minWidth: '20px'
                                                }}
                                                title={`${project.name} (${project.progress}% complete)`}
                                            >
                                                {/* Progress indicator */}
                                                <div
                                                    className="h-full bg-white bg-opacity-30 rounded-lg"
                                                    style={{ width: `${project.progress}%` }}
                                                />

                                                {/* Project name overlay */}
                                                <div className="absolute inset-0 flex items-center px-2">
                                                    <span className="text-white text-xs font-medium truncate">
                                                        {project.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Milestone markers */}
                                            <div
                                                className="absolute top-0 w-2 h-8 bg-blue-600 rounded-sm"
                                                style={{ left: position.left }}
                                                title={`Start: ${new Date(project.startDate).toLocaleDateString()}`}
                                            />
                                            <div
                                                className="absolute top-0 w-2 h-8 bg-red-600 rounded-sm"
                                                style={{ left: `calc(${position.left} + ${position.width} - 8px)` }}
                                                title={`End: ${new Date(project.endDate).toLocaleDateString()}`}
                                            />
                                        </div>

                                        {/* Today indicator */}
                                        {(() => {
                                            const today = new Date()
                                            const todayPosition = Math.floor((today.getTime() - timelineGrid[0].getTime()) / (1000 * 60 * 60 * 24))
                                            if (todayPosition >= 0 && todayPosition < timelineGrid.length) {
                                                return (
                                                    <div
                                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-50"
                                                        style={{ left: `${(todayPosition / timelineGrid.length) * 100}%` }}
                                                    />
                                                )
                                            }
                                            return null
                                        })()}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span>Active</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span>Planning</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                            <span>On Hold</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                            <span>Completed</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></div>
                            <span>Start</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-6 bg-red-600 rounded-sm mr-2"></div>
                            <span>End</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-0.5 h-6 bg-red-500 mr-2"></div>
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


