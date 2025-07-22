'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bot, Zap, Settings, Users, Activity, MessageSquare, Play, Pause, RotateCcw, Send } from 'lucide-react';

// Define types locally to avoid dependency issues
interface AgentStatus {
	id: string;
	name: string;
	status: 'idle' | 'running' | 'paused' | 'error';
	lastActivity: Date;
	tasksCompleted: number;
	currentTask?: string;
	currentTasks?: number;
	isAvailable?: boolean;
	averageResponseTime?: number;
	successRate?: number;
}

interface Task {
	id: string;
	agentId: string;
	type: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	input: any;
	output?: any;
	startTime: Date;
	endTime?: Date;
	title?: string;
	description?: string;
}

interface TaskResult {
	taskId: string;
	status: 'success' | 'error';
	result?: any;
	error?: string;
}

interface AgentMessage {
	id: string;
	agentId: string;
	content: string;
	type: 'info' | 'warning' | 'error' | 'success';
	timestamp: Date;
}

interface AgentRuntime {
	messages$: {
		subscribe: (callback: (message: AgentMessage) => void) => { unsubscribe: () => void };
	};
	tasks$: {
		subscribe: (callback: (taskEvent: any) => void) => { unsubscribe: () => void };
	};
	status$: {
		subscribe: (callback: (statusEvent: { agentId: string; status: AgentStatus }) => void) => { unsubscribe: () => void };
	};
	initialize: () => Promise<void>;
	executeTask: (task: Task) => Promise<TaskResult>;
	getAgentStatuses: () => Map<string, AgentStatus>;
}

