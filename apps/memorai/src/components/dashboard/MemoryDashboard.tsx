/**
 * MemorAI Main Dashboard
 * Optimized following Microsoft React best practices:
 * - React.memo for performance optimization
 * - useMemo and useCallback for memoization
 * - Dynamic imports for code splitting
 * - Proper TypeScript interfaces
 */
'use client';

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';
// Standard lucide-react import - optimized by Next.js experimental.optimizePackageImports
import { Plus, Brain, Activity, Search } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import AISearchInterface from '../AISearchInterface';

// Dynamic imports for performance - Microsoft best practice for code splitting
const MemoryAnalytics = dynamic(() => import('./MemoryAnalytics'), {
    loading: () => <div className="flex items-center justify-center h-64" role="status" aria-label="Loading analytics">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading analytics...</span>
    </div>
});

const AIInsights = dynamic(() => import('./AIInsights'), {
    loading: () => <div className="flex items-center justify-center h-64" role="status" aria-label="Loading AI insights">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading AI insights...</span>
    </div>
});

const MemoryManagement = dynamic(() => import('./MemoryManagement'), {
    loading: () => <div className="flex items-center justify-center h-64" role="status" aria-label="Loading memory management">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading memory management...</span>
    </div>
});

interface MemoryStats {
    totalMemories: number;
    recentMemories: number;
    favorites: number;
    connections: number;
}

/**
 * MemoryDashboard - Main dashboard component with memoization
 * Following Microsoft's React performance patterns
 */
const MemoryDashboard = memo(() => {
    const [stats, setStats] = useState<MemoryStats>({
        totalMemories: 0,
        recentMemories: 0,
        favorites: 0,
        connections: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Memoized callback for loading dashboard data
    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            // Simulate API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock data - replace with actual API data
            setStats({
                totalMemories: 1247,
                recentMemories: 23,
                favorites: 156,
                connections: 89
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Memoized stats cards to prevent unnecessary re-renders
    const statsCards = useMemo(() => [
        {
            title: 'Total Memories',
            value: stats.totalMemories.toLocaleString('en-US'),
            icon: Brain,
            color: 'text-blue-600'
        },
        {
            title: 'Recent',
            value: stats.recentMemories.toLocaleString('en-US'),
            icon: Activity,
            color: 'text-green-600'
        },
        {
            title: 'Favorites',
            value: stats.favorites.toLocaleString('en-US'),
            icon: Plus,
            color: 'text-yellow-600'
        },
        {
            title: 'Connections',
            value: stats.connections.toLocaleString('en-US'),
            icon: Search,
            color: 'text-purple-600'
        }
    ], [stats]);

    // Memoized result select handler
    const handleResultSelect = useCallback((result: any) => {
        console.log('Selected result:', result);
        // Handle result selection
    }, []);

    return (
        <DashboardLayout
            title="Memory Dashboard"
            subtitle="Manage and explore your AI-powered memory collection"
        >
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={stat.title}
                                className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {isLoading ? '-' : stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Search Interface */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="h-[500px]">
                            <AISearchInterface
                                onResultSelect={handleResultSelect}
                                showSuggestions={true}
                                className="h-full"
                            />
                        </div>
                    </div>

                    {/* Memory Analytics */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="h-[500px]">
                            <MemoryAnalytics />
                        </div>
                    </div>
                </div>

                {/* Secondary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Insights */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <AIInsights />
                    </div>

                    {/* Memory Management */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <MemoryManagement />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
});

// Set display name for debugging
MemoryDashboard.displayName = 'MemoryDashboard';

export default MemoryDashboard;
