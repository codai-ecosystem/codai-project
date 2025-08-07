'use client'

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap, Shield, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Account Upgrade Page
 * Displays pricing plans and upgrade options
 */
export default function UpgradePage() {
    const plans = [
        {
            name: 'Basic',
            price: 'Free',
            description: 'Perfect for getting started with MemorAI',
            features: [
                'Up to 1,000 memories',
                'Basic search functionality',
                'Personal workspace',
                'Email support'
            ],
            buttonText: 'Current Plan',
            buttonVariant: 'outline' as const,
            popular: false
        },
        {
            name: 'Pro',
            price: '$29/month',
            description: 'Advanced features for power users',
            features: [
                'Unlimited memories',
                'Advanced AI search',
                'Team collaboration',
                'API access',
                'Priority support',
                'Custom integrations'
            ],
            buttonText: 'Upgrade to Pro',
            buttonVariant: 'default' as const,
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Full-scale solution for organizations',
            features: [
                'Everything in Pro',
                'SSO integration',
                'Advanced security',
                'Dedicated support',
                'Custom deployment',
                'SLA guarantees'
            ],
            buttonText: 'Contact Sales',
            buttonVariant: 'outline' as const,
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Star className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Upgrade Your MemorAI Experience
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Unlock advanced features and take your AI memory to the next level
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan, index) => (
                        <Card 
                            key={plan.name} 
                            className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-2xl font-bold">
                                    {plan.name}
                                </CardTitle>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {plan.price}
                                </div>
                                <CardDescription>
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center space-x-3">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="pt-4">
                                    <Button 
                                        variant={plan.buttonVariant}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Features Highlight */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="text-center space-y-3">
                        <Zap className="w-8 h-8 text-yellow-500 mx-auto" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Lightning Fast
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Search through millions of memories in milliseconds
                        </p>
                    </div>
                    
                    <div className="text-center space-y-3">
                        <Shield className="w-8 h-8 text-green-500 mx-auto" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Enterprise Security
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Bank-grade encryption and security protocols
                        </p>
                    </div>
                    
                    <div className="text-center space-y-3">
                        <Users className="w-8 h-8 text-blue-500 mx-auto" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Team Collaboration
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Share and collaborate on memories with your team
                        </p>
                    </div>
                    
                    <div className="text-center space-y-3">
                        <Star className="w-8 h-8 text-purple-500 mx-auto" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            AI-Powered
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Advanced AI for intelligent memory management
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Can I cancel anytime?
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Yes, you can cancel your subscription at any time. Your data will remain accessible during your billing period.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Is my data secure?
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Absolutely. We use enterprise-grade encryption and security measures to protect your data.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Do you offer refunds?
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    We offer a 30-day money-back guarantee for all paid plans. No questions asked.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Can I upgrade later?
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Dashboard */}
                <div className="text-center">
                    <Link href="/dashboard">
                        <Button variant="outline" size="lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

