'use client';

import { useRouter } from 'next/navigation';
import type { JSX } from 'react';
import { useEffect, type ReactNode } from 'react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { isFirebaseEnabled } from '@/lib/env';
import type { User } from '@/types/auth';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallbackPath = '/auth/login',
}: AuthGuardProps): JSX.Element | null {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const firebaseEnabled = isFirebaseEnabled();

  useEffect(() => {
    // If Firebase is disabled and auth is required, don't redirect - just allow access
    if (!firebaseEnabled && requireAuth) {
      return;
    }

    if (!isLoading) {
      if (requireAuth && !user) {
        // User is not authenticated but auth is required
        const currentPath = window.location.pathname;
        const redirectUrl = `${fallbackPath}?from=${encodeURIComponent(currentPath)}`;

        // Use setTimeout to ensure the redirect happens after the current render
        // Add a longer delay in test environments to prevent race conditions
        const isTest =
          process.env['NODE_ENV'] === 'test' || process.env['PLAYWRIGHT_TEST'];
        const delay = isTest ? 200 : 0;
        setTimeout(() => {
          try {
            // Double-check auth state before redirecting in tests
            if (isTest && user) {
              return; // User authenticated, don't redirect
            }
            router.push(redirectUrl);
          } catch (error) {
            console.warn('AuthGuard: Failed to redirect:', error);
          }
        }, delay);
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be (auth pages)
        const redirectUrl =
          new URLSearchParams(window.location.search).get('from') ??
          '/dashboard';

        // Use setTimeout to ensure the redirect happens after the current render
        const isTest =
          process.env['NODE_ENV'] === 'test' || process.env['PLAYWRIGHT_TEST'];
        const delay = isTest ? 200 : 0;
        setTimeout(() => {
          try {
            // Double-check auth state before redirecting in tests
            if (isTest && !user) {
              return; // User not authenticated in test, may be a race condition
            }
            router.push(redirectUrl);
          } catch (error) {
            console.warn('AuthGuard: Failed to redirect:', error);
          }
        }, delay);
      }
    }
  }, [user, isLoading, requireAuth, router, fallbackPath, firebaseEnabled]);

  // Show loading spinner while checking authentication (only if Firebase is enabled)
  if (firebaseEnabled && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  // If Firebase is disabled, always allow access
  if (!firebaseEnabled) {
    return <>{children}</>;
  }

  // Don't render children if auth requirements are not met
  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuthGuard<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: Omit<AuthGuardProps, 'children'> = {}
): React.ComponentType<T> {
  const AuthGuardedComponent = (props: T): JSX.Element => {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  AuthGuardedComponent.displayName = `withAuthGuard(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return AuthGuardedComponent;
}

// Hook for checking authentication status
export function useAuthGuard(requireAuth: boolean = true): {
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
  user: User | null;
} {
  const { user, isLoading } = useAuthContext();
  const firebaseEnabled = isFirebaseEnabled();

  return {
    isAuthenticated: Boolean(user),
    isLoading: firebaseEnabled ? isLoading : false,
    canAccess: firebaseEnabled ? (requireAuth ? Boolean(user) : true) : true,
    user,
  };
}
