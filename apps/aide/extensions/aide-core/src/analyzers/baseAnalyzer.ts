import * as vscode from 'vscode';
import { PredictionResult, PredictionContext } from '../services/predictiveEngine';

/**
 * Base interface for all analyzers in the Predictive Development Engine
 */
export interface IAnalyzer {
	/**
	 * Initialize the analyzer
	 */
	initialize(): Promise<void>;

	/**
	 * Analyze the given context and return predictions
	 */
	analyze(context: PredictionContext): Promise<PredictionResult[]>;

	/**
	 * Apply an auto-fix for a prediction (optional)
	 */
	applyFix?(prediction: PredictionResult, document: vscode.TextDocument): Promise<void>;

	/**
	 * Get the analyzer name
	 */
	getName(): string;

	/**
	 * Check if the analyzer is enabled
	 */
	isEnabled(): boolean;

	/**
	 * Enable or disable the analyzer
	 */
	setEnabled(enabled: boolean): void;
}

/**
 * Base analyzer class with common functionality
 */
export abstract class BaseAnalyzer implements IAnalyzer {
	protected enabled: boolean = true;
	protected name: string;

	constructor(name: string) {
		this.name = name;
	}

	public async initialize(): Promise<void> {
		// Override in derived classes
	}

	public abstract analyze(context: PredictionContext): Promise<PredictionResult[]>;

	public async applyFix(prediction: PredictionResult, document: vscode.TextDocument): Promise<void> {
		// Override in derived classes if auto-fix is supported
		throw new Error(`Auto-fix not supported for ${this.name}`);
	}

	public getName(): string {
		return this.name;
	}

	public isEnabled(): boolean {
		return this.enabled;
	}

	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Generate a unique ID for a prediction
	 */
	protected generatePredictionId(type: string, location?: vscode.Range): string {
		const timestamp = Date.now();
		const locationId = location ? `${location.start.line}-${location.start.character}` : 'global';
		return `${type}-${locationId}-${timestamp}`;
	}

	/**
	 * Create a prediction result
	 */
	protected createPrediction(
		type: string,
		severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
		title: string,
		description: string,
		suggestion: string,
		location: vscode.Range,
		confidence: number,
		options: {
			actionable?: boolean;
			autoFixAvailable?: boolean;
			tags?: string[];
			metadata?: any;
		} = {}
	): PredictionResult {
		return {
			id: this.generatePredictionId(type, location),
			type: type as any,
			severity: severity as any,
			title,
			description,
			suggestion,
			location,
			confidence,
			actionable: options.actionable ?? true,
			autoFixAvailable: options.autoFixAvailable ?? false,
			tags: options.tags ?? [],
			metadata: options.metadata
		};
	}
}
