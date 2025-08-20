import { Vector3, Color, Object3D } from 'three';

// Core Configuration
export interface ImmersiveConfig {
	renderingQuality: RenderingQuality;
	virtualizationMode: VirtualizationMode;
	spatialLayout: SpatialLayout;
	interactionMode: InteractionMode;
	enableVR: boolean;
	enableAR: boolean;
	enablePhysics: boolean;
	maxRenderDistance: number;
	lodEnabled: boolean;
	antialiasing: boolean;
	shadows: boolean;
	bloom: boolean;
	debug: boolean;
}

// Rendering Quality Levels
export enum RenderingQuality {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	ULTRA = 'ultra'
}

// Visualization Modes
export enum VirtualizationMode {
	TREE = 'tree',
	GRAPH = 'graph',
	CITYSCAPE = 'cityscape',
	NEURAL_NETWORK = 'neural_network',
	FLOWCHART = 'flowchart',
	GALAXY = 'galaxy',
	ORGANIC = 'organic'
}

// Spatial Layout Types
export enum SpatialLayout {
	HIERARCHICAL = 'hierarchical',
	CIRCULAR = 'circular',
	GRID = 'grid',
	FORCE_DIRECTED = 'force_directed',
	CLUSTERED = 'clustered',
	TIMELINE = 'timeline',
	DEPENDENCY_FLOW = 'dependency_flow'
}

// Interaction Modes
export enum InteractionMode {
	ORBIT = 'orbit',
	FIRST_PERSON = 'first_person',
	TELEPORT = 'teleport',
	FLY = 'fly',
	WALK = 'walk',
	POINT_AND_CLICK = 'point_and_click'
}

// Spatial Node Representation
export interface SpatialNode {
	id: string;
	type: NodeType;
	position: Vector3;
	rotation: Vector3;
	scale: Vector3;
	color: Color;
	opacity: number;
	visible: boolean;
	interactive: boolean;
	metadata: NodeMetadata;
	children: SpatialNode[];
	connections: SpatialConnection[];
	boundingBox: BoundingBox;
	lodLevel: number;
	animationState?: AnimationState;
}

export enum NodeType {
	FILE = 'file',
	DIRECTORY = 'directory',
	CLASS = 'class',
	FUNCTION = 'function',
	VARIABLE = 'variable',
	IMPORT = 'import',
	COMMENT = 'comment',
	ERROR = 'error',
	WARNING = 'warning',
	BREAKPOINT = 'breakpoint',
	EXECUTION_POINT = 'execution_point',
	PERFORMANCE_HOTSPOT = 'performance_hotspot',
	MEMORY_USAGE = 'memory_usage',
	DEPENDENCY = 'dependency',
	TEST = 'test'
}

export interface NodeMetadata {
	name: string;
	description?: string;
	filePath?: string;
	lineNumber?: number;
	columnNumber?: number;
	size?: number;
	complexity?: number;
	performance?: PerformanceMetrics;
	coverage?: CoverageMetrics;
	dependencies?: string[];
	references?: string[];
	lastModified?: Date;
	author?: string;
	tags?: string[];
	customData?: Record<string, any>;
}

export interface SpatialConnection {
	id: string;
	fromNodeId: string;
	toNodeId: string;
	type: ConnectionType;
	strength: number;
	color: Color;
	animated: boolean;
	bidirectional: boolean;
	metadata: ConnectionMetadata;
}

export enum ConnectionType {
	DEPENDENCY = 'dependency',
	INHERITANCE = 'inheritance',
	COMPOSITION = 'composition',
	CALL = 'call',
	REFERENCE = 'reference',
	DATA_FLOW = 'data_flow',
	CONTROL_FLOW = 'control_flow',
	ERROR_FLOW = 'error_flow',
	IMPORT = 'import',
	EXPORT = 'export'
}

export interface ConnectionMetadata {
	weight: number;
	frequency: number;
	lastUsed?: Date;
	errorProne?: boolean;
	performance?: PerformanceImpact;
}

// Code Visualization
export interface CodeVisualization {
	id: string;
	name: string;
	description: string;
	type: VirtualizationMode;
	nodes: SpatialNode[];
	connections: SpatialConnection[];
	boundingBox: BoundingBox;
	camera: CameraState;
	lighting: LightingConfig;
	effects: VisualEffects;
	metadata: VisualizationMetadata;
}

export interface VisualizationMetadata {
	createdAt: Date;
	updatedAt: Date;
	version: string;
	fileCount: number;
	lineCount: number;
	complexity: number;
	performance: PerformanceMetrics;
	tags: string[];
	author: string;
}

// Debug Context
export interface DebugContext {
	sessionId: string;
	breakpoints: DebugBreakpoint[];
	callStack: CallStackFrame[];
	variables: DebugVariable[];
	executionPath: ExecutionStep[];
	performance: PerformanceSnapshot;
	memory: MemorySnapshot;
	spatial: SpatialDebugInfo;
}

export interface DebugBreakpoint {
	id: string;
	filePath: string;
	lineNumber: number;
	columnNumber?: number;
	condition?: string;
	enabled: boolean;
	hitCount: number;
	spatialPosition: Vector3;
}

export interface CallStackFrame {
	id: string;
	functionName: string;
	filePath: string;
	lineNumber: number;
	variables: DebugVariable[];
	spatialPosition: Vector3;
}

export interface DebugVariable {
	name: string;
	value: any;
	type: string;
	scope: VariableScope;
	spatialRepresentation?: SpatialNode;
}

export enum VariableScope {
	LOCAL = 'local',
	GLOBAL = 'global',
	CLOSURE = 'closure',
	MODULE = 'module'
}

