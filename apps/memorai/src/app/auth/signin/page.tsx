'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * Sign In Page for MemorAI
 * Integrates with CODAI authentication system
 */
export default function SignInPage() {
    const [providers, setProviders] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const setupProviders = async () => {
            const res = await getProviders();
            setProviders(res);
        };
        setupProviders();
    }, []);

    const handleSignIn = async (providerId: string) => {
        setIsLoading(true);
        try {
            await signIn(providerId, { callbackUrl: '/dashboard' });
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome to MemorAI
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Your AI-powered memory infrastructure platform
                    </p>
                </div>

                {/* Sign In Card */}
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                        <CardDescription className="text-center">
                            Sign in with your CODAI account to access MemorAI
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {providers &&
                            Object.values(providers).map((provider: any) => (
                                <div key={provider.name} className="space-y-2">
                                    <Button
                                        onClick={() => handleSignIn(provider.id)}
                                        disabled={isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Shield className="w-4 h-4" />
                                                <span>Sign in with {provider.name}</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            ))}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href="https://id.codai.ro/register"
                                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Don't have a CODAI account? Sign up here
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Overview */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center space-y-2">
                        <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            AI Memory
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            Intelligent vector-based memory storage
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            Collaboration
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            Real-time team collaboration
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            Fast Search
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            Lightning-fast semantic search
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            Secure
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            Enterprise-grade security
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
