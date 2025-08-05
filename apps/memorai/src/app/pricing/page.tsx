'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PricingTier {
    id: string;
    name: string;
    price: number;
    period: 'month' | 'year';
    description: string;
    features: PricingFeature[];
    limitations: PricingLimitation[];
    highlighted: boolean;
    buttonText: string;
    buttonStyle: 'primary' | 'secondary' | 'outline';
    mostPopular: boolean;
}

interface PricingFeature {
    name: string;
    included: boolean;
    limit?: string;
    description?: string;
}

interface PricingLimitation {
    type: 'memories' | 'storage' | 'users' | 'api_calls' | 'integrations' | 'support';
    limit: number | string;
    unit: string;
}

interface BillingCycle {
    period: 'month' | 'year';
    label: string;
    discount?: number;
}

interface ComparisonFeature {
    category: string;
    features: {
        name: string;
        description: string;
        free: string | boolean;
        pro: string | boolean;
        enterprise: string | boolean;
    }[];
}

export default function BusinessTierPricing() {
    const router = useRouter();
    const [selectedBilling, setSelectedBilling] = useState<'month' | 'year'>('month');
    const [showComparison, setShowComparison] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const billingCycles: BillingCycle[] = [
        { period: 'month', label: 'Monthly' },
        { period: 'year', label: 'Yearly', discount: 20 }
    ];

    const pricingTiers: PricingTier[] = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            period: selectedBilling,
            description: 'Perfect for personal use and small projects',
            features: [
                { name: 'Basic memory management', included: true },
                { name: 'Simple text search', included: true },
                { name: 'Web interface access', included: true },
                { name: 'Community support', included: true },
                { name: 'Basic analytics', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'AI-powered search', included: false },
                { name: 'Team collaboration', included: false },
                { name: 'API access', included: false },
                { name: 'Advanced integrations', included: false },
                { name: 'Priority support', included: false },
                { name: 'Custom workflows', included: false }
            ],
            limitations: [
                { type: 'memories', limit: 1000, unit: 'memories/month' },
                { type: 'storage', limit: '100MB', unit: 'total storage' },
                { type: 'users', limit: 1, unit: 'user' },
                { type: 'api_calls', limit: 0, unit: 'API calls/month' },
                { type: 'integrations', limit: 0, unit: 'active integrations' },
                { type: 'support', limit: 'Community', unit: 'support level' }
            ],
            highlighted: false,
            buttonText: 'Get Started Free',
            buttonStyle: 'outline',
            mostPopular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: selectedBilling === 'year' ? 23 : 29,
            period: selectedBilling,
            description: 'Ideal for growing teams and businesses',
            features: [
                { name: 'Everything in Free', included: true },
                { name: 'AI-powered semantic search', included: true },
                { name: 'Real-time team collaboration', included: true },
                { name: 'Full API access', included: true },
                { name: 'Advanced integrations', included: true, limit: '20+ integrations' },
                { name: 'Priority email support', included: true },
                { name: 'Advanced analytics & insights', included: true },
                { name: 'Custom workflows & automation', included: true },
                { name: 'Version history & rollbacks', included: true },
                { name: 'Advanced permissions', included: true },
                { name: 'Export capabilities', included: true },
                { name: 'SLA guarantee', included: false }
            ],
            limitations: [
                { type: 'memories', limit: 'Unlimited', unit: 'memories' },
                { type: 'storage', limit: '10GB', unit: 'per user' },
                { type: 'users', limit: 'Unlimited', unit: 'team members' },
                { type: 'api_calls', limit: 100000, unit: 'API calls/month' },
                { type: 'integrations', limit: 'All', unit: 'integrations' },
                { type: 'support', limit: 'Priority', unit: 'email support' }
            ],
            highlighted: true,
            buttonText: 'Start Pro Trial',
            buttonStyle: 'primary',
            mostPopular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 0, // Custom pricing
            period: selectedBilling,
            description: 'Full-scale deployment for large organizations',
            features: [
                { name: 'Everything in Pro', included: true },
                { name: 'On-premises deployment', included: true },
                { name: 'Single Sign-On (SSO)', included: true },
                { name: 'Advanced security & compliance', included: true },
                { name: 'Dedicated account manager', included: true },
                { name: '24/7 phone & chat support', included: true },
                { name: 'Custom integrations', included: true },
                { name: 'Advanced admin controls', included: true },
                { name: 'Audit logs & compliance reports', included: true },
                { name: '99.99% SLA guarantee', included: true },
                { name: 'Custom training & onboarding', included: true },
                { name: 'White-label options', included: true }
            ],
            limitations: [
                { type: 'memories', limit: 'Unlimited', unit: 'memories' },
                { type: 'storage', limit: 'Unlimited', unit: 'storage' },
                { type: 'users', limit: 'Unlimited', unit: 'users' },
                { type: 'api_calls', limit: 'Unlimited', unit: 'API calls' },
                { type: 'integrations', limit: 'Custom', unit: 'integrations' },
                { type: 'support', limit: 'Dedicated', unit: 'support team' }
            ],
            highlighted: false,
            buttonText: 'Contact Sales',
            buttonStyle: 'secondary',
            mostPopular: false
        }
    ];

    const comparisonFeatures: ComparisonFeature[] = [
        {
            category: 'Core Features',
            features: [
                {
                    name: 'Memory Storage',
                    description: 'Store and organize your knowledge',
                    free: '1,000/month',
                    pro: 'Unlimited',
                    enterprise: 'Unlimited'
                },
                {
                    name: 'Search Capabilities',
                    description: 'Find information quickly',
                    free: 'Basic text search',
                    pro: 'AI semantic search',
                    enterprise: 'AI semantic search'
                },
                {
                    name: 'Storage Space',
                    description: 'Total storage allocation',
                    free: '100MB',
                    pro: '10GB per user',
                    enterprise: 'Unlimited'
                },
                {
                    name: 'Team Members',
                    description: 'Number of users in workspace',
                    free: '1 user',
                    pro: 'Unlimited',
                    enterprise: 'Unlimited'
                }
            ]
        },
        {
            category: 'Collaboration',
            features: [
                {
                    name: 'Real-time Collaboration',
                    description: 'Work together on memories',
                    free: false,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Comments & Discussions',
                    description: 'Discuss memories with team',
                    free: false,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Advanced Permissions',
                    description: 'Control who sees what',
                    free: false,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Admin Controls',
                    description: 'Advanced user management',
                    free: false,
                    pro: 'Basic',
                    enterprise: 'Advanced'
                }
            ]
        },
        {
            category: 'Integrations',
            features: [
                {
                    name: 'Basic Integrations',
                    description: 'Connect popular tools',
                    free: false,
                    pro: '20+ integrations',
                    enterprise: 'All integrations'
                },
                {
                    name: 'API Access',
                    description: 'REST API for custom integrations',
                    free: false,
                    pro: '100K calls/month',
                    enterprise: 'Unlimited'
                },
                {
                    name: 'Webhooks',
                    description: 'Real-time notifications',
                    free: false,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Custom Integrations',
                    description: 'Build custom connections',
                    free: false,
                    pro: false,
                    enterprise: true
                }
            ]
        },
        {
            category: 'Security & Compliance',
            features: [
                {
                    name: 'Data Encryption',
                    description: 'Encrypt data at rest and in transit',
                    free: true,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Single Sign-On (SSO)',
                    description: 'SAML, OAuth, LDAP support',
                    free: false,
                    pro: false,
                    enterprise: true
                },
                {
                    name: 'Audit Logs',
                    description: 'Track all user actions',
                    free: false,
                    pro: 'Basic',
                    enterprise: 'Advanced'
                },
                {
                    name: 'Compliance Certifications',
                    description: 'SOC 2, GDPR, HIPAA ready',
                    free: false,
                    pro: 'SOC 2',
                    enterprise: 'All certifications'
                }
            ]
        },
        {
            category: 'Support',
            features: [
                {
                    name: 'Community Support',
                    description: 'Access to community forums',
                    free: true,
                    pro: true,
                    enterprise: true
                },
                {
                    name: 'Email Support',
                    description: 'Direct email assistance',
                    free: false,
                    pro: 'Priority',
                    enterprise: '24/7'
                },
                {
                    name: 'Phone Support',
                    description: 'Direct phone assistance',
                    free: false,
                    pro: false,
                    enterprise: '24/7'
                },
                {
                    name: 'Dedicated Account Manager',
                    description: 'Personal success manager',
                    free: false,
                    pro: false,
                    enterprise: true
                }
            ]
        }
    ];

    const handleSelectTier = async (tierId: string) => {
        setSelectedTier(tierId);
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (tierId === 'free') {
            router.push('/dashboard');
        } else if (tierId === 'pro') {
            router.push('/checkout?plan=pro&billing=' + selectedBilling);
        } else if (tierId === 'enterprise') {
            router.push('/contact-sales?plan=enterprise');
        }

        setIsLoading(false);
        setSelectedTier(null);
    };

    const getDiscountedPrice = (originalPrice: number) => {
        if (selectedBilling === 'year') {
            const discount = billingCycles.find(cycle => cycle.period === 'year')?.discount || 0;
            return Math.round(originalPrice * (1 - discount / 100));
        }
        return originalPrice;
    };

    const renderFeatureValue = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return value ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        }
        return <span className="text-sm text-gray-900 dark:text-white">{value}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your MemorAI Plan
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                        From personal knowledge management to enterprise-scale deployment, we have a plan that fits your needs.
                    </p>

                    {/* Billing toggle */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                            {billingCycles.map(cycle => (
                                <button
                                    key={cycle.period}
                                    onClick={() => setSelectedBilling(cycle.period)}
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${selectedBilling === cycle.period
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    {cycle.label}
                                    {cycle.discount && (
                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            -{cycle.discount}%
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedBilling === 'year' && (
                        <div className="text-green-600 dark:text-green-400 font-medium mb-8">
                            💰 Save 20% with yearly billing
                        </div>
                    )}
                </div>

                {/* Pricing cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {pricingTiers.map(tier => (
                        <div
                            key={tier.id}
                            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 ${tier.highlighted
                                    ? 'border-blue-500 scale-105 shadow-xl'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-xl'
                                }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {tier.name}
                                    </h3>

                                    <div className="mb-4">
                                        {tier.id === 'enterprise' ? (
                                            <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                                Custom
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline justify-center">
                                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                        ${getDiscountedPrice(tier.price)}
                                                    </span>
                                                    {tier.price > 0 && (
                                                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                                                            /{selectedBilling}
                                                        </span>
                                                    )}
                                                </div>

                                                {selectedBilling === 'year' && tier.price > 0 && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="line-through">${tier.price}/{selectedBilling}</span>
                                                        <span className="text-green-600 dark:text-green-400 ml-2">
                                                            Save ${tier.price - getDiscountedPrice(tier.price)}/{selectedBilling}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {tier.features.slice(0, 8).map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 mr-3 mt-0.5">
                                                {feature.included ? (
                                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <span className={`text-sm ${feature.included
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-500 dark:text-gray-400 line-through'
                                                    }`}>
                                                    {feature.name}
                                                </span>
                                                {feature.limit && (
                                                    <span className="text-blue-600 dark:text-blue-400 text-xs ml-2">
                                                        ({feature.limit})
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleSelectTier(tier.id)}
                                    disabled={isLoading && selectedTier === tier.id}
                                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center ${tier.buttonStyle === 'primary'
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                            : tier.buttonStyle === 'secondary'
                                                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                                : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white'
                                        } ${isLoading && selectedTier === tier.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading && selectedTier === tier.id ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        tier.buttonText
                                    )}
                                </button>

                                {tier.id === 'pro' && (
                                    <div className="text-center mt-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            14-day free trial • No credit card required
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature comparison toggle */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                        {showComparison ? 'Hide' : 'Show'} detailed comparison
                        <svg
                            className={`ml-2 w-5 h-5 transition-transform ${showComparison ? 'rotate-180' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Detailed comparison table */}
                {showComparison && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Detailed Feature Comparison
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white w-1/2">
                                            Feature
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white w-1/6">
                                            Free
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white w-1/6">
                                            Pro
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white w-1/6">
                                            Enterprise
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {comparisonFeatures.map((category, categoryIndex) => (
                                        <React.Fragment key={categoryIndex}>
                                            <tr className="bg-gray-50 dark:bg-gray-700">
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600"
                                                >
                                                    {category.category}
                                                </td>
                                            </tr>

                                            {category.features.map((feature, featureIndex) => (
                                                <tr key={featureIndex} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {feature.name}
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {feature.description}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-center">
                                                        {renderFeatureValue(feature.free)}
                                                    </td>

                                                    <td className="px-6 py-4 text-center">
                                                        {renderFeatureValue(feature.pro)}
                                                    </td>

                                                    <td className="px-6 py-4 text-center">
                                                        {renderFeatureValue(feature.enterprise)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Can I change plans anytime?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    What happens to my data if I downgrade?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Your data remains safe. You'll need to reduce usage to fit within the new plan's limits, but we'll help you with the transition.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Do you offer discounts for nonprofits?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Yes! We offer special pricing for qualified nonprofits, educational institutions, and open source projects.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Is there a free trial for paid plans?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Pro plans include a 14-day free trial with no credit card required. Enterprise customers can request a custom trial period.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    How secure is my data?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We use enterprise-grade security with encryption at rest and in transit. All plans include security features, with enhanced options for Enterprise.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Can I use MemorAI offline?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Our mobile apps support offline access to recently viewed memories. Enterprise customers can deploy on-premises for full offline capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-20 text-center bg-blue-50 dark:bg-blue-900 rounded-2xl p-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        Our team is here to help you choose the right plan and get the most out of MemorAI.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/contact-sales')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Contact Sales
                        </button>
                        <button
                            onClick={() => router.push('/support')}
                            className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Get Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
