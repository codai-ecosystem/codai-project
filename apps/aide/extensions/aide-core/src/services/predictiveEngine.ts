import * as vscode from 'vscode';
import { LoggerService } from './loggerService';
import { CodeAnalysisService } from './codeAnalysisService';
import { BugPreventionService } from './bugPreventionService';
import { PerformanceAnalyzer } from './performanceAnalyzer';
import { SecurityScanner } from './securityScanner';
import { PredictionLearningService } from './predictionLearningService';
import { BaseAnalyzer } from '../analyzers/baseAnalyzer';
import { PerformanceAnalyzer as NewPerformanceAnalyzer } from '../analyzers/performanceAnalyzer';
import { BugPreventionAnalyzer } from '../analyzers/bugPreventionAnalyzer';
import { CodeAnalyzer } from '../analyzers/codeAnalyzer';
import { SecurityAnalyzer } from '../analyzers/securityAnalyzer';
import { DependencyAnalyzer } from '../analyzers/dependencyAnalyzer';

export interface PredictionResult {
	// New required fields (with defaults for backward compatibility)
	id?: string;
	type: 'bug' | 'performance' | 'security' | 'quality' | 'suggestion' | 'code-completion' | 'bug-prevention' | 'dependency' | 'testing' | 'documentation';
	severity: 'low' | 'medium' | 'high' | 'critical' | 'info';

	// New optional fields
	title?: string;
	description?: string;
	suggestion?: string;
	location?: vscode.Range;
	confidence?: number;
	actionable?: boolean;
	autoFixAvailable?: boolean;
	tags?: string[];
	metadata?: any;

	// Legacy fields for backward compatibility
	message?: string;
	line?: number;
	column?: number;
	range?: vscode.Range;
	fix?: string;
	category?: string;
}

