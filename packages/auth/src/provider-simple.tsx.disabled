/**
 * CODAI Authentication Provider - Simplified Version
 * 
 * React context provider for authentication state management
 * with automatic token refresh and session validation.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './hooks';
import type { AuthContextType } from './types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context hook
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

// Provider props
interface AuthProviderProps {
    children: ReactNode;
    config?: {
        enableDevMode?: boolean;
    };
}

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to the entire application.
 */
export function AuthProvider({
    children,
    config = {}
}: AuthProviderProps) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Higher-order component for authentication
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options: {
        redirectTo?: string;
        showLoading?: boolean;
        fallback?: React.ComponentType;
    } = {}
) {
    const {
        redirectTo = '/auth/login',
        showLoading = true,
        fallback: Fallback,
    } = options;

    return function AuthenticatedComponent(props: P) {
        const auth = useAuthContext();

        // Show loading state
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

        // Redirect if not authenticated
        if (!auth.isAuthenticated) {
            if (typeof window !== 'undefined') {
                window.location.href = redirectTo;
            }
            return null;
        }

        return <Component {...props} />;
    };
}

/**
 * Hook for requiring authentication
 */
export function useRequireAuth(options: {
    redirectTo?: string;
} = {}) {
    const { redirectTo = '/auth/login' } = options;
    const auth = useAuthContext();

    React.useEffect(() => {
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

/**
 * Component for protecting routes
 */
interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
    showLoading?: boolean;
}

export function ProtectedRoute({
    children,
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

    // Redirect if not authenticated
    if (!auth.isAuthenticated) {
        if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
        }
        return null;
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
    React.useEffect(() => {
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
