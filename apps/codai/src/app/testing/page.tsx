'use client';

import React, { useState } from 'react';
import {
    TestTube,
    Play,
    Square,
    RotateCcw,
    Download,
    Upload,
    Settings,
    Plus,
    Filter,
    Search,
    Clock,
    Activity
} from 'lucide-react';

// Import modular components
import { TestingSuiteOverview } from './components/TestingSuiteOverview';
import { TestCasesTab } from './components/TestCasesTab';
import { TestExecutionTab } from './components/TestExecutionTab';
import { TestReportsTab } from './components/TestReportsTab';
import { TestEnvironmentsTab } from './components/TestEnvironmentsTab';

export default function TestingSuitePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: Activity },
        { id: 'test-cases', name: 'Test Cases', icon: TestTube },
        { id: 'execution', name: 'Test Execution', icon: Play },
        { id: 'reports', name: 'Test Reports', icon: Download },
        { id: 'environments', name: 'Test Environments', icon: Settings }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <TestingSuiteOverview />;
            case 'test-cases':
                return <TestCasesTab />;
            case 'execution':
                return <TestExecutionTab />;
            case 'reports':
                return <TestReportsTab />;
            case 'environments':
                return <TestEnvironmentsTab />;
            default:
                return <TestingSuiteOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TestTube className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Testing Suite</h1>
                                <p className="text-gray-600">Comprehensive automated testing platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Auto-refresh</span>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Upload className="w-4 h-4 mr-2" />
                                Import Tests
                            </button>

                            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Export Results
                            </button>

                            <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Test Suite
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6">
                        <nav className="flex space-x-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {renderContent()}
            </div>
        </div>
    );
}
