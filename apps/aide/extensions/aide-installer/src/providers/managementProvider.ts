import * as vscode from 'vscode';

export class ManagementProvider implements vscode.TreeDataProvider<ManagementItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<ManagementItem | undefined | null> = new vscode.EventEmitter<ManagementItem | undefined | null>();
	readonly onDidChangeTreeData: vscode.Event<ManagementItem | undefined | null> = this._onDidChangeTreeData.event;

	constructor() { }
	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: ManagementItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ManagementItem): Thenable<ManagementItem[]> {
		if (!element) {
			return Promise.resolve([
				new ManagementItem(
					'AIDE Environment',
					'Manage your AIDE installation',
					vscode.TreeItemCollapsibleState.Expanded
				),
				new ManagementItem(
					'Settings',
					'Configure AIDE settings',
					vscode.TreeItemCollapsibleState.Collapsed
				),
				new ManagementItem(
					'Help & Support',
					'Get help and support',
					vscode.TreeItemCollapsibleState.Collapsed
				)
			]);
		} else if (element.label === 'AIDE Environment') {
			return Promise.resolve([
				new ManagementItem(
					'Launch AIDE',
					'Launch AIDE in new window',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'aide-installer.launchAIDE',
						title: 'Launch AIDE Environment'
					}
				),
				new ManagementItem(
					'Reinstall Components',
					'Reinstall AIDE components',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'aide-installer.startInstallation',
						title: 'Reinstall AIDE Environment'
					}
				),
				new ManagementItem(
					'Uninstall AIDE',
					'Remove AIDE environment',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'aide-installer.uninstallAIDE',
						title: 'Uninstall AIDE Environment'
					}
				)
			]);
		} else if (element.label === 'Settings') {
			return Promise.resolve([
				new ManagementItem(
					'Open Settings',
					'Open AIDE installer settings',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'workbench.action.openSettings',
						title: 'Open Settings',
						arguments: ['aide-installer']
					}
				),
				new ManagementItem(
					'Profile Settings',
					'Configure AIDE profile',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'aide-installer.showConfiguration',
						title: 'Configure AIDE Installation'
					}
				)
			]);
		} else if (element.label === 'Help & Support') {
			return Promise.resolve([
				new ManagementItem(
					'Documentation',
					'View AIDE documentation',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'vscode.open',
						title: 'Open Documentation',
						arguments: [vscode.Uri.parse('https://codai.ro/docs')]
					}
				),
				new ManagementItem(
					'Report Issue',
					'Report a bug or request feature',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'vscode.open',
						title: 'Report Issue',
						arguments: [vscode.Uri.parse('https://github.com/codai-io/aide/issues')]
					}
				),
				new ManagementItem(
					'View Logs',
					'View installation logs',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'workbench.action.toggleDevTools',
						title: 'Open Developer Tools'
					}
				)
			]);
		}
		return Promise.resolve([]);
	}
}

class ManagementItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly description: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.tooltip = this.description;
		this.description = description;

		if (command) {
			this.command = command;
		}

		// Set icons based on content
		if (label.includes('Launch')) {
			this.iconPath = vscode.ThemeIcon.File;
		} else if (label.includes('Settings') || label.includes('Configure')) {
			this.iconPath = vscode.ThemeIcon.File;
		} else if (label.includes('Documentation') || label.includes('Help')) {
			this.iconPath = vscode.ThemeIcon.File;
		} else if (label.includes('Uninstall') || label.includes('Remove')) {
			this.iconPath = vscode.ThemeIcon.File;
		}
	}
}
