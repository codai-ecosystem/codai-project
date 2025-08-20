// Core interfaces for the Immersive Development Environment
export interface ImmersiveConfig {
	// Visualization settings
	enable3D: boolean;
	enableVR: boolean;
	enableAR: boolean;
	enableSpatialDebugging: boolean;

	// Performance settings
	maxNodes: number;
	renderDistance: number;
	updateFrequency: number;

	// Interaction settings
	navigationMode: 'fly' | 'walk' | 'teleport';
	selectionMode: 'gaze' | 'pointer' | 'gesture';
	collaborationMode: 'single' | 'multi';

	// Visual settings
	theme: 'dark' | 'light' | 'cyber' | 'minimal';
	animationSpeed: number;
	particleEffects: boolean;

	// Audio settings
	spatialAudio: boolean;
	soundFeedback: boolean;
	voiceCommands: boolean;
}

export interface CodeNode3D {
	id: string;
	type: 'file' | 'function' | 'class' | 'variable' | 'module' | 'dependency';
	name: string;
	filePath: string;
	position: Vector3D;
	size: Vector3D;
	color: string;
	metadata: Record<string, any>;
	children: CodeNode3D[];
	connections: Connection3D[];
	complexity: number;
	importance: number;
	lastModified: Date;
}

export interface Vector3D {
	x: number;
	y: number;
	z: number;
}

export interface Connection3D {
	id: string;
	from: string;
	to: string;
	type: 'import' | 'call' | 'inherit' | 'reference' | 'dataflow';
	strength: number;
	animated: boolean;
	color: string;
	bidirectional: boolean;
}

export interface SpatialDebugPoint {
	id: string;
	position: Vector3D;
	type: 'breakpoint' | 'error' | 'warning' | 'info' | 'execution';
	data: any;
	timestamp: Date;
	stackTrace?: string[];
	variables?: Record<string, any>;
	active: boolean;
}

export interface ImmersiveSession {
	id: string;
	userId: string;
	projectId: string;
	startTime: Date;
	endTime?: Date;
	position: Vector3D;
	rotation: Vector3D;
	selectedNodes: string[];
	debugPoints: SpatialDebugPoint[];
	collaborators: CollaboratorInfo[];
	mode: 'desktop' | 'vr' | 'ar';
}

export interface CollaboratorInfo {
	id: string;
	name: string;
	avatar: string;
	position: Vector3D;
	rotation: Vector3D;
	isActive: boolean;
	lastActivity: Date;
	permissions: string[];
}

export interface MemoryGraph3D {
	nodes: MemoryNode3D[];
	connections: MemoryConnection3D[];
	clusters: MemoryCluster3D[];
	timeline: MemoryTimeline[];
}

export interface MemoryNode3D {
	id: string;
	type: 'entity' | 'relation' | 'observation' | 'event';
	content: string;
	position: Vector3D;
	size: number;
	color: string;
	importance: number;
	timestamp: Date;
	tags: string[];
}

export interface MemoryConnection3D {
	id: string;
	from: string;
	to: string;
	type: 'semantic' | 'temporal' | 'causal' | 'associative';
	strength: number;
	direction: 'unidirectional' | 'bidirectional';
}

export interface MemoryCluster3D {
	id: string;
	name: string;
	nodes: string[];
	center: Vector3D;
	radius: number;
	color: string;
	density: number;
}

export interface MemoryTimeline {
	timestamp: Date;
	events: MemoryEvent[];
	position: Vector3D;
}

export interface MemoryEvent {
	id: string;
	type: 'creation' | 'modification' | 'deletion' | 'connection';
	nodeId: string;
	description: string;
	impact: number;
}

export interface VRHandController {
	position: Vector3D;
	rotation: Vector3D;
	isGripping: boolean;
	isTriggerPressed: boolean;
	isPointing: boolean;
	velocity: Vector3D;
	buttons: VRButtonState[];
}

export interface VRButtonState {
	id: string;
	pressed: boolean;
	touched: boolean;
	value: number;
}

export interface ARMarker {
	id: string;
	type: 'qr' | 'image' | 'plane' | 'object';
	position: Vector3D;
	rotation: Vector3D;
	scale: Vector3D;
	confidence: number;
	tracking: boolean;
	content?: CodeNode3D | SpatialDebugPoint;
}

export interface SpatialQuery {
	type: 'proximity' | 'semantic' | 'temporal' | 'complexity';
	center: Vector3D;
	radius: number;
	filters: Record<string, any>;
	maxResults: number;
}

export interface CodeVisualizationStrategy {
	name: string;
	description: string;
	layoutAlgorithm: 'force-directed' | 'hierarchical' | 'circular' | 'grid' | 'tree';
	nodeRepresentation: 'sphere' | 'cube' | 'pyramid' | 'custom';
	connectionStyle: 'line' | 'curve' | 'tube' | 'beam';
	colorScheme: 'syntax' | 'complexity' | 'type' | 'activity' | 'custom';
	animationStyle: 'smooth' | 'bounce' | 'elastic' | 'none';
}

export interface ImmersiveAnalytics {
	sessionDuration: number;
	nodesExplored: number;
	connectionsDiscovered: number;
	debugPointsSet: number;
	collaborationTime: number;
	productivityScore: number;
	focusAreas: string[];
	navigationPatterns: Vector3D[];
	cognitiveLoad: number;
}

export interface ImmersiveCommand {
	id: string;
	name: string;
	description: string;
	voiceKeywords: string[];
	gesturePattern?: string;
	parameters: CommandParameter[];
	category: 'navigation' | 'selection' | 'debugging' | 'collaboration' | 'analysis';
}

export interface CommandParameter {
	name: string;
	type: 'string' | 'number' | 'boolean' | 'position' | 'node';
	required: boolean;
	description: string;
	defaultValue?: any;
}

// Event types for the immersive environment
export type ImmersiveEvent =
	| NodeSelectedEvent
	| NodeHoveredEvent
	| ConnectionCreatedEvent
	| DebugPointSetEvent
	| CollaboratorJoinedEvent
	| CollaboratorLeftEvent
	| EnvironmentChangedEvent
	| AnalysisCompletedEvent;

export interface NodeSelectedEvent {
	type: 'node-selected';
	nodeId: string;
	position: Vector3D;
	multiSelect: boolean;
	userId: string;
	timestamp: Date;
}

export interface NodeHoveredEvent {
	type: 'node-hovered';
	nodeId: string;
	position: Vector3D;
	userId: string;
	timestamp: Date;
}

export interface ConnectionCreatedEvent {
	type: 'connection-created';
	connectionId: string;
	from: string;
	to: string;
	userId: string;
	timestamp: Date;
}

export interface DebugPointSetEvent {
	type: 'debug-point-set';
	debugPointId: string;
	position: Vector3D;
	debugType: SpatialDebugPoint['type'];
	userId: string;
	timestamp: Date;
}

export interface CollaboratorJoinedEvent {
	type: 'collaborator-joined';
	collaborator: CollaboratorInfo;
	timestamp: Date;
}

export interface CollaboratorLeftEvent {
	type: 'collaborator-left';
	collaboratorId: string;
	timestamp: Date;
}

export interface EnvironmentChangedEvent {
	type: 'environment-changed';
	changes: Partial<ImmersiveConfig>;
	userId: string;
	timestamp: Date;
}

export interface AnalysisCompletedEvent {
	type: 'analysis-completed';
	analysisId: string;
	results: any;
	duration: number;
	timestamp: Date;
}
