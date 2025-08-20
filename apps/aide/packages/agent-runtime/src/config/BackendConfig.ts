/**
 * Dynamic Backend Configuration System
 * Handles the single backend URL configuration as specified in milestone1.prompt.md
 */

export interface BackendEndpoints {
	agentConfig: string;
	toolSchemas: string;
	featureFlags: string;
	defaults: string;
	plans: string;
	userPlan: string;
	serviceProvisioning: string;
	billing: string;
	usage: string;
}

export interface BackendConfigData {
	baseUrl: string;
	endpoints: BackendEndpoints;
	isReachable: boolean;
	lastChecked: Date;
	version?: string;
}

export class BackendConfig {
	private static instance: BackendConfig;
	private config: BackendConfigData | null = null;
	private readonly STORAGE_KEY = 'aide_backend_config';
	private readonly DEFAULT_BACKEND_URL = process.env.AIDE_DEFAULT_BACKEND_URL || 'https://api.aide.dev';

	private constructor() {
		this.loadFromStorage();
	}

	public static getInstance(): BackendConfig {
		if (!BackendConfig.instance) {
			BackendConfig.instance = new BackendConfig();
		}
		return BackendConfig.instance;
	}

	/**
	 * Get the current backend URL or prompt for one if not set
	 */
	public async getBackendUrl(): Promise<string> {
		if (!this.config) {
			// First startup - prompt for backend URL
			return await this.promptForBackendUrl();
		}

		// Check if backend is reachable
		if (!await this.isBackendReachable(this.config.baseUrl)) {
			console.warn('Backend is unreachable, prompting for new URL');
			return await this.promptForBackendUrl();
		}

		return this.config.baseUrl;
	}

	/**
	 * Set a new backend URL and validate it
	 */
	public async setBackendUrl(url: string): Promise<boolean> {
		try {
			const normalizedUrl = this.normalizeUrl(url);

			// Validate the backend URL
			if (!await this.validateBackendUrl(normalizedUrl)) {
				throw new Error('Backend URL validation failed');
			}

			this.config = {
				baseUrl: normalizedUrl,
				endpoints: this.generateEndpoints(normalizedUrl),
				isReachable: true,
				lastChecked: new Date()
			};

			this.saveToStorage();
			return true;
		} catch (error) {
			console.error('Failed to set backend URL:', error);
			return false;
		}
	}

	/**
	 * Get specific endpoint URL
	 */
	public getEndpoint(endpoint: keyof BackendEndpoints): string {
		if (!this.config) {
			throw new Error('Backend not configured. Call getBackendUrl() first.');
		}
		return this.config.endpoints[endpoint];
	}

	/**
	 * Get all endpoints
	 */
	public getEndpoints(): BackendEndpoints | null {
		return this.config?.endpoints || null;
	}

	/**
	 * Check if backend is configured and reachable
	 */
	public async isConfigured(): Promise<boolean> {
		if (!this.config) return false;
		return await this.isBackendReachable(this.config.baseUrl);
	}

	/**
	 * Force a backend URL update (for settings UI or agent commands)
	 */
	public async updateBackendUrl(newUrl: string): Promise<boolean> {
		return await this.setBackendUrl(newUrl);
	}

	/**
	 * Clear configuration and reset to prompt state
	 */
	public clearConfig(): void {
		this.config = null;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(this.STORAGE_KEY);
		}
	}

	private async promptForBackendUrl(): Promise<string> {
		// In a real implementation, this would show a UI prompt
		// For now, use the default URL and validate it
		const defaultUrl = this.DEFAULT_BACKEND_URL;

		console.log(`First startup detected. Using default backend: ${defaultUrl}`);
		console.log('You can change this later via settings or by asking the agent to "Use this new backend instead: <url>"');

		if (await this.setBackendUrl(defaultUrl)) {
			return defaultUrl;
		}

		throw new Error('Failed to configure backend URL. Please set AIDE_DEFAULT_BACKEND_URL environment variable or configure manually.');
	}
	private async validateBackendUrl(url: string): Promise<boolean> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(`${url}/health`, {
				method: 'GET',
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				const data = await response.json();
				// Check for AIDE-specific backend response
				return data.service === 'aide-backend' || data.name === 'aide-backend';
			}

			return false;
		} catch (error) {
			console.warn('Backend validation failed:', error);
			return false;
		}
	}
	private async isBackendReachable(url: string): Promise<boolean> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000);

			const response = await fetch(`${url}/health`, {
				method: 'HEAD',
				signal: controller.signal
			});

			clearTimeout(timeoutId);
			return response.ok;
		} catch {
			return false;
		}
	}

	private generateEndpoints(baseUrl: string): BackendEndpoints {
		return {
			agentConfig: `${baseUrl}/api/agent-config`,
			toolSchemas: `${baseUrl}/api/tool-schemas`,
			featureFlags: `${baseUrl}/api/feature-flags`,
			defaults: `${baseUrl}/api/defaults`,
			plans: `${baseUrl}/api/plans`,
			userPlan: `${baseUrl}/api/user-plan`,
			serviceProvisioning: `${baseUrl}/api/services`,
			billing: `${baseUrl}/api/billing`,
			usage: `${baseUrl}/api/usage`
		};
	}

	private normalizeUrl(url: string): string {
		// Remove trailing slash and ensure https
		let normalized = url.replace(/\/+$/, '');
		if (!normalized.startsWith('http')) {
			normalized = `https://${normalized}`;
		}
		return normalized;
	}

	private loadFromStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.config = {
					...parsed,
					lastChecked: new Date(parsed.lastChecked)
				};
			}
		} catch (error) {
			console.warn('Failed to load backend config from storage:', error);
		}
	}

	private saveToStorage(): void {
		if (typeof window === 'undefined' || !this.config) return;

		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
		} catch (error) {
			console.warn('Failed to save backend config to storage:', error);
		}
	}
}
