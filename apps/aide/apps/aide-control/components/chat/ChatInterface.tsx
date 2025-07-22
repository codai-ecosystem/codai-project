'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Play, Save } from 'lucide-react';
import { ScrollArea } from '../ui/ScrollArea';

interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	metadata?: {
		type?: 'code' | 'file' | 'command' | 'preview';
		language?: string;
		filename?: string;
		status?: 'pending' | 'success' | 'error';
	};
}

interface ChatInterfaceProps {
	session?: DevelopmentSession | null;
	onMessage?: (message: string) => Promise<void>;
	isCreatingProject?: boolean;
	className?: string;
	projectId?: string;
	onCodeGenerated?: (code: string, language: string, filename?: string) => void;
	onCommandExecuted?: (command: string) => void;
	onPreviewRequested?: (content: string, type: string) => void;
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

export function ChatInterface({
	session,
	onMessage,
	isCreatingProject = false,
	className = '',
	projectId,
	onCodeGenerated,
	onCommandExecuted,
	onPreviewRequested
}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: '1',
			role: 'system',
			content: 'Welcome to AIDE! I\'m your AI development assistant. I can help you build applications, write code, and manage your project. What would you like to create today?',
			timestamp: new Date(),
		}
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			// Call agent runtime service
			const response = await fetch('/api/agent/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: input,
					projectId,
					context: messages.slice(-5) // Send last 5 messages for context
				})
			});

			const data = await response.json();

			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response,
				timestamp: new Date(),
				metadata: data.metadata
			};

			setMessages(prev => [...prev, assistantMessage]);

			// Handle special response types
			if (data.metadata?.type === 'code' && onCodeGenerated) {
				onCodeGenerated(data.code, data.metadata.language, data.metadata.filename);
			} else if (data.metadata?.type === 'command' && onCommandExecuted) {
				onCommandExecuted(data.command);
			} else if (data.metadata?.type === 'preview' && onPreviewRequested) {
				onPreviewRequested(data.content, data.metadata.previewType);
			}

		} catch (error) {
			console.error('Chat error:', error);
			const errorMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'system',
				content: 'Sorry, I encountered an error. Please try again.',
				timestamp: new Date(),
				metadata: { status: 'error' }
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const renderMessage = (message: ChatMessage) => {
		const isUser = message.role === 'user';
		const isSystem = message.role === 'system';

		return (
			<div key={message.id} className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
				{!isUser && (
					<div className="flex-shrink-0">
						{isSystem ? (
							<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
								<Code className="w-4 h-4 text-white" />
							</div>
						) : (
							<div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
								<Bot className="w-4 h-4 text-white" />
							</div>
						)}
					</div>
				)}

				<div className={`max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
					<div className="flex items-start gap-2">
						{isUser && (
							<User className="w-4 h-4 mt-0.5 flex-shrink-0" />
						)}
						<div className="flex-1">
							<div className="text-sm whitespace-pre-wrap">{message.content}</div>

							{message.metadata && (
								<div className="mt-2 flex flex-wrap gap-1">
									{message.metadata.type && (
										<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-full">
											{message.metadata.type}
										</span>
									)}
									{message.metadata.language && (
										<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-full">
											{message.metadata.language}
										</span>
									)}
									{message.metadata.filename && (
										<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-full">
											{message.metadata.filename}
										</span>
									)}
								</div>
							)}

							{message.metadata?.type === 'code' && (
								<div className="mt-2 flex gap-1">
									<button
										className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
										onClick={() => onCodeGenerated?.(message.content, message.metadata?.language || 'javascript')}
									>
										<Save className="w-3 h-3 mr-1" />
										Save
									</button>
									<button
										className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
										onClick={() => onPreviewRequested?.(message.content, 'code')}
									>
										<Play className="w-3 h-3 mr-1" />
										Preview
									</button>
								</div>
							)}
						</div>

						<div className="text-xs text-gray-500 mt-1">
							{message.timestamp.toLocaleTimeString()}
						</div>
					</div>
				</div>

				{isUser && (
					<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
						<User className="w-4 h-4 text-white" />
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full">
			<ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
				<div className="space-y-4">
					{messages.map(renderMessage)}
					{isLoading && (
						<div className="flex gap-3 mb-4">
							<div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
								<Bot className="w-4 h-4 text-white" />
							</div>
							<div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
								<div className="flex items-center gap-2">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
										<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
										<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
									</div>
									<span className="text-sm text-gray-500">AI is thinking...</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			<div className="border-t p-4">
				<div className="flex gap-2">
					<input
						value={input}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Describe what you want to build..."
						className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>
					<button
						onClick={handleSendMessage}
						disabled={!input.trim() || isLoading}
						className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						<Send className="w-4 h-4" />
					</button>
				</div>
				<div className="mt-2 text-xs text-gray-500">
					Press Enter to send • Shift+Enter for new line
				</div>
			</div>
		</div>
	);
}
