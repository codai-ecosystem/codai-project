'use client';

import React, { useState, useEffect } from 'react';
import { Clock, GitCommit, Code, MessageSquare, Play, CheckCircle, AlertCircle, History } from 'lucide-react';

interface TimelineEvent {
	id: string;
	type: 'chat' | 'code_generation' | 'execution' | 'commit' | 'milestone';
	title: string;
	description?: string;
	timestamp: Date;
	metadata?: {
		user?: string;
		files?: string[];
		status?: 'success' | 'error' | 'pending';
		details?: any;
	};
}

interface DevelopmentSession {
	id: string;
	projectId: string;
	name: string;
	description?: string;
	status: 'active' | 'paused' | 'completed';
	createdAt: Date;
	lastActivity: Date;
	memoryGraph: any;
	timeline: any[];
	previewUrl?: string;
}

interface ProjectTimelineProps {
	session?: DevelopmentSession | null;
	projectId?: string;
	height?: string;
	className?: string;
	onEventSelect?: (event: TimelineEvent) => void;
}

export function ProjectTimeline({
	session,
	projectId,
	height = '400px',
	className = '',
	onEventSelect
}: ProjectTimelineProps) {
	const [events, setEvents] = useState<TimelineEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [filter, setFilter] = useState<string>('all');

	useEffect(() => {
		loadTimeline();
	}, [projectId]);

	const loadTimeline = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/project/timeline${projectId ? `?projectId=${projectId}` : ''}`);
			const data = await response.json();

			const timelineEvents: TimelineEvent[] = data.events?.map((event: any) => ({
				...event,
				timestamp: new Date(event.timestamp)
			})) || [];

			setEvents(timelineEvents);
		} catch (error) {
			console.error('Failed to load timeline:', error);
			// Create demo timeline data
			setEvents([
				{
					id: '1',
					type: 'chat',
					title: 'Started new conversation',
					description: 'User: "Help me create a React component for a todo list"',
					timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
					metadata: { user: 'user', status: 'success' }
				},
				{
					id: '2',
					type: 'code_generation',
					title: 'Generated TodoList component',
					description: 'Created TodoList.tsx with state management and CRUD operations',
					timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
					metadata: { files: ['TodoList.tsx'], status: 'success' }
				},
				{
					id: '3',
					type: 'execution',
					title: 'Component preview generated',
					description: 'Successfully compiled and rendered TodoList component',
					timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
					metadata: { status: 'success' }
				},
				{
					id: '4',
					type: 'chat',
					title: 'Requested styling improvements',
					description: 'User: "Can you add some better styling with Tailwind CSS?"',
					timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
					metadata: { user: 'user', status: 'success' }
				},
				{
					id: '5',
					type: 'code_generation',
					title: 'Updated component styling',
					description: 'Added Tailwind CSS classes for improved UI design',
					timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
					metadata: { files: ['TodoList.tsx'], status: 'success' }
				},
				{
					id: '6',
					type: 'milestone',
					title: 'TodoList component completed',
					description: 'Component is ready with all requested features and styling',
					timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
					metadata: { status: 'success' }
				}
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredEvents = events.filter(event => {
		if (filter === 'all') return true;
		return event.type === filter;
	});

	const getEventIcon = (type: string) => {
		switch (type) {
			case 'chat': return MessageSquare;
			case 'code_generation': return Code;
			case 'execution': return Play;
			case 'commit': return GitCommit;
			case 'milestone': return CheckCircle;
			default: return Clock;
		}
	};

	const getEventColor = (type: string) => {
		switch (type) {
			case 'chat': return 'text-blue-500';
			case 'code_generation': return 'text-green-500';
			case 'execution': return 'text-purple-500';
			case 'commit': return 'text-orange-500';
			case 'milestone': return 'text-emerald-500';
			default: return 'text-gray-500';
		}
	};

	const getStatusIcon = (status?: string) => {
		switch (status) {
			case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
			case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
			case 'pending': return <Clock className="w-3 h-3 text-yellow-500" />;
			default: return null;
		}
	};

	const formatTimeAgo = (timestamp: Date) => {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return 'Just now';
	};

	const handleEventClick = (event: TimelineEvent) => {
		setSelectedEvent(event);
		onEventSelect?.(event);
	};

	if (isLoading) {
		return (
			<div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`} style={{ height }}>
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<p className="text-sm text-gray-500">Loading timeline...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`} style={{ height }}>
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
				<div className="flex items-center gap-2">
					<History className="w-4 h-4" />
					<span className="text-sm font-medium">Project Timeline</span>
					<span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
						{filteredEvents.length} events
					</span>
				</div>
			</div>

			{/* Filter */}
			<div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
				<select
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Events</option>
					<option value="chat">Chat Messages</option>
					<option value="code_generation">Code Generation</option>
					<option value="execution">Executions</option>
					<option value="commit">Commits</option>
					<option value="milestone">Milestones</option>
				</select>
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-auto p-4">
				{filteredEvents.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						<Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
						<p className="text-sm">No events found</p>
					</div>
				) : (
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

						{/* Events */}
						<div className="space-y-4">
							{filteredEvents.map((event, index) => {
								const Icon = getEventIcon(event.type);
								return (
									<div
										key={event.id}
										className={`relative flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors ${selectedEvent?.id === event.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
											}`}
										onClick={() => handleEventClick(event)}
									>
										{/* Timeline dot */}
										<div className={`relative z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center ${getEventColor(event.type)}`}>
											<Icon className="w-4 h-4" />
										</div>

										{/* Event content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
													{event.title}
												</h3>
												{getStatusIcon(event.metadata?.status)}
											</div>

											{event.description && (
												<p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
													{event.description}
												</p>
											)}

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="text-xs text-gray-500">
														{formatTimeAgo(event.timestamp)}
													</span>
													{event.metadata?.files && event.metadata.files.length > 0 && (
														<span className="text-xs text-gray-500">
															{event.metadata.files.length} file{event.metadata.files.length > 1 ? 's' : ''}
														</span>
													)}
												</div>
												<span className={`text-xs font-medium px-2 py-0.5 rounded ${event.type === 'milestone' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
														event.type === 'code_generation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
															event.type === 'chat' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
																'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
													}`}>
													{event.type.replace('_', ' ')}
												</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
