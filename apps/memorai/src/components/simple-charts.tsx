'use client';

import React from 'react';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  width = 400,
  height = 300,
  title
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <div className="relative" style={{ width, height }}>
        <div className="flex items-end justify-between h-full">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: item.color || '#3b82f6',
                    minHeight: '2px'
                  }}
                  title={`${item.name}: ${item.value}`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-center">
                  {item.name}
                </div>
                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SimpleLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  width = 400,
  height = 300,
  title
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20;
    const y = height - 40 - ((item.value - minValue) / range) * (height - 60);
    return { x, y, ...item };
  });

  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
            title={`${point.name}: ${point.value}`}
          />
        ))}

        {/* Labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-300"
          >
            {point.name}
          </text>
        ))}
      </svg>
    </div>
  );
};

interface SimplePieChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title?: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  width = 300,
  height = 300,
  title
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  let startAngle = 0;
  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const slice = {
      pathData,
      color: item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`,
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    };

    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <div className="flex items-center space-x-4">
        <svg width={width} height={height}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              title={`${slice.name}: ${slice.value} (${slice.percentage}%)`}
            />
          ))}
        </svg>

        <div className="flex flex-col space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {slice.name}: {slice.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon
}) => {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]} mt-1`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
