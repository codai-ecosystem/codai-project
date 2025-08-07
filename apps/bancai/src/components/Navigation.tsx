'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, CreditCard, ArrowUpRight, User, Settings, HelpCircle,
  MapPin, Phone, Menu, X, Bell, Search, ChevronDown, LogOut,
  DollarSign, TrendingUp, Shield, Smartphone, Star, Building
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: number;
}

interface NavigationSection {
  name: string;
  items: NavigationItem[];
}

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation: NavigationSection[] = [
    {
      name: 'Main',
      items: [
        { name: 'Dashboard', href: '/', icon: Home, description: 'Account overview and quick actions' },
        { name: 'Accounts', href: '/accounts', icon: CreditCard, description: 'View and manage all accounts' },
        { name: 'Transactions', href: '/transactions', icon: ArrowUpRight, description: 'Transaction history and details' },
      ]
    },
    {
      name: 'Services',
      items: [
        { name: 'Support', href: '/support', icon: Phone, description: 'Get help and contact support' },
        { name: 'Locations', href: '/locations', icon: MapPin, description: 'Find branches and ATMs' },
        { name: 'Help', href: '/help', icon: HelpCircle, description: 'FAQ and help articles' },
      ]
    },
    {
      name: 'Account',
      items: [
        { name: 'Profile', href: '/profile', icon: User, description: 'Manage your personal information' },
        { name: 'Settings', href: '/settings', icon: Settings, description: 'Account preferences and security' },
      ]
    }
  ];

  const quickActions = [
    { name: 'Transfer Money', icon: ArrowUpRight, color: 'blue' },
    { name: 'Pay Bills', icon: DollarSign, color: 'green' },
    { name: 'Invest', icon: TrendingUp, color: 'purple' },
    { name: 'Secure Account', icon: Shield, color: 'red' },
  ];

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
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">BancAI</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.flatMap(section => section.items).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${isActivePath(item.href)
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">Premium Account</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Help Center
                    </Link>

                    <div className="border-t border-gray-200 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Search on Mobile */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Navigation Sections */}
              {navigation.map((section) => (
                <div key={section.name} className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {section.name}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActivePath(item.href)
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </div>
                          {item.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quick Actions on Mobile */}
              <div className="px-3 py-2 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className={`w-8 h-8 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-2`}>
                          <Icon className={`h-4 w-4 text-${action.color}-600`} />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{action.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb Navigation */}
      {pathname !== '/' && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-3 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 capitalize">
                {pathname.split('/').filter(Boolean).join(' / ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
