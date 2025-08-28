'use client';

import React, { useEffect, useState } from 'react';
import { ChapterIntro } from '@/components/chapters';

interface SimpleComingSoonPageProps {
  className?: string;
}

export function SimpleComingSoonPage({ className = '' }: SimpleComingSoonPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Ensure loading always resolves
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('SimpleComingSoonPage: Loading complete');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-white text-lg mb-2">CODAI</div>
          <div className="text-gray-300 text-sm">The AI Renaissance is Coming Soon</div>
          <div className="text-gray-500 text-xs mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-black text-white overflow-x-hidden ${className}`}
      role="main"
      aria-label="CODAI Ecosystem Experience"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            CODAI
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-300">
            The AI Renaissance is Coming Soon
          </p>
          <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-2xl mx-auto">
            Experience the future of AI-native development. CODAI is revolutionizing how we build, deploy, and scale intelligent applications.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">AI-Native Development</h3>
              <p className="text-gray-300">
                Built from the ground up with AI at its core, enabling unprecedented development velocity.
              </p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">Intelligent Infrastructure</h3>
              <p className="text-gray-300">
                Self-optimizing systems that adapt and scale based on real-time usage patterns.
              </p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-pink-400">Universal Integration</h3>
              <p className="text-gray-300">
                Seamlessly connects with any technology stack, cloud platform, or development workflow.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16">
            <p className="text-lg text-gray-400 mb-6">
              Join the waitlist for early access
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-80"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors w-full sm:w-auto">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Preview */}
      <section className="py-20">
        <ChapterIntro
          theme="intro"
          title="The AI Renaissance"
          chapterNumber={1}
          totalChapters={1}
          onTransition={() => {}}
          isActive={true}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 CODAI Ecosystem. The future of AI development is here.
          </p>
        </div>
      </footer>
    </div>
  );
}