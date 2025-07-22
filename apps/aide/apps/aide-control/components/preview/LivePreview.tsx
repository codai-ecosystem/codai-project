'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, RefreshCw, Code, Eye, ExternalLink, Download } from 'lucide-react';

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

interface LivePreviewProps {
	session?: DevelopmentSession | null;
	className?: string;
	content?: string;
	language?: string;
	filename?: string;
	projectId?: string;
}

export function LivePreview({ session, className = '', content, language, filename, projectId }: LivePreviewProps) {
	const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
	const [isLoading, setIsLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const handleRunCode = async () => {
		if (!content) return;

		setIsLoading(true);
		try {
			// Send code to execution service
			const response = await fetch('/api/preview/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code: content,
					language,
					filename,
					projectId
				})
			});

			const data = await response.json();

			if (data.previewUrl) {
				setPreviewUrl(data.previewUrl);
				setPreviewMode('preview');
			}
		} catch (error) {
			console.error('Execution error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefresh = () => {
		if (iframeRef.current) {
			iframeRef.current.src = iframeRef.current.src;
		}
	};

	const handleOpenExternal = () => {
		if (previewUrl) {
			window.open(previewUrl, '_blank');
		}
	};

	const handleDownload = () => {
		if (content && filename) {
			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	const getLanguageForHighlighting = () => {
		switch (language?.toLowerCase()) {
			case 'javascript':
			case 'js':
				return 'javascript';
			case 'typescript':
			case 'ts':
				return 'typescript';
			case 'html':
				return 'html';
			case 'css':
				return 'css';
			case 'json':
				return 'json';
			case 'python':
			case 'py':
				return 'python';
			default:
				return 'text';
		}
	};

	const renderCodeEditor = () => (
		<div className="h-full flex flex-col">
			{/* Code Editor Header */}
			<div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
				<div className="flex items-center gap-2">
					<Code className="w-4 h-4" />
					<span className="text-sm font-medium">{filename || 'untitled'}</span>
					{language && (
						<span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
							{language}
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleDownload}
						disabled={!content}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Download"
					>
						<Download className="w-4 h-4" />
					</button>
					<button
						onClick={handleRunCode}
						disabled={!content || isLoading}
						className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm rounded transition-colors"
					>
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<>
								<Play className="w-3 h-3 mr-1 inline" />
								Run
							</>
						)}
					</button>
				</div>
			</div>

			{/* Code Content */}
			<div className="flex-1 overflow-auto">
				<pre className="p-4 text-sm font-mono leading-relaxed">
					<code className={`language-${getLanguageForHighlighting()}`}>
						{content || '// No code to display'}
					</code>
				</pre>
			</div>
		</div>
	);

	const renderPreview = () => (
		<div className="h-full flex flex-col">
			{/* Preview Header */}
			<div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
				<div className="flex items-center gap-2">
					<Eye className="w-4 h-4" />
					<span className="text-sm font-medium">Live Preview</span>
					{previewUrl && (
						<span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
							Running
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleRefresh}
						disabled={!previewUrl}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Refresh"
					>
						<RefreshCw className="w-4 h-4" />
					</button>
					<button
						onClick={handleOpenExternal}
						disabled={!previewUrl}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Open in new tab"
					>
						<ExternalLink className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Preview Content */}
			<div className="flex-1">
				{previewUrl ? (
					<iframe
						ref={iframeRef}
						src={previewUrl}
						className="w-full h-full border-0"
						title="Live Preview"
						sandbox="allow-scripts allow-same-origin allow-forms"
					/>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						<div className="text-center">
							<Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
							<p className="text-sm">Click "Run" to see your code in action</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	return (
		<div className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
			{/* Mode Switcher */}
			<div className="flex border-b bg-gray-50 dark:bg-gray-800">
				<button
					onClick={() => setPreviewMode('code')}
					className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${previewMode === 'code'
							? 'border-blue-500 text-blue-600 bg-white dark:bg-gray-900'
							: 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
						}`}
				>
					<Code className="w-4 h-4 mr-2 inline" />
					Code
				</button>
				<button
					onClick={() => setPreviewMode('preview')}
					className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${previewMode === 'preview'
							? 'border-blue-500 text-blue-600 bg-white dark:bg-gray-900'
							: 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
						}`}
				>
					<Eye className="w-4 h-4 mr-2 inline" />
					Preview
				</button>
			</div>

			{/* Content */}
			<div className="flex-1">
				{previewMode === 'code' ? renderCodeEditor() : renderPreview()}
			</div>
		</div>
	);
}
