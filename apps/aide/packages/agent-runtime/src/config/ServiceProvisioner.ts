import { CentralizedAPIClient } from '../config/CentralizedAPIClient.js';
import { DualModeInfrastructure } from '../config/DualModeInfrastructure.js';

/**
 * Service Provisioning System for AIDE
 * Automatically provisions GitHub repos, Firebase projects, and OpenAI proxy
 * Implements automated service setup per milestone1.prompt.md requirements
 */

export interface ServiceConfig {
	type: 'github' | 'firebase' | 'openai' | 'stripe';
	name: string;
	status: 'pending' | 'provisioning' | 'active' | 'failed' | 'suspended';
	config: any;
	createdAt: Date;
	lastUpdated: Date;
	error?: string;
}

export interface GitHubRepoConfig {
	name: string;
	description: string;
	private: boolean;
	template?: string;
	autoInit: boolean;
	gitignoreTemplate?: string;
	licenseTemplate?: string;
}

export interface FirebaseProjectConfig {
	projectId: string;
	displayName: string;
	features: {
		auth: boolean;
		firestore: boolean;
		storage: boolean;
		hosting: boolean;
		functions: boolean;
	};
	billing?: {
		plan: 'spark' | 'blaze';
		budget?: number;
	};
}

export interface OpenAIProxyConfig {
	endpoint: string;
	models: string[];
	rateLimit: {
		requestsPerMinute: number;
		tokensPerMinute: number;
	};
	billing: {
		costMultiplier: number;
		passthrough: boolean;
	};
}

export class ServiceProvisioner {
	private static instance: ServiceProvisioner;
	private apiClient: CentralizedAPIClient;
	private dualMode: DualModeInfrastructure;
	private activeServices: Map<string, ServiceConfig> = new Map();

	private constructor() {
		this.apiClient = CentralizedAPIClient.getInstance();
		this.dualMode = DualModeInfrastructure.getInstance();
	}

	public static getInstance(): ServiceProvisioner {
		if (!ServiceProvisioner.instance) {
			ServiceProvisioner.instance = new ServiceProvisioner();
		}
		return ServiceProvisioner.instance;
	}

	/**
	 * Provision a GitHub repository for a user
	 */
	public async provisionGitHubRepo(
		userId: string,
		repoConfig: GitHubRepoConfig
	): Promise<ServiceConfig> {
		try {
			const serviceConfig: ServiceConfig = {
				type: 'github',
				name: repoConfig.name,
				status: 'provisioning',
				config: repoConfig,
				createdAt: new Date(),
				lastUpdated: new Date()
			};

			// Check if user can provision GitHub repos based on plan
			const canProvision = await this.dualMode.canProvisionService(userId, 'github');
			if (!canProvision.allowed) {
				throw new Error(`GitHub repo provisioning not allowed: ${canProvision.reason}`);
			}

			// Use managed or self-managed based on plan
			if (canProvision.mode === 'managed') {
				// Use AIDE's managed GitHub integration
				const response = await this.apiClient.post('/api/services/github/repos', {
					userId,
					...repoConfig
				});

				serviceConfig.config = {
					...repoConfig,
					repoUrl: response.html_url,
					cloneUrl: response.clone_url,
					sshUrl: response.ssh_url,
					githubId: response.id
				};
			} else {
				// Guide user through self-managed setup
				await this.createSelfManagedGitHubGuide(userId, repoConfig);
				serviceConfig.config = {
					...repoConfig,
					selfManaged: true,
					setupGuide: `/setup/github/${userId}`
				};
			}

			serviceConfig.status = 'active';
			serviceConfig.lastUpdated = new Date();

			this.activeServices.set(`${userId}-github-${repoConfig.name}`, serviceConfig);

			// Store in backend
			await this.apiClient.post('/api/services/configs', {
				userId,
				serviceConfig
			});

			return serviceConfig;
		} catch (error) {
			console.error('Failed to provision GitHub repo:', error);
			const failedConfig: ServiceConfig = {
				type: 'github',
				name: repoConfig.name,
				status: 'failed',
				config: repoConfig,
				createdAt: new Date(),
				lastUpdated: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error'
			};

			this.activeServices.set(`${userId}-github-${repoConfig.name}`, failedConfig);
			return failedConfig;
		}
	}

