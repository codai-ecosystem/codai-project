import { EventEmitter } from 'events';
import {
	AuthorizationConfig,
	SecurityContext,
	Permission,
	Role,
	Resource,
	PolicyResult,
	AccessRequest,
	PermissionMatrix
} from '../types';

/**
 * Advanced Authorization Service with RBAC, ABAC, and Policy-Based Access Control
 *
 * Features:
 * - Role-Based Access Control (RBAC)
 * - Attribute-Based Access Control (ABAC)
 * - Dynamic policy evaluation
 * - Fine-grained permissions
 * - Hierarchical roles and resources
 * - Real-time policy updates
 * - Compliance audit trails
 */
export class AuthorizationService extends EventEmitter {
	private readonly config: AuthorizationConfig;
	private readonly securitySuite: any;
	private roles: Map<string, Role> = new Map();
	private permissions: Map<string, Permission> = new Map();
	private resources: Map<string, Resource> = new Map();
	private permissionMatrix: PermissionMatrix = new Map();
	private policies: Map<string, any> = new Map();
	private isInitialized = false;

	constructor(config: AuthorizationConfig, securitySuite: any) {
		super();
		this.config = config;
		this.securitySuite = securitySuite;
	}

	/**
	 * Initialize the authorization service
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			// Load default roles and permissions
			await this.loadDefaultRoles();
			await this.loadDefaultPermissions();
			await this.loadDefaultResources();
			await this.buildPermissionMatrix();
			await this.loadPolicies();

			this.isInitialized = true;
			this.emit('initialized');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Authorize access to a resource
	 */
	async authorize(
		context: SecurityContext,
		resource: string,
		action: string,
		attributes?: Record<string, any>
	): Promise<boolean> {
		this.ensureInitialized();
		const request: AccessRequest = {
			userId: context.user.id,
			resourceId: resource,
			user: context.user,
			resource,
			action,
			context: context.request || {},
			attributes: attributes || {},
			timestamp: new Date()
		};

		try {
			// 1. RBAC Authorization
			const rbacResult = await this.evaluateRBAC(request);

			// 2. ABAC Authorization (if RBAC passes)
			const abacResult = rbacResult ? await this.evaluateABAC(request) : false;

			// 3. Policy-based authorization
			const policyResult = abacResult ? await this.evaluatePolicies(request) : false;

			// 4. Log authorization attempt
			await this.logAuthorizationAttempt(request, policyResult);

			// 5. Emit authorization event
			this.emit('authorization', {
				user: context.user.id,
				resource,
				action,
				granted: policyResult,
				timestamp: new Date()
			});

			return policyResult;
		} catch (error) {
			this.emit('authorizationError', { request, error });
			return false;
		}
	}

