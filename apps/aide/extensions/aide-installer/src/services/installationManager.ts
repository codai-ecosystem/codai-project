import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as tar from 'tar';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AIDeConfiguration } from './profileManager';

const execAsync = promisify(exec);

interface ComponentManifest {
	name: string;
	version: string;
	downloadUrl: string;
	dependencies: string[];
	optional: boolean;
}

export class InstallationManager {
	private static readonly AIDE_REPO_URL = 'https://github.com/codai-io/aide';
	private static readonly COMPONENTS_MANIFEST_URL = 'https://api.github.com/repos/codai-io/aide/releases/latest';

	constructor(private context: vscode.ExtensionContext) { }

	async downloadComponents(config: AIDeConfiguration): Promise<void> {
		try {
			// Track installation start
			this.trackEvent('installation_started', {
				profileName: config.profileName,
				configMode: config.configurationMode,
				hasCustomPath: !!config.installationPath
			});

			// Create installation directory
			const installDir = config.installationPath || this.getDefaultInstallPath();
			if (!fs.existsSync(installDir)) {
				fs.mkdirSync(installDir, { recursive: true });
			}

			// Download component manifest
			const manifest = await this.getComponentManifest();

			// Download core components
			await this.downloadCoreComponents(installDir, manifest);

			// Download optional components if requested
			if (config.includeOptionalComponents) {
				await this.downloadOptionalComponents(installDir, manifest);
			}

			// Track successful download
			this.trackEvent('components_downloaded', {
				componentsCount: manifest.length,
				includeOptional: config.includeOptionalComponents
			});

		} catch (error) {
			// Track installation failure
			this.trackEvent('installation_failed', {
				error: String(error),
				step: 'download_components'
			});
			throw new Error(`Failed to download components: ${error}`);
		}
	}

	async installExtensions(config: AIDeConfiguration): Promise<void> {
		try {
			const extensions = this.getRequiredExtensions();

			for (const extension of extensions) {
				await this.installExtension(extension, config.profileName);
			}

		} catch (error) {
			throw new Error(`Failed to install extensions: ${error}`);
		}
	}

	async configureEnvironment(config: AIDeConfiguration): Promise<void> {
		try {
			// Configure AIDE environment variables
			await this.setupEnvironmentVariables(config);

			// Setup AIDE configuration files
			await this.setupConfigurationFiles(config);

			// Initialize AIDE workspace
			await this.initializeWorkspace(config);

		} catch (error) {
			throw new Error(`Failed to configure environment: ${error}`);
		}
	}

	async createDesktopShortcut(config: AIDeConfiguration): Promise<void> {
		const platform = process.platform;

		try {
			switch (platform) {
				case 'win32':
					await this.createWindowsShortcut(config);
					break;
				case 'darwin':
					await this.createMacShortcut(config);
					break;
				case 'linux':
					await this.createLinuxShortcut(config);
					break;
			}
		} catch (error) {
			throw new Error(`Failed to create desktop shortcut: ${error}`);
		}
	}

	async cleanup(): Promise<void> {
		try {
			const installationInfo = this.context.globalState.get('aide-installer.installation');
			if (installationInfo) {
				// Remove installation files
				const installPath = (installationInfo as any).installationPath;
				if (installPath && fs.existsSync(installPath)) {
					fs.rmSync(installPath, { recursive: true, force: true });
				}
			}

			// Clear stored information
			this.context.globalState.update('aide-installer.installation', undefined);
			this.context.globalState.update('aide-installer.installed', false);

		} catch (error) {
			throw new Error(`Failed to cleanup: ${error}`);
		}
	}

	private getDefaultInstallPath(): string {
		const platform = process.platform;

		switch (platform) {
			case 'win32':
				return path.join(process.env.LOCALAPPDATA || '', 'AIDE');
			case 'darwin':
				return path.join(process.env.HOME || '', 'Library', 'Application Support', 'AIDE');
			case 'linux':
				return path.join(process.env.HOME || '', '.aide');
			default:
				return path.join(process.env.HOME || '', '.aide');
		}
	}

	private async getComponentManifest(): Promise<ComponentManifest[]> {
		return new Promise((resolve, reject) => {
			https.get(InstallationManager.COMPONENTS_MANIFEST_URL, (res) => {
				let data = '';
				res.on('data', (chunk) => data += chunk);
				res.on('end', () => {
					try {
						const release = JSON.parse(data);
						// Parse component manifest from release assets or body
						const manifest = this.parseComponentManifest(release);
						resolve(manifest);
					} catch (error) {
						reject(error);
					}
				});
			}).on('error', reject);
		});
	}

