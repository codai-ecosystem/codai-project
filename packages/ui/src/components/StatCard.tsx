import React from 'react';
import { cn } from '../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    positive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
    error: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
  };

  const iconContainerClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>

          <div className="flex items-center space-x-2">
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}

            {trend && (
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    'flex items-center text-xs font-medium',
                    trend.positive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.positive ? (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {trend.value}%
                </div>
                {trend.label && (
                  <span className="text-xs text-gray-500">{trend.label}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              'p-3 rounded-xl',
              iconContainerClasses[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export { StatCard };
