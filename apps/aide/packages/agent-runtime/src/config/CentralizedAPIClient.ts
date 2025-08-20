import { BackendConfig } from './BackendConfig.js';

/**
 * Centralized API Client for AIDE
 * Routes all requests through the single configured backend URL
 * Implements dynamic endpoint resolution per milestone1.prompt.md
 */
export class CentralizedAPIClient {
	private static instance: CentralizedAPIClient;
	private backendConfig: BackendConfig;
	private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

	private constructor() {
		this.backendConfig = BackendConfig.getInstance();
	}

	public static getInstance(): CentralizedAPIClient {
		if (!CentralizedAPIClient.instance) {
			CentralizedAPIClient.instance = new CentralizedAPIClient();
		}
		return CentralizedAPIClient.instance;
	}

	/**
	 * Get agent configuration from backend
	 */
	public async getAgentConfig(): Promise<any> {
		const cacheKey = 'agent-config';
		const cached = this.getFromCache(cacheKey);
		if (cached) return cached;

		const endpoint = this.backendConfig.getEndpoint('agentConfig');
		const data = await this.fetchWithAuth(endpoint);

		// Cache for 5 minutes
		this.setCache(cacheKey, data, 5 * 60 * 1000);
		return data;
	}

	/**
	 * Get tool schemas from backend
	 */
	public async getToolSchemas(): Promise<any> {
		const cacheKey = 'tool-schemas';
		const cached = this.getFromCache(cacheKey);
		if (cached) return cached;

		const endpoint = this.backendConfig.getEndpoint('toolSchemas');
		const data = await this.fetchWithAuth(endpoint);

		// Cache for 10 minutes
		this.setCache(cacheKey, data, 10 * 60 * 1000);
		return data;
	}

	/**
	 * Get feature flags from backend
	 */
	public async getFeatureFlags(): Promise<any> {
		const cacheKey = 'feature-flags';
		const cached = this.getFromCache(cacheKey);
		if (cached) return cached;

		const endpoint = this.backendConfig.getEndpoint('featureFlags');
		const data = await this.fetchWithAuth(endpoint);

		// Cache for 2 minutes (shorter for quick updates)
		this.setCache(cacheKey, data, 2 * 60 * 1000);
		return data;
	}

	/**
	 * Get default configurations from backend
	 */
	public async getDefaults(): Promise<any> {
		const cacheKey = 'defaults';
		const cached = this.getFromCache(cacheKey);
		if (cached) return cached;

		const endpoint = this.backendConfig.getEndpoint('defaults');
		const data = await this.fetchWithAuth(endpoint);

		// Cache for 15 minutes
		this.setCache(cacheKey, data, 15 * 60 * 1000);
		return data;
	}

	/**
	 * Get all available plans from backend
	 */
	public async getPlans(): Promise<any> {
		const endpoint = this.backendConfig.getEndpoint('plans');
		return await this.fetchWithAuth(endpoint);
	}

	/**
	 * Get current user's plan from backend
	 */
	public async getUserPlan(userId: string): Promise<any> {
		const endpoint = `${this.backendConfig.getEndpoint('userPlan')}/${userId}`;
		return await this.fetchWithAuth(endpoint);
	}

	/**
	 * Provision a new service for the user
	 */
	public async provisionService(serviceType: string, userId: string, config: any): Promise<any> {
		const endpoint = `${this.backendConfig.getEndpoint('serviceProvisioning')}/${serviceType}`;
		return await this.fetchWithAuth(endpoint, 'POST', { userId, config });
	}

	/**
	 * Get user's service configurations
	 */
	public async getServiceConfig(userId: string, serviceType?: string): Promise<any> {
		let endpoint = `${this.backendConfig.getEndpoint('serviceProvisioning')}/${userId}`;
		if (serviceType) {
			endpoint += `/${serviceType}`;
		}
		return await this.fetchWithAuth(endpoint);
	}

	/**
	 * Create billing session (Stripe Connect)
	 */
	public async createBillingSession(userId: string, planId: string, connectAccountId?: string): Promise<any> {
		const endpoint = `${this.backendConfig.getEndpoint('billing')}/session`;
		return await this.fetchWithAuth(endpoint, 'POST', {
			userId,
			planId,
			connectAccountId
		});
	}

