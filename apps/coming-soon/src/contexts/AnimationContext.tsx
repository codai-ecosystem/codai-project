'use client'

import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin)
}

// Animation timing configuration
export const ANIMATION_CONFIG = {
  // Duration presets
  durations: {
    instant: 0.1,
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
    slower: 1.2,
    cinematic: 2.0,
  },

  // Easing presets
  easings: {
    // Smooth and natural
    ease: 'power2.out',
    easeIn: 'power2.in',
    easeOut: 'power2.out',
    easeInOut: 'power2.inOut',

    // Bouncy and playful
    bounce: 'back.out(1.7)',
    bounceIn: 'back.in(1.7)',
    bounceOut: 'back.out(1.7)',

    // Elastic and dynamic
    elastic: 'elastic.out(1, 0.3)',
    elasticIn: 'elastic.in(1, 0.3)',
    elasticOut: 'elastic.out(1, 0.3)',

    // Sharp and precise
    expo: 'expo.out',
    expoIn: 'expo.in',
    expoOut: 'expo.out',

    // Smooth curves
    circ: 'circ.out',
    circIn: 'circ.in',
    circOut: 'circ.out',

    // Linear for precise timing
    none: 'none',
  },

  // Stagger configurations
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
    slower: 0.3,
  },

  // Performance settings
  performance: {
    force3D: true,
    willChange: 'transform',
    transformOrigin: '50% 50%',
  },

  // Scroll trigger defaults
  scrollTrigger: {
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
}

interface AnimationContextType {
  gsap: typeof gsap
  config: typeof ANIMATION_CONFIG
  isReduced: boolean
  createTimeline: () => gsap.core.Timeline
  createScrollAnimation: (element: HTMLElement, animation: gsap.core.Tween) => ScrollTrigger
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

interface AnimationProviderProps {
  children: ReactNode
  reducedMotion?: boolean
}

export function AnimationProvider({ children, reducedMotion = false }: AnimationProviderProps) {
  const isReducedRef = useRef(reducedMotion)

  useEffect(() => {
    // Detect user's motion preferences
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      isReducedRef.current = reducedMotion || mediaQuery.matches

      // Listen for changes in motion preferences
      const handleChange = (e: MediaQueryListEvent) => {
        isReducedRef.current = reducedMotion || e.matches
      }

      mediaQuery.addEventListener('change', handleChange)

      // Set global GSAP defaults for performance
      gsap.defaults({
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easings.ease,
        force3D: ANIMATION_CONFIG.performance.force3D,
      })

      // Configure ScrollTrigger defaults
      ScrollTrigger.defaults({
        toggleActions: ANIMATION_CONFIG.scrollTrigger.toggleActions,
        markers: process.env.NODE_ENV === 'development' && false, // Enable for debugging
      })

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [reducedMotion])

  const createTimeline = () => {
    const tl = gsap.timeline({
      defaults: {
        ease: ANIMATION_CONFIG.easings.ease,
        duration: isReducedRef.current
          ? ANIMATION_CONFIG.durations.instant
          : ANIMATION_CONFIG.durations.normal,
      },
    })

    return tl
  }

  const createScrollAnimation = (element: HTMLElement, animation: gsap.core.Tween) => {
    return ScrollTrigger.create({
      trigger: element,
      ...ANIMATION_CONFIG.scrollTrigger,
      animation: animation,
      onToggle: (self) => {
        // Add performance optimization class
        if (self.isActive) {
          element.style.willChange = 'transform'
        } else {
          element.style.willChange = 'auto'
        }
      },
    })
  }

  const contextValue: AnimationContextType = {
    gsap,
    config: ANIMATION_CONFIG,
    isReduced: isReducedRef.current,
    createTimeline,
    createScrollAnimation,
  }

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}

// Custom hooks for common animations
export function useRevealAnimation(ref: React.RefObject<HTMLElement>, delay = 0) {
  const { gsap, config, isReduced } = useAnimation()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Set initial state
    gsap.set(element, {
      y: isReduced ? 0 : 50,
      opacity: isReduced ? 1 : 0,
      ...config.performance,
    })

    // Create reveal animation
    const animation = gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: isReduced ? config.durations.instant : config.durations.slow,
      ease: config.easings.easeOut,
      delay,
    })

    // Create scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      animation: animation,
      toggleActions: 'play none none reverse',
    })

    return () => {
      trigger.kill()
      animation.kill()
    }
  }, [ref, delay, gsap, config, isReduced])
}

export function useStaggerRevealAnimation(
  refs: React.RefObject<HTMLElement>[],
  staggerDelay = ANIMATION_CONFIG.stagger.normal
) {
  const { gsap, config, isReduced } = useAnimation()

  useEffect(() => {
    const elements = refs.map(ref => ref.current).filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    // Set initial state
    gsap.set(elements, {
      y: isReduced ? 0 : 50,
      opacity: isReduced ? 1 : 0,
      ...config.performance,
    })

    // Create staggered animation
    const animation = gsap.to(elements, {
      y: 0,
      opacity: 1,
      duration: isReduced ? config.durations.instant : config.durations.slow,
      ease: config.easings.easeOut,
      stagger: isReduced ? 0 : staggerDelay,
    })

    // Create scroll trigger for the first element
    const trigger = ScrollTrigger.create({
      trigger: elements[0],
      start: 'top 85%',
      animation: animation,
      toggleActions: 'play none none reverse',
    })

    return () => {
      trigger.kill()
      animation.kill()
    }
  }, [refs, staggerDelay, gsap, config, isReduced])
}

export function useParallaxAnimation(
  ref: React.RefObject<HTMLElement>,
  speed = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  const { gsap, isReduced } = useAnimation()

  useEffect(() => {
    if (!ref.current || isReduced) return

    const element = ref.current

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress
        const movement = (progress - 0.5) * speed * 100

        if (direction === 'vertical') {
          gsap.set(element, { y: movement })
        } else {
          gsap.set(element, { x: movement })
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [ref, speed, direction, gsap, isReduced])
}

export function useFloatingAnimation(ref: React.RefObject<HTMLElement>, intensity = 20) {
  const { gsap, config, isReduced } = useAnimation()

  useEffect(() => {
    if (!ref.current || isReduced) return

    const element = ref.current

    // Create floating animation
    const animation = gsap.to(element, {
      y: intensity,
      duration: config.durations.cinematic,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    return () => {
      animation.kill()
    }
  }, [ref, intensity, gsap, config, isReduced])
}

export default AnimationProvider