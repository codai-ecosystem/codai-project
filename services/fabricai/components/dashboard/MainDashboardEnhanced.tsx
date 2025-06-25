/**
 * Main Dashboard Component
 * Central hub for FabricAI service management
 */

'use client';

import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { ServiceStatusDashboard } from './ServiceStatusDashboard';
import { MemoryInterface } from '../memory/MemoryInterface';
import { LoadingPage } from '../common/Loading';
import AIServiceOrchestrator from '../ai/AIServiceOrchestrator';
import ModelManagement from '../models/ModelManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Brain,
  Zap,
  Activity,
  Settings,
  BarChart3,
  Layers,
  Code,
  Database,
  Network,
  Cpu,
} from 'lucide-react';

export function MainDashboard() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <LoadingPage
        title="Loading Dashboard..."
        description="Preparing FabricAI interface"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FabricAI</h1>
                <p className="text-sm text-gray-600">
                  AI Services Platform & Orchestration
                </p>
              </div>
              <Badge className="ml-4 bg-purple-100 text-purple-800">
                Priority 2 • Enterprise Ready
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500">{user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sign out"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                AI Services Platform
              </h2>
              <p className="text-gray-600">
                Orchestrate AI services, deploy models, and manage the entire AI
                infrastructure at scale.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Model Deployments</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Requests/Hour</p>
                  <p className="text-2xl font-bold">2.4K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">99.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">AI Services</TabsTrigger>
            <TabsTrigger value="models">Model Management</TabsTrigger>
            <TabsTrigger value="monitoring">System Status</TabsTrigger>
            <TabsTrigger value="memory">Memory Core</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Status Overview */}
              <ServiceStatusDashboard />

              {/* Platform Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Platform Features</span>
                  </CardTitle>
                  <CardDescription>
                    Enterprise-grade AI service orchestration capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <Brain className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        NLP Services
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Text analysis & generation
                      </span>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <Cpu className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Computer Vision
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Image & video analysis
                      </span>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <Network className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Model Deployment
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Scalable ML operations
                      </span>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <Database className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Data Processing
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        ETL & preprocessing
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Integration Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>MemorAI Core</span>
                        <Badge className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>LogAI Authentication</span>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>CODAI Orchestration</span>
                        <Badge className="bg-green-100 text-green-800">
                          Integrated
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>BancAI Services</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Connecting
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <AIServiceOrchestrator />
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <ModelManagement />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ServiceStatusDashboard />

              {/* Additional monitoring components can be added here */}
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>
                    Real-time infrastructure monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: '68%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: '72%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>GPU Utilization</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network I/O</span>
                        <span>23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: '23%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                    <div>
                      <span className="text-gray-600">Active Containers</span>
                      <p className="font-bold">24</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Uptime</span>
                      <p className="font-bold">99.8%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-6">
            <MemoryInterface />
          </TabsContent>
        </Tabs>

        {/* Ecosystem Integration Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Codai Ecosystem Integration</CardTitle>
              <CardDescription>
                Real-time status of FabricAI integration with other Codai
                services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>CODAI: Orchestrating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>MemorAI: Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>LogAI: Authenticated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>BancAI: Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Wallet: API Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
