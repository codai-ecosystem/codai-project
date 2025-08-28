'use client';

import React from 'react'
import { useTranslations } from 'next-intl';
/**
 * Performance Metrics Visualization Component
 * 
 * Visual charts for performance metrics and trends
 */

interface PerformanceChartProps {
  data: Array<{ name: string; value: number; threshold?: number }>;
  title: string;
  type: 'bar' | 'line' | 'area';
  color?: string;
  height?: number;
}

export function PerformanceChart({ data, title, type, color = '#3B82F6', height = 200 }: PerformanceChartProps) {
  const t = useTranslations('common');
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center" style={{ height }}>
        <p className="text-gray-500">{t('noData')}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.threshold || 0)));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg border p-4" style={{ height }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>

      <div className="relative" style={{ height: height - 80 }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1="0"
                y1={`${(1 - ratio) * 100}%`}
                x2="100%"
                y2={`${(1 - ratio) * 100}%`}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="0"
                y={`${(1 - ratio) * 100}%`}
                dy="-4"
                fontSize="12"
                fill="#6b7280"
                className="text-xs"
              >
                {Math.round(minValue + (ratio * range))}
              </text>
            </g>
          ))}

          {/* Chart content */}
          {type === 'bar' && (
            <g>
              {data.map((item, index) => {
                const barWidth = 100 / data.length;
                const x = (index * barWidth) + (barWidth * 0.1);
                const width = barWidth * 0.8;
                const height = ((item.value - minValue) / range) * 100;
                const y = 100 - height;

                return (
                  <g key={index}>
                    {/* Threshold line */}
                    {item.threshold && (
                      <line
                        x1={`${x}%`}
                        y1={`${100 - ((item.threshold - minValue) / range) * 100}%`}
                        x2={`${x + width}%`}
                        y2={`${100 - ((item.threshold - minValue) / range) * 100}%`}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* Bar */}
                    <rect
                      x={`${x}%`}
                      y={`${y}%`}
                      width={`${width}%`}
                      height={`${height}%`}
                      fill={color}
                      opacity="0.8"
                      rx="2"
                    />

                    {/* Value label */}
                    <text
                      x={`${x + width / 2}%`}
                      y={`${y - 2}%`}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                      className="text-xs font-medium"
                    >
                      {item.value}
                    </text>

                    {/* Name label */}
                    <text
                      x={`${x + width / 2}%`}
                      y="100%"
                      dy="14"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                      className="text-xs"
                    >
                      {item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {type === 'line' && (
            <g>
              {/* Line path */}
              <polyline
                points={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minValue) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((item.value - minValue) / range) * 100;

                return (
                  <g key={index}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />

                    {/* Value label */}
                    <text
                      x={`${x}%`}
                      y={`${y}%`}
                      dy="-10"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                      className="text-xs font-medium"
                    >
                      {item.value}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

interface PerformanceGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  thresholds?: {
    good: number;
    warning: number;
  };
}

export function PerformanceGauge({
  value,
  max,
  label,
  unit = '',
  thresholds = { good: max * 0.7, warning: max * 0.9 }
}: PerformanceGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on thresholds
  let color = '#10B981'; // green
  if (value > thresholds.warning) {
    color = '#EF4444'; // red
  } else if (value > thresholds.good) {
    color = '#F59E0B'; // yellow
  }

  return (
    <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#f3f4f6"
            strokeWidth="8"
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
            </div>
            {unit && (
              <div className="text-xs text-gray-500">{unit}</div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-900 text-center">{label}</h3>

      {/* Threshold indicators */}
      <div className="flex space-x-4 mt-2 text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span>Good: &lt;{thresholds.good}</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <span>Warning: &lt;{thresholds.warning}</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          <span>Critical: ≥{thresholds.warning}</span>
        </div>
      </div>
    </div>
  );
}

interface PerformanceTrendProps {
  data: Array<{ timestamp: number; value: number }>;
  title: string;
  color?: string;
  height?: number;
}

export function PerformanceTrend({ data, title, color = '#3B82F6', height = 150 }: PerformanceTrendProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center" style={{ height }}>
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg border p-4" style={{ height }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-900">{title}</h3>

      <div className="relative" style={{ height: height - 60 }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Area fill */}
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area path */}
          <path
            d={`M 0,100 ${data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `L ${x},${y}`;
            }).join(' ')} L 100,100 Z`}
            fill={`url(#gradient-${title})`}
          />

          {/* Line */}
          <polyline
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(minValue + range * 0.5)}</span>
          <span>{Math.round(minValue)}</span>
        </div>
      </div>

      {/* Current value */}
      <div className="text-center mt-2">
        <span className="text-lg font-bold" style={{ color }}>
          {Math.round(data[data.length - 1].value * 100) / 100}
        </span>
        <span className="text-xs text-gray-500 ml-1">current</span>
      </div>
    </div>
  );
}

