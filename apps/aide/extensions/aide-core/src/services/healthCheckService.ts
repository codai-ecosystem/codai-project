import * as vscode from 'vscode';
import { createLogger } from './loggerService';
import { AgentManager } from '../agents/agentManager';
import { AIService } from './aiService';
import { PluginManager } from '../plugins/pluginManager';

export interface HealthCheck {
	name: string;
	status: 'healthy' | 'warning' | 'error';
	message?: string;
	lastChecked: Date;
	data?: any;
}

export interface SystemHealth {
	overall: 'healthy' | 'warning' | 'error';
	checks: HealthCheck[];
	timestamp: Date;
}

/**
 * Health monitoring service for AIDE Core
 * Monitors the health of all critical services and components
 */
export class HealthCheckService {
	private static instance: HealthCheckService;
	private logger = createLogger('HealthCheck');
	private healthCheckInterval: NodeJS.Timeout | undefined;
	private lastHealthCheck: SystemHealth | undefined;

	private constructor() {
		this.startHealthMonitoring();
	}

	public static getInstance(): HealthCheckService {
		if (!HealthCheckService.instance) {
			HealthCheckService.instance = new HealthCheckService();
		}
		return HealthCheckService.instance;
	}

	/**
	 * Perform a complete health check of all services
	 */
	public async performHealthCheck(
		agentManager?: AgentManager,
		aiService?: AIService,
		pluginManager?: PluginManager
	): Promise<SystemHealth> {
		const checks: HealthCheck[] = [];
		const timestamp = new Date();

		// Check VS Code Extension Host
		checks.push(await this.checkVSCodeExtensionHost());

		// Check Workspace
		checks.push(await this.checkWorkspace());

		// Check Configuration
		checks.push(await this.checkConfiguration());

		// Check Agent Manager
		if (agentManager) {
			checks.push(await this.checkAgentManager(agentManager));
		}

		// Check AI Service
		if (aiService) {
			checks.push(await this.checkAIService(aiService));
		}

		// Check Plugin Manager
		if (pluginManager) {
			checks.push(await this.checkPluginManager(pluginManager));
		}

		// Check Memory and Storage
		checks.push(await this.checkMemoryAndStorage());

		// Determine overall health
		const errorChecks = checks.filter(c => c.status === 'error');
		const warningChecks = checks.filter(c => c.status === 'warning');

		let overall: 'healthy' | 'warning' | 'error' = 'healthy';
		if (errorChecks.length > 0) {
			overall = 'error';
		} else if (warningChecks.length > 0) {
			overall = 'warning';
		}

		const health: SystemHealth = {
			overall,
			checks,
			timestamp
		};

		this.lastHealthCheck = health;
		this.logger.info(`Health check completed: ${overall}`, {
			healthyChecks: checks.filter(c => c.status === 'healthy').length,
			warningChecks: warningChecks.length,
			errorChecks: errorChecks.length
		});

		return health;
	}

	/**
	 * Get the last health check result
	 */
	public getLastHealthCheck(): SystemHealth | undefined {
		return this.lastHealthCheck;
	}

	/**
	 * Show health status in VS Code UI
	 */
	public async showHealthStatus(): Promise<void> {
		if (!this.lastHealthCheck) {
			vscode.window.showInformationMessage('No health check data available. Running health check...');
			await this.performHealthCheck();
			return;
		}

		const { overall, checks, timestamp } = this.lastHealthCheck;
		const timeSince = Math.round((Date.now() - timestamp.getTime()) / 1000);

		const statusIcon = overall === 'healthy' ? '✅' : overall === 'warning' ? '⚠️' : '❌';
		const summary = `${statusIcon} AIDE Health: ${overall.toUpperCase()} (checked ${timeSince}s ago)`;

		const items = checks.map(check => {
			const icon = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
			return {
				label: `${icon} ${check.name}`,
				description: check.status.toUpperCase(),
				detail: check.message || 'No details'
			};
		});

		const selected = await vscode.window.showQuickPick([
			{ label: summary, description: 'Overall Status', detail: 'Select to see detailed checks' },
			...items
		], {
			placeHolder: 'AIDE System Health Status'
		});

		if (selected && selected.label === summary) {
			// Show detailed view in a new document
			const healthReport = this.generateHealthReport(this.lastHealthCheck);
			const doc = await vscode.workspace.openTextDocument({
				content: healthReport,
				language: 'markdown'
			});
			await vscode.window.showTextDocument(doc);
		}
	}

