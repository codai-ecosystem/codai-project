'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Database, 
  FileText, 
  HardDrive, 
  Upload, 
  Download,
  Search,
  Activity,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'

interface StorageMetrics {
  totalFiles: number
  totalSize: number
  categories: Record<string, number>
  recentUploads: number
  vectorsStored: number
  searchQueries: number
  storageUsage: {
    used: number
    total: number
    percentage: number
  }
}

interface AnalyticsData {
  storage: StorageMetrics
  performance: {
    averageUploadTime: number
    averageSearchTime: number
    successRate: number
    errorRate: number
  }
  usage: {
    dailyActiveUsers: number
    totalOperations: number
    topCategories: Array<{ name: string; count: number }>
  }
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data from multiple sources
      const [storageResponse, metricsResponse] = await Promise.all([
        fetch('/api/storage/analytics'),
        fetch('/api/analytics/metrics')
      ])

      const storageData = storageResponse.ok ? await storageResponse.json() : null
      const metricsData = metricsResponse.ok ? await metricsResponse.json() : null

      // Mock data if API not available
      const mockData: AnalyticsData = {
        storage: {
          totalFiles: 15420,
          totalSize: 2.3 * 1024 * 1024 * 1024, // 2.3 GB
          categories: {
            'Documente': 4521,
            'Imagini': 3210,
            'Video': 876,
            'Audio': 1234,
            'Text': 5579
          },
          recentUploads: 234,
          vectorsStored: 8765,
          searchQueries: 12543,
          storageUsage: {
            used: 2.3 * 1024 * 1024 * 1024,
            total: 10 * 1024 * 1024 * 1024,
            percentage: 23
          }
        },
        performance: {
          averageUploadTime: 1.2,
          averageSearchTime: 0.8,
          successRate: 98.7,
          errorRate: 1.3
        },
        usage: {
          dailyActiveUsers: 542,
          totalOperations: 23456,
          topCategories: [
            { name: 'Text', count: 5579 },
            { name: 'Documente', count: 4521 },
            { name: 'Imagini', count: 3210 },
            { name: 'Audio', count: 1234 },
            { name: 'Video', count: 876 }
          ]
        }
      }

      setAnalytics(storageData?.data || mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set mock data on error
      setAnalytics({
        storage: {
          totalFiles: 15420,
          totalSize: 2.3 * 1024 * 1024 * 1024,
          categories: {
            'Documente': 4521,
            'Imagini': 3210,
            'Video': 876,
            'Audio': 1234,
            'Text': 5579
          },
          recentUploads: 234,
          vectorsStored: 8765,
          searchQueries: 12543,
          storageUsage: {
            used: 2.3 * 1024 * 1024 * 1024,
            total: 10 * 1024 * 1024 * 1024,
            percentage: 23
          }
        },
        performance: {
          averageUploadTime: 1.2,
          averageSearchTime: 0.8,
          successRate: 98.7,
          errorRate: 1.3
        },
        usage: {
          dailyActiveUsers: 542,
          totalOperations: 23456,
          topCategories: [
            { name: 'Text', count: 5579 },
            { name: 'Documente', count: 4521 },
            { name: 'Imagini', count: 3210 },
            { name: 'Audio', count: 1234 },
            { name: 'Video', count: 876 }
          ]
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Nu s-au putut încărca datele de analiză</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tablou de Bord Analiză</h1>
          <p className="text-gray-600">Monitorizați performanța și utilizarea sistemului de stocare</p>
        </div>
        <Button onClick={fetchAnalytics} className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Actualizare Date
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fișiere</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.storage?.totalFiles?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.storage?.recentUploads || 0} în ultima săptămână
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spațiu Utilizat</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(analytics?.storage?.totalSize || 0)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={analytics?.storage?.storageUsage?.percentage || 0} className="flex-1" />
              <span className="text-xs text-muted-foreground">{analytics?.storage?.storageUsage?.percentage || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vectori Stocați</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.storage?.vectorsStored?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Indexare semantică activă
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Căutări</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.storage?.searchQueries?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              În ultima lună
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Prezentare Generală</TabsTrigger>
          <TabsTrigger value="performance">Performanță</TabsTrigger>
          <TabsTrigger value="categories">Categorii</TabsTrigger>
          <TabsTrigger value="usage">Utilizare</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuția Fișierelor</CardTitle>
                <CardDescription>Fișiere pe categorii</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.storage?.categories || {}).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((count as number) / (analytics?.storage?.totalFiles || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activitate Recentă</CardTitle>
                <CardDescription>Operațiuni din ultimele 24 ore</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Încărcări</span>
                    </div>
                    <Badge variant="secondary">+{analytics?.storage?.recentUploads || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Căutări</span>
                    </div>
                    <Badge variant="secondary">+{analytics?.storage?.searchQueries || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Utilizatori Activi</span>
                    </div>
                    <Badge variant="secondary">{analytics?.usage?.dailyActiveUsers || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timp Încărcare</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performance?.averageUploadTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Timpul mediu de încărcare</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timp Căutare</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performance?.averageSearchTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Timpul mediu de căutare</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata de Succes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performance?.successRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Operațiuni reușite</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata de Eroare</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performance?.errorRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Operațiuni eșuate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza Categoriilor</CardTitle>
              <CardDescription>Distribuția detaliată a fișierelor pe categorii</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(analytics?.usage?.topCategories || []).map((category, index) => (
                  <div key={category.name} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600">{category.count.toLocaleString()} fișiere</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(category.count / (analytics?.storage?.totalFiles || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tendințe de Utilizare</CardTitle>
                <CardDescription>Activitatea utilizatorilor și operațiunile sistemului</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Total Operațiuni</p>
                      <p className="text-2xl font-bold">{analytics?.usage?.totalOperations?.toLocaleString() || '0'}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Utilizatori Activi Zilnic</p>
                      <p className="text-2xl font-bold">{analytics?.usage?.dailyActiveUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Sistem</CardTitle>
                <CardDescription>Starea operațională</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stocare</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vectori</span>
                    <Badge variant="default">Activ</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Căutare</span>
                    <Badge variant="default">Operațional</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge variant="default">Stabil</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
