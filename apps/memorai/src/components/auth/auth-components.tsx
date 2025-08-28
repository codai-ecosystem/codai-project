'use client'

import React from 'react';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

/**
 * Authentication Button Component
 * Handles sign in/out and displays user info
 */
export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <Button variant="ghost" disabled>
                Loading...
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                    {session.user?.image && (
                        <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {session.user?.email}
                        </p>
                    </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                    <Link href="/profile">
                        <Button variant="ghost" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                    </Link>

                    <Link href="/settings">
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                onClick={() => signIn('codai', { callbackUrl: '/dashboard' })}
            >
                Sign In with CODAI
            </Button>
        </div>
    );
}

/**
 * Protected Route Component
 * Wraps content that requires authentication
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireRoles?: string[];
    requirePermissions?: string[];
}

export function ProtectedRoute({
    children,
    fallback,
    requireRoles = [],
    requirePermissions = []
}: ProtectedRouteProps) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return (
            fallback || (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Authentication Required
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        You need to sign in to access this page. Please sign in with your CODAI account.
                    </p>
                    <Button
                        onClick={() => signIn('codai', { callbackUrl: window.location.pathname })}
                        className="mt-4"
                    >
                        Sign In with CODAI
                    </Button>
                </div>
            )
        );
    }

    // Check role requirements
    if (requireRoles.length > 0) {
        const userRoles = session.user?.role ? [session.user.role] : [];
        const hasRequiredRole = requireRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                    <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        You don't have the required permissions to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Required roles: {requireRoles.join(', ')}
                    </p>
                    <Link href="/dashboard">
                        <Button variant="outline">Go to Dashboard</Button>
                    </Link>
                </div>
            );
        }
    }

    // Check permission requirements  
    if (requirePermissions.length > 0) {
        const userPermissions: string[] = []; // TODO: implement permissions system
        const hasRequiredPermission = requirePermissions.some(permission =>
            userPermissions.includes(permission)
        );

        if (!hasRequiredPermission) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                    <h1 className="text-2xl font-bold text-red-600">Insufficient Permissions</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        You don't have the required permissions to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Required permissions: {requirePermissions.join(', ')}
                    </p>
                    <Link href="/dashboard">
                        <Button variant="outline">Go to Dashboard</Button>
                    </Link>
                </div>
            );
        }
    }

    return <>{children}</>;
}

/**
 * Role Badge Component
 * Displays user roles as badges
 */
interface RoleBadgeProps {
    roles: string[];
    className?: string;
}

export function RoleBadge({ roles, className = '' }: RoleBadgeProps) {
    if (!roles || roles.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {roles.map((role) => (
                <span
                    key={role}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                    {role}
                </span>
            ))}
        </div>
    );
}

