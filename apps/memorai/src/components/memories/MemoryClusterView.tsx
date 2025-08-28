'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { responsive } from '@/lib/utils/responsive'
import type { Memory } from '@/types'
import { 
  ChartBarIcon,
  FolderIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface MemoryCluster {
  id: string
  name: string
  description: string
  memories: Memory[]
  keywords: string[]
  averageImportance: number
  createdAt: string
  color: string
}

interface MemoryClusterViewProps {
  memories: Memory[]
  onMemorySelect?: (memory: Memory) => void
  onClusterSelect?: (cluster: MemoryCluster) => void
  className?: string
}

export function MemoryClusterView({ 
  memories, 
  onMemorySelect, 
  onClusterSelect, 
  className = '' 
}: MemoryClusterViewProps) {
  const t = useTranslations('clustering')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCluster, setSelectedCluster] = useState<MemoryCluster | null>(null)
  const [isClustering] = useState(false)
  const isLoadingStats = false
  const clusterError = null
  
  const recluster = () => {
    // TODO: Implement reclustering functionality
    console.log('Reclustering memories...')
  }
  
  // Mock stats for demonstration
  const mockStats = {
    averageImportance: memories.reduce((sum, m) => sum + (m.metadata?.importance || 5), 0) / (memories.length || 1),
    topTags: [...new Set(memories.flatMap(m => m.metadata?.tags || []))].slice(0, 10),
    totalMemories: memories.length
  }

  // Generate cluster colors
  const clusterColors = useMemo(() => [
    'bg-blue-500/10 border-blue-500/20 text-blue-700',
    'bg-green-500/10 border-green-500/20 text-green-700',
    'bg-purple-500/10 border-purple-500/20 text-purple-700',
    'bg-orange-500/10 border-orange-500/20 text-orange-700',
    'bg-pink-500/10 border-pink-500/20 text-pink-700',
    'bg-cyan-500/10 border-cyan-500/20 text-cyan-700',
    'bg-red-500/10 border-red-500/20 text-red-700',
    'bg-yellow-500/10 border-yellow-500/20 text-yellow-700',
  ], [])

  // Mock clustering data for demonstration
  const mockClusters: MemoryCluster[] = useMemo(() => {
    if (!memories.length) return []
    
    // Simple clustering by tags and importance
    const clusterMap = new Map<string, Memory[]>()
    
    memories.forEach(memory => {
      const tags = memory.metadata?.tags || []
      const importance = memory.metadata?.importance || 5
      
      let clusterKey = 'uncategorized'
      
      if (tags.length > 0 && tags[0]) {
        clusterKey = tags[0] // Use first tag as cluster
      } else if (importance >= 8) {
        clusterKey = 'high-priority'
      } else if (memory.metadata?.project) {
        clusterKey = `project-${memory.metadata.project}`
      }
      
      if (!clusterMap.has(clusterKey)) {
        clusterMap.set(clusterKey, [])
      }
      clusterMap.get(clusterKey)!.push(memory)
    })
    
    return Array.from(clusterMap.entries()).map(([key, clusterMemories], index) => ({
      id: key,
      name: key === 'uncategorized' ? t('clusters.uncategorized') : 
            key === 'high-priority' ? t('clusters.highPriority') :
            key.startsWith('project-') ? key.replace('project-', '') :
            key,
      description: t('clusters.description', { count: clusterMemories.length }),
      memories: clusterMemories,
      keywords: [...new Set(clusterMemories.flatMap(m => m.metadata?.tags || []))],
      averageImportance: clusterMemories.reduce((sum, m) => sum + (m.metadata?.importance || 5), 0) / clusterMemories.length,
      createdAt: new Date().toISOString(),
      color: clusterColors[index % clusterColors.length] || clusterColors[0] || 'bg-gray-500/10 border-gray-500/20 text-gray-700'
    })).sort((a, b) => b.memories.length - a.memories.length)
  }, [memories, t, clusterColors])

  const handleClusterClick = (cluster: MemoryCluster) => {
    setSelectedCluster(cluster)
    onClusterSelect?.(cluster)
  }

  const renderClusterStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {mockClusters.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.clusters')}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {mockStats.averageImportance.toFixed(1) || '5.0'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.avgImportance')}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {mockStats.topTags.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.uniqueTags')}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {memories.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.totalMemories')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderClusterGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {mockClusters.map((cluster) => (
        <Card
          key={cluster.id}
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
            selectedCluster?.id === cluster.id 
              ? 'border-primary shadow-lg' 
              : 'border-border hover:border-primary/50'
          } ${responsive.touchTargets.clickableCard}`}
          onClick={() => handleClusterClick(cluster)}
        >
          <div className="space-y-3">
            {/* Cluster Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${cluster.color} truncate max-w-full sm:max-w-none`}>
                {cluster.name}
              </div>
              <Badge variant="outline" className="self-start sm:self-auto flex-shrink-0">
                {cluster.memories.length} {t('memories')}
              </Badge>
            </div>

            {/* Cluster Description */}
            <p className="text-sm text-muted-foreground">
              {cluster.description}
            </p>

            {/* Keywords */}
            {cluster.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cluster.keywords.slice(0, 4).map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs truncate max-w-16 sm:max-w-none">
                    {keyword}
                  </Badge>
                ))}
                {cluster.keywords.length > 4 && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    +{cluster.keywords.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Cluster Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground">
              <span className="truncate">
                {t('avgImportance')}: {cluster.averageImportance.toFixed(1)}
              </span>
              <span className="flex-shrink-0">
                {cluster.memories.length} {t('items')}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderClusterList = () => (
    <div className="space-y-3">
      {mockClusters.map((cluster) => (
        <Card
          key={cluster.id}
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
            selectedCluster?.id === cluster.id 
              ? 'border-l-primary shadow-lg bg-primary/5' 
              : 'border-l-border hover:border-l-primary/50'
          } ${responsive.touchTargets.clickableCard}`}
          onClick={() => handleClusterClick(cluster)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h3 className="font-semibold text-foreground truncate">{cluster.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex-shrink-0">
                    {cluster.memories.length} {t('memories')}
                  </Badge>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {t('importance')}: {cluster.averageImportance.toFixed(1)}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{cluster.description}</p>
              {cluster.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {cluster.keywords.slice(0, 6).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {cluster.keywords.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{cluster.keywords.length - 6} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="ml-4">
              <Button variant="ghost" size="sm">
                {t('viewCluster')}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderSelectedClusterDetail = () => {
    if (!selectedCluster) return null

    return (
      <Card className="mt-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {selectedCluster.name}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">{selectedCluster.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCluster(null)}
              className={`self-end sm:self-auto flex-shrink-0 ${responsive.touchTargets.default}`}
            >
              {t('close')}
            </Button>
          </div>

          {/* Cluster memories */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">{t('memoriesInCluster')}:</h4>
            <div className="grid gap-3">
              {selectedCluster.memories.map((memory) => (
                <div
                  key={memory.id}
                  className={`p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${responsive.touchTargets.clickableCard}`}
                  onClick={() => onMemorySelect?.(memory)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">
                        {memory.content}
                      </p>
                      {memory.metadata?.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.metadata.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs truncate max-w-16 sm:max-w-none">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {memory.metadata?.importance || 5}/10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (memories.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Squares2X2Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground">{t('empty.title')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t('empty.description')}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => recluster()}
            disabled={isClustering}
            className={`${responsive.touchTargets.default} flex-1 sm:flex-none`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{isClustering ? t('reclustering') : t('recluster')}</span>
          </Button>

          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-r-none border-r ${responsive.touchTargets.default}`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-l-none ${responsive.touchTargets.default}`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {renderClusterStats()}

      {/* Loading State */}
      {(isClustering || isLoadingStats) && (
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">{t('analyzing')}</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {clusterError && (
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <p className="text-destructive">{t('error')}: {String(clusterError)}</p>
        </Card>
      )}

      {/* Cluster Views */}
      {!isClustering && !isLoadingStats && (
        <div>
          {viewMode === 'grid' ? renderClusterGrid() : renderClusterList()}
        </div>
      )}

      {/* Selected Cluster Detail */}
      {renderSelectedClusterDetail()}
    </div>
  )
}