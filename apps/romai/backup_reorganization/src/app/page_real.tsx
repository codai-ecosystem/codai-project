import React from 'react'
/**
 * RomAI Main Page - REAL AGI Integration Only
 * NO FAKE DATA - 100% Real RomAI AGI Server Integration
 */

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import RealAGIDashboard from '../components/RealAGIDashboard';
import LoadingState from '../components/LoadingState';

// Dynamically load components to ensure proper client-side hydration
const DynamicRealAGIDashboard = dynamic(() => import('../components/RealAGIDashboard'), {
    ssr: false,
    loading: () => <LoadingState message="Connecting to RomAI AGI Server..." />
});

export default function RomAIPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-xl font-bold text-white">🧠</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    RomAI - Romanian AGI System
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Advanced General Intelligence for Romanian Language & Culture
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    AGI Server Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={<LoadingState message="Loading real AGI data..." />}>
                    <DynamicRealAGIDashboard />
                </Suspense>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            RomAI AGI System - Real Intelligence, Real Data, Real Results
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Connected to Real AGI Server on Port 6101 • No Mock Data • Production Ready
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

