import { CentralizedAPIClient } from './CentralizedAPIClient.js';

/**
 * Service operation modes
 */
export enum ServiceMode {
	MANAGED = 'managed',     // Preconfigured services hosted by AIDE
	SELF_MANAGED = 'self-managed'  // User brings their own API keys
}

/**
 * Service types that can be configured
 */
export enum ServiceType {
	OPENAI = 'openai',
	FIREBASE = 'firebase',
	STRIPE = 'stripe',
	GITHUB = 'github',
	AZURE = 'azure',
	VERCEL = 'vercel'
}

/**
 * Service configuration interface
 */
export interface ServiceConfiguration {
	type: ServiceType;
	mode: ServiceMode;
	isActive: boolean;
	config: Record<string, any>;
	lastUpdated: Date;
}

/**
 * User plan interface
 */
export interface UserPlan {
	id: string;
	name: string;
	features: string[];
	quotas: Record<string, number>;
	pricing: {
		monthly?: number;
		usage?: Record<string, number>;
	};
	stripeConnectEnabled: boolean;
	managedServicesIncluded: ServiceType[];
}

/**
 * Dual-Mode Infrastructure System
 * Manages service configurations and mode selection per milestone1.prompt.md
 */
export class DualModeInfrastructure {
	private static instance: DualModeInfrastructure;
	private apiClient: CentralizedAPIClient;
	private userServices: Map<ServiceType, ServiceConfiguration> = new Map();
	private currentPlan: UserPlan | null = null;
	private userId: string | null = null;

	private constructor() {
		this.apiClient = CentralizedAPIClient.getInstance();
	}

	public static getInstance(): DualModeInfrastructure {
		if (!DualModeInfrastructure.instance) {
			DualModeInfrastructure.instance = new DualModeInfrastructure();
		}
		return DualModeInfrastructure.instance;
	}

	/**
	 * Initialize infrastructure for a user
	 */
	public async initialize(userId: string): Promise<void> {
		this.userId = userId;

		// Load user's current plan
		await this.loadUserPlan();

		// Load user's service configurations
		await this.loadServiceConfigurations();
	}

	/**
	 * Get the current mode for a service
	 */
	public getServiceMode(serviceType: ServiceType): ServiceMode {
		const config = this.userServices.get(serviceType);
		return config?.mode || ServiceMode.MANAGED;
	}

	/**
	 * Set the mode for a service
	 */
	public async setServiceMode(serviceType: ServiceType, mode: ServiceMode, userConfig?: Record<string, any>): Promise<boolean> {
		try {
			if (!this.userId) {
				throw new Error('User not initialized');
			}

			// Validate the mode change is allowed by the user's plan
			if (!this.isServiceModeAllowed(serviceType, mode)) {
				throw new Error(`Service mode ${mode} not allowed for ${serviceType} on current plan`);
			}

			const configuration: ServiceConfiguration = {
				type: serviceType,
				mode,
				isActive: true,
				config: userConfig || {},
				lastUpdated: new Date()
			};

			// If switching to managed mode, provision the service
			if (mode === ServiceMode.MANAGED) {
				const provisionedConfig = await this.provisionManagedService(serviceType);
				configuration.config = provisionedConfig;
			}

			// Update local cache
			this.userServices.set(serviceType, configuration);

			// Save to backend
			await this.apiClient.provisionService(serviceType, this.userId, configuration);

			return true;
		} catch (error) {
			console.error('Failed to set service mode:', error);
			return false;
		}
	}

	/**
	 * Get configuration for a specific service
	 */
	public getServiceConfig(serviceType: ServiceType): ServiceConfiguration | null {
		return this.userServices.get(serviceType) || null;
	}

	/**
	 * Check if a feature is available to the current user
	 */
	public isFeatureAvailable(feature: string): boolean {
		if (!this.currentPlan) return false;
		return this.currentPlan.features.includes(feature);
	}

	/**
	 * Check quota usage for a resource
	 */
	public async checkQuota(resource: string, requestedAmount: number = 1): Promise<boolean> {
		if (!this.currentPlan || !this.userId) return false;

		const quota = this.currentPlan.quotas[resource];
		if (!quota) return true; // No quota means unlimited

		// Get current usage from backend
		const usageStats = await this.apiClient.getUsageStats(this.userId, 'current_month');
		const currentUsage = usageStats[resource] || 0;

		return (currentUsage + requestedAmount) <= quota;
	}

	/**
	 * Track usage for billing and quota enforcement
	 */
	public async trackUsage(resource: string, amount: number, metadata?: Record<string, any>): Promise<void> {
		if (!this.userId) return;

		await this.apiClient.trackUsage(this.userId, {
			resource,
			amount,
			metadata: metadata || {}
		});
	}

	/**
	 * Get current user plan
	 */
	public getCurrentPlan(): UserPlan | null {
		return this.currentPlan;
	}

	/**
	 * Switch to a different plan
	 */
	public async changePlan(planId: string): Promise<boolean> {
		try {
			if (!this.userId) {
				throw new Error('User not initialized');
			}

			// Create billing session for plan change
			const session = await this.apiClient.createBillingSession(this.userId, planId);

			if (session.url) {
				// Redirect to Stripe checkout (in browser) or return URL for CLI
				if (typeof window !== 'undefined') {
					window.location.href = session.url;
				} else {
					console.log(`Please visit: ${session.url}`);
				}
			}

			return true;
		} catch (error) {
			console.error('Failed to change plan:', error);
			return false;
		}
	}

	/**
	 * Get all available plans
	 */
	public async getAvailablePlans(): Promise<UserPlan[]> {
		const plans = await this.apiClient.getPlans();
		return plans;
	}

