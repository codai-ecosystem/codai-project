import * as vscode from 'vscode';

export interface InstallationConfig {
	profileName: string;
	installationPath: string;
	createDesktopShortcut: boolean;
	autoLaunchAfterInstall: boolean;
	includeExtensions: string[];
	apiProviders: {
		openai?: string;
		anthropic?: string;
		local?: boolean;
	};
}

export class ConfigurationWizard {
	private static readonly defaultConfig: InstallationConfig = {
		profileName: 'AIDE',
		installationPath: '',
		createDesktopShortcut: true,
		autoLaunchAfterInstall: true,
		includeExtensions: [
			'ms-vscode.vscode-typescript-next',
			'ms-python.python',
			'bradlc.vscode-tailwindcss',
			'esbenp.prettier-vscode'
		],
		apiProviders: {
			local: true
		}
	};

	static async show(): Promise<InstallationConfig | undefined> {
		const config = { ...this.defaultConfig };

		// Step 1: Profile Configuration
		const profileName = await vscode.window.showInputBox({
			title: 'AIDE Installation - Profile Name',
			prompt: 'Enter a name for your AIDE profile',
			value: config.profileName,
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Profile name cannot be empty';
				}
				if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
					return 'Profile name can only contain letters, numbers, spaces, hyphens, and underscores';
				}
				return null;
			}
		});

		if (profileName === undefined) {
			return undefined;
		}
		config.profileName = profileName;

		// Step 2: Installation Path
		const useCustomPath = await vscode.window.showQuickPick(
			[
				{ label: 'Use default location', description: 'Install in VS Code user directory', isDefault: true },
				{ label: 'Choose custom location', description: 'Select a custom installation directory' }
			],
			{
				title: 'AIDE Installation - Installation Location',
				placeHolder: 'Choose installation location'
			}
		);

		if (!useCustomPath) {
			return undefined;
		}

		if (useCustomPath.label === 'Choose custom location') {
			const customPath = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				title: 'Select AIDE Installation Directory'
			});

			if (customPath && customPath[0]) {
				config.installationPath = customPath[0].fsPath;
			} else {
				return undefined;
			}
		}

		// Step 3: Options
		const options = await vscode.window.showQuickPick(
			[
				{ label: 'Create desktop shortcut', picked: config.createDesktopShortcut },
				{ label: 'Launch AIDE after installation', picked: config.autoLaunchAfterInstall }
			],
			{
				title: 'AIDE Installation - Options',
				placeHolder: 'Select installation options',
				canPickMany: true
			}
		);

		if (options === undefined) {
			return undefined;
		}

		config.createDesktopShortcut = options.some(opt => opt.label === 'Create desktop shortcut');
		config.autoLaunchAfterInstall = options.some(opt => opt.label === 'Launch AIDE after installation');

		// Step 4: Extensions
		const extensionChoices = [
			{ label: 'TypeScript Language Features', description: 'ms-vscode.vscode-typescript-next', picked: true },
			{ label: 'Python Support', description: 'ms-python.python', picked: true },
			{ label: 'Tailwind CSS IntelliSense', description: 'bradlc.vscode-tailwindcss', picked: true },
			{ label: 'Prettier Code Formatter', description: 'esbenp.prettier-vscode', picked: true },
			{ label: 'GitLens', description: 'eamodio.gitlens', picked: false },
			{ label: 'Docker Support', description: 'ms-azuretools.vscode-docker', picked: false },
			{ label: 'REST Client', description: 'humao.rest-client', picked: false }
		];

		const selectedExtensions = await vscode.window.showQuickPick(
			extensionChoices,
			{
				title: 'AIDE Installation - Extensions',
				placeHolder: 'Select extensions to install',
				canPickMany: true
			}
		);

		if (selectedExtensions === undefined) {
			return undefined;
		}

		config.includeExtensions = selectedExtensions.map(ext => ext.description);

		// Step 5: AI Provider Configuration
		const providerChoice = await vscode.window.showQuickPick(
			[
				{ label: 'Local AI only', description: 'Use local AI models (no API keys required)', isDefault: true },
				{ label: 'Configure cloud providers', description: 'Set up OpenAI, Anthropic, or other providers' },
				{ label: 'Skip for now', description: 'Configure AI providers later' }
			],
			{
				title: 'AIDE Installation - AI Providers',
				placeHolder: 'Choose AI provider configuration'
			}
		);

		if (!providerChoice) {
			return undefined;
		}

		if (providerChoice.label === 'Configure cloud providers') {
			const openaiKey = await vscode.window.showInputBox({
				title: 'OpenAI API Key (Optional)',
				prompt: 'Enter your OpenAI API key or leave blank to skip',
				password: true
			});

			if (openaiKey !== undefined && openaiKey.trim().length > 0) {
				config.apiProviders.openai = openaiKey;
			}

			const anthropicKey = await vscode.window.showInputBox({
				title: 'Anthropic API Key (Optional)',
				prompt: 'Enter your Anthropic API key or leave blank to skip',
				password: true
			});

			if (anthropicKey !== undefined && anthropicKey.trim().length > 0) {
				config.apiProviders.anthropic = anthropicKey;
			}
		}

		// Step 6: Summary
		const summaryItems = [
			`Profile Name: ${config.profileName}`,
			`Installation Path: ${config.installationPath || 'Default'}`,
			`Desktop Shortcut: ${config.createDesktopShortcut ? 'Yes' : 'No'}`,
			`Auto Launch: ${config.autoLaunchAfterInstall ? 'Yes' : 'No'}`,
			`Extensions: ${config.includeExtensions.length} selected`,
			`AI Providers: ${Object.keys(config.apiProviders).length} configured`
		];

		const confirm = await vscode.window.showInformationMessage(
			'Installation Configuration Summary:\n\n' + summaryItems.join('\n'),
			{ modal: true },
			'Start Installation',
			'Back to Configuration'
		);

		if (confirm === 'Start Installation') {
			return config;
		}

		return undefined;
	}

	static async showQuickConfig(): Promise<Partial<InstallationConfig> | undefined> {
		const profileName = await vscode.window.showInputBox({
			title: 'Quick AIDE Setup',
			prompt: 'Enter profile name (or press Enter for default)',
			value: 'AIDE'
		});

		if (profileName === undefined) {
			return undefined;
		}

		return {
			profileName: profileName || 'AIDE',
			createDesktopShortcut: true,
			autoLaunchAfterInstall: true
		};
	}
}
