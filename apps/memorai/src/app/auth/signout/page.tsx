'use client'

import React from 'react';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LogOut, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Sign Out Page for MemorAI
 * Confirms sign out and provides navigation options
 */
export default function SignOutPage() {
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isSignedOut, setIsSignedOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut({ callbackUrl: '/', redirect: false });
            setIsSignedOut(true);
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    useEffect(() => {
        // Auto-redirect after successful sign out
        if (isSignedOut) {
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
    }, [isSignedOut]);

    if (isSignedOut) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8">
                    <Card className="w-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                                Signed Out Successfully
                            </CardTitle>
                            <CardDescription>
                                You have been signed out of MemorAI. Redirecting to home page...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div className="animate-pulse">
                                <div className="h-2 bg-green-200 rounded-full dark:bg-green-800">
                                    <div className="h-2 bg-green-500 rounded-full animate-pulse" style={{ width: '66%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Link href="/">
                                    <Button variant="outline" className="w-full">
                                        <Home className="w-4 h-4 mr-2" />
                                        Go to Home
                                    </Button>
                                </Link>

                                <Link href="/auth/signin">
                                    <Button className="w-full">
                                        Sign In Again
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <LogOut className="w-16 h-16 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl">Sign Out</CardTitle>
                        <CardDescription>
                            Are you sure you want to sign out of MemorAI?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Note:</strong> You will need to sign in again to access your MemorAI account and data.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                variant="destructive"
                                className="w-full"
                                size="lg"
                            >
                                {isSigningOut ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Signing out...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <LogOut className="w-4 h-4" />
                                        <span>Yes, sign me out</span>
                                    </div>
                                )}
                            </Button>

                            <Link href="/dashboard">
                                <Button variant="outline" className="w-full">
                                    Cancel, stay signed in
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Need help?
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                        <Link
                            href="/support"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Contact Support
                        </Link>
                        <Link
                            href="/docs"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Documentation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

