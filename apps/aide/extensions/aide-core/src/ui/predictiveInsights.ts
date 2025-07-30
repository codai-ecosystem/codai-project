/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { PredictiveEngine, PredictionResult } from '../services/predictiveEngine';
import { createLogger } from '../services/loggerService';

const logger = createLogger('PredictiveInsights');

export class PredictiveInsights {
	private _panel?: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];
	private _currentPredictions: PredictionResult[] = [];

	constructor(
		private readonly _extensionContext: vscode.ExtensionContext,
		private readonly _predictiveEngine: PredictiveEngine
	) {
		// Listen for file changes to trigger automatic analysis
		const config = vscode.workspace.getConfiguration('aide.predictive');
		if (config.get<boolean>('autoAnalysis', true)) {
			this.setupAutoAnalysis();
		}
	}

	public show(): void {
		const columnToShowIn = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (this._panel) {
			this._panel.reveal(columnToShowIn);
			return;
		}

		this._panel = vscode.window.createWebviewPanel(
			'aidePredictiveInsights',
			'Predictive Insights',
			columnToShowIn || vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.joinPath(this._extensionContext.extensionUri, 'media')
				],
				retainContextWhenHidden: true
			}
		);

		this._panel.iconPath = {
			light: vscode.Uri.joinPath(this._extensionContext.extensionUri, 'media', 'lightbulb-light.svg'),
			dark: vscode.Uri.joinPath(this._extensionContext.extensionUri, 'media', 'lightbulb-dark.svg')
		};
		this._panel.webview.html = this.getWebviewContent();

		this._panel.onDidDispose(() => {
			this._panel = undefined;
		}, null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				await this.handleWebviewMessage(message);
			},
			undefined,
			this._disposables
		);

		// Initial analysis of current file
		this.runAnalysisForCurrentFile();
	}

	private setupAutoAnalysis(): void {
		// Listen for file save events
		vscode.workspace.onDidSaveTextDocument(
			async (document) => {
				if (this._panel && this._panel.visible) {
					await this.runAnalysisForDocument(document);
				}
			},
			null,
			this._disposables
		);

		// Listen for active editor changes
		vscode.window.onDidChangeActiveTextEditor(
			async (editor) => {
				if (this._panel && this._panel.visible && editor) {
					await this.runAnalysisForDocument(editor.document);
				}
			},
			null,
			this._disposables
		);
	}

	private async runAnalysisForCurrentFile(): Promise<void> {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			await this.runAnalysisForDocument(activeEditor.document);
		}
	}

	private async runAnalysisForDocument(document: vscode.TextDocument): Promise<void> {
		try {
			logger.info(`Running predictive analysis for: ${document.fileName}`);

			const config = vscode.workspace.getConfiguration('aide.predictive');
			const enabledAnalyzers = config.get<string[]>('enabledAnalyzers', [
				'performance', 'security', 'bugPrevention', 'code', 'dependency'
			]);
			const confidenceThreshold = config.get<number>('confidenceThreshold', 0.7);
			// Run analysis
			const results = await this._predictiveEngine.analyzDocument(document);
			// Filter by confidence threshold and enabled analyzers
			this._currentPredictions = results.filter(result =>
				(result.confidence || 0) >= confidenceThreshold &&
				enabledAnalyzers.includes(result.category || 'general')
			);

			// Update webview
			this.updateWebview();

		} catch (error) {
			logger.error('Error running predictive analysis:', error);
			vscode.window.showErrorMessage(`Predictive analysis failed: ${error}`);
		}
	}

	private async handleWebviewMessage(message: any): Promise<void> {
		switch (message.command) {
			case 'runAnalysis':
				await this.runAnalysisForCurrentFile();
				break;

			case 'runSpecificAnalysis':
				await this.runSpecificAnalysis(message.analyzerType);
				break;

			case 'applyFix':
				await this.applyFix(message.predictionId);
				break;

			case 'dismissPrediction':
				this.dismissPrediction(message.predictionId);
				break;

			case 'configureEngine':
				vscode.commands.executeCommand('workbench.action.openSettings', 'aide.predictive');
				break;
		}
	}

	private async runSpecificAnalysis(analyzerType: string): Promise<void> {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showWarningMessage('No active editor found');
			return;
		}
		try {
			let results: PredictionResult[] = [];
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				vscode.window.showWarningMessage('No active editor found');
				return;
			}
			const document = activeEditor.document;

			switch (analyzerType) {
				case 'security':
					results = await this._predictiveEngine.getSecurityInsights(document);
					break;
				case 'performance':
					results = await this._predictiveEngine.getOptimizationSuggestions(document);
					break;
				case 'code':
					results = await this._predictiveEngine.getCodeSuggestions(document);
					break;
				case 'dependency':
					results = await this._predictiveEngine.getDependencyInsights(document);
					break;
				default:
					vscode.window.showErrorMessage(`Unknown analyzer type: ${analyzerType}`);
					return;
			}

			// Filter and update predictions
			const config = vscode.workspace.getConfiguration('aide.predictive');
			const confidenceThreshold = config.get<number>('confidenceThreshold', 0.7);

			const filteredResults = results.filter(result => (result.confidence || 0) >= confidenceThreshold);

			// Merge with existing predictions (remove duplicates)
			const existingIds = new Set(this._currentPredictions.map(p => p.id));
			const newPredictions = filteredResults.filter(p => !existingIds.has(p.id));

			this._currentPredictions = [...this._currentPredictions, ...newPredictions];
			this.updateWebview();

		} catch (error) {
			logger.error(`Error running ${analyzerType} analysis:`, error);
			vscode.window.showErrorMessage(`${analyzerType} analysis failed: ${error}`);
		}
	}
	private async applyFix(predictionId: string): Promise<void> {
		const prediction = this._currentPredictions.find(p => p.id === predictionId);
		if (!prediction || !prediction.autoFixAvailable || !prediction.fix) {
			vscode.window.showErrorMessage('No auto-fix available for this prediction');
			return;
		}

		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		try {
			// Apply the auto-fix
			await activeEditor.edit(editBuilder => {
				if (prediction.line !== undefined) {
					const line = activeEditor.document.lineAt(prediction.line);
					editBuilder.replace(line.range, prediction.fix!);
				} else if (prediction.range) {
					editBuilder.replace(prediction.range, prediction.fix!);
				}
			});

			// Remove the prediction after successful fix
			this.dismissPrediction(predictionId);

			vscode.window.showInformationMessage('Auto-fix applied successfully');

		} catch (error) {
			logger.error('Error applying auto-fix:', error);
			vscode.window.showErrorMessage(`Failed to apply auto-fix: ${error}`);
		}
	}

	private dismissPrediction(predictionId: string): void {
		this._currentPredictions = this._currentPredictions.filter(p => p.id !== predictionId);
		this.updateWebview();
	}

	private updateWebview(): void {
		if (this._panel) {
			this._panel.webview.postMessage({
				command: 'updatePredictions',
				predictions: this._currentPredictions
			});
		}
	}

	private getWebviewContent(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Predictive Insights</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
			margin: 0;
			padding: 20px;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 1px solid var(--vscode-panel-border);
		}

		.title {
			font-size: 18px;
			font-weight: bold;
		}

		.controls {
			display: flex;
			gap: 10px;
		}

		.btn {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 6px 12px;
			border-radius: 3px;
			cursor: pointer;
			font-size: 12px;
		}

		.btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.btn-secondary {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}

		.btn-secondary:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}

		.analyzer-buttons {
			display: flex;
			gap: 8px;
			margin-bottom: 20px;
			flex-wrap: wrap;
		}

		.prediction-list {
			display: flex;
			flex-direction: column;
			gap: 15px;
		}

		.prediction-card {
			background-color: var(--vscode-editor-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 6px;
			padding: 15px;
			position: relative;
		}

		.prediction-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 8px;
		}

		.prediction-type {
			font-weight: bold;
			font-size: 14px;
		}

		.prediction-confidence {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
		}

		.prediction-description {
			margin-bottom: 10px;
			line-height: 1.4;
		}

		.prediction-metadata {
			display: flex;
			gap: 15px;
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			margin-bottom: 10px;
		}

		.prediction-actions {
			display: flex;
			gap: 8px;
		}

		.btn-small {
			padding: 4px 8px;
			font-size: 11px;
		}

		.severity-high {
			border-left: 4px solid var(--vscode-errorForeground);
		}

		.severity-medium {
			border-left: 4px solid var(--vscode-warningForeground);
		}

		.severity-low {
			border-left: 4px solid var(--vscode-infoForeground);
		}

		.empty-state {
			text-align: center;
			padding: 40px 20px;
			color: var(--vscode-descriptionForeground);
		}

		.loading {
			text-align: center;
			padding: 20px;
			color: var(--vscode-descriptionForeground);
		}

		/* Mobile responsive */
		@media (max-width: 768px) {
			body {
				padding: 10px;
			}

			.header {
				flex-direction: column;
				gap: 10px;
				align-items: stretch;
			}

			.controls {
				justify-content: center;
			}

			.analyzer-buttons {
				justify-content: center;
			}

			.prediction-header {
				flex-direction: column;
				gap: 5px;
			}

			.prediction-metadata {
				flex-direction: column;
				gap: 5px;
			}
		}
	</style>
