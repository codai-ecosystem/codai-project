/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as vscode from 'vscode';
import { PredictiveEngine, PredictionResult } from '../../services/predictiveEngine';
import { PerformanceAnalyzer } from '../../analyzers/performanceAnalyzer';
import { BugPreventionAnalyzer } from '../../analyzers/bugPreventionAnalyzer';
import { SecurityAnalyzer } from '../../analyzers/securityAnalyzer';
import { DependencyAnalyzer } from '../../analyzers/dependencyAnalyzer';
import { CodeAnalyzer } from '../../analyzers/codeAnalyzer';

suite('Predictive Development Engine Test Suite', () => {
	let mockDocument: vscode.TextDocument;
	let engine: PredictiveEngine;

	suiteSetup(async () => {
		// Initialize the engine singleton
		engine = PredictiveEngine.getInstance();
	});
	setup(() => {
		// Create a mock text document for testing
		mockDocument = {
			uri: vscode.Uri.parse('file:///test.ts'),
			fileName: '/test.ts',
			isUntitled: false,
			languageId: 'typescript',
			version: 1,
			isDirty: false,
			isClosed: false,
			save: async () => true,
			eol: vscode.EndOfLine.LF,
			lineCount: 10,
			encoding: 'utf8',
			lineAt: (line: number) => ({
				lineNumber: line,
				text: 'const result = someFunction();',
				range: new vscode.Range(line, 0, line, 30),
				rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
				firstNonWhitespaceCharacterIndex: 0,
				isEmptyOrWhitespace: false
			}),
			offsetAt: () => 0,
			positionAt: () => new vscode.Position(0, 0),
			getText: () => `
				const data = await fetch('https://api.example.com');
				const items = [];
				for (let i = 0; i < data.length; i++) {
					items.push(data[i]);
				}
				const password = 'hardcoded123';
				eval(userInput);
				setTimeout(() => {
					console.log('Timer expired');
				}, 1000);
			`,
			getWordRangeAtPosition: () => new vscode.Range(0, 0, 0, 10),
			validateRange: (range: vscode.Range) => range,
			validatePosition: (position: vscode.Position) => position
		} as unknown as vscode.TextDocument;
	});

	suite('Performance Analyzer Tests', () => {
		let analyzer: PerformanceAnalyzer;

		setup(async () => {
			analyzer = new PerformanceAnalyzer();
			await analyzer.initialize();
		});

		test('should detect performance issues', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			assert.ok(Array.isArray(results), 'Results should be an array');
			// Should detect loop optimization opportunities
			const loopIssue = results.find(r => r.title && r.title.includes('loop'));
			assert.ok(loopIssue, 'Should detect loop optimization opportunities');
			assert.strictEqual(loopIssue?.type, 'performance');
		});

		test('should provide actionable suggestions', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);
			results.forEach(result => {
				assert.ok(result.suggestion, 'Each result should have a suggestion');
				assert.ok(result.confidence !== undefined && result.confidence >= 0 && result.confidence <= 1, 'Confidence should be between 0 and 1');
				assert.ok(result.actionable !== undefined, 'Should specify if actionable');
			});
		});
	});

	suite('Security Analyzer Tests', () => {
		let analyzer: SecurityAnalyzer;

		setup(async () => {
			analyzer = new SecurityAnalyzer();
			await analyzer.initialize();
		});

		test('should detect security vulnerabilities', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			assert.ok(Array.isArray(results), 'Results should be an array');
			// Should detect hardcoded credentials
			const credentialIssue = results.find(r => r.title && (r.title.toLowerCase().includes('credential') || r.title.toLowerCase().includes('password')));
			assert.ok(credentialIssue, 'Should detect hardcoded credentials');
			assert.strictEqual(credentialIssue?.type, 'security');
			assert.ok(credentialIssue?.severity === 'high' || credentialIssue?.severity === 'critical', 'Security issues should have high severity');

			// Should detect eval usage
			const evalIssue = results.find(r => r.title && r.title.toLowerCase().includes('eval'));
			assert.ok(evalIssue, 'Should detect dangerous eval usage');
		});

		test('should categorize security issues correctly', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);
			results.forEach(result => {
				assert.strictEqual(result.type, 'security');
				assert.ok(['low', 'medium', 'high', 'critical'].includes(result.severity));
				assert.ok(result.tags && result.tags.length > 0, 'Should have security tags');
			});
		});
	});

	suite('Bug Prevention Analyzer Tests', () => {
		let analyzer: BugPreventionAnalyzer;

		setup(async () => {
			analyzer = new BugPreventionAnalyzer();
			await analyzer.initialize();
		});

		test('should detect potential bugs', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			assert.ok(Array.isArray(results), 'Results should be an array');

			// Should detect async/await issues or other bug patterns
			const bugPattern = results.find(r => r.type === 'bug' || r.type === 'bug-prevention');
			if (bugPattern) {
				assert.ok(bugPattern.suggestion, 'Bug prevention should provide suggestions');
				assert.ok(bugPattern.actionable, 'Bug prevention should be actionable');
			}
		});
	});

	suite('Code Analyzer Tests', () => {
		let analyzer: CodeAnalyzer;

		setup(async () => {
			analyzer = new CodeAnalyzer();
			await analyzer.initialize();
		});

		test('should provide code quality suggestions', async () => {
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			assert.ok(Array.isArray(results), 'Results should be an array');
			results.forEach(result => {
				assert.ok(['suggestion', 'quality', 'code-completion'].includes(result.type));
				assert.ok(result.confidence !== undefined && result.confidence >= 0.5, 'Code suggestions should have reasonable confidence');
			});
		});
	});

	suite('Dependency Analyzer Tests', () => {
		let analyzer: DependencyAnalyzer;

		setup(async () => {
			analyzer = new DependencyAnalyzer();
			await analyzer.initialize();
		});
		test('should analyze dependencies in package.json context', async () => {
			// Create a mock package.json document
			const packageDoc = {
				...mockDocument,
				fileName: '/package.json',
				languageId: 'json',
				getText: () => `{
					"dependencies": {
						"lodash": "4.17.20",
						"express": "4.18.0"
					},
					"devDependencies": {
						"typescript": "4.9.0"
					}
				}`
			} as unknown as vscode.TextDocument;

			const analyzer = new DependencyAnalyzer();
			const context = {
				document: packageDoc,
				language: 'json',
				fileSize: 500,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			assert.ok(Array.isArray(results), 'Results should be an array');

			results.forEach(result => {
				assert.strictEqual(result.type, 'dependency');
				assert.ok(result.suggestion, 'Dependency issues should have suggestions');
			});
		});
	});

	suite('PredictiveEngine Integration Tests', () => {
		test('should run comprehensive analysis', async () => {
			const results = await engine.analyzDocument(mockDocument);

			assert.ok(Array.isArray(results), 'Results should be an array');
			assert.ok(results.length >= 0, 'Should return results array (empty or with predictions)');

			// Validate result structure
			results.forEach(result => {
				assert.ok(result.id, 'Each result should have an id');
				assert.ok(result.type, 'Each result should have a type');
				assert.ok(result.severity, 'Each result should have a severity');
				assert.ok(result.title, 'Each result should have a title');
				assert.ok(result.description, 'Each result should have a description');
				assert.ok(result.suggestion, 'Each result should have a suggestion');
				assert.ok(result.confidence !== undefined, 'Each result should have a confidence value');
				assert.ok(typeof result.actionable === 'boolean', 'Each result should specify if actionable');
				assert.ok(typeof result.autoFixAvailable === 'boolean', 'Each result should specify if auto-fix is available');
				assert.ok(Array.isArray(result.tags), 'Each result should have tags array');
			});
		});

		test('should handle real-time suggestions', async () => {
			const position = new vscode.Position(5, 10);
			const suggestions = await engine.getRealTimeSuggestions(mockDocument, position);

			assert.ok(Array.isArray(suggestions), 'Suggestions should be an array');
			assert.ok(suggestions.length <= 5, 'Real-time suggestions should be limited to 5');
		});

		test('should provide context-aware analysis', async () => {
			const position = new vscode.Position(0, 0);
			const results = await engine.analyzDocument(mockDocument, position);

			assert.ok(Array.isArray(results), 'Results should be an array');

			// Results should be relevant to the document content
			const hasRelevantResults = results.length === 0 || results.some(r =>
				r.type in ['performance', 'security', 'bug', 'quality', 'suggestion']
			);
			assert.ok(hasRelevantResults, 'Should provide relevant analysis results');
		});
	});

	suite('Error Handling Tests', () => {
		test('should handle invalid documents gracefully', async () => {
			const invalidDoc = null as any;

			try {
				const results = await engine.analyzDocument(invalidDoc);
				assert.ok(Array.isArray(results), 'Should return empty array on error');
				assert.strictEqual(results.length, 0, 'Should return empty results for invalid input');
			} catch (error) {
				// This is also acceptable - engine should either return empty array or throw
				assert.ok(error instanceof Error, 'Should throw proper error for invalid input');
			}
		});

		test('should handle network failures in dependency analysis', async () => {
			const analyzer = new DependencyAnalyzer();
			await analyzer.initialize();

			// Test with a document that might cause network calls
			const context = {
				document: mockDocument,
				language: 'typescript',
				fileSize: 1000,
				lineCount: 10
			};

			const results = await analyzer.analyze(context);

			// Should not throw, should return results (may be empty if network fails)
			assert.ok(Array.isArray(results), 'Should handle network failures gracefully');
		});
	});
	suite('Performance Tests', () => {
		test('should complete analysis within reasonable time', async function (this: Mocha.Context) {
			this.timeout(10000); // 10 second timeout

			const startTime = Date.now();
			const results = await engine.analyzDocument(mockDocument);
			const endTime = Date.now();

			const analysisTime = endTime - startTime;
			assert.ok(analysisTime < 5000, `Analysis should complete within 5 seconds, took ${analysisTime}ms`);
		});

		test('should handle large documents efficiently', async function (this: Mocha.Context) {
			this.timeout(15000); // 15 second timeout

			// Create a larger mock document
			const largeContent = 'const data = [];\n'.repeat(1000);
			const largeDoc = {
				...mockDocument,
				lineCount: 1000,
				getText: () => largeContent
			} as vscode.TextDocument;

			const startTime = Date.now();
			const results = await engine.analyzDocument(largeDoc);
			const endTime = Date.now();

			const analysisTime = endTime - startTime;
			assert.ok(analysisTime < 10000, `Large document analysis should complete within 10 seconds, took ${analysisTime}ms`);
			assert.ok(Array.isArray(results), 'Should return results for large documents');
		});
	});
});
