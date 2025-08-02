'use client';

import React from 'react';
import { StatusIndicatorProps, MetricCardProps, ProgressBarProps } from './index';

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}></div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusText()}</span>
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend, 
  format 
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'percentage') {
      return typeof val === 'string' ? val : `${val}%`;
    }
    return val.toString();
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 interactive-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatValue(value)}</p>
          <p className={`text-sm mt-1 ${getTrendColor()}`}>{change}</p>
        </div>
        <div className="text-3xl ml-4">{icon}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ 
  value, 
  color, 
  className = '' 
}: ProgressBarProps) {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-green-600';
      case 'blue': return 'bg-blue-600';
      case 'yellow': return 'bg-yellow-600';
      case 'red': return 'bg-red-600';
      case 'purple': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getColorClass()}`}
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin loading-spinner`}></div>
  );
}
