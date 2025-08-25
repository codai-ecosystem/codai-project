'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  Brain,
  Cpu,
  Database,
  GitBranch,
  Zap,
  Settings,
  User,
  FileText,
  Shield,
  BarChart3,
  Puzzle,
  Rocket,
  TestTube,
  Cloud,
  Terminal,
  BookOpen,
  Users,
  Package,
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Home,
  Menu,
  X
} from 'lucide-react';

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Development',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Development overview and metrics' },
      { name: 'Code Editor', href: '/editor', icon: Code2, description: 'AI-powered code editor' },
      { name: 'Projects', href: '/projects', icon: Puzzle, description: 'Manage development projects' },
      { name: 'Repositories', href: '/repositories', icon: GitBranch, description: 'Git repository management' },
      { name: 'Terminal', href: '/terminal', icon: Terminal, description: 'Integrated terminal interface' },
      { name: 'API Builder', href: '/api-builder', icon: Zap, description: 'Visual API development' },
    ]
  },
  {
    title: 'AI & Intelligence',
    items: [
      { name: 'AI Assistant', href: '/ai-assistant', icon: Brain, description: 'AI coding companion' },
      { name: 'Code Generation', href: '/code-generation', icon: Cpu, description: 'Automated code generation' },
      { name: 'Intelligence Hub', href: '/intelligence', icon: Brain, description: 'AI model management' },
      { name: 'Machine Learning', href: '/ml', icon: Brain, description: 'ML model training and deployment' },
      { name: 'Neural Networks', href: '/neural-networks', icon: Cpu, description: 'Neural network visualization' },
    ]
  },
  {
    title: 'Data & Analytics',
    items: [
      { name: 'Databases', href: '/databases', icon: Database, description: 'Database management and queries' },
      { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Code and performance analytics' },
      { name: 'Monitoring', href: '/monitoring', icon: Activity, description: 'Application monitoring' },
      { name: 'Logs', href: '/logs', icon: FileText, description: 'System and application logs' },
      { name: 'Performance', href: '/performance', icon: Zap, description: 'Performance optimization' },
    ]
  },
  {
    title: 'Deployment & Cloud',
    items: [
      { name: 'Deployment', href: '/deployment', icon: Rocket, description: 'Application deployment' },
      { name: 'Cloud Services', href: '/cloud', icon: Cloud, description: 'Cloud platform integration' },
      { name: 'Container Hub', href: '/containers', icon: Package, description: 'Docker container management' },
      { name: 'CI/CD Pipeline', href: '/cicd', icon: GitBranch, description: 'Continuous integration and deployment' },
    ]
  },
  {
    title: 'Testing & Quality',
    items: [
      { name: 'Testing Suite', href: '/testing', icon: TestTube, description: 'Automated testing tools' },
      { name: 'Code Review', href: '/code-review', icon: Shield, description: 'Automated code review' },
      { name: 'Quality Gates', href: '/quality', icon: Shield, description: 'Code quality enforcement' },
      { name: 'Security Scan', href: '/security', icon: Shield, description: 'Security vulnerability scanning' },
    ]
  },
  {
    title: 'Collaboration',
    items: [
      { name: 'Team Hub', href: '/team', icon: Users, description: 'Team collaboration tools' },
      { name: 'Documentation', href: '/docs', icon: BookOpen, description: 'Project documentation' },
      { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, description: 'Development knowledge base' },
      { name: 'Code Sharing', href: '/sharing', icon: Users, description: 'Code snippet sharing' },
    ]
  },
  {
    title: 'Settings & Profile',
    items: [
      { name: 'Profile', href: '/profile', icon: User, description: 'User profile and preferences' },
      { name: 'Settings', href: '/settings', icon: Settings, description: 'Platform configuration' },
      { name: 'Notifications', href: '/notifications', icon: Bell, description: 'Notification preferences' },
      { name: 'Integrations', href: '/integrations', icon: Puzzle, description: 'Third-party integrations' },
    ]
  }
];

export default function EcosystemNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEcosystemGrid, setShowEcosystemGrid] = useState(false);
  const pathname = usePathname();

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-gray-900 text-white border-r border-gray-700 ${isCollapsed ? 'w-16' : 'w-80'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : ''}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg">CODAI Platform</h1>
                <p className="text-xs text-gray-400">AI Development Environment</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-700"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Ecosystem Switch Button */}
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={() => setShowEcosystemGrid(true)}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${isCollapsed ? 'px-2' : ''
                }`}
            >
              <Menu className="w-4 h-4" />
              {!isCollapsed && <span className="text-sm font-medium">Switch App</span>}
            </button>
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
            {filteredSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{item.name}</span>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-80'}`}>
        {/* This will wrap the page content */}
      </div>

      {/* Ecosystem Grid Overlay */}
      {showEcosystemGrid && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">CODAI Ecosystem</h2>
              <button
                onClick={() => setShowEcosystemGrid(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <p>Ecosystem navigation will be available soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
