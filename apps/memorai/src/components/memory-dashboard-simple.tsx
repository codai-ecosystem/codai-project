'use client';

import { useState } from 'react';

export default function MemoryDashboard() {
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    🧠 MemorAI
                                </h1>
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                    Your Personal Memory Assistant
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                            >
                                <span className="hidden sm:inline">+ New Memory</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            🧠
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            MemorAI Dashboard
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Your personal memory assistant is being optimized for production deployment.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create Your First Memory
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
