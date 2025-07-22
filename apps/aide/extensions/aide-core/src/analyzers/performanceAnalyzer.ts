import * as vscode from 'vscode';
import { BaseAnalyzer } from './baseAnalyzer';
import { PredictionResult, PredictionContext } from '../services/predictiveEngine';
import { LoggerService } from '../services/loggerService';

/**
 * Performance Analyzer - AI-powered performance optimization detection
 * Identifies performance bottlenecks and suggests optimizations
 */
export class PerformanceAnalyzer extends BaseAnalyzer {
	private logger: LoggerService;
	private performancePatterns: Map<string, PerformancePattern> = new Map();

	constructor() {
		super('PerformanceAnalyzer');
		this.logger = LoggerService.getInstance();
		this.initializePerformancePatterns();
	}

	public async initialize(): Promise<void> {
		this.logger.info('PerformanceAnalyzer', 'Initializing Performance Analyzer...');
	}

	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		if (!this.enabled) {
			return [];
		}

		const predictions: PredictionResult[] = [];

		try {
			predictions.push(...await this.analyzeLoopPerformance(context));
			predictions.push(...await this.analyzeMemoryUsage(context));
			predictions.push(...await this.analyzeAlgorithmComplexity(context));
			predictions.push(...await this.analyzeAsyncPerformance(context));
			predictions.push(...await this.analyzeDOMOperations(context));
			predictions.push(...await this.analyzeNetworkOperations(context));
			predictions.push(...await this.analyzeDataStructureUsage(context));

		} catch (error) {
			this.logger.error('PerformanceAnalyzer', 'Error analyzing performance', error);
		}

