'use client';

import React, { useState } from 'react';
import {
    RefreshCw,
    Download,
    Upload,
    Settings,
    Filter,
    Search,
    Plus
} from 'lucide-react';
import { CodeReviewOverview } from './components/CodeReviewOverview';
import { PullRequestsTab } from './components/PullRequestsTab';
import { ReviewersTab } from './components/ReviewersTab';
import { ReviewRulesTab } from './components/ReviewRulesTab';
import { ReviewMetricsTab } from './components/ReviewMetricsTab';

export default function CodeReviewPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const tabs = [
        { id: 'overview', name: 'Overview', count: null },
        { id: 'pull-requests', name: 'Pull Requests', count: 24 },
        { id: 'reviewers', name: 'Reviewers', count: 12 },
        { id: 'rules', name: 'Review Rules', count: 8 },
        { id: 'metrics', name: 'Metrics', count: null }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <CodeReviewOverview />;
            case 'pull-requests':
                return <PullRequestsTab />;
            case 'reviewers':
                return <ReviewersTab />;
            case 'rules':
                return <ReviewRulesTab />;
            case 'metrics':
                return <ReviewMetricsTab />;
            default:
                return <CodeReviewOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Code Review</h1>
                            <p className="mt-2 text-gray-600">
                                Manage code reviews, pull requests, and review processes
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="auto-refresh"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="auto-refresh" className="text-sm text-gray-700">
                                    Auto-refresh
                                </label>
                            </div>

                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Export Reviews
                            </button>

                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Upload className="w-4 h-4 mr-2" />
                                Import Rules
                            </button>

                            <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Review
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.name}
                                    {tab.count !== null && (
                                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </div>
    );
}
