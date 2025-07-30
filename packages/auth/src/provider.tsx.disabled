/**
 * CODAI Authentication Provider
 * 
 * React context provider for authentication state management.
 * Provides authentication context to the entire application.
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './hooks';
import type { AuthContextType } from './types';

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
    children: ReactNode;
    /**
     * Custom API URL for authentication endpoints
     */
    apiUrl?: string;
    /**
     * App identifier for multi-app authentication
     */
    appId?: string;
    /**
     * Callback when authentication state changes
     */
    onAuthStateChange?: (isAuthenticated: boolean, user: any) => void;
    /**
     * Callback when authentication errors occur
     */
    onAuthError?: (error: any) => void;
    /**
     * Whether to automatically refresh tokens
     */
    autoRefreshTokens?: boolean;
    /**
     * Whether to persist auth state across browser sessions
     */
    persistSession?: boolean;
    /**
     * Configuration options
     */
    config?: {
        enableDevMode?: boolean;
    };
}

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication context.
 * Handles token refresh, session management, and auth state persistence.
 */
export function AuthProvider({
    children,
    apiUrl,
    appId,
    onAuthStateChange,
    onAuthError,
    autoRefreshTokens = true,
    persistSession = true,
    config = {},
}: AuthProviderProps) {
    const auth = useAuth();

    // Handle authentication state changes
    useEffect(() => {
        if (onAuthStateChange) {
            onAuthStateChange(auth.isAuthenticated, auth.user);
        }
    }, [auth.isAuthenticated, auth.user, onAuthStateChange]);

    // Handle authentication errors
    useEffect(() => {
        if (auth.error && onAuthError) {
            onAuthError(auth.error);
        }
    }, [auth.error, onAuthError]);

    // Set up automatic token refresh
    useEffect(() => {
        if (!autoRefreshTokens || !auth.isAuthenticated) return;

        // Check for token expiry every 5 minutes
        const interval = setInterval(() => {
            auth.refreshAccessToken().catch(() => {
                // Token refresh failed, will handle in auth hook
            });
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [auth.isAuthenticated, autoRefreshTokens, auth]);

    // Handle page visibility changes to refresh token when user returns
    useEffect(() => {
        if (!autoRefreshTokens || !auth.isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && auth.isAuthenticated) {
                // User returned to tab, check if token needs refresh
                auth.refreshAccessToken().catch(() => {
                    // Token refresh failed, will handle in auth hook
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [auth.isAuthenticated, autoRefreshTokens, auth]);

    // Handle beforeunload to clean up if needed
    useEffect(() => {
        if (!persistSession) return;

        const handleBeforeUnload = () => {
            // If session shouldn't persist, clear auth on page unload
            if (!persistSession) {
                auth.clearAuth();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [persistSession, auth]);

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access authentication context
 * 
 * Must be used within an AuthProvider component.
 * Provides access to authentication state and methods.
 */
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuthContext must be used within an AuthProvider. ' +
            'Make sure your component is wrapped with <AuthProvider>.'
        );
    }

    return context;
}

/**
 * Higher-order component for authentication protection
 * 
 * Wraps a component to require authentication.
 * Redirects to login if user is not authenticated.
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options?: {
        redirectTo?: string;
        requiredRole?: string;
        requiredPermissions?: string[];
        fallback?: React.ComponentType;
        showLoading?: boolean;
    }
) {
    const AuthenticatedComponent = (props: P) => {
        const auth = useAuthContext();
        const {
            redirectTo = '/auth/login',
            requiredRole,
            requiredPermissions = [],
            fallback: Fallback,
            showLoading = true,
        } = options || {};

        // Show loading state while checking authentication
        if (auth.isLoading && showLoading) {
            if (Fallback) {
                return <Fallback />;
            }
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
                </div>
            );
        }

        // Check authentication
        if (!auth.isAuthenticated) {
            if (typeof window !== 'undefined') {
                window.location.href = redirectTo;
            }
            return Fallback ? <Fallback /> : <div>Redirecting to login...</div>;
        }

        // Check role requirement
        if (requiredRole && !auth.hasRole(requiredRole as any)) {
            return Fallback ? <Fallback /> : <div>Access denied: insufficient role</div>;
        }

        // Check permission requirements
        const hasAllPermissions = requiredPermissions.every(permission =>
            auth.hasPermission(permission)
        );

        if (requiredPermissions.length > 0 && !hasAllPermissions) {
            return Fallback ? <Fallback /> : <div>Access denied: insufficient permissions</div>;
        }

        return <Component {...props} />;
    };

    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

    return AuthenticatedComponent;
}

/**
 * Hook for authentication guards
 * 
 * Provides utilities for checking authentication, roles, and permissions
 * within components.
 */
export function useAuthGuard() {
    const auth = useAuthContext();

    const requireAuth = (redirectTo = '/auth/login') => {
        if (!auth.isAuthenticated) {
            if (typeof window !== 'undefined') {
                window.location.href = redirectTo;
            }
            return false;
        }
        return true;
    };

    const requireRole = (role: string, fallback?: () => void) => {
        if (!auth.hasRole(role as any)) {
            if (fallback) fallback();
            return false;
        }
        return true;
    };

    const requirePermissions = (permissions: string[], fallback?: () => void) => {
        const hasAll = permissions.every(permission => auth.hasPermission(permission));
        if (!hasAll) {
            if (fallback) fallback();
            return false;
        }
        return true;
    };

    const requireAnyPermission = (permissions: string[], fallback?: () => void) => {
        const hasAny = permissions.some(permission => auth.hasPermission(permission));
        if (!hasAny) {
            if (fallback) fallback();
            return false;
        }
        return true;
    };

    return {
        requireAuth,
        requireRole,
        requirePermissions,
        requireAnyPermission,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        user: auth.user,
        hasRole: auth.hasRole,
        hasPermission: auth.hasPermission,
    };
}

/**
 * Route protection component
 * 
 * Protects routes based on authentication, roles, or permissions.
 */
export interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requiredRole?: string;
    requiredPermissions?: string[];
    requireAnyPermission?: boolean; // If true, user needs ANY of the permissions, not all
    fallback?: ReactNode;
    redirectTo?: string;
    showLoading?: boolean;
}

export function ProtectedRoute({
    children,
    requireAuth = true,
    requiredRole,
    requiredPermissions = [],
    requireAnyPermission = false,
    fallback,
    redirectTo = '/auth/login',
    showLoading = true,
}: ProtectedRouteProps) {
    const auth = useAuthContext();

    // Show loading state
    if (auth.isLoading && showLoading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Check authentication
    if (requireAuth && !auth.isAuthenticated) {
        if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
        }
        return fallback || <div>Redirecting to login...</div>;
    }

    // Check role requirement
    if (requiredRole && !auth.hasRole(requiredRole as any)) {
        return fallback || <div>Access denied: insufficient role</div>;
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
        const hasPermissions = requireAnyPermission
            ? requiredPermissions.some(permission => auth.hasPermission(permission))
            : requiredPermissions.every(permission => auth.hasPermission(permission));

        if (!hasPermissions) {
            return fallback || <div>Access denied: insufficient permissions</div>;
        }
    }

    return <>{children}</>;
}

/**
 * Component for guest-only routes (login, register, etc.)
 */
interface GuestOnlyRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

export function GuestOnlyRoute({
    children,
    redirectTo = '/dashboard',
}: GuestOnlyRouteProps) {
    const auth = useAuthContext();

    // Redirect if authenticated
    useEffect(() => {
        if (!auth.isLoading && auth.isAuthenticated) {
            window.location.href = redirectTo;
        }
    }, [auth.isAuthenticated, auth.isLoading, redirectTo]);

    // Show loading or children
    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Don't render if authenticated (will redirect)
    if (auth.isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Hook for requiring authentication
 */
export function useRequireAuth(options: {
    redirectTo?: string;
} = {}) {
    const { redirectTo = '/auth/login' } = options;
    const auth = useAuthContext();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            window.location.href = redirectTo;
        }
    }, [auth.isAuthenticated, auth.isLoading, redirectTo]);

    return {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        hasAccess: auth.isAuthenticated,
    };
}

// Export auth context for advanced usage
export { AuthContext };

// Default export
export default AuthProvider;
