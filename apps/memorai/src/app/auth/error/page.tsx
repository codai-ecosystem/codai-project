'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

/**
 * Authentication Error Page Content
 * Displays authentication errors and recovery options
 */
function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return {
                    title: 'Configuration Error',
                    description: 'There is a problem with the server configuration.',
                    details: 'The authentication system is not properly configured. Please contact support.',
                    severity: 'high'
                };
            case 'AccessDenied':
                return {
                    title: 'Access Denied',
                    description: 'You do not have permission to sign in.',
                    details: 'Your account may not have the required permissions to access MemorAI. Please contact your administrator.',
                    severity: 'medium'
                };
            case 'Verification':
                return {
                    title: 'Verification Error',
                    description: 'The verification token has expired or is invalid.',
                    details: 'Please try signing in again. If the problem persists, request a new verification email.',
                    severity: 'low'
                };
            case 'OAuthSignin':
                return {
                    title: 'OAuth Sign-in Error',
                    description: 'Error occurred during OAuth sign-in process.',
                    details: 'There was an issue connecting to the CODAI authentication service. Please try again.',
                    severity: 'medium'
                };
            case 'OAuthCallback':
                return {
                    title: 'OAuth Callback Error',
                    description: 'Error occurred during OAuth callback.',
                    details: 'The authentication callback failed. This might be a temporary issue.',
                    severity: 'medium'
                };
            case 'OAuthCreateAccount':
                return {
                    title: 'Account Creation Error',
                    description: 'Could not create account.',
                    details: 'There was an issue creating your account. Please try again or contact support.',
                    severity: 'high'
                };
            case 'EmailCreateAccount':
                return {
                    title: 'Email Account Error',
                    description: 'Could not create account with email.',
                    details: 'There was an issue creating your account with the provided email address.',
                    severity: 'medium'
                };
            case 'Callback':
                return {
                    title: 'Callback Error',
                    description: 'Error in callback handler.',
                    details: 'An unexpected error occurred during authentication. Please try again.',
                    severity: 'medium'
                };
            case 'OAuthAccountNotLinked':
                return {
                    title: 'Account Not Linked',
                    description: 'OAuth account is not linked to any user.',
                    details: 'Your OAuth account is not connected to a MemorAI user account. Please contact support to link your accounts.',
                    severity: 'medium'
                };
            case 'EmailSignin':
                return {
                    title: 'Email Sign-in Error',
                    description: 'Error sending email sign-in link.',
                    details: 'We could not send the sign-in email. Please check your email address and try again.',
                    severity: 'low'
                };
            case 'CredentialsSignin':
                return {
                    title: 'Invalid Credentials',
                    description: 'The credentials you provided are incorrect.',
                    details: 'Please check your username and password and try again.',
                    severity: 'low'
                };
            case 'SessionRequired':
                return {
                    title: 'Session Required',
                    description: 'You need to be signed in to access this page.',
                    details: 'Please sign in to continue using MemorAI.',
                    severity: 'low'
                };
            default:
                return {
                    title: 'Authentication Error',
                    description: 'An unexpected authentication error occurred.',
                    details: 'Please try signing in again. If the problem continues, contact support.',
                    severity: 'medium'
                };
        }
    };

    const errorInfo = getErrorMessage(error);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
            case 'low':
                return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
            default:
                return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-800 dark:text-red-200';
            case 'medium':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'low':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Error Card */}
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="w-16 h-16 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                            {errorInfo.title}
                        </CardTitle>
                        <CardDescription>
                            {errorInfo.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Error Details */}
                        <div className={`border rounded-lg p-4 ${getSeverityColor(errorInfo.severity)}`}>
                            <p className={`text-sm ${getSeverityTextColor(errorInfo.severity)}`}>
                                {errorInfo.details}
                            </p>
                            {error && (
                                <p className="text-xs mt-2 font-mono text-gray-600 dark:text-gray-400">
                                    Error Code: {error}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Link href="/auth/signin">
                                <Button className="w-full" size="lg">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Signing In Again
                                </Button>
                            </Link>

                            <Link href="/">
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Return to Home
                                </Button>
                            </Link>
                        </div>

                        {/* Help Section */}
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                                Still having trouble?
                            </p>
                            <div className="flex justify-center space-x-4 text-sm">
                                <Link
                                    href="/support"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Contact Support
                                </Link>
                                <Link
                                    href="/docs/authentication"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Help Docs
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Troubleshooting Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Troubleshooting Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Clear your browser cache and cookies</li>
                            <li>Make sure JavaScript is enabled</li>
                            <li>Try using a different browser or incognito mode</li>
                            <li>Check if you have the latest version of your browser</li>
                            <li>Verify your internet connection is stable</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/**
 * Loading component for auth error page
 */
function AuthErrorLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
                        </div>
                        <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                            Loading...
                        </CardTitle>
                        <CardDescription>
                            Checking authentication error
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}

/**
 * Authentication Error Page for MemorAI
 * Displays authentication errors and recovery options
 */
export default function AuthErrorPage() {
    return (
        <Suspense fallback={<AuthErrorLoading />}>
            <AuthErrorContent />
        </Suspense>
    );
}
