'use client'

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Mail, Users } from 'lucide-react';
import Link from 'next/link';

/**
 * Unauthorized Access Page
 * Displays when user lacks necessary permissions
 */
export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Unauthorized Icon */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Shield className="w-16 h-16 text-orange-500 dark:text-orange-400" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unauthorized Card */}
                <Card className="w-full border-orange-200 dark:border-orange-800">
                    <CardHeader className="text-center">
                        <CardTitle className="text-orange-800 dark:text-orange-300">
                            Access Denied
                        </CardTitle>
                        <CardDescription className="text-orange-600 dark:text-orange-400">
                            You don't have permission to access this resource
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                <strong>What happened?</strong><br />
                                Your account doesn't have the necessary permissions to view this page or perform this action.
                            </p>
                        </div>

                        {/* Possible Actions */}
                        <div className="space-y-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Possible actions:</strong>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Contact Administrator
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Ask your admin to grant you the required permissions
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Upgrade Account
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Upgrade to a plan that includes this feature
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <Link href="/upgrade" className="w-full">
                                <Button className="w-full" variant="default">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Upgrade Account
                                </Button>
                            </Link>

                            <Link href="/contact" className="w-full">
                                <Button className="w-full" variant="outline">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Contact Support
                                </Button>
                            </Link>

                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full" variant="ghost">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>

                        {/* Help Text */}
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                            <p>
                                Need immediate help?{' '}
                                <Link
                                    href="/support"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                >
                                    Contact our support team
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Permission Requirements */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Required Permissions</CardTitle>
                        <CardDescription>
                            This resource requires one or more of the following:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span><strong>Admin Role:</strong> Full system access</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span><strong>MemorAI Access:</strong> Premium feature access</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span><strong>Write Permission:</strong> Content modification rights</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span><strong>Team Access:</strong> Collaborative features</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>
                        Learn more about{' '}
                        <Link href="/docs/permissions" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                            MemorAI permissions
                        </Link>{' '}
                        and{' '}
                        <Link href="/pricing" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                            pricing plans
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

