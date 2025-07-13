'use client';

import { useRouter } from 'next/navigation';
import { useCallback, type JSX } from 'react';

import { RegisterForm } from '@/components/forms/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { isFirebaseEnabled } from '@/lib/env';

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useNotifications();
  const firebaseEnabled = isFirebaseEnabled();

  const handleSuccessfulRegistration = useCallback(() => {
    toast.success('Account created successfully! Welcome to METU.');
    router.push('/');
  }, [toast, router]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return <div>Redirecting...</div>;
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
            Sign Up
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <div className="mt-8">
          <RegisterForm onSuccess={handleSuccessfulRegistration} />
        </div>
      </div>
    </div>
  );
}