</head>
<body>
	<div class="header">
		<div class="title">🔮 Predictive Insights</div>
		<div class="controls">
			<button class="btn" onclick="runAnalysis()">🔄 Refresh</button>
			<button class="btn btn-secondary" onclick="configureEngine()">⚙️ Configure</button>
		</div>
	</div>

	<div class="analyzer-buttons">
		<button class="btn btn-secondary btn-small" onclick="runSpecificAnalysis('security')">🔒 Security</button>
		<button class="btn btn-secondary btn-small" onclick="runSpecificAnalysis('performance')">⚡ Performance</button>
		<button class="btn btn-secondary btn-small" onclick="runSpecificAnalysis('code')">💡 Code Quality</button>
		<button class="btn btn-secondary btn-small" onclick="runSpecificAnalysis('dependency')">📦 Dependencies</button>
	</div>

	<div id="prediction-list" class="prediction-list">
		<div class="loading">🔍 Analyzing code...</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		function runAnalysis() {
			vscode.postMessage({ command: 'runAnalysis' });
			showLoading();
		}

		function runSpecificAnalysis(analyzerType) {
			vscode.postMessage({ command: 'runSpecificAnalysis', analyzerType: analyzerType });
		}

		function applyFix(predictionId) {
			vscode.postMessage({ command: 'applyFix', predictionId: predictionId });
		}

		function dismissPrediction(predictionId) {
			vscode.postMessage({ command: 'dismissPrediction', predictionId: predictionId });
		}

		function configureEngine() {
			vscode.postMessage({ command: 'configureEngine' });
		}

		function showLoading() {
			document.getElementById('prediction-list').innerHTML = '<div class="loading">🔍 Analyzing code...</div>';
		}

		function formatConfidence(confidence) {
			return Math.round(confidence * 100) + '%';
		}

		function getSeverityClass(priority) {
			if (priority >= 8) return 'severity-high';
			if (priority >= 5) return 'severity-medium';
			return 'severity-low';
		}

		function renderPredictions(predictions) {
			const container = document.getElementById('prediction-list');

			if (predictions.length === 0) {
				container.innerHTML = \`
					<div class="empty-state">
						<h3>✨ All Clear!</h3>
						<p>No predictions found. Your code looks great!</p>
						<button class="btn" onclick="runAnalysis()">Run Analysis</button>
					</div>
				\`;
				return;
			}

			// Sort by priority (highest first)
			const sortedPredictions = [...predictions].sort((a, b) => (b.priority || 0) - (a.priority || 0));

			container.innerHTML = sortedPredictions.map(prediction => \`
				<div class="prediction-card \${getSeverityClass(prediction.priority || 0)}">
					<div class="prediction-header">
						<div class="prediction-type">\${prediction.type}</div>
						<div class="prediction-confidence">Confidence: \${formatConfidence(prediction.confidence)}</div>
					</div>
					<div class="prediction-description">\${prediction.description}</div>
					<div class="prediction-metadata">
						\${prediction.line !== undefined ? \`<span>📍 Line \${prediction.line + 1}</span>\` : ''}
						\${prediction.category ? \`<span>🏷️ \${prediction.category}</span>\` : ''}
						\${prediction.priority ? \`<span>⚡ Priority \${prediction.priority}/10</span>\` : ''}
					</div>					<div class="prediction-actions">
						\${prediction.autoFixAvailable && prediction.fix ? \`<button class="btn btn-small" onclick="applyFix('\${prediction.id}')">🔧 Auto-fix</button>\` : ''}
						<button class="btn btn-secondary btn-small" onclick="dismissPrediction('\${prediction.id}')">✖️ Dismiss</button>
					</div>
				</div>
			\`).join('');
		}

		// Listen for messages from extension
		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.command) {
				case 'updatePredictions':
					renderPredictions(message.predictions || []);
					break;
			}
		});

		// Initial empty state
		renderPredictions([]);
	</script>
</body>
</html>`;
	}

	public dispose(): void {
		this._panel?.dispose();
		this._disposables.forEach(d => d.dispose());
	}
}
