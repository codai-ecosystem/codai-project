import * as vscode from 'vscode';

export interface FeedbackData {
	rating: number;
	comment: string;
	email?: string;
	timestamp: string;
	version: string;
	context: string;
}

export class FeedbackService {
	private static instance: FeedbackService;
	private context: vscode.ExtensionContext;

	private constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	public static getInstance(context?: vscode.ExtensionContext): FeedbackService {
		if (!FeedbackService.instance && context) {
			FeedbackService.instance = new FeedbackService(context);
		}
		return FeedbackService.instance;
	}

	public async showFeedbackDialog(context: string = 'general'): Promise<void> {
		const rating = await this.askForRating();
		if (rating === undefined) {
			return; // User cancelled
		}

		const comment = await this.askForComment();
		if (comment === undefined) {
			return; // User cancelled
		}

		const email = await this.askForEmail();
		// Email is optional, so continue even if cancelled

		const feedbackData: FeedbackData = {
			rating,
			comment,
			email,
			timestamp: new Date().toISOString(),
			version: this.context.extension.packageJSON.version || '1.0.0',
			context
		};

		await this.submitFeedback(feedbackData);

		vscode.window.showInformationMessage(
			'Thank you for your feedback! Your input helps us improve AIDE.',
			'Close'
		);
	}

	private async askForRating(): Promise<number | undefined> {
		const ratingOptions = [
			{ label: '⭐ 1 - Poor', rating: 1 },
			{ label: '⭐⭐ 2 - Fair', rating: 2 },
			{ label: '⭐⭐⭐ 3 - Good', rating: 3 },
			{ label: '⭐⭐⭐⭐ 4 - Very Good', rating: 4 },
			{ label: '⭐⭐⭐⭐⭐ 5 - Excellent', rating: 5 }
		];

		const selected = await vscode.window.showQuickPick(ratingOptions, {
			placeHolder: 'How would you rate your experience with AIDE Installer?',
			ignoreFocusOut: true
		});

		return selected?.rating;
	}

	private async askForComment(): Promise<string | undefined> {
		return await vscode.window.showInputBox({
			prompt: 'Please share your thoughts or suggestions (optional)',
			placeHolder: 'What did you like? What could be improved?',
			ignoreFocusOut: true,
			value: ''
		});
	}

	private async askForEmail(): Promise<string | undefined> {
		const wantContact = await vscode.window.showQuickPick(
			['Yes, I\'d like to be contacted', 'No, anonymous feedback only'],
			{
				placeHolder: 'Would you like us to contact you about your feedback?',
				ignoreFocusOut: true
			}
		);

		if (wantContact?.startsWith('Yes')) {
			return await vscode.window.showInputBox({
				prompt: 'Enter your email address (optional)',
				placeHolder: 'your.email@example.com',
				ignoreFocusOut: true,
				validateInput: (value) => {
					if (value && !value.includes('@')) {
						return 'Please enter a valid email address';
					}
					return undefined;
				}
			});
		}

		return undefined;
	}

	private async submitFeedback(feedback: FeedbackData): Promise<void> {
		// Store feedback locally
		const existing = this.context.globalState.get<FeedbackData[]>('feedbackData', []);
		existing.push(feedback);
		await this.context.globalState.update('feedbackData', existing);

		// In a real implementation, you would send this to your feedback service
		// For now, we just log it and store locally
		console.log('[AIDE Feedback]', feedback);

		// Optionally, you could integrate with GitHub Issues, email service, or analytics platform
		// await this.sendToFeedbackService(feedback);
	}

	public async showQuickFeedback(context: string): Promise<void> {
		const choice = await vscode.window.showInformationMessage(
			'How was your experience with AIDE Installer?',
			'😊 Great!',
			'😐 Okay',
			'😞 Poor',
			'💬 Detailed Feedback'
		);

		switch (choice) {
			case '😊 Great!':
				await this.submitQuickFeedback(5, 'Great experience', context);
				vscode.window.showInformationMessage('Thanks for the positive feedback!');
				break;
			case '😐 Okay':
				await this.submitQuickFeedback(3, 'Okay experience', context);
				vscode.window.showInformationMessage('Thanks for your feedback! We\'re working to improve.');
				break;
			case '😞 Poor':
				await this.submitQuickFeedback(1, 'Poor experience', context);
				vscode.window.showInformationMessage('We\'re sorry about your experience. Please consider leaving detailed feedback.');
				break;
			case '💬 Detailed Feedback':
				await this.showFeedbackDialog(context);
				break;
		}
	}

	private async submitQuickFeedback(rating: number, comment: string, context: string): Promise<void> {
		const feedback: FeedbackData = {
			rating,
			comment,
			timestamp: new Date().toISOString(),
			version: this.context.extension.packageJSON.version || '1.0.0',
			context
		};

		const existing = this.context.globalState.get<FeedbackData[]>('feedbackData', []);
		existing.push(feedback);
		await this.context.globalState.update('feedbackData', existing);
	}

	public getFeedbackData(): FeedbackData[] {
		return this.context.globalState.get<FeedbackData[]>('feedbackData', []);
	}

	public async clearFeedbackData(): Promise<void> {
		await this.context.globalState.update('feedbackData', []);
	}
}
