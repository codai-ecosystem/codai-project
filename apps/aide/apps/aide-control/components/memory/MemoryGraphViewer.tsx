'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Filter, ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';

interface GraphNode {
	id: string;
	label: string;
	type: 'entity' | 'concept' | 'relationship' | 'memory';
	metadata?: {
		confidence?: number;
		timestamp?: Date;
		source?: string;
		tags?: string[];
	};
	position?: { x: number; y: number };
}

interface GraphEdge {
	id: string;
	source: string;
	target: string;
	label?: string;
	type: 'relates_to' | 'contains' | 'implements' | 'depends_on' | 'similar_to';
	weight?: number;
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

interface MemoryGraphViewerProps {
	session?: DevelopmentSession | null;
	className?: string;
	projectId?: string;
	height?: string;
}

export function MemoryGraphViewer({ session, className = '', projectId, height = '400px' }: MemoryGraphViewerProps) {
	const [nodes, setNodes] = useState<GraphNode[]>([]);
	const [edges, setEdges] = useState<GraphEdge[]>([]);
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<string>('all');
	const [isLoading, setIsLoading] = useState(true);
	const svgRef = useRef<SVGSVGElement>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });

	useEffect(() => {
		loadMemoryGraph();
	}, [projectId]);

	const loadMemoryGraph = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/memory-graph${projectId ? `?projectId=${projectId}` : ''}`);
			const data = await response.json();

			// Convert memory graph data to visualization format
			const graphNodes: GraphNode[] = data.entities?.map((entity: any, index: number) => ({
				id: entity.id || `node-${index}`,
				label: entity.name || entity.label || `Entity ${index}`,
				type: entity.type || 'entity',
				metadata: {
					confidence: entity.confidence,
					timestamp: entity.timestamp ? new Date(entity.timestamp) : new Date(),
					source: entity.source,
					tags: entity.tags || []
				},
				position: entity.position || {
					x: Math.random() * 400 + 50,
					y: Math.random() * 300 + 50
				}
			})) || [];

			const graphEdges: GraphEdge[] = data.relationships?.map((rel: any, index: number) => ({
				id: rel.id || `edge-${index}`,
				source: rel.from || rel.source,
				target: rel.to || rel.target,
				label: rel.type || rel.label,
				type: rel.type || 'relates_to',
				weight: rel.weight || 1
			})) || [];

			setNodes(graphNodes);
			setEdges(graphEdges);
		} catch (error) {
			console.error('Failed to load memory graph:', error);
			// Create some demo data for visualization
			setNodes([
				{
					id: 'project',
					label: 'Current Project',
					type: 'entity',
					position: { x: 200, y: 150 },
					metadata: { confidence: 1, timestamp: new Date(), tags: ['main'] }
				},
				{
					id: 'user',
					label: 'User Intent',
					type: 'concept',
					position: { x: 100, y: 100 },
					metadata: { confidence: 0.9, timestamp: new Date(), tags: ['intent'] }
				},
				{
					id: 'code',
					label: 'Generated Code',
					type: 'memory',
					position: { x: 300, y: 100 },
					metadata: { confidence: 0.8, timestamp: new Date(), tags: ['output'] }
				},
				{
					id: 'context',
					label: 'Context',
					type: 'concept',
					position: { x: 200, y: 50 },
					metadata: { confidence: 0.7, timestamp: new Date(), tags: ['context'] }
				}
			]);
			setEdges([
				{ id: 'e1', source: 'user', target: 'project', label: 'defines', type: 'relates_to' },
				{ id: 'e2', source: 'project', target: 'code', label: 'generates', type: 'contains' },
				{ id: 'e3', source: 'context', target: 'project', label: 'influences', type: 'relates_to' }
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredNodes = nodes.filter(node => {
		const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
			node.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesFilter = filterType === 'all' || node.type === filterType;
		return matchesSearch && matchesFilter;
	});

	const getNodeColor = (type: string) => {
		switch (type) {
			case 'entity': return '#3B82F6'; // blue
			case 'concept': return '#10B981'; // green
			case 'relationship': return '#F59E0B'; // yellow
			case 'memory': return '#8B5CF6'; // purple
			default: return '#6B7280'; // gray
		}
	};

	const handleNodeClick = (node: GraphNode) => {
		setSelectedNode(node);
	};

	const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
	const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
	const handleReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	if (isLoading) {
		return (
			<div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`} style={{ height }}>
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<p className="text-sm text-gray-500">Loading memory graph...</p>
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
					<Brain className="w-4 h-4" />
					<span className="text-sm font-medium">Memory Graph</span>
					<span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
						{filteredNodes.length} nodes
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleZoomOut}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Zoom Out"
					>
						<ZoomOut className="w-4 h-4" />
					</button>
					<button
						onClick={handleZoomIn}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Zoom In"
					>
						<ZoomIn className="w-4 h-4" />
					</button>
					<button
						onClick={handleReset}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						title="Reset View"
					>
						<RotateCcw className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Controls */}
			<div className="flex items-center gap-2 p-3 border-b bg-gray-50 dark:bg-gray-800">
				<div className="flex-1 relative">
					<Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Search nodes..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<select
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}
					className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Types</option>
					<option value="entity">Entities</option>
					<option value="concept">Concepts</option>
					<option value="relationship">Relationships</option>
					<option value="memory">Memories</option>
				</select>
			</div>

			{/* Graph Visualization */}
			<div className="flex-1 relative overflow-hidden">
				<svg
					ref={svgRef}
					className="w-full h-full"
					viewBox={`${-pan.x} ${-pan.y} ${400 / zoom} ${300 / zoom}`}
				>
					{/* Edges */}
					{edges
						.filter(edge =>
							filteredNodes.some(n => n.id === edge.source) &&
							filteredNodes.some(n => n.id === edge.target)
						)
						.map(edge => {
							const sourceNode = nodes.find(n => n.id === edge.source);
							const targetNode = nodes.find(n => n.id === edge.target);
							if (!sourceNode || !targetNode) return null;

							return (
								<g key={edge.id}>
									<line
										x1={sourceNode.position?.x || 0}
										y1={sourceNode.position?.y || 0}
										x2={targetNode.position?.x || 0}
										y2={targetNode.position?.y || 0}
										stroke="#94A3B8"
										strokeWidth="1.5"
										strokeOpacity="0.6"
									/>
									{edge.label && (
										<text x={((sourceNode.position?.x || 0) + (targetNode.position?.x || 0)) / 2}
											y={((sourceNode.position?.y || 0) + (targetNode.position?.y || 0)) / 2}
											textAnchor="middle"
											fontSize="10"
											fill="#64748B"
										>
											{edge.label}
										</text>
									)}
								</g>
							);
						})}

					{/* Nodes */}
					{filteredNodes.map(node => (
						<g key={node.id}>
							<circle
								cx={node.position?.x || 0}
								cy={node.position?.y || 0}
								r="15"
								fill={getNodeColor(node.type)}
								stroke={selectedNode?.id === node.id ? "#F59E0B" : "white"}
								strokeWidth={selectedNode?.id === node.id ? "3" : "2"}
								className="cursor-pointer hover:opacity-80 transition-opacity"
								onClick={() => handleNodeClick(node)}
							/>
							<text
								x={node.position?.x || 0}
								y={(node.position?.y || 0) + 25}
								textAnchor="middle"
								fontSize="12"
								fill="#374151"
								className="pointer-events-none"
							>
								{node.label.length > 15 ? `${node.label.slice(0, 15)}...` : node.label}
							</text>
						</g>
					))}
				</svg>

				{/* Node Details Panel */}
				{selectedNode && (
					<div className="absolute top-4 right-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-medium text-sm">{selectedNode.label}</h3>
							<button
								onClick={() => setSelectedNode(null)}
								className="text-gray-400 hover:text-gray-600"
							>
								×
							</button>
						</div>
						<div className="space-y-2 text-xs">
							<div>
								<span className="font-medium">Type:</span> {selectedNode.type}
							</div>
							{selectedNode.metadata?.confidence && (
								<div>
									<span className="font-medium">Confidence:</span> {(selectedNode.metadata.confidence * 100).toFixed(0)}%
								</div>
							)}
							{selectedNode.metadata?.timestamp && (
								<div>
									<span className="font-medium">Created:</span> {selectedNode.metadata.timestamp.toLocaleDateString()}
								</div>
							)}
							{selectedNode.metadata?.tags && selectedNode.metadata.tags.length > 0 && (
								<div>
									<span className="font-medium">Tags:</span>
									<div className="flex flex-wrap gap-1 mt-1">
										{selectedNode.metadata.tags.map(tag => (
											<span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
