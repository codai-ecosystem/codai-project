/**
 * Advanced Role-Based Access Control (RBAC) System
 * Fine-grained permissions with policy-based access control
 */

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[] // Permission IDs
  inheritsFrom?: string[] // Parent role IDs
  isSystemRole: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  roles: string[] // Role IDs
  groups: string[] // Group IDs
  directPermissions: string[] // Direct permission assignments
  metadata: Record<string, any>
}

export interface Group {
  id: string
  name: string
  description: string
  roles: string[] // Role IDs
  members: string[] // User IDs
  parentGroup?: string
}

export interface Policy {
  id: string
  name: string
  description: string
  effect: 'allow' | 'deny'
  resources: string[]
  actions: string[]
  conditions: PolicyCondition[]
  priority: number
}

export interface PolicyCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with' | 'regex'
  value: any
}

export interface AccessContext {
  userId: string
  resource: string
  action: string
  environment: Record<string, any>
  timestamp: Date
}

export interface AccessDecision {
  allowed: boolean
  reason: string
  appliedPolicies: string[]
  appliedRoles: string[]
  appliedPermissions: string[]
}

export class AdvancedRBAC {
  private permissions: Map<string, Permission> = new Map()
  private roles: Map<string, Role> = new Map()
  private users: Map<string, User> = new Map()
  private groups: Map<string, Group> = new Map()
  private policies: Map<string, Policy> = new Map()

  constructor() {
    this.initializeSystemRoles()
    this.initializeSystemPermissions()
  }

