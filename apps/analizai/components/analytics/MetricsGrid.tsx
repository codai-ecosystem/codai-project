'use client'

import React from 'react';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
  trend?: number[];
}

interface MetricsGridProps {
  metrics: MetricData[];
  isLoading?: boolean;
  onRefresh?: () => void;
  showActions?: boolean;
}

export function MetricsGrid({
  metrics,
  isLoading = false,
  onRefresh,
  showActions = true,
}: MetricsGridProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const formatValue = (
    value: string | number,
    format?: string,
    unit?: string
  ) => {
    if (typeof value === 'string') return value;

    let formatted = value.toString();

    switch (format) {
      case 'currency':
        formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
        break;
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'number':
        formatted = new Intl.NumberFormat('en-US').format(value);
        break;
      default:
        formatted = value.toString();
    }

    return unit ? `${formatted} ${unit}` : formatted;
  };

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </div>
                  <div
                    className={`flex items-center text-sm ${getChangeColor(metric.changeType)}`}
                  >
                    {getTrendIcon(metric.changeType)}
                    <span className="ml-1">
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    metric.changeType === 'positive'
                      ? 'default'
                      : metric.changeType === 'negative'
                        ? 'error'
                        : 'secondary'
                  }
                >
                  {metric.changeType}
                </Badge>
              </div>

              {metric.trend && (
                <div className="mt-4 h-12">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke={
                        metric.changeType === 'positive'
                          ? '#10b981'
                          : metric.changeType === 'negative'
                            ? '#ef4444'
                            : '#6b7280'
                      }
                      strokeWidth="2"
                      points={metric.trend
                        .map(
                          (value, index) =>
                            `${(index / (metric.trend!.length - 1)) * 100},${40 - (value / Math.max(...metric.trend!)) * 40}`
                        )
                        .join(' ')}
                    />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

