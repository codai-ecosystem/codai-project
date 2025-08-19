'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Building2,
  CreditCard,
  Brain,
  Shield,
  Settings,
  User,
  Bell,
  Search,
  Grid3X3,
  ChevronDown,
  LogOut,
  Wallet,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Users,
  BarChart3,
  Music,
  Presentation,
  Globe,
  Sun,
  Coffee,
  Hammer,
  Code,
  Eye
} from 'lucide-react';
import { EcosystemApp, EcosystemUser, NavigationItem } from '@codai/shared-types';

// CODAI Ecosystem Apps Configuration
const ECOSYSTEM_APPS: EcosystemApp[] = [
  // Core Apps
  { id: 'codai', name: 'CODAI', domain: 'localhost:4001', port: 4001, category: 'core', status: 'active', version: '2.0.0', description: 'AI Development Platform', icon: 'Code', routes: [], features: [], integrations: [] },
  { id: 'hub', name: 'Hub', domain: 'localhost:4008', port: 4008, category: 'core', status: 'active', version: '1.0.0', description: 'Central Hub', icon: 'Home', routes: [], features: [], integrations: [] },
  { id: 'admin', name: 'Admin', domain: 'localhost:4007', port: 4007, category: 'core', status: 'active', version: '1.0.0', description: 'System Administration', icon: 'Shield', routes: [], features: [], integrations: [] },
  { id: 'id', name: 'ID', domain: 'localhost:4004', port: 4004, category: 'core', status: 'active', version: '1.0.0', description: 'Identity Management', icon: 'User', routes: [], features: [], integrations: [] },

  // Financial Apps
  { id: 'bancai', name: 'BancAI', domain: 'localhost:4005', port: 4005, category: 'financial', status: 'active', version: '1.0.0', description: 'AI Banking Platform', icon: 'Building2', routes: [], features: [], integrations: [] },
  { id: 'stocai', name: 'StocAI', domain: 'localhost:6300', port: 6300, category: 'financial', status: 'active', version: '1.0.0', description: 'Stock Trading AI', icon: 'TrendingUp', routes: [], features: [], integrations: [] },
  { id: 'wallet', name: 'Wallet', domain: 'localhost:6800', port: 6800, category: 'financial', status: 'active', version: '1.0.0', description: 'Digital Wallet', icon: 'Wallet', routes: [], features: [], integrations: [] },

  // AI/ML Apps
  { id: 'memorai', name: 'MemorAI', domain: 'localhost:4006', port: 4006, category: 'ai-ml', status: 'active', version: '1.0.0', description: 'Memory Management AI', icon: 'Brain', routes: [], features: [], integrations: [] },
  { id: 'romai', name: 'RomAI', domain: 'localhost:6100', port: 6100, category: 'ai-ml', status: 'active', version: '1.0.0', description: 'Romanian AI Assistant', icon: 'Coffee', routes: [], features: [], integrations: [] },

  // Business Apps
  { id: 'marketai', name: 'MarketAI', domain: 'localhost:5300', port: 5300, category: 'business', status: 'active', version: '1.0.0', description: 'Marketing Automation', icon: 'BarChart3', routes: [], features: [], integrations: [] },
  { id: 'talentai', name: 'TalentAI', domain: 'localhost:6600', port: 6600, category: 'business', status: 'active', version: '1.0.0', description: 'Talent Management', icon: 'Users', routes: [], features: [], integrations: [] },
  { id: 'logai', name: 'LogAI', domain: 'localhost:5200', port: 5200, category: 'business', status: 'active', version: '1.0.0', description: 'Logistics AI', icon: 'Briefcase', routes: [], features: [], integrations: [] },

  // Creative Apps
  { id: 'muzicai', name: 'MuzicAI', domain: 'localhost:5800', port: 5800, category: 'creative', status: 'active', version: '1.0.0', description: 'Music Creation AI', icon: 'Music', routes: [], features: [], integrations: [] },
  { id: 'prezentai', name: 'PrezentAI', domain: 'localhost:5900', port: 5900, category: 'creative', status: 'active', version: '1.0.0', description: 'Presentation AI', icon: 'Presentation', routes: [], features: [], integrations: [] },

  // Productivity Apps
  { id: 'studiai', name: 'StudiAI', domain: 'localhost:6400', port: 6400, category: 'productivity', status: 'active', version: '1.0.0', description: 'Education AI', icon: 'GraduationCap', routes: [], features: [], integrations: [] },
  { id: 'tools', name: 'Tools', domain: 'localhost:6700', port: 6700, category: 'productivity', status: 'active', version: '1.0.0', description: 'Development Tools', icon: 'Hammer', routes: [], features: [], integrations: [] },
  { id: 'glass', name: 'Glass', domain: 'localhost:4600', port: 4600, category: 'productivity', status: 'active', version: '1.0.0', description: 'Window Management', icon: 'Eye', routes: [], features: [], integrations: [] },

  // Specialized Apps
  { id: 'publicai', name: 'PublicAI', domain: 'localhost:6000', port: 6000, category: 'specialized', status: 'active', version: '1.0.0', description: 'Public Services AI', icon: 'Globe', routes: [], features: [], integrations: [] },
  { id: 'sociai', name: 'SociAI', domain: 'localhost:6200', port: 6200, category: 'specialized', status: 'active', version: '1.0.0', description: 'Social AI Platform', icon: 'Users', routes: [], features: [], integrations: [] },
  { id: 'sunai', name: 'SunAI', domain: 'localhost:6500', port: 6500, category: 'specialized', status: 'active', version: '1.0.0', description: 'Solar Energy AI', icon: 'Sun', routes: [], features: [], integrations: [] },
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home,
  Building2,
  CreditCard,
  Brain,
  Shield,
  Settings,
  User,
  Bell,
  Search,
  Grid3X3,
  ChevronDown,
  LogOut,
  Wallet,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Users,
  BarChart3,
  Music,
  Presentation,
  Globe,
  Sun,
  Coffee,
  Hammer,
  Code,
  Eye
};

