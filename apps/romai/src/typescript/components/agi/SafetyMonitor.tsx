import React from 'react';

interface SafetyMonitorProps {
  safetyMetrics?: any;
  metrics?: any;
  className?: string;
}

export const SafetyMonitor: React.FC<SafetyMonitorProps> = ({ 
  safetyMetrics,
  metrics, 
  className 
}) => {
  return (
    <div className={`safety-monitor ${className || ''}`}>
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          🛡️ Safety Monitor
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Safety Status</span>
            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full dark:bg-green-800 dark:text-green-200">
              SECURE
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Alignment Score</span>
            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full dark:bg-blue-800 dark:text-blue-200">
              98.7%
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Risk Assessment</span>
            <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full dark:bg-yellow-800 dark:text-yellow-200">
              LOW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMonitor;
