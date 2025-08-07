'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OnboardingMetrics {
    totalUsers: number;
    completedOnboarding: number;
    dropoffByStep: { [key: number]: number };
    avgCompletionTime: number;
    successScore: number;
}

interface UserSegment {
    name: string;
    count: number;
    completionRate: number;
    avgTime: number;
    commonDropoff: string;
}

interface OnboardingStep {
    id: number;
    name: string;
    description: string;
    completed: number;
    dropoff: number;
    avgTime: number;
    issues: string[];
}

function OnboardingSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
    const [selectedSegment, setSelectedSegment] = useState('all');

    const [metrics, setMetrics] = useState<OnboardingMetrics>({
        totalUsers: 2847,
        completedOnboarding: 2139,
        dropoffByStep: {
            1: 234,   // Profile setup
            2: 156,   // Workspace config
            3: 198,   // Integrations
            4: 87,    // First memory
            5: 33     // Team invite
        },
        avgCompletionTime: 423, // seconds
        successScore: 75.1
    });

    const [userSegments, setUserSegments] = useState<UserSegment[]>([
        {
            name: 'New Developers',
            count: 987,
            completionRate: 82.4,
            avgTime: 387,
            commonDropoff: 'Integrations'
        },
        {
            name: 'Business Users',
            count: 743,
            completionRate: 76.8,
            avgTime: 456,
            commonDropoff: 'Team Setup'
        },
        {
            name: 'Power Users',
            count: 567,
            completionRate: 91.2,
            avgTime: 234,
            commonDropoff: 'API Config'
        },
        {
            name: 'Mobile Users',
            count: 350,
            completionRate: 64.3,
            avgTime: 567,
            commonDropoff: 'Profile Setup'
        },
        {
            name: 'Enterprise',
            count: 200,
            completionRate: 94.5,
            avgTime: 198,
            commonDropoff: 'None'
        }
    ]);

    const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([
        {
            id: 1,
            name: 'Profile Setup',
            description: 'Basic profile information and preferences',
            completed: 2613,
            dropoff: 234,
            avgTime: 45,
            issues: ['Form validation errors', 'Profile picture upload fails']
        },
        {
            id: 2,
            name: 'Workspace Configuration',
            description: 'Create first workspace and set preferences',
            completed: 2457,
            dropoff: 156,
            avgTime: 78,
            issues: ['Workspace name conflicts', 'Template selection confusion']
        },
        {
            id: 3,
            name: 'Integration Setup',
            description: 'Connect external tools and services',
            completed: 2259,
            dropoff: 198,
            avgTime: 156,
            issues: ['API key validation fails', 'OAuth connection timeouts']
        },
        {
            id: 4,
            name: 'First Memory Creation',
            description: 'Create and save first memory with AI assistance',
            completed: 2172,
            dropoff: 87,
            avgTime: 89,
            issues: ['AI processing delays', 'Content formatting issues']
        },
        {
            id: 5,
            name: 'Team Invitation',
            description: 'Invite team members and set permissions',
            completed: 2139,
            dropoff: 33,
            avgTime: 55,
            issues: ['Email delivery delays', 'Permission level confusion']
        }
    ]);

    const improvementSuggestions = [
        {
            priority: 'high',
            step: 'Profile Setup',
            issue: 'High drop-off rate (8.2%)',
            suggestion: 'Implement progressive profiling - collect minimal info first',
            expectedImprovement: '+12% completion rate',
            effort: 'Medium',
            timeline: '2 weeks'
        },
        {
            priority: 'high',
            step: 'Integration Setup',
            issue: 'Longest completion time and highest confusion',
            suggestion: 'Add guided tour with popular integration presets',
            expectedImprovement: '+18% completion rate',
            effort: 'High',
            timeline: '3 weeks'
        },
        {
            priority: 'medium',
            step: 'Workspace Configuration',
            issue: 'Template selection confusion',
            suggestion: 'Simplify template picker with use-case based recommendations',
            expectedImprovement: '+8% completion rate',
            effort: 'Low',
            timeline: '1 week'
        },
        {
            priority: 'medium',
            step: 'First Memory',
            issue: 'AI processing delays causing abandonment',
            suggestion: 'Add progress indicators and example memories',
            expectedImprovement: '+5% completion rate',
            effort: 'Medium',
            timeline: '2 weeks'
        }
    ];

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
    };

    const getCompletionRate = () => {
        return ((metrics.completedOnboarding / metrics.totalUsers) * 100).toFixed(1);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900';
            case 'medium':
                return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900';
            case 'low':
                return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900';
            default:
                return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return '🔥';
            case 'medium':
                return '⚡';
            case 'low':
                return '💡';
            default:
                return '📝';
        }
    };

    useEffect(() => {
        // Check if user just completed onboarding
        const justCompleted = searchParams.get('completed');
        if (justCompleted === 'true') {
            // Track successful onboarding completion
            console.log('Onboarding completed successfully');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Onboarding Success Metrics
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Track user onboarding completion and identify optimization opportunities
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>

                        <select
                            value={selectedSegment}
                            onChange={(e) => setSelectedSegment(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Users</option>
                            <option value="new-developers">New Developers</option>
                            <option value="business-users">Business Users</option>
                            <option value="power-users">Power Users</option>
                            <option value="mobile-users">Mobile Users</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Completion Rate
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {getCompletionRate()}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Total Completed
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {metrics.completedOnboarding.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Avg Time
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(metrics.avgCompletionTime)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Success Score
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {metrics.successScore}/100
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Step Analysis & User Segments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Onboarding Steps Analysis */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Step-by-Step Analysis
                            </h2>

                            <div className="space-y-4">
                                {onboardingSteps.map((step, index) => (
                                    <div key={step.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.dropoff > 150
                                                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                                    : step.dropoff > 100
                                                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {step.id}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {step.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {step.completed.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {formatTime(step.avgTime)} avg
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                                            <div
                                                className={`h-2 rounded-full ${step.dropoff > 150 ? 'bg-red-500' :
                                                    step.dropoff > 100 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${(step.completed / metrics.totalUsers) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <span className={`font-medium ${step.dropoff > 150 ? 'text-red-600 dark:text-red-400' :
                                                    step.dropoff > 100 ? 'text-yellow-600 dark:text-yellow-400' :
                                                        'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {step.dropoff} dropoffs
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-300 ml-2">
                                                    ({((step.dropoff / (step.completed + step.dropoff)) * 100).toFixed(1)}%)
                                                </span>
                                            </div>

                                            {step.issues.length > 0 && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {step.issues.length} known issue{step.issues.length !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>

                                        {/* Issues */}
                                        {step.issues.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="font-medium">Common issues:</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {step.issues.map((issue, issueIndex) => (
                                                            <li key={issueIndex} className="flex items-center">
                                                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                                                                {issue}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Segments Analysis */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                User Segment Performance
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-600">
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                Segment
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                Users
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                Completion Rate
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                Avg Time
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                Common Dropoff
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {userSegments.map((segment, index) => (
                                            <tr key={index}>
                                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                    {segment.name}
                                                </td>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    {segment.count.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-medium ${segment.completionRate > 85 ? 'text-green-600 dark:text-green-400' :
                                                        segment.completionRate > 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                                            'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {segment.completionRate}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    {formatTime(segment.avgTime)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                                    {segment.commonDropoff}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Improvement Suggestions */}
                    <div className="space-y-6">
                        {/* Improvement Suggestions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Improvement Opportunities
                            </h3>

                            <div className="space-y-4">
                                {improvementSuggestions.map((suggestion, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}>
                                        <div className="flex items-start">
                                            <span className="text-lg mr-3">{getPriorityIcon(suggestion.priority)}</span>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {suggestion.step}
                                                    </h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${suggestion.priority === 'high'
                                                        ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                                                        : suggestion.priority === 'medium'
                                                            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                                                            : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                        }`}>
                                                        {suggestion.priority}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    <span className="font-medium">Issue:</span> {suggestion.issue}
                                                </p>

                                                <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">
                                                    {suggestion.suggestion}
                                                </p>

                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Expected Impact:</span>
                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                            {suggestion.expectedImprovement}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Effort:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {suggestion.effort}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {suggestion.timeline}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Quick Actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/onboarding')}
                                    className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Test Onboarding Flow</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Experience the current flow</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Export User Feedback</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Download feedback data</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Schedule A/B Test</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Test improvement ideas</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading component for onboarding success page
 */
function OnboardingSuccessLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 h-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingSuccessPage() {
    return (
        <Suspense fallback={<OnboardingSuccessLoading />}>
            <OnboardingSuccessContent />
        </Suspense>
    );
}
