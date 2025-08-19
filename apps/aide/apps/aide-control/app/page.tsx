'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
	Code2,
	Terminal,
	Bot,
	Zap,
	Layers,
	CheckCircle,
	TrendingUp,
	Activity,
	Play,
	Pause,
	Eye,
	Settings,
	Bell,
	Search,
	Plus,
	ChevronRight,
	AlertCircle,
	Clock,
	FileText,
	GitBranch,
	Rocket,
	Database,
	Users
} from 'lucide-react'

// TypeScript interfaces for AIDE development platform
interface DevelopmentMetrics {
	activeProjects: number
	aiAssistRequests: number
	buildSuccessRate: number
	linesOfCode: number
	developersActive: number
	deploymentsToday: number
	codeQualityScore: number
	systemUptime: number
}

interface Project {
	id: string
	name: string
	description: string
	language: string
	status: 'active' | 'building' | 'deployed' | 'error'
	progress: number
	lastCommit: string
	aiAssisted: boolean
}

interface AIActivity {
	id: string
	type: 'code_generation' | 'bug_fix' | 'optimization' | 'testing'
	project: string
	description: string
	timestamp: string
	confidence: number
}

export default function AIDEDashboard() {
	const [activeTab, setActiveTab] = useState('overview')
	const [metrics, setMetrics] = useState<DevelopmentMetrics>({
		activeProjects: 24,
		aiAssistRequests: 342,
		buildSuccessRate: 94,
		linesOfCode: 487650,
		developersActive: 18,
		deploymentsToday: 12,
		codeQualityScore: 87,
		systemUptime: 99.8
	})

	const [recentProjects] = useState<Project[]>([
		{
			id: '1',
			name: 'CODAI Frontend',
			description: 'Next.js frontend for CODAI ecosystem',
			language: 'TypeScript',
			status: 'active',
			progress: 87,
			lastCommit: '2 hours ago',
			aiAssisted: true
		},
		{
			id: '2',
			name: 'AI Model Server',
			description: 'Machine learning model serving infrastructure',
			language: 'Python',
			status: 'building',
			progress: 65,
			lastCommit: '15 minutes ago',
			aiAssisted: true
		},
		{
			id: '3',
			name: 'API Gateway',
			description: 'Microservices API gateway and routing',
			language: 'Go',
			status: 'deployed',
			progress: 100,
			lastCommit: '1 day ago',
			aiAssisted: false
		}
	])

	const [aiActivity] = useState<AIActivity[]>([
		{
			id: '1',
			type: 'code_generation',
			project: 'CODAI Frontend',
			description: 'Generated responsive dashboard components',
			timestamp: '5 minutes ago',
			confidence: 96
		},
		{
			id: '2',
			type: 'bug_fix',
			project: 'AI Model Server',
			description: 'Fixed memory leak in inference pipeline',
			timestamp: '18 minutes ago',
			confidence: 89
		},
		{
			id: '3',
			type: 'optimization',
			project: 'API Gateway',
			description: 'Optimized database query performance',
			timestamp: '1 hour ago',
			confidence: 94
		}
	])

	// Real-time updates
	useEffect(() => {
		const interval = setInterval(() => {
			setMetrics(prev => ({
				...prev,
				aiAssistRequests: prev.aiAssistRequests + Math.floor(Math.random() * 3),
				systemUptime: Math.max(99.0, Math.min(100, prev.systemUptime + (Math.random() - 0.5) * 0.1))
			}))
		}, 5000)

		return () => clearInterval(interval)
	}, [])

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
			case 'deployed': return 'text-green-600 bg-green-100'
			case 'building': return 'text-yellow-600 bg-yellow-100'
			case 'error': return 'text-red-600 bg-red-100'
			default: return 'text-gray-600 bg-gray-100'
		}
	}

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'code_generation': return <Code2 className="w-4 h-4 text-blue-500" />
			case 'bug_fix': return <CheckCircle className="w-4 h-4 text-green-500" />
			case 'optimization': return <Zap className="w-4 h-4 text-yellow-500" />
			case 'testing': return <FileText className="w-4 h-4 text-purple-500" />
			default: return <Bot className="w-4 h-4 text-gray-500" />
		}
	}

	const getLanguageColor = (language: string) => {
		switch (language.toLowerCase()) {
			case 'typescript':
			case 'javascript': return 'bg-yellow-100 text-yellow-700'
			case 'python': return 'bg-green-100 text-green-700'
			case 'go': return 'bg-blue-100 text-blue-700'
			default: return 'bg-gray-100 text-gray-700'
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
			{/* Enhanced Header */}
			<motion.header
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-blue-600 text-white py-8 shadow-xl overflow-hidden"
			>
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
								<Code2 className="w-8 h-8" />
							</div>
							<div>
								<h1 className="text-3xl font-bold">AIDE Development Dashboard</h1>
								<p className="text-slate-100">AI-Powered Development Environment & Code Intelligence</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-right">
								<div className="text-sm text-slate-100">System Uptime</div>
								<div className="text-2xl font-bold">{metrics.systemUptime.toFixed(1)}%</div>
							</div>
							<div className="flex space-x-2">
								<button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
									<Bell className="w-5 h-5" />
								</button>
								<button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
									<Settings className="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>

					{/* Development Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-slate-100 text-sm">Active Projects</div>
									<div className="text-2xl font-bold">{metrics.activeProjects}</div>
								</div>
								<Layers className="w-8 h-8 text-slate-200" />
							</div>
						</div>
						<div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-slate-100 text-sm">AI Assists Today</div>
									<div className="text-2xl font-bold">{metrics.aiAssistRequests}</div>
								</div>
								<Bot className="w-8 h-8 text-slate-200" />
							</div>
						</div>
						<div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-slate-100 text-sm">Build Success Rate</div>
									<div className="text-2xl font-bold">{metrics.buildSuccessRate}%</div>
								</div>
								<CheckCircle className="w-8 h-8 text-slate-200" />
							</div>
						</div>
						<div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-slate-100 text-sm">Lines of Code</div>
									<div className="text-2xl font-bold">{(metrics.linesOfCode / 1000).toFixed(0)}k</div>
								</div>
								<Code2 className="w-8 h-8 text-slate-200" />
							</div>
						</div>
					</div>
				</div>
			</motion.header>

			{/* Tab Navigation */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="bg-white rounded-xl shadow-lg p-1 mb-8">
					<div className="flex space-x-1">
						{[
							{ id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
							{ id: 'projects', label: 'Projects', icon: <Layers className="w-4 h-4" />, count: recentProjects.length },
							{ id: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" />, count: aiActivity.length },
							{ id: 'environments', label: 'Environments', icon: <Database className="w-4 h-4" /> },
							{ id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
							{ id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
										? 'bg-gradient-to-r from-slate-500 to-blue-500 text-white shadow-lg'
										: 'text-gray-600 hover:text-slate-600 hover:bg-slate-50'
									}`}
							>
								{tab.icon}
								<span className="font-medium">{tab.label}</span>
								{tab.count && (
									<span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white text-slate-600' : 'bg-slate-100 text-slate-600'
										}`}>
										{tab.count}
									</span>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Tab Content */}
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{activeTab === 'overview' && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Content */}
							<div className="lg:col-span-2">
								{/* Quick Actions */}
								<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<button className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
											<Plus className="w-6 h-6 text-slate-600 mb-2" />
											<span className="text-sm font-medium text-slate-700">New Project</span>
										</button>
										<button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
											<Bot className="w-6 h-6 text-blue-600 mb-2" />
											<span className="text-sm font-medium text-blue-700">AI Assistant</span>
										</button>
										<button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
											<Rocket className="w-6 h-6 text-green-600 mb-2" />
											<span className="text-sm font-medium text-green-700">Deploy</span>
										</button>
										<button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
											<TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
											<span className="text-sm font-medium text-purple-700">Analytics</span>
										</button>
									</div>
								</div>

								{/* Recent Projects */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
										<button className="text-slate-600 hover:text-slate-700 flex items-center space-x-1">
											<span>View All</span>
											<ChevronRight className="w-4 h-4" />
										</button>
									</div>
									<div className="space-y-4">
										{recentProjects.map((project) => (
											<div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
												<div className="flex items-start justify-between mb-3">
													<div className="flex-1">
														<div className="flex items-center space-x-2 mb-1">
															<h4 className="font-medium text-gray-900">{project.name}</h4>
															{project.aiAssisted && (
																<span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
																	AI
																</span>
															)}
														</div>
														<p className="text-sm text-gray-600 mb-2">{project.description}</p>
														<div className="flex items-center space-x-4 text-xs text-gray-500">
															<span className={`px-2 py-1 rounded-md ${getLanguageColor(project.language)}`}>
																{project.language}
															</span>
															<span>Last commit: {project.lastCommit}</span>
														</div>
													</div>
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
														{project.status}
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-slate-500 h-2 rounded-full transition-all duration-300"
														style={{ width: `${project.progress}%` }}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								{/* AI Activity */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
										<Bot className="w-5 h-5 text-blue-500 mr-2" />
										AI Assistant Activity
									</h3>
									<div className="space-y-3">
										{aiActivity.map((activity) => (
											<div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
												{getActivityIcon(activity.type)}
												<div className="flex-1 min-w-0">
													<p className="text-sm text-gray-900 font-medium">{activity.project}</p>
													<p className="text-xs text-gray-600">{activity.description}</p>
													<div className="flex items-center justify-between mt-1">
														<span className="text-xs text-gray-500">{activity.timestamp}</span>
														<span className="text-xs text-green-600 font-medium">{activity.confidence}% confidence</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* System Status */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Build Queue</span>
											<span className="text-sm font-medium text-green-600">3 jobs</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Active Deployments</span>
											<span className="text-sm font-medium text-blue-600">{metrics.deploymentsToday}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Code Quality Score</span>
											<span className="text-sm font-medium text-purple-600">{metrics.codeQualityScore}%</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Developers Online</span>
											<span className="text-sm font-medium text-orange-600">{metrics.developersActive}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Other tab content placeholders */}
					{activeTab === 'projects' && (
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Project Management</h3>
							<div className="text-center py-12">
								<Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">Project Management Coming Soon</h4>
								<p className="text-gray-600">Comprehensive project management with AI-powered insights and automation.</p>
							</div>
						</div>
					)}

					{activeTab === 'ai-assistant' && (
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-4">AI Development Assistant</h3>
							<div className="text-center py-12">
								<Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">AI Assistant Coming Soon</h4>
								<p className="text-gray-600">Intelligent code generation, bug fixing, and optimization assistance.</p>
							</div>
						</div>
					)}

					{activeTab === 'environments' && (
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Development Environments</h3>
							<div className="text-center py-12">
								<Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">Environment Management Coming Soon</h4>
								<p className="text-gray-600">Manage development, staging, and production environments with monitoring.</p>
							</div>
						</div>
					)}

					{activeTab === 'analytics' && (
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibent text-gray-900 mb-4">Development Analytics</h3>
							<div className="text-center py-12">
								<TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard Coming Soon</h4>
								<p className="text-gray-600">Comprehensive development metrics, performance insights, and team productivity analytics.</p>
							</div>
						</div>
					)}

					{activeTab === 'team' && (
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
							<div className="text-center py-12">
								<Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-medium text-gray-900 mb-2">Team Management Coming Soon</h4>
								<p className="text-gray-600">Developer team management, collaboration tools, and productivity tracking.</p>
							</div>
						</div>
					)}
				</motion.div>
			</div>

			{/* Footer */}
			<footer className="bg-gradient-to-r from-slate-700 via-slate-600 to-blue-600 text-white py-12 mt-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
						>
							<Code2 className="w-8 h-8 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">AI-Powered Development</h3>
							<p className="text-slate-100 text-sm mb-4">
								Accelerate development with intelligent code generation and assistance
							</p>
							<button className="bg-white text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
								Start Coding
							</button>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
						>
							<Rocket className="w-8 h-8 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Rapid Deployment</h3>
							<p className="text-slate-100 text-sm mb-4">
								Deploy applications instantly with automated CI/CD pipelines
							</p>
							<button className="bg-white text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
								Deploy Now
							</button>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
						>
							<TrendingUp className="w-8 h-8 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
							<p className="text-slate-100 text-sm mb-4">
								Monitor and optimize your development workflow with detailed analytics
							</p>
							<button className="bg-white text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
								View Analytics
							</button>
						</motion.div>
					</div>

					<div className="text-center mt-8 pt-8 border-t border-white/20">
						<p className="text-slate-100">
							© 2025 AIDE - AI Development Environment. Part of the CODAI Ecosystem.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
