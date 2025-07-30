/**
 * METU Main Application Page - Phase 5 Enhanced Version
 * 
 * Integrates the enhanced MetuWebClient with the transformed device server architecture
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the MetuWebClient to avoid SSR issues
const MetuWebClient = dynamic(
    () => import('../components/MetuWebClient'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading METU Client...</p>
                </div>
            </div>
        )
    }
);

/**
 * Main METU Application Page
 */
export default function MetuHomePage() {
    return (
        <main className="min-h-screen">
            <MetuWebClient />
        </main>
    );
}
