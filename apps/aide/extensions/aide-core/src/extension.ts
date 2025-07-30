/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { ConversationalInterface } from './ui/conversationalInterface';
import { MemoryVisualization } from './ui/memoryVisualization';
import { ProjectStatus } from './ui/projectStatus';
import { PredictiveInsights } from './ui/predictiveInsights';
import { AgentManager } from './agents/agentManager';
import { VersionManager } from './services/versionManager';
import { LoggerService, createLogger } from './services/loggerService';
import { AIService } from './services/aiService';
import { ConversationManager } from './services/conversationManager';
import { SimpleMemoryGraph } from './services/simpleMemoryGraph';
import { MemoryGraph } from './memory/memoryGraph';
import { PluginManager } from './plugins/pluginManager';
import { HealthCheckService } from './services/healthCheckService';
import { PredictiveEngine, PredictionResult } from './services/predictiveEngine';

const logger = createLogger('Extension');

export async function activate(context: vscode.ExtensionContext) {
	logger.info('AIDE Core extension is now active!');

	// Initialize memory graphs
	const simpleMemoryGraph = new SimpleMemoryGraph();
	const memoryGraph = new MemoryGraph(context);

	// Get API keys from configuration
	const config = vscode.workspace.getConfiguration('aide');
	const apiKeys = {
		openai: config.get<string>('openaiApiKey', ''),
		anthropic: config.get<string>('anthropicApiKey', ''),
		azure: config.get<string>('azureApiKey', '')
	};

	// Initialize AI Service
	const aiService = new AIService(context);
	const agentManager = new AgentManager(simpleMemoryGraph, aiService); const conversationManager = new ConversationManager(agentManager, simpleMemoryGraph, aiService);
	const versionManager = new VersionManager();
	const pluginManager = new PluginManager(memoryGraph);
	const healthCheckService = HealthCheckService.getInstance();	// Initialize UI components with our simple memory graph
	const conversationalInterface = new ConversationalInterface(agentManager, simpleMemoryGraph as any);
	const memoryVisualization = new MemoryVisualization(simpleMemoryGraph as any);
	const projectStatus = new ProjectStatus(simpleMemoryGraph as any, agentManager);
	// Initialize Predictive Engine
	const predictiveEngine = PredictiveEngine.getInstance();
	const predictiveInsights = new PredictiveInsights(context, predictiveEngine);

	// Initialize the predictive engine with VS Code context
	await predictiveEngine.initialize(context);
	// Load plugins from workspace
	if (vscode.workspace.workspaceFolders) {
		const pluginPath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.aide', 'plugins');
		Promise.resolve(vscode.workspace.fs.stat(pluginPath)).then(() => {
			pluginManager.loadPlugin(pluginPath.fsPath).catch((error: any) => {
				logger.error('Failed to load plugins:', error);
			});
		}).catch(() => {
			// Plugin directory doesn't exist, that's fine
		});
	}
	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('aide.openConversation', () => {
			conversationalInterface.show(context);
		}),

		vscode.commands.registerCommand('aide.showMemoryGraph', () => {
			memoryVisualization.show(context);
		}),
		vscode.commands.registerCommand('aide.showProjectStatus', () => {
			projectStatus.show(context);
		}),

		vscode.commands.registerCommand('aide.showHealthStatus', async () => {
			try {
				const healthStatus = await healthCheckService.performHealthCheck(agentManager, aiService, pluginManager);
				const panel = vscode.window.createWebviewPanel(
					'aideHealthStatus',
					'AIDE Health Status',
					vscode.ViewColumn.One,
					{ enableScripts: true }
				);

				panel.webview.html = generateHealthStatusHTML(healthStatus);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to show health status: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.planFeature', async () => {
			const feature = await vscode.window.showInputBox({
				prompt: 'Describe the feature you want to plan',
				placeHolder: 'e.g., Add user authentication system'
			});

			if (feature) {
				await agentManager.planFeature(feature);
			}
		}),

		vscode.commands.registerCommand('aide.buildProject', async () => {
			await agentManager.buildProject();
		}),

		vscode.commands.registerCommand('aide.deployProject', async () => {
			await agentManager.deployProject();
		}),

		vscode.commands.registerCommand('aide.createProject', async () => {
			await conversationalInterface.startProjectCreationFlow();
		}),
		vscode.commands.registerCommand('aide.showProjectPreview', async () => {
			await projectStatus.showLivePreview();
		}),

		// Enhanced conversation commands
		vscode.commands.registerCommand('aide.startConversation', async () => {
			const sessionId = await conversationManager.startSession('New Conversation');
			const message = await vscode.window.showInputBox({
				prompt: 'What would you like to do?',
				placeHolder: 'e.g., Create a new React component, Fix a bug, Deploy to Azure...'
			}); if (message) {
				const response = await conversationManager.processMessage(message);
				vscode.window.showInformationMessage(response);
			}
		}),

		vscode.commands.registerCommand('aide.showConversationHistory', async () => {
			const sessions = conversationManager.getActiveSessions();
			if (sessions.length === 0) {
				vscode.window.showInformationMessage('No active conversation sessions');
				return;
			}

			const selectedSession = await vscode.window.showQuickPick(
				sessions.map(session => ({
					label: session.title,
					description: `Started: ${session.startTime.toLocaleString()}`,
					detail: `${session.context.length} messages`,
					session
				})),
				{ placeHolder: 'Select a conversation session to view' }
			);

			if (selectedSession) {
				const history = selectedSession.session.context.join('\n\n');
				const doc = await vscode.workspace.openTextDocument({
					content: history,
					language: 'markdown'
				});
				await vscode.window.showTextDocument(doc);
			}
		}),

		// Plugin management commands
		vscode.commands.registerCommand('aide.createPlugin', async () => {
			const pluginType = await vscode.window.showQuickPick([
				{ label: 'Agent Plugin', value: 'agent' },
				{ label: 'Command Plugin', value: 'command' },
				{ label: 'View Plugin', value: 'view' },
				{ label: 'Template Plugin', value: 'template' }
			], {
				placeHolder: 'Select the type of plugin to create'
			}); if (pluginType) {
				const pluginName = await vscode.window.showInputBox({
					prompt: 'Enter the plugin name',
					placeHolder: 'My Awesome Plugin'
				});

				if (pluginName) {
					const pluginId = await vscode.window.showInputBox({
						prompt: 'Enter the plugin ID (used for internal identification)',
						placeHolder: 'my-awesome-plugin',
						value: pluginName.toLowerCase().replace(/\s+/g, '-')
					});

					const author = await vscode.window.showInputBox({
						prompt: 'Enter the author name',
						placeHolder: 'Your Name'
					});

					const description = await vscode.window.showInputBox({
						prompt: 'Enter a description for the plugin',
						placeHolder: 'A brief description of what this plugin does'
					});

					if (pluginId && author && description) {
						try {
							const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
							if (workspaceFolder) {
								const pluginPath = vscode.Uri.joinPath(
									workspaceFolder.uri,
									'.aide', 'plugins',
									pluginId
								).fsPath;								// Create basic plugin structure
								await vscode.workspace.fs.createDirectory(vscode.Uri.file(pluginPath));

								// Create package.json manifest
								const manifest = {
									id: pluginId,
									name: pluginName,
									version: "1.0.0",
									description: description,
									author: author,
									main: "index.js",
									engines: { aide: "^1.0.0" },
									activationEvents: ["*"],
									contributes: {}
								};

								await vscode.workspace.fs.writeFile(
									vscode.Uri.file(path.join(pluginPath, 'package.json')),
									Buffer.from(JSON.stringify(manifest, null, 2))
								);

								// Create basic index.js
								const indexContent = `// ${pluginName} - ${description}
// Author: ${author}

function activate(context) {
	console.log('${pluginName} is now active!');

	// Register your plugin functionality here
	// context.subscriptions.push(...);
}

function deactivate() {
	console.log('${pluginName} is now deactivated!');
}

module.exports = {
	activate,
	deactivate
};`;

								await vscode.workspace.fs.writeFile(
									vscode.Uri.file(path.join(pluginPath, 'index.js')),
									Buffer.from(indexContent)
								);

								vscode.window.showInformationMessage(
									`Plugin "${pluginName}" created successfully at ${pluginPath}`
								);

								// Reload plugins to include the new one
								await pluginManager.discoverAndLoadPlugins();
							} else {
								vscode.window.showErrorMessage('No workspace folder found. Please open a workspace first.');
							}
						} catch (error) {
							vscode.window.showErrorMessage(`Failed to create plugin: ${error}`);
						}
					}
				}
			}
		}), vscode.commands.registerCommand('aide.reloadPlugins', async () => {
			try {
				const loadedPlugins = pluginManager.getLoadedPlugins();
				for (const plugin of loadedPlugins) {
					await pluginManager.unloadPlugin(plugin.id);
				}
				await pluginManager.discoverAndLoadPlugins();

				vscode.window.showInformationMessage(`Reloaded ${loadedPlugins.length} plugins successfully`);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to reload plugins: ${error}`);
			}
		}),
		vscode.commands.registerCommand('aide.listPlugins', async () => {
			const loadedPlugins = pluginManager.getLoadedPlugins();

			if (loadedPlugins.length === 0) {
				vscode.window.showInformationMessage('No plugins are currently loaded');
				return;
			}

			const pluginItems = loadedPlugins.map(plugin => ({
				label: plugin.name,
				description: plugin.version,
				detail: plugin.description
			}));

			await vscode.window.showQuickPick(pluginItems, {
				placeHolder: 'Loaded AIDE Plugins'
			});
		}),

		// Enhanced deployment commands
		vscode.commands.registerCommand('aide.setupDeployment', async () => {
			const { DeploymentService } = await import('./services/deploymentService');
			const deploymentService = new DeploymentService();

			const projectTypes = [
				{ label: 'Web Application', value: 'webapp' },
				{ label: 'API Server', value: 'api' },
				{ label: 'Static Site', value: 'static' },
				{ label: 'Full Stack', value: 'fullstack' }
			];

			const projectType = await vscode.window.showQuickPick(projectTypes, {
				placeHolder: 'What type of project are you deploying?'
			});

			if (projectType) {
				await deploymentService.setupDeploymentForProject(projectType.value);
			}
		}),

		vscode.commands.registerCommand('aide.deployWithCI', async () => {
			const { DeploymentService } = await import('./services/deploymentService');
			const deploymentService = new DeploymentService();

			const targets = deploymentService.getDeploymentTargets();
			if (targets.length === 0) {
				vscode.window.showErrorMessage('No deployment targets configured. Please setup deployment first.');
				return;
			}

			const targetItems = targets.map(target => ({
				label: target.name,
				description: target.type,
				detail: `Status: ${target.status}`,
				target
			}));

			const selectedTarget = await vscode.window.showQuickPick(targetItems, {
				placeHolder: 'Select deployment target for CI/CD setup'
			});

			if (selectedTarget) {
				const ciOptions = [
					{ label: 'GitHub Actions', value: 'github-actions' },
					{ label: 'GitLab CI', value: 'gitlab-ci' },
					{ label: 'Azure DevOps', value: 'azure-devops' }
				];

				const ciProvider = await vscode.window.showQuickPick(ciOptions, {
					placeHolder: 'Select CI/CD provider'
				});

				if (ciProvider) {
					const dockerize = await vscode.window.showQuickPick(['Yes', 'No'], {
						placeHolder: 'Create Dockerfile for containerized deployment?'
					});

					const autoTrigger = await vscode.window.showQuickPick(['Yes', 'No'], {
						placeHolder: 'Automatically trigger deployment on push to main branch?'
					}); await deploymentService.deployWithCI({
						target: selectedTarget.target.name,
						provider: ciProvider.value as any,
						environment: 'production',
						buildCommand: 'npm run build',
						testCommand: 'npm test'
					});
				}
			}
		}),

		vscode.commands.registerCommand('aide.viewDeploymentHistory', async () => {
			const { DeploymentService } = await import('./services/deploymentService');
			const deploymentService = new DeploymentService();

			const history = deploymentService.getDeploymentHistory();
			if (history.length === 0) {
				vscode.window.showInformationMessage('No deployment history found');
				return;
			}

			const historyItems = history.map(deployment => ({
				label: `${deployment.target} - ${deployment.status}`,
				description: deployment.id,
				detail: `${deployment.startTime.toLocaleString()} ${deployment.endTime ? '→ ' + deployment.endTime.toLocaleString() : '(In Progress)'}`,
				deployment
			}));

			const selectedDeployment = await vscode.window.showQuickPick(historyItems, {
				placeHolder: 'Select deployment to view details'
			});

			if (selectedDeployment) {
				const logs = selectedDeployment.deployment.logs.join('\n');
				const document = await vscode.workspace.openTextDocument({
					content: `Deployment Details
Target: ${selectedDeployment.deployment.target}
Status: ${selectedDeployment.deployment.status}
Start Time: ${selectedDeployment.deployment.startTime}
End Time: ${selectedDeployment.deployment.endTime || 'In Progress'}
Commit Hash: ${selectedDeployment.deployment.commitHash || 'N/A'}
Version: ${selectedDeployment.deployment.version || 'N/A'}

Logs:
${logs}`,
					language: 'plaintext'
				});
				vscode.window.showTextDocument(document);
			}
		}),

		vscode.commands.registerCommand('aide.manageDeploymentTargets', async () => {
			const { DeploymentService } = await import('./services/deploymentService');
			const deploymentService = new DeploymentService();

			const actions = [
				{ label: 'Add New Target', action: 'add' },
				{ label: 'Remove Target', action: 'remove' },
				{ label: 'View All Targets', action: 'view' }
			];

			const selectedAction = await vscode.window.showQuickPick(actions, {
				placeHolder: 'What would you like to do with deployment targets?'
			});

			if (selectedAction) {
				switch (selectedAction.action) {
					case 'add': {
						await vscode.commands.executeCommand('aide.setupDeployment');
						break;
					}
					case 'remove': {
						const targets = deploymentService.getDeploymentTargets();
						if (targets.length === 0) {
							vscode.window.showInformationMessage('No deployment targets to remove');
							return;
						}

						const targetItems = targets.map(target => ({
							label: target.name,
							description: target.type,
							detail: `Status: ${target.status}`,
							target
						}));

						const targetToRemove = await vscode.window.showQuickPick(targetItems, {
							placeHolder: 'Select target to remove'
						});

						if (targetToRemove) {
							const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
								placeHolder: `Are you sure you want to remove "${targetToRemove.target.name}"?`
							});

							if (confirm === 'Yes') {
								await deploymentService.removeDeploymentTarget(targetToRemove.target.name);
							}
						}
						break;
					}
					case 'view': {
						const allTargets = deploymentService.getDeploymentTargets();
						if (allTargets.length === 0) {
							vscode.window.showInformationMessage('No deployment targets configured');
							return;
						}

						const viewItems = allTargets.map(target => ({
							label: target.name,
							description: target.type,
							detail: `Status: ${target.status} | Build: ${target.buildCommand || 'None'} | Output: ${target.outputDirectory || 'Default'}`
						}));

						await vscode.window.showQuickPick(viewItems, {
							placeHolder: 'Deployment Targets Overview'
						});
						break;
					}
				}
			}
		}),
		vscode.commands.registerCommand('aide.setupMonitoring', async () => {
			const { DeploymentService } = await import('./services/deploymentService');
			const deploymentService = new DeploymentService();

			const targets = deploymentService.getDeploymentTargets();
			if (targets.length === 0) {
				vscode.window.showErrorMessage('No deployment targets configured. Please setup deployment first.');
				return;
			}

			const targetItems = targets.map(target => ({
				label: target.name,
				description: target.type,
				detail: `Status: ${target.status}`,
				target
			}));

			const selectedTarget = await vscode.window.showQuickPick(targetItems, {
				placeHolder: 'Select deployment target to setup monitoring'
			});

			if (selectedTarget) {
				await deploymentService.setupDeploymentMonitoring(selectedTarget.target.name);
			}
		}),
		// Version Management Commands
		vscode.commands.registerCommand('aide.showVersionHistory', async () => {
			const history = versionManager.getVersionHistory();
			const panel = vscode.window.createWebviewPanel(
				'aideVersionHistory',
				'AIDE Version History',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true
				}
			);

			panel.webview.html = generateVersionHistoryHTML(history);
		}),
		vscode.commands.registerCommand('aide.generateVersionBump', async () => {
			try {
				// Analyze current changes
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				if (!workspaceFolder) {
					vscode.window.showErrorMessage('No workspace folder found');
					return;
				}

				// For demo purposes, we'll use a simple change detection
				const changeType = await vscode.window.showQuickPick(
					['patch', 'minor', 'major'],
					{ placeHolder: 'Select change type for version bump' }
				) as 'patch' | 'minor' | 'major';

				if (!changeType) {
					return;
				}

				const newVersion = await versionManager.generateNewVersion(changeType);
				vscode.window.showInformationMessage(`Generated version bump: ${newVersion} (${changeType})`);

				// Show changelog preview
				const changelog = await versionManager.generateChangelog();
				const panel = vscode.window.createWebviewPanel(
					'aideChangelog',
					'Generated Changelog',
					vscode.ViewColumn.One,
					{}
				);
				panel.webview.html = `<pre>${changelog}</pre>`;
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to generate version bump: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.viewChangelog', async () => {
			try {
				const changelog = await versionManager.generateChangelog();
				const panel = vscode.window.createWebviewPanel(
					'aideChangelog',
					'AIDE Changelog',
					vscode.ViewColumn.One,
					{}
				);
				panel.webview.html = `<pre>${changelog}</pre>`;
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to load changelog: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.checkUpstreamUpdates', async () => {
			try {
				const upstreamInfo = await versionManager.checkUpstreamUpdates();
				const message = `VS Code ${upstreamInfo.vscodeVersion} - Status: ${upstreamInfo.compatibilityStatus}`;

				if (upstreamInfo.pendingUpdates.length > 0) {
					const result = await vscode.window.showInformationMessage(
						`${message}\nPending updates: ${upstreamInfo.pendingUpdates.length}`,
						'View Details'
					);

					if (result === 'View Details') {
						const panel = vscode.window.createWebviewPanel(
							'aideUpstreamUpdates',
							'VS Code Upstream Updates',
							vscode.ViewColumn.One,
							{}
						);
						panel.webview.html = generateUpstreamUpdatesHTML(upstreamInfo);
					}
				} else {
					vscode.window.showInformationMessage(message);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to check upstream updates: ${error}`);
			}
		}),

		// AI Service Configuration Commands
		vscode.commands.registerCommand('aide.configureAI', async () => {
			const providers = [
				{ label: 'OpenAI', value: 'openai' },
				{ label: 'Azure OpenAI', value: 'azure' },
				{ label: 'Anthropic Claude', value: 'anthropic' }
			];

			const selectedProvider = await vscode.window.showQuickPick(providers, {
				placeHolder: 'Select AI provider to configure'
			});

			if (selectedProvider) {
				const apiKey = await vscode.window.showInputBox({
					prompt: `Enter API key for ${selectedProvider.label}`,
					password: true,
					placeHolder: 'Your API key'
				}); if (apiKey) {
					try {
						await aiService.setupApiKey(selectedProvider.value, apiKey);
						const isConnected = await aiService.testConnection();

						if (isConnected) {
							vscode.window.showInformationMessage(`Successfully configured ${selectedProvider.label}!`);
						} else {
							vscode.window.showWarningMessage(`Configuration saved but connection test failed. Please verify your API key.`);
						}
					} catch (error) {
						vscode.window.showErrorMessage(`Failed to configure AI service: ${error}`);
					}
				}
			}
		}),

		vscode.commands.registerCommand('aide.testAIConnection', async () => {
			try {
				const isConnected = await aiService.testConnection();
				if (isConnected) {
					vscode.window.showInformationMessage('AI service connection successful!');
				} else {
					vscode.window.showWarningMessage('AI service connection failed. Please check your configuration.');
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Connection test failed: ${error}`);
			}
		}),
		vscode.commands.registerCommand('aide.switchAIProvider', async () => {
			const currentProvider = aiService.getCurrentProvider();
			const providers = [
				{ label: 'OpenAI', value: 'openai' },
				{ label: 'Azure OpenAI', value: 'azure' },
				{ label: 'Anthropic Claude', value: 'anthropic' }
			];

			const availableProviders = providers.filter(p => p.value !== currentProvider);

			const selectedProvider = await vscode.window.showQuickPick(availableProviders, {
				placeHolder: `Current: ${providers.find(p => p.value === currentProvider)?.label || 'None'}. Select new provider:`
			});

			if (selectedProvider) {
				try {
					await aiService.switchProvider(selectedProvider.value);
					vscode.window.showInformationMessage(`Switched to ${selectedProvider.label}`);
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to switch provider: ${error}`);
				}
			}
		}),
		// Predictive Development Engine Commands
		vscode.commands.registerCommand('aide.predictive.analyze', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showWarningMessage('No active editor found. Please open a file to analyze.');
					return;
				} vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Running Predictive Analysis...',
					cancellable: false
				}, async () => {
					const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
					predictiveInsights.show();

					const issueCount = predictions.filter((p: PredictionResult) => p.severity !== 'info').length;
					if (issueCount > 0) {
						vscode.window.showInformationMessage(`Analysis complete. Found ${issueCount} potential issues.`);
					} else {
						vscode.window.showInformationMessage('Analysis complete. No issues found!');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Analysis failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.showInsights', () => {
			predictiveInsights.show();
		}),

		vscode.commands.registerCommand('aide.predictive.securityScan', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showWarningMessage('No active editor found. Please open a file to scan.');
					return;
				}

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Running Security Scan...',
					cancellable: false
				}, async () => {
					const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
					const securityPredictions = predictions.filter((p: PredictionResult) => p.type === 'security');
					predictiveInsights.show();

					const criticalIssues = securityPredictions.filter((p: PredictionResult) => p.severity === 'critical' || p.severity === 'high').length;
					if (criticalIssues > 0) {
						vscode.window.showWarningMessage(`Security scan complete. Found ${criticalIssues} critical/high severity issues.`);
					} else {
						vscode.window.showInformationMessage('Security scan complete. No critical issues found!');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Security scan failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.performance', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showWarningMessage('No active editor found. Please open a file to analyze.');
					return;
				}

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Analyzing Performance...',
					cancellable: false
				}, async () => {
					const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
					const performancePredictions = predictions.filter((p: PredictionResult) => p.type === 'performance');
					predictiveInsights.show();

					const performanceIssues = performancePredictions.length;
					if (performanceIssues > 0) {
						vscode.window.showInformationMessage(`Performance analysis complete. Found ${performanceIssues} optimization opportunities.`);
					} else {
						vscode.window.showInformationMessage('Performance analysis complete. Code looks optimized!');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Performance analysis failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.dependency', async () => {
			try {
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				if (!workspaceFolder) {
					vscode.window.showWarningMessage('No workspace folder found. Please open a workspace to analyze dependencies.');
					return;
				}

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Analyzing Dependencies...',
					cancellable: false
				}, async () => {
					// For now, analyze current file and filter for dependency issues
					const activeEditor = vscode.window.activeTextEditor;
					if (activeEditor) {
						const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
						const depPredictions = predictions.filter((p: PredictionResult) => p.type === 'dependency');
						predictiveInsights.show();

						const vulnCount = depPredictions.filter((p: PredictionResult) => p.severity === 'high' || p.severity === 'critical').length;
						if (vulnCount > 0) {
							vscode.window.showWarningMessage(`Dependency analysis complete. Found ${vulnCount} security vulnerabilities.`);
						} else {
							vscode.window.showInformationMessage('Dependency analysis complete. No vulnerabilities found!');
						}
					} else {
						vscode.window.showWarningMessage('No active file to analyze dependencies for.');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Dependency analysis failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.bugPrevention', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showWarningMessage('No active editor found. Please open a file to analyze.');
					return;
				}

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Running Bug Prevention Analysis...',
					cancellable: false
				}, async () => {
					const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
					const bugPredictions = predictions.filter((p: PredictionResult) => p.type === 'bug' || p.type === 'bug-prevention');
					predictiveInsights.show();

					const bugRisks = bugPredictions.length;
					if (bugRisks > 0) {
						vscode.window.showInformationMessage(`Bug prevention analysis complete. Found ${bugRisks} potential bug risks.`);
					} else {
						vscode.window.showInformationMessage('Bug prevention analysis complete. Code looks robust!');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Bug prevention analysis failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.codeSuggestions', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showWarningMessage('No active editor found. Please open a file to get suggestions.');
					return;
				}

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Generating Code Suggestions...',
					cancellable: false
				}, async () => {
					const predictions = await predictiveEngine.analyzDocument(activeEditor.document);
					const suggestionPredictions = predictions.filter((p: PredictionResult) => p.type === 'suggestion' || p.type === 'code-completion');
					predictiveInsights.show();

					const suggestions = suggestionPredictions.length;
					if (suggestions > 0) {
						vscode.window.showInformationMessage(`Generated ${suggestions} code suggestions for improvement.`);
					} else {
						vscode.window.showInformationMessage('No immediate suggestions. Code looks good!');
					}
				});
			} catch (error) {
				vscode.window.showErrorMessage(`Code suggestions failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide.predictive.configure', async () => {
			const config = vscode.workspace.getConfiguration('aide.predictive');

			const options = [
				{
					label: 'Toggle Auto Analysis',
					description: config.get('autoAnalysis') ? 'Currently: Enabled' : 'Currently: Disabled',
					action: 'autoAnalysis'
				},
				{
					label: 'Configure Analyzers',
					description: 'Enable/disable individual analyzers',
					action: 'analyzers'
				},
				{
					label: 'Set Analysis Sensitivity',
					description: `Currently: ${config.get('severity', 'medium')}`,
					action: 'sensitivity'
				}
			];

			const selected = await vscode.window.showQuickPick(options, {
				placeHolder: 'Configure Predictive Development Engine'
			});

			if (selected) {
				switch (selected.action) {
					case 'autoAnalysis': {
						const current = config.get('autoAnalysis', true);
						await config.update('autoAnalysis', !current, vscode.ConfigurationTarget.Workspace);
						vscode.window.showInformationMessage(`Auto analysis ${!current ? 'enabled' : 'disabled'}`);
						break;
					}
					case 'analyzers': {
						const analyzerOptions = [
							{ label: 'Performance Analyzer', key: 'performanceAnalyzer' },
							{ label: 'Security Analyzer', key: 'securityAnalyzer' },
							{ label: 'Bug Prevention Analyzer', key: 'bugPreventionAnalyzer' },
							{ label: 'Code Quality Analyzer', key: 'codeAnalyzer' },
							{ label: 'Dependency Analyzer', key: 'dependencyAnalyzer' }
						];

						const enabledAnalyzers = await vscode.window.showQuickPick(analyzerOptions, {
							placeHolder: 'Select analyzers to enable',
							canPickMany: true
						});

						if (enabledAnalyzers) {
							const enabledKeys = enabledAnalyzers.map(a => a.key);
							await config.update('enabledAnalyzers', enabledKeys, vscode.ConfigurationTarget.Workspace);
							vscode.window.showInformationMessage(`Updated analyzer configuration`);
						}
						break;
					}
					case 'sensitivity': {
						const levels = ['low', 'medium', 'high'];
						const level = await vscode.window.showQuickPick(levels, {
							placeHolder: 'Select analysis sensitivity level'
						});

						if (level) {
							await config.update('severity', level, vscode.ConfigurationTarget.Workspace);
							vscode.window.showInformationMessage(`Set analysis sensitivity to ${level}`);
						}
						break;
					}
				}
			}
		}),
	);

	// Set context for when AIDE is active
	vscode.commands.executeCommand('setContext', 'aide.active', true);

	// Welcome message	vscode.window.showInformationMessage('AIDE is ready! Start by opening a conversation or planning a feature.');
}

/**
 * Generate HTML for version history display
 */
function generateVersionHistoryHTML(history: any[]): string {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>AIDE Version History</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; }
		.version { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
		.version-header { font-weight: bold; color: #0066cc; margin-bottom: 10px; }
		.changes { margin-left: 20px; }
		.change { margin: 5px 0; }
		.change-type { font-weight: bold; color: #666; }
	</style>
</head>
<body>
	<h1>AIDE Version History</h1>
	${history.length === 0 ? '<p>No version history available.</p>' :
			history.map(version => `
			<div class="version">
				<div class="version-header">
					Version ${version.current || 'Unknown'} (${version.changeType || 'patch'})
					<span style="float: right; font-size: 0.8em; color: #666;">
						${version.timestamp ? new Date(version.timestamp).toLocaleString() : 'Unknown date'}
					</span>
				</div>
				<div class="changes">
					${(version.changes || []).map((change: any) => `
						<div class="change">
							<span class="change-type">[${change.type || 'change'}]</span>
							${change.description || 'No description'}
						</div>
					`).join('')}
				</div>
			</div>
		`).join('')
		}
</body>
</html>`;
}

/**
 * Generate HTML for upstream updates display
 */
function generateUpstreamUpdatesHTML(upstreamInfo: any): string {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>VS Code Upstream Updates</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; }
		.status { padding: 10px; border-radius: 5px; margin: 10px 0; }
		.compatible { background-color: #d4edda; border: 1px solid #c3e6cb; }
		.needs-review { background-color: #fff3cd; border: 1px solid #ffeaa7; }
		.incompatible { background-color: #f8d7da; border: 1px solid #f5c6cb; }
		.update { margin: 5px 0; padding: 5px; background-color: #f8f9fa; border-radius: 3px; }
	</style>
</head>
<body>
	<h1>VS Code Upstream Updates</h1>
	<div class="status ${upstreamInfo.compatibilityStatus || 'needs-review'}">
		<strong>Current VS Code Version:</strong> ${upstreamInfo.vscodeVersion || 'Unknown'}<br>
		<strong>Compatibility Status:</strong> ${upstreamInfo.compatibilityStatus || 'Unknown'}<br>
		<strong>Last Sync:</strong> ${upstreamInfo.lastSync ? new Date(upstreamInfo.lastSync).toLocaleString() : 'Never'}
	</div>

	<h2>Pending Updates</h2>
	${(upstreamInfo.pendingUpdates || []).length === 0 ?
			'<p>No pending updates.</p>' :
			upstreamInfo.pendingUpdates.map((update: string) => `
			<div class="update">${update}</div>
		`).join('')
		}
</body>
</html>`;
}

/**
 * Generate HTML for health status display
 */
function generateHealthStatusHTML(health: any): string {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'healthy': return '#d4edda';
			case 'warning': return '#fff3cd';
			case 'error': return '#f8d7da';
			default: return '#f8f9fa';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'healthy': return '✅';
			case 'warning': return '⚠️';
			case 'error': return '❌';
			default: return '❓';
		}
	};

	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>AIDE Health Status</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, sans-serif;
			margin: 20px;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
		}
		.overall-status {
			padding: 20px;
			border-radius: 8px;
			margin-bottom: 20px;
			text-align: center;
			font-size: 1.2em;
			font-weight: bold;
		}
		.check-item {
			background-color: var(--vscode-panel-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 6px;
			padding: 15px;
			margin: 10px 0;
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.check-icon {
			font-size: 1.5em;
			min-width: 30px;
		}
		.check-content {
			flex: 1;
		}
		.check-name {
			font-weight: bold;
			margin-bottom: 5px;
		}
		.check-message {
			font-size: 0.9em;
			color: var(--vscode-descriptionForeground);
		}
		.check-time {
			font-size: 0.8em;
			color: var(--vscode-descriptionForeground);
			text-align: right;
		}
		.refresh-btn {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			margin-bottom: 20px;
		}
		.refresh-btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
	</style>
</head>
<body>
	<button class="refresh-btn" onclick="refreshHealth()">🔄 Refresh Health Check</button>

	<div class="overall-status" style="background-color: ${getStatusColor(health.overall)};">
		${getStatusIcon(health.overall)} Overall System Status: ${health.overall.toUpperCase()}
	</div>

	<h2>Service Health Checks</h2>
	${health.checks.map((check: any) => `
		<div class="check-item">
			<div class="check-icon">${getStatusIcon(check.status)}</div>
			<div class="check-content">
				<div class="check-name">${check.name}</div>
				${check.message ? `<div class="check-message">${check.message}</div>` : ''}
			</div>
			<div class="check-time">
				Last checked: ${check.lastChecked ? new Date(check.lastChecked).toLocaleTimeString() : 'Never'}
			</div>
		</div>
	`).join('')}

	<div style="margin-top: 20px; font-size: 0.9em; color: var(--vscode-descriptionForeground);">
		Last updated: ${health.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
	</div>

	<script>
		function refreshHealth() {
			// Request refresh from VS Code
			window.parent.postMessage({ command: 'refreshHealth' }, '*');
		}
	</script>
</body>
</html>`;
}

export function deactivate() {
	logger.info('AIDE Core extension is now deactivated');
	LoggerService.getInstance().dispose();
}
