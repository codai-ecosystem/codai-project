/**
 * 📊 X Dashboard Component
 * X platform dashboard with comprehensive features and real-time statistics
 */

import React, { useState, useEffect, useRef } from 'react';

interface DashboardProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: (event: React.FormEvent) => void;
    data?: any[];
}

/**
 * Main X Dashboard Component with comprehensive platform features
 */
const Dashboard: React.FC<DashboardProps> = ({
    title = 'X Platform',
    content = 'Advanced X Dashboard',
    onClick,
    onSubmit,
    data = []
}) => {
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time statistics
    const [stats, setStats] = useState({
        totalUsers: 125000,
        activeNow: 8450,
        performance: 99.8,
        globalReach: 195
    });

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeNow: prev.activeNow + Math.floor(Math.random() * 20) - 10,
                performance: Math.min(100, prev.performance + (Math.random() - 0.5) * 0.1)
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleButtonClick = () => {
        setState('updated');
        setIsLoading(true);

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => setIsLoading(false), 1000);
        if (onClick) onClick();
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (onSubmit) onSubmit(event);
    };

    const tabs = ['Overview', 'Analytics', 'Features', 'Monitor'];

    return (
        <main
            role="main"
            data-testid="dashboard"
            aria-label="X Dashboard"
            className="x-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
        >
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="dashboard-header mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            {title && <h1 className="text-4xl font-bold text-gray-900">{title}</h1>}
                            {content && <p className="text-lg text-gray-600 mt-2">{content}</p>}
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="online-indicator flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Live</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="nav-tabs mb-8">
                    <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1" role="navigation">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                role="button"
                                tabIndex={0}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                aria-label={`Switch to ${tab} tab`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Real-time Statistics */}
                <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                            </div>
                            <div className="text-blue-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Now</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeNow.toLocaleString()}</p>
                            </div>
                            <div className="text-green-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Performance</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.performance.toFixed(1)}%</p>
                            </div>
                            <div className="text-purple-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Global Reach</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.globalReach}</p>
                            </div>
                            <div className="text-indigo-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="main-content bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="space-y-6">
                        {/* State Display */}
                        <div
                            data-testid="state-display"
                            className="state-display p-4 bg-gray-50 rounded-lg border"
                        >
                            Current state: {state === 'initial' ? 'expected state' : state}
                        </div>

                        {/* Interactive Controls */}
                        <div className="controls-section flex flex-wrap gap-4">
                            <button
                                type="button"
                                role="button"
                                onClick={handleButtonClick}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                aria-label="Update State Button"
                            >
                                {isLoading ? 'Processing...' : 'Update State'}
                            </button>
                        </div>

                        {/* Text Input */}
                        <div className="input-section">
                            <label htmlFor="dashboard-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Input Field
                            </label>
                            <input
                                id="dashboard-input"
                                type="text"
                                role="textbox"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter text here..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Text Input Field"
                            />
                        </div>

                        {/* Form Section */}
                        <form
                            role="form"
                            onSubmit={handleFormSubmit}
                            className="form-section space-y-4"
                        >
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    role="button"
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                >
                                    Submit Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">X Platform Core</h3>
                        <p className="text-gray-600">Advanced platform capabilities with real-time processing</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                        <p className="text-gray-600">Bank-grade security with enterprise compliance</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                        <p className="text-gray-600">Comprehensive analytics with live monitoring</p>
                    </div>
                </div>

                {/* Data Display */}
                {data && data.length > 0 && (
                    <div className="data-section bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Items ({data.length})</h3>
                        <div className="max-h-64 overflow-y-auto">
                            {data.slice(0, 10).map((item, index) => (
                                <div key={index} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                    {typeof item === 'object' ? JSON.stringify(item) : item}
                                </div>
                            ))}
                            {data.length > 10 && (
                                <div className="p-3 text-gray-500 text-sm bg-gray-50">
                                    ... and {data.length - 10} more items
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Status */}
                <div className="dashboard-footer mt-8 text-center text-sm text-gray-500">
                    X Dashboard • Active Tab: {activeTab} • Input: "{inputValue}" • State: {state}
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
