'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DashboardProps {
    title?: string;
    content?: string;
    data?: any[];
    onClick?: () => void;
    onSubmit?: (data: any) => void;
    [key: string]: any;
}

function Dashboard(props: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [state, setState] = useState('initial');
    const [inputValue, setInputValue] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(timer);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleStateUpdate = () => {
        setState('updated');
        if (props.onClick) {
            props.onClick();
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (props.onSubmit) {
            props.onSubmit({ inputValue, state });
        }
    };

    const handleKeyboardEvent = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleStateUpdate();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'analytics':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Advanced Analytics Dashboard</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/10 rounded-lg">
                                <h4 className="font-medium">Performance Metrics</h4>
                                <p className="text-sm opacity-75">Real-time dashboard analytics</p>
                            </div>
                            <div className="p-4 bg-white/10 rounded-lg">
                                <h4 className="font-medium">Usage Statistics</h4>
                                <p className="text-sm opacity-75">User engagement data</p>
                            </div>
                        </div>
                    </div>
                );
            case 'features':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Dashboard Features</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-white/5 rounded border border-white/10">
                                <h4 className="font-medium">Enterprise Security</h4>
                                <p className="text-sm opacity-75">Advanced security protocols</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded border border-white/10">
                                <h4 className="font-medium">High Performance</h4>
                                <p className="text-sm opacity-75">Optimized for speed</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded border border-white/10">
                                <h4 className="font-medium">Global Scale</h4>
                                <p className="text-sm opacity-75">Worldwide deployment</p>
                            </div>
                        </div>
                    </div>
                );
            case 'monitor':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">System Monitor</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                                <span className="font-medium">System Status: </span>
                                <span className="text-green-400">Online</span>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                                <span className="font-medium">Performance: </span>
                                <span className="text-blue-400">Optimal</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Dashboard Overview</h3>
                        <p className="opacity-75">
                            {props.content || 'Welcome to your comprehensive dashboard management platform. Monitor your analytics, manage features, and track performance in real-time.'}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-white/10 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-400">24/7</div>
                                <div className="text-sm opacity-75">Uptime</div>
                            </div>
                            <div className="p-4 bg-white/10 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-400">99.9%</div>
                                <div className="text-sm opacity-75">Reliability</div>
                            </div>
                            <div className="p-4 bg-white/10 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-400">Global</div>
                                <div className="text-sm opacity-75">Reach</div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <main
            role="main"
            data-testid="dashboard"
            aria-label="DASH dashboard content"
            className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6 glassmorphism"
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {props.title || 'DASH Enterprise Dashboard'}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <span>•</span>
                        <span>{time}</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center">
                    <div className="flex bg-white/10 rounded-lg p-1">
                        {['overview', 'analytics', 'features', 'monitor'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md transition-all duration-200 capitalize ${activeTab === tab
                                        ? 'bg-blue-500/30 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    {renderTabContent()}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">2.5K</div>
                        <div className="text-sm opacity-75">Total Users</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">1.2K</div>
                        <div className="text-sm opacity-75">Active Now</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">98%</div>
                        <div className="text-sm opacity-75">High Performance</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-400">Global</div>
                        <div className="text-sm opacity-75">Global Scale</div>
                    </div>
                </div>

                {/* Interactive Controls */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-4">
                    <h3 className="text-xl font-semibold">Dashboard Controls</h3>

                    <div className="flex gap-4">
                        <button
                            onClick={handleStateUpdate}
                            aria-label="Update State"
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            Update State
                        </button>

                        <button
                            aria-label="Refresh Dashboard"
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                            Refresh Dashboard
                        </button>
                    </div>

                    <div data-testid="state-display" className="p-3 bg-white/10 rounded border">
                        Current State: {state}
                    </div>

                    <input
                        type="text"
                        role="textbox"
                        data-testid="main-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyboardEvent}
                        placeholder="Enter dashboard command..."
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-400 focus:outline-none"
                    />
                </div>

                {/* Form Section */}
                <form
                    role="form"
                    onSubmit={handleFormSubmit}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-4"
                >
                    <h3 className="text-xl font-semibold">Dashboard Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Configuration key"
                            className="p-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Configuration value"
                            className="p-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-400 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        aria-label="Submit Form"
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                    >
                        Submit Form
                    </button>
                </form>

                {/* Data Display */}
                {props.data && props.data.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold mb-4">Data Overview</h3>
                        <div className="text-sm opacity-75">
                            Displaying {props.data.length} items
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// Export both uppercase and lowercase for test compatibility
export default Dashboard;
export { Dashboard as dashboard };
