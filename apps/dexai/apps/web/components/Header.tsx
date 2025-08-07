'use client'

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onLoginClick?: () => void;
  showDictionaryLink?: boolean;
}

export default function Header({ onLoginClick, showDictionaryLink = true }: HeaderProps) {
  const router = useRouter();
  
  // Handle theme with fallback for SSR
  let isDarkMode = false;
  let toggleDarkMode = () => {};
  
  try {
    const theme = useTheme();
    isDarkMode = theme.isDarkMode;
    toggleDarkMode = theme.toggleDarkMode;
  } catch (error) {
    // ThemeProvider not available during SSR or initial render
    console.warn('ThemeProvider not available, using fallback theme state');
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20">
      <div className="container-hero">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-4 group transition-glass hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity animate-glow"></div>
              <div className="relative p-3 rounded-xl">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-float"
                >
                  <path d="M12 7v14"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text romanian-text">DEXAI</h1>
              <p className="text-sm text-white/70 font-medium">Dicționar Explicativ AI</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {showDictionaryLink && (
              <Link 
                href="/dictionary" 
                className="glass-button text-white hover:text-blue-200 font-medium"
              >
                📚 Dicționar
              </Link>
            )}
            
            <button 
              onClick={toggleDarkMode}
              className="glass-button text-white hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/80 font-medium">Live cu AI Real</span>
            </div>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLoginClick}
              className="glass-button-primary font-semibold px-6 py-2 rounded-xl"
            >
              Conectează-te
            </button>
            
            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden glass-button p-3 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className={`w-6 h-6 text-white transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/20 animate-fade-in">
            <div className="container-hero py-6">
              <nav className="space-y-4">
                {showDictionaryLink && (
                  <Link 
                    href="/dictionary" 
                    className="block glass-button text-white hover:text-blue-200 font-medium p-3 rounded-xl transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📚 Dicționar
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    toggleDarkMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left glass-button text-white hover:text-blue-200 font-medium p-3 rounded-xl transition-all duration-300"
                >
                  {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'} Mode
                </button>
                
                <div className="flex items-center space-x-2 p-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/80 font-medium">Live cu AI Real</span>
                </div>
                
                <button 
                  onClick={() => {
                    onLoginClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full glass-button-primary font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Conectează-te
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

