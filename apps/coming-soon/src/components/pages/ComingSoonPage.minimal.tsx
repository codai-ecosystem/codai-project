'use client';

import React from 'react';

export function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-8">
                    CODAI
                </h1>
                <p className="text-xl text-slate-300 mb-8">
                    The AI Renaissance is Coming Soon
                </p>
                <div className="animate-pulse">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        </div>
    );
}