'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header role="banner" className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">ConversAI</h1>
            <span className="text-sm text-gray-600">Professional Email with AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-mono">{formatTime(currentTime)}</span>
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600">🔔</span>
              </div>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                12
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors">
              Compune Email
            </button>
            
            <nav className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100">
                <span className="text-gray-700">Primite</span>
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">12</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100">
                <span className="text-gray-700">Trimise</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100">
                <span className="text-gray-700">Marcate</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100">
                <span className="text-gray-700">Arhivate</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100">
                <span className="text-gray-700">Șters</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bun venit la ConversAI!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Serviciul profesional de email cu inteligență artificială pentru gestionarea eficientă a comunicării
            </p>
            
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Caută în emailuri..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Feature Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dashboard Email</h3>
              <p className="text-gray-600 mb-4">
                Gestionează toate emailurile într-un singur loc cu interfață intuitivă
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compune Email</h3>
              <p className="text-gray-600 mb-4">
                Scrie emailuri profesionale cu ajutorul inteligenței artificiale
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Email</h3>
              <p className="text-gray-600 mb-4">
                Monitorizează performanța emailurilor cu rapoarte detaliate
              </p>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex space-x-4 mb-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Accesează Dashboard-ul
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Compune primul email
            </button>
          </section>

          {/* Stats Section */}
          <section className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistici Rapide</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Inbox</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Trimise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Importante</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">24</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-4 mt-8">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-1">ConversAI - Parte din ecosistemul CODAI</p>
          <p>© 2025 CODAI - Email profesional cu inteligență artificială</p>
        </div>
      </footer>
    </div>
  );
}
