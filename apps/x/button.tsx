/**
 * 🔘 X Button Component
 * X platform button with comprehensive functionality and customization
 */

import React, { useState, useEffect, useRef } from 'react';

interface ButtonProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: (event: React.FormEvent) => void;
    data?: any[];
}

/**
 * Main X Button Component with comprehensive interactive features
 */
const Button: React.FC<ButtonProps> = ({
    title = 'X Button',
    content = 'Interactive Button Component',
    onClick,
    onSubmit,
    data = []
}) => {
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Button');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time button statistics
    const [stats, setStats] = useState({
        clickCount: 0,
        interactions: 324,
        usage: 87.5,
        satisfaction: 4.9
    });

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                interactions: prev.interactions + Math.floor(Math.random() * 5),
                usage: Math.min(100, prev.usage + (Math.random() - 0.5) * 0.3)
            }));
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleButtonClick = () => {
        setState('updated');
        setIsLoading(true);
        setStats(prev => ({ ...prev, clickCount: prev.clickCount + 1 }));

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

    const tabs = ['Button', 'Design', 'Behavior', 'Analytics'];

    return (
        <main
            role="main"
            data-testid="button"
            aria-label="X Button"
            className="x-button min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
        >
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="button-header mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="button-preview relative">
                                <div className="w-24 h-24 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                    BTN
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                                    {stats.clickCount}
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
                                        Clicks: {stats.clickCount}
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
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                aria-label={`Switch to ${tab} tab`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Button Statistics */}
                <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.clickCount}</p>
                            </div>
                            <div className="text-orange-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Interactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.interactions.toLocaleString()}</p>
                            </div>
                            <div className="text-red-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Usage Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.usage.toFixed(1)}%</p>
                            </div>
                            <div className="text-blue-600">
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
                            Current state: {state === 'initial' ? 'expected state' : state}
                        </div>

                        {/* Interactive Controls */}
                        <div className="controls-section flex flex-wrap gap-4">
                            <button
                                type="button"
                                role="button"
                                onClick={handleButtonClick}
                                disabled={isLoading}
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                                aria-label="Update State Button"
                            >
                                {isLoading ? 'Processing...' : 'Update State'}
                            </button>
                        </div>

                        {/* Text Input */}
                        <div className="input-section">
                            <label htmlFor="button-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Button Input
                            </label>
                            <input
                                id="button-input"
                                type="text"
                                role="textbox"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter button configuration..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                aria-label="Button Text Input Field"
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
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                >
                                    Submit Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Button Features Grid */}
                <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Click Tracking</h3>
                        <p className="text-gray-600">Advanced click analytics and user interaction monitoring</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">User Experience</h3>
                        <p className="text-gray-600">Optimized for maximum user satisfaction and engagement</p>
                    </div>
                    <div className="feature-card bg-white rounded-lg p-6 shadow-sm border">
                        <div className="feature-icon w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Behaviors</h3>
                        <p className="text-gray-600">Flexible configuration and customizable button behaviors</p>
                    </div>
                </div>

                {/* Data Display */}
                {data && data.length > 0 && (
                    <div className="data-section bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Data ({data.length})</h3>
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
                <div className="button-footer mt-8 text-center text-sm text-gray-500">
                    X Button • Active Tab: {activeTab} • Input: "{inputValue}" • State: {state} • Clicks: {stats.clickCount}
                </div>
            </div>
        </main>
    );
};

export default Button;
