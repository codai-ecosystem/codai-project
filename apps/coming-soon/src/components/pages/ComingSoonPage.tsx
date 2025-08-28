'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useMotion } from '@/contexts/MotionContext';
import { ChapterIntro } from '@/components/chapters';
import { ScrollProgress } from '@/components/scroll/ScrollProgress';
import type { ChapterTheme } from '@/components/types';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Chapter configuration
const CHAPTERS: Array<{
  id: ChapterTheme;
  component: React.ComponentType<any>;
  title: string;
  duration: number;
}> = [
  {
    id: 'intro',
    component: ChapterIntro,
    title: 'The AI Renaissance',
    duration: 30
  }
  // Additional chapters will be added as they are implemented:
  // { id: 'foundation', component: ChapterFoundation, title: 'Foundation', duration: 25 },
  // { id: 'revolution', component: ChapterRevolution, title: 'Revolution', duration: 30 },
  // etc...
];

interface ComingSoonPageProps {
  className?: string;
}

export function ComingSoonPage({ className = '' }: ComingSoonPageProps) {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const { prefersReducedMotion } = useMotion();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any | null>(null);
  const chaptersRef = useRef<(HTMLElement | null)[]>([]);
  
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Ensure loading state is always resolved
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      console.log('Failsafe: Setting loading to false after 3 seconds');
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(failsafeTimeout);
  }, []);

  // Initialize smooth scrolling with Lenis
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    let cleanupFn: (() => void) | null = null;

    // Dynamic import of Lenis to handle build-time dependencies
    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        
        // Initialize Lenis
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          // Only use supported Lenis v@5 options
        });

        lenisRef.current = lenis;

        // Animation frame loop
        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Integrate with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Performance monitoring
        performance.mark('coming-soon-init-start');

        setIsLoading(false);

        performance.mark('coming-soon-init-end');
        performance.measure('coming-soon-init', 'coming-soon-init-start', 'coming-soon-init-end');

        cleanupFn = () => {
          lenis.destroy();
          gsap.ticker.remove((time) => {
            lenis.raf(time * 1000);
          });
        };
      } catch (error) {
        console.warn('Lenis not available, falling back to native scroll:', error);
        setIsLoading(false);
      }
    };

    // Always ensure loading is set to false
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    initLenis();
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [prefersReducedMotion]);

  // Setup chapter navigation and progress tracking
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Create main scroll trigger for progress tracking
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);
          
          // Update current chapter based on scroll position
          const chapterIndex = Math.floor(progress * CHAPTERS.length);
          const clampedIndex = Math.max(0, Math.min(chapterIndex, CHAPTERS.length - 1));
          
          if (clampedIndex !== currentChapter) {
            setCurrentChapter(clampedIndex);
          }
          
          // Update CSS custom property for global access
          document.documentElement.style.setProperty('--scroll-progress', progress.toString());
        }
      });

      // Create chapter-specific scroll triggers
      chaptersRef.current.forEach((chapterEl, index) => {
        if (!chapterEl) return;

        ScrollTrigger.create({
          trigger: chapterEl,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            setCurrentChapter(index);
            // Update chapter theme
            const chapter = CHAPTERS[index];
            if (chapter) {
              document.documentElement.setAttribute('data-current-chapter', chapter.id);
            }
          },
          onLeave: () => {
            // Optional: Handle chapter leave
          }
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [currentChapter, prefersReducedMotion]);

  // Handle chapter transitions
  const handleChapterTransition = useCallback((nextChapterId: string) => {
    const nextChapterIndex = CHAPTERS.findIndex(chapter => chapter.id === nextChapterId);
    
    if (nextChapterIndex === -1) {
      console.warn(`Chapter ${nextChapterId} not found`);
      return;
    }

    const nextChapterElement = chaptersRef.current[nextChapterIndex];
    if (!nextChapterElement) {
      console.warn(`Chapter element for ${nextChapterId} not found`);
      return;
    }

    // Smooth scroll to next chapter
    if (lenisRef.current) {
      lenisRef.current.scrollTo(nextChapterElement, {
        duration: 1.5,
        easing: (t: number) => 1 - Math.pow(1 - t, 3)
      });
    } else {
      // Fallback for browsers without smooth scrolling
      nextChapterElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }

    // Update current chapter
    setCurrentChapter(nextChapterIndex);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        if (currentChapter < CHAPTERS.length - 1) {
          handleChapterTransition(CHAPTERS[currentChapter + 1].id);
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        if (currentChapter > 0) {
          handleChapterTransition(CHAPTERS[currentChapter - 1].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        handleChapterTransition(CHAPTERS[0].id);
        break;
      case 'End':
        e.preventDefault();
        handleChapterTransition(CHAPTERS[CHAPTERS.length - 1].id);
        break;
    }
  }, [currentChapter, handleChapterTransition]);

  // Loading state with better visual feedback
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-white text-lg mb-2">CODAI</div>
          <div className="text-gray-300 text-sm">The AI Renaissance is Coming Soon</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`coming-soon-page relative min-h-screen bg-black overflow-x-hidden ${className}`}
      role="main"
      aria-label={t('main.label', 'CODAI Ecosystem Experience')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Screen Reader Navigation */}
      <nav className="sr-only" role="navigation" aria-label={t('nav.chapters', 'Chapter Navigation')}>
        <ul>
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                onClick={() => handleChapterTransition(chapter.id)}
                aria-current={currentChapter === index ? 'page' : undefined}
              >
                {t(`chapters.${chapter.id}.title`, chapter.title)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scroll Progress Indicator */}
      <ScrollProgress
        onProgress={(progress: number) => setScrollProgress(progress)}
        className="fixed top-0 left-0 right-0 z-50"
        showIndicator={true}
        indicatorPosition="top"
      />      {/* Chapter Navigation (Visual) */}
      <nav 
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
        role="navigation" 
        aria-label={t('nav.visual', 'Visual Chapter Navigation')}
      >
        <ul className="space-y-3">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                onClick={() => handleChapterTransition(chapter.id)}
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  currentChapter === index
                    ? 'bg-white border-white scale-125'
                    : 'bg-transparent border-white/50 hover:border-white'
                }`}
                aria-label={t(`chapters.${chapter.id}.title`, chapter.title)}
                aria-current={currentChapter === index ? 'page' : undefined}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Chapter Components */}
      <div className="chapters-container">
        {CHAPTERS.map((chapter, index) => {
          const ChapterComponent = chapter.component;
          
          return (
            <section
              key={chapter.id}
              ref={(el) => { chaptersRef.current[index] = el; }}
              className="chapter-section"
              data-chapter={chapter.id}
              aria-label={t(`chapters.${chapter.id}.title`, chapter.title)}
            >
              <ChapterComponent
                theme={chapter.id}
                title={t(`chapters.${chapter.id}.title`, chapter.title)}
                chapterNumber={index + 1}
                totalChapters={CHAPTERS.length}
                onTransition={handleChapterTransition}
                isActive={currentChapter === index}
                className="chapter-component"
              />
            </section>
          );
        })}
      </div>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
          <div>Chapter: {currentChapter + 1}/{CHAPTERS.length}</div>
          <div>Progress: {Math.round(scrollProgress * 100)}%</div>
          <div>Theme: {theme}</div>
          <div>Reduced Motion: {prefersReducedMotion ? 'ON' : 'OFF'}</div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .coming-soon-page {
          /* Smooth scrolling for supporting browsers */
          scroll-behavior: ${prefersReducedMotion ? 'auto' : 'smooth'};
        }
        
        .chapter-section {
          position: relative;
          z-index: 1;
        }
        
        /* Reduced motion styles */
        @media (prefers-reduced-motion: reduce) {
          .coming-soon-page {
            scroll-behavior: auto;
          }
          
          .chapter-component {
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .coming-soon-page {
            filter: contrast(1.5);
          }
        }
        
        /* Focus styles for keyboard navigation */
        .coming-soon-page:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default ComingSoonPage;