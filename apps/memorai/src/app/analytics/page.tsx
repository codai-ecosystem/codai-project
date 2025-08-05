// Analytics Page - Memory analytics dashboard page
// Route: /analytics - Comprehensive analytics and insights interface

import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics - MemorAI',
  description: 'Comprehensive memory analytics, insights, and performance metrics for your digital memory system',
  keywords: ['memory analytics', 'insights', 'performance', 'metrics', 'dashboard', 'data visualization'],
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Memory Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Deep insights into your memory usage patterns, performance metrics, and personalized recommendations
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard className="w-full" />

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📊 Real-time Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get live updates on your memory system performance, including response times,
              active memories, and current system health status.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎯 AI-Powered Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Receive intelligent recommendations based on your usage patterns,
              helping you optimize your memory organization and productivity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📈 Trend Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your memory creation patterns over time and understand
              your digital knowledge accumulation and retrieval behaviors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
