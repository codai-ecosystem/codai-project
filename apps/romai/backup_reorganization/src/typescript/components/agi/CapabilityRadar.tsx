import React from 'react';

interface CapabilityRadarProps {
  capabilities?: any;
  scores?: any;
  className?: string;
}

export const CapabilityRadar: React.FC<CapabilityRadarProps> = ({
  capabilities,
  scores,
  className
}) => {
  return (
    <div className={`capability-radar ${className || ''}`}>
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          🎯 Capability Radar
        </h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-32 h-32 mx-auto mb-4 border-4 border-dashed border-blue-300 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full opacity-50"></div>
            </div>
            <p>AGI Capability Assessment</p>
            <p className="text-sm mt-2">Multi-dimensional skill analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilityRadar;