	private parseComponentManifest(release: any): ComponentManifest[] {
		// Default component manifest
		return [
			{
				name: 'aide-core',
				version: release.tag_name || '1.0.0',
				downloadUrl: `${InstallationManager.AIDE_REPO_URL}/archive/refs/heads/main.zip`,
				dependencies: [],
				optional: false
			},
			{
				name: 'aide-extensions',
				version: release.tag_name || '1.0.0',
				downloadUrl: `${InstallationManager.AIDE_REPO_URL}/releases/latest/download/extensions.zip`,
				dependencies: ['aide-core'],
				optional: false
			},
			{
				name: 'aide-templates',
				version: release.tag_name || '1.0.0',
				downloadUrl: `${InstallationManager.AIDE_REPO_URL}/releases/latest/download/templates.zip`,
				dependencies: ['aide-core'],
				optional: true
			}
		];
	}

	private async downloadCoreComponents(installDir: string, manifest: ComponentManifest[]): Promise<void> {
		const coreComponents = manifest.filter(c => !c.optional);

		for (const component of coreComponents) {
			await this.downloadComponent(component, installDir);
		}
	}

	private async downloadOptionalComponents(installDir: string, manifest: ComponentManifest[]): Promise<void> {
		const optionalComponents = manifest.filter(c => c.optional);

		for (const component of optionalComponents) {
			await this.downloadComponent(component, installDir);
		}
	}