export interface ExecutionStep {
	id: string;
	timestamp: number;
	filePath: string;
	lineNumber: number;
	columnNumber: number;
	operation: string;
	spatialPosition: Vector3;
	performance: StepPerformance;
}

// Events
export interface ImmersiveEvent {
	type: EventType;
	target?: SpatialNode;
	data?: any;
	position?: Vector3;
	timestamp: number;
	userId?: string;
}

export enum EventType {
	NODE_CLICK = 'node_click',
	NODE_HOVER = 'node_hover',
	NODE_SELECT = 'node_select',
	CONNECTION_CLICK = 'connection_click',
	NAVIGATION = 'navigation',
	ZOOM = 'zoom',
	FILTER_CHANGE = 'filter_change',
	MODE_CHANGE = 'mode_change',
	DEBUG_START = 'debug_start',
	DEBUG_STOP = 'debug_stop',
	BREAKPOINT_HIT = 'breakpoint_hit',
	ERROR_OCCURRED = 'error_occurred',
	PERFORMANCE_ALERT = 'performance_alert'
}

// Utility Types
export interface BoundingBox {
	min: Vector3;
	max: Vector3;
	center: Vector3;
	size: Vector3;
}

export interface CameraState {
	position: Vector3;
	target: Vector3;
	rotation: Vector3;
	fov: number;
	near: number;
	far: number;
}

export interface LightingConfig {
	ambient: {
		color: Color;
		intensity: number;
	};
	directional: {
		color: Color;
		intensity: number;
		position: Vector3;
		castShadow: boolean;
	};
	point: Array<{
		color: Color;
		intensity: number;
		position: Vector3;
		distance: number;
		decay: number;
	}>;
}

export interface VisualEffects {
	fog: {
		enabled: boolean;
		color: Color;
		near: number;
		far: number;
	};
	bloom: {
		enabled: boolean;
		strength: number;
		radius: number;
		threshold: number;
	};
	outline: {
		enabled: boolean;
		selectedColor: Color;
		hoveredColor: Color;
		errorColor: Color;
	};
	particles: {
		enabled: boolean;
		count: number;
		system: ParticleSystem[];
	};
}

export interface ParticleSystem {
	id: string;
	type: ParticleType;
	position: Vector3;
	count: number;
	color: Color;
	size: number;
	velocity: Vector3;
	lifespan: number;
}

export enum ParticleType {
	DATA_FLOW = 'data_flow',
	ERROR_TRACE = 'error_trace',
	PERFORMANCE_INDICATOR = 'performance_indicator',
	ACTIVITY_PULSE = 'activity_pulse',
	CONNECTION_FLOW = 'connection_flow'
}

export interface AnimationState {
	type: AnimationType;
	duration: number;
	progress: number;
	loop: boolean;
	easing: EasingFunction;
	startValue: any;
	endValue: any;
	currentValue: any;
}

export enum AnimationType {
	POSITION = 'position',
	ROTATION = 'rotation',
	SCALE = 'scale',
	COLOR = 'color',
	OPACITY = 'opacity',
	MORPH = 'morph'
}

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';

// Performance Types
export interface PerformanceMetrics {
	executionTime: number;
	memoryUsage: number;
	cpuUsage: number;
	ioOperations: number;
	cacheHits: number;
	cacheMisses: number;
	networkRequests: number;
}

export interface PerformanceImpact {
	severity: PerformanceSeverity;
	category: PerformanceCategory;
	description: string;
	suggestion: string;
}

export enum PerformanceSeverity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

export enum PerformanceCategory {
	CPU = 'cpu',
	MEMORY = 'memory',
	IO = 'io',
	NETWORK = 'network',
	CACHE = 'cache',
	DATABASE = 'database'
}

export interface PerformanceSnapshot {
	timestamp: number;
	metrics: PerformanceMetrics;
	hotspots: PerformanceHotspot[];
	bottlenecks: PerformanceBottleneck[];
}

export interface PerformanceHotspot {
	id: string;
	filePath: string;
	lineNumber: number;
	functionName: string;
	executionTime: number;
	callCount: number;
	spatialPosition: Vector3;
}

export interface PerformanceBottleneck {
	id: string;
	type: BottleneckType;
	description: string;
	impact: PerformanceImpact;
	spatialPosition: Vector3;
}

export enum BottleneckType {
	CPU_BOUND = 'cpu_bound',
	MEMORY_BOUND = 'memory_bound',
	IO_BOUND = 'io_bound',
	NETWORK_BOUND = 'network_bound',
	LOCK_CONTENTION = 'lock_contention'
}

export interface StepPerformance {
	duration: number;
	memoryDelta: number;
	cpuUsage: number;
}

// Memory Types
export interface MemorySnapshot {
	timestamp: number;
	totalUsage: number;
	heapUsage: number;
	stackUsage: number;
	allocations: MemoryAllocation[];
	leaks: MemoryLeak[];
}

export interface MemoryAllocation {
	id: string;
	size: number;
	type: string;
	filePath: string;
	lineNumber: number;
	spatialPosition: Vector3;
}

export interface MemoryLeak {
	id: string;
	size: number;
	age: number;
	description: string;
	filePath: string;
	lineNumber: number;
	spatialPosition: Vector3;
}

export interface CoverageMetrics {
	linesCovered: number;
	totalLines: number;
	branchesCovered: number;
	totalBranches: number;
	functionsCovered: number;
	totalFunctions: number;
	percentage: number;
}

export interface SpatialDebugInfo {
	activeBreakpoints: Vector3[];
	executionPath: Vector3[];
	callStackTrace: Vector3[];
	variableLocations: Map<string, Vector3>;
	performanceHeatmap: Map<Vector3, number>;
}
