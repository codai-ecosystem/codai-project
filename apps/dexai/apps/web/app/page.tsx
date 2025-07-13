'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import GlassSearch from '../components/GlassSearch';
import Header from '../components/Header';
import { dexaiLogger } from '../src/lib/logai';

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize LogAI integration
  useEffect(() => {
    dexaiLogger.log('info', 'HomePage loaded');
  }, []);


  const popularWords = [
    'acasă', 'carte', 'dragoste', 'încredere', 'speranță', 'muncă',
    'lumină', 'libertate', 'prietenie', 'cunoaștere', 'natură', 'frumusețe'
  ];

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleSearch = async (query: string) => {
    dexaiLogger.searchWord(query, 0); // Log search attempt
    setIsSearching(true);
    // Simulate search delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(`/dictionary?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-32 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-32 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <Header onLoginClick={handleLogin} />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="space-section">
          <div className="container-hero text-center">
            <div className="space-y-8">
              {/* Hero Title */}
              <div className="space-y-4">
                <h1 className="text-hero gradient-text romanian-text animate-fade-in">
                  Dicționarul
                  <br />
                  <span className="bg-gradient-to-r from-romanian-blue via-romanian-yellow to-romanian-red bg-clip-text text-transparent">
                    Viitorului
                  </span>
                </h1>
                <p className="text-body text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Explorează limba română cu puterea inteligenței artificiale reale.
                  Definiții precise, etimologii detaliate și exemple contextuale —
                  toate generate de <span className="font-semibold text-white">Azure OpenAI</span>.
                </p>
              </div>

              {/* Search Section */}
              <div className="space-y-6">
                <GlassSearch
                  placeholder="Caută orice cuvânt în limba română..."
                  suggestions={popularWords}
                  autoFocus={true}
                  onSearch={handleSearch}
                  isLoading={isSearching}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Example */}
        <section className="space-component">
          <div className="container-content">
            <div className="glass-card max-w-2xl mx-auto text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-caption text-white/60">Găsite</span>
                  <span className="font-bold text-white">1</span>
                  <span className="text-caption text-white/60">rezultate în</span>
                  <span className="font-bold text-white">50</span>
                  <span className="text-caption text-white/60">ms</span>
                </div>

                <div className="glass-subtle rounded-xl p-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-title text-white romanian-text">acasă</h3>
                      <span className="glass-subtle px-3 py-1 rounded-full text-sm text-white/70">adverb</span>
                    </div>
                    <div className="text-caption text-white/60">Nivel 1/10</div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Definiții</h4>
                      <p className="text-white/80 romanian-text">
                        La casa proprie, în locuința sa; în locul natal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-section">
          <div className="container-hero">
            <div className="text-center space-y-12">
              <h2 className="text-display gradient-text">Limba Română în Cifre</h2>
              <p className="text-body text-white/70 max-w-2xl mx-auto">
                Descoperiți frumusețea și complexitatea limbii române
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { number: '75,000+', label: 'Cuvinte în DEX', icon: '📚' },
                  { number: '24M+', label: 'Vorbitori în lume', icon: '🌍' },
                  { number: '500+', label: 'Ani documentați', icon: '📜' },
                  { number: '5', label: 'Țări oficiale', icon: '🏛️' }
                ].map((stat, index) => (
                  <div key={index} className="glass-card text-center hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-3">{stat.icon}</div>
                    <div className="text-headline gradient-text">{stat.number}</div>
                    <div className="text-white/70 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technology Features */}
        <section className="space-section">
          <div className="container-hero">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Azure OpenAI Real',
                  description: 'Definiții și explicații generate în timp real folosind Azure OpenAI GPT-4 pentru acuratețe maximă.',
                  icon: '🤖',
                  gradient: 'from-blue-600 to-cyan-600'
                },
                {
                  title: 'Firebase Live Database',
                  description: 'Căutări instantanee în Firebase Firestore cu sincronizare în timp real și caching intelligent.',
                  icon: '⚡',
                  gradient: 'from-purple-600 to-pink-600'
                },
                {
                  title: 'Conturi Utilizator Reale',
                  description: 'Autentificare completă cu Firebase Auth, favorite personale și istoric de căutări.',
                  icon: '👤',
                  gradient: 'from-green-600 to-teal-600'
                }
              ].map((feature, index) => (
                <div key={index} className="glass-card group hover:scale-105 transition-all duration-300">
                  <div className="space-y-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-title text-white">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="space-component border-t border-white/10">
        <div className="container-hero text-center">
          <p className="text-white/60">
            Realizat cu <span className="text-red-400">♥</span> pentru limba română
          </p>
          <p className="text-white/40 text-sm mt-2">
            © 2025 DEXAI. Dicționar Explicativ cu Inteligență Artificială Reală.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-md">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-title text-white mb-2">Conectează-te la DEXAI</h2>
                <p className="text-white/70">Accesează toate funcționalitățile premium</p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="glass-input w-full"
                />
                <input
                  type="password"
                  placeholder="Parolă"
                  className="glass-input w-full"
                />
              </div>

              <div className="space-y-3">
                <button className="glass-button-primary w-full py-3">
                  Conectează-te
                </button>
                <div className="text-center">
                  <p className="text-white/60 text-sm">
                    🚀 <span className="font-semibold">Demo Mode</span> - Firebase Auth în curând
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
