/**
 * Service Health Dashboard Component
 * Real-time monitoring of all microservices through API Gateway
 */

'use client';

import React from 'react';
import { useServiceRegistry, useAPIGatewayHealth } from '@/hooks/useAPIGateway';

interface ServiceStatusProps {
    name: string;
    health: {
        status: 'healthy' | 'unhealthy' | 'error';
        url: string;
        port: number;
        lastChecked: string;
        error?: string;
    };
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ name, health }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-100';
            case 'unhealthy':
                return 'text-yellow-600 bg-yellow-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return '✅';
            case 'unhealthy':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return '❓';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {name} Service
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                    {getStatusIcon(health.status)} {health.status}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>URL:</span>
                    <span className="font-mono">{health.url}</span>
                </div>
                <div className="flex justify-between">
                    <span>Port:</span>
                    <span className="font-mono">{health.port}</span>
                </div>
                <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span>{new Date(health.lastChecked).toLocaleTimeString()}</span>
                </div>
                {health.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <span className="text-red-700 text-xs">{health.error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading services...</span>
    </div>
);

const ErrorMessage: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
            <span className="text-red-600">❌</span>
            <span className="ml-2 text-red-800 font-medium">Error loading services</span>
        </div>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
            Retry
        </button>
    </div>
);

export const ServiceHealthDashboard: React.FC = () => {
    const { isLoading: servicesLoading, error: servicesError, data: services, refetch: refetchServices } = useServiceRegistry();
    const { isLoading: gatewayLoading, error: gatewayError, data: gateway, refetch: refetchGateway } = useAPIGatewayHealth();

    if (servicesLoading || gatewayLoading) {
        return <LoadingSpinner />;
    }

    if (servicesError) {
        return <ErrorMessage error={servicesError} onRetry={refetchServices} />;
    }

    if (gatewayError) {
        return <ErrorMessage error={gatewayError} onRetry={refetchGateway} />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🚀 CODAI Service Health Dashboard
                </h1>
                <p className="text-gray-600">
                    Real-time monitoring of all microservices through PUBLICAI API Gateway
                </p>
            </div>

            {/* Gateway Status */}
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">API Gateway Status</h2>
                        <p className="text-blue-100">Gateway: {services?.gateway || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{gateway?.status || 'Unknown'}</div>
                        <div className="text-blue-100">
                            Uptime: {gateway?.uptime ? `${Math.round(gateway.uptime)}s` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Overview */}
            {services && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {services.totalServices}
                        </div>
                        <div className="text-gray-600">Total Services</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {services.healthyServices}
                        </div>
                        <div className="text-gray-600">Healthy Services</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {services.totalServices - services.healthyServices}
                        </div>
                        <div className="text-gray-600">Unhealthy Services</div>
                    </div>
                </div>
            )}

            {/* Service Details */}
            {services && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(services.services).map(([name, health]) => (
                        <ServiceStatus key={name} name={name} health={health} />
                    ))}
                </div>
            )}

            {/* Refresh Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => {
                        refetchServices();
                        refetchGateway();
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🔄 Refresh Status
                </button>
                <p className="text-gray-500 text-sm mt-2">
                    Auto-refreshes every 30 seconds
                </p>
            </div>
        </div>
    );
};

export default ServiceHealthDashboard;