	private async downloadComponent(component: ComponentManifest, installDir: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const componentPath = path.join(installDir, `${component.name}.zip`);
			const file = fs.createWriteStream(componentPath);

			https.get(component.downloadUrl, (response) => {
				response.pipe(file);
				file.on('finish', () => {
					file.close();
					// Extract if it's a zip file
					if (componentPath.endsWith('.zip')) {
						this.extractComponent(componentPath, path.join(installDir, component.name))
							.then(() => resolve())
							.catch(reject);
					} else {
						resolve();
					}
				});
			}).on('error', (err) => {
				fs.unlink(componentPath, () => { }); // Clean up on error
				reject(err);
			});
		});
	}

	private async extractComponent(zipPath: string, extractPath: string): Promise<void> {
		// For now, we'll use a simple extraction method
		// In production, you'd want to use a proper zip library
		try {
			if (!fs.existsSync(extractPath)) {
				fs.mkdirSync(extractPath, { recursive: true });
			}

			// Extract using system command (platform dependent)
			const platform = process.platform;
			let extractCommand: string;

			switch (platform) {
				case 'win32':
					extractCommand = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}'"`;
					break;
				case 'darwin':
				case 'linux':
					extractCommand = `unzip -q '${zipPath}' -d '${extractPath}'`;
					break;
				default:
					throw new Error('Unsupported platform for extraction');
			}

			await execAsync(extractCommand);

			// Clean up zip file
			fs.unlinkSync(zipPath);

		} catch (error) {
			throw new Error(`Failed to extract component: ${error}`);
		}
	}

	private getRequiredExtensions(): string[] {
		return [
			'aide-core',
			'ms-vscode.vscode-typescript-next',
			'bradlc.vscode-tailwindcss',
			'esbenp.prettier-vscode',
			'ms-python.python',
			'ms-toolsai.jupyter',
			'GitHub.copilot',
			'ms-vscode.vscode-json'
		];
	}

	private async installExtension(extensionId: string, profileName: string): Promise<void> {
		try {
			const vscodeCommand = this.getVSCodeCommand();
			const installCommand = `"${vscodeCommand}" --profile "${profileName}" --install-extension "${extensionId}" --force`;

			await execAsync(installCommand);

		} catch (error) {
			// Log but don't fail for individual extensions
			console.warn(`Failed to install extension ${extensionId}: ${error}`);
		}
	}

	private getVSCodeCommand(): string {
		const platform = process.platform;

		switch (platform) {
			case 'win32':
				return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'Code.exe');
			case 'darwin':
				return '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
			case 'linux':
				return 'code';
			default:
				return 'code';
		}
	}

	private async setupEnvironmentVariables(config: AIDeConfiguration): Promise<void> {
		// Setup AIDE-specific environment variables
		const envVars = {
			AIDE_PROFILE: config.profileName,
			AIDE_INSTALL_PATH: config.installationPath,
			AIDE_MODE: config.configurationMode
		};

		// Store environment variables in profile settings
		const settingsPath = await this.getProfileSettingsPath(config.profileName);
		const settings = fs.existsSync(settingsPath)
			? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
			: {};

		settings['terminal.integrated.env.windows'] = envVars;
		settings['terminal.integrated.env.osx'] = envVars;
		settings['terminal.integrated.env.linux'] = envVars;

		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
	}

	private async setupConfigurationFiles(config: AIDeConfiguration): Promise<void> {
		const configDir = path.join(config.installationPath, 'config');
		if (!fs.existsSync(configDir)) {
			fs.mkdirSync(configDir, { recursive: true });
		}

		// Create AIDE configuration
		const aideConfig = {
			version: '1.0.0',
			profile: config.profileName,
			mode: config.configurationMode,
			features: {
				conversational: true,
				memory: true,
				agents: true,
				deployment: true
			},
			paths: {
				workspace: path.join(config.installationPath, 'workspace'),
				templates: path.join(config.installationPath, 'templates'),
				cache: path.join(config.installationPath, 'cache')
			}
		};

		const configPath = path.join(configDir, 'aide.json');
		fs.writeFileSync(configPath, JSON.stringify(aideConfig, null, 2));
	}

	private async initializeWorkspace(config: AIDeConfiguration): Promise<void> {
		const workspaceDir = path.join(config.installationPath, 'workspace');
		if (!fs.existsSync(workspaceDir)) {
			fs.mkdirSync(workspaceDir, { recursive: true });
		}

		// Create welcome workspace
		const welcomeDir = path.join(workspaceDir, 'welcome');
		if (!fs.existsSync(welcomeDir)) {
			fs.mkdirSync(welcomeDir, { recursive: true });
		}

		// Create README
		const readmeContent = `# Welcome to AIDE

This is your AIDE development environment workspace.

## Getting Started

1. **Open Conversational Interface**: Use \`Ctrl+Shift+P\` and search for "AIDE: Open Conversation"
2. **Create New Project**: Use \`Ctrl+Shift+P\` and search for "AIDE: Create Project"
3. **View Memory Graph**: Use \`Ctrl+Shift+P\` and search for "AIDE: Show Memory Graph"

## Features

- **AI-Powered Development**: Conversational interface for coding
- **Smart Memory**: Persistent context and learning
- **Agent System**: Specialized agents for different tasks
- **Project Templates**: Quick start templates for various frameworks
- **Deployment Tools**: Integrated deployment capabilities

## Documentation

Visit [codai.ro/docs](https://codai.ro/docs) for complete documentation.

Happy coding with AIDE! 🚀
`;

		fs.writeFileSync(path.join(welcomeDir, 'README.md'), readmeContent);
	}

	private async getProfileSettingsPath(profileName: string): Promise<string> {
		const platform = process.platform;
		let basePath: string;

		switch (platform) {
			case 'win32':
				basePath = path.join(process.env.APPDATA || '', 'Code', 'User', 'profiles', profileName);
				break;
			case 'darwin':
				basePath = path.join(process.env.HOME || '', 'Library', 'Application Support', 'Code', 'User', 'profiles', profileName);
				break;
			case 'linux':
				basePath = path.join(process.env.HOME || '', '.config', 'Code', 'User', 'profiles', profileName);
				break;
			default:
				throw new Error('Unsupported platform');
		}

		return path.join(basePath, 'settings.json');
	}

	private async createWindowsShortcut(config: AIDeConfiguration): Promise<void> {
		const desktopPath = path.join(process.env.USERPROFILE || '', 'Desktop');
		const shortcutPath = path.join(desktopPath, 'AIDE.lnk');
		const vscodeCommand = this.getVSCodeCommand();

		const script = `
			$WshShell = New-Object -comObject WScript.Shell
			$Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
			$Shortcut.TargetPath = "${vscodeCommand}"
			$Shortcut.Arguments = "--profile ${config.profileName}"
			$Shortcut.WorkingDirectory = "${path.join(config.installationPath, 'workspace')}"
			$Shortcut.IconLocation = "${vscodeCommand}"
			$Shortcut.Description = "AIDE Development Environment"
			$Shortcut.Save()
		`;

		await execAsync(`powershell -Command "${script}"`);
	}

	private async createMacShortcut(config: AIDeConfiguration): Promise<void> {
		const desktopPath = path.join(process.env.HOME || '', 'Desktop');
		const shortcutPath = path.join(desktopPath, 'AIDE.command');

		const script = `#!/bin/bash
cd "${path.join(config.installationPath, 'workspace')}"
code --profile "${config.profileName}" .
`;

		fs.writeFileSync(shortcutPath, script);
		await execAsync(`chmod +x "${shortcutPath}"`);
	}

	private async createLinuxShortcut(config: AIDeConfiguration): Promise<void> {
		const desktopPath = path.join(process.env.HOME || '', 'Desktop');
		const shortcutPath = path.join(desktopPath, 'AIDE.desktop');

		const desktopEntry = `[Desktop Entry]
Version=1.0
Type=Application
Name=AIDE
Comment=AIDE Development Environment
Exec=code --profile "${config.profileName}" "${path.join(config.installationPath, 'workspace')}"
Icon=vscode
Terminal=false
Categories=Development;IDE;
Path=${path.join(config.installationPath, 'workspace')}
`;

		fs.writeFileSync(shortcutPath, desktopEntry);
		await execAsync(`chmod +x "${shortcutPath}"`);
	}

	private trackEvent(eventName: string, properties: Record<string, any>): void {
		// Simple telemetry tracking - respects user privacy
		try {
			// Only track if user has enabled telemetry in VS Code
			const config = vscode.workspace.getConfiguration('telemetry');
			if (config.get('enableTelemetry') === false) {
				return;
			}

			// In a real implementation, this would send to analytics service
			console.log(`[AIDE-Installer] ${eventName}:`, properties);
		} catch (error) {
			// Silently fail - telemetry should never break functionality
		}
	}
}
