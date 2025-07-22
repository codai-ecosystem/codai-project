import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AIDeConfiguration {
	profileName: string;
	installationPath: string;
	createDesktopShortcut: boolean;
	autoLaunchAfterInstall: boolean;
	includeOptionalComponents: boolean;
	configurationMode: 'local' | 'remote' | 'hybrid';
}

export class ProfileManager {
	constructor(private context: vscode.ExtensionContext) { }

	async createProfile(config: AIDeConfiguration): Promise<void> {
		try {
			// Get VS Code installation path
			const vscodeCommand = this.getVSCodeCommand();

			// Create new profile using VS Code CLI
			const profileCommand = `"${vscodeCommand}" --profile "${config.profileName}" --extensions-dir "${path.join(config.installationPath, 'extensions')}"`;

			await execAsync(profileCommand);

			// Store profile information
			await this.storeProfileInfo(config);

		} catch (error) {
			throw new Error(`Failed to create profile: ${error}`);
		}
	}

	async launchAIDEProfile(): Promise<void> {
		try {
			const profileInfo = await this.getStoredProfileInfo();
			if (!profileInfo) {
				throw new Error('AIDE profile not found');
			}

			const vscodeCommand = this.getVSCodeCommand();
			const launchCommand = `"${vscodeCommand}" --profile "${profileInfo.profileName}"`;

			// Launch in new window
			spawn(vscodeCommand, ['--profile', profileInfo.profileName], {
				detached: true,
				stdio: 'ignore'
			});

		} catch (error) {
			throw new Error(`Failed to launch AIDE profile: ${error}`);
		}
	}

	async removeProfile(): Promise<void> {
		try {
			const profileInfo = await this.getStoredProfileInfo();
			if (!profileInfo) {
				return;
			}

			// Remove profile using VS Code CLI
			const vscodeCommand = this.getVSCodeCommand();
			await execAsync(`"${vscodeCommand}" --remove-profile "${profileInfo.profileName}"`);

			// Clean up stored information
			this.context.globalState.update('aide-installer.profile', undefined);

		} catch (error) {
			throw new Error(`Failed to remove profile: ${error}`);
		}
	}

	async getStoredProfileInfo(): Promise<AIDeConfiguration | undefined> {
		return this.context.globalState.get('aide-installer.profile');
	}

	private async storeProfileInfo(config: AIDeConfiguration): Promise<void> {
		await this.context.globalState.update('aide-installer.profile', config);
		await this.context.globalState.update('aide-installer.installed', true);
	}

	private getVSCodeCommand(): string {
		const platform = process.platform;

		switch (platform) {
			case 'win32':
				// Windows
				return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'Code.exe');
			case 'darwin':
				// macOS
				return '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
			case 'linux':
				// Linux
				return 'code';
			default:
				return 'code';
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

	private async createWindowsShortcut(config: AIDeConfiguration): Promise<void> {
		const desktopPath = path.join(process.env.USERPROFILE || '', 'Desktop');
		const shortcutPath = path.join(desktopPath, 'AIDE.lnk');
		const vscodeCommand = this.getVSCodeCommand();

		// Create PowerShell script to create shortcut
		const script = `
			$WshShell = New-Object -comObject WScript.Shell
			$Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
			$Shortcut.TargetPath = "${vscodeCommand}"
			$Shortcut.Arguments = "--profile ${config.profileName}"
			$Shortcut.WorkingDirectory = "${path.dirname(vscodeCommand)}"
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
code --profile "${config.profileName}"
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
Exec=code --profile "${config.profileName}"
Icon=vscode
Terminal=false
Categories=Development;IDE;
`;

		fs.writeFileSync(shortcutPath, desktopEntry);
		await execAsync(`chmod +x "${shortcutPath}"`);
	}

	async configureProfileSettings(config: AIDeConfiguration): Promise<void> {
		try {
			// Get profile settings path
			const settingsPath = await this.getProfileSettingsPath(config.profileName);

			// Default AIDE settings
			const aideSettings = {
				"workbench.colorTheme": "Default Dark Modern",
				"editor.fontSize": 14,
				"editor.fontFamily": "'Cascadia Code', 'Fira Code', monospace",
				"editor.ligatures": true,
				"terminal.integrated.fontSize": 12,
				"files.autoSave": "afterDelay",
				"editor.formatOnSave": true,
				"aide.autoComplete": true,
				"aide.conversational.enabled": true,
				"aide.memory.persistent": true,
				"extensions.autoUpdate": true
			};

			// Ensure directory exists
			const settingsDir = path.dirname(settingsPath);
			if (!fs.existsSync(settingsDir)) {
				fs.mkdirSync(settingsDir, { recursive: true });
			}

			// Write settings
			fs.writeFileSync(settingsPath, JSON.stringify(aideSettings, null, 2));

		} catch (error) {
			throw new Error(`Failed to configure profile settings: ${error}`);
		}
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
}