	/**
	 * Check if user can provision a specific service type
	 */
	public async canProvisionService(
		userId: string,
		serviceType: 'github' | 'firebase' | 'openai' | 'stripe'
	): Promise<{ allowed: boolean; mode: 'managed' | 'self-managed'; reason?: string }> {
		try {
			const userPlan = await this.apiClient.getUserPlan(userId);
			// Define service permissions by plan
			const servicePermissions = {
				free: {
					github: { allowed: true, mode: 'self-managed' as const },
					firebase: { allowed: true, mode: 'self-managed' as const },
					openai: { allowed: false, mode: 'self-managed' as const, reason: 'OpenAI integration requires Pro plan or higher' },
					stripe: { allowed: false, mode: 'self-managed' as const, reason: 'Payment processing requires Pro plan or higher' }
				},
				pro: {
					github: { allowed: true, mode: 'managed' as const },
					firebase: { allowed: true, mode: 'managed' as const },
					openai: { allowed: true, mode: 'managed' as const },
					stripe: { allowed: true, mode: 'managed' as const }
				},
				enterprise: {
					github: { allowed: true, mode: 'managed' as const },
					firebase: { allowed: true, mode: 'managed' as const },
					openai: { allowed: true, mode: 'managed' as const },
					stripe: { allowed: true, mode: 'managed' as const }
				}
			};

			const planPermissions = servicePermissions[userPlan.plan as keyof typeof servicePermissions];
			if (!planPermissions) {
				return { allowed: false, mode: 'self-managed', reason: 'Invalid plan' };
			} const servicePermission = planPermissions[serviceType];
			if (!servicePermission.allowed) {
				return {
					allowed: false,
					mode: servicePermission.mode,
					reason: 'reason' in servicePermission ? servicePermission.reason : 'Service not available for your plan'
				};
			}

			return {
				allowed: true,
				mode: servicePermission.mode
			};
		} catch (error) {
			console.error('Failed to check service provisioning permissions:', error);
			// Default to self-managed for free users if backend check fails
			return {
				allowed: true,
				mode: 'self-managed',
				reason: 'Backend unavailable, defaulting to self-managed setup'
			};
		}
	}

	/**
	 * Automatically provision services for users based on their plan
	 */
	public async autoProvisionServices(): Promise<void> {
		if (!this.currentPlan || !this.userId) return;

		for (const serviceType of this.currentPlan.managedServicesIncluded) {
			const existingConfig = this.userServices.get(serviceType);

			// Only provision if not already configured
			if (!existingConfig || existingConfig.mode !== ServiceMode.MANAGED) {
				await this.setServiceMode(serviceType, ServiceMode.MANAGED);
			}
		}
	}

	private async loadUserPlan(): Promise<void> {
		if (!this.userId) return;

		try {
			this.currentPlan = await this.apiClient.getUserPlan(this.userId);
		} catch (error) {
			console.warn('Failed to load user plan:', error);
			// Set a default free plan
			this.currentPlan = this.getDefaultFreePlan();
		}
	}

	private async loadServiceConfigurations(): Promise<void> {
		if (!this.userId) return;

		try {
			const configs = await this.apiClient.getServiceConfig(this.userId);

			for (const config of configs) {
				this.userServices.set(config.type, {
					...config,
					lastUpdated: new Date(config.lastUpdated)
				});
			}
		} catch (error) {
			console.warn('Failed to load service configurations:', error);
		}
	}

	private isServiceModeAllowed(serviceType: ServiceType, mode: ServiceMode): boolean {
		if (!this.currentPlan) return false;

		// Managed mode requires the service to be included in the plan
		if (mode === ServiceMode.MANAGED) {
			return this.currentPlan.managedServicesIncluded.includes(serviceType);
		}

		// Self-managed mode is allowed if the user has the feature
		return this.isFeatureAvailable('self_managed_services');
	}

	private async provisionManagedService(serviceType: ServiceType): Promise<Record<string, any>> {
		// This would contain the actual provisioning logic
		// For now, return a placeholder configuration
		switch (serviceType) {
			case ServiceType.OPENAI:
				return {
					apiKey: 'aide-managed-openai-key',
					organization: 'aide-org',
					model: 'gpt-4'
				};

			case ServiceType.FIREBASE:
				return {
					projectId: `aide-user-${this.userId}`,
					apiKey: 'aide-managed-firebase-key',
					authDomain: `aide-user-${this.userId}.firebaseapp.com`
				};

			case ServiceType.GITHUB:
				return {
					token: 'aide-managed-github-token',
					organization: 'aide-projects'
				};

			default:
				return {};
		}
	}

	private getDefaultFreePlan(): UserPlan {
		return {
			id: 'free',
			name: 'Free Plan',
			features: ['basic_agent', 'limited_usage'],
			quotas: {
				'api_calls': 1000,
				'projects': 3,
				'storage_mb': 100
			},
			pricing: {},
			stripeConnectEnabled: false,
			managedServicesIncluded: []
		};
	}

	/**
	 * Get service status summary
	 */
	public getServicesSummary(): Record<ServiceType, { mode: ServiceMode; status: string }> {
		const summary: Record<ServiceType, { mode: ServiceMode; status: string }> = {} as any;

		for (const serviceType of Object.values(ServiceType)) {
			const config = this.userServices.get(serviceType);
			summary[serviceType] = {
				mode: config?.mode || ServiceMode.MANAGED,
				status: config?.isActive ? 'active' : 'inactive'
			};
		}

		return summary;
	}
}
