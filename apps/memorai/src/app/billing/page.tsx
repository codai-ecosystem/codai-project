'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BillingInfo {
    plan: string;
    status: 'active' | 'cancelled' | 'past_due';
    nextBilling: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
    expiresAt?: string;
    isDefault: boolean;
}

interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    downloadUrl: string;
}

export default function BillingPage() {
    const router = useRouter();

    const [billingInfo, setBillingInfo] = useState<BillingInfo>({
        plan: 'Pro',
        status: 'active',
        nextBilling: '2024-02-15',
        amount: 29,
        billingCycle: 'monthly'
    });

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiresAt: '12/26',
            isDefault: true
        }
    ]);

    const [invoices, setInvoices] = useState<Invoice[]>([
        {
            id: 'inv_001',
            date: '2024-01-15',
            amount: 29,
            status: 'paid',
            downloadUrl: '#'
        },
        {
            id: 'inv_002',
            date: '2023-12-15',
            amount: 29,
            status: 'paid',
            downloadUrl: '#'
        },
        {
            id: 'inv_003',
            date: '2023-11-15',
            amount: 29,
            status: 'paid',
            downloadUrl: '#'
        }
    ]);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCancelSubscription = async () => {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setBillingInfo(prev => ({ ...prev, status: 'cancelled' }));
        setShowCancelModal(false);
        setIsLoading(false);
    };

    const handleChangePaymentMethod = () => {
        setShowAddPaymentModal(true);
    };

    const handleChangePlan = () => {
        router.push('/pricing?current=pro');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Billing & Subscriptions
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Manage your subscription, payment methods, and billing history
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Current Plan & Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Plan */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Current Plan
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${billingInfo.status === 'active'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : billingInfo.status === 'cancelled'
                                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                    {billingInfo.status.charAt(0).toUpperCase() + billingInfo.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {billingInfo.plan} Plan
                                    </h3>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        ${billingInfo.amount}
                                        <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                                            /{billingInfo.billingCycle.replace('ly', '')}
                                        </span>
                                    </p>

                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Next billing:</span> {formatDate(billingInfo.nextBilling)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Billing cycle:</span> {billingInfo.billingCycle}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleChangePlan}
                                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Change Plan
                                    </button>

                                    <button
                                        onClick={() => setBillingInfo(prev => ({
                                            ...prev,
                                            billingCycle: prev.billingCycle === 'monthly' ? 'yearly' : 'monthly',
                                            amount: prev.billingCycle === 'monthly' ? 276 : 29
                                        }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
                                    >
                                        Switch to {billingInfo.billingCycle === 'monthly' ? 'Yearly' : 'Monthly'}
                                    </button>

                                    {billingInfo.status === 'active' && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="w-full px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 font-medium rounded-lg transition-colors"
                                        >
                                            Cancel Subscription
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Payment Methods
                                </h2>
                                <button
                                    onClick={handleChangePaymentMethod}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Add Method
                                </button>
                            </div>

                            <div className="space-y-4">
                                {paymentMethods.map((method) => (
                                    <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                        <div className="flex items-center">
                                            {method.type === 'card' ? (
                                                <svg className="w-8 h-8 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99-.201.193-.407.367-.607.541-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99z" />
                                                </svg>
                                            )}

                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {method.type === 'card'
                                                        ? `${method.brand} •••• ${method.last4}`
                                                        : 'PayPal'
                                                    }
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {method.type === 'card' && `Expires ${method.expiresAt}`}
                                                    {method.isDefault && (
                                                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {!method.isDefault && (
                                                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                                                    Set as Default
                                                </button>
                                            )}
                                            <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Billing History */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Billing History
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-600">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                Date
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                Amount
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                Invoice
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    {formatDate(invoice.date)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    ${invoice.amount}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : invoice.status === 'pending'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                        }`}>
                                                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Usage & Support */}
                    <div className="space-y-6">
                        {/* Usage Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Current Usage
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">Memories</span>
                                        <span className="text-gray-900 dark:text-white">2,847 / Unlimited</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">API Calls</span>
                                        <span className="text-gray-900 dark:text-white">48,392 / Unlimited</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">Team Members</span>
                                        <span className="text-gray-900 dark:text-white">3 / 10</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h3>

                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Update Billing Info</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Change address, tax info</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Request Refund</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">30-day money back guarantee</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Contact Support</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Get help with billing</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Cancel Subscription
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to cancel your subscription? You'll lose access to Pro features at the end of your billing cycle.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Keep Subscription
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                            >
                                {isLoading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Add Payment Method
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            This will redirect you to our secure payment processor to add a new payment method.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddPaymentModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Would redirect to payment processor
                                    setShowAddPaymentModal(false);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
