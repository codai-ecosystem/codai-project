import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { forgotPasswordSchema } from '@/lib/validations/forms';

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function ForgotPasswordForm({
  onSuccess,
  onBack,
}: ForgotPasswordFormProps): JSX.Element {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { sendPasswordReset } = useAuthContext();
  const { toast } = useNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendPasswordReset(data.email);

      setSentEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Password reset error:', error);

      // Handle Firebase Auth errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('user-not-found')) {
        setError('email', {
          message: 'No account found with this email address',
        });
      } else if (errorMessage.includes('too-many-requests')) {
        setError('email', {
          message: 'Too many requests. Please try again later.',
        });
      } else {
        toast.error('Failed to send password reset email');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!sentEmail) return;

    try {
      await sendPasswordReset(sentEmail);
      toast.success('Password reset email sent again!');
    } catch (error: unknown) {
      console.error('Resend email error:', error);
      toast.error('Failed to resend email');
    }
  };

  if (emailSent === true) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>{' '}
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-foreground">{sentEmail}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            {' '}
            <p>
              Click the link in the email to reset your password. If you
              don&apos;t see it, check your spam folder.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void handleResendEmail();
            }}
          >
            Resend Email
          </Button>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" onClick={onBack} asChild>
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset Password</CardTitle>{' '}
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            {...(errors.email?.message != null && {
              error: errors.email.message,
            })}
            disabled={isSubmitting}
            // Removed autoFocus for better accessibility
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Send Reset Link
          </Button>
        </form>

        <div className="flex items-center justify-center">
          <Button variant="ghost" onClick={onBack} asChild>
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

