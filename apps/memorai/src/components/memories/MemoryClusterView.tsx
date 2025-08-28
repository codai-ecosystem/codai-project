'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { responsive } from '@/lib/utils/responsive'
import { clusteringService, type MemoryCluster } from '@/lib/services/clustering.service'
import type { Memory } from '@/types'
import { 
  ChartBarIcon,
  FolderIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

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
  const [isClustering, setIsClustering] = useState(false)
  const [clusters, setClusters] = useState<MemoryCluster[]>([])
  const [clusteringStats, setClusteringStats] = useState<any>(null)
  const [clusterError, setClusterError] = useState<string | null>(null)
  
  // Perform clustering when memories change
  useEffect(() => {
    if (memories.length === 0) {
      setClusters([])
      setClusteringStats(null)
      return
    }

    const performClustering = async () => {
      setIsClustering(true)
      setClusterError(null)
      
      try {
        const newClusters = await clusteringService.clusterMemories(memories, {
          maxClusters: 8,
          minClusterSize: 2,
          algorithm: 'hybrid'
        })
        
        setClusters(newClusters)
        
        if (newClusters.length > 0) {
          const stats = await clusteringService.getClusteringStats(newClusters)
          setClusteringStats(stats)
        }
      } catch (error) {
        console.error('Clustering failed:', error)
        setClusterError('Failed to cluster memories. Please try again.')
      } finally {
        setIsClustering(false)
      }
    }

    performClustering()
  }, [memories])
  
  const handleRecluster = async () => {
    if (memories.length === 0) return
    
    setIsClustering(true)
    setClusterError(null)
    
    try {
      const newClusters = await clusteringService.clusterMemories(memories, {
        maxClusters: 8,
        minClusterSize: 2,
        algorithm: 'hybrid'
      })
      
      setClusters(newClusters)
      
      if (newClusters.length > 0) {
        const stats = await clusteringService.getClusteringStats(newClusters)
        setClusteringStats(stats)
      }
    } catch (error) {
      console.error('Reclustering failed:', error)
      setClusterError('Failed to recluster memories. Please try again.')
    } finally {
      setIsClustering(false)
    }
  }

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
              {clusters.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.totalClusters')}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {clusteringStats?.averageClusterSize || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.avgSize')}
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
              {clusteringStats?.averageImportance?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.avgImportance')}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {clusteringStats?.topKeywords?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t('stats.totalKeywords')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderClusterGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clusters.map((cluster) => (
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
      {clusters.map((cluster) => (
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
            onClick={handleRecluster}
            disabled={isClustering || memories.length === 0}
            className={`${responsive.touchTargets.default} flex-1 sm:flex-none`}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isClustering ? 'animate-spin' : ''}`} />
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
      {isClustering && (
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
      {!isClustering && (
        <div>
          {viewMode === 'grid' ? renderClusterGrid() : renderClusterList()}
        </div>
      )}

      {/* Selected Cluster Detail */}
      {renderSelectedClusterDetail()}
    </div>
  )
}

export default MemoryClusterView;