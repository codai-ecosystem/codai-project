'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { LoginForm } from '@/components/forms/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { isFirebaseEnabled } from '@/lib/env';

type AuthMode = 'login' | 'forgot-password';

export default function LoginPage(): JSX.Element | null {
  const [mode, setMode] = useState<AuthMode>('login');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useNotifications();
  const firebaseEnabled = isFirebaseEnabled();

  const handleSuccessfulPasswordReset = useCallback(() => {
    toast.success('Password reset email sent! Check your inbox.');
    setMode('login');
  }, [toast]);

  const handleToggleToRegister = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  const handleForgotPassword = useCallback(() => {
    setMode('forgot-password');
  }, []);

  const handleBackToLogin = useCallback(() => {
    setMode('login');
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  // If Firebase is disabled, show a message and redirect to home
  if (!firebaseEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">M</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Authentication Disabled
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Firebase authentication is disabled in this deployment. You can
            continue to explore the site without authentication.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">M</span>
            </div>
          </div>{' '}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            {mode === 'login' ? 'Sign In' : 'Forgot Password'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Reset your password to regain access'}
          </p>
        </div>

        {/* Form */}
        <div className="mt-8">
          {mode === 'login' ? (
            <LoginForm
              onToggleMode={handleToggleToRegister}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <ForgotPasswordForm
              onSuccess={handleSuccessfulPasswordReset}
              onBack={handleBackToLogin}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <a
              href="/terms"
              className="underline hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="underline hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
