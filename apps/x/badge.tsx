'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BadgeProps {
    title?: string | null;
    content?: string | null | undefined;
    data?: any[];
    onClick?: () => void;
    onSubmit?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
    title,
    content,
    data,
    onClick,
    onSubmit
}) => {
    const [activeTab, setActiveTab] = useState('badge');
    const [state, setState] = useState('initial');
    const [textValue, setTextValue] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleUpdateState = () => {
        setState(prev => prev === 'initial' ? 'updated 1' : 'updated 2');
        if (onClick) {
            onClick();
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            handleUpdateState();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'badge':
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                            <h3 className="text-lg font-semibold mb-2">Badge Preview</h3>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Online Status</span>
                            </div>
                            {title && <p className="mt-2 font-medium">{title}</p>}
                            {content && <p className="mt-1 text-sm opacity-90">{content}</p>}
                        </div>
                    </div>
                );
            case 'design':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <span className="text-purple-800 font-medium">Primary Color</span>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-lg">
                                <span className="text-pink-800 font-medium">Accent Color</span>
                            </div>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Content Management</h4>
                            <p className="text-sm text-gray-600">Manage badge content and display options</p>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">1,234</div>
                                <div className="text-sm text-blue-500">Badge Views</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">98.5%</div>
                                <div className="text-sm text-green-500">Performance</div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main
            role="main"
            data-testid="badge"
            className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6"
            aria-label="X Badge Component"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        X Badge Component
                    </h1>
                    <p className="text-gray-600">Advanced badge system with dynamic content and interactive controls</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {['badge', 'design', 'content', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-full font-medium transition-all ${activeTab === tab
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Real-time Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600 mb-2">5,847</div>
                        <div className="text-sm text-gray-600">Interactions</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-pink-100">
                        <div className="text-2xl font-bold text-pink-600 mb-2">92.4%</div>
                        <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600 mb-2">99.1%</div>
                        <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-pink-100">
                        <div className="text-2xl font-bold text-pink-600 mb-2">4.8/5</div>
                        <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 mb-8">
                    {renderTabContent()}
                </div>

                {/* Interactive Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Badge Controls</h3>
                        <div className="space-y-4">
                            <button
                                onClick={handleUpdateState}
                                aria-label="update state"
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                Update State
                            </button>
                            <button
                                onClick={onClick}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
                            >
                                Badge Action
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Form Handling</h3>
                        <form role="form" onSubmit={handleFormSubmit} className="space-y-4">
                            <input
                                type="text"
                                role="textbox"
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter badge text..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                aria-label="submit form"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                Submit Form
                            </button>
                        </form>
                    </div>
                </div>

                {/* State Display */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Current State</h3>
                    <div data-testid="state-display" className="text-purple-600 font-medium">
                        {state}
                    </div>
                    {data && (
                        <div className="mt-4 text-sm text-gray-600">
                            Data items: {data.length}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

// Export lowercase for test compatibility
const badge = Badge;
export default badge;
