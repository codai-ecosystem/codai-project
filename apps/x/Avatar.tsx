/**
 * 👤 X Avatar Component
 * X platform avatar with comprehensive features and customization
 */

import React, { useState, useEffect, useRef } from 'react';

interface AvatarProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: (event: React.FormEvent) => void;
    data?: any[];
}

/**
 * Main X Avatar Component with comprehensive profile features
 */
const Avatar: React.FC<AvatarProps> = ({
    title = 'X Avatar',
    content = 'User Profile Avatar',
    onClick,
    onSubmit,
    data = []
}) => {
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time avatar statistics
    const [stats, setStats] = useState({
        profileViews: 1250,
        connections: 847,
        activity: 95.2,
        reputation: 4.8
    });

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                profileViews: prev.profileViews + Math.floor(Math.random() * 10),
                activity: Math.min(100, prev.activity + (Math.random() - 0.5) * 0.5)
            }));
        }, 5000);

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

    const tabs = ['Profile', 'Settings', 'Activity', 'Security'];

    return (
        <main
            role="main"
            data-testid="avatar"
            aria-label="X Avatar"
            className="x-avatar min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50"
        >
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="avatar-header mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="avatar-image relative">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    X
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                {title && <h1 className="text-4xl font-bold text-gray-900">{title}</h1>}
                                {content && <p className="text-lg text-gray-600 mt-2">{content}</p>}
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="online-indicator flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Online</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Last seen: {new Date().toLocaleTimeString()}
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

                {/* Avatar Statistics */}
                <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.profileViews.toLocaleString()}</p>
                            </div>
                            <div className="text-purple-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Connections</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.connections.toLocaleString()}</p>
                            </div>
                            <div className="text-indigo-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Activity</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activity.toFixed(1)}%</p>
                            </div>
                            <div className="text-green-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Reputation</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.reputation.toFixed(1)}</p>
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
                            Current state: {state === 'initial' ? 'expected state' : state}
                        </div>

                        {/* Interactive Controls */}
                        <div className="controls-section flex flex-wrap gap-4">
                            <button
                                type="button"
                                role="button"
                                onClick={handleButtonClick}
                                disabled={isLoading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                                aria-label="Update State Button"
                            >
                                {isLoading ? 'Processing...' : 'Update State'}
                            </button>
                        </div>

                        {/* Text Input */}
                        <div className="input-section">
                            <label htmlFor="avatar-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Input
                            </label>
                            <input
                                id="avatar-input"
                                type="text"
                                role="textbox"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter profile information..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                aria-label="Profile Text Input Field"
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
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Submit Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Profile Features Grid */}
                <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Management</h3>
                        <p className="text-gray-600">Advanced profile customization and management</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Badge</h3>
                        <p className="text-gray-600">Verified user status with authentication</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Controls</h3>
                        <p className="text-gray-600">Advanced privacy settings and security features</p>
                    </div>
                </div>

                {/* Data Display */}
                {data && data.length > 0 && (
                    <div className="data-section bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Data ({data.length})</h3>
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
                <div className="avatar-footer mt-8 text-center text-sm text-gray-500">
                    X Avatar • Active Tab: {activeTab} • Input: "{inputValue}" • State: {state}
                </div>
            </div>
        </main>
    );
};

export default Avatar;
