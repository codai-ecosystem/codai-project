'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Search, Settings, User, Bell, Archive, Trash2, Star, Plus } from 'lucide-react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
              <Settings className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />
              <User className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 mb-6 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Compune Email</span>
              </button>

              <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>Primite</span>
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Send className="h-4 w-4" />
                  <span>Trimise</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Star className="h-4 w-4" />
                  <span>Marcate</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Archive className="h-4 w-4" />
                  <span>Arhivate</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Trash2 className="h-4 w-4" />
                  <span>Șters</span>
                </a>
              </nav>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bun venit la ConversAI!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Serviciul profesional de email cu inteligență artificială pentru utilizatorii români.
                  Gestionează-ți emailurile eficient cu asistență AI integrată.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Email Profesional</h3>
                    <p className="text-sm text-gray-600">Adrese email @codai.ro pentru o prezență profesională</p>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-xl">
                    <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Asistență AI</h3>
                    <p className="text-sm text-gray-600">Compunere inteligentă și răspunsuri automate</p>
                  </div>

                  <div className="p-6 bg-green-50 rounded-xl">
                    <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Management Avansat</h3>
                    <p className="text-sm text-gray-600">Organizare inteligentă și filtrare automată</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                    Începe să folosești ConversAI
                  </button>
                  <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
                    Învață mai multe
                  </button>
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
