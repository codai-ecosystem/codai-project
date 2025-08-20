// Main exports for the Immersive Development Environment package
export { ImmersiveEnvironment } from './ImmersiveEnvironment';
export { CodeAnalyzer3D } from './analyzers/CodeAnalyzer3D';
export { SpatialDebugger } from './debugging/SpatialDebugger';
export { MemoryVisualizer3D } from './memory/MemoryVisualizer3D';
export { CollaborationManager } from './collaboration/CollaborationManager';
export { VRController } from './vr/VRController';
export { ARController } from './ar/ARController';

// Export all types
export * from './types';

// Re-export commonly used utilities
export const ImmersiveDevVersion = '1.0.0';

export const DefaultImmersiveConfig = {
	enable3D: true,
	enableVR: false,
	enableAR: false,
	enableSpatialDebugging: true,
	maxNodes: 1000,
	renderDistance: 100,
	updateFrequency: 60,
	navigationMode: 'fly' as const,
	selectionMode: 'pointer' as const,
	collaborationMode: 'single' as const,
	theme: 'dark' as const,
	animationSpeed: 1.0,
	particleEffects: true,
	spatialAudio: false,
	soundFeedback: true,
	voiceCommands: false
};

// Utility functions for working with 3D coordinates
export const Vector3DUtils = {
	distance: (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number => {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dz = a.z - b.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},

	add: (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({
		x: a.x + b.x,
		y: a.y + b.y,
		z: a.z + b.z
	}),

	subtract: (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z
	}),

	multiply: (v: { x: number; y: number; z: number }, scalar: number) => ({
		x: v.x * scalar,
		y: v.y * scalar,
		z: v.z * scalar
	}),

	normalize: (v: { x: number; y: number; z: number }) => {
		const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
		if (length === 0) return { x: 0, y: 0, z: 0 };
		return {
			x: v.x / length,
			y: v.y / length,
			z: v.z / length
		};
	}
};

// Color utilities for code visualization
export const CodeColorSchemes = {
	syntax: {
		file: '#4a90e2',
		function: '#50c878',
		class: '#ff6b6b',
		variable: '#ffd93d',
		module: '#a855f7',
		dependency: '#64748b'
	},
	complexity: {
		low: '#22c55e',    // Green
		medium: '#f59e0b', // Orange
		high: '#ef4444',   // Red
		critical: '#dc2626' // Dark red
	},
	activity: {
		recent: '#10b981',   // Emerald
		moderate: '#3b82f6', // Blue
		old: '#6b7280',      // Gray
		unused: '#374151'    // Dark gray
	}
};

// Predefined visualization strategies
export const VisualizationStrategies = {
	fileHierarchy: {
		name: 'File Hierarchy',
		description: 'Organize code by file structure',
		layoutAlgorithm: 'hierarchical' as const,
		nodeRepresentation: 'cube' as const,
		connectionStyle: 'line' as const,
		colorScheme: 'syntax' as const,
		animationStyle: 'smooth' as const
	},
	dependencyGraph: {
		name: 'Dependency Graph',
		description: 'Show module dependencies',
		layoutAlgorithm: 'force-directed' as const,
		nodeRepresentation: 'sphere' as const,
		connectionStyle: 'curve' as const,
		colorScheme: 'complexity' as const,
		animationStyle: 'elastic' as const
	},
	complexityView: {
		name: 'Complexity View',
		description: 'Visualize code complexity',
		layoutAlgorithm: 'circular' as const,
		nodeRepresentation: 'pyramid' as const,
		connectionStyle: 'tube' as const,
		colorScheme: 'complexity' as const,
		animationStyle: 'bounce' as const
	},
	activityHeatmap: {
		name: 'Activity Heatmap',
		description: 'Show recent changes and activity',
		layoutAlgorithm: 'grid' as const,
		nodeRepresentation: 'sphere' as const,
		connectionStyle: 'beam' as const,
		colorScheme: 'activity' as const,
		animationStyle: 'smooth' as const
	}
};