	/**
	 * Check if user has specific permission
	 */
	async hasPermission(userId: string, permission: string): Promise<boolean> {
		this.ensureInitialized();

		const userRoles = await this.getUserRoles(userId);

		for (const roleId of userRoles) {
			const role = this.roles.get(roleId);
			if (role && role.permissions.includes(permission)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get user roles
	 */
	async getUserRoles(userId: string): Promise<string[]> {
		// This would typically query a database
		// For now, return default roles based on user type
		return ['user', 'developer']; // Mock implementation
	}

	/**
	 * Assign role to user
	 */
	async assignRole(userId: string, roleId: string): Promise<void> {
		this.ensureInitialized();

		if (!this.roles.has(roleId)) {
			throw new Error(`Role ${roleId} does not exist`);
		}

		// Log role assignment
		await this.logRoleAssignment(userId, roleId);

		this.emit('roleAssigned', { userId, roleId, timestamp: new Date() });
	}

	/**
	 * Remove role from user
	 */
	async removeRole(userId: string, roleId: string): Promise<void> {
		this.ensureInitialized();

		// Log role removal
		await this.logRoleRemoval(userId, roleId);

		this.emit('roleRemoved', { userId, roleId, timestamp: new Date() });
	}

	/**
	 * Create new role
	 */
	async createRole(role: Role): Promise<void> {
		this.ensureInitialized();

		if (this.roles.has(role.id)) {
			throw new Error(`Role ${role.id} already exists`);
		}

		this.roles.set(role.id, role);
		await this.rebuildPermissionMatrix();

		this.emit('roleCreated', { role, timestamp: new Date() });
	}

	/**
	 * Update existing role
	 */
	async updateRole(roleId: string, updates: Partial<Role>): Promise<void> {
		this.ensureInitialized();

		const role = this.roles.get(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} does not exist`);
		}

		const updatedRole = { ...role, ...updates };
		this.roles.set(roleId, updatedRole);
		await this.rebuildPermissionMatrix();

		this.emit('roleUpdated', { roleId, updates, timestamp: new Date() });
	}

	/**
	 * Delete role
	 */
	async deleteRole(roleId: string): Promise<void> {
		this.ensureInitialized();

		if (!this.roles.has(roleId)) {
			throw new Error(`Role ${roleId} does not exist`);
		}

		this.roles.delete(roleId);
		await this.rebuildPermissionMatrix();

		this.emit('roleDeleted', { roleId, timestamp: new Date() });
	}

	/**
	 * Get all roles
	 */
	getRoles(): Role[] {
		return Array.from(this.roles.values());
	}

	/**
	 * Get all permissions
	 */
	getPermissions(): Permission[] {
		return Array.from(this.permissions.values());
	}

	/**
	 * Get all resources
	 */
	getResources(): Resource[] {
		return Array.from(this.resources.values());
	}

	/**
	 * Update service configuration
	 */
	async updateConfig(updates: Partial<AuthorizationConfig>): Promise<void> {
		this.ensureInitialized();
		Object.assign(this.config, updates);
		// Rebuild permission matrix with new config
		await this.rebuildPermissionMatrix();
	}

	/**
	 * Health check for the authorization service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Check if service is initialized and essential components are working
			return this.isInitialized &&
				this.roles.size > 0 &&
				this.permissions.size > 0 &&
				this.resources.size > 0;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Shutdown the authorization service
	 */
	async shutdown(): Promise<void> {
		this.roles.clear();
		this.permissions.clear();
		this.resources.clear();
		this.permissionMatrix.clear();
		this.policies.clear();
		this.isInitialized = false;
	}

	/**
	 * Evaluate RBAC authorization
	 */
	private async evaluateRBAC(request: AccessRequest): Promise<boolean> {
		const userRoles = await this.getUserRoles(request.user.id);

		for (const roleId of userRoles) {
			const role = this.roles.get(roleId);
			if (!role) continue;

			// Check if role has required permission for this resource/action
			const permissionKey = `${request.resource}:${request.action}`;
			if (role.permissions.includes(permissionKey) || role.permissions.includes('*')) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Evaluate ABAC authorization
	 */
	private async evaluateABAC(request: AccessRequest): Promise<boolean> {
		// Attribute-based access control evaluation
		// This can include time-based access, location-based access, etc.

		const now = new Date();
		const userAttributes = request.user.attributes || {};

		// Example: Check time-based access
		if (userAttributes.workingHours) {
			const currentHour = now.getHours();
			const [startHour, endHour] = userAttributes.workingHours;
			if (currentHour < startHour || currentHour > endHour) {
				return false;
			}
		}
		// Example: Check location-based access
		if (userAttributes.allowedLocations && request.context?.location) {
			if (!userAttributes.allowedLocations.includes(request.context.location)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Evaluate dynamic policies
	 */
	private async evaluatePolicies(request: AccessRequest): Promise<boolean> {
		// Policy-based authorization
		// This allows for complex business rules and dynamic access control

		for (const [policyId, policy] of this.policies) {
			if (policy.resources.includes(request.resource) || policy.resources.includes('*')) {
				const result = await this.evaluatePolicy(policy, request);
				if (!result) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Evaluate a single policy
	 */
	private async evaluatePolicy(policy: any, request: AccessRequest): Promise<boolean> {
		// Mock policy evaluation - in real implementation this would be more sophisticated
		if (policy.condition) {
			return policy.condition(request);
		}
		return true;
	}

	/**
	 * Load default roles
	 */
	private async loadDefaultRoles(): Promise<void> {
		const defaultRoles: Role[] = [
			{
				id: 'admin',
				name: 'Administrator',
				description: 'Full system access',
				permissions: ['*'],
				inherits: [],
				metadata: { level: 100 }
			},
			{
				id: 'developer',
				name: 'Developer',
				description: 'Development environment access',
				permissions: [
					'project:read', 'project:write', 'project:delete',
					'code:read', 'code:write', 'code:execute',
					'debug:read', 'debug:write'
				],
				inherits: ['user'],
				metadata: { level: 50 }
			},
			{
				id: 'user',
				name: 'User',
				description: 'Basic user access',
				permissions: [
					'project:read', 'code:read', 'profile:read', 'profile:write'
				],
				inherits: [],
				metadata: { level: 10 }
			},
			{
				id: 'guest',
				name: 'Guest',
				description: 'Limited read-only access',
				permissions: ['project:read', 'code:read'],
				inherits: [],
				metadata: { level: 1 }
			}
		];

		defaultRoles.forEach(role => {
			this.roles.set(role.id, role);
		});
	}

	/**
	 * Load default permissions
	 */
	private async loadDefaultPermissions(): Promise<void> {
		const defaultPermissions: Permission[] = [
			{ id: 'project:read', name: 'Read Projects', description: 'View project information' },
			{ id: 'project:write', name: 'Write Projects', description: 'Create and modify projects' },
			{ id: 'project:delete', name: 'Delete Projects', description: 'Delete projects' },
			{ id: 'code:read', name: 'Read Code', description: 'View source code' },
			{ id: 'code:write', name: 'Write Code', description: 'Modify source code' },
			{ id: 'code:execute', name: 'Execute Code', description: 'Run and debug code' },
			{ id: 'debug:read', name: 'Read Debug Info', description: 'View debug information' },
			{ id: 'debug:write', name: 'Control Debugging', description: 'Control debug sessions' },
			{ id: 'profile:read', name: 'Read Profile', description: 'View user profile' },
			{ id: 'profile:write', name: 'Write Profile', description: 'Modify user profile' }
		];

		defaultPermissions.forEach(permission => {
			this.permissions.set(permission.id, permission);
		});
	}

	/**
	 * Load default resources
	 */
	private async loadDefaultResources(): Promise<void> {
		const defaultResources: Resource[] = [
			{ id: 'project', name: 'Project', description: 'Development projects' },
			{ id: 'code', name: 'Source Code', description: 'Source code files' },
			{ id: 'debug', name: 'Debug Session', description: 'Debugging sessions' },
			{ id: 'profile', name: 'User Profile', description: 'User profile information' },
			{ id: 'admin', name: 'Administration', description: 'Administrative functions' }
		];

		defaultResources.forEach(resource => {
			this.resources.set(resource.id, resource);
		});
	}

	/**
	 * Build permission matrix
	 */
	private async buildPermissionMatrix(): Promise<void> {
		this.permissionMatrix.clear();

		for (const [roleId, role] of this.roles) {
			for (const permission of role.permissions) {
				if (!this.permissionMatrix.has(roleId)) {
					this.permissionMatrix.set(roleId, new Set());
				}
				this.permissionMatrix.get(roleId)!.add(permission);
			}
		}
	}

	/**
	 * Rebuild permission matrix
	 */
	private async rebuildPermissionMatrix(): Promise<void> {
		await this.buildPermissionMatrix();
	}

	/**
	 * Load security policies
	 */
	private async loadPolicies(): Promise<void> {
		// Example policies
		this.policies.set('workingHours', {
			id: 'workingHours',
			name: 'Working Hours Policy',
			resources: ['*'],
			condition: (request: AccessRequest) => {
				const now = new Date();
				const hour = now.getHours();
				return hour >= 9 && hour <= 17; // 9 AM to 5 PM
			}
		});
		this.policies.set('adminOnly', {
			id: 'adminOnly',
			name: 'Admin Only Policy',
			resources: ['admin'],
			condition: (request: AccessRequest) => {
				return request.user.roles?.includes('admin' as any) || false;
			}
		});
	}

	/**
	 * Log authorization attempt
	 */
	private async logAuthorizationAttempt(request: AccessRequest, granted: boolean): Promise<void> {
		const logEntry = {
			type: 'authorization',
			userId: request.user.id,
			resource: request.resource,
			action: request.action,
			granted,
			timestamp: new Date(),
			context: request.context
		};

		// Log through audit service if available
		if (this.securitySuite?.auditService) {
			await this.securitySuite.auditService.log(logEntry);
		}
	}

	/**
	 * Log role assignment
	 */
	private async logRoleAssignment(userId: string, roleId: string): Promise<void> {
		const logEntry = {
			type: 'roleAssignment',
			userId,
			roleId,
			timestamp: new Date()
		};

		if (this.securitySuite?.auditService) {
			await this.securitySuite.auditService.log(logEntry);
		}
	}

	/**
	 * Log role removal
	 */
	private async logRoleRemoval(userId: string, roleId: string): Promise<void> {
		const logEntry = {
			type: 'roleRemoval',
			userId,
			roleId,
			timestamp: new Date()
		};

		if (this.securitySuite?.auditService) {
			await this.securitySuite.auditService.log(logEntry);
		}
	}

	/**
	 * Ensure service is initialized
	 */
	private ensureInitialized(): void {
		if (!this.isInitialized) {
			throw new Error('AuthorizationService not initialized');
		}
	}
}
