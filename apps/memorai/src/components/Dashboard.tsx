"use client";

import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalMemories: number;
  totalAgents: number;
  totalProjects: number;
  totalSessions: number;
  avgImportanceScore: number;
  memoryGrowthTrend: Array<{
    date: string;
    count: number;
  }>;
  topAgents: Array<{
    agentId: string;
    memoryCount: number;
    lastActivity: string;
  }>;
  topProjects: Array<{
    project: string;
    memoryCount: number;
    lastActivity: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    agentId: string;
    project: string;
    timestamp: string;
    content: string;
  }>;
  performanceMetrics: {
    avgResponseTime: number;
    totalQueries: number;
    cacheHitRate: number;
    errorRate: number;
    uptime: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    cbdConnection: boolean;
    memoryUsage: number;
    diskUsage: number;
    lastHealthCheck: string;
  };
}

export default function MemoraiDashboard() {
  // const { data: session } = useSession();
  const session = { user: { name: 'Development User' } }; // Mock session for development
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          console.error('Dashboard API error:', result.error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const memoraiFeatures = {
    "userFlows": [
      "memory_creation_interface",
      "semantic_search_ui",
      "memory_visualization",
      "context_builder",
      "memory_organization",
      "intelligent_retrieval",
      "memory_analytics"
    ],
    "businessLogic": [
      "semantic_embedding",
      "vector_search",
      "context_awareness",
      "memory_indexing",
      "intelligent_clustering",
      "relevance_scoring",
      "memory_lifecycle"
    ],
    "integrations": [
      "openai_embeddings",
      "pinecone_vector_db",
      "elasticsearch",
      "redis_cache",
      "websocket_sync",
      "ai_model_apis"
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">MEMORAI Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}! Here's your memorai overview.
          </p>
        </div>
        <Button>Quick Actions</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Badge variant="secondary">{stats?.totalMemories || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMemories || 0}</div>
            <p className="text-xs text-muted-foreground">Stored in CBD database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Badge variant="outline">{stats?.totalAgents || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">AI agents with memories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Badge variant="outline">{stats?.totalProjects || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Badge variant={stats?.systemHealth?.status === 'healthy' ? 'default' : 'destructive'}
              className={stats?.systemHealth?.status === 'healthy' ? 'bg-green-500' : ''}>
              {stats?.systemHealth?.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.performanceMetrics?.uptime ? Math.round(stats.performanceMetrics.uptime / 60) : 0}min</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Implementation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Active Agents</CardTitle>
            <CardDescription>Agents with the most memory activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.topAgents || []).map((agent, index) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{agent.agentId}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(agent.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{agent.memoryCount} memories</Badge>
                </div>
              ))}
              {(!stats?.topAgents || stats.topAgents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No agents found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
            <CardDescription>Projects with the most memory data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.topProjects || []).map((project, index) => (
                <div key={project.project} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{project.project}</p>
                      <p className="text-xs text-muted-foreground">
                        Last activity: {new Date(project.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{project.memoryCount} memories</Badge>
                </div>
              ))}
              {(!stats?.topProjects || stats.topProjects.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Metrics</CardTitle>
          <CardDescription>Real-time performance and health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.performanceMetrics?.avgResponseTime || 0}ms</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.performanceMetrics?.totalQueries || 0}</div>
              <p className="text-sm text-muted-foreground">Total Queries</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.performanceMetrics?.cacheHitRate || 0}%</div>
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.systemHealth?.memoryUsage || 0}MB</div>
              <p className="text-sm text-muted-foreground">Memory Usage</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CBD Database Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Last health check: {stats?.systemHealth?.lastHealthCheck ?
                    new Date(stats.systemHealth.lastHealthCheck).toLocaleString() : 'Never'}
                </p>
              </div>
              <Badge variant={stats?.systemHealth?.cbdConnection ? 'default' : 'destructive'}>
                {stats?.systemHealth?.cbdConnection ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Implementation Status</CardTitle>
          <CardDescription>Current implementation progress across all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(memoraiFeatures).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold capitalize">{category.replace(/([A-Z])/g, ' $1')}</h3>
                  <Badge variant="outline">{Array.isArray(items) ? items.length : 0} features</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Array.isArray(items) && items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{item.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Memory Growth Trend</CardTitle>
            <CardDescription>Memory creation over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.memoryGrowthTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest memory operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentActivity || []).slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.agentId} in {activity.project} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}