// Conditional import for memory graph - avoid Node.js dependencies in browser
let MemoryGraphEngine: any;
if (typeof window === 'undefined') {
	// Server-side - can import Node.js modules
	import('@codai/memory-graph').then(module => {
		MemoryGraphEngine = module.MemoryGraphEngine;
	}).catch(() => {
		// Fallback if import fails
		MemoryGraphEngine = null;
	});
} else {
	// Browser - use localStorage-based memory instead
	MemoryGraphEngine = null;
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

interface AgentOrchestratorProps {
	session?: DevelopmentSession | null;
	onTaskUpdate?: (task: any) => void;
	className?: string;
}

interface AgentDashboardState {
	agents: Map<string, AgentStatus>;
	activeTasks: Task[];
	recentMessages: AgentMessage[];
	isInitialized: boolean;
	isProcessing: boolean;
}

/**
 * Agent Orchestrator Component
 * Main dashboard interface for managing and monitoring AI agents
 */
export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({
	session,
	onTaskUpdate,
	className = '',
}) => {
	const [state, setState] = useState<AgentDashboardState>({
		agents: new Map(),
		activeTasks: [],
		recentMessages: [],
		isInitialized: false,
		isProcessing: false,
	});
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [showConversation, setShowConversation] = useState(false);
	const [agentRuntime, setAgentRuntime] = useState<AgentRuntime | null>(null);
	const [memoryGraph, setMemoryGraph] = useState<any | null>(null);
	const [conversationId] = useState<string>('main-conversation');

	// Initialize agent runtime and memory graph
	useEffect(() => {
		const initializeAgents = async (): Promise<void> => {
			try {
				// Initialize memory graph (in-memory for demo)
				const graph = MemoryGraphEngine ? new MemoryGraphEngine({
					nodes: new Map(),
					edges: new Map(),
				}) : { nodes: new Map(), edges: new Map() }; // Fallback for browser				// Initialize mock agent runtime
				const runtime: AgentRuntime = {
					messages$: {
						subscribe: (callback: (message: AgentMessage) => void) => {
							return { unsubscribe: () => { } };
						}
					},
					tasks$: {
						subscribe: (callback: (taskEvent: any) => void) => {
							return { unsubscribe: () => { } };
						}
					},
					status$: {
						subscribe: (callback: (statusEvent: { agentId: string; status: AgentStatus }) => void) => {
							return { unsubscribe: () => { } };
						}
					},
					initialize: async () => { },
					executeTask: async (task: Task) => ({ taskId: task.id, status: 'success' as const }), getAgentStatuses: () => {
						// Return mock agent statuses
						const mockStatuses = new Map<string, AgentStatus>();
						mockStatuses.set('planner', {
							id: 'planner',
							name: 'Planner Agent',
							status: 'idle',
							lastActivity: new Date(),
							tasksCompleted: 0,
							currentTasks: 0,
							isAvailable: true,
							averageResponseTime: 150,
							successRate: 0.95
						});
						mockStatuses.set('builder', {
							id: 'builder',
							name: 'Builder Agent',
							status: 'idle',
							lastActivity: new Date(),
							tasksCompleted: 0,
							currentTasks: 0,
							isAvailable: true,
							averageResponseTime: 200,
							successRate: 0.92
						});
						mockStatuses.set('designer', {
							id: 'designer',
							name: 'Designer Agent',
							status: 'idle',
							lastActivity: new Date(),
							tasksCompleted: 0,
							currentTasks: 0,
							isAvailable: true,
							averageResponseTime: 180,
							successRate: 0.97
						});
						return mockStatuses;
					}
				};

				setMemoryGraph(graph);
				setAgentRuntime(runtime);

				// Set up event subscriptions
				const messagesSubscription = runtime.messages$.subscribe((message) => {
					setState(prev => ({
						...prev,
						recentMessages: [...prev.recentMessages.slice(-19), message],
					}));
				});

				const tasksSubscription = runtime.tasks$.subscribe((taskEvent) => {
					setState(prev => {
						let activeTasks = prev.activeTasks;
						if (taskEvent.type === 'started') {
							activeTasks = [...activeTasks, taskEvent.task];
						} else if (taskEvent.type === 'completed' || taskEvent.type === 'failed') {
							activeTasks = activeTasks.filter(t => t.id !== taskEvent.task.id);
						}
						return { ...prev, activeTasks };
					});
				});

				const statusSubscription = runtime.status$.subscribe(({ agentId, status }) => {
					setState(prev => ({
						...prev,
						agents: new Map(prev.agents.set(agentId, status)),
					}));
				}); setState(prev => ({ ...prev, isInitialized: true })); setState(prev => ({ ...prev, isInitialized: true }));
			} catch (error) {
				console.error('Failed to initialize agent runtime:', error);
			}
		};

		let messagesSubscription: any = null;
		let tasksSubscription: any = null;
		let statusSubscription: any = null;

		const initializeWithSubscriptions = async () => {
			try {
				// Create mock memory graph
				const graph = {
					addNode: (node: any) => console.log('Adding node:', node),
					addEdge: (edge: any) => console.log('Adding edge:', edge),
					query: (query: string) => {
						console.log('Querying memory graph:', query);
						return [];
					},
					getNodes: () => [],
					getEdges: () => []
				};

				// Create mock agent runtime
				const runtime: AgentRuntime = {
					messages$: {
						subscribe: (callback: (message: AgentMessage) => void) => {
							const interval = setInterval(() => {
								callback({
									id: `msg-${Date.now()}`,
									agentId: 'system',
									content: 'Agent runtime initialized',
									type: 'info',
									timestamp: new Date()
								});
							}, 30000);
							return { unsubscribe: () => clearInterval(interval) };
						}
					},
					tasks$: {
						subscribe: (callback: (taskEvent: any) => void) => {
							return { unsubscribe: () => { } };
						}
					},
					status$: {
						subscribe: (callback: (statusEvent: { agentId: string; status: AgentStatus }) => void) => {
							return { unsubscribe: () => { } };
						}
					},
					initialize: async () => {
						console.log('Agent runtime initialized');
					},
					executeTask: async (task: Task) => {
						console.log('Executing task:', task);
						return { taskId: task.id, status: 'success' as const };
					},
					getAgentStatuses: () => {
						const mockStatuses = new Map<string, AgentStatus>();
						mockStatuses.set('orchestrator', {
							id: 'orchestrator',
							name: 'Orchestrator Agent',
							status: 'running',
							lastActivity: new Date(),
							tasksCompleted: 15,
							currentTasks: 2,
							isAvailable: true,
							averageResponseTime: 120,
							successRate: 0.95
						});
						mockStatuses.set('developer', {
							id: 'developer',
							name: 'Developer Agent',
							status: 'idle',
							lastActivity: new Date(),
							tasksCompleted: 8,
							currentTasks: 0,
							isAvailable: true,
							averageResponseTime: 200,
							successRate: 0.92
						});
						mockStatuses.set('designer', {
							id: 'designer',
							name: 'Designer Agent',
							status: 'idle',
							lastActivity: new Date(),
							tasksCompleted: 0,
							currentTasks: 0,
							isAvailable: true,
							averageResponseTime: 180,
							successRate: 0.97
						});
						return mockStatuses;
					}
				};

				setMemoryGraph(graph);
				setAgentRuntime(runtime);

				// Set up event subscriptions
				messagesSubscription = runtime.messages$.subscribe((message) => {
					setState(prev => ({
						...prev,
						recentMessages: [...prev.recentMessages.slice(-19), message],
					}));
				});

				tasksSubscription = runtime.tasks$.subscribe((taskEvent) => {
					setState(prev => {
						let activeTasks = prev.activeTasks;
						if (taskEvent.type === 'started') {
							activeTasks = [...activeTasks, taskEvent.task];
						} else if (taskEvent.type === 'completed' || taskEvent.type === 'failed') {
							activeTasks = activeTasks.filter(t => t.id !== taskEvent.task.id);
						}
						return { ...prev, activeTasks };
					});
				});

				statusSubscription = runtime.status$.subscribe(({ agentId, status }) => {
					setState(prev => ({
						...prev,
						agents: new Map(prev.agents.set(agentId, status)),
					}));
				});

				setState(prev => ({ ...prev, isInitialized: true }));
			} catch (error) {
				console.error('Failed to initialize agent runtime:', error);
			}
		};

		initializeWithSubscriptions();

		// Return cleanup function for useEffect
		return () => {
			if (messagesSubscription) {
				messagesSubscription.unsubscribe();
			}
			if (tasksSubscription) {
				tasksSubscription.unsubscribe();
			}
			if (statusSubscription) {
				statusSubscription.unsubscribe();
			}
		};
	}, []);

	// Update agent statuses periodically
	useEffect(() => {
		if (!agentRuntime) return;

		const updateStatuses = () => {
			const statuses = agentRuntime.getAgentStatuses();
			setState(prev => ({ ...prev, agents: statuses }));
		};

		updateStatuses();
		const interval = setInterval(updateStatuses, 2000);

		return () => clearInterval(interval);
	}, [agentRuntime]);

	const handleSendTask = useCallback(async (taskDescription: string) => {
		if (!agentRuntime || !taskDescription.trim()) return;

		setState(prev => ({ ...prev, isProcessing: true }));
		try {
			const task: Task = {
				id: `task-${Date.now()}`,
				agentId: 'orchestrator',
				type: 'general',
				status: 'pending',
				input: { description: taskDescription },
				startTime: new Date(),
				title: taskDescription,
				description: taskDescription,
			};

			await agentRuntime.executeTask(task);
		} catch (error) {
			console.error('Failed to execute task:', error);
		} finally {
			setState(prev => ({ ...prev, isProcessing: false }));
		}
	}, [agentRuntime]);

	const agentArray = useMemo(() => Array.from(state.agents.entries()), [state.agents]);
	const getAgentStatusColor = (status: AgentStatus): string => {
		if ((status.currentTasks || 0) > 0) return 'bg-green-500';
		if (status.lastActivity && Date.now() - status.lastActivity.getTime() < 60000) return 'bg-yellow-500';
		return 'bg-gray-400';
	};

	const getAgentStatusText = (status: AgentStatus): string => {
		if ((status.currentTasks || 0) > 0) return `Active (${status.currentTasks} tasks)`;
		if (status.isAvailable) return 'Available';
		return 'Inactive';
	};

	if (!state.isInitialized) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<div className="flex items-center space-x-3">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="text-gray-600">Initializing AI agents...</span>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Bot className="h-8 w-8 text-blue-600" />
					<div>
						<h2 className="text-2xl font-bold text-gray-900">AI Agent Orchestrator</h2>
						<p className="text-gray-600">Manage and monitor your AI development team</p>
					</div>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
						<Activity className="h-5 w-5 text-green-600" />
						<span className="text-green-800 font-medium">{agentArray.length} Agents Active</span>
					</div>
					<button
						onClick={() => setShowConversation(!showConversation)}
						className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<MessageSquare className="h-5 w-5" />
						<span>Chat Interface</span>
					</button>
				</div>
			</div>

			{/* Agent Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{agentArray.map(([agentId, status]) => (
					<div
						key={agentId}
						className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
						onClick={() => setSelectedAgent(agentId)}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-3">
								<div className={`w-3 h-3 rounded-full ${getAgentStatusColor(status)}`}></div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 capitalize">
										{agentId.replace(/([A-Z])/g, ' $1').trim()}
									</h3>
									<p className="text-sm text-gray-600">{getAgentStatusText(status)}</p>
								</div>
							</div>
							<Settings className="h-5 w-5 text-gray-400" />
						</div>

						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Tasks Completed:</span>
								<span className="font-medium">{status.tasksCompleted || 0}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Avg Response:</span>
								<span className="font-medium">{status.averageResponseTime || 0}ms</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Success Rate:</span>
								<span className="font-medium">{((status.successRate || 0) * 100).toFixed(1)}%</span>
							</div>
						</div>						{(status.currentTasks || 0) > 0 && (
							<div className="mt-4 p-3 bg-blue-50 rounded-lg">
								<div className="flex items-center space-x-2">
									<Zap className="h-4 w-4 text-blue-600" />
									<span className="text-sm font-medium text-blue-800">
										Working on {status.currentTasks || 0} task{(status.currentTasks || 0) > 1 ? 's' : ''}
									</span>
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Active Tasks Panel */}
			{state.activeTasks.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center space-x-3 mb-4">
						<Activity className="h-6 w-6 text-orange-600" />
						<h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
						<span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
							{state.activeTasks.length}
						</span>
					</div>
					<div className="space-y-3">
						{state.activeTasks.map((task) => (
							<div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<h4 className="font-medium text-gray-900">{task.title}</h4>
									<p className="text-sm text-gray-600">{task.description}</p>
								</div>
								<div className="flex items-center space-x-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
									<span className="text-sm text-gray-600 capitalize">{task.status}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Quick Task Input */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Play className="h-6 w-6 text-green-600" />
					<h3 className="text-lg font-semibold text-gray-900">Quick Task</h3>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.currentTarget);
						const taskDescription = formData.get('task') as string;
						handleSendTask(taskDescription);
						e.currentTarget.reset();
					}}
					className="flex space-x-3"
				>
					<input
						type="text"
						name="task"
						placeholder="Describe a task for the AI agents to work on..."
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={state.isProcessing}
					/>
					<button
						type="submit"
						disabled={state.isProcessing}
						className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
					>
						{state.isProcessing ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Processing...</span>
							</>
						) : (
							<>
								<Play className="h-4 w-4" />
								<span>Execute</span>
							</>
						)}
					</button>
				</form>
			</div>

			{/* Conversation Interface Modal */}
			{showConversation && agentRuntime && memoryGraph && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h3 className="text-lg font-semibold text-gray-900">AI Conversation</h3>
							<button
								onClick={() => setShowConversation(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								×
							</button>
						</div>						<div className="flex-1 overflow-hidden p-4">
							<div className="h-full flex flex-col">
								<div className="flex-1 overflow-y-auto mb-4">
									<div className="space-y-2">
										{state.recentMessages.map((message, index) => (
											<div key={index} className="p-3 bg-gray-50 rounded-lg">
												<div className="text-sm text-gray-600">{message.timestamp.toLocaleTimeString()}</div>
												<div className="text-gray-900">{message.content}</div>
											</div>
										))}
									</div>
								</div>
								<div className="flex space-x-2">
									<input
										type="text"
										placeholder="Type a message..."
										className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									/>
									<button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
										<Send className="h-4 w-4" />
										<span>Send</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Recent Messages */}
			{state.recentMessages.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center space-x-3 mb-4">
						<MessageSquare className="h-6 w-6 text-purple-600" />
						<h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
					</div>
					<div className="space-y-3 max-h-64 overflow-y-auto">
						{state.recentMessages.slice(-5).map((message, index) => (<div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
							<div className={`w-2 h-2 rounded-full mt-2 ${message.type === 'error' ? 'bg-red-500' :
									message.type === 'warning' ? 'bg-yellow-500' :
										message.type === 'success' ? 'bg-green-500' :
											'bg-blue-500'
								}`}></div>
							<div className="flex-1">
								<div className="flex items-center space-x-2 mb-1">
									<span className="text-sm font-medium text-gray-900">
										{message.agentId || 'System'}
									</span>
									<span className="text-xs text-gray-500">
										{new Date().toLocaleTimeString()}
									</span>
								</div>
								<p className="text-sm text-gray-700">{message.content}</p>
							</div>
						</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
