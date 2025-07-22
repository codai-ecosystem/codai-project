import * as vscode from 'vscode';

export interface TelemetryData {
	eventName: string;
	properties?: Record<string, string | number | boolean>;
	measurements?: Record<string, number>;
}

export class TelemetryService {
	private static instance: TelemetryService;
	private enabled: boolean = true;
	private context: vscode.ExtensionContext;

	private constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.enabled = vscode.workspace.getConfiguration('aide-installer').get('enableTelemetry', true);
	}

	public static getInstance(context?: vscode.ExtensionContext): TelemetryService {
		if (!TelemetryService.instance && context) {
			TelemetryService.instance = new TelemetryService(context);
		}
		return TelemetryService.instance;
	}

	public trackEvent(eventName: string, properties?: Record<string, string | number | boolean>, measurements?: Record<string, number>): void {
		if (!this.enabled) {
			return;
		}

		const telemetryData: TelemetryData = {
			eventName,
			properties: {
				...properties,
				timestamp: new Date().toISOString(),
				sessionId: this.getSessionId(),
				version: this.getExtensionVersion()
			},
			measurements
		};

		// Store telemetry data locally for now (could be sent to analytics service)
		this.storeTelemetryData(telemetryData);

		// Log for debugging (remove in production)
		console.log(`[AIDE Telemetry] ${eventName}`, telemetryData);
	}

	public trackInstallationStart(installationType: string): void {
		this.trackEvent('installation_started', {
			installationType,
			platform: process.platform,
			arch: process.arch
		});
	}

	public trackInstallationComplete(installationType: string, duration: number): void {
		this.trackEvent('installation_completed', {
			installationType,
			platform: process.platform,
			arch: process.arch
		}, {
			duration
		});
	}

	public trackInstallationError(installationType: string, error: string, step: string): void {
		this.trackEvent('installation_error', {
			installationType,
			error,
			step,
			platform: process.platform,
			arch: process.arch
		});
	}

	public trackFeatureUsage(feature: string, action: string): void {
		this.trackEvent('feature_usage', {
			feature,
			action
		});
	}

	private getSessionId(): string {
		let sessionId = this.context.globalState.get<string>('sessionId');
		if (!sessionId) {
			sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
			this.context.globalState.update('sessionId', sessionId);
		}
		return sessionId;
	}

	private getExtensionVersion(): string {
		return this.context.extension.packageJSON.version || '1.0.0';
	}

	private storeTelemetryData(data: TelemetryData): void {
		const existing = this.context.globalState.get<TelemetryData[]>('telemetryData', []);
		existing.push(data);

		// Keep only last 100 events
		if (existing.length > 100) {
			existing.splice(0, existing.length - 100);
		}

		this.context.globalState.update('telemetryData', existing);
	}

	public getTelemetryData(): TelemetryData[] {
		return this.context.globalState.get<TelemetryData[]>('telemetryData', []);
	}

	public clearTelemetryData(): void {
		this.context.globalState.update('telemetryData', []);
	}

	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		vscode.workspace.getConfiguration('aide-installer').update('enableTelemetry', enabled, vscode.ConfigurationTarget.Global);
	}

	public isEnabled(): boolean {
		return this.enabled;
	}
}
