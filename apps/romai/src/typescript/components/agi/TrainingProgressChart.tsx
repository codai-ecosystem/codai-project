import React from 'react';

interface TrainingProgressChartProps {
  data?: any[];
  className?: string;
}

export const TrainingProgressChart: React.FC<TrainingProgressChartProps> = ({ 
  data, 
  className 
}) => {
  return (
    <div className={`training-progress-chart ${className || ''}`}>
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          📊 Training Progress
        </h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-full h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded opacity-20 mb-4"></div>
            <p>Training Progress Chart</p>
            <p className="text-sm mt-2">Loss trajectory and accuracy metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgressChart;
