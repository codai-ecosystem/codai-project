/**
 * UI Components and Hooks for RomAI
 * Essential components for performance and functionality
 */

import { useState, useEffect } from 'react';

// Types
export interface SystemStatus {
    status: 'operational' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    lastChecked: Date;
}

export interface RealTimeMetrics {
    activeUsers: number;
    queriesPerMinute: number;
    totalQueries: string;
    successRate: string;
}

// Custom Hooks
export function useSystemStatus(): SystemStatus {
    const [status, setStatus] = useState<SystemStatus>({
        status: 'operational',
        responseTime: 245,
        uptime: 99.9,
        lastChecked: new Date()
    });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/status', {
                    cache: 'no-cache',
                    next: { revalidate: 30 }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStatus({
                        status: data.status === 'operational' ? 'operational' : 'degraded',
                        responseTime: parseInt(data.responseTime) || 245,
                        uptime: 99.9,
                        lastChecked: new Date()
                    });
                }
            } catch (error) {
                setStatus(prev => ({ ...prev, status: 'degraded' }));
            }
        };

        // Only fetch after initial render for better performance
        const timeoutId = setTimeout(fetchStatus, 100);
        const interval = setInterval(fetchStatus, 60000); // Reduced to every 60 seconds
        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, []);

    return status;
}

export function useRealTimeMetrics(): RealTimeMetrics {
    const [metrics, setMetrics] = useState<RealTimeMetrics>({
        activeUsers: 42,
        queriesPerMinute: 12,
        totalQueries: '1.247',
        successRate: '98.7%'
    });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/analytics', {
                    cache: 'no-cache',
                    next: { revalidate: 30 }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.data) {
                        setMetrics({
                            activeUsers: data.data.activeUsers || 42,
                            queriesPerMinute: data.data.queriesPerMinute || 12,
                            totalQueries: data.data.totalQueries?.toString() || '1.247',
                            successRate: data.data.successRate ? `${data.data.successRate}%` : '98.7%'
                        });
                    }
                }
            } catch (error) {
                // Keep default values on error
            }
        };

        // Delayed fetch for better initial performance
        const timeoutId = setTimeout(fetchMetrics, 200);
        const interval = setInterval(fetchMetrics, 30000); // Reduced frequency
        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, []);

    return metrics;
}

export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return `${diffDays}d ago`;
    }
}

// Component Types (for import)
export interface StatusIndicatorProps {
    status: string;
}

export interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: string;
    trend: 'up' | 'down' | 'neutral';
    format?: 'percentage' | 'number';
}

export interface ProgressBarProps {
    value: number;
    color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
    className?: string;
}
