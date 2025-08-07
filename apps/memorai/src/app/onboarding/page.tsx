'use client'

import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    component: React.ComponentType<any>;
    isComplete: boolean;
    isRequired: boolean;
}

interface UserProfile {
    name: string;
    email: string;
    company: string;
    role: string;
    teamSize: string;
    useCase: string;
    goals: string[];
}

interface IntegrationOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    isPopular: boolean;
    setupComplexity: 'easy' | 'medium' | 'advanced';
}

// Step 1: Welcome Component
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to MemorAI!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                You're about to transform how your team manages knowledge. Let's get you set up in just a few minutes.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    What we'll cover:
                </h3>
                <ul className="text-left text-blue-800 dark:text-blue-200 space-y-2">
                    <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Set up your profile and preferences
                    </li>
                    <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Configure your workspace
                    </li>
                    <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Connect your favorite tools
                    </li>
                    <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Create your first memory
                    </li>
                </ul>
            </div>

            <button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Let's Get Started →
            </button>
        </div>
    );
};

// Step 2: Profile Setup Component
const ProfileStep = ({
    profile,
    onProfileUpdate,
    onNext
}: {
    profile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
    onNext: () => void;
}) => {
    const [localProfile, setLocalProfile] = useState(profile);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const teamSizeOptions = [
        'Just me (1)',
        'Small team (2-10)',
        'Medium team (11-50)',
        'Large team (51-200)',
        'Enterprise (200+)'
    ];

    const roleOptions = [
        'Developer/Engineer',
        'Product Manager',
        'Designer',
        'Researcher',
        'Data Scientist',
        'Team Lead/Manager',
        'Executive',
        'Other'
    ];

    const useCaseOptions = [
        'Knowledge Management',
        'Project Documentation',
        'Research & Development',
        'Team Collaboration',
        'Customer Support',
        'Content Creation',
        'Code Documentation',
        'Meeting Notes'
    ];

    const goalOptions = [
        'Improve team knowledge sharing',
        'Reduce information silos',
        'Speed up onboarding',
        'Better project documentation',
        'Enhanced search capabilities',
        'Automated insights',
        'Compliance & audit trails',
        'Cross-team collaboration'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!localProfile.name.trim()) newErrors.name = 'Name is required';
        if (!localProfile.email.trim()) newErrors.email = 'Email is required';
        if (!localProfile.company.trim()) newErrors.company = 'Company is required';
        if (!localProfile.role) newErrors.role = 'Role is required';
        if (!localProfile.teamSize) newErrors.teamSize = 'Team size is required';
        if (!localProfile.useCase) newErrors.useCase = 'Use case is required';
        if (localProfile.goals.length === 0) newErrors.goals = 'Please select at least one goal';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onProfileUpdate(localProfile);
        onNext();
    };

    const handleGoalToggle = (goal: string) => {
        const updatedGoals = localProfile.goals.includes(goal)
            ? localProfile.goals.filter(g => g !== goal)
            : [...localProfile.goals, goal];

        setLocalProfile(prev => ({ ...prev, goals: updatedGoals }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Tell us about yourself
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    This helps us customize your MemorAI experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={localProfile.name}
                            onChange={(e) => setLocalProfile(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } dark:bg-gray-700 dark:text-white`}
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={localProfile.email}
                            onChange={(e) => setLocalProfile(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } dark:bg-gray-700 dark:text-white`}
                            placeholder="john@company.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company *
                    </label>
                    <input
                        type="text"
                        value={localProfile.company}
                        onChange={(e) => setLocalProfile(prev => ({ ...prev, company: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } dark:bg-gray-700 dark:text-white`}
                        placeholder="Acme Corp"
                    />
                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Role *
                        </label>
                        <select
                            value={localProfile.role}
                            onChange={(e) => setLocalProfile(prev => ({ ...prev, role: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } dark:bg-gray-700 dark:text-white`}
                        >
                            <option value="">Select your role</option>
                            {roleOptions.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Team Size *
                        </label>
                        <select
                            value={localProfile.teamSize}
                            onChange={(e) => setLocalProfile(prev => ({ ...prev, teamSize: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.teamSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } dark:bg-gray-700 dark:text-white`}
                        >
                            <option value="">Select team size</option>
                            {teamSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        {errors.teamSize && <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Use Case *
                    </label>
                    <select
                        value={localProfile.useCase}
                        onChange={(e) => setLocalProfile(prev => ({ ...prev, useCase: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.useCase ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } dark:bg-gray-700 dark:text-white`}
                    >
                        <option value="">Select primary use case</option>
                        {useCaseOptions.map(useCase => (
                            <option key={useCase} value={useCase}>{useCase}</option>
                        ))}
                    </select>
                    {errors.useCase && <p className="text-red-500 text-sm mt-1">{errors.useCase}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Your Goals (select all that apply) *
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                        {goalOptions.map(goal => (
                            <div key={goal} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`goal-${goal}`}
                                    checked={localProfile.goals.includes(goal)}
                                    onChange={() => handleGoalToggle(goal)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={`goal-${goal}`}
                                    className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    {goal}
                                </label>
                            </div>
                        ))}
                    </div>
                    {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Continue Setup →
                    </button>
                </div>
            </form>
        </div>
    );
};

// Step 3: Workspace Configuration Component
const WorkspaceStep = ({ onNext }: { onNext: () => void }) => {
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceType, setWorkspaceType] = useState('');
    const [features, setFeatures] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const workspaceTypes = [
        { id: 'personal', name: 'Personal Workspace', description: 'For individual use and personal projects' },
        { id: 'team', name: 'Team Workspace', description: 'Collaborate with your immediate team' },
        { id: 'department', name: 'Department Workspace', description: 'Share across your department or division' },
        { id: 'company', name: 'Company Workspace', description: 'Organization-wide knowledge sharing' }
    ];

    const featureOptions = [
        { id: 'ai-search', name: 'AI-Powered Search', description: 'Semantic search with natural language queries' },
        { id: 'auto-tagging', name: 'Auto-Tagging', description: 'Automatically categorize and tag memories' },
        { id: 'collaboration', name: 'Real-time Collaboration', description: 'Work together on shared memories' },
        { id: 'integrations', name: 'Tool Integrations', description: 'Connect with your existing workflow' },
        { id: 'analytics', name: 'Usage Analytics', description: 'Insights into memory usage and patterns' },
        { id: 'templates', name: 'Smart Templates', description: 'Pre-built templates for common use cases' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!workspaceName.trim()) newErrors.workspaceName = 'Workspace name is required';
        if (!workspaceType) newErrors.workspaceType = 'Please select a workspace type';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onNext();
    };

    const handleFeatureToggle = (featureId: string) => {
        setFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(f => f !== featureId)
                : [...prev, featureId]
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Configure Your Workspace
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Set up your workspace preferences and enable the features you need
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Workspace Name *
                    </label>
                    <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.workspaceName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } dark:bg-gray-700 dark:text-white`}
                        placeholder="My Team's Knowledge Base"
                    />
                    {errors.workspaceName && <p className="text-red-500 text-sm mt-1">{errors.workspaceName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Workspace Type *
                    </label>
                    <div className="space-y-3">
                        {workspaceTypes.map(type => (
                            <div key={type.id} className="relative">
                                <input
                                    type="radio"
                                    id={`workspace-${type.id}`}
                                    name="workspaceType"
                                    value={type.id}
                                    checked={workspaceType === type.id}
                                    onChange={(e) => setWorkspaceType(e.target.value)}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor={`workspace-${type.id}`}
                                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${workspaceType === type.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 flex-shrink-0 ${workspaceType === type.id
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {workspaceType === type.id && (
                                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {type.name}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {type.description}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                    {errors.workspaceType && <p className="text-red-500 text-sm mt-1">{errors.workspaceType}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Features to Enable (optional)
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                        {featureOptions.map(feature => (
                            <div key={feature.id} className="relative">
                                <input
                                    type="checkbox"
                                    id={`feature-${feature.id}`}
                                    checked={features.includes(feature.id)}
                                    onChange={() => handleFeatureToggle(feature.id)}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor={`feature-${feature.id}`}
                                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${features.includes(feature.id)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className={`w-5 h-5 border-2 rounded mr-3 flex-shrink-0 flex items-center justify-center ${features.includes(feature.id)
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {features.includes(feature.id) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {feature.name}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {feature.description}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Continue Setup →
                    </button>
                </div>
            </form>
        </div>
    );
};

// Step 4: Integrations Component
const IntegrationsStep = ({ onNext }: { onNext: () => void }) => {
    const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

    const integrations: IntegrationOption[] = [
        {
            id: 'slack',
            name: 'Slack',
            description: 'Capture and search Slack conversations',
            icon: '💬',
            category: 'Communication',
            isPopular: true,
            setupComplexity: 'easy'
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Sync with your Notion workspace',
            icon: '📝',
            category: 'Documentation',
            isPopular: true,
            setupComplexity: 'easy'
        },
        {
            id: 'github',
            name: 'GitHub',
            description: 'Index code repos and issues',
            icon: '⚡',
            category: 'Development',
            isPopular: true,
            setupComplexity: 'medium'
        },
        {
            id: 'confluence',
            name: 'Confluence',
            description: 'Import existing documentation',
            icon: '📚',
            category: 'Documentation',
            isPopular: false,
            setupComplexity: 'medium'
        },
        {
            id: 'jira',
            name: 'Jira',
            description: 'Track project requirements and tickets',
            icon: '🎯',
            category: 'Project Management',
            isPopular: false,
            setupComplexity: 'medium'
        },
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Access files and documents',
            icon: '📁',
            category: 'Storage',
            isPopular: true,
            setupComplexity: 'easy'
        },
        {
            id: 'teams',
            name: 'Microsoft Teams',
            description: 'Integrate with Teams channels and files',
            icon: '🤝',
            category: 'Communication',
            isPopular: false,
            setupComplexity: 'medium'
        },
        {
            id: 'trello',
            name: 'Trello',
            description: 'Sync boards and card information',
            icon: '📋',
            category: 'Project Management',
            isPopular: false,
            setupComplexity: 'easy'
        }
    ];

    const categories = [...new Set(integrations.map(i => i.category))];

    const handleIntegrationToggle = (integrationId: string) => {
        setSelectedIntegrations(prev =>
            prev.includes(integrationId)
                ? prev.filter(i => i !== integrationId)
                : [...prev, integrationId]
        );
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
            case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Connect Your Tools
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Choose the integrations you'd like to set up. You can add more later.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Pro tip:</strong> Start with 1-2 integrations to get familiar with MemorAI, then add more as needed.
                    </div>
                </div>
            </div>

            {categories.map(category => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {category}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        {integrations
                            .filter(integration => integration.category === category)
                            .map(integration => (
                                <div
                                    key={integration.id}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedIntegrations.includes(integration.id)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    onClick={() => handleIntegrationToggle(integration.id)}
                                >
                                    {integration.isPopular && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs px-2 py-1 rounded-full font-medium">
                                                Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start">
                                        <div className={`w-5 h-5 border-2 rounded mr-3 flex-shrink-0 flex items-center justify-center ${selectedIntegrations.includes(integration.id)
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {selectedIntegrations.includes(integration.id) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span className="text-2xl mr-2">{integration.icon}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {integration.name}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                {integration.description}
                                            </p>

                                            <div className="flex items-center">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getComplexityColor(integration.setupComplexity)}`}>
                                                    {integration.setupComplexity} setup
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            <div className="text-center mt-8">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Selected {selectedIntegrations.length} integration{selectedIntegrations.length !== 1 ? 's' : ''}
                </div>

                <button
                    onClick={onNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {selectedIntegrations.length > 0 ? 'Setup Selected Integrations' : 'Skip Integrations'} →
                </button>
            </div>
        </div>
    );
};

// Step 5: First Memory Component
const FirstMemoryStep = ({ onNext }: { onNext: () => void }) => {
    const [memory, setMemory] = useState({
        title: '',
        content: '',
        tags: [] as string[],
        category: ''
    });
    const [currentTag, setCurrentTag] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const categories = [
        'Documentation',
        'Meeting Notes',
        'Project Planning',
        'Research',
        'Best Practices',
        'Troubleshooting',
        'Ideas',
        'Resources'
    ];

    const sampleMemories = [
        {
            title: 'Team Onboarding Checklist',
            content: 'Essential steps for new team members:\n\n1. Set up development environment\n2. Access to key systems and tools\n3. Introduction to team processes\n4. Review recent project documentation\n5. Schedule 1:1s with key stakeholders',
            tags: ['onboarding', 'process', 'checklist'],
            category: 'Documentation'
        },
        {
            title: 'Weekly Team Meeting Template',
            content: 'Agenda template for weekly team meetings:\n\n- Project updates from each team member\n- Blockers and challenges discussion\n- Upcoming milestones and deadlines\n- Action items and ownership\n- Open discussion and feedback',
            tags: ['meetings', 'template', 'agenda'],
            category: 'Meeting Notes'
        },
        {
            title: 'API Integration Best Practices',
            content: 'Key considerations when integrating with external APIs:\n\n- Always handle rate limiting gracefully\n- Implement proper error handling and retries\n- Use API versioning to avoid breaking changes\n- Document all endpoints and parameters\n- Monitor API performance and availability',
            tags: ['api', 'integration', 'best-practices'],
            category: 'Best Practices'
        }
    ];

    const handleAddTag = () => {
        if (currentTag.trim() && !memory.tags.includes(currentTag.trim())) {
            setMemory(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setMemory(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleUseSample = (sample: typeof sampleMemories[0]) => {
        setMemory(sample);
    };

    const handleCreateMemory = async () => {
        if (!memory.title.trim() || !memory.content.trim()) {
            return;
        }

        setIsCreating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsCreating(false);
        onNext();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Create Your First Memory
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Let's create your first memory to get familiar with the process
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Sample memories */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Start Templates
                    </h3>

                    <div className="space-y-4">
                        {sampleMemories.map((sample, index) => (
                            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {sample.title}
                                    </h4>
                                    <button
                                        onClick={() => handleUseSample(sample)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Use This
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                                    {sample.content.substring(0, 120)}...
                                </p>

                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                                        {sample.category}
                                    </span>
                                    {sample.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-1">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Memory creation form */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Create Custom Memory
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={memory.title}
                                onChange={(e) => setMemory(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Give your memory a descriptive title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                value={memory.category}
                                onChange={(e) => setMemory(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Content *
                            </label>
                            <textarea
                                value={memory.content}
                                onChange={(e) => setMemory(prev => ({ ...prev, content: e.target.value }))}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter the content of your memory. You can use markdown formatting..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Add a tag..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            {memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {memory.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCreateMemory}
                            disabled={!memory.title.trim() || !memory.content.trim() || isCreating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                        >
                            {isCreating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Memory...
                                </>
                            ) : (
                                'Create My First Memory'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Completion Component
const CompletionStep = () => {
    const router = useRouter();

    const nextSteps = [
        {
            title: 'Explore the Dashboard',
            description: 'Get familiar with the main interface and navigation',
            action: 'Go to Dashboard',
            link: '/dashboard'
        },
        {
            title: 'Create More Memories',
            description: 'Build your knowledge base by adding more content',
            action: 'Add Memories',
            link: '/memories/new'
        },
        {
            title: 'Invite Team Members',
            description: 'Collaborate by inviting colleagues to your workspace',
            action: 'Invite Team',
            link: '/team/invite'
        },
        {
            title: 'Set Up Integrations',
            description: 'Connect your tools to automatically capture information',
            action: 'Configure Integrations',
            link: '/integrations'
        }
    ];

    return (
        <div className="text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to MemorAI!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Your workspace is set up and ready to go. Here's what you can do next:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {nextSteps.map((step, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left hover:shadow-lg transition-shadow">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            {step.description}
                        </p>
                        <Link
                            href={step.link}
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            {step.action}
                        </Link>
                    </div>
                ))}
            </div>

            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    🎯 Pro Tips for Success
                </h3>
                <ul className="text-left text-green-800 dark:text-green-200 space-y-2 text-sm">
                    <li>• Start by capturing information you reference frequently</li>
                    <li>• Use descriptive titles and tags to make memories easy to find</li>
                    <li>• Take advantage of AI search by asking questions naturally</li>
                    <li>• Set up integrations gradually - start with your most-used tools</li>
                    <li>• Encourage team participation by sharing useful memories</li>
                </ul>
            </div>

            <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Go to Dashboard
            </button>
        </div>
    );
};

// Main Component
export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        company: '',
        role: '',
        teamSize: '',
        useCase: '',
        goals: []
    });

    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Welcome',
            description: 'Get started with MemorAI',
            component: WelcomeStep,
            isComplete: false,
            isRequired: true
        },
        {
            id: 'profile',
            title: 'Profile Setup',
            description: 'Tell us about yourself',
            component: ProfileStep,
            isComplete: false,
            isRequired: true
        },
        {
            id: 'workspace',
            title: 'Workspace',
            description: 'Configure your workspace',
            component: WorkspaceStep,
            isComplete: false,
            isRequired: true
        },
        {
            id: 'integrations',
            title: 'Integrations',
            description: 'Connect your tools',
            component: IntegrationsStep,
            isComplete: false,
            isRequired: false
        },
        {
            id: 'first-memory',
            title: 'First Memory',
            description: 'Create your first memory',
            component: FirstMemoryStep,
            isComplete: false,
            isRequired: true
        },
        {
            id: 'complete',
            title: 'Complete',
            description: 'You\'re all set!',
            component: CompletionStep,
            isComplete: false,
            isRequired: true
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Progress bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Step {currentStep + 1} of {steps.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-2">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`text-xs ${index <= currentStep
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                >
                                    {step.title}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <CurrentStepComponent
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    profile={profile}
                    onProfileUpdate={setProfile}
                />

                {/* Navigation */}
                {currentStep > 0 && currentStep < steps.length - 1 && (
                    <div className="flex justify-between mt-12">
                        <button
                            onClick={handlePrevious}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-4 py-2"
                        >
                            ← Previous
                        </button>

                        <button
                            onClick={handleNext}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2"
                        >
                            Skip Step →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

