'use client'

import React from 'react';


interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  title = 'Ups! Ceva nu a mers bine',
  message,
  onRetry,
  type = 'error'
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      icon: '❌',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-100'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-100'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-100'
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`
      glass-card border-2 ${style.borderColor} ${style.bgColor}
      max-w-md mx-auto text-center
    `}>
      <div className="text-4xl mb-4">{style.icon}</div>
      
      <h3 className={`text-lg font-semibold mb-2 ${style.textColor}`}>
        {title}
      </h3>
      
      <p className={`mb-4 ${style.textColor} opacity-90`}>
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass-button-primary font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
        >
          🔄 Încearcă din nou
        </button>
      )}
    </div>
  );
}

