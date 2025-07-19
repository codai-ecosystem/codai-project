'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BadgeProps {
    title?: string | null;
    content?: string | null;
    data?: any;
    onClick?: () => void;
    onSubmit?: () => void;
}

function Badge({ title, content, data, onClick, onSubmit }: BadgeProps) {
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState('Badge');
    const [stats, setStats] = useState({
        interactions: 0,
        engagement: 95,
        performance: 87,
        satisfaction: 92
    });
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                interactions: prev.interactions + Math.floor(Math.random() * 3),
                engagement: Math.min(100, prev.engagement + Math.floor(Math.random() * 2)),
                performance: Math.max(80, prev.performance + Math.floor(Math.random() * 3) - 1),
                satisfaction: Math.min(100, prev.satisfaction + Math.floor(Math.random() * 2))
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleClick = () => {
        setState('updated');
        if (onClick) onClick();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setState('updated 2');
        if (onSubmit) onSubmit();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setState('updated');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Badge':
                return (
                    <div className="space-y-4">
                        <div className="bg-purple-500/20 backdrop-blur-md rounded-lg p-4 border border-purple-300/20">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">AI</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                                        {title || 'AjutAI Badge System'}
                                    </h3>
                                    <p className="text-purple-700 dark:text-purple-300">Interactive badge management platform</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Design':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Badge Design Tools</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100">Templates</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300">50+ designs</p>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100">Colors</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300">Custom palette</p>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100">Shapes</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300">Multiple styles</p>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100">Icons</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300">1000+ icons</p>
                            </div>
                        </div>
                    </div>
                );
            case 'Content':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Content Management</h3>
                        <div className="space-y-3">
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <p className="text-purple-900 dark:text-purple-100">{content || 'Badge content management and editing tools'}</p>
                            </div>
                            {content && (
                                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                    <p className="text-purple-700 dark:text-purple-300">Content: {content}</p>
                                </div>
                            )}
                            {data && (
                                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                    <p className="text-sm text-purple-700 dark:text-purple-300">Data: {Array.isArray(data) ? `${data.length} items` : typeof data}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Analytics':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Badge Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.interactions}</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Interactions</div>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.engagement}%</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Engagement</div>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.performance}%</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Performance</div>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-300/20">
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.satisfaction}%</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div role="main" data-testid="badge" aria-label="AjutAI badge component" className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-purple-100/50 dark:bg-purple-900/20 p-1 rounded-lg">
                    {['Badge', 'Design', 'Content', 'Analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md transition-all duration-200 ${activeTab === tab
                                    ? 'bg-purple-500/30 text-purple-900 dark:text-purple-100'
                                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-200/30'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                    {renderTabContent()}
                </div>

                {/* Interactive Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-lg p-6 border border-purple-300/20">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Badge Controls</h3>
                        <div className="space-y-4">
                            <button
                                onClick={handleClick}
                                aria-label="Update state"
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                            >
                                Update State
                            </button>
                            <button
                                aria-label="Submit form"
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                            >
                                Action Button
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-lg p-6 border border-purple-300/20">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">State Display</h3>
                        <div className="space-y-4">
                            <div data-testid="state-display" className="p-3 bg-purple-100 dark:bg-purple-800 rounded text-purple-900 dark:text-purple-100">
                                Current state: {state}
                            </div>
                            <input
                                type="text"
                                role="textbox"
                                data-testid="main-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter text here..."
                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-lg p-6 border border-purple-300/20">
                    <form role="form" onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Badge Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Badge title..."
                                className="px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                                type="text"
                                placeholder="Badge description..."
                                className="px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <button
                            type="submit"
                            aria-label="Submit form"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        >
                            Submit Form
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Export with uppercase name for React and lowercase alias for test compatibility
export default Badge;
export { Badge as badge };
