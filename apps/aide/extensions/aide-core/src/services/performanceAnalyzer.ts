import * as vscode from 'vscode';
import { PredictionContext, PredictionResult } from './predictiveEngine';
import { LoggerService } from './loggerService';

/**
 * Performance Analyzer Service
 * Identifies performance bottlenecks, optimization opportunities,
 * and provides recommendations for improved code efficiency.
 */
export class PerformanceAnalyzer {
	private logger: LoggerService;
	private performanceThresholds: PerformanceThresholds;

	constructor() {
		this.logger = LoggerService.getInstance();
		this.performanceThresholds = {
			loopComplexity: 1000,
			functionSize: 50,
			nestedLoops: 3,
			stringConcatenations: 10,
			databaseQueries: 5,
			memoryAllocations: 100
		};
	}

	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		this.logger.info('PerformanceAnalyzer', 'Initialized performance analyzer');
	}

	/**
	 * Analyze code for performance issues
	 */
	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		try {
			results.push(...await this.analyzeAlgorithmComplexity(context));
			results.push(...await this.analyzeMemoryUsage(context));
			results.push(...await this.analyzeIOOperations(context));
			results.push(...await this.analyzeLoopEfficiency(context));
			results.push(...await this.analyzeStringOperations(context));
			results.push(...await this.analyzeDatabaseOperations(context));

			return results;
		} catch (error) {
			this.logger.error('PerformanceAnalyzer', `Error during performance analysis: ${error}`);
			return [];
		}
	}

	/**
	 * Get specific optimization suggestions
	 */
	public async getOptimizationSuggestions(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];

		try {
			suggestions.push(...await this.suggestDataStructureOptimizations(context));
			suggestions.push(...await this.suggestCachingOpportunities(context));
			suggestions.push(...await this.suggestAsyncOptimizations(context));
			suggestions.push(...await this.suggestMemoryOptimizations(context));

			return suggestions.filter(s => (s.confidence || 0) > 0.6);
		} catch (error) {
			this.logger.error('PerformanceAnalyzer', `Error getting optimization suggestions: ${error}`);
			return [];
		}
	}

	// Private analysis methods

	private async analyzeAlgorithmComplexity(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		// Detect nested loops (O(n²) or worse complexity)
		let nestedLoopDepth = 0;
		let currentDepth = 0;

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			if (this.isLoopStart(trimmed)) {
				currentDepth++;
				if (currentDepth > nestedLoopDepth) {
					nestedLoopDepth = currentDepth;
				}

				if (currentDepth >= this.performanceThresholds.nestedLoops) {
					results.push({
						type: 'performance',
						severity: 'high',
						message: `Deeply nested loops detected (depth: ${currentDepth}). Consider algorithm optimization.`,
						line: index,
						fix: 'Consider using more efficient algorithms or data structures',
						confidence: 0.9,
						category: 'algorithm-complexity'
					});
				}
			} else if (this.isLoopEnd(trimmed)) {
				currentDepth = Math.max(0, currentDepth - 1);
			}

			// Check for inefficient array operations
			if (trimmed.includes('.indexOf(') || trimmed.includes('.includes(')) {
				const inLoop = this.isInLoop(lines, index);
				if (inLoop) {
					results.push({
						type: 'performance',
						severity: 'medium',
						message: 'Array.indexOf() or includes() in loop can be O(n²). Consider using Set or Map.',
						line: index,
						fix: 'Use Set.has() or Map.has() for O(1) lookups',
						confidence: 0.8,
						category: 'data-structure'
					});
				}
			}

			// Check for inefficient string operations
			if (trimmed.includes('+=') && trimmed.includes('string')) {
				const inLoop = this.isInLoop(lines, index);
				if (inLoop) {
					results.push({
						type: 'performance',
						severity: 'medium',
						message: 'String concatenation in loop is inefficient',
						line: index,
						fix: 'Use array.join() or StringBuilder pattern',
						confidence: 0.8,
						category: 'string-performance'
					});
				}
			}
		});

		return results;
	}

	private async analyzeMemoryUsage(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for large array allocations
			const arrayAllocation = /new\s+Array\((\d+)\)/.exec(trimmed);
			if (arrayAllocation) {
				const size = parseInt(arrayAllocation[1]);
				if (size > this.performanceThresholds.memoryAllocations) {
					results.push({
						type: 'performance',
						severity: 'medium',
						message: `Large array allocation (${size} elements) may cause memory issues`,
						line: index,
						fix: 'Consider lazy loading or streaming for large datasets',
						confidence: 0.7,
						category: 'memory-usage'
					});
				}
			}

			// Check for potential memory leaks
			if (trimmed.includes('addEventListener') && !text.includes('removeEventListener')) {
				results.push({
					type: 'performance',
					severity: 'medium',
					message: 'Event listener added without corresponding removal - potential memory leak',
					line: index,
					fix: 'Add removeEventListener in cleanup code',
					confidence: 0.6,
					category: 'memory-leak'
				});
			}

			// Check for closures that might retain references
			if (trimmed.includes('function') && trimmed.includes('return function')) {
				results.push({
					type: 'performance',
					severity: 'low',
					message: 'Closure detected - ensure it doesn\'t retain unnecessary references',
					line: index,
					fix: 'Review closure scope and minimize captured variables',
					confidence: 0.5,
					category: 'closure-memory'
				});
			}
		});

		return results;
	}

	private async analyzeIOOperations(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for synchronous I/O operations
			const syncOperations = [
				'fs.readFileSync',
				'fs.writeFileSync',
				'fs.existsSync',
				'XMLHttpRequest'
			];

			for (const op of syncOperations) {
				if (trimmed.includes(op)) {
					results.push({
						type: 'performance',
						severity: 'high',
						message: `Synchronous I/O operation (${op}) blocks the event loop`,
						line: index,
						fix: `Use async version: ${op.replace('Sync', '')} with await`,
						confidence: 0.9,
						category: 'io-blocking'
					});
				}
			}

			// Check for multiple database queries in loop
			const dbOperations = ['query(', 'findOne(', 'save(', 'update(', 'delete('];
			const hasDbOp = dbOperations.some(op => trimmed.includes(op));

			if (hasDbOp && this.isInLoop(lines, index)) {
				results.push({
					type: 'performance',
					severity: 'high',
					message: 'Database operation in loop - N+1 query problem',
					line: index,
					fix: 'Use batch operations or include/join queries',
					confidence: 0.9,
					category: 'database-n-plus-one'
				});
			}
		});

		return results;
	}

	private async analyzeLoopEfficiency(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for inefficient loop patterns
			if (trimmed.includes('for') && trimmed.includes('.length')) {
				const lengthInCondition = /for\s*\([^;]*;\s*[^;]*\.length/.test(trimmed);
				if (lengthInCondition) {
					results.push({
						type: 'performance',
						severity: 'low',
						message: 'Array length accessed in loop condition - cache the length',
						line: index,
						fix: 'Cache array length: for (let i = 0, len = arr.length; i < len; i++)',
						confidence: 0.7,
						category: 'loop-optimization'
					});
				}
			}

			// Check for inefficient array methods in performance-critical code
			const inefficientMethods = ['filter', 'map', 'reduce', 'find'];
			const hasChainedMethods = inefficientMethods.filter(method =>
				trimmed.includes(`.${method}(`)).length > 1;

			if (hasChainedMethods) {
				results.push({
					type: 'performance',
					severity: 'medium',
					message: 'Multiple chained array methods create intermediate arrays',
					line: index,
					fix: 'Consider using a single loop or reduce for better performance',
					confidence: 0.6,
					category: 'array-chaining'
				});
			}
		});

		return results;
	}

	private async analyzeStringOperations(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Count string concatenations
		const concatCount = (text.match(/\+\s*['"]/g) || []).length;
		if (concatCount > this.performanceThresholds.stringConcatenations) {
			results.push({
				type: 'performance',
				severity: 'medium',
				message: `High number of string concatenations (${concatCount}) detected`,
				line: 0,
				fix: 'Use template literals or array.join() for better performance',
				confidence: 0.8,
				category: 'string-concatenation'
			});
		}

		// Check for regex in loops
		const lines = text.split('\n');
		lines.forEach((line, index) => {
			if (line.includes('new RegExp') && this.isInLoop(lines, index)) {
				results.push({
					type: 'performance',
					severity: 'medium',
					message: 'Regular expression created in loop - consider pre-compiling',
					line: index,
					fix: 'Move regex creation outside the loop',
					confidence: 0.8,
					category: 'regex-performance'
				});
			}
		});

		return results;
	}

	private async analyzeDatabaseOperations(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Check for missing indexes
		if (text.includes('WHERE') || text.includes('ORDER BY')) {
			results.push({
				type: 'performance',
				severity: 'medium',
				message: 'Database query detected - ensure proper indexing',
				line: 0,
				fix: 'Add database indexes for WHERE and ORDER BY columns',
				confidence: 0.5,
				category: 'database-indexing'
			});
		}

		// Check for SELECT *
		if (text.includes('SELECT *')) {
			results.push({
				type: 'performance',
				severity: 'medium',
				message: 'SELECT * queries fetch unnecessary data',
				line: 0,
				fix: 'Specify only required columns in SELECT statement',
				confidence: 0.8,
				category: 'database-select'
			});
		}

		return results;
	}

	// Optimization suggestion methods

	private async suggestDataStructureOptimizations(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];
		const text = context.document.getText();

		// Suggest Map/Set over arrays for lookups
		if (text.includes('.find(') || text.includes('.includes(')) {
			suggestions.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Consider using Map or Set for faster lookups instead of array.find()',
				line: 0,
				fix: 'Replace array with Map or Set for O(1) lookup performance',
				confidence: 0.7,
				category: 'data-structure-optimization'
			});
		}

		return suggestions;
	}

	private async suggestCachingOpportunities(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];
		const text = context.document.getText();

		// Look for repeated expensive operations
		const expensiveOps = ['JSON.parse', 'JSON.stringify', 'fetch(', 'axios.'];
		for (const op of expensiveOps) {
			const matches = [...text.matchAll(new RegExp(op, 'g'))];
			if (matches.length > 2) {
				suggestions.push({
					type: 'suggestion',
					severity: 'medium',
					message: `Multiple ${op} operations detected - consider caching results`,
					line: 0,
					fix: 'Implement memoization or result caching',
					confidence: 0.6,
					category: 'caching-opportunity'
				});
			}
		}

		return suggestions;
	}

	private async suggestAsyncOptimizations(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];
		const text = context.document.getText();

		// Look for sequential async operations that could be parallel
		const awaitPattern = /await\s+\w+/g;
		const awaits = [...text.matchAll(awaitPattern)];

		if (awaits.length > 2) {
			suggestions.push({
				type: 'suggestion',
				severity: 'medium',
				message: 'Multiple sequential await statements - consider Promise.all() for parallel execution',
				line: 0,
				fix: 'Use Promise.all() to run independent async operations in parallel',
				confidence: 0.7,
				category: 'async-optimization'
			});
		}

		return suggestions;
	}

	private async suggestMemoryOptimizations(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];
		const text = context.document.getText();

		// Suggest WeakMap/WeakSet for object relationships
		if (text.includes('Map') && text.includes('object')) {
			suggestions.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Consider WeakMap/WeakSet if objects are used as keys to prevent memory leaks',
				line: 0,
				fix: 'Use WeakMap or WeakSet for object-key relationships',
				confidence: 0.5,
				category: 'memory-optimization'
			});
		}

		return suggestions;
	}

	// Helper methods

	private isLoopStart(line: string): boolean {
		return /\b(for|while|do)\b/.test(line) && line.includes('(');
	}

	private isLoopEnd(line: string): boolean {
		return line.includes('}') && !line.includes('{');
	}

	private isInLoop(lines: string[], currentLine: number): boolean {
		let loopDepth = 0;

		// Check backwards for loop start
		for (let i = currentLine - 1; i >= 0; i--) {
			const line = lines[i].trim();

			if (line.includes('}')) {
				loopDepth--;
			}

			if (this.isLoopStart(line)) {
				loopDepth++;
				if (loopDepth > 0) {
					return true;
				}
			}

			if (line.includes('{')) {
				loopDepth++;
			}
		}

		return false;
	}
}

interface PerformanceThresholds {
	loopComplexity: number;
	functionSize: number;
	nestedLoops: number;
	stringConcatenations: number;
	databaseQueries: number;
	memoryAllocations: number;
}
