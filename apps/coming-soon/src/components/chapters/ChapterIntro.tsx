'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useMotion } from '@/contexts/MotionContext';
import { Button } from '@/components/ui';
import type { ChapterProps } from '@/components/types';
import { cn } from '@/utils';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface IntroChapterProps extends ChapterProps {
  onTransition: (nextChapter: string) => void;
  'data-testid'?: string;
}

export type { IntroChapterProps };

export function ChapterIntro({ 
  className, 
  onTransition,
  'data-testid': testId = 'chapter-intro'
}: IntroChapterProps) {
  const { t } = useTranslation();
  const { setChapterTheme } = useTheme();
  const { prefersReducedMotion } = useMotion();
  
  const chapterRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLDivElement>(null);
  const logoParticlesRef = useRef<HTMLDivElement>(null);
  const neuralNetworkRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const text4Ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const particleSystemRef = useRef<HTMLDivElement>(null);
  
  const [animationReady, setAnimationReady] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(0);
  
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
    
    // Clear performance monitoring
    if (typeof window !== 'undefined') {
      performance.clearMeasures('intro-chapter-render');
    }
  }, []);

  // Initialize animations
  useEffect(() => {
    if (!chapterRef.current || prefersReducedMotion) {
      setAnimationReady(true);
      return;
    }

    const ctx = gsap.context(() => {
      // Mark performance start
      performance.mark('intro-chapter-start');

      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: chapterRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
          onUpdate: (self) => {
            // Update progress for any connected components
            document.documentElement.style.setProperty(
              '--intro-progress',
              self.progress.toString()
            );
          }
        }
      });

      // Logo morph sequence (0-0.3)
      tl.to(logoTextRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(logoParticlesRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 360,
        duration: 0.4,
        ease: "back.out(1.7)"
      }, 0.1)
      .to(neuralNetworkRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.3)"
      }, 0.3);

      // Text content reveals (0.3-0.7)
      tl.fromTo(text1Ref.current, {
        y: 100,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, 0.3)
      .fromTo(text2Ref.current, {
        y: 100,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, 0.4)
      .fromTo(text3Ref.current, {
        y: 100,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, 0.45)
      .fromTo(text4Ref.current, {
        y: 100,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, 0.5)
      .fromTo(statsRef.current, {
        scale: 0,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: "back.out(1.7)"
      }, 0.55);

      // CTA button reveal (0.7-1.0)
      tl.fromTo(ctaRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.8
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)"
      }, 0.7);

      // Create ScrollTrigger for chapter activation
      const st = ScrollTrigger.create({
        trigger: chapterRef.current,
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onEnter: () => setChapterTheme('intro'),
        onUpdate: (self) => {
          // Update intro progress for any connected components
          document.documentElement.style.setProperty(
            '--intro-scroll-progress',
            self.progress.toString()
          );
        }
      });

      timelineRef.current = tl;
      scrollTriggerRef.current = st;

      // Mark performance end
      performance.mark('intro-chapter-end');
      performance.measure('intro-chapter-render', 'intro-chapter-start', 'intro-chapter-end');

      setAnimationReady(true);
    }, chapterRef);

    return () => {
      ctx.revert();
      cleanup();
    };
  }, [prefersReducedMotion, setChapterTheme, cleanup]);

  // Handle CTA click with particle burst effect
  const handleCTAClick = useCallback(() => {
    if (!ctaRef.current) return;

    // Scale animation
    gsap.to(ctaRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        // Trigger transition to next chapter
        setTimeout(() => onTransition('foundation'), 700);
      }
    });

    // Particle burst effect (simplified version)
    if (particleSystemRef.current) {
      const particles = particleSystemRef.current.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        gsap.to(particle, {
          scale: 1.5,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power2.out"
        });
      });
    }
  }, [onTransition]);

  // Keyboard navigation
  const focusableElements = [
    logoRef,
    text1Ref,
    text2Ref,
    text3Ref,
    text4Ref,
    statsRef,
    ctaRef
  ];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        const nextIndex = e.shiftKey 
          ? (currentFocus - 1 + focusableElements.length) % focusableElements.length
          : (currentFocus + 1) % focusableElements.length;
        setCurrentFocus(nextIndex);
        focusableElements[nextIndex]?.current?.focus();
        break;
      case 'Enter':
      case ' ':
        if (currentFocus === focusableElements.length - 1) {
          e.preventDefault();
          handleCTAClick();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onTransition('foundation');
        break;
    }
  }, [currentFocus, handleCTAClick, onTransition]);

  return (
    <section
      ref={chapterRef}
      className={cn(
        "intro-chapter relative min-h-screen flex items-center justify-center",
        "bg-gradient-to-b from-intro-900 via-intro-800 to-intro-700",
        "overflow-hidden",
        className
      )}
      role="banner"
      aria-label={t('intro.welcome', 'CODAI Introduction')}
      aria-describedby="intro-description"
      data-testid={testId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Screen Reader Description */}
      <div id="intro-description" className="sr-only">
        {t('intro.description', 'An introduction to CODAI, a comprehensive AI ecosystem with 47 applications across 5 tiers, representing the future of artificial intelligence.')}
      </div>

      {/* Background Particle System */}
      <div
        ref={particleSystemRef}
        className="particle-system absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Generate particles */}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-intro-200 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Logo Morph Section */}
        <div
          ref={logoRef}
          className="logo-morph relative mb-12"
          tabIndex={0}
          aria-label={t('common.logo', 'CODAI Logo')}
        >
          {/* Static logo for reduced motion */}
          {prefersReducedMotion ? (
            <div className="logo-static text-6xl font-bold text-intro-100 mb-8">
              CODAI
            </div>
          ) : (
            <>
              {/* Initial text logo */}
              <div
                ref={logoTextRef}
                className="logo-text text-6xl font-bold text-intro-100 mb-8"
              >
                CODAI
              </div>

              {/* Particle morph stage */}
              <div
                ref={logoParticlesRef}
                className="logo-particles absolute inset-0 opacity-0"
                aria-hidden="true"
              >
                <div className="flex justify-center items-center h-full">
                  <div className="w-32 h-32 border-2 border-intro-300 rounded-full animate-spin" />
                </div>
              </div>

              {/* Neural network stage */}
              <div
                ref={neuralNetworkRef}
                className="neural-network absolute inset-0 opacity-0"
                aria-hidden="true"
              >
                <div className="flex justify-center items-center h-full">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 border border-intro-200 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-intro-300 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-4 left-1/2 w-1 h-1 bg-intro-400 rounded-full transform -translate-x-1/2" />
                    <div className="absolute bottom-4 left-1/2 w-1 h-1 bg-intro-400 rounded-full transform -translate-x-1/2" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-6 mb-12">
          <div
            ref={text1Ref}
            className={cn(
              "intro-text-1 text-xl md:text-2xl text-intro-200",
              prefersReducedMotion ? "opacity-100" : "opacity-0"
            )}
            tabIndex={0}
          >
            {t('intro.opening', 'In 2025, while others built features...')}
          </div>

          <div
            ref={text2Ref}
            className={cn(
              "intro-text-2 text-2xl md:text-3xl font-bold text-intro-100",
              prefersReducedMotion ? "opacity-100" : "opacity-0"
            )}
            tabIndex={0}
          >
            {t('intro.vision', 'we built the future.')}
          </div>

          <div
            ref={text3Ref}
            className={cn(
              "intro-text-3 text-xl md:text-2xl text-intro-200",
              prefersReducedMotion ? "opacity-100" : "opacity-0"
            )}
            tabIndex={0}
          >
            {t('intro.welcome', 'Welcome to CODAI - not just an AI company,')}
          </div>

          <div
            ref={text4Ref}
            className={cn(
              "intro-text-4 text-xl md:text-2xl text-intro-100",
              prefersReducedMotion ? "opacity-100" : "opacity-0"
            )}
            tabIndex={0}
          >
            {t('intro.description', 'but an entire ecosystem of intelligence.')}
          </div>
        </div>

        {/* Statistics Counter */}
        <div
          ref={statsRef}
          className={cn(
            "stats-counter grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto",
            prefersReducedMotion ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )}
          tabIndex={0}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-intro-300">47</div>
            <div className="text-intro-200">{t('intro.stats.projects', 'applications')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-intro-300">5</div>
            <div className="text-intro-200">{t('intro.stats.tiers', 'tiers')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-intro-300">1</div>
            <div className="text-intro-200">{t('intro.stats.vision', 'vision')}</div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-lg text-intro-300 mb-8">
          {t('intro.tagline', 'The future of AI. Starting now.')}
        </div>

        {/* CTA Button */}
        <Button
          ref={ctaRef}
          variant="primary"
          size="lg"
          onClick={handleCTAClick}
          className={cn(
            "cta-button transform transition-all duration-300 hover:scale-105",
            "bg-intro-500 hover:bg-intro-400 text-white border-intro-400",
            "shadow-lg hover:shadow-intro-500/25",
            prefersReducedMotion ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          data-testid="intro-cta-button"
          aria-describedby="cta-description"
        >
          {t('intro.cta', 'Explore the Ecosystem')}
        </Button>
        <div id="cta-description" className="sr-only">
          Navigate to explore the complete CODAI ecosystem and its applications
        </div>
      </div>

      {/* Custom Particles CSS */}
      <style jsx>{`
        .particle {
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .particle {
            animation: none;
            opacity: 0.1;
          }
          
          .intro-text-1,
          .intro-text-2, 
          .intro-text-3,
          .intro-text-4,
          .stats-counter,
          .cta-button {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ChapterIntro;