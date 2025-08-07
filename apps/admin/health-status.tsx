import React from 'react'
/**
 * 🏥 HealthStatus Component
 * Enterprise health monitoring dashboard for ADMIN platform
 */

'use client';

import { useState, useEffect } from 'react';

interface HealthStatusProps {
    title?: string | null;
    content?: string | null;
    onClick?: () => void;
    onSubmit?: () => void;
    data?: Array<{ id: number; name: string }>;
}

export default function HealthStatus({
    title = 'System Health Status',
    content = 'All systems operational',
    onClick,
    onSubmit,
    data = []
}: HealthStatusProps) {
    const [status, setStatus] = useState('healthy');
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = () => {
        setStatus(prevStatus => prevStatus === 'healthy' ? 'updated' : 'healthy');
        setLastUpdate(new Date());
        onClick?.();
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.();
    };

    return (
        <main
            role="main"
            aria-label="Health Status Dashboard"
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8"
            data-testid="health-status"
        >
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {title || 'System Health Status'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {content || 'All systems operational'}
                    </p>
                </header>

                {/* Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Main Status Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Overall Status</h3>
                                <p className="text-2xl font-bold text-green-600 capitalize">
                                    {status}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Last Update Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Last Update</h3>
                                <p className="text-sm text-gray-600">
                                    {lastUpdate.toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">⟳</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Count Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Data Points</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {data.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-bold">#</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Controls */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">System Controls</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Update Button */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Status Management</h3>
                            <button
                                onClick={handleStatusUpdate}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-4 focus:ring-blue-300"
                                aria-label="Update system status"
                            >
                                Update Status
                            </button>
                            <div data-testid="state-display" className="text-sm text-gray-600">
                                Expected state: {status}
                            </div>
                        </div>

                        {/* Input Controls */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">System Input</h3>
                            <form onSubmit={handleFormSubmit} role="form" className="space-y-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Enter system command..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    role="textbox"
                                    aria-label="System command input"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-4 focus:ring-green-300"
                                    aria-label="Submit system command"
                                >
                                    Submit Command
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Data Display */}
                {data.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Data</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {data.slice(0, 12).map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow duration-200"
                                >
                                    <p className="font-semibold text-gray-900">#{item.id}</p>
                                    <p className="text-sm text-gray-600">{item.name}</p>
                                </div>
                            ))}
                            {data.length > 12 && (
                                <div className="bg-gray-100 rounded-lg p-4 border flex items-center justify-center">
                                    <p className="text-gray-600 font-medium">
                                        +{data.length - 12} more
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Status Bar */}
                <footer className="mt-8 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">
                            System online - Last check: {lastUpdate.toLocaleString()}
                        </span>
                    </div>
                </footer>
            </div>
        </main>
    );
}

// Export with lowercase alias for test compatibility
export { HealthStatus as healthStatus };