// Helper function to convert legacy prediction results to new interface
export function createPredictionResult(legacyResult: {
	type: string;
	severity: string;
	message: string;
	line?: number;
	column?: number;
	range?: vscode.Range;
	fix?: string;
	confidence?: number;
	category?: string;
}): PredictionResult {
	const id = `${legacyResult.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const location = legacyResult.range || new vscode.Range(
		legacyResult.line || 0,
		legacyResult.column || 0,
		legacyResult.line || 0,
		legacyResult.column || 0
	);

	return {
		id,
		type: legacyResult.type as any,
		severity: legacyResult.severity as any,
		title: `${legacyResult.type.charAt(0).toUpperCase() + legacyResult.type.slice(1)} Issue`,
		description: legacyResult.message,
		suggestion: legacyResult.fix || 'No automatic fix available',
		location,
		confidence: legacyResult.confidence || 0.5,
		actionable: !!legacyResult.fix,
		autoFixAvailable: !!legacyResult.fix,
		tags: legacyResult.category ? [legacyResult.category] : [],
		metadata: {
			originalCategory: legacyResult.category,
			source: 'legacy-analyzer'
		},
		// Legacy fields for backward compatibility
		message: legacyResult.message,
		line: legacyResult.line,
		column: legacyResult.column,
		range: legacyResult.range,
		fix: legacyResult.fix,
		category: legacyResult.category
	};
}

export interface PredictionContext {
	document: vscode.TextDocument;
	position?: vscode.Position;
	selection?: vscode.Selection;
	workspaceFolder?: vscode.WorkspaceFolder;
	language: string;
	fileSize: number;
	lineCount: number;
}

/**
 * Core Predictive Development Engine
 * Orchestrates AI-powered code analysis, bug prevention, performance optimization,
 * and security scanning to provide real-time development insights.
 */
export class PredictiveEngine {
	private static instance: PredictiveEngine;
	private logger: LoggerService;
	private codeAnalysis: CodeAnalysisService;
	private bugPrevention: BugPreventionService;
	private performanceAnalyzer: PerformanceAnalyzer;
	private securityScanner: SecurityScanner;
	private learningService: PredictionLearningService;
	// New advanced analyzers
	private analyzers: BaseAnalyzer[] = [];
	private newPerformanceAnalyzer: NewPerformanceAnalyzer;
	private bugPreventionAnalyzer: BugPreventionAnalyzer;
	private codeAnalyzer: CodeAnalyzer;
	private securityAnalyzer: SecurityAnalyzer;
	private dependencyAnalyzer: DependencyAnalyzer;

	private isEnabled: boolean = true;
	private analysisThrottle: Map<string, number> = new Map();
	private lastPredictions: Map<string, PredictionResult[]> = new Map();
	private constructor() {
		this.logger = LoggerService.getInstance();
		this.codeAnalysis = new CodeAnalysisService();
		this.bugPrevention = new BugPreventionService();
		this.performanceAnalyzer = new PerformanceAnalyzer();
		this.securityScanner = new SecurityScanner();
		this.learningService = new PredictionLearningService();
		// Initialize new advanced analyzers
		this.newPerformanceAnalyzer = new NewPerformanceAnalyzer();
		this.bugPreventionAnalyzer = new BugPreventionAnalyzer();
		this.codeAnalyzer = new CodeAnalyzer();
		this.securityAnalyzer = new SecurityAnalyzer();
		this.dependencyAnalyzer = new DependencyAnalyzer();

		// Register all analyzers
		this.analyzers = [
			this.newPerformanceAnalyzer,
			this.bugPreventionAnalyzer,
			this.codeAnalyzer,
			this.securityAnalyzer,
			this.dependencyAnalyzer
		];

		this.logger.info('PredictiveEngine', 'Predictive Development Engine initialized with advanced analyzers');
	}

	public static getInstance(): PredictiveEngine {
		if (!PredictiveEngine.instance) {
			PredictiveEngine.instance = new PredictiveEngine();
		}
		return PredictiveEngine.instance;
	}

	/**
	 * Initialize the predictive engine with VS Code event handlers
	 */	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		try {
			// Register document change handlers
			context.subscriptions.push(
				vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this)),
				vscode.workspace.onDidOpenTextDocument(this.onDocumentOpen.bind(this)),
				vscode.workspace.onDidSaveTextDocument(this.onDocumentSave.bind(this)),
				vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChange.bind(this))
			);

			// Initialize legacy services
			await this.codeAnalysis.initialize(context);
			await this.bugPrevention.initialize(context);
			await this.performanceAnalyzer.initialize(context);
			await this.securityScanner.initialize(context);
			await this.learningService.initialize(context);			// Initialize new advanced analyzers
			for (const analyzer of this.analyzers) {
				await analyzer.initialize();
			}

			this.logger.info('PredictiveEngine', 'Predictive Engine fully initialized with VS Code integration and advanced analyzers');
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Failed to initialize Predictive Engine', error);
			throw error;
		}
	}

	/**
	 * Analyze document and provide comprehensive predictions
	 */	public async analyzDocument(document: vscode.TextDocument, position?: vscode.Position): Promise<PredictionResult[]> {
		if (!this.isEnabled || this.shouldThrottle(document.uri.toString())) {
			return this.lastPredictions.get(document.uri.toString()) || [];
		}

		try {
			const context = this.createPredictionContext(document, position);
			const predictions: PredictionResult[] = [];

			// Run legacy analysis services in parallel
			const [
				codeQuality,
				bugPredictions,
				performanceIssues,
				securityVulnerabilities
			] = await Promise.all([
				this.codeAnalysis.analyze(context),
				this.bugPrevention.analyze(context),
				this.performanceAnalyzer.analyze(context),
				this.securityScanner.analyze(context)
			]);

			predictions.push(...codeQuality, ...bugPredictions, ...performanceIssues, ...securityVulnerabilities);

			// Run new advanced analyzers in parallel
			const advancedAnalysisResults = await Promise.all(
				this.analyzers.map(analyzer => analyzer.analyze(context))
			);

			// Flatten and add advanced analysis results
			for (const results of advancedAnalysisResults) {
				predictions.push(...results);
			}

			// Apply learning-based filtering and ranking
			const rankedPredictions = await this.learningService.rankPredictions(predictions, context);

			// Cache results
			this.lastPredictions.set(document.uri.toString(), rankedPredictions);
			this.updateThrottle(document.uri.toString());

			this.logger.debug('PredictiveEngine', `Generated ${rankedPredictions.length} predictions for ${document.fileName} (${predictions.length} raw predictions before ranking)`);
			return rankedPredictions;

		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error during document analysis', error);
			return [];
		}
	}

	/**
	 * Get real-time suggestions for current cursor position
	 */
	public async getRealTimeSuggestions(document: vscode.TextDocument, position: vscode.Position): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document, position);

			// Focus on immediate context around cursor
			const suggestions = await this.codeAnalysis.getContextualSuggestions(context);
			const bugWarnings = await this.bugPrevention.getImmediateWarnings(context);

			return [...suggestions, ...bugWarnings].slice(0, 5); // Limit to top 5 for real-time display
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting real-time suggestions', error);
			return [];
		}
	}

	/**
	 * Predict potential issues before they occur
	 */
	public async predictIssues(document: vscode.TextDocument): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document);

			// Use learning service to predict based on patterns
			const predictedIssues = await this.learningService.predictFutureIssues(context);

			return predictedIssues.filter(issue => (issue.confidence || 0) > 0.7); // High confidence predictions only
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error predicting issues', error);
			return [];
		}
	}
	/**
	 * Get optimization suggestions for performance
	 */
	public async getOptimizationSuggestions(document: vscode.TextDocument): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document);
			const legacyResults = await this.performanceAnalyzer.getOptimizationSuggestions(context);
			const advancedResults = await this.newPerformanceAnalyzer.analyze(context);

			return [...legacyResults, ...advancedResults];
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting optimization suggestions', error);
			return [];
		}
	}

	/**
	 * Get advanced code suggestions and refactoring opportunities
	 */
	public async getCodeSuggestions(document: vscode.TextDocument, position?: vscode.Position): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document, position);
			return await this.codeAnalyzer.analyze(context);
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting code suggestions', error);
			return [];
		}
	}
	/**
	 * Get advanced bug prevention insights
	 */
	public async getBugPreventionInsights(document: vscode.TextDocument): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document);
			return await this.bugPreventionAnalyzer.analyze(context);
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting bug prevention insights', error);
			return [];
		}
	}
	/**
	 * Get advanced security analysis insights
	 */
	public async getSecurityInsights(document: vscode.TextDocument): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document);
			return await this.securityAnalyzer.analyze(context);
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting security insights', error);
			return [];
		}
	}

	/**
	 * Get dependency analysis insights
	 */
	public async getDependencyInsights(document: vscode.TextDocument): Promise<PredictionResult[]> {
		try {
			const context = this.createPredictionContext(document);
			return await this.dependencyAnalyzer.analyze(context);
		} catch (error) {
			this.logger.error('PredictiveEngine', 'Error getting dependency insights', error);
			return [];
		}
	}

	/**
	 * Get all available analyzers (for debugging/monitoring)
	 */
	public getAnalyzers(): BaseAnalyzer[] {
		return [...this.analyzers];
	}

	/**
	 * Get analyzer by name
	 */
	public getAnalyzer(name: string): BaseAnalyzer | undefined {
		return this.analyzers.find(analyzer => analyzer.constructor.name === name);
	}

	/**
	 * Enable or disable the predictive engine
	 */
	public setEnabled(enabled: boolean): void {
		this.isEnabled = enabled;
		this.logger.info('PredictiveEngine', `Predictive Engine ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Clear all cached predictions
	 */
	public clearCache(): void {
		this.lastPredictions.clear();
		this.analysisThrottle.clear();
		this.logger.debug('PredictiveEngine', 'Predictive Engine cache cleared');
	}

	// Private helper methods

	private createPredictionContext(document: vscode.TextDocument, position?: vscode.Position): PredictionContext {
		return {
			document,
			position,
			selection: vscode.window.activeTextEditor?.selection,
			workspaceFolder: vscode.workspace.getWorkspaceFolder(document.uri),
			language: document.languageId,
			fileSize: document.getText().length,
			lineCount: document.lineCount
		};
	}
	private shouldThrottle(uri: string): boolean {
		const lastAnalysis = this.analysisThrottle.get(uri);
		const now = Date.now();
		return lastAnalysis !== undefined && (now - lastAnalysis) < 1000; // Throttle to max 1 analysis per second
	}

	private updateThrottle(uri: string): void {
		this.analysisThrottle.set(uri, Date.now());
	}

	// Helper function to convert legacy prediction results to new interface
	private createPredictionResult(legacyResult: {
		type: string;
		severity: string;
		message: string;
		line?: number;
		column?: number;
		range?: vscode.Range;
		fix?: string;
		confidence?: number;
		category?: string;
	}): PredictionResult {
		const id = `${legacyResult.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const location = legacyResult.range || new vscode.Range(
			legacyResult.line || 0,
			legacyResult.column || 0,
			legacyResult.line || 0,
			legacyResult.column || 0
		);

		return {
			id,
			type: legacyResult.type as any,
			severity: legacyResult.severity as any,
			title: `${legacyResult.type.charAt(0).toUpperCase() + legacyResult.type.slice(1)} Issue`,
			description: legacyResult.message,
			suggestion: legacyResult.fix || 'No automatic fix available',
			location,
			confidence: legacyResult.confidence || 0.5,
			actionable: !!legacyResult.fix,
			autoFixAvailable: !!legacyResult.fix,
			tags: legacyResult.category ? [legacyResult.category] : [],
			metadata: {
				originalCategory: legacyResult.category,
				source: 'legacy-analyzer'
			},
			// Legacy fields for backward compatibility
			message: legacyResult.message,
			line: legacyResult.line,
			column: legacyResult.column,
			range: legacyResult.range,
			fix: legacyResult.fix,
			category: legacyResult.category
		};
	}

	// Event handlers

	private async onDocumentChange(event: vscode.TextDocumentChangeEvent): Promise<void> {
		if (event.contentChanges.length > 0) {
			// Trigger real-time analysis for significant changes
			const predictions = await this.getRealTimeSuggestions(
				event.document,
				event.contentChanges[0].range.start
			);

			if (predictions.length > 0) {
				// Emit event for UI to display real-time predictions
				vscode.commands.executeCommand('aide.showRealTimePredictions', predictions);
			}
		}
	}

	private async onDocumentOpen(document: vscode.TextDocument): Promise<void> {
		// Perform initial analysis when document opens
		await this.analyzDocument(document);
	}

	private async onDocumentSave(document: vscode.TextDocument): Promise<void> {
		// Full analysis on save
		const predictions = await this.analyzDocument(document);

		// Update learning model with save patterns
		await this.learningService.recordSaveEvent(document, predictions);
	}

	private async onActiveEditorChange(editor: vscode.TextEditor | undefined): Promise<void> {
		if (editor) {
			// Quick analysis when switching editors
			await this.analyzDocument(editor.document);
		}
	}
}
