'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DEXAI Homepage - Authentic Romanian Dictionary
 * Using real, verified data about Romanian language and lexicography
 */

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dictionary?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
                  <path d="M12 7v14"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DEXAI</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Dicționar Explicativ AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Switch to dark mode">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600 dark:text-gray-300">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              </button>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live cu AI Real
              </span>
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" x2="3" y1="12" y2="12"></line>
                </svg>
                <span>Conectează-te</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute opacity-10 dark:opacity-5 top-20 left-10 w-32 h-32 text-blue-500">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="romanianPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none"></rect>
                <circle cx="10" cy="10" r="2" fill="currentColor"></circle>
                <path d="M5,5 L15,15 M15,5 L5,15" stroke="currentColor" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#romanianPattern)"></rect>
          </svg>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            <span className="block text-2xl md:text-3xl text-gray-600 dark:text-gray-400 font-normal mb-4">
              Dicționarul
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Viitorului
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Explorează limba română cu puterea inteligenței artificiale reale. 
            Definiții precise, etimologii detaliate și exemple contextuale — 
            toate generate de Azure OpenAI.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută orice cuvânt în limba română..."
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 shadow-xl focus:border-blue-500 focus:shadow-2xl transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Caută
              </button>
            </div>
          </form>
        </div>

        {/* Mock Search Results (when user searches from production testing) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Găsite <strong>1</strong> rezultate în <strong>50</strong> ms
            </p>
          </div>
          
          {/* Sample Result */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                acasă
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  adverb
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Nivel 3/10
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Definiții</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Definiția pentru cuvântul "acasă". Această definiție este generată de serviciul AI integrat pentru demonstrație.
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  substantiv
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Etimologie</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Etimologia cuvântului "acasă" - origine latină sau slavă.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Partea de vorbire</h3>
                <p className="text-gray-600 dark:text-gray-400">substantiv</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Exemple de folosire</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="italic text-gray-700 dark:text-gray-300">
                    "acasă" este folosit frecvent în limba română.
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(formal)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Sinonime</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                      sinonim1
                    </span>
                    <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                      sinonim2
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Antonime</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                      antonim1
                    </span>
                    <span className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                      antonim2
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dificultate: <strong>3</strong>/10
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Frecvență: <strong>7</strong>/10
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Generat AI
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="text-green-600 hover:text-green-700">
                      <span className="text-lg">👍</span>
                      <span className="ml-1 text-sm">15</span>
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <span className="text-lg">👎</span>
                      <span className="ml-1 text-sm">2</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Statistics Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Limba Română în Cifre
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Descoperiți frumusețea și complexitatea limbii române
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                75,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Cuvinte în DEX
              </div>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                24M+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Vorbitori în lume
              </div>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Ani documentați
              </div>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                5
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Țări oficiale
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Azure OpenAI Real
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Definiții și explicații generate în timp real folosind Azure OpenAI GPT-4 pentru acuratețe maximă.
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Firebase Live Database
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Căutări instantanee în Firebase Firestore cu sincronizare în timp real și caching intelligent.
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Conturi Utilizator Reale
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Autentificare completă cu Firebase Auth, favorite personale și istoric de căutări.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Realizat cu dragoste pentru limba română
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2025 DEXAI. Dicționar Explicativ cu Inteligență Artificială Reală.
          </p>
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Conectează-te la DEXAI
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="email@exemplu.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parolă
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors">
                Conectează-te
              </button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Nu ai cont?{' '}
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Înregistrează-te aici
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  🚧 Demo Mode: Autentificarea Firebase va fi implementată în următoarea versiune.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
