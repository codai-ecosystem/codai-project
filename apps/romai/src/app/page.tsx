'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the dashboard component
const RealAGIDashboard = dynamic(() => import('../components/RealAGIDashboard'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              RomAI AGI Platform
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advanced Romanian Artificial General Intelligence System
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              System Online
            </span>
          </div>
        </div>
      </div>

      <RealAGIDashboard />
    </div>
  );
}

