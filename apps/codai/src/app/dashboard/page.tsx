'use client';

import React from 'react';
import {
  Activity,
  Code2,
  GitBranch,
  Zap,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Database,
  Terminal,
  Brain,
  Rocket
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

const metrics: MetricCard[] = [
  {
    title: 'Active Projects',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Code2,
    color: 'bg-blue-500'
  },
  {
    title: 'Code Commits',
    value: '1,847',
    change: '+23%',
    trend: 'up',
    icon: GitBranch,
    color: 'bg-green-500'
  },
  {
    title: 'AI Generations',
    value: '5,293',
    change: '+45%',
    trend: 'up',
    icon: Brain,
    color: 'bg-purple-500'
  },
  {
    title: 'Deployments',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: Rocket,
    color: 'bg-orange-500'
  }
];

const recentProjects = [
  {
    name: 'E-commerce Platform',
    status: 'In Progress',
    progress: 78,
    lastUpdate: '2 hours ago',
    team: 4
  },
  {
    name: 'Mobile Banking App',
    status: 'Review',
    progress: 95,
    lastUpdate: '1 day ago',
    team: 6
  },
  {
    name: 'AI Chatbot Service',
    status: 'Development',
    progress: 45,
    lastUpdate: '3 hours ago',
    team: 3
  },
  {
    name: 'Analytics Dashboard',
    status: 'Testing',
    progress: 85,
    lastUpdate: '5 hours ago',
    team: 5
  }
];

const recentActivity = [
  {
    action: 'Code generation completed',
    project: 'E-commerce Platform',
    time: '10 minutes ago',
    type: 'success'
  },
  {
    action: 'Deployment successful',
    project: 'Mobile Banking App',
    time: '1 hour ago',
    type: 'success'
  },
  {
    action: 'Build failed',
    project: 'AI Chatbot Service',
    time: '2 hours ago',
    type: 'error'
  },
  {
    action: 'PR merged',
    project: 'Analytics Dashboard',
    time: '3 hours ago',
    type: 'info'
  }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-80">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Development Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-gray-600 text-sm">{metric.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'Development' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                        }`}>
                        {project.status}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.team}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {project.lastUpdate}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-gray-600 text-sm">{activity.project}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Code2 className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">New Project</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Brain className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">AI Assistant</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Terminal className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Terminal</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Rocket className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Deploy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
