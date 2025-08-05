'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ConversionFunnel {
    stage: string;
    visitors: number;
    conversionRate: number;
    dropoffRate: number;
}

interface HeatmapData {
    element: string;
    clicks: number;
    engagement: number;
    position: { x: number; y: number };
}

interface UserFlow {
    step: string;
    users: number;
    dropoff: number;
    avgTime: number;
}

export default function ConversionOptimizationPage() {
    const router = useRouter();

    const [selectedPage, setSelectedPage] = useState('landing');
    const [optimizationPeriod, setOptimizationPeriod] = useState('30d');

    const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([
        { stage: 'Landing Page', visitors: 10000, conversionRate: 100, dropoffRate: 0 },
        { stage: 'Sign Up', visitors: 6500, conversionRate: 65, dropoffRate: 35 },
        { stage: 'Email Verification', visitors: 5200, conversionRate: 80, dropoffRate: 20 },
        { stage: 'Onboarding', visitors: 4680, conversionRate: 90, dropoffRate: 10 },
        { stage: 'First Action', visitors: 3744, conversionRate: 80, dropoffRate: 20 },
        { stage: 'Pro Upgrade', visitors: 1122, conversionRate: 30, dropoffRate: 70 }
    ]);

    const [heatmapElements, setHeatmapElements] = useState<HeatmapData[]>([
        { element: 'Hero CTA Button', clicks: 2847, engagement: 89, position: { x: 50, y: 30 } },
        { element: 'Navigation Menu', clicks: 1932, engagement: 34, position: { x: 20, y: 10 } },
        { element: 'Feature Section', clicks: 1456, engagement: 67, position: { x: 50, y: 50 } },
        { element: 'Pricing Link', clicks: 892, engagement: 78, position: { x: 80, y: 10 } },
        { element: 'Footer Links', clicks: 234, engagement: 12, position: { x: 50, y: 90 } }
    ]);

    const [userFlows, setUserFlows] = useState<UserFlow[]>([
        { step: 'Land on Homepage', users: 10000, dropoff: 0, avgTime: 45 },
        { step: 'View Features', users: 7200, dropoff: 28, avgTime: 120 },
        { step: 'Check Pricing', users: 4800, dropoff: 33, avgTime: 90 },
        { step: 'Start Sign Up', users: 3600, dropoff: 25, avgTime: 180 },
        { step: 'Complete Registration', users: 2880, dropoff: 20, avgTime: 240 }
    ]);

    const pages = [
        { id: 'landing', name: 'Landing Page', url: '/' },
        { id: 'pricing', name: 'Pricing Page', url: '/pricing' },
        { id: 'signup', name: 'Sign Up Page', url: '/signup' },
        { id: 'onboarding', name: 'Onboarding Flow', url: '/onboarding' }
    ];

    const optimizationSuggestions = [
        {
            type: 'critical',
            title: 'High Drop-off in Sign Up',
            description: 'Sign up conversion is only 65%. Consider simplifying the form or adding social login options.',
            impact: 'High',
            effort: 'Medium',
            expectedLift: '+15-25%'
        },
        {
            type: 'important',
            title: 'Low Pro Upgrade Rate',
            description: 'Only 30% of users upgrade to Pro. Test value proposition and pricing positioning.',
            impact: 'High',
            effort: 'High',
            expectedLift: '+10-20%'
        },
        {
            type: 'opportunity',
            title: 'Optimize Feature Section',
            description: 'Feature section has high engagement (67%) but low click-through. Test CTA placement.',
            impact: 'Medium',
            effort: 'Low',
            expectedLift: '+5-15%'
        },
        {
            type: 'insight',
            title: 'Navigation Menu Underutilized',
            description: 'Navigation has low engagement (34%). Consider restructuring or highlighting key pages.',
            impact: 'Low',
            effort: 'Medium',
            expectedLift: '+3-8%'
        }
    ];

    const getDropoffColor = (rate: number) => {
        if (rate > 50) return 'text-red-600 dark:text-red-400';
        if (rate > 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getSuggestionColor = (type: string) => {
        switch (type) {
            case 'critical':
                return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900';
            case 'important':
                return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900';
            case 'opportunity':
                return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900';
            default:
                return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
        }
    };

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'important':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
            case 'opportunity':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Conversion Optimization
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Analyze user behavior and optimize conversion funnels
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedPage}
                            onChange={(e) => setSelectedPage(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={optimizationPeriod}
                            onChange={(e) => setOptimizationPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Funnel & User Flow */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Conversion Funnel */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Conversion Funnel
                            </h2>

                            <div className="space-y-4">
                                {funnelData.map((stage, index) => (
                                    <div key={index} className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0
                                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                                        : stage.dropoffRate > 50
                                                            ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                                            : stage.dropoffRate > 25
                                                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                                                                : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                                    {stage.stage}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {stage.visitors.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {stage.conversionRate}% of previous
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                                            <div
                                                className={`h-3 rounded-full ${stage.dropoffRate > 50
                                                        ? 'bg-red-500'
                                                        : stage.dropoffRate > 25
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${(stage.visitors / funnelData[0].visitors) * 100}%` }}
                                            />
                                        </div>

                                        {index > 0 && (
                                            <div className="text-sm">
                                                <span className={`font-medium ${getDropoffColor(stage.dropoffRate)}`}>
                                                    {stage.dropoffRate}% drop-off
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-300 ml-2">
                                                    ({(funnelData[index - 1].visitors - stage.visitors).toLocaleString()} users lost)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Flow Analysis */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                User Flow Analysis
                            </h2>

                            <div className="space-y-4">
                                {userFlows.map((flow, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {flow.step}
                                                </span>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    Avg: {flow.avgTime}s
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    {flow.users.toLocaleString()} users
                                                </span>
                                                {flow.dropoff > 0 && (
                                                    <span className={`font-medium ${getDropoffColor(flow.dropoff)}`}>
                                                        -{flow.dropoff}% drop-off
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {index + 1}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Heatmap Visualization */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Click Heatmap - {pages.find(p => p.id === selectedPage)?.name}
                            </h2>

                            <div className="relative h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                {/* Simulated page layout */}
                                <div className="absolute inset-0 p-4">
                                    <div className="h-full w-full bg-white dark:bg-gray-800 rounded shadow-sm relative">
                                        {heatmapElements.map((element, index) => (
                                            <div
                                                key={index}
                                                className="absolute"
                                                style={{
                                                    left: `${element.position.x}%`,
                                                    top: `${element.position.y}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded-full ${element.engagement > 80 ? 'bg-red-500' :
                                                        element.engagement > 60 ? 'bg-orange-500' :
                                                            element.engagement > 40 ? 'bg-yellow-500' :
                                                                element.engagement > 20 ? 'bg-blue-500' : 'bg-gray-500'
                                                    } opacity-75 animate-pulse`} />

                                                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                                                    {element.element}: {element.clicks} clicks
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap legend */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">High (80%+)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Medium (60-80%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Low (40-60%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Very Low (&lt;40%)</span>
                                    </div>
                                </div>

                                <button className="px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                    View Full Heatmap
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Optimization Suggestions */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Stats
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300">Overall CVR</span>
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {((funnelData[funnelData.length - 1].visitors / funnelData[0].visitors) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300">Biggest Drop-off</span>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                        {Math.max(...funnelData.slice(1).map(s => s.dropoffRate))}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300">Avg Time on Page</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {Math.round(userFlows.reduce((sum, flow) => sum + flow.avgTime, 0) / userFlows.length)}s
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Optimization Suggestions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Optimization Suggestions
                            </h3>

                            <div className="space-y-4">
                                {optimizationSuggestions.map((suggestion, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${getSuggestionColor(suggestion.type)}`}>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                {getSuggestionIcon(suggestion.type)}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {suggestion.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    {suggestion.description}
                                                </p>

                                                <div className="flex items-center space-x-4 text-xs">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        Impact: <span className="font-medium">{suggestion.impact}</span>
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        Effort: <span className="font-medium">{suggestion.effort}</span>
                                                    </span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        {suggestion.expectedLift}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* A/B Test Ideas */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recommended A/B Tests
                            </h3>

                            <div className="space-y-3">
                                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        Hero Section CTA
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Test "Start Free Trial" vs "Get Started Free"
                                    </p>
                                </div>

                                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        Sign-up Form Length
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Test 2-field vs 4-field registration form
                                    </p>
                                </div>

                                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        Pricing Display
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Test monthly vs yearly pricing as default
                                    </p>
                                </div>
                            </div>

                            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                                Create A/B Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
