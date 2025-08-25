/**
 * MemorAI Dashboard Layout
 * Shared layout component for all dashboard variations following Microsoft component patterns
 */
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface DashboardLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    tabs?: Array<{
        id: string;
        label: string;
        content: React.ReactNode;
    }>;
    headerActions?: React.ReactNode;
}

export default function DashboardLayout({
    title,
    description,
    children,
    tabs,
    headerActions
}: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        {headerActions && (
                            <div className="flex space-x-2">
                                {headerActions}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {tabs && tabs.length > 0 ? (
                    <Tabs defaultValue={tabs[0].id} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            {tabs.map((tab) => (
                                <TabsTrigger key={tab.id} value={tab.id}>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {tabs.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id}>
                                {tab.content}
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}