import * as vscode from 'vscode';

export interface InstallationStep {
	id: string;
	name: string;
	description: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	progress?: number;
	error?: string;
}

export class ProgressProvider implements vscode.TreeDataProvider<ProgressItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<ProgressItem | undefined | null> = new vscode.EventEmitter<ProgressItem | undefined | null>();
	readonly onDidChangeTreeData: vscode.Event<ProgressItem | undefined | null> = this._onDidChangeTreeData.event;

	private steps: InstallationStep[] = [
		{
			id: 'requirements',
			name: 'System Requirements Check',
			description: 'Verifying system requirements',
			status: 'pending'
		},
		{
			id: 'profile',
			name: 'Profile Creation',
			description: 'Creating AIDE VS Code profile',
			status: 'pending'
		},
		{
			id: 'components',
			name: 'Component Download',
			description: 'Downloading AIDE components',
			status: 'pending'
		},
		{
			id: 'extensions',
			name: 'Extension Installation',
			description: 'Installing required extensions',
			status: 'pending'
		},
		{
			id: 'configuration',
			name: 'Configuration Setup',
			description: 'Configuring AIDE environment',
			status: 'pending'
		},
		{
			id: 'shortcuts',
			name: 'Desktop Shortcuts',
			description: 'Creating desktop shortcuts',
			status: 'pending'
		}
	];

	constructor() { }
	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	updateStep(stepId: string, updates: Partial<InstallationStep>): void {
		const step = this.steps.find(s => s.id === stepId);
		if (step) {
			Object.assign(step, updates);
			this.refresh();
		}
	}

	getTreeItem(element: ProgressItem): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<ProgressItem[]> {
		return Promise.resolve(
			this.steps.map(step => new ProgressItem(step))
		);
	}

	getSteps(): InstallationStep[] {
		return this.steps;
	}

	resetSteps(): void {
		this.steps.forEach(step => {
			step.status = 'pending';
			step.progress = undefined;
			step.error = undefined;
		});
		this.refresh();
	}
}

class ProgressItem extends vscode.TreeItem {
	constructor(public readonly step: InstallationStep) {
		super(step.name, vscode.TreeItemCollapsibleState.None);

		this.description = this.getStatusDescription();
		this.tooltip = step.description;

		// Set icon based on status
		switch (step.status) {
			case 'pending':
				this.iconPath = vscode.ThemeIcon.File;
				break;
			case 'running':
				this.iconPath = vscode.ThemeIcon.File;
				break;
			case 'completed':
				this.iconPath = vscode.ThemeIcon.File;
				break;
			case 'failed':
				this.iconPath = vscode.ThemeIcon.File;
				break;
		}
	}

	private getStatusDescription(): string {
		switch (this.step.status) {
			case 'pending':
				return 'Waiting...';
			case 'running':
				return this.step.progress !== undefined ? `${this.step.progress}%` : 'In progress...';
			case 'completed':
				return 'Complete ✓';
			case 'failed':
				return `Failed: ${this.step.error || 'Unknown error'}`;
			default:
				return '';
		}
	}
}
