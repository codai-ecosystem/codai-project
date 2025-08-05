'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const plan = searchParams.get('plan') || 'pro';

    useEffect(() => {
        // Track conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
                'transaction_id': `txn_${Date.now()}`,
                'value': plan === 'pro' ? 29 : 299,
                'currency': 'USD',
                'items': [{
                    'item_id': plan,
                    'item_name': `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                    'category': 'subscription',
                    'quantity': 1,
                    'price': plan === 'pro' ? 29 : 299
                }]
            });
        }

        // Set up onboarding redirect
        const redirectTimer = setTimeout(() => {
            router.push('/onboarding?source=checkout');
        }, 5000);

        return () => clearTimeout(redirectTimer);
    }, [plan, router]);

    const planNames = {
        free: 'Free',
        pro: 'Pro',
        enterprise: 'Enterprise'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Success icon */}
                <div>
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900">
                        <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Payment Successful!
                    </h1>

                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                        Welcome to MemorAI {planNames[plan as keyof typeof planNames] || 'Pro'}
                    </p>
                </div>

                {/* Success details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-left">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        What happens next?
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    1
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Account Activation
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Your account has been upgraded and all Pro features are now available.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    2
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Email Confirmation
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Check your email for a receipt and getting started guide.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    3
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Onboarding Process
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Complete your profile setup and create your first AI memory.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features unlocked */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🎉 Features Unlocked
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Unlimited memories
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            AI-powered search
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Team collaboration
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            API access
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Priority support
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Advanced analytics
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/onboarding?source=checkout')}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Start Onboarding →
                    </button>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>

                {/* Auto redirect notice */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You'll be automatically redirected to onboarding in 5 seconds
                    </p>
                </div>

                {/* Support */}
                <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Need help getting started?{' '}
                        <a href="/support" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading component for checkout success page
 */
function CheckoutSuccessLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Processing...
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                        Confirming your payment
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<CheckoutSuccessLoading />}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