		return predictions;
	}

	/**
	 * Analyze loop performance and identify bottlenecks
	 */
	private async analyzeLoopPerformance(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			// Detect nested loops
			if (line.trim().startsWith('for') || line.trim().startsWith('while')) {
				const indentLevel = line.length - line.trimLeft().length;

				// Check for nested loops within a reasonable range
				for (let i = index + 1; i < Math.min(index + 50, lines.length); i++) {
					const innerLine = lines[i];
					const innerIndent = innerLine.length - innerLine.trimLeft().length;

					if (innerIndent > indentLevel && (innerLine.trim().startsWith('for') || innerLine.trim().startsWith('while'))) {
						predictions.push(
							this.createPrediction(
								'performance',
								'high',
								'Nested Loop Performance Warning',
								'Nested loops can cause exponential time complexity',
								'Consider optimizing algorithm or using more efficient data structures',
								new vscode.Range(index, 0, i, innerLine.length),
								0.8,
								{
									actionable: true,
									tags: ['algorithm', 'complexity', 'nested-loops']
								}
							)
						);
						break;
					}
				}
			}

			// Detect inefficient array operations in loops
			if (line.includes('for') && line.includes('.length')) {
				const arrayLengthInLoop = line.match(/(\w+)\.length/);
				if (arrayLengthInLoop) {
					predictions.push(
						this.createPrediction(
							'performance',
							'medium',
							'Array Length in Loop Condition',
							'Accessing array.length in loop condition is inefficient',
							`Cache the length: const len = ${arrayLengthInLoop[1]}.length; for (let i = 0; i < len; i++)`,
							new vscode.Range(index, 0, index, line.length),
							0.7,
							{
								actionable: true,
								autoFixAvailable: true,
								tags: ['loop-optimization', 'array-performance']
							}
						)
					);
				}
			}

			// Detect expensive operations in loops
			const expensiveOperations = [
				'document.getElementById',
				'document.querySelector',
				'JSON.parse',
				'JSON.stringify',
				'new RegExp'
			];

			expensiveOperations.forEach(operation => {
				if (line.includes(operation) && this.isInLoop(lines, index)) {
					predictions.push(
						this.createPrediction(
							'performance',
							'high',
							'Expensive Operation in Loop',
							`${operation} called inside loop`,
							`Move ${operation} outside the loop or cache the result`,
							new vscode.Range(index, line.indexOf(operation), index, line.indexOf(operation) + operation.length),
							0.9,
							{
								actionable: true,
								tags: ['loop-optimization', 'expensive-operations']
							}
						)
					);
				}
			});
		});

		return predictions;
	}

	/**
	 * Analyze memory usage patterns
	 */
	private async analyzeMemoryUsage(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect large object creation in loops
		const objectCreationInLoop = text.match(/for[^{]*{[^}]*new\s+\w+/g);
		if (objectCreationInLoop) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Object Creation in Loop',
					'Creating objects inside loops can cause memory pressure',
					'Consider object pooling or move object creation outside the loop',
					new vscode.Range(0, 0, 0, 0),
					0.7,
					{
						actionable: true,
						tags: ['memory-optimization', 'object-pooling']
					}
				)
			);
		}

		// Detect large array operations
		const largeArrayOps = text.match(/new\s+Array\(\s*\d{4,}\s*\)/g);
		if (largeArrayOps) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Large Array Allocation',
					'Creating very large arrays can cause memory issues',
					'Consider using streaming or pagination for large datasets',
					new vscode.Range(0, 0, 0, 0),
					0.6,
					{
						actionable: true,
						tags: ['memory-optimization', 'large-data']
					}
				)
			);
		}

		// Detect string concatenation in loops
		const stringConcatInLoop = this.detectStringConcatenationInLoops(text);
		if (stringConcatInLoop.length > 0) {
			stringConcatInLoop.forEach(issue => {
				predictions.push(
					this.createPrediction(
						'performance',
						'medium',
						'String Concatenation in Loop',
						'String concatenation in loops is inefficient',
						'Use array.join() or template literals for better performance',
						issue.range,
						0.8,
						{
							actionable: true,
							autoFixAvailable: true,
							tags: ['string-optimization', 'loop-optimization']
						}
					)
				);
			});
		}

		return predictions;
	}

	/**
	 * Analyze algorithm complexity
	 */
	private async analyzeAlgorithmComplexity(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect O(n²) patterns
		const nestedLoops = this.detectNestedLoopComplexity(text);
		nestedLoops.forEach(complexity => {
			if (complexity.level >= 2) {
				const severity = complexity.level >= 3 ? 'critical' : 'high';
				predictions.push(
					this.createPrediction(
						'performance',
						severity,
						`O(n^${complexity.level}) Algorithm Complexity`,
						`Detected ${complexity.level}-level nested loops`,
						'Consider using more efficient algorithms or data structures',
						complexity.range,
						0.8,
						{
							actionable: true,
							tags: ['algorithm-complexity', 'big-o']
						}
					)
				);
			}
		});

		// Detect inefficient search operations
		const linearSearches = text.match(/\.indexOf\([^)]+\)/g);
		if (linearSearches && linearSearches.length > 3) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Multiple Linear Searches',
					'Multiple indexOf operations detected',
					'Consider using Map or Set for O(1) lookups instead of O(n) indexOf',
					new vscode.Range(0, 0, 0, 0),
					0.6,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['data-structure-optimization', 'search-optimization']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Analyze async operation performance
	 */
	private async analyzeAsyncPerformance(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect sequential async operations that could be parallel
		const sequentialAwaits = text.match(/await\s+\w+\([^)]*\);?\s*\n\s*await\s+\w+\([^)]*\)/g);
		if (sequentialAwaits) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Sequential Async Operations',
					'Sequential await calls that could run in parallel',
					'Use Promise.all() or Promise.allSettled() for parallel execution',
					new vscode.Range(0, 0, 0, 0),
					0.7,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['async-optimization', 'parallel-execution']
					}
				)
			);
		}

		// Detect blocking operations on main thread
		const blockingOperations = [
			'fs.readFileSync',
			'fs.writeFileSync',
			'JSON.parse',
			'JSON.stringify'
		];

		blockingOperations.forEach(operation => {
			if (text.includes(operation)) {
				predictions.push(
					this.createPrediction(
						'performance',
						'high',
						'Blocking Operation Detected',
						`${operation} blocks the main thread`,
						`Use async version: ${operation.replace('Sync', '')} with await`,
						new vscode.Range(0, 0, 0, 0),
						0.8,
						{
							actionable: true,
							autoFixAvailable: true,
							tags: ['async-optimization', 'non-blocking']
						}
					)
				);
			}
		});

		return predictions;
	}

	/**
	 * Analyze DOM operation performance
	 */
	private async analyzeDOMOperations(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect DOM queries in loops
		const domQueriesInLoop = [
			'document.getElementById',
			'document.querySelector',
			'document.querySelectorAll',
			'document.getElementsByClassName'
		];

		domQueriesInLoop.forEach(query => {
			if (text.includes(query) && this.isDOMQueryInLoop(text, query)) {
				predictions.push(
					this.createPrediction(
						'performance',
						'high',
						'DOM Query in Loop',
						`${query} called inside loop`,
						'Cache DOM elements outside the loop',
						new vscode.Range(0, 0, 0, 0),
						0.9,
						{
							actionable: true,
							tags: ['dom-optimization', 'caching']
						}
					)
				);
			}
		});

		// Detect excessive DOM manipulation
		const domManipulations = text.match(/(innerHTML|appendChild|insertBefore|removeChild)/g);
		if (domManipulations && domManipulations.length > 10) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Excessive DOM Manipulation',
					'Many DOM manipulations detected',
					'Consider using DocumentFragment or virtual DOM for batch operations',
					new vscode.Range(0, 0, 0, 0),
					0.6,
					{
						actionable: true,
						tags: ['dom-optimization', 'batch-operations']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Analyze network operation performance
	 */
	private async analyzeNetworkOperations(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect multiple API calls in loops
		const apiCallsInLoop = text.match(/for[^{]*{[^}]*fetch\(/g);
		if (apiCallsInLoop) {
			predictions.push(
				this.createPrediction(
					'performance',
					'critical',
					'API Calls in Loop',
					'Making API calls inside loops is inefficient',
					'Batch API calls or use Promise.all() for parallel requests',
					new vscode.Range(0, 0, 0, 0),
					0.9,
					{
						actionable: true,
						tags: ['network-optimization', 'api-batching']
					}
				)
			);
		}

		// Detect missing request caching
		const uncachedRequests = text.match(/fetch\([^)]+\)/g);
		if (uncachedRequests && uncachedRequests.length > 5 && !text.includes('cache')) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Missing Request Caching',
					'Multiple requests without caching mechanism',
					'Implement request caching to avoid redundant network calls',
					new vscode.Range(0, 0, 0, 0),
					0.5,
					{
						actionable: true,
						tags: ['network-optimization', 'caching']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Analyze data structure usage efficiency
	 */
	private async analyzeDataStructureUsage(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Detect inefficient array usage for lookups
		const arrayIncludes = text.match(/\.includes\([^)]+\)/g);
		if (arrayIncludes && arrayIncludes.length > 3) {
			predictions.push(
				this.createPrediction(
					'performance',
					'medium',
					'Inefficient Array Lookups',
					'Multiple array.includes() calls detected',
					'Consider using Set for O(1) lookups instead of O(n) array.includes()',
					new vscode.Range(0, 0, 0, 0),
					0.7,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['data-structure-optimization', 'set-vs-array']
					}
				)
			);
		}

		// Detect inefficient object property access patterns
		const dynamicPropertyAccess = text.match(/\w+\[['"][^'"]+['"]\]/g);
		if (dynamicPropertyAccess && dynamicPropertyAccess.length > 5) {
			predictions.push(
				this.createPrediction(
					'performance',
					'low',
					'Frequent Dynamic Property Access',
					'Multiple dynamic property accesses detected',
					'Consider using Map for better performance with dynamic keys',
					new vscode.Range(0, 0, 0, 0),
					0.4,
					{
						actionable: true,
						tags: ['data-structure-optimization', 'map-vs-object']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Initialize performance patterns
	 */
	private initializePerformancePatterns(): void {
		this.performancePatterns.set('nested-loops', {
			pattern: /for[^{]*{[^}]*for/,
			severity: 'high',
			description: 'Nested loops can cause exponential time complexity',
			suggestion: 'Consider algorithm optimization or different data structures'
		});

		this.performancePatterns.set('dom-query-loop', {
			pattern: /for[^{]*{[^}]*document\.(getElementById|querySelector)/,
			severity: 'high',
			description: 'DOM queries inside loops are expensive',
			suggestion: 'Cache DOM elements outside the loop'
		});

		this.performancePatterns.set('string-concat-loop', {
			pattern: /for[^{]*{[^}]*\+=/,
			severity: 'medium',
			description: 'String concatenation in loops is inefficient',
			suggestion: 'Use array.join() for better performance'
		});
	}

	/**
	 * Check if code is inside a loop
	 */
	private isInLoop(lines: string[], currentLine: number): boolean {
		for (let i = currentLine - 1; i >= Math.max(0, currentLine - 20); i--) {
			const line = lines[i].trim();
			if (line.startsWith('for') || line.startsWith('while') || line.includes('.forEach(')) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Detect string concatenation in loops
	 */
	private detectStringConcatenationInLoops(text: string): Array<{ range: vscode.Range }> {
		const issues: Array<{ range: vscode.Range }> = [];
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			if (line.includes('+=') && line.includes('"') || line.includes("'")) {
				if (this.isInLoop(lines, index)) {
					issues.push({
						range: new vscode.Range(index, 0, index, line.length)
					});
				}
			}
		});

		return issues;
	}

	/**
	 * Detect nested loop complexity
	 */
	private detectNestedLoopComplexity(text: string): Array<{ level: number; range: vscode.Range }> {
		const complexities: Array<{ level: number; range: vscode.Range }> = [];
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			if (line.trim().startsWith('for') || line.trim().startsWith('while')) {
				const level = this.countNestedLoops(lines, index);
				if (level > 1) {
					complexities.push({
						level,
						range: new vscode.Range(index, 0, index, line.length)
					});
				}
			}
		});

		return complexities;
	}

	/**
	 * Count nested loops starting from a given line
	 */
	private countNestedLoops(lines: string[], startLine: number): number {
		let level = 1;
		let braceCount = 0;
		let foundOpenBrace = false;

		for (let i = startLine; i < lines.length; i++) {
			const line = lines[i];

			// Count braces to track nesting
			for (const char of line) {
				if (char === '{') {
					braceCount++;
					foundOpenBrace = true;
				} else if (char === '}') {
					braceCount--;
					if (braceCount === 0 && foundOpenBrace) {
						return level;
					}
				}
			}

			// Look for nested loops
			if (foundOpenBrace && braceCount > 0) {
				const trimmed = line.trim();
				if (trimmed.startsWith('for') || trimmed.startsWith('while')) {
					level++;
				}
			}
		}

		return level;
	}

	/**
	 * Check if DOM query is inside a loop
	 */
	private isDOMQueryInLoop(text: string, query: string): boolean {
		const lines = text.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes(query)) {
				if (this.isInLoop(lines, i)) {
					return true;
				}
			}
		}

		return false;
	}
	/**
	 * Apply auto-fix for performance optimizations
	 */
	public async applyFix(prediction: PredictionResult, document: vscode.TextDocument): Promise<void> {
		const edit = new vscode.WorkspaceEdit();
		const tags = prediction.tags || [];

		if (tags.includes('array-performance')) {
			await this.applyArrayOptimizationFix(prediction, document, edit);
		} else if (tags.includes('async-optimization')) {
			await this.applyAsyncOptimizationFix(prediction, document, edit);
		} else if (tags.includes('data-structure-optimization')) {
			await this.applyDataStructureOptimizationFix(prediction, document, edit);
		}

		if (edit.size > 0) {
			await vscode.workspace.applyEdit(edit);
		}
	}

	private async applyArrayOptimizationFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Cache array length in loop
		const text = document.getText();
		const optimized = text.replace(
			/for\s*\(\s*let\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+)\.length;\s*\1\+\+\s*\)/g,
			'for (let $1 = 0, len = $2.length; $1 < len; $1++)'
		);

		if (optimized !== text) {
			edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), optimized);
		}
	}

	private async applyAsyncOptimizationFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Convert sequential awaits to Promise.all
		const title = prediction.title || '';
		if (title.includes('Sequential Async Operations') && prediction.location) {
			// This would implement more sophisticated async optimization
			// For now, just add a comment suggestion
			const text = document.getText();
			const comment = '// TODO: Consider using Promise.all() for parallel execution\n';
			edit.insert(document.uri, prediction.location.start, comment);
		}
	}

	private async applyDataStructureOptimizationFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Convert array.includes to Set.has
		const title = prediction.title || '';
		if (title.includes('Array Lookups') && prediction.location) {
			const text = document.getText();
			// Add comment suggesting Set usage
			const comment = '// TODO: Consider using new Set(array) for faster lookups\n';
			edit.insert(document.uri, prediction.location.start, comment);
		}
	}
}

interface PerformancePattern {
	pattern: RegExp;
	severity: string;
	description: string;
	suggestion: string;
}