	private async checkVSCodeExtensionHost(): Promise<HealthCheck> {
		try {
			// Check if VS Code APIs are responding
			const version = vscode.version;
			const extensions = vscode.extensions.all.length;

			return {
				name: 'VS Code Extension Host',
				status: 'healthy',
				message: `VS Code ${version}, ${extensions} extensions loaded`,
				lastChecked: new Date(),
				data: { version, extensionCount: extensions }
			};
		} catch (error) {
			return {
				name: 'VS Code Extension Host',
				status: 'error',
				message: `Extension host error: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private async checkWorkspace(): Promise<HealthCheck> {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;

			if (!workspaceFolders || workspaceFolders.length === 0) {
				return {
					name: 'Workspace',
					status: 'warning',
					message: 'No workspace folder open',
					lastChecked: new Date()
				};
			}

			const folderCount = workspaceFolders.length;
			const workspaceFile = vscode.workspace.workspaceFile;

			return {
				name: 'Workspace',
				status: 'healthy',
				message: `${folderCount} workspace folder(s) open`,
				lastChecked: new Date(),
				data: {
					folderCount,
					hasWorkspaceFile: !!workspaceFile,
					folders: workspaceFolders.map(f => f.name)
				}
			};
		} catch (error) {
			return {
				name: 'Workspace',
				status: 'error',
				message: `Workspace check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private async checkConfiguration(): Promise<HealthCheck> {
		try {
			const config = vscode.workspace.getConfiguration('aide');
			const apiKeys = {
				openai: config.get<string>('openaiApiKey', ''),
				anthropic: config.get<string>('anthropicApiKey', ''),
				azure: config.get<string>('azureApiKey', '')
			};

			const configuredKeys = Object.entries(apiKeys).filter(([_, value]) => value.length > 0);

			if (configuredKeys.length === 0) {
				return {
					name: 'Configuration',
					status: 'warning',
					message: 'No AI API keys configured',
					lastChecked: new Date(),
					data: { configuredProviders: [] }
				};
			}

			return {
				name: 'Configuration',
				status: 'healthy',
				message: `${configuredKeys.length} AI provider(s) configured`,
				lastChecked: new Date(),
				data: { configuredProviders: configuredKeys.map(([key, _]) => key) }
			};
		} catch (error) {
			return {
				name: 'Configuration',
				status: 'error',
				message: `Configuration check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}
	private async checkAgentManager(agentManager: AgentManager): Promise<HealthCheck> {
		try {
			// Check if agent manager is responding by getting project status
			const status = await agentManager.getProjectStatus();

			return {
				name: 'Agent Manager',
				status: 'healthy',
				message: 'Agent manager is responding normally',
				lastChecked: new Date(),
				data: { projectStatus: status }
			};
		} catch (error) {
			return {
				name: 'Agent Manager',
				status: 'error',
				message: `Agent manager check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private async checkAIService(aiService: AIService): Promise<HealthCheck> {
		try {
			// Basic AI service availability check
			// Note: This is a simple check - we could extend it to test actual API connectivity
			return {
				name: 'AI Service',
				status: 'healthy',
				message: 'AI service initialized',
				lastChecked: new Date()
			};
		} catch (error) {
			return {
				name: 'AI Service',
				status: 'error',
				message: `AI service check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private async checkPluginManager(pluginManager: PluginManager): Promise<HealthCheck> {
		try {
			const loadedPlugins = pluginManager.getLoadedPlugins();
			const pluginCount = loadedPlugins.length;

			return {
				name: 'Plugin Manager',
				status: 'healthy',
				message: `${pluginCount} plugin(s) loaded`,
				lastChecked: new Date(),
				data: {
					pluginCount,
					plugins: loadedPlugins.map(p => ({ id: p.id, name: p.name, version: p.version }))
				}
			};
		} catch (error) {
			return {
				name: 'Plugin Manager',
				status: 'error',
				message: `Plugin manager check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private async checkMemoryAndStorage(): Promise<HealthCheck> {
		try {
			// Check memory usage and storage accessibility
			const memoryUsage = process.memoryUsage();
			const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
			const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

			let status: 'healthy' | 'warning' | 'error' = 'healthy';
			let message = `Memory: ${heapUsedMB}MB/${heapTotalMB}MB`;

			// Warning if using more than 500MB
			if (heapUsedMB > 500) {
				status = 'warning';
				message += ' (high memory usage)';
			}

			// Error if using more than 1GB
			if (heapUsedMB > 1024) {
				status = 'error';
				message += ' (critical memory usage)';
			}

			return {
				name: 'Memory & Storage',
				status,
				message,
				lastChecked: new Date(),
				data: { memoryUsageMB: heapUsedMB, memoryTotalMB: heapTotalMB }
			};
		} catch (error) {
			return {
				name: 'Memory & Storage',
				status: 'error',
				message: `Memory check failed: ${error}`,
				lastChecked: new Date()
			};
		}
	}

	private generateHealthReport(health: SystemHealth): string {
		const { overall, checks, timestamp } = health;

		let report = `# AIDE System Health Report\n\n`;
		report += `**Overall Status:** ${overall.toUpperCase()} ${overall === 'healthy' ? '✅' : overall === 'warning' ? '⚠️' : '❌'}\n`;
		report += `**Generated:** ${timestamp.toISOString()}\n\n`;

		report += `## Summary\n\n`;
		const healthyCount = checks.filter(c => c.status === 'healthy').length;
		const warningCount = checks.filter(c => c.status === 'warning').length;
		const errorCount = checks.filter(c => c.status === 'error').length;

		report += `- ✅ Healthy: ${healthyCount}\n`;
		report += `- ⚠️ Warnings: ${warningCount}\n`;
		report += `- ❌ Errors: ${errorCount}\n\n`;

		report += `## Detailed Checks\n\n`;

		for (const check of checks) {
			const icon = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
			report += `### ${icon} ${check.name}\n\n`;
			report += `**Status:** ${check.status.toUpperCase()}\n`;
			report += `**Message:** ${check.message || 'No message'}\n`;
			report += `**Last Checked:** ${check.lastChecked.toISOString()}\n`;

			if (check.data) {
				report += `**Data:**\n\`\`\`json\n${JSON.stringify(check.data, null, 2)}\n\`\`\`\n`;
			}

			report += '\n---\n\n';
		}

		return report;
	}

	private startHealthMonitoring(): void {
		// Run health check every 5 minutes
		this.healthCheckInterval = setInterval(async () => {
			try {
				await this.performHealthCheck();
			} catch (error) {
				this.logger.error('Periodic health check failed', error);
			}
		}, 5 * 60 * 1000);
	}

	public dispose(): void {
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
		}
	}
}
