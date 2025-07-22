import * as vscode from 'vscode';

export class ErrorHandler {
	private static readonly ERROR_LOG_CHANNEL = 'AIDE Installer';
	private static outputChannel: vscode.OutputChannel;

	static getOutputChannel(): vscode.OutputChannel {
		if (!this.outputChannel) {
			this.outputChannel = vscode.window.createOutputChannel(this.ERROR_LOG_CHANNEL);
		}
		return this.outputChannel;
	}

	static logError(context: string, error: unknown): void {
		const channel = this.getOutputChannel();
		const timestamp = new Date().toISOString();
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;

		channel.appendLine(`[${timestamp}] ERROR in ${context}:`);
		channel.appendLine(`Message: ${errorMessage}`);
		if (errorStack) {
			channel.appendLine(`Stack: ${errorStack}`);
		}
		channel.appendLine('---');
	}

	static async handleInstallationError(context: string, error: unknown): Promise<void> {
		this.logError(context, error);
		const channel = this.getOutputChannel();

		const errorMessage = error instanceof Error ? error.message : String(error);
		const choice = await vscode.window.showErrorMessage(
			`Installation failed: ${errorMessage}`,
			'View Logs',
			'Retry',
			'Report Issue'
		);

		switch (choice) {
			case 'View Logs':
				channel.show();
				break;
			case 'Retry':
				vscode.commands.executeCommand('aide-installer.startInstallation');
				break;
			case 'Report Issue':
				const issueUrl = `https://github.com/codai-io/aide/issues/new?title=Installation%20Error&body=${encodeURIComponent(`**Error Context:** ${context}\n\n**Error Message:** ${errorMessage}\n\n**Platform:** ${process.platform}\n**VS Code Version:** ${vscode.version}\n**Node.js Version:** ${process.version}`)}`;
				vscode.env.openExternal(vscode.Uri.parse(issueUrl));
				break;
		}
	}

	static async handleProfileError(context: string, error: unknown): Promise<void> {
		this.logError(context, error);
		const channel = this.getOutputChannel();

		const errorMessage = error instanceof Error ? error.message : String(error);
		const choice = await vscode.window.showErrorMessage(
			`Profile operation failed: ${errorMessage}`,
			'View Logs',
			'Try Again'
		);

		if (choice === 'View Logs') {
			channel.show();
		}
	}

	static dispose(): void {
		if (this.outputChannel) {
			this.outputChannel.dispose();
		}
	}
}
