import * as vscode from 'vscode';

export class WelcomeProvider implements vscode.TreeDataProvider<WelcomeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<WelcomeItem | undefined | null> = new vscode.EventEmitter<WelcomeItem | undefined | null>();
	readonly onDidChangeTreeData: vscode.Event<WelcomeItem | undefined | null> = this._onDidChangeTreeData.event;

	constructor() { }
	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: WelcomeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: WelcomeItem): Thenable<WelcomeItem[]> {
		if (!element) {
			return Promise.resolve([
				new WelcomeItem(
					'Install AIDE Environment',
					'Click to start the AIDE installation process',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'aide-installer.startInstallation',
						title: 'Install AIDE Environment'
					}
				),
				new WelcomeItem(
					'System Requirements',
					'View system requirements for AIDE',
					vscode.TreeItemCollapsibleState.Collapsed
				),
				new WelcomeItem(
					'Learn More',
					'Open AIDE documentation',
					vscode.TreeItemCollapsibleState.None,
					{
						command: 'vscode.open',
						title: 'Open Documentation',
						arguments: [vscode.Uri.parse('https://codai.ro/docs')]
					}
				)
			]);
		} else if (element.label === 'System Requirements') {
			return Promise.resolve([
				new WelcomeItem('✅ VS Code 1.85.0 or later', '', vscode.TreeItemCollapsibleState.None),
				new WelcomeItem('✅ Node.js 18.x or 20.x LTS', '', vscode.TreeItemCollapsibleState.None),
				new WelcomeItem('✅ Git installed', '', vscode.TreeItemCollapsibleState.None),
				new WelcomeItem('✅ 2GB+ free disk space', '', vscode.TreeItemCollapsibleState.None),
				new WelcomeItem('⚠️ Administrator privileges (for profile creation)', '', vscode.TreeItemCollapsibleState.None)
			]);
		}
		return Promise.resolve([]);
	}
}

class WelcomeItem extends vscode.TreeItem {
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
		if (label.includes('Install AIDE')) {
			this.iconPath = vscode.ThemeIcon.File;
		} else if (label.includes('System Requirements')) {
			this.iconPath = vscode.ThemeIcon.Folder;
		} else if (label.includes('Learn More')) {
			this.iconPath = vscode.ThemeIcon.File;
		}
	}
}
