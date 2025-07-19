'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AnalizaiPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
      timeoutRef.current = setTimeout(updateTime, 1000);
    };
    updateTime();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tabContent = {
    overview: {
      title: 'Advanced Analytics Overview',
      content: 'Experience enterprise intelligent analytics with our powerful platform designed for business environments.',
    },
    analytics: {
      title: 'Advanced Analytics Dashboard',
      content: 'Comprehensive analytics dashboard with real-time data processing and intelligent insights.',
    },
    features: {
      title: 'Platform Features',
      content: 'Explore powerful features including Enterprise Security, High Performance analytics, and Global Scale deployment.',
    },
    monitor: {
      title: 'Monitor Dashboard',
      content: 'Real-time monitoring with advanced system performance tracking and global status indicators.',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 glassmorphism container">
      <div className="p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-800 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">ANALIZAI Enterprise</h1>
              <p className="text-purple-100 text-lg">
                Advanced Analytics & Business Intelligence Platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-purple-200">Status</div>
                <div className={`text-sm font-medium ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              <button
                aria-label="Refresh dashboard data"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            {['overview', 'analytics', 'features', 'monitor'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-label={`Switch to ${tab} tab`}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === tab
                    ? 'bg-blue-500/30 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tabContent[activeTab as keyof typeof tabContent].title}</h2>
            <p className="text-gray-700 mb-4">{tabContent[activeTab as keyof typeof tabContent].content}</p>
            <div className="text-sm text-gray-500">Current time: {currentTime}</div>
          </div>
        </div>

        {/* Live Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="text-green-600 text-sm font-medium">+15.3%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">24,847</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-green-600 text-sm font-medium">Live</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Active Now</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">2,847</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-blue-600 text-sm font-medium">98.5%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Processing Power</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">Optimal</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-purple-600 text-sm font-medium">Global</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Worldwide Reach</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">190+ Countries</p>
          </div>
        </div>

        {/* Enterprise Features Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
              </div>
              <p className="text-gray-600 text-sm">Advanced security protocols and encryption for business environments.</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">High Performance</h3>
              </div>
              <p className="text-gray-600 text-sm">Ultra-fast processing with optimized algorithms and caching.</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Global Scale</h3>
              </div>
              <p className="text-gray-600 text-sm">Worldwide deployment with regional data centers and edge computing.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            aria-label="Start analytics analysis"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Analysis
          </button>
          <button
            aria-label="View detailed analytics"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Analytics
          </button>
          <button
            aria-label="Access enterprise dashboard"
            className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Enterprise Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}