  /**
   * Initialize system roles and permissions
   */
  private initializeSystemRoles(): void {
    // System Administrator
    this.roles.set('system-admin', {
      id: 'system-admin',
      name: 'System Administrator',
      description: 'Full system access',
      permissions: ['*'],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Organization Admin
    this.roles.set('org-admin', {
      id: 'org-admin',
      name: 'Organization Administrator',
      description: 'Organization-level administration',
      permissions: [
        'org:*',
        'user:create', 'user:read', 'user:update', 'user:delete',
        'role:create', 'role:read', 'role:update', 'role:delete',
        'project:create', 'project:read', 'project:update', 'project:delete'
      ],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Project Manager
    this.roles.set('project-manager', {
      id: 'project-manager',
      name: 'Project Manager',
      description: 'Project management and team coordination',
      permissions: [
        'project:read', 'project:update',
        'team:create', 'team:read', 'team:update',
        'deployment:read', 'deployment:execute',
        'workflow:create', 'workflow:read', 'workflow:update',
        'analytics:read'
      ],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Senior Developer
    this.roles.set('senior-developer', {
      id: 'senior-developer',
      name: 'Senior Developer',
      description: 'Senior development privileges',
      permissions: [
        'code:read', 'code:write', 'code:review',
        'deployment:read', 'deployment:execute',
        'workflow:read', 'workflow:execute',
        'team:read',
        'ai:code-assistant', 'ai:testing'
      ],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Developer
    this.roles.set('developer', {
      id: 'developer',
      name: 'Developer',
      description: 'Standard developer access',
      permissions: [
        'code:read', 'code:write',
        'deployment:read',
        'workflow:read', 'workflow:execute',
        'ai:code-assistant'
      ],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Viewer
    this.roles.set('viewer', {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: [
        'project:read',
        'code:read',
        'deployment:read',
        'workflow:read',
        'analytics:read'
      ],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  private initializeSystemPermissions(): void {
    const systemPermissions: Permission[] = [
      // System permissions
      { id: 'system:admin', name: 'System Administration', description: 'Full system access', resource: 'system', action: '*' },
      
      // Organization permissions
      { id: 'org:create', name: 'Create Organization', description: 'Create new organizations', resource: 'organization', action: 'create' },
      { id: 'org:read', name: 'Read Organization', description: 'View organization details', resource: 'organization', action: 'read' },
      { id: 'org:update', name: 'Update Organization', description: 'Modify organization settings', resource: 'organization', action: 'update' },
      { id: 'org:delete', name: 'Delete Organization', description: 'Delete organizations', resource: 'organization', action: 'delete' },
      { id: 'org:*', name: 'All Organization', description: 'All organization operations', resource: 'organization', action: '*' },

      // User permissions
      { id: 'user:create', name: 'Create User', description: 'Create new users', resource: 'user', action: 'create' },
      { id: 'user:read', name: 'Read User', description: 'View user details', resource: 'user', action: 'read' },
      { id: 'user:update', name: 'Update User', description: 'Modify user details', resource: 'user', action: 'update' },
      { id: 'user:delete', name: 'Delete User', description: 'Delete users', resource: 'user', action: 'delete' },

      // Role permissions
      { id: 'role:create', name: 'Create Role', description: 'Create new roles', resource: 'role', action: 'create' },
      { id: 'role:read', name: 'Read Role', description: 'View role details', resource: 'role', action: 'read' },
      { id: 'role:update', name: 'Update Role', description: 'Modify role permissions', resource: 'role', action: 'update' },
      { id: 'role:delete', name: 'Delete Role', description: 'Delete roles', resource: 'role', action: 'delete' },

      // Project permissions
      { id: 'project:create', name: 'Create Project', description: 'Create new projects', resource: 'project', action: 'create' },
      { id: 'project:read', name: 'Read Project', description: 'View project details', resource: 'project', action: 'read' },
      { id: 'project:update', name: 'Update Project', description: 'Modify project settings', resource: 'project', action: 'update' },
      { id: 'project:delete', name: 'Delete Project', description: 'Delete projects', resource: 'project', action: 'delete' },

      // Code permissions
      { id: 'code:read', name: 'Read Code', description: 'View source code', resource: 'code', action: 'read' },
      { id: 'code:write', name: 'Write Code', description: 'Modify source code', resource: 'code', action: 'write' },
      { id: 'code:review', name: 'Review Code', description: 'Perform code reviews', resource: 'code', action: 'review' },

      // Deployment permissions
      { id: 'deployment:read', name: 'Read Deployment', description: 'View deployment status', resource: 'deployment', action: 'read' },
      { id: 'deployment:execute', name: 'Execute Deployment', description: 'Trigger deployments', resource: 'deployment', action: 'execute' },

      // Workflow permissions
      { id: 'workflow:create', name: 'Create Workflow', description: 'Create new workflows', resource: 'workflow', action: 'create' },
      { id: 'workflow:read', name: 'Read Workflow', description: 'View workflow details', resource: 'workflow', action: 'read' },
      { id: 'workflow:update', name: 'Update Workflow', description: 'Modify workflows', resource: 'workflow', action: 'update' },
      { id: 'workflow:execute', name: 'Execute Workflow', description: 'Run workflows', resource: 'workflow', action: 'execute' },

      // Team permissions
      { id: 'team:create', name: 'Create Team', description: 'Create new teams', resource: 'team', action: 'create' },
      { id: 'team:read', name: 'Read Team', description: 'View team details', resource: 'team', action: 'read' },
      { id: 'team:update', name: 'Update Team', description: 'Modify team settings', resource: 'team', action: 'update' },

      // Analytics permissions
      { id: 'analytics:read', name: 'Read Analytics', description: 'View analytics and reports', resource: 'analytics', action: 'read' },

      // AI permissions
      { id: 'ai:code-assistant', name: 'AI Code Assistant', description: 'Use AI code assistance', resource: 'ai', action: 'code-assistant' },
      { id: 'ai:testing', name: 'AI Testing', description: 'Use AI testing tools', resource: 'ai', action: 'testing' },
      { id: 'ai:documentation', name: 'AI Documentation', description: 'Use AI documentation generation', resource: 'ai', action: 'documentation' }
    ]

    systemPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission)
    })
  }

  /**
   * Check if user has access to perform action on resource
   */
  async checkAccess(context: AccessContext): Promise<AccessDecision> {
    const user = this.users.get(context.userId)
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
        appliedPolicies: [],
        appliedRoles: [],
        appliedPermissions: []
      }
    }

    // Collect all permissions from roles and direct assignments
    const allPermissions = await this.getUserPermissions(user)
    const appliedRoles: string[] = []
    const appliedPermissions: string[] = []
    const appliedPolicies: string[] = []

    // Check explicit policies first
    const policyDecision = await this.evaluatePolicies(context)
    if (policyDecision.effect === 'deny') {
      return {
        allowed: false,
        reason: 'Denied by policy',
        appliedPolicies: policyDecision.policies,
        appliedRoles,
        appliedPermissions
      }
    }

    // Check permissions
    const hasPermission = await this.hasPermission(allPermissions, context.resource, context.action)
    
    if (hasPermission.allowed) {
      appliedPermissions.push(...hasPermission.permissions)
      appliedRoles.push(...user.roles)
    }

    return {
      allowed: hasPermission.allowed,
      reason: hasPermission.allowed ? 'Permission granted' : 'Permission denied',
      appliedPolicies: policyDecision.policies,
      appliedRoles,
      appliedPermissions
    }
  }

  /**
   * Get all permissions for a user (including inherited from roles and groups)
   */
  async getUserPermissions(user: User): Promise<string[]> {
    const allPermissions = new Set<string>()

    // Add direct permissions
    user.directPermissions.forEach(perm => allPermissions.add(perm))

    // Add permissions from roles
    for (const roleId of user.roles) {
      const rolePermissions = await this.getRolePermissions(roleId)
      rolePermissions.forEach(perm => allPermissions.add(perm))
    }

    // Add permissions from groups
    for (const groupId of user.groups) {
      const group = this.groups.get(groupId)
      if (group) {
        for (const roleId of group.roles) {
          const rolePermissions = await this.getRolePermissions(roleId)
          rolePermissions.forEach(perm => allPermissions.add(perm))
        }
      }
    }

    return Array.from(allPermissions)
  }

  /**
   * Get all permissions for a role (including inherited from parent roles)
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = this.roles.get(roleId)
    if (!role) return []

    const allPermissions = new Set<string>(role.permissions)

    // Add permissions from parent roles
    if (role.inheritsFrom) {
      for (const parentRoleId of role.inheritsFrom) {
        const parentPermissions = await this.getRolePermissions(parentRoleId)
        parentPermissions.forEach(perm => allPermissions.add(perm))
      }
    }

    return Array.from(allPermissions)
  }

  /**
   * Check if user has specific permission
   */
  private async hasPermission(userPermissions: string[], resource: string, action: string): Promise<{allowed: boolean, permissions: string[]}> {
    const matchedPermissions: string[] = []

    for (const permissionId of userPermissions) {
      // Check for wildcard permissions
      if (permissionId === '*') {
        matchedPermissions.push(permissionId)
        return { allowed: true, permissions: matchedPermissions }
      }

      const permission = this.permissions.get(permissionId)
      if (!permission) continue

      // Check exact match
      if (permission.resource === resource && permission.action === action) {
        matchedPermissions.push(permissionId)
        return { allowed: true, permissions: matchedPermissions }
      }

      // Check resource wildcard
      if (permission.resource === resource && permission.action === '*') {
        matchedPermissions.push(permissionId)
        return { allowed: true, permissions: matchedPermissions }
      }

      // Check action wildcard
      if (permission.resource === '*' && permission.action === action) {
        matchedPermissions.push(permissionId)
        return { allowed: true, permissions: matchedPermissions }
      }

      // Check resource pattern matching (e.g., project:123 matches project:*)
      if (this.matchesPattern(resource, permission.resource) && 
          (permission.action === action || permission.action === '*')) {
        matchedPermissions.push(permissionId)
        return { allowed: true, permissions: matchedPermissions }
      }
    }

    return { allowed: false, permissions: [] }
  }

  /**
   * Evaluate policies for access decision
   */
  private async evaluatePolicies(context: AccessContext): Promise<{effect: 'allow' | 'deny' | 'neutral', policies: string[]}> {
    const applicablePolicies: Policy[] = []

    // Find applicable policies
    for (const policy of this.policies.values()) {
      if (this.policyApplies(policy, context)) {
        applicablePolicies.push(policy)
      }
    }

    // Sort by priority (higher priority first)
    applicablePolicies.sort((a, b) => b.priority - a.priority)

    // Apply first matching policy
    for (const policy of applicablePolicies) {
      if (await this.evaluatePolicyConditions(policy, context)) {
        return {
          effect: policy.effect,
          policies: [policy.id]
        }
      }
    }

    return { effect: 'neutral', policies: [] }
  }

  private policyApplies(policy: Policy, context: AccessContext): boolean {
    // Check if resource matches
    const resourceMatch = policy.resources.some(resource => 
      resource === '*' || 
      resource === context.resource ||
      this.matchesPattern(context.resource, resource)
    )

    if (!resourceMatch) return false

    // Check if action matches
    const actionMatch = policy.actions.some(action =>
      action === '*' ||
      action === context.action ||
      this.matchesPattern(context.action, action)
    )

    return actionMatch
  }

  private async evaluatePolicyConditions(policy: Policy, context: AccessContext): Promise<boolean> {
    for (const condition of policy.conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false
      }
    }
    return true
  }

  private evaluateCondition(condition: PolicyCondition, context: AccessContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context)
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value)
      case 'starts_with':
        return typeof fieldValue === 'string' && fieldValue.startsWith(condition.value)
      case 'ends_with':
        return typeof fieldValue === 'string' && fieldValue.endsWith(condition.value)
      case 'regex':
        return typeof fieldValue === 'string' && new RegExp(condition.value).test(fieldValue)
      default:
        return false
    }
  }

  private getFieldValue(field: string, context: AccessContext): any {
    switch (field) {
      case 'userId':
        return context.userId
      case 'resource':
        return context.resource
      case 'action':
        return context.action
      case 'timestamp':
        return context.timestamp
      default:
        return context.environment[field]
    }
  }

  private matchesPattern(value: string, pattern: string): boolean {
    // Simple pattern matching with wildcards
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    
    return new RegExp(`^${regexPattern}$`).test(value)
  }

  /**
   * Management methods
   */
  
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.roles.set(newRole.id, newRole)
    return newRole
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role | null> {
    const role = this.roles.get(roleId)
    if (!role || role.isSystemRole) return null

    const updatedRole = {
      ...role,
      ...updates,
      id: role.id, // Prevent ID changes
      updatedAt: new Date()
    }

    this.roles.set(roleId, updatedRole)
    return updatedRole
  }

  async deleteRole(roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId)
    if (!role || role.isSystemRole) return false

    this.roles.delete(roleId)
    return true
  }

  async createPermission(permission: Omit<Permission, 'id'>): Promise<Permission> {
    const newPermission: Permission = {
      ...permission,
      id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    this.permissions.set(newPermission.id, newPermission)
    return newPermission
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user || !this.roles.has(roleId)) return false

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId)
    }
    return true
  }

  async revokeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) return false

    user.roles = user.roles.filter(r => r !== roleId)
    return true
  }

  // Getters
  getRoles(): Role[] {
    return Array.from(this.roles.values())
  }

  getPermissions(): Permission[] {
    return Array.from(this.permissions.values())
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId)
  }

  getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId)
  }
}

export default AdvancedRBAC
