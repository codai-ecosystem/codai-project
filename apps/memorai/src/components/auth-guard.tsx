'use client'

import React from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CodaiSession, hasRole, hasPermission, isMemorAIUser } from '@/lib/auth';

/**
 * Authentication Guard Component
 * Provides role-based route protection and conditional rendering
 */

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredRole?: string;
    requiredPermission?: string;
    requireMemorAIAccess?: boolean;
    fallback?: React.ReactNode;
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
}

/**
 * Main AuthGuard Component
 */
export function AuthGuard({
    children,
    requireAuth = true,
    requiredRole,
    requiredPermission,
    requireMemorAIAccess = false,
    fallback = <UnauthorizedFallback />,
    redirectTo = '/auth/signin',
    loadingComponent = <LoadingSpinner />
}: AuthGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        setIsChecking(false);

        // If authentication is not required, allow access
        if (!requireAuth) return;

        // Check if user is authenticated
        if (status === 'unauthenticated' || !session) {
            router.push(redirectTo);
            return;
        }

        // Check role requirement
        if (requiredRole && !hasRole(session as CodaiSession, requiredRole)) {
            console.warn(`Access denied: User lacks required role "${requiredRole}"`);
            return;
        }

        // Check permission requirement
        if (requiredPermission && !hasPermission(session as CodaiSession, requiredPermission)) {
            console.warn(`Access denied: User lacks required permission "${requiredPermission}"`);
            return;
        }

        // Check MemorAI access requirement
        if (requireMemorAIAccess && !isMemorAIUser(session as CodaiSession)) {
            console.warn('Access denied: User lacks MemorAI access permissions');
            return;
        }

    }, [session, status, router, requireAuth, requiredRole, requiredPermission, requireMemorAIAccess, redirectTo]);

    // Show loading while checking authentication
    if (isChecking || status === 'loading') {
        return <>{loadingComponent}</>;
    }

    // If authentication is not required, show children
    if (!requireAuth) {
        return <>{children}</>;
    }

    // Check if user is authenticated
    if (status === 'unauthenticated' || !session) {
        return <>{fallback}</>;
    }

    // Check authorization requirements
    const isAuthorized = checkAuthorization(session as CodaiSession, {
        requiredRole,
        requiredPermission,
        requireMemorAIAccess
    });

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Role-based Guard Hook
 */
export function useAuthGuard() {
    const { data: session, status } = useSession();

    return {
        session: session as CodaiSession,
        isAuthenticated: status === 'authenticated' && !!session,
        isLoading: status === 'loading',
        hasRole: (role: string) => hasRole(session as CodaiSession, role),
        hasPermission: (permission: string) => hasPermission(session as CodaiSession, permission),
        isMemorAIUser: () => isMemorAIUser(session as CodaiSession),
        canAccess: (requirements: AuthRequirements) =>
            checkAuthorization(session as CodaiSession, requirements)
    };
}

/**
 * Conditional Rendering Component
 */
interface ConditionalRenderProps {
    children: React.ReactNode;
    condition: 'authenticated' | 'unauthenticated' | 'role' | 'permission' | 'memorai-access';
    value?: string;
    fallback?: React.ReactNode;
}

export function ConditionalRender({
    children,
    condition,
    value,
    fallback = null
}: ConditionalRenderProps) {
    const { session, isAuthenticated, isLoading } = useAuthGuard();

    if (isLoading) return <LoadingSpinner />;

    let shouldRender = false;

    switch (condition) {
        case 'authenticated':
            shouldRender = isAuthenticated;
            break;
        case 'unauthenticated':
            shouldRender = !isAuthenticated;
            break;
        case 'role':
            shouldRender = value ? hasRole(session, value) : false;
            break;
        case 'permission':
            shouldRender = value ? hasPermission(session, value) : false;
            break;
        case 'memorai-access':
            shouldRender = isMemorAIUser(session);
            break;
        default:
            shouldRender = false;
    }

    return shouldRender ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-Order Component for Page Protection
 */
export function withAuthGuard<P extends object>(
    Component: React.ComponentType<P>,
    guardProps: Omit<AuthGuardProps, 'children'>
) {
    return function AuthGuardedComponent(props: P) {
        return (
            <AuthGuard {...guardProps}>
                <Component {...props} />
            </AuthGuard>
        );
    };
}

/**
 * Helper Types and Functions
 */
interface AuthRequirements {
    requiredRole?: string;
    requiredPermission?: string;
    requireMemorAIAccess?: boolean;
}

function checkAuthorization(session: CodaiSession | null, requirements: AuthRequirements): boolean {
    if (!session) return false;

    const { requiredRole, requiredPermission, requireMemorAIAccess } = requirements;

    // Check role requirement
    if (requiredRole && !hasRole(session, requiredRole)) {
        return false;
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(session, requiredPermission)) {
        return false;
    }

    // Check MemorAI access requirement
    if (requireMemorAIAccess && !isMemorAIUser(session)) {
        return false;
    }

    return true;
}

/**
 * UI Components
 */
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Checking authentication...</span>
        </div>
    );
}

function UnauthorizedFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">You don't have permission to access this resource.</p>
                <button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Sign In
                </button>
            </div>
        </div>
    );
}

/**
 * Specific Guard Components for Common Use Cases
 */

// Admin-only access
export function AdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="admin" fallback={fallback}>
            {children}
        </AuthGuard>
    );
}

// MemorAI access required
export function MemorAIGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <AuthGuard requireMemorAIAccess={true} fallback={fallback}>
            {children}
        </AuthGuard>
    );
}

// Authenticated users only
export function AuthenticatedGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <AuthGuard requireAuth={true} fallback={fallback}>
            {children}
        </AuthGuard>
    );
}

// User with write permissions
export function WriterGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <AuthGuard requiredPermission="memorai:write" fallback={fallback}>
            {children}
        </AuthGuard>
    );
}

export default AuthGuard;
