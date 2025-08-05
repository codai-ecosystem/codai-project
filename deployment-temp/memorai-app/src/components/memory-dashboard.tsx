'use client';

import { useState } from 'react';

export default function MemoryDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🧠</div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        MemorAI Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your AI-powered memory management platform
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Smart Storage
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300">
                                Organize your memories with AI-powered categorization
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                                Intelligent Search
                            </h3>
                            <p className="text-green-700 dark:text-green-300">
                                Find information instantly with semantic search
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                Memory Insights
                            </h3>
                            <p className="text-purple-700 dark:text-purple-300">
                                Discover patterns and connections in your knowledge
                            </p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            Start Managing Memories
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
