'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CreditCard,
  ArrowLeftRight,
  User,
  HelpCircle,
  MapPin,
  LifeBuoy,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  TrendingUp,
  Banknote,
  Building2,
  Shield,
  FileText,
  Calculator,
  PiggyBank,
  Wallet,
  DollarSign,
  BarChart3,
  Globe,
  Target,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EcosystemNavigation } from '@codai/shared-components';

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: Home, description: 'Account overview and summary' },
    ]
  },
  {
    title: 'Accounts & Banking',
    items: [
      { name: 'All Accounts', href: '/accounts', icon: CreditCard, description: 'View all your accounts' },
      { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight, description: 'Transaction history and details' },
      { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight, description: 'Transfer money between accounts' },
      { name: 'Payments', href: '/payments', icon: DollarSign, description: 'Pay bills and manage payments' },
    ]
  },
  {
    title: 'Credit & Lending',
    items: [
      { name: 'Credit Cards', href: '/credit', icon: CreditCard, description: 'Manage credit cards and payments' },
      { name: 'Loans', href: '/loans', icon: Banknote, description: 'Personal, auto, and mortgage loans' },
      { name: 'Credit Score', href: '/credit-score', icon: TrendingUp, description: 'Monitor your credit health' },
    ]
  },
  {
    title: 'Investments & Wealth',
    items: [
      { name: 'Investments', href: '/investments', icon: TrendingUp, description: 'Portfolio and investment accounts' },
      { name: 'Retirement', href: '/retirement', icon: PiggyBank, description: '401k, IRA, and retirement planning' },
      { name: 'Savings Goals', href: '/goals', icon: Target, description: 'Set and track financial goals' },
    ]
  },
  {
    title: 'Business Banking',
    items: [
      { name: 'Business Accounts', href: '/business', icon: Building2, description: 'Business checking and savings' },
      { name: 'Merchant Services', href: '/merchant', icon: Wallet, description: 'Payment processing solutions' },
      { name: 'Payroll', href: '/payroll', icon: Users, description: 'Payroll management services' },
    ]
  },
  {
    title: 'Tools & Services',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Financial analytics and insights' },
      { name: 'Documents', href: '/documents', icon: FileText, description: 'Statements and tax documents' },
      { name: 'Calculators', href: '/tools', icon: Calculator, description: 'Financial planning tools' },
      { name: 'Insurance', href: '/insurance', icon: Shield, description: 'Insurance products and claims' },
    ]
  },
  {
    title: 'Support & Settings',
    items: [
      { name: 'Security Center', href: '/security', icon: Shield, description: 'Account security and privacy' },
      { name: 'Profile', href: '/profile', icon: User, description: 'Personal information and preferences' },
      { name: 'Support', href: '/support', icon: LifeBuoy, description: 'Get help and contact support' },
      { name: 'Locations', href: '/locations', icon: MapPin, description: 'Find branches and ATMs' },
      { name: 'Help Center', href: '/help', icon: HelpCircle, description: 'FAQ and learning resources' },
      { name: 'Settings', href: '/settings', icon: Settings, description: 'Account and app settings' },
    ]
  }
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Ecosystem Navigation */}
      <EcosystemNavigation
        currentApp="bancai"
        user={user}
        onAppSwitch={(appId) => {
          // Handle app switching
          const appPorts: Record<string, number> = {
            codai: 4001,
            hub: 4008,
            admin: 4007,
            id: 4004,
            memorai: 4006,
            bancai: 4005,
            stocai: 6300,
            wallet: 6800,
            // Add more apps as needed
          };

          if (appPorts[appId]) {
            window.location.href = `http://localhost:${appPorts[appId]}`;
          }
        }}
      />

      {/* Main Layout */}
      <div className="flex h-screen bg-gray-100 pt-16"> {/* pt-16 to account for ecosystem nav */}
        {/* Sidebar */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">BancAI</span>
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto py-4">
              {navigationSections.map((section) => (
                <div key={section.title} className="mb-6">
                  {!isSidebarCollapsed && (
                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                  )}
                  <nav className="space-y-1 px-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActivePath(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          title={isSidebarCollapsed ? item.name : undefined}
                        >
                          <Icon className={`flex-shrink-0 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                          {!isSidebarCollapsed && (
                            <>
                              <span className="ml-3">{item.name}</span>
                              {item.badge && (
                                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* User Profile */}
            {user && (
              <div className="border-t border-gray-200 p-4">
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className={`w-full flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''
                      }`}
                  >
                    <img
                      src={user.avatar || '/avatars/default.jpg'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-8 w-8 rounded-full bg-gray-300"
                    />
                    {!isSidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </>
                    )}
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className={`absolute ${isSidebarCollapsed ? 'left-16 bottom-0' : 'right-0 bottom-16'} mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50`}>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/security"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Security Center
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75" onClick={handleMobileMenuToggle}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">BancAI</span>
                </div>
                <button onClick={handleMobileMenuToggle}>
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {navigationSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    <nav className="space-y-1 px-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            onClick={handleMobileMenuToggle}
                          >
                            <Icon className={`flex-shrink-0 h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                            {item.name}
                            {item.badge && (
                              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={handleMobileMenuToggle}
          className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-md bg-white shadow-md border border-gray-200"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </>
  );
}
