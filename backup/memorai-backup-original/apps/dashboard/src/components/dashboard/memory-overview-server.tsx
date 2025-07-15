'use client';

import { useEffect, useState } from 'react';
import { Brain, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

interface MemoryOverviewProps {
  className?: string;
}

export function MemoryOverview({ className }: MemoryOverviewProps) {
  const [stats, setStats] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('MemoryOverview useEffect starting...');

    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Starting direct API calls...');

        // Use our working API endpoints directly
        const [statsResponse, memoriesResponse] = await Promise.all([
          fetch('/api/stats', {
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/mcp/read-graph', {
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' }
          })
        ]);

        console.log('Stats response:', statsResponse.status, statsResponse.ok);
        console.log('Memories response:', memoriesResponse.status, memoriesResponse.ok);

        let statsData = null;
        let memoriesData = null;

        if (statsResponse.ok) {
          statsData = await statsResponse.json();
          console.log('✅ Stats data loaded:', statsData);
          setStats(statsData);
        } else {
          console.error('❌ Failed to fetch stats:', statsResponse.statusText);
        }

        if (memoriesResponse.ok) {
          memoriesData = await memoriesResponse.json();
          console.log('✅ Memories data loaded:', memoriesData);
          setMemories(memoriesData.memories || []);
        } else {
          console.error('❌ Failed to fetch memories:', memoriesResponse.statusText);
        }

        console.log('🎯 Final state update:', {
          statsLoaded: !!statsData,
          memoriesLoaded: !!memoriesData,
          memoriesCount: memoriesData?.memories?.length || 0,
          totalMemories: statsData?.totalMemories
        });

      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        console.log('🔄 Setting isLoading to false...');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  console.log('MemoryOverview rendering - isLoading:', isLoading, 'stats:', stats, 'memories count:', memories?.length);

  return (
    <div
      data-testid="memory-overview"
      className={cn('p-6 space-y-6', className)}
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Memory Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive view of your AI memory system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Memories
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading
                  ? '...'
                  : stats?.totalMemories?.toLocaleString('en-US') || '0'}
              </p>
            </div>
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 dark:text-green-400">
              Real-time data
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                System Health
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : (stats?.systemHealth || 'Unknown')}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">
              All systems operational
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Memory Count
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : memories.length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Direct count
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Status
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? 'Loading' : 'Loaded'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Live data</span>
          </div>
        </div>
      </div>

      {/* Recent Memories */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Memories
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2"></div>
                </div>
              ))}
            </div>
          ) : memories && memories.length > 0 ? (
            memories.slice(0, 5).map((memory: any) => (
              <div
                key={memory.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {memory.content}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        memory.type === 'task'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {memory.type || 'memory'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(
                        memory.metadata?.timestamp ?? new Date().toISOString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No memories found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
