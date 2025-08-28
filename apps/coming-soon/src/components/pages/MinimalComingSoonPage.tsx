'use client';

import React, { useState, useEffect } from 'react';
import { ChapterIntro } from '@/components/chapters';

interface MinimalComingSoonPageProps {
  className?: string;
}

export function MinimalComingSoonPage({ className = '' }: MinimalComingSoonPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollytellingExperience, setShowScrollytellingExperience] = useState(false);

  useEffect(() => {
    // Start with loading screen
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // After loading, show the scrollytelling experience
      const experienceTimer = setTimeout(() => {
        setShowScrollytellingExperience(true);
      }, 500);
      
      return () => clearTimeout(experienceTimer);
    }, 2000); // Show loading for 2 seconds

    return () => clearTimeout(loadingTimer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">CODAI</h1>
          <p className="text-xl text-slate-300 mb-8">The AI Renaissance is Coming Soon</p>
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-slate-400 mt-4">Preparing the AI Renaissance Experience...</p>
        </div>
      </div>
    );
  }

  if (!showScrollytellingExperience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">CODAI</h1>
          <p className="text-xl text-slate-300 mb-8">The AI Renaissance is Coming Soon</p>
          <div className="max-w-md mx-auto">
            <p className="text-slate-400 leading-relaxed">
              We're building something extraordinary. A comprehensive AI platform that will revolutionize 
              how we interact with artificial intelligence.
            </p>
            <div className="mt-8">
              <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`coming-soon-page ${className}`}>
      <div className="min-h-screen relative">
        <ChapterIntro 
          onTransition={() => {}}
          theme="intro"
          title="The AI Renaissance"
          chapterNumber={1}
          totalChapters={1}
        />
        
        {/* Development note */}
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
          Minimal Scrollytelling Experience Active
        </div>
      </div>
    </div>
  );
}