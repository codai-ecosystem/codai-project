'use client';

import React from 'react';
import {
  AIAssistant,
  SystemHealth,
  ProjectDashboard,
  type ChatMessage,
  type ServiceHealth,
  type ProjectMetrics,
  type ProjectActivity,
  type ProjectOverview
} from '@codai/ui';

export default function EnhancedDashboard() {
  // AI Assistant State
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to Codai AI Assistant! I can help you manage your development ecosystem.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);

  // System Health Mock Data
  const [services] = React.useState<ServiceHealth[]>([
    {
      id: 'codai',
      name: 'Codai Platform',
      status: 'healthy',
      uptime: 24 * 60 * 60 * 1000 * 7, // 7 days
      responseTime: 120,
      lastCheck: new Date(),
      version: '2.1.0',
      metrics: { cpu: 35, memory: 45, requests: 1245, errors: 2 }
    },
    {
      id: 'memorai',
      name: 'MemorAI',
      status: 'healthy',
      uptime: 24 * 60 * 60 * 1000 * 12, // 12 days
      responseTime: 85,
      lastCheck: new Date(),
      version: '1.8.5',
      metrics: { cpu: 28, memory: 52, requests: 987, errors: 0 }
    },
    {
      id: 'logai',
      name: 'LogAI',
      status: 'warning',
      uptime: 24 * 60 * 60 * 1000 * 3, // 3 days
      responseTime: 350,
      lastCheck: new Date(),
      version: '1.5.2',
      metrics: { cpu: 72, memory: 68, requests: 2341, errors: 15 }
    },
    {
      id: 'fabricai',
      name: 'FabricAI',
      status: 'healthy',
      uptime: 24 * 60 * 60 * 1000 * 5, // 5 days
      responseTime: 95,
      lastCheck: new Date(),
      version: '3.0.1',
      metrics: { cpu: 41, memory: 38, requests: 1876, errors: 3 }
    }
  ]);

  // Project Dashboard Mock Data
  const metrics: ProjectMetrics = {
    totalProjects: 29,
    activeProjects: 18,
    totalCommits: 3452,
    weeklyCommits: 127,
    totalLines: 245678,
    weeklyLines: 8945,
    totalPRs: 234,
    openPRs: 12,
    totalIssues: 89,
    openIssues: 23
  };

  const recentActivity: ProjectActivity[] = [
    {
      id: '1',
      type: 'commit',
      project: 'codai',
      title: 'Enhanced AI assistant with contextual responses',
      author: 'GitHub Copilot',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success'
    },
    {
      id: '2',
      type: 'pr',
      project: 'memorai',
      title: 'Add vector search capabilities',
      author: 'AI Developer',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '3',
      type: 'deployment',
      project: 'fabricai',
      title: 'Deploy v3.0.1 to production',
      author: 'CI/CD Pipeline',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: '4',
      type: 'issue',
      project: 'logai',
      title: 'High memory usage in analytics module',
      author: 'System Monitor',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'pending'
    }
  ];

  const projects: ProjectOverview[] = [
    {
      id: 'codai',
      name: 'Codai Platform',
      description: 'Central AI development platform and AIDE hub',
      status: 'active',
      technology: ['React', 'TypeScript', 'Next.js', 'Node.js'],
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      health: 'healthy',
      metrics: { commits: 567, contributors: 8, stars: 234, forks: 45 }
    },
    {
      id: 'memorai',
      name: 'MemorAI',
      description: 'AI Memory and Knowledge Management System',
      status: 'active',
      technology: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      health: 'healthy',
      metrics: { commits: 423, contributors: 5, stars: 189, forks: 32 }
    },
    {
      id: 'logai',
      name: 'LogAI',
      description: 'Identity and Authentication Service',
      status: 'maintenance',
      technology: ['Go', 'gRPC', 'MongoDB', 'Redis'],
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      health: 'warning',
      metrics: { commits: 298, contributors: 4, stars: 156, forks: 28 }
    }
  ];

  // AI Assistant Functions
  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date(),
        metadata: {
          confidence: 0.89,
          sources: ['System Health', 'Project Metrics'],
          actions: [
            {
              label: 'View Details',
              action: () => console.log('View details clicked')
            }
          ]
        }
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('health') || lowerInput.includes('status')) {
      return `Based on current system health data, here's what I found:

• **Codai Platform**: ✅ Healthy (35% CPU, 45% Memory)
• **MemorAI**: ✅ Healthy (28% CPU, 52% Memory)  
• **LogAI**: ⚠️ Warning (72% CPU, 68% Memory) - Investigating high resource usage
• **FabricAI**: ✅ Healthy (41% CPU, 38% Memory)

The LogAI service is experiencing elevated resource usage. I recommend checking the analytics module for memory leaks.`;
    }

    if (lowerInput.includes('architecture') || lowerInput.includes('service')) {
      return `The Codai ecosystem follows a microservices architecture:

**Core Apps** (11):
• Codai - Central Platform & AIDE Hub  
• MemorAI - AI Memory & Database Core
• LogAI - Identity & Authentication
• FabricAI - AI Services Platform
• And 7 more specialized platforms

**Services** (18):
• AIDE - AI Development Environment
• Hub - Central Dashboard
• Analytics - Data Processing
• And 15 supporting services

All services communicate via gRPC and REST APIs with centralized logging and monitoring.`;
    }

    if (lowerInput.includes('performance') || lowerInput.includes('troubleshoot')) {
      return `Here are some performance optimization recommendations:

**Immediate Actions**:
1. Monitor LogAI memory usage - currently at 68%
2. Scale FabricAI horizontally for better load distribution
3. Optimize database queries in MemorAI

**Medium-term**:
1. Implement caching layers for frequently accessed data
2. Consider microservice consolidation for related functionality
3. Upgrade infrastructure based on usage patterns

**Monitoring**:
• Set up alerts for >80% resource usage
• Implement distributed tracing
• Add performance metrics dashboard`;
    }

    if (lowerInput.includes('update') || lowerInput.includes('new')) {
      return `Latest updates across the Codai ecosystem:

**Recent Deployments**:
• FabricAI v3.0.1 - Enhanced ML pipelines
• MemorAI v1.8.5 - Vector search capabilities
• Codai v2.1.0 - AI-powered dashboard

**In Development**:
• Real-time collaboration features
• Advanced analytics dashboard
• Cross-platform mobile apps

**Coming Soon**:
• Kubernetes auto-scaling
• Enhanced security features
• Multi-region deployment`;
    }

    return `I understand you're asking about "${input}". I can help you with:

• **System Health** - Check service status and performance
• **Architecture** - Explain the microservices structure  
• **Performance** - Troubleshoot and optimize services
• **Updates** - Latest features and deployments
• **Monitoring** - Set up alerts and dashboards

Feel free to ask me anything specific about the Codai ecosystem!`;
  };

  const handleRefreshHealth = () => {
    console.log('Refreshing health data...');
  };

  const handleServiceClick = (service: ServiceHealth) => {
    console.log('Service clicked:', service.name);
  };

  const handleProjectClick = (project: ProjectOverview) => {
    console.log('Project clicked:', project.name);
  };

  const handleActivityClick = (activity: ProjectActivity) => {
    console.log('Activity clicked:', activity.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Enhanced Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Intelligent monitoring and management with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Dashboard */}
          <div className="xl:col-span-3 space-y-8">
            {/* Project Dashboard */}
            <ProjectDashboard
              metrics={metrics}
              recentActivity={recentActivity}
              projects={projects}
              onProjectClick={handleProjectClick}
              onActivityClick={handleActivityClick}
            />

            {/* System Health */}
            <SystemHealth
              services={services}
              onRefresh={handleRefreshHealth}
              onServiceClick={handleServiceClick}
            />
          </div>

          {/* AI Assistant Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <AIAssistant
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                className="h-[calc(100vh-120px)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
