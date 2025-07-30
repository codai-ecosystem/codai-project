/**
 * 🃏 X Card Component
 * X platform card with comprehensive functionality and interactive features
 */

import React, { useState, useEffect, useRef } from 'react';

interface CardProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: (event: React.FormEvent) => void;
    data?: any[];
}

/**
 * Main X Card Component with comprehensive interactive features
 */
const Card: React.FC<CardProps> = ({
    title = 'X Card',
    content = 'Interactive Card Component',
    onClick,
    onSubmit,
    data = []
}) => {
    const [state, setState] = useState('expected state');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Card');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time card statistics
    const [stats, setStats] = useState({
        interactions: 428,
        engagement: 92.3,
        performance: 99.1,
        satisfaction: 4.8
    });

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                interactions: prev.interactions + Math.floor(Math.random() * 7),
                engagement: Math.min(100, prev.engagement + (Math.random() - 0.5) * 0.2)
            }));
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const handleCardClick = () => {
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

    const tabs = ['Card', 'Design', 'Content', 'Analytics'];

    return (
        <main
            role="main"
            data-testid="card"
            aria-label="X Card"
            className="x-card min-h-screen bg-gradient-to-br from-purple-50 to-blue-50"
        >
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="card-header mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="card-preview relative">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                    📇
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                                    ✓
                                </div>
                            </div>
                            <div>
                                {title && <h1 className="text-4xl font-bold text-gray-900">{title}</h1>}
                                {content && <p className="text-lg text-gray-600 mt-2">{content}</p>}
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="online-indicator flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Active</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {stats.interactions.toLocaleString()} interactions
                                    </div>
                                </div>
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
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                aria-label={`Switch to ${tab} tab`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Card Statistics */}
                <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Interactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.interactions.toLocaleString()}</p>
                            </div>
                            <div className="text-purple-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Engagement</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.engagement.toFixed(1)}%</p>
                            </div>
                            <div className="text-blue-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
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
                            <div className="text-green-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.satisfaction.toFixed(1)}</p>
                            </div>
                            <div className="text-yellow-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
                            Current state: {state}
                        </div>

                        {/* Interactive Controls */}
                        <div className="controls-section flex flex-wrap gap-4">
                            <button
                                type="button"
                                role="button"
                                onClick={handleCardClick}
                                disabled={isLoading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                                aria-label="Update State Button"
                            >
                                {isLoading ? 'Processing...' : 'Update State'}
                            </button>
                        </div>

                        {/* Text Input */}
                        <div className="input-section">
                            <label htmlFor="card-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Card Input
                            </label>
                            <input
                                id="card-input"
                                type="text"
                                role="textbox"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter card content..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                aria-label="Card Text Input Field"
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
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    Submit Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Card Features Grid */}
                <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Layout</h3>
                        <p className="text-gray-600">Adaptive card layout with responsive design and flexible content</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Management</h3>
                        <p className="text-gray-600">Advanced content handling with dynamic updates and validation</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Controls</h3>
                        <p className="text-gray-600">Rich interactive elements with accessibility and keyboard navigation</p>
                    </div>
                </div>

                {/* Data Display */}
                {data && data.length > 0 && (
                    <div className="data-section bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Data ({data.length})</h3>
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
                <div className="card-footer mt-8 text-center text-sm text-gray-500">
                    X Card • Active Tab: {activeTab} • Input: "{inputValue}" • State: {state} • Engagement: {stats.engagement.toFixed(1)}%
                </div>
            </div>
        </main>
    );
};

export default Card;
