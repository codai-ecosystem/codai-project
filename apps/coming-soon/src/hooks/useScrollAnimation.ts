import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  stagger?: number;
  parallax?: boolean;
  animationType?: 'fade-up' | 'fade-left' | 'fade-right' | 'cascade' | 'header' | 'icon' | 'text-stagger' | 'stats';
}

interface ScrollAnimationReturn<T = HTMLElement> {
  elementRef: React.RefObject<T>;
  isVisible: boolean;
  visibilityRatio: number;
  parallaxOffset: { x: number; y: number };
}

export const useScrollAnimation = <T extends HTMLElement = HTMLElement>(options: ScrollAnimationOptions = {}): ScrollAnimationReturn<T> => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    stagger = 0,
    parallax = false,
    animationType = 'fade-up'
  } = options;

  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityRatio, setVisibilityRatio] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const currentVisibilityRatio = entry.intersectionRatio;

    setVisibilityRatio(currentVisibilityRatio);

    if (entry.isIntersecting && currentVisibilityRatio >= (Array.isArray(threshold) ? threshold[0] : threshold)) {
      if (!isVisible) {
        setTimeout(() => {
          setIsVisible(true);

          // Apply animation class based on type
          if (elementRef.current) {
            elementRef.current.classList.add(`scroll-animate-${animationType.replace('-', '-')}`);
            if (stagger > 0) {
              elementRef.current.style.animationDelay = `${stagger}ms`;
            }
          }
        }, stagger);
      }
    } else if (!triggerOnce && !entry.isIntersecting) {
      setIsVisible(false);
      if (elementRef.current) {
        elementRef.current.classList.remove(`scroll-animate-${animationType.replace('-', '-')}`);
      }
    }
  }, [isVisible, threshold, triggerOnce, stagger, animationType]);

  const handleScroll = useCallback(() => {
    if (!parallax || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    const centerX = window.innerWidth / 2;

    const offsetY = (rect.top + rect.height / 2 - centerY) * 0.1;
    const offsetX = (rect.left + rect.width / 2 - centerX) * 0.05;

    setParallaxOffset({ x: offsetX, y: offsetY });
  }, [parallax]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add initial scroll-animate class
    element.classList.add('scroll-animate');

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    // Add scroll listener for parallax
    if (parallax) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      observer.unobserve(element);
      if (parallax) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleIntersection, handleScroll, threshold, rootMargin, parallax]);

  return {
    elementRef,
    isVisible,
    visibilityRatio,
    parallaxOffset
  };
};

// Hook for staggered animations
export const useStaggeredScrollAnimation = (
  count: number,
  baseOptions: ScrollAnimationOptions = {}
) => {
  const animations = Array.from({ length: count }, (_, index) =>
    useScrollAnimation({
      ...baseOptions,
      stagger: (baseOptions.stagger || 0) + index * 100
    })
  );

  return animations;
};

// Hook for scroll progress
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;
      setProgress(Math.min(scrollProgress, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

// Hook for scroll-triggered counter animation
export const useCounterAnimation = (
  endValue: number,
  duration: number = 2000,
  isVisible: boolean = false
) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      setCurrentValue(Math.floor(startValue + (endValue - startValue) * easeOutCubic));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration, isVisible]);

  return currentValue;
};

// Hook for parallax background elements
export const useParallaxBackground = (intensity: number = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * intensity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [intensity]);

  return offset;
};