	/**
	 * Provision a Firebase project for a user
	 */
	public async provisionFirebaseProject(
		userId: string,
		projectConfig: FirebaseProjectConfig
	): Promise<ServiceConfig> {
		try {
			const serviceConfig: ServiceConfig = {
				type: 'firebase',
				name: projectConfig.projectId,
				status: 'provisioning',
				config: projectConfig,
				createdAt: new Date(),
				lastUpdated: new Date()
			};

			// Check if user can provision Firebase projects
			const canProvision = await this.dualMode.canProvisionService(userId, 'firebase');
			if (!canProvision.allowed) {
				throw new Error(`Firebase project provisioning not allowed: ${canProvision.reason}`);
			}

			if (canProvision.mode === 'managed') {
				// Use AIDE's managed Firebase integration
				const response = await this.apiClient.post('/api/services/firebase/projects', {
					userId,
					...projectConfig
				});

				serviceConfig.config = {
					...projectConfig,
					firebaseConfig: response.firebaseConfig,
					serviceAccount: response.serviceAccountKey,
					apiKeys: response.apiKeys
				};
			} else {
				// Guide user through self-managed setup
				await this.createSelfManagedFirebaseGuide(userId, projectConfig);
				serviceConfig.config = {
					...projectConfig,
					selfManaged: true,
					setupGuide: `/setup/firebase/${userId}`
				};
			}

			serviceConfig.status = 'active';
			serviceConfig.lastUpdated = new Date();

			this.activeServices.set(`${userId}-firebase-${projectConfig.projectId}`, serviceConfig);

			// Store in backend
			await this.apiClient.post('/api/services/configs', {
				userId,
				serviceConfig
			});

			return serviceConfig;
		} catch (error) {
			console.error('Failed to provision Firebase project:', error);
			const failedConfig: ServiceConfig = {
				type: 'firebase',
				name: projectConfig.projectId,
				status: 'failed',
				config: projectConfig,
				createdAt: new Date(),
				lastUpdated: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error'
			};

			this.activeServices.set(`${userId}-firebase-${projectConfig.projectId}`, failedConfig);
			return failedConfig;
		}
	}

	/**
	 * Provision an OpenAI proxy for a user
	 */
	public async provisionOpenAIProxy(
		userId: string,
		proxyConfig: OpenAIProxyConfig
	): Promise<ServiceConfig> {
		try {
			const serviceConfig: ServiceConfig = {
				type: 'openai',
				name: `openai-proxy-${userId}`,
				status: 'provisioning',
				config: proxyConfig,
				createdAt: new Date(),
				lastUpdated: new Date()
			};

			// Check if user can provision OpenAI proxy
			const canProvision = await this.dualMode.canProvisionService(userId, 'openai');
			if (!canProvision.allowed) {
				throw new Error(`OpenAI proxy provisioning not allowed: ${canProvision.reason}`);
			}

			if (canProvision.mode === 'managed') {
				// Use AIDE's managed OpenAI proxy
				const response = await this.apiClient.post('/api/services/openai/proxy', {
					userId,
					...proxyConfig
				});

				serviceConfig.config = {
					...proxyConfig,
					proxyUrl: response.proxyUrl,
					apiKey: response.apiKey,
					usage: response.usageStats
				};
			} else {
				// Guide user through self-managed setup
				await this.createSelfManagedOpenAIGuide(userId, proxyConfig);
				serviceConfig.config = {
					...proxyConfig,
					selfManaged: true,
					setupGuide: `/setup/openai/${userId}`
				};
			}

			serviceConfig.status = 'active';
			serviceConfig.lastUpdated = new Date();

			this.activeServices.set(`${userId}-openai-proxy`, serviceConfig);

			// Store in backend
			await this.apiClient.post('/api/services/configs', {
				userId,
				serviceConfig
			});

			return serviceConfig;
		} catch (error) {
			console.error('Failed to provision OpenAI proxy:', error);
			const failedConfig: ServiceConfig = {
				type: 'openai',
				name: `openai-proxy-${userId}`,
				status: 'failed',
				config: proxyConfig,
				createdAt: new Date(),
				lastUpdated: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error'
			};

			this.activeServices.set(`${userId}-openai-proxy`, failedConfig);
			return failedConfig;
		}
	}

	/**
	 * Get all services for a user
	 */
	public async getUserServices(userId: string): Promise<ServiceConfig[]> {
		try {
			const response = await this.apiClient.get(`/api/services/configs/${userId}`);
			return response.services || [];
		} catch (error) {
			console.error('Failed to get user services:', error);
			// Return cached services if backend fails
			const userServices: ServiceConfig[] = [];
			for (const [key, service] of this.activeServices) {
				if (key.startsWith(`${userId}-`)) {
					userServices.push(service);
				}
			}
			return userServices;
		}
	}

	/**
	 * Update service configuration
	 */
	public async updateServiceConfig(
		userId: string,
		serviceName: string,
		updates: Partial<ServiceConfig>
	): Promise<ServiceConfig> {
		const serviceKey = `${userId}-${updates.type}-${serviceName}`;
		const existingService = this.activeServices.get(serviceKey);

		if (!existingService) {
			throw new Error(`Service not found: ${serviceName}`);
		}

		const updatedService: ServiceConfig = {
			...existingService,
			...updates,
			lastUpdated: new Date()
		};

		this.activeServices.set(serviceKey, updatedService);

		// Update in backend
		try {
			await this.apiClient.put('/api/services/configs', {
				userId,
				serviceName,
				serviceConfig: updatedService
			});
		} catch (error) {
			console.error('Failed to update service config in backend:', error);
		}

		return updatedService;
	}

	/**
	 * Delete/deprovision a service
	 */
	public async deprovisionService(
		userId: string,
		serviceType: string,
		serviceName: string
	): Promise<boolean> {
		try {
			const serviceKey = `${userId}-${serviceType}-${serviceName}`;

			// Remove from backend
			await this.apiClient.delete(`/api/services/configs/${userId}/${serviceType}/${serviceName}`);

			// Remove from cache
			this.activeServices.delete(serviceKey);

			return true;
		} catch (error) {
			console.error('Failed to deprovision service:', error);
			return false;
		}
	}

	/**
	 * Create self-managed setup guide for GitHub
	 */
	private async createSelfManagedGitHubGuide(
		userId: string,
		repoConfig: GitHubRepoConfig
	): Promise<void> {
		const guide = {
			title: 'Set Up Your GitHub Repository',
			steps: [
				{
					title: 'Create Repository',
					description: `Create a new repository named "${repoConfig.name}" on GitHub`,
					action: 'manual',
					url: 'https://github.com/new'
				},
				{
					title: 'Configure Repository',
					description: 'Set up repository settings and permissions',
					details: [
						`Description: ${repoConfig.description}`,
						`Private: ${repoConfig.private ? 'Yes' : 'No'}`,
						`Initialize with README: ${repoConfig.autoInit ? 'Yes' : 'No'}`
					]
				},
				{
					title: 'Generate Personal Access Token',
					description: 'Create a GitHub PAT for AIDE integration',
					action: 'manual',
					url: 'https://github.com/settings/tokens'
				},
				{
					title: 'Configure AIDE',
					description: 'Add your GitHub credentials to AIDE',
					action: 'form',
					fields: ['githubToken', 'repositoryUrl']
				}
			]
		};

		await this.apiClient.post('/api/services/guides', {
			userId,
			serviceType: 'github',
			guide
		});
	}

	/**
	 * Create self-managed setup guide for Firebase
	 */
	private async createSelfManagedFirebaseGuide(
		userId: string,
		projectConfig: FirebaseProjectConfig
	): Promise<void> {
		const guide = {
			title: 'Set Up Your Firebase Project',
			steps: [
				{
					title: 'Create Firebase Project',
					description: `Create a new Firebase project with ID "${projectConfig.projectId}"`,
					action: 'manual',
					url: 'https://console.firebase.google.com'
				},
				{
					title: 'Enable Services',
					description: 'Enable required Firebase services',
					details: Object.entries(projectConfig.features)
						.filter(([_, enabled]) => enabled)
						.map(([service, _]) => `Enable ${service}`)
				},
				{
					title: 'Generate Service Account',
					description: 'Create a service account for AIDE integration',
					action: 'manual',
					url: `https://console.firebase.google.com/project/${projectConfig.projectId}/settings/serviceaccounts`
				},
				{
					title: 'Configure AIDE',
					description: 'Upload your Firebase service account key',
					action: 'form',
					fields: ['serviceAccountKey', 'firebaseConfig']
				}
			]
		};

		await this.apiClient.post('/api/services/guides', {
			userId,
			serviceType: 'firebase',
			guide
		});
	}

	/**
	 * Create self-managed setup guide for OpenAI
	 */
	private async createSelfManagedOpenAIGuide(
		userId: string,
		proxyConfig: OpenAIProxyConfig
	): Promise<void> {
		const guide = {
			title: 'Set Up Your OpenAI Integration',
			steps: [
				{
					title: 'Get OpenAI API Key',
					description: 'Create an OpenAI API key for your account',
					action: 'manual',
					url: 'https://platform.openai.com/api-keys'
				},
				{
					title: 'Set Up Billing',
					description: 'Configure OpenAI billing and usage limits',
					action: 'manual',
					url: 'https://platform.openai.com/account/billing'
				},
				{
					title: 'Configure AIDE',
					description: 'Add your OpenAI API key to AIDE',
					action: 'form',
					fields: ['openaiApiKey', 'organizationId']
				}
			]
		};

		await this.apiClient.post('/api/services/guides', {
			userId,
			serviceType: 'openai',
			guide
		});
	}
}
