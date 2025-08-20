// Core Immersive Environment Exports
export { ImmersiveEnvironment } from './immersiveEnvironment';
export { SpatialDebugger } from './spatialDebugger';
export { CodeVirtualizer } from './codeVirtualizer';
export { ImmersiveRenderer } from './immersiveRenderer';

// Type Definitions
export type {
	ImmersiveConfig,
	SpatialNode,
	CodeVisualization,
	DebugContext,
	ImmersiveEvent,
	VirtualizationMode,
	SpatialLayout,
	InteractionMode,
	RenderingQuality
} from './types';

// Utilities
export { ImmersiveUtils } from './utils';
export { SpatialMath } from './spatialMath';
export { CodeParser } from './codeParser';

// Event System
export { ImmersiveEventEmitter } from './events';

// Analyzers
export { CodeStructureAnalyzer } from './analyzers/codeStructureAnalyzer';
export { DependencyGraphAnalyzer } from './analyzers/dependencyGraphAnalyzer';
export { ExecutionFlowAnalyzer } from './analyzers/executionFlowAnalyzer';
export { PerformanceHotspotAnalyzer } from './analyzers/performanceHotspotAnalyzer';
