import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { CodaiUser } from '../auth/types';

/**
 * Extended session data for CODAI applications
 */
export interface CodaiSessionData {
  user: CodaiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  deviceId?: string;
  riskScore?: number;
  isTrusted?: boolean;
}

/**
 * Hook for accessing CODAI authentication and authorization
 */
export function useCodaiAuth(): CodaiSessionData {
  const { data: session, status } = useSession();

  const sessionData = useMemo(() => {
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session?.user;

    // Extract CODAI-specific data from session
    const user = isAuthenticated ? session.user as CodaiUser : null;
    const roles = (session as any)?.user?.roles || [];
    const permissions = (session as any)?.user?.permissions || [];
    const codaiData = (session as any)?.codai || {};

    return {
      user,
      isAuthenticated,
      isLoading,
      roles,
      permissions,
      deviceId: codaiData.deviceId,
      riskScore: codaiData.riskScore,
      isTrusted: codaiData.isTrusted,

      hasRole: (role: string) => roles.includes(role),

      hasPermission: (permission: string) => {
        // Check for wildcard permission
        if (permissions.includes('*')) return true;
        return permissions.includes(permission);
      },

      hasAnyRole: (requiredRoles: string[]) => {
        return requiredRoles.some(role => roles.includes(role));
      },

      hasAnyPermission: (requiredPermissions: string[]) => {
        // Check for wildcard permission
        if (permissions.includes('*')) return true;
        return requiredPermissions.some(permission => permissions.includes(permission));
      }
    };
  }, [session, status]);

  return sessionData;
}

/**
 * Hook for role-based access control
 */
export function useRBAC(requiredRoles?: string[], requiredPermissions?: string[]) {
  const auth = useCodaiAuth();

  const hasRequiredAccess = useMemo(() => {
    if (!auth.isAuthenticated) return false;

    const hasRoles = requiredRoles ? auth.hasAnyRole(requiredRoles) : true;
    const hasPermissions = requiredPermissions ? auth.hasAnyPermission(requiredPermissions) : true;

    return hasRoles && hasPermissions;
  }, [auth, requiredRoles, requiredPermissions]);

  return {
    ...auth,
    hasRequiredAccess,
    isAuthorized: hasRequiredAccess
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermissions(permissions: string[]) {
  const auth = useCodaiAuth();

  const permissionMap = useMemo(() => {
    const map: Record<string, boolean> = {};

    permissions.forEach(permission => {
      map[permission] = auth.hasPermission(permission);
    });

    return map;
  }, [auth, permissions]);

  return {
    ...auth,
    permissions: permissionMap,
    hasAll: permissions.every(permission => auth.hasPermission(permission)),
    hasAny: permissions.some(permission => auth.hasPermission(permission))
  };
}

/**
 * Hook for accessing device and security information
 */
export function useDeviceSecurity() {
  const auth = useCodaiAuth();

  return {
    deviceId: auth.deviceId,
    riskScore: auth.riskScore || 0,
    isTrusted: auth.isTrusted || false,
    riskLevel: useMemo(() => {
      const score = auth.riskScore || 0;
      if (score < 0.3) return 'low';
      if (score < 0.6) return 'medium';
      if (score < 0.8) return 'high';
      return 'critical';
    }, [auth.riskScore]),
    isSecure: (auth.riskScore || 0) < 0.6 && (auth.isTrusted || false)
  };
}
