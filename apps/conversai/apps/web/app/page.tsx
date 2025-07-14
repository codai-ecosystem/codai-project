'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Search, Settings, User, Bell, Archive, Trash2, Star, Plus, BarChart3, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: 'Dashboard Email',
      description: 'Gestionează toate emailurile într-o interfață modernă cu funcții AI',
      icon: <Mail className="h-12 w-12 text-blue-600" />,
      link: '/dashboard',
      color: 'blue'
    },
    {
      title: 'Compune Email',
      description: 'Scrie emailuri profesionale cu asistența AI integrată',
      icon: <Send className="h-12 w-12 text-green-600" />,
      link: '/compose',
      color: 'green'
    },
    {
      title: 'Analytics Email',
      description: 'Monitorizează performanța și statisticile emailurilor',
      icon: <BarChart3 className="h-12 w-12 text-purple-600" />,
      link: '/analytics',
      color: 'purple'
    },
    {
      title: 'Setări & Contacte',
      description: 'Configurează contul și gestionează contactele',
      icon: <Settings className="h-12 w-12 text-orange-600" />,
      link: '/settings',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ConversAI
                </h1>
              </div>
              <span className="text-sm text-gray-500">
                Professional Email with AI
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString('ro-RO')}
              </div>
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600 hover:text-blue-600" />
              </Link>
              <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600 hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Link
                href="/compose"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 mb-6 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Compune Email</span>
              </Link>

              <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>Primite</span>
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Send className="h-4 w-4" />
                  <span>Trimise</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Star className="h-4 w-4" />
                  <span>Marcate</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Archive className="h-4 w-4" />
                  <span>Arhivate</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Trash2 className="h-4 w-4" />
                  <span>Șters</span>
                </Link>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href="/analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Users className="h-4 w-4" />
                  <span>Contacte</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Settings className="h-4 w-4" />
                  <span>Setări</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută în emailuri..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bun venit la ConversAI!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Serviciul profesional de email cu inteligență artificială pentru utilizatorii români.
                  Gestionează-ți emailurile eficient cu asistență AI integrată.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Accesează Dashboard-ul
                  </Link>
                  <Link
                    href="/compose"
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Compune primul email
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.link}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-${feature.color}-50 rounded-xl group-hover:bg-${feature.color}-100 transition-colors`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistici Rapide</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                  <div className="text-sm text-gray-600">Necitite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-600">Trimise</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-gray-600">Rata răspuns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">2.4h</div>
                  <div className="text-sm text-gray-600">Timp mediu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>ConversAI - Parte din ecosistemul CODAI</p>
            <p className="text-sm mt-2">© 2025 CODAI. Email profesional cu inteligență artificială.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
