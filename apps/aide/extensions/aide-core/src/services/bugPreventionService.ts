import * as vscode from 'vscode';
import { PredictionContext, PredictionResult, createPredictionResult } from './predictiveEngine';
import { LoggerService } from './loggerService';

/**
 * Bug Prevention Service
 * Proactive bug detection through static analysis, pattern recognition,
 * and common error prevention techniques.
 */
export class BugPreventionService {
	private logger: LoggerService;
	private commonPatterns: Map<string, BugPattern>;

	constructor() {
		this.logger = LoggerService.getInstance();
		this.commonPatterns = new Map();
		this.initializeBugPatterns();
	}

	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		this.logger.info('BugPreventionService', 'Initialized bug prevention service');
	}

	/**
	 * Analyze code for potential bugs and issues
	 */
	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		try {
			results.push(...await this.detectNullPointerRisks(context));
			results.push(...await this.detectTypeErrors(context));
			results.push(...await this.detectLogicErrors(context));
			results.push(...await this.detectResourceLeaks(context));
			results.push(...await this.detectSecurityVulnerabilities(context));

			return results;
		} catch (error) {
			this.logger.error('BugPreventionService', `Error during bug analysis: ${error}`);
			return [];
		}
	}

	/**
	 * Get immediate warnings for current context
	 */
	public async getImmediateWarnings(context: PredictionContext): Promise<PredictionResult[]> {
		const warnings: PredictionResult[] = [];

		if (!context.position) {
			return warnings;
		}

		try {
			const currentLine = context.document.lineAt(context.position.line);
			const lineText = currentLine.text.trim();

			// Check current line for immediate issues
			warnings.push(...this.checkLineForIssues(lineText, context.position.line, context.language));

			// Check surrounding context
			if (context.position.line > 0) {
				const prevLine = context.document.lineAt(context.position.line - 1).text.trim();
				warnings.push(...this.checkContextualIssues(prevLine, lineText, context.position.line, context.language));
			}

			return warnings;
		} catch (error) {
			this.logger.error('BugPreventionService', `Error getting immediate warnings: ${error}`);
			return [];
		}
	}

	// Private analysis methods

	private async detectNullPointerRisks(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');
		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for potential null/undefined access
			if (context.language === 'typescript' || context.language === 'javascript') {
				// Pattern: variable.property without null check
				const nullAccessPattern = /(\w+)\.(\w+)/g;
				let match;

				while ((match = nullAccessPattern.exec(trimmed)) !== null) {
					const varName = match[1];

					// Check if there's a null check nearby
					if (!this.hasNullCheck(lines, index, varName)) {
						results.push(createPredictionResult({
							type: 'bug',
							severity: 'high',
							message: `Potential null pointer exception: '${varName}' may be null or undefined`,
							line: index,
							range: new vscode.Range(
								new vscode.Position(index, match.index || 0),
								new vscode.Position(index, (match.index || 0) + match[0].length)
							),
							fix: `Add null check: if (${varName}) { ... }`,
							confidence: 0.8,
							category: 'null-safety'
						}));
					}
				}
			}
		});

		return results;
	}

	private async detectTypeErrors(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		if (context.language === 'typescript') {
			// Check for common type mismatches
			const typeIssues = this.findTypeIssues(text);
			results.push(...typeIssues);
		}

		return results;
	}

	private async detectLogicErrors(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for assignment in conditionals
			if (trimmed.includes('if') && /=(?!=)/.test(trimmed) && !/[!=]=/.test(trimmed)) {
				results.push({
					type: 'bug',
					severity: 'high',
					message: 'Possible assignment instead of comparison in if statement',
					line: index,
					fix: 'Use == or === for comparison instead of =',
					confidence: 0.9,
					category: 'logic-error'
				});
			}

			// Check for infinite loops
			if (trimmed.includes('while(true)') || trimmed.includes('for(;;)')) {
				if (!this.hasBreakStatement(lines, index)) {
					results.push({
						type: 'bug',
						severity: 'medium',
						message: 'Potential infinite loop detected',
						line: index,
						fix: 'Add break condition or exit statement',
						confidence: 0.7,
						category: 'infinite-loop'
					});
				}
			}

			// Check for array bounds
			if (trimmed.includes('[') && trimmed.includes(']')) {
				const arrayAccess = /(\w+)\[([^\]]+)\]/.exec(trimmed);
				if (arrayAccess) {
					const arrayName = arrayAccess[1];
					const index_expr = arrayAccess[2];

					if (!this.hasBoundsCheck(lines, index, arrayName)) {
						results.push({
							type: 'bug',
							severity: 'medium',
							message: `Potential array index out of bounds: ${arrayName}[${index_expr}]`,
							line: index,
							fix: `Add bounds check: if (${index_expr} < ${arrayName}.length)`,
							confidence: 0.6,
							category: 'bounds-check'
						});
					}
				}
			}
		});

		return results;
	}

	private async detectResourceLeaks(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Check for unclosed resources
		const resourcePatterns = [
			{ open: 'fs.createReadStream', close: '.close()', resource: 'file stream' },
			{ open: 'new Promise', close: 'resolve|reject', resource: 'promise' },
			{ open: 'setTimeout', close: 'clearTimeout', resource: 'timer' },
			{ open: 'setInterval', close: 'clearInterval', resource: 'interval' }
		];

		for (const pattern of resourcePatterns) {
			const openMatches = [...text.matchAll(new RegExp(pattern.open, 'g'))];
			const closeMatches = [...text.matchAll(new RegExp(pattern.close, 'g'))];

			if (openMatches.length > closeMatches.length) {
				const line = text.substring(0, openMatches[0].index).split('\n').length - 1;
				results.push({
					type: 'bug',
					severity: 'medium',
					message: `Potential resource leak: ${pattern.resource} may not be properly closed`,
					line,
					fix: `Ensure ${pattern.close} is called`,
					confidence: 0.7,
					category: 'resource-leak'
				});
			}
		}

		return results;
	}

	private async detectSecurityVulnerabilities(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Check for eval usage
			if (trimmed.includes('eval(')) {
				results.push({
					type: 'security',
					severity: 'critical',
					message: 'Use of eval() can lead to code injection vulnerabilities',
					line: index,
					fix: 'Avoid eval() and use safer alternatives like JSON.parse()',
					confidence: 0.95,
					category: 'code-injection'
				});
			}

			// Check for innerHTML with user data
			if (trimmed.includes('innerHTML') && (trimmed.includes('+') || trimmed.includes('${'))) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential XSS vulnerability with innerHTML and dynamic content',
					line: index,
					fix: 'Use textContent or sanitize HTML content',
					confidence: 0.8,
					category: 'xss'
				});
			}

			// Check for hardcoded credentials
			const credentialPatterns = [
				/password\s*[:=]\s*['"]/i,
				/api[_-]?key\s*[:=]\s*['"]/i,
				/secret\s*[:=]\s*['"]/i,
				/token\s*[:=]\s*['"]/i
			];

			for (const pattern of credentialPatterns) {
				if (pattern.test(trimmed)) {
					results.push({
						type: 'security',
						severity: 'high',
						message: 'Potential hardcoded credential detected',
						line: index,
						fix: 'Use environment variables or secure credential storage',
						confidence: 0.9,
						category: 'hardcoded-credentials'
					});
					break;
				}
			}
		});

		return results;
	}

	// Helper methods

	private checkLineForIssues(lineText: string, lineNumber: number, language: string): PredictionResult[] {
		const issues: PredictionResult[] = [];

		// Check for common immediate issues
		if (lineText.includes('TODO') || lineText.includes('FIXME')) {
			issues.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Incomplete code detected (TODO/FIXME)',
				line: lineNumber,
				fix: 'Complete the implementation',
				confidence: 1.0,
				category: 'incomplete-code'
			});
		}

		if (language === 'typescript' || language === 'javascript') {
			// Check for missing semicolons
			if (!lineText.endsWith(';') && !lineText.endsWith('{') && !lineText.endsWith('}') &&
				!lineText.includes('if') && !lineText.includes('for') && !lineText.includes('while') &&
				lineText.length > 0 && !lineText.startsWith('//')) {
				issues.push({
					type: 'suggestion',
					severity: 'low',
					message: 'Missing semicolon',
					line: lineNumber,
					fix: 'Add semicolon at end of line',
					confidence: 0.6,
					category: 'syntax'
				});
			}
		}

		return issues;
	}

	private checkContextualIssues(prevLine: string, currentLine: string, lineNumber: number, language: string): PredictionResult[] {
		const issues: PredictionResult[] = [];

		// Check for unmatched braces
		if (prevLine.endsWith('{') && currentLine.trim() === '') {
			issues.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Empty block detected',
				line: lineNumber,
				fix: 'Add implementation or remove empty block',
				confidence: 0.5,
				category: 'empty-block'
			});
		}

		return issues;
	}

	private hasNullCheck(lines: string[], currentLine: number, varName: string): boolean {
		// Check previous 5 lines for null checks
		const startLine = Math.max(0, currentLine - 5);
		const endLine = Math.min(lines.length, currentLine + 2);

		for (let i = startLine; i < endLine; i++) {
			const line = lines[i].trim();
			if (line.includes(`${varName} !== null`) ||
				line.includes(`${varName} != null`) ||
				line.includes(`${varName} !== undefined`) ||
				line.includes(`${varName} != undefined`) ||
				line.includes(`if (${varName})`)) {
				return true;
			}
		}

		return false;
	}

	private hasBreakStatement(lines: string[], loopLine: number): boolean {
		// Look for break statement in next 10 lines
		const endLine = Math.min(lines.length, loopLine + 10);

		for (let i = loopLine + 1; i < endLine; i++) {
			if (lines[i].includes('break') || lines[i].includes('return')) {
				return true;
			}
		}

		return false;
	}

	private hasBoundsCheck(lines: string[], currentLine: number, arrayName: string): boolean {
		// Check nearby lines for bounds checks
		const startLine = Math.max(0, currentLine - 3);
		const endLine = Math.min(lines.length, currentLine + 2);

		for (let i = startLine; i < endLine; i++) {
			const line = lines[i].trim();
			if (line.includes(`${arrayName}.length`) ||
				line.includes(`length`) ||
				line.includes('bounds') ||
				line.includes('range')) {
				return true;
			}
		}

		return false;
	}

	private findTypeIssues(text: string): PredictionResult[] {
		const issues: PredictionResult[] = [];

		// Check for any type assertions without proper checking
		const typeAssertions = [...text.matchAll(/as\s+(\w+)/g)];

		for (const assertion of typeAssertions) {
			const line = text.substring(0, assertion.index).split('\n').length - 1;
			issues.push({
				type: 'bug',
				severity: 'medium',
				message: `Type assertion '${assertion[0]}' may be unsafe`,
				line,
				fix: 'Add runtime type checking before assertion',
				confidence: 0.6,
				category: 'type-safety'
			});
		}

		return issues;
	}

	private initializeBugPatterns(): void {
		// Initialize common bug patterns
		this.commonPatterns.set('null-deref', {
			pattern: /(\w+)\.(\w+)/,
			severity: 'high',
			message: 'Potential null dereference',
			fix: 'Add null check'
		});

		this.commonPatterns.set('assignment-in-condition', {
			pattern: /if\s*\([^)]*=(?!=)/,
			severity: 'high',
			message: 'Assignment in condition',
			fix: 'Use comparison operator'
		});
	}
}

interface BugPattern {
	pattern: RegExp;
	severity: 'low' | 'medium' | 'high' | 'critical';
	message: string;
	fix: string;
}
