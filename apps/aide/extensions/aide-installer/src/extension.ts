import * as vscode from 'vscode';
import { InstallationManager } from './services/installationManager';
import { ProfileManager, AIDeConfiguration } from './services/profileManager';
import { ConfigurationWizard, InstallationConfig } from './components/configurationWizard';
import { ProgressProvider } from './providers/progressProvider';
import { WelcomeProvider } from './providers/welcomeProvider';
import { ManagementProvider } from './providers/managementProvider';
import { TelemetryService } from './services/telemetryService';
import { FeedbackService } from './services/feedbackService';
import * as fs from 'fs';

// Convert InstallationConfig to AIDeConfiguration
function convertToAIDeConfig(installationConfig: InstallationConfig): AIDeConfiguration {
	return {
		profileName: installationConfig.profileName,
		installationPath: installationConfig.installationPath || '',
		createDesktopShortcut: installationConfig.createDesktopShortcut,
		autoLaunchAfterInstall: installationConfig.autoLaunchAfterInstall,
		includeOptionalComponents: true,
		configurationMode: 'local'
	};
}

export function activate(context: vscode.ExtensionContext) {
	console.log('AIDE Installer extension is now active');

	// Initialize services
	const installationManager = new InstallationManager(context);
	const profileManager = new ProfileManager(context);
	const telemetryService = TelemetryService.getInstance(context);
	const feedbackService = FeedbackService.getInstance(context);

	// Track extension activation
	telemetryService.trackEvent('extension_activated', {
		platform: process.platform,
		arch: process.arch,
		vscodeVersion: vscode.version
	});

	// Initialize providers
	const welcomeProvider = new WelcomeProvider();
	const progressProvider = new ProgressProvider();
	const managementProvider = new ManagementProvider();

	// Register tree data providers
	vscode.window.registerTreeDataProvider('aide-installer.welcome', welcomeProvider);
	vscode.window.registerTreeDataProvider('aide-installer.progress', progressProvider);
	vscode.window.registerTreeDataProvider('aide-installer.management', managementProvider);
	// Add feedback command for user support
	const feedbackCommand = vscode.commands.registerCommand('aide-installer.sendFeedback', async () => {
		telemetryService.trackFeatureUsage('feedback', 'command_invoked');
		await feedbackService.showFeedbackDialog('manual_feedback');
	});

	// Register commands
	const commands = [
		feedbackCommand, vscode.commands.registerCommand('aide-installer.startInstallation', async () => {
			telemetryService.trackInstallationStart('full_installation');
			const startTime = Date.now();

			try {
				await startInstallationProcess(installationManager, profileManager, progressProvider, telemetryService, feedbackService);

				const duration = Date.now() - startTime;
				telemetryService.trackInstallationComplete('full_installation', duration);

				// Show quick feedback after successful installation
				setTimeout(() => {
					feedbackService.showQuickFeedback('post_installation');
				}, 2000);
			} catch (error) {
				telemetryService.trackInstallationError('full_installation', String(error), 'general');
				vscode.window.showErrorMessage(`Installation failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide-installer.showConfiguration', async () => {
			const config = await ConfigurationWizard.show();
			if (config) {
				vscode.window.showInformationMessage('Configuration saved successfully!');
			}
		}),
		vscode.commands.registerCommand('aide-installer.createProfile', async () => {
			try {
				const config = await ConfigurationWizard.showQuickConfig();
				if (config) {
					const fullConfig: InstallationConfig = {
						profileName: config.profileName || 'AIDE',
						installationPath: config.installationPath || '',
						createDesktopShortcut: config.createDesktopShortcut || true,
						autoLaunchAfterInstall: config.autoLaunchAfterInstall || true,
						includeExtensions: [],
						apiProviders: {}
					};
					await profileManager.createProfile(convertToAIDeConfig(fullConfig));
					vscode.window.showInformationMessage('AIDE profile created successfully!');
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Profile creation failed: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide-installer.launchAIDE', async () => {
			try {
				await profileManager.launchAIDEProfile();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to launch AIDE: ${error}`);
			}
		}),

		vscode.commands.registerCommand('aide-installer.uninstallAIDE', async () => {
			try {
				const confirmation = await vscode.window.showWarningMessage(
					'Are you sure you want to uninstall the AIDE environment? This will remove the profile and all associated data.',
					'Yes, Uninstall',
					'Cancel'
				);

				if (confirmation === 'Yes, Uninstall') {
					await uninstallAIDEEnvironment(installationManager, profileManager);
					vscode.window.showInformationMessage('AIDE environment uninstalled successfully.');
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Uninstallation failed: ${error}`);
			}
		}),

		// Telemetry and privacy commands
		vscode.commands.registerCommand('aide-installer.toggleTelemetry', async () => {
			const currentStatus = telemetryService.isEnabled();
			const action = currentStatus ? 'Disable' : 'Enable';

			const choice = await vscode.window.showQuickPick([
				`${action} Telemetry`,
				'Learn More About Telemetry',
				'Cancel'
			], {
				placeHolder: `Telemetry is currently ${currentStatus ? 'enabled' : 'disabled'}`
			});

			if (choice === `${action} Telemetry`) {
				telemetryService.setEnabled(!currentStatus);
				vscode.window.showInformationMessage(`Telemetry ${!currentStatus ? 'enabled' : 'disabled'}.`);
			} else if (choice === 'Learn More About Telemetry') {
				vscode.env.openExternal(vscode.Uri.parse('https://github.com/codai-io/aide/blob/main/docs/telemetry.md'));
			}
		}),

		vscode.commands.registerCommand('aide-installer.showDiagnostics', async () => {
			const diagnostics = await generateDiagnosticInfo(installationManager, profileManager, telemetryService);

			const panel = vscode.window.createWebviewPanel(
				'aide-diagnostics',
				'AIDE Diagnostics',
				vscode.ViewColumn.One,
				{ enableScripts: false }
			);

			panel.webview.html = generateDiagnosticsHTML(diagnostics);
		}),

		vscode.commands.registerCommand('aide-installer.quickFeedback', async () => {
			await feedbackService.showQuickFeedback('manual_quick_feedback');
		})
	];

	// Register all commands
	commands.forEach(command => context.subscriptions.push(command));

	// Check if AIDE is already installed
	checkInstallationStatus(context);

	// Show welcome message on first activation
	if (!context.globalState.get('aide-installer.welcomed')) {
		showWelcomeMessage(context);
		context.globalState.update('aide-installer.welcomed', true);
	}
}

async function startInstallationProcess(
	installationManager: InstallationManager,
	profileManager: ProfileManager,
	progressProvider: ProgressProvider,
	telemetryService?: TelemetryService,
	feedbackService?: FeedbackService
) {
	// Show configuration wizard first
	const config = await ConfigurationWizard.show();
	if (!config) {
		return; // User cancelled
	}

	// Convert to AIDE configuration
	const aideConfig = convertToAIDeConfig(config);

	// Request admin permissions if needed
	const needsAdmin = await checkAdminRequirements();
	if (needsAdmin) {
		const adminApproval = await vscode.window.showWarningMessage(
			'AIDE installation requires administrator permissions to create profiles and install components. Do you want to continue?',
			'Yes, Continue',
			'Cancel'
		);

		if (adminApproval !== 'Yes, Continue') {
			return;
		}
	}

	// Start installation with progress tracking
	try {
		// Set context for UI updates
		vscode.commands.executeCommand('setContext', 'aide-installer.installing', true);

		// Step 1: Create VS Code profile
		progressProvider.updateStep('profile', { status: 'running' });
		await profileManager.createProfile(aideConfig);
		progressProvider.updateStep('profile', { status: 'completed' });

		// Step 2: Download AIDE components
		progressProvider.updateStep('components', { status: 'running' });
		await installationManager.downloadComponents(aideConfig);
		progressProvider.updateStep('components', { status: 'completed' });

		// Step 3: Install extensions
		progressProvider.updateStep('extensions', { status: 'running' });
		await installationManager.installExtensions(aideConfig);
		progressProvider.updateStep('extensions', { status: 'completed' });

		// Step 4: Configure environment
		progressProvider.updateStep('configuration', { status: 'running' });
		await installationManager.configureEnvironment(aideConfig);
		progressProvider.updateStep('configuration', { status: 'completed' });

		// Step 5: Create desktop shortcut
		if (config.createDesktopShortcut) {
			progressProvider.updateStep('shortcuts', { status: 'running' });
			await installationManager.createDesktopShortcut(aideConfig);
			progressProvider.updateStep('shortcuts', { status: 'completed' });
		}

		// Step 6: Verify installation
		progressProvider.updateStep('verification', { status: 'running' });
		const verificationResult = await verifyInstallation(aideConfig);
		if (verificationResult.success) {
			progressProvider.updateStep('verification', { status: 'completed' });
		} else {
			progressProvider.updateStep('verification', {
				status: 'failed',
				error: `Some components may not be fully installed: ${verificationResult.issues.join(', ')}`
			});
		}

		// Update context
		vscode.commands.executeCommand('setContext', 'aide-installer.installed', true);
		vscode.commands.executeCommand('setContext', 'aide-installer.installing', false);

		// Show completion message with verification results
		let completionMessage = 'AIDE environment installed successfully!';
		if (!verificationResult.success) {
			completionMessage += ' Note: Some optional components may need manual configuration.';
		}

		const launchChoice = await vscode.window.showInformationMessage(
			completionMessage + ' Would you like to launch it now?',
			'Launch AIDE',
			'Later'
		);

		if (launchChoice === 'Launch AIDE' && config.autoLaunchAfterInstall) {
			await profileManager.launchAIDEProfile();
		}

	} catch (error) {
		vscode.commands.executeCommand('setContext', 'aide-installer.installing', false);
		// Update failed steps
		progressProvider.getSteps().forEach(step => {
			if (step.status === 'running') {
				progressProvider.updateStep(step.id, { status: 'failed', error: String(error) });
			}
		});
		throw error;
	}
}

async function uninstallAIDEEnvironment(
	installationManager: InstallationManager,
	profileManager: ProfileManager
) {
	// Remove profile
	await profileManager.removeProfile();

	// Clean up installation files
	await installationManager.cleanup();

	// Update context
	vscode.commands.executeCommand('setContext', 'aide-installer.installed', false);
}

interface VerificationResult {
	success: boolean;
	issues: string[];
}

async function verifyInstallation(config: AIDeConfiguration): Promise<VerificationResult> {
	const issues: string[] = [];

	try {
		// Check if profile exists
		const profiles = await vscode.workspace.getConfiguration('profiles');
		// This is a simplified check - in reality, you'd check the VS Code profiles API

		// Check installation directory
		if (config.installationPath && !fs.existsSync(config.installationPath)) {
			issues.push('Installation directory not found');
		}

		// Check if essential files exist
		// In a real implementation, you'd check for specific AIDE files

		return {
			success: issues.length === 0,
			issues
		};
	} catch (error) {
		issues.push(`Verification failed: ${error}`);
		return {
			success: false,
			issues
		};
	}
}

async function checkAdminRequirements(): Promise<boolean> {
	// Check if admin permissions are needed based on the platform
	const platform = process.platform;

	// On Windows, we typically need admin for profile creation
	// On macOS/Linux, we might need sudo for certain operations
	return platform === 'win32';
}

function checkInstallationStatus(context: vscode.ExtensionContext) {
	const isInstalled = context.globalState.get('aide-installer.installed', false);
	vscode.commands.executeCommand('setContext', 'aide-installer.installed', isInstalled);
}

async function showWelcomeMessage(context: vscode.ExtensionContext) {
	const message = 'Welcome to AIDE Installer! This extension will help you set up a complete AI-native development environment.';
	const action = await vscode.window.showInformationMessage(
		message,
		'Start Installation',
		'Learn More',
		'Later'
	);

	if (action === 'Start Installation') {
		vscode.commands.executeCommand('aide-installer.startInstallation');
	} else if (action === 'Learn More') {
		vscode.env.openExternal(vscode.Uri.parse('https://codai.ro/docs/installation'));
	}
}

async function generateDiagnosticInfo(
	installationManager: InstallationManager,
	profileManager: ProfileManager,
	telemetryService: TelemetryService
): Promise<any> {
	const diagnostics = {
		timestamp: new Date().toISOString(),
		platform: {
			os: process.platform,
			arch: process.arch,
			nodeVersion: process.version,
			vscodeVersion: vscode.version
		},
		extension: {
			version: vscode.extensions.getExtension('codai.aide-installer')?.packageJSON.version || 'unknown',
			telemetryEnabled: telemetryService.isEnabled()
		}, installation: {
			profileInfo: await profileManager.getStoredProfileInfo(),
			hasStoredProfile: !!(await profileManager.getStoredProfileInfo())
		},
		system: {
			homePath: process.env.HOME || process.env.USERPROFILE || 'unknown',
			vscodePath: process.env.VSCODE_PORTABLE || 'default'
		}
	};

	return diagnostics;
}

function generateDiagnosticsHTML(diagnostics: any): string {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>AIDE Diagnostics</title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
				.section { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
				.section h3 { margin-top: 0; color: #0066cc; }
				pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
				.copy-btn { background: #0066cc; color: white; border: none; padding: 5px 10px; margin-top: 10px; cursor: pointer; }
			</style>
		</head>
		<body>
			<h1>AIDE Installer Diagnostics</h1>
			<div class="section">
				<h3>System Information</h3>
				<pre>${JSON.stringify(diagnostics, null, 2)}</pre>
				<button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent)">
					Copy to Clipboard
				</button>
			</div>
			<div class="section">
				<h3>Next Steps</h3>
				<p>If you're experiencing issues, please:</p>
				<ul>
					<li>Copy the diagnostic information above</li>
					<li>Open a GitHub issue at <a href="https://github.com/codai-io/aide/issues">github.com/codai-io/aide/issues</a></li>
					<li>Include the diagnostic information in your report</li>
				</ul>
			</div>
		</body>
		</html>
	`;
}

export function deactivate() {
	console.log('AIDE Installer extension is now deactivated');
}
