import * as vscode from 'vscode';
import { PredictionContext, PredictionResult } from './predictiveEngine';
import { LoggerService } from './loggerService';

/**
 * Code Analysis Service
 * Provides comprehensive code quality analysis, complexity metrics,
 * and intelligent suggestions for code improvements.
 */
export class CodeAnalysisService {
	private logger: LoggerService;
	private complexityThreshold: number = 10;
	private maxMethodLength: number = 50;

	constructor() {
		this.logger = LoggerService.getInstance();
	}

	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		this.logger.info('CodeAnalysisService', 'Initialized code analysis service');
	}

	/**
	 * Perform comprehensive code analysis
	 */
	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		try {
			results.push(...await this.analyzeComplexity(context));
			results.push(...await this.analyzeCodeSmells(context));
			results.push(...await this.analyzeNaming(context));
			results.push(...await this.analyzeStructure(context));

			return results;
		} catch (error) {
			this.logger.error('CodeAnalysisService', `Error during analysis: ${error}`);
			return [];
		}
	}

	/**
	 * Get contextual suggestions for current position
	 */
	public async getContextualSuggestions(context: PredictionContext): Promise<PredictionResult[]> {
		const suggestions: PredictionResult[] = [];

		if (!context.position) {
			return suggestions;
		}

		try {
			const currentLine = context.document.lineAt(context.position.line);
			const lineText = currentLine.text.trim();

			// Analyze current line for suggestions
			if (lineText.length === 0) {
				suggestions.push(...this.suggestNextStatement(context));
			} else {
				suggestions.push(...this.suggestLineImprovements(context, lineText));
			}

			return suggestions;
		} catch (error) {
			this.logger.error('CodeAnalysisService', `Error getting contextual suggestions: ${error}`);
			return [];
		}
	}

	// Private analysis methods

	private async analyzeComplexity(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Analyze cyclomatic complexity
		const methods = this.extractMethods(text, context.language);

		for (const method of methods) {
			const complexity = this.calculateComplexity(method.body);
			if (complexity > this.complexityThreshold) {
				results.push({
					type: 'quality',
					severity: complexity > 20 ? 'high' : 'medium',
					message: `Method '${method.name}' has high cyclomatic complexity (${complexity}). Consider refactoring.`,
					line: method.line,
					range: method.range,
					fix: 'Break down into smaller methods or reduce conditional logic',
					confidence: 0.9,
					category: 'complexity'
				});
			}
		}

		return results;
	}

	private async analyzeCodeSmells(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		// Check for long methods
		const methods = this.extractMethods(text, context.language);
		for (const method of methods) {
			if (method.lineCount > this.maxMethodLength) {
				results.push({
					type: 'quality',
					severity: 'medium',
					message: `Method '${method.name}' is too long (${method.lineCount} lines). Consider breaking it down.`,
					line: method.line,
					range: method.range,
					fix: 'Extract smaller methods or simplify logic',
					confidence: 0.8,
					category: 'method-length'
				});
			}
		}

		// Check for duplicate code
		const duplicates = this.findDuplicateCode(lines);
		for (const duplicate of duplicates) {
			results.push({
				type: 'quality',
				severity: 'low',
				message: `Potential code duplication detected at lines ${duplicate.lines.join(', ')}`,
				line: duplicate.lines[0],
				fix: 'Extract common code into a shared method',
				confidence: 0.7,
				category: 'duplication'
			});
		}

		return results;
	}

	private async analyzeNaming(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Check for naming conventions
		const variables = this.extractVariables(text, context.language);
		for (const variable of variables) {
			if (!this.isValidNaming(variable.name, context.language)) {
				results.push({
					type: 'quality',
					severity: 'low',
					message: `Variable '${variable.name}' doesn't follow naming conventions`,
					line: variable.line,
					range: variable.range,
					fix: this.suggestBetterName(variable.name, context.language),
					confidence: 0.6,
					category: 'naming'
				});
			}
		}

		return results;
	}

	private async analyzeStructure(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();

		// Check for proper imports/includes
		if (context.language === 'typescript' || context.language === 'javascript') {
			const missingImports = this.findMissingImports(text);
			for (const missing of missingImports) {
				results.push({
					type: 'suggestion',
					severity: 'low',
					message: `Consider importing '${missing}' for better code organization`,
					line: 0,
					fix: `Add: import { ${missing} } from '...';`,
					confidence: 0.5,
					category: 'imports'
				});
			}
		}

		return results;
	}

	private suggestNextStatement(context: PredictionContext): PredictionResult[] {
		const suggestions: PredictionResult[] = [];

		if (!context.position) {
			return suggestions;
		}

		// Analyze surrounding context to suggest next statement
		const prevLine = context.position.line > 0
			? context.document.lineAt(context.position.line - 1).text.trim()
			: '';

		if (prevLine.includes('if') && !prevLine.includes('{')) {
			suggestions.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Consider adding braces for better readability',
				line: context.position.line,
				fix: 'Add { } around the if statement body',
				confidence: 0.7,
				category: 'formatting'
			});
		}

		return suggestions;
	}

	private suggestLineImprovements(context: PredictionContext, lineText: string): PredictionResult[] {
		const suggestions: PredictionResult[] = [];

		// Check for common improvements
		if (lineText.includes('console.log') && context.language === 'typescript') {
			suggestions.push({
				type: 'suggestion',
				severity: 'low',
				message: 'Consider using a proper logging service instead of console.log',
				line: context.position?.line || 0,
				fix: 'Replace with logger.info() or similar',
				confidence: 0.8,
				category: 'best-practices'
			});
		}

		return suggestions;
	}

	// Helper methods for code analysis

	private extractMethods(text: string, language: string): Array<{
		name: string;
		body: string;
		line: number;
		lineCount: number;
		range?: vscode.Range;
	}> {
		const methods: Array<{
			name: string;
			body: string;
			line: number;
			lineCount: number;
			range?: vscode.Range;
		}> = [];

		// Simple regex-based method extraction (can be enhanced with AST parsing)
		const methodRegex = language === 'typescript' || language === 'javascript'
			? /(?:public|private|protected|async)?\s*(?:function\s+)?(\w+)\s*\([^)]*\)\s*\{/g
			: /def\s+(\w+)\s*\([^)]*\):/g; // Python example

		const lines = text.split('\n');
		let match;

		while ((match = methodRegex.exec(text)) !== null) {
			const methodName = match[1];
			const startIndex = match.index;
			const startLine = text.substring(0, startIndex).split('\n').length - 1;

			// Find method end (simplified)
			const methodEnd = this.findMethodEnd(text, startIndex);
			const methodBody = text.substring(startIndex, methodEnd);
			const lineCount = methodBody.split('\n').length;

			methods.push({
				name: methodName,
				body: methodBody,
				line: startLine,
				lineCount,
				range: new vscode.Range(
					new vscode.Position(startLine, 0),
					new vscode.Position(startLine + lineCount - 1, lines[startLine + lineCount - 1]?.length || 0)
				)
			});
		}

		return methods;
	}

	private findMethodEnd(text: string, startIndex: number): number {
		let braceCount = 0;
		let inString = false;
		let stringChar = '';

		for (let i = startIndex; i < text.length; i++) {
			const char = text[i];

			if (inString) {
				if (char === stringChar && text[i - 1] !== '\\') {
					inString = false;
				}
				continue;
			}

			if (char === '"' || char === "'" || char === '`') {
				inString = true;
				stringChar = char;
				continue;
			}

			if (char === '{') {
				braceCount++;
			} else if (char === '}') {
				braceCount--;
				if (braceCount === 0) {
					return i + 1;
				}
			}
		}

		return text.length;
	}

	private calculateComplexity(methodBody: string): number {
		// Simple cyclomatic complexity calculation
		let complexity = 1; // Base complexity

		const complexityKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||', '?'];

		for (const keyword of complexityKeywords) {
			const matches = methodBody.match(new RegExp(`\\b${keyword}\\b`, 'g'));
			if (matches) {
				complexity += matches.length;
			}
		}

		return complexity;
	}

	private extractVariables(text: string, language: string): Array<{
		name: string;
		line: number;
		range?: vscode.Range;
	}> {
		const variables: Array<{
			name: string;
			line: number;
			range?: vscode.Range;
		}> = [];

		// Simple variable extraction (can be enhanced)
		const varRegex = language === 'typescript' || language === 'javascript'
			? /(?:let|const|var)\s+(\w+)/g
			: /(\w+)\s*=/g; // Simplified

		const lines = text.split('\n');
		let match;

		while ((match = varRegex.exec(text)) !== null) {
			const varName = match[1];
			const startIndex = match.index;
			const line = text.substring(0, startIndex).split('\n').length - 1;

			variables.push({
				name: varName,
				line,
				range: new vscode.Range(
					new vscode.Position(line, 0),
					new vscode.Position(line, lines[line]?.length || 0)
				)
			});
		}

		return variables;
	}

	private isValidNaming(name: string, language: string): boolean {
		// Check naming conventions based on language
		if (language === 'typescript' || language === 'javascript') {
			// camelCase for variables and functions
			return /^[a-z][a-zA-Z0-9]*$/.test(name) || /^[A-Z][a-zA-Z0-9]*$/.test(name);
		}

		// Default: allow reasonable naming
		return name.length > 2 && !name.includes('temp') && !name.includes('xxx');
	}

	private suggestBetterName(name: string, language: string): string {
		// Simple name suggestions
		if (name.length <= 2) {
			return 'Use a more descriptive name';
		}

		if (language === 'typescript' || language === 'javascript') {
			if (/^[A-Z]/.test(name)) {
				return 'Use camelCase for variables (e.g., ' + name.charAt(0).toLowerCase() + name.slice(1) + ')';
			}
		}

		return 'Follow naming conventions for ' + language;
	}

	private findDuplicateCode(lines: string[]): Array<{ lines: number[] }> {
		const duplicates: Array<{ lines: number[] }> = [];
		const lineMap = new Map<string, number[]>();

		// Group similar lines
		lines.forEach((line, index) => {
			const trimmed = line.trim();
			if (trimmed.length > 10 && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
				if (!lineMap.has(trimmed)) {
					lineMap.set(trimmed, []);
				}
				lineMap.get(trimmed)!.push(index + 1);
			}
		});

		// Find duplicates
		for (const [line, occurrences] of lineMap) {
			if (occurrences.length > 1) {
				duplicates.push({ lines: occurrences });
			}
		}

		return duplicates;
	}

	private findMissingImports(text: string): string[] {
		const missing: string[] = [];

		// Check for common patterns that suggest missing imports
		if (text.includes('vscode.') && !text.includes("import * as vscode from 'vscode'")) {
			missing.push('vscode');
		}

		return missing;
	}
}
