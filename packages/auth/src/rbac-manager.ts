import { User, UserRole, Permissions, DefaultRoles } from './auth.types';

export class RbacManager {
  private roleHierarchy: Map<string, string[]> = new Map();
  private rolePermissions: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeDefaultRoles();
    this.setupRoleHierarchy();
  }

  /**
   * Initialize default roles with permissions
   */
  private initializeDefaultRoles(): void {
    // Super Admin - All permissions
    this.rolePermissions.set(DefaultRoles.SUPER_ADMIN, new Set(Object.values(Permissions)));

    // Admin - Most permissions except super admin functions
    this.rolePermissions.set(DefaultRoles.ADMIN, new Set([
      Permissions.USER_READ,
      Permissions.USER_CREATE,
      Permissions.USER_UPDATE,
      Permissions.ROLE_READ,
      Permissions.SYSTEM_MONITOR,
      Permissions.SYSTEM_CONFIG,
      Permissions.API_READ,
      Permissions.API_WRITE,
      Permissions.API_ADMIN,
      Permissions.RESOURCE_READ,
      Permissions.RESOURCE_WRITE,
      Permissions.RESOURCE_DELETE,
    ]));

    // User - Basic permissions
    this.rolePermissions.set(DefaultRoles.USER, new Set([
      Permissions.USER_READ,
      Permissions.API_READ,
      Permissions.RESOURCE_READ,
      Permissions.RESOURCE_WRITE,
    ]));

    // Guest - Minimal permissions
    this.rolePermissions.set(DefaultRoles.GUEST, new Set([
      Permissions.API_READ,
      Permissions.RESOURCE_READ,
    ]));
  }

  /**
   * Setup role hierarchy (higher roles inherit permissions from lower roles)
   */
  private setupRoleHierarchy(): void {
    this.roleHierarchy.set(DefaultRoles.SUPER_ADMIN, [DefaultRoles.ADMIN, DefaultRoles.USER, DefaultRoles.GUEST]);
    this.roleHierarchy.set(DefaultRoles.ADMIN, [DefaultRoles.USER, DefaultRoles.GUEST]);
    this.roleHierarchy.set(DefaultRoles.USER, [DefaultRoles.GUEST]);
    this.roleHierarchy.set(DefaultRoles.GUEST, []);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: User, permission: string): boolean {
    // Check direct permissions
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    for (const role of user.roles) {
      if (this.roleHasPermission(role.name, permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has any of the required permissions
   */
  hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all required permissions
   */
  hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User, roleName: string): boolean {
    return user.roles.some(role => role.name === roleName);
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(user: User, roleNames: string[]): boolean {
    return roleNames.some(roleName => this.hasRole(user, roleName));
  }

  /**
   * Check if user has role or inherits from role hierarchy
   */
  hasRoleOrInherited(user: User, roleName: string): boolean {
    for (const userRole of user.roles) {
      if (userRole.name === roleName) {
        return true;
      }

      // Check if user role inherits the required role
      const inheritedRoles = this.roleHierarchy.get(userRole.name) || [];
      if (inheritedRoles.includes(roleName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all permissions for user (direct + role-based + inherited)
   */
  getUserPermissions(user: User): string[] {
    const permissions = new Set<string>();

    // Add direct permissions
    user.permissions.forEach(permission => permissions.add(permission));

    // Add role-based permissions
    for (const role of user.roles) {
      const rolePermissions = this.getRolePermissions(role.name);
      rolePermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  /**
   * Get permissions for a specific role
   */
  getRolePermissions(roleName: string): string[] {
    const permissions = new Set<string>();

    // Add direct role permissions
    const rolePerms = this.rolePermissions.get(roleName);
    if (rolePerms) {
      rolePerms.forEach(permission => permissions.add(permission));
    }

    // Add inherited permissions from role hierarchy
    const inheritedRoles = this.roleHierarchy.get(roleName) || [];
    for (const inheritedRole of inheritedRoles) {
      const inheritedPerms = this.rolePermissions.get(inheritedRole);
      if (inheritedPerms) {
        inheritedPerms.forEach(permission => permissions.add(permission));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if role has specific permission
   */
  roleHasPermission(roleName: string, permission: string): boolean {
    const rolePermissions = this.getRolePermissions(roleName);
    return rolePermissions.includes(permission);
  }

  /**
   * Add permission to role
   */
  addPermissionToRole(roleName: string, permission: string): void {
    if (!this.rolePermissions.has(roleName)) {
      this.rolePermissions.set(roleName, new Set());
    }
    this.rolePermissions.get(roleName)!.add(permission);
  }

  /**
   * Remove permission from role
   */
  removePermissionFromRole(roleName: string, permission: string): void {
    const rolePerms = this.rolePermissions.get(roleName);
    if (rolePerms) {
      rolePerms.delete(permission);
    }
  }

  /**
   * Create new role with permissions
   */
  createRole(roleName: string, permissions: string[]): void {
    this.rolePermissions.set(roleName, new Set(permissions));
  }

  /**
   * Delete role
   */
  deleteRole(roleName: string): void {
    this.rolePermissions.delete(roleName);
    this.roleHierarchy.delete(roleName);

    // Remove from other roles' hierarchy
    for (const [role, inherited] of this.roleHierarchy.entries()) {
      const filteredInherited = inherited.filter(r => r !== roleName);
      this.roleHierarchy.set(role, filteredInherited);
    }
  }

  /**
   * Set role hierarchy (which roles this role inherits from)
   */
  setRoleHierarchy(roleName: string, inheritedRoles: string[]): void {
    this.roleHierarchy.set(roleName, inheritedRoles);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): string[] {
    return Array.from(this.rolePermissions.keys());
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy(roleName: string): string[] {
    return this.roleHierarchy.get(roleName) || [];
  }

  /**
   * Check if user can access resource based on permissions
   */
  canAccessResource(
    user: User,
    resource: string,
    action: 'read' | 'write' | 'delete' | 'admin'
  ): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(user, permission);
  }

  /**
   * Filter resources user can access
   */
  filterAccessibleResources(
    user: User,
    resources: { id: string; requiredPermission: string }[]
  ): string[] {
    return resources
      .filter(resource => this.hasPermission(user, resource.requiredPermission))
      .map(resource => resource.id);
  }
}