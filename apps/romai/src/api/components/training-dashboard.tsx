import React from 'react';

// Simple working training dashboard component
export default function SimpleTrainingDashboard() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              RomAI AGI Training Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time AGI training metrics and system status
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Training Active
            </span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Epoch 127
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Current Training Phase
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              92.4%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Capability Score
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              85%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              GPU Utilization
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              2.4 TB/h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Data Ingestion Rate
            </div>
          </div>
        </div>

        {/* Training Progress */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Training Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  GPU Utilization
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Memory Usage
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">72%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '72%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Network Bandwidth
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">68%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '68%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Metrics */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-200">
            Safety & Alignment Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">98.2%</div>
              <div className="text-sm text-red-700 dark:text-red-300">Alignment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">94.7%</div>
              <div className="text-sm text-red-700 dark:text-red-300">Robustness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">91.3%</div>
              <div className="text-sm text-red-700 dark:text-red-300">Bias Detection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">96.8%</div>
              <div className="text-sm text-red-700 dark:text-red-300">Transparency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}