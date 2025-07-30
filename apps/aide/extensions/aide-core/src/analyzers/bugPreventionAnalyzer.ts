import * as vscode from 'vscode';
import { BaseAnalyzer } from './baseAnalyzer';
import { PredictionResult, PredictionContext } from '../services/predictiveEngine';
import { LoggerService } from '../services/loggerService';

/**
 * Bug Prevention Analyzer - AI-powered bug detection and prevention
 * Identifies potential bugs before they occur through static analysis and pattern recognition
 */
export class BugPreventionAnalyzer extends BaseAnalyzer {
	private logger: LoggerService;
	private bugPatterns: Map<string, BugPattern> = new Map();

	constructor() {
		super('BugPreventionAnalyzer');
		this.logger = LoggerService.getInstance();
		this.initializeBugPatterns();
	}

	public async initialize(): Promise<void> {
		this.logger.info('BugPreventionAnalyzer', 'Initializing Bug Prevention Analyzer...');
		// Load additional bug patterns from configuration or external sources
	}

	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		if (!this.enabled) {
			return [];
		}

		const predictions: PredictionResult[] = [];

		try {
			predictions.push(...await this.detectNullPointerRisks(context));
			predictions.push(...await this.detectTypeErrors(context));
			predictions.push(...await this.detectLogicErrors(context));
			predictions.push(...await this.detectAsyncIssues(context));
			predictions.push(...await this.detectMemoryLeaks(context));
			predictions.push(...await this.detectSecurityVulnerabilities(context));
			predictions.push(...await this.detectErrorHandlingIssues(context));

		} catch (error) {
			this.logger.error('BugPreventionAnalyzer', 'Error analyzing for bugs', error);
		}

