'use client'

import React from 'react';


interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'blue' | 'purple';
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'white',
  text = 'Se încarcă...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'border-white/30 border-t-white',
    blue: 'border-blue-300 border-t-blue-600',
    purple: 'border-purple-300 border-t-purple-600'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex items-center justify-center space-x-3">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 rounded-full animate-spin
        `}
      />
      {text && (
        <span className={`
          ${textSizeClasses[size]}
          ${color === 'white' ? 'text-white/80' : color === 'blue' ? 'text-blue-600' : 'text-purple-600'}
          font-medium
        `}>
          {text}
        </span>
      )}
    </div>
  );
}

