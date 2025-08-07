'use client'

import React from 'react'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ChatInterface } from '../../components/chat/ChatInterface'
import { LivePreview } from '../../components/preview/LivePreview'
import { MemoryGraphViewer } from '../../components/memory/MemoryGraphViewer'
import { ProjectTimeline } from '../../components/timeline/ProjectTimeline'
import { AgentOrchestrator } from '../../components/agents/AgentOrchestrator'
import { ProjectManager, DevelopmentSession, projectToSession } from '../../lib/services/project-manager'
import { useNotifications } from '../../components/ui/Notifications'
import {
	ChatBubbleLeftRightIcon,
	CodeBracketIcon,
	ClockIcon,
	CpuChipIcon,
	EyeIcon
} from '@heroicons/react/24/outline'

export default function DevelopPage() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const { addNotification } = useNotifications()
	const [activeSession, setActiveSession] = useState<DevelopmentSession | null>(null)
	const [activeView, setActiveView] = useState<'chat' | 'preview' | 'memory' | 'timeline'>('chat')
	const [isCreatingProject, setIsCreatingProject] = useState(false)
	const projectManager = useRef<ProjectManager | null>(null)

	const navigationItems = [
		{
			label: 'Chat',
			href: '/develop',
			icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
			isActive: activeView === 'chat'
		},
		{
			label: 'Live Preview',
			href: '/develop?view=preview',
			icon: <EyeIcon className="h-5 w-5" />,
			isActive: activeView === 'preview'
		},
		{
			label: 'Memory Graph',
			href: '/develop?view=memory',
			icon: <CpuChipIcon className="h-5 w-5" />,
			isActive: activeView === 'memory'
		},
		{
			label: 'Timeline',
			href: '/develop?view=timeline',
			icon: <ClockIcon className="h-5 w-5" />,
			isActive: activeView === 'timeline'
		}
	]

	const userInfo = user ? {
		name: user.displayName || user.email?.split('@')[0] || 'Developer',
		email: user.email || '',
		role: 'Developer'
	} : undefined

	useEffect(() => {
		if (!loading && !user) {
			router.push('/login')
		}

		if (user) {
			initializeProjectManager()
		}
	}, [user, loading, router])
	const initializeProjectManager = async () => {
		try {
			projectManager.current = ProjectManager.getInstance()

			// Check for existing active session
			const projects = await projectManager.current.getActiveSessions(user!.uid)
			if (projects.length > 0) {
				setActiveSession(projectToSession(projects[0]))
			}
		} catch (error) {
			console.error('Failed to initialize project manager:', error)
			addNotification({
				type: 'error',
				title: 'Initialization failed',
				message: 'Could not initialize the development environment.',
				duration: 5000
			})
		}
	}

	const createNewProject = async (prompt: string) => {
		if (!projectManager.current) return setIsCreatingProject(true)
		try {
			const project = await projectManager.current.createProject({
				name: `New AIDE Project`,
				description: prompt,
				template: 'web-app',
				features: ['ai-native', 'real-time'],
				userId: user!.uid
			})

			const session = projectToSession(project)
			setActiveSession(session)
			addNotification({
				type: 'success',
				title: 'Project created',
				message: 'Your new AI-native project has been initialized.',
				duration: 3000
			})
		} catch (error) {
			console.error('Failed to create project:', error)
			addNotification({
				type: 'error',
				title: 'Project creation failed',
				message: 'Could not create your project. Please try again.',
				duration: 5000
			})
		} finally {
			setIsCreatingProject(false)
		}
	}

	const handleChatMessage = async (message: string) => {
		if (!activeSession || !projectManager.current) {
			// Create new project if none exists
			await createNewProject(message)
			return
		}

		try {
			await projectManager.current.processMessage(activeSession.id, message)
			// Session will be updated through the project manager's event system
		} catch (error) {
			console.error('Failed to process message:', error)
			addNotification({
				type: 'error',
				title: 'Message processing failed',
				message: 'The AI agent could not process your request.',
				duration: 5000
			})
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600 dark:text-slate-400">Loading AIDE Development Environment...</p>
				</div>
			</div>
		)
	}

	return (<DashboardLayout
		navigationItems={navigationItems}
		userInfo={userInfo}
		pageTitle="AIDE Development Environment"
		pageDescription="Build applications through natural language conversation"
	>
		<div className="flex h-full">
			{/* Main Content Area */}
			<div className="flex-1 flex flex-col">
				{activeView === 'chat' && (
					<ChatInterface
						session={activeSession}
						onMessage={handleChatMessage}
						isCreatingProject={isCreatingProject}
						className="flex-1"
					/>
				)}

				{activeView === 'preview' && (
					<LivePreview
						session={activeSession}
						className="flex-1"
					/>
				)}

				{activeView === 'memory' && (
					<MemoryGraphViewer
						session={activeSession}
						className="flex-1"
					/>
				)}

				{activeView === 'timeline' && (
					<ProjectTimeline
						session={activeSession}
						className="flex-1"
					/>
				)}
			</div>

			{/* Agent Orchestrator Sidebar */}
			<div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">					<AgentOrchestrator
				session={activeSession}
				onTaskUpdate={(task: any) => {
					// Handle agent task updates
					console.log('Agent task update:', task)
				}}
			/>
			</div>
		</div>
	</DashboardLayout>
	)
}