		return predictions;
	}

	/**
	 * Detect potential null pointer exceptions and undefined access
	 */
	private async detectNullPointerRisks(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			// Check for direct property access without null checks
			const unsafeAccess = line.match(/(\w+)\.(\w+)/g);
			if (unsafeAccess && !line.includes('?.') && !line.includes('&&')) {
				const variableName = unsafeAccess[0].split('.')[0];

				// Check if variable is checked for null in recent lines
				const hasNullCheck = this.hasRecentNullCheck(lines, index, variableName);

				if (!hasNullCheck) {
					predictions.push(
						this.createPrediction(
							'bug-prevention',
							'high',
							'Potential Null Pointer Exception',
							`Property access on '${variableName}' without null check`,
							`Add null check: if (${variableName}) { ... } or use optional chaining: ${variableName}?.${unsafeAccess[0].split('.')[1]}`,
							new vscode.Range(index, line.indexOf(unsafeAccess[0]), index, line.indexOf(unsafeAccess[0]) + unsafeAccess[0].length),
							0.8,
							{
								actionable: true,
								autoFixAvailable: true,
								tags: ['null-safety', 'runtime-error']
							}
						)
					);
				}
			}

			// Check for array access without bounds checking
			const arrayAccess = line.match(/(\w+)\[(\d+|\w+)\]/g);
			if (arrayAccess) {
				predictions.push(
					this.createPrediction(
						'bug-prevention',
						'medium',
						'Potential Array Index Out of Bounds',
						`Array access without bounds checking: ${arrayAccess[0]}`,
						'Consider checking array length before accessing elements',
						new vscode.Range(index, line.indexOf(arrayAccess[0]), index, line.indexOf(arrayAccess[0]) + arrayAccess[0].length),
						0.6,
						{
							actionable: true,
							tags: ['bounds-checking', 'runtime-error']
						}
					)
				);
			}
		});

		return predictions;
	}

	/**
	 * Detect potential type errors and mismatches
	 */
	private async detectTypeErrors(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Check for type coercion issues
		const implicitCoercion = text.match(/==\s*(null|undefined|0|""|'')/g);
		if (implicitCoercion) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Implicit Type Coercion Risk',
					'Using == instead of === for null/undefined/falsy comparisons',
					'Use strict equality (===) to avoid unexpected type coercion',
					new vscode.Range(0, 0, 0, 0),
					0.9,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['type-safety', 'equality']
					}
				)
			);
		}

		// Check for missing type annotations in TypeScript
		if (document.languageId === 'typescript') {
			const missingTypes = text.match(/function\s+\w+\([^)]*\)\s*{/g);
			if (missingTypes) {
				predictions.push(
					this.createPrediction(
						'bug-prevention',
						'low',
						'Missing Type Annotations',
						'Functions without explicit return type annotations',
						'Add explicit return type annotations for better type safety',
						new vscode.Range(0, 0, 0, 0),
						0.5,
						{
							actionable: true,
							tags: ['typescript', 'type-safety']
						}
					)
				);
			}
		}

		return predictions;
	}

	/**
	 * Detect logical errors and incorrect conditions
	 */
	private async detectLogicErrors(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			// Check for assignment in conditional statements
			const assignmentInCondition = line.match(/if\s*\(\s*\w+\s*=\s*[^=]/);
			if (assignmentInCondition) {
				predictions.push(
					this.createPrediction(
						'bug-prevention',
						'high',
						'Assignment in Conditional',
						'Possible assignment instead of comparison in if statement',
						'Use == or === for comparison, or wrap assignment in extra parentheses if intentional',
						new vscode.Range(index, 0, index, line.length),
						0.9,
						{
							actionable: true,
							autoFixAvailable: true,
							tags: ['logic-error', 'conditional']
						}
					)
				);
			}

			// Check for unreachable code
			if (line.includes('return') && index < lines.length - 1) {
				const nextLine = lines[index + 1].trim();
				if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('//') && !nextLine.startsWith('/*')) {
					predictions.push(
						this.createPrediction(
							'bug-prevention',
							'medium',
							'Unreachable Code',
							'Code after return statement may be unreachable',
							'Remove unreachable code or restructure control flow',
							new vscode.Range(index + 1, 0, index + 1, nextLine.length),
							0.8,
							{
								actionable: true,
								tags: ['unreachable-code', 'dead-code']
							}
						)
					);
				}
			}

			// Check for infinite loops
			const whileTrue = line.match(/while\s*\(\s*true\s*\)/);
			if (whileTrue && !line.includes('break')) {
				predictions.push(
					this.createPrediction(
						'bug-prevention',
						'critical',
						'Potential Infinite Loop',
						'while(true) without visible break condition',
						'Ensure there is a break condition to prevent infinite loop',
						new vscode.Range(index, 0, index, line.length),
						0.7,
						{
							actionable: true,
							tags: ['infinite-loop', 'performance']
						}
					)
				);
			}
		});

		return predictions;
	}

	/**
	 * Detect async/await and Promise-related issues
	 */
	private async detectAsyncIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Check for missing await
		const asyncFunctionCalls = text.match(/\w+\(\)\s*\.\s*then\(/g);
		if (asyncFunctionCalls) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Potential Missing Await',
					'Promise-returning function call without await',
					'Consider using await if this function should be waited for',
					new vscode.Range(0, 0, 0, 0),
					0.6,
					{
						actionable: true,
						tags: ['async', 'promises']
					}
				)
			);
		}

		// Check for unhandled Promise rejections
		const unhandledPromises = text.match(/new\s+Promise\s*\(/g);
		if (unhandledPromises && !text.includes('.catch(')) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'high',
					'Unhandled Promise Rejection',
					'Promise created without rejection handling',
					'Add .catch() handler or use try-catch with async/await',
					new vscode.Range(0, 0, 0, 0),
					0.8,
					{
						actionable: true,
						tags: ['async', 'error-handling']
					}
				)
			);
		}

		// Check for race conditions
		const parallelAsyncCalls = text.match(/await\s+\w+\(\)[^;]*await\s+\w+\(\)/g);
		if (parallelAsyncCalls) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Potential Race Condition',
					'Sequential await calls that could run in parallel',
					'Consider using Promise.all() for parallel execution',
					new vscode.Range(0, 0, 0, 0),
					0.5,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['async', 'performance', 'race-condition']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Detect potential memory leaks
	 */
	private async detectMemoryLeaks(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Check for event listeners without cleanup
		const eventListeners = text.match(/addEventListener\s*\(/g);
		const removeListeners = text.match(/removeEventListener\s*\(/g);

		if (eventListeners && (!removeListeners || eventListeners.length > removeListeners.length)) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Potential Memory Leak - Event Listeners',
					'Event listeners added without corresponding removal',
					'Ensure event listeners are removed in cleanup/destroy methods',
					new vscode.Range(0, 0, 0, 0),
					0.7,
					{
						actionable: true,
						tags: ['memory-leak', 'event-listeners']
					}
				)
			);
		}

		// Check for timers without cleanup
		const timers = text.match(/(setTimeout|setInterval)\s*\(/g);
		const clearTimers = text.match(/(clearTimeout|clearInterval)\s*\(/g);

		if (timers && (!clearTimers || timers.length > clearTimers.length)) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Potential Memory Leak - Timers',
					'Timers created without corresponding cleanup',
					'Ensure timers are cleared in cleanup/destroy methods',
					new vscode.Range(0, 0, 0, 0),
					0.7,
					{
						actionable: true,
						tags: ['memory-leak', 'timers']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Detect security vulnerabilities
	 */
	private async detectSecurityVulnerabilities(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Check for eval usage
		if (text.includes('eval(')) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'critical',
					'Security Risk - eval() Usage',
					'eval() can execute arbitrary code and is a security risk',
					'Avoid using eval(). Consider alternatives like JSON.parse() or Function constructor',
					new vscode.Range(0, 0, 0, 0),
					0.95,
					{
						actionable: true,
						tags: ['security', 'code-injection']
					}
				)
			);
		}

		// Check for innerHTML with user input
		const innerHTMLUsage = text.match(/innerHTML\s*=\s*[^;]+/g);
		if (innerHTMLUsage) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'high',
					'Security Risk - innerHTML XSS',
					'Using innerHTML with potentially untrusted content',
					'Use textContent or properly sanitize content before setting innerHTML',
					new vscode.Range(0, 0, 0, 0),
					0.8,
					{
						actionable: true,
						tags: ['security', 'xss']
					}
				)
			);
		}

		// Check for hardcoded credentials
		const credentialPatterns = [
			/password\s*[:=]\s*["'][^"']+["']/i,
			/api_key\s*[:=]\s*["'][^"']+["']/i,
			/secret\s*[:=]\s*["'][^"']+["']/i
		];

		credentialPatterns.forEach(pattern => {
			if (pattern.test(text)) {
				predictions.push(
					this.createPrediction(
						'bug-prevention',
						'critical',
						'Security Risk - Hardcoded Credentials',
						'Hardcoded credentials found in source code',
						'Move credentials to environment variables or secure configuration',
						new vscode.Range(0, 0, 0, 0),
						0.9,
						{
							actionable: true,
							tags: ['security', 'credentials']
						}
					)
				);
			}
		});

		return predictions;
	}

	/**
	 * Detect error handling issues
	 */
	private async detectErrorHandlingIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const predictions: PredictionResult[] = [];
		const document = context.document;
		const text = document.getText();

		// Check for empty catch blocks
		const emptyCatch = text.match(/catch\s*\([^)]*\)\s*{\s*}/g);
		if (emptyCatch) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Empty Catch Block',
					'Empty catch block may hide errors',
					'Add proper error handling or at least log the error',
					new vscode.Range(0, 0, 0, 0),
					0.8,
					{
						actionable: true,
						autoFixAvailable: true,
						tags: ['error-handling', 'best-practices']
					}
				)
			);
		}

		// Check for functions that should handle errors but don't
		const asyncFunctions = text.match(/async\s+function\s+\w+/g);
		if (asyncFunctions && !text.includes('try') && !text.includes('catch')) {
			predictions.push(
				this.createPrediction(
					'bug-prevention',
					'medium',
					'Missing Error Handling',
					'Async function without error handling',
					'Add try-catch block for proper error handling',
					new vscode.Range(0, 0, 0, 0),
					0.6,
					{
						actionable: true,
						tags: ['error-handling', 'async']
					}
				)
			);
		}

		return predictions;
	}

	/**
	 * Initialize common bug patterns
	 */
	private initializeBugPatterns(): void {
		this.bugPatterns.set('null-access', {
			pattern: /(\w+)\.(\w+)/,
			severity: 'high',
			description: 'Potential null pointer access',
			suggestion: 'Add null check before property access'
		});

		this.bugPatterns.set('assignment-in-condition', {
			pattern: /if\s*\(\s*\w+\s*=\s*[^=]/,
			severity: 'high',
			description: 'Assignment in conditional statement',
			suggestion: 'Use comparison operator (==, ===) instead of assignment'
		});

		this.bugPatterns.set('infinite-loop', {
			pattern: /while\s*\(\s*true\s*\)/,
			severity: 'critical',
			description: 'Potential infinite loop',
			suggestion: 'Ensure there is a break condition'
		});
	}

	/**
	 * Check if there's a recent null check for the variable
	 */
	private hasRecentNullCheck(lines: string[], currentLine: number, variableName: string): boolean {
		const checkRange = 5; // Check 5 lines before current line
		const startLine = Math.max(0, currentLine - checkRange);

		for (let i = startLine; i < currentLine; i++) {
			const line = lines[i];
			if (line.includes(`if (${variableName})`) ||
				line.includes(`if (${variableName} &&`) ||
				line.includes(`${variableName} &&`) ||
				line.includes(`${variableName}?.`)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Apply auto-fix for bug prevention
	 */
	public async applyFix(prediction: PredictionResult, document: vscode.TextDocument): Promise<void> {
		const edit = new vscode.WorkspaceEdit();
		if (prediction.tags && prediction.tags.includes('null-safety')) {
			await this.applyNullSafetyFix(prediction, document, edit);
		} else if (prediction.tags && prediction.tags.includes('equality')) {
			await this.applyEqualityFix(prediction, document, edit);
		} else if (prediction.tags && prediction.tags.includes('error-handling')) {
			await this.applyErrorHandlingFix(prediction, document, edit);
		}

		if (edit.size > 0) {
			await vscode.workspace.applyEdit(edit);
		}
	}
	private async applyNullSafetyFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Implement null safety fixes
		if (prediction.location) {
			const text = document.getText(prediction.location);
			if (text.includes('.')) {
				const safePropAccess = text.replace(/(\w+)\.(\w+)/, '$1?.$2');
				edit.replace(document.uri, prediction.location, safePropAccess);
			}
		}
	}

	private async applyEqualityFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Replace == with ===
		const text = document.getText();
		const newText = text.replace(/==\s*(null|undefined|0|""|'')/g, '=== $1');
		edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), newText);
	}
	private async applyErrorHandlingFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		// Add basic error handling to empty catch blocks
		if (prediction.title && prediction.title.includes('Empty Catch Block')) {
			const text = document.getText();
			const newText = text.replace(/catch\s*\([^)]*\)\s*{\s*}/g, 'catch (error) {\n\t\tconsole.error("Error:", error);\n\t}');
			edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), newText);
		}
	}
}

interface BugPattern {
	pattern: RegExp;
	severity: string;
	description: string;
	suggestion: string;
}
