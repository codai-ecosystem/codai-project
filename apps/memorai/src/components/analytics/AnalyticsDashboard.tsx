'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon,
  TagIcon,
  CalendarDaysIcon,
  FireIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { Memory } from '../../lib/api/types'

interface AnalyticsDashboardProps {
  memories: Memory[]
  className?: string
}

interface AnalyticsMetrics {
  totalMemories: number
  memoriesThisWeek: number
  memoriesThisMonth: number
  averageImportance: number
  topTags: Array<{ tag: string; count: number }>
  memoryGrowthRate: number
  searchFrequency: number
  activeStreak: number
  importanceDistribution: Array<{ range: string; count: number }>
  activityByDay: Array<{ day: string; count: number }>
  recentActivity: Array<{ date: string; action: string; count: number }>
}

export function AnalyticsDashboard({ 
  memories, 
  className = '' 
}: AnalyticsDashboardProps) {
  const t = useTranslations('analytics')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  // Calculate comprehensive analytics
  const analytics = useMemo((): AnalyticsMetrics => {
    if (!memories.length) {
      return {
        totalMemories: 0,
        memoriesThisWeek: 0,
        memoriesThisMonth: 0,
        averageImportance: 0,
        topTags: [],
        memoryGrowthRate: 0,
        searchFrequency: 0,
        activeStreak: 0,
        importanceDistribution: [],
        activityByDay: [],
        recentActivity: []
      }
    }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Filter memories by time periods
    const memoriesThisWeek = memories.filter(m => 
      new Date(m.createdAt) >= oneWeekAgo
    ).length

    const memoriesThisMonth = memories.filter(m => 
      new Date(m.createdAt) >= oneMonthAgo
    ).length

    // Calculate average importance
    const averageImportance = memories.reduce((sum, m) => 
      sum + (m.metadata?.importance || 5), 0
    ) / memories.length

    // Analyze tags
    const tagCounts = new Map<string, number>()
    memories.forEach(memory => {
      const tags = memory.metadata?.tags || []
      tags.forEach((tag: string) => {
        if (tag) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      })
    })

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate importance distribution
    const importanceDistribution = [
      { range: '1-2', count: memories.filter(m => (m.metadata?.importance || 5) <= 2).length },
      { range: '3-4', count: memories.filter(m => {
        const imp = m.metadata?.importance || 5
        return imp >= 3 && imp <= 4
      }).length },
      { range: '5-6', count: memories.filter(m => {
        const imp = m.metadata?.importance || 5
        return imp >= 5 && imp <= 6
      }).length },
      { range: '7-8', count: memories.filter(m => {
        const imp = m.metadata?.importance || 5
        return imp >= 7 && imp <= 8
      }).length },
      { range: '9-10', count: memories.filter(m => (m.metadata?.importance || 5) >= 9).length }
    ]

    // Calculate activity by day
    const dayActivity = new Map<string, number>()
    memories.forEach(memory => {
      const day = new Date(memory.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
      dayActivity.set(day, (dayActivity.get(day) || 0) + 1)
    })

    const activityByDay = Array.from(dayActivity.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate growth rate (simplified)
    const memoryGrowthRate = memoriesThisMonth > 0 ? 
      ((memoriesThisMonth - memoriesThisWeek) / Math.max(memoriesThisWeek, 1)) * 100 : 0

    return {
      totalMemories: memories.length,
      memoriesThisWeek,
      memoriesThisMonth,
      averageImportance,
      topTags,
      memoryGrowthRate,
      searchFrequency: Math.floor(Math.random() * 10) + 5, // Mock data
      activeStreak: Math.floor(Math.random() * 30) + 1, // Mock data
      importanceDistribution,
      activityByDay,
      recentActivity: [
        { date: 'Today', action: 'Created', count: memoriesThisWeek > 0 ? Math.floor(memoriesThisWeek / 7) : 0 },
        { date: 'Yesterday', action: 'Updated', count: Math.floor(Math.random() * 5) },
        { date: 'This Week', action: 'Searched', count: Math.floor(Math.random() * 15) + 5 }
      ]
    }
  }, [memories])

  const renderMetricCard = (
    title: string, 
    value: string | number, 
    subtitle: string, 
    icon: React.ComponentType<{ className?: string }>, 
    color: string = 'primary'
  ) => {
    const Icon = icon
    const colorClasses = {
      primary: 'bg-primary/10 text-primary',
      green: 'bg-green-500/10 text-green-600',
      blue: 'bg-blue-500/10 text-blue-600',
      purple: 'bg-purple-500/10 text-purple-600',
      orange: 'bg-orange-500/10 text-orange-600',
      red: 'bg-red-500/10 text-red-600'
    }

    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </Card>
    )
  }

  if (memories.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('empty.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('empty.description')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
            {t('title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="whitespace-nowrap min-h-[36px] text-xs sm:text-sm"
            >
              {t(`periods.${period}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {renderMetricCard(
          t('metrics.totalMemories'),
          analytics.totalMemories,
          t('insights.totalCount', { count: analytics.totalMemories }),
          ChartBarIcon,
          'primary'
        )}
        
        {renderMetricCard(
          t('metrics.memoriesCreated'),
          selectedPeriod === 'week' ? analytics.memoriesThisWeek : analytics.memoriesThisMonth,
          selectedPeriod === 'week' ? t('periods.thisWeek') : t('periods.thisMonth'),
          ArrowTrendingUpIcon,
          'green'
        )}

        {renderMetricCard(
          t('metrics.averageImportance'),
          analytics.averageImportance,
          t('insights.importanceLevel'),
          FireIcon,
          'orange'
        )}

        {renderMetricCard(
          t('metrics.activeStreak'),
          analytics.activeStreak,
          t('insights.streakDays'),
          CalendarDaysIcon,
          'purple'
        )}
      </div>

      {/* Charts and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('charts.topTags')}
            </h3>
          </div>
          
          {analytics.topTags.length > 0 ? (
            <div className="space-y-3">
              {analytics.topTags.slice(0, 8).map(({ tag, count }, index) => (
                <div key={tag} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      #{index + 1}
                    </span>
                    <Badge variant="secondary">
                      {tag}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('noData.tags')}
            </p>
          )}
        </Card>

        {/* Activity by Day */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('charts.activityByDay')}
            </h3>
          </div>
          
          {analytics.activityByDay.length > 0 ? (
            <div className="space-y-3">
              {analytics.activityByDay.map(({ day, count }) => {
                const maxCount = Math.max(...analytics.activityByDay.map(d => d.count))
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                
                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{day}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('noData.activity')}
            </p>
          )}
        </Card>
      </div>

      {/* Importance Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartPieIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {t('charts.importanceDistribution')}
          </h3>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {analytics.importanceDistribution.map(({ range, count }) => {
            const percentage = analytics.totalMemories > 0 ? 
              (count / analytics.totalMemories) * 100 : 0
            
            return (
              <div key={range} className="text-center">
                <div className="mb-2">
                  <div className="text-2xl font-bold text-foreground">
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {range}
                </Badge>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {t('charts.recentActivity')}
          </h3>
        </div>
        
        <div className="space-y-3">
          {analytics.recentActivity.map(({ date, action, count }) => (
            <div key={`${date}-${action}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-medium text-foreground">
                    {action}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {date}
                  </span>
                </div>
              </div>
              <Badge variant="secondary">
                {count}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}