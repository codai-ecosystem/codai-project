import React from 'react';
import { cn } from '../utils/cn';

interface ServiceCardProps {
  name: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  uptime: string;
  requests: number;
  domain: string;
  tier: 'foundation' | 'business' | 'specialized';
  onManage?: () => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  status,
  uptime,
  requests,
  domain,
  tier,
  onManage,
  className,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          text: 'Online',
          textColor: 'text-green-700',
        };
      case 'offline':
        return {
          color: 'bg-red-500',
          text: 'Offline',
          textColor: 'text-red-700',
        };
      case 'error':
        return {
          color: 'bg-red-600',
          text: 'Error',
          textColor: 'text-red-700',
        };
      case 'maintenance':
        return {
          color: 'bg-yellow-500',
          text: 'Maintenance',
          textColor: 'text-yellow-700',
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          textColor: 'text-gray-700',
        };
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'foundation':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          label: 'Foundation',
        };
      case 'business':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          label: 'Business',
        };
      case 'specialized':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          label: 'Specialized',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          label: 'Unknown',
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const tierConfig = getTierConfig(tier);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          <div className="flex items-center space-x-2">
            <div
              className={cn('w-2.5 h-2.5 rounded-full', statusConfig.color)}
            />
            <span className={cn('text-sm font-medium', statusConfig.textColor)}>
              {statusConfig.text}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium border',
            tierConfig.bg,
            tierConfig.text,
            tierConfig.border
          )}
        >
          {tierConfig.label}
        </div>
      </div>

      {/* Domain */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
          />
        </svg>
        <a
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {domain}
        </a>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Uptime
          </p>
          <p className="text-lg font-semibold text-gray-900">{uptime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Requests
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {requests.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onManage}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Manage Service
      </button>
    </div>
  );
};

export { ServiceCard };
