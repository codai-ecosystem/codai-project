'use client';

import { useRouter } from 'next/navigation';
import { useCallback, type JSX } from 'react';

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function ForgotPasswordPage(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useNotifications();

  const handleSuccessfulPasswordReset = useCallback(() => {
    toast.success('Password reset email sent! Check your inbox.');
    // Stay on the page to show the success state
  }, [toast]);

  const handleBackToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return <div>Redirecting...</div>;
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
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reset your password to regain access to your account
          </p>
        </div>

        {/* Form */}
        <div className="mt-8">
          <ForgotPasswordForm
            onSuccess={handleSuccessfulPasswordReset}
            onBack={handleBackToLogin}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Remember your password?{' '}
            <a href="/auth/login" className="underline hover:text-primary">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