	/**
	 * Get user earnings and payout data
	 */
	public async getUserEarnings(userId: string, period?: string): Promise<any> {
		let endpoint = `${this.backendConfig.getEndpoint('billing')}/earnings/${userId}`;
		if (period) {
			endpoint += `?period=${period}`;
		}
		return await this.fetchWithAuth(endpoint);
	}

	/**
	 * Track usage for billing
	 */
	public async trackUsage(userId: string, usageData: any): Promise<any> {
		const endpoint = this.backendConfig.getEndpoint('usage');
		return await this.fetchWithAuth(endpoint, 'POST', {
			userId,
			...usageData,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Get usage statistics
	 */
	public async getUsageStats(userId: string, period?: string): Promise<any> {
		let endpoint = `${this.backendConfig.getEndpoint('usage')}/${userId}`;
		if (period) {
			endpoint += `?period=${period}`;
		}
		return await this.fetchWithAuth(endpoint);
	}

	/**
	 * Convenience methods for HTTP verbs
	 */
	public async get(endpoint: string, authToken?: string): Promise<any> {
		const url = endpoint.startsWith('http') ? endpoint : `${this.backendConfig.getBackendUrl()}${endpoint}`;
		return await this.fetchWithAuth(url, 'GET', undefined, authToken);
	}

	public async post(endpoint: string, data?: any, authToken?: string): Promise<any> {
		const url = endpoint.startsWith('http') ? endpoint : `${this.backendConfig.getBackendUrl()}${endpoint}`;
		return await this.fetchWithAuth(url, 'POST', data, authToken);
	}

	public async put(endpoint: string, data?: any, authToken?: string): Promise<any> {
		const url = endpoint.startsWith('http') ? endpoint : `${this.backendConfig.getBackendUrl()}${endpoint}`;
		return await this.fetchWithAuth(url, 'PUT', data, authToken);
	}

	public async delete(endpoint: string, authToken?: string): Promise<any> {
		const url = endpoint.startsWith('http') ? endpoint : `${this.backendConfig.getBackendUrl()}${endpoint}`;
		return await this.fetchWithAuth(url, 'DELETE', undefined, authToken);
	}

	/**
	 * Generic authenticated fetch with error handling
	 */
	private async fetchWithAuth(
		url: string,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
		body?: any,
		authToken?: string
	): Promise<any> {
		try {
			// Get auth token if not provided
			if (!authToken) {
				authToken = await this.getAuthToken();
			} const requestInit: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`,
					'X-AIDE-Client': 'agent-runtime',
					'X-AIDE-Version': process.env.AIDE_VERSION || '1.0.0'
				}
			};

			if (body) {
				requestInit.body = JSON.stringify(body);
			}

			const response = await fetch(url, requestInit);

			if (!response.ok) {
				// Handle specific error cases
				if (response.status === 401) {
					throw new Error('Authentication failed. Please check your backend configuration.');
				}
				if (response.status === 403) {
					throw new Error('Access denied. Check your plan permissions.');
				}
				if (response.status === 429) {
					throw new Error('Rate limit exceeded. Please try again later.');
				}
				if (response.status >= 500) {
					throw new Error('Backend service error. Please try again later.');
				}

				const errorData = await response.json().catch(() => ({}));
				throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('API request failed:', error);
			throw error;
		}
	}

	/**
	 * Get authentication token (placeholder - implement based on auth system)
	 */
	private async getAuthToken(): Promise<string> {
		// This should integrate with the existing Firebase Auth system
		// For now, return a placeholder
		if (typeof window !== 'undefined' && (window as any).firebase?.auth?.currentUser) {
			return await (window as any).firebase.auth.currentUser.getIdToken();
		}

		// Fallback for server-side or testing
		return process.env.AIDE_API_TOKEN || 'dev-token';
	}

	/**
	 * Cache management
	 */
	private getFromCache(key: string): any | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() - cached.timestamp > cached.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	private setCache(key: string, data: any, ttl: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});
	}

	/**
	 * Clear all cached data
	 */
	public clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Check if backend is configured and reachable
	 */
	public async isBackendAvailable(): Promise<boolean> {
		return await this.backendConfig.isConfigured();
	}

	/**
	 * Update backend URL (for settings UI or agent commands)
	 */
	public async updateBackendUrl(newUrl: string): Promise<boolean> {
		const success = await this.backendConfig.updateBackendUrl(newUrl);
		if (success) {
			this.clearCache(); // Clear cache when backend changes
		}
		return success;
	}
}