interface EcosystemNavigationProps {
  currentApp: string;
  user?: EcosystemUser;
  onAppSwitch?: (appId: string) => void;
  className?: string;
}

export function EcosystemNavigation({
  currentApp,
  user,
  onAppSwitch,
  className = ''
}: EcosystemNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAppGrid, setShowAppGrid] = useState(false);
  const pathname = usePathname();

  const currentAppData = ECOSYSTEM_APPS.find(app => app.id === currentApp);

  const filteredApps = ECOSYSTEM_APPS.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const appsByCategory = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, EcosystemApp[]>);

  const categoryLabels: Record<string, string> = {
    core: 'Core Platform',
    financial: 'Financial Services',
    'ai-ml': 'AI & Machine Learning',
    business: 'Business Solutions',
    creative: 'Creative Tools',
    productivity: 'Productivity',
    specialized: 'Specialized Apps'
  };

  const handleAppClick = (app: EcosystemApp) => {
    if (onAppSwitch) {
      onAppSwitch(app.id);
    } else {
      // Navigate to app
      window.location.href = `http://${app.domain}`;
    }
  };

  const IconComponent = currentAppData ? ICON_MAP[currentAppData.icon] || Code : Code;

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className={`bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Current App */}
              <div className="flex items-center space-x-2">
                <IconComponent className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {currentAppData?.name || 'CODAI'}
                </span>
                <span className="text-sm text-gray-500">
                  v{currentAppData?.version || '1.0.0'}
                </span>
              </div>

              {/* App Switcher */}
              <button
                onClick={() => setShowAppGrid(!showAppGrid)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Grid3X3 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Apps</span>
              </button>

              {/* Quick Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ecosystem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={user.preferences?.navigation?.favoriteApps?.[0] ? `/avatars/${user.id}.jpg` : '/avatars/default.jpg'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-7 w-7 rounded-full bg-gray-300"
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* User Dropdown */}
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Preferences
                      </Link>
                      <hr className="my-1" />
                      <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* App Grid Overlay */}
      {showAppGrid && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">CODAI Ecosystem</h2>
                <button
                  onClick={() => setShowAppGrid(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Apps by Category */}
              <div className="space-y-8">
                {Object.entries(appsByCategory).map(([category, apps]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {apps.map((app) => {
                        const AppIcon = ICON_MAP[app.icon] || Code;
                        const isCurrentApp = app.id === currentApp;

                        return (
                          <button
                            key={app.id}
                            onClick={() => {
                              handleAppClick(app);
                              setShowAppGrid(false);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${isCurrentApp
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                              }`}
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <div className={`p-3 rounded-xl ${isCurrentApp ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                <AppIcon className={`h-6 w-6 ${isCurrentApp ? 'text-blue-600' : 'text-gray-600'
                                  }`} />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-gray-900 text-sm">
                                  {app.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {app.description}
                                </div>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-2 ${app.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  <div className={`w-1 h-1 rounded-full mr-1 ${app.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                    }`}></div>
                                  {app.status}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EcosystemNavigation;
