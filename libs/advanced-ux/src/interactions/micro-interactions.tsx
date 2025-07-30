import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, useSpring } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useSpring as useReactSpring, animated, config } from 'react-spring';

// Micro-interaction Types
export interface MicroInteraction {
  id: string;
  name: string;
  trigger: 'hover' | 'click' | 'focus' | 'scroll' | 'gesture' | 'time' | 'data';
  animation: {
    type: 'scale' | 'rotate' | 'translate' | 'opacity' | 'color' | 'morphology' | 'physics';
    properties: Record<string, any>;
    duration?: number;
    delay?: number;
    easing?: string;
    repeat?: number | boolean;
  };
  feedback?: {
    haptic?: boolean;
    audio?: string;
    visual?: string;
  };
  conditions?: {
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    prefersReducedMotion?: boolean;
    connectionSpeed?: 'slow' | 'fast';
  };
  analytics?: {
    trackTrigger?: boolean;
    trackCompletion?: boolean;
    customEvents?: string[];
  };
}

export interface InteractionState {
  triggeredInteractions: Set<string>;
  activeInteractions: Set<string>;
  interactionHistory: Array<{
    interactionId: string;
    timestamp: Date;
    trigger: string;
    duration: number;
  }>;
  preferences: {
    reducedMotion: boolean;
    hapticFeedback: boolean;
    audioFeedback: boolean;
  };
}

// Micro-interaction Context
interface MicroInteractionContextType {
  interactions: Map<string, MicroInteraction>;
  state: InteractionState;
  triggerInteraction: (interactionId: string, data?: any) => Promise<void>;
  registerInteraction: (interaction: MicroInteraction) => void;
  unregisterInteraction: (interactionId: string) => void;
  updatePreferences: (preferences: Partial<InteractionState['preferences']>) => void;
  isInteractionActive: (interactionId: string) => boolean;
  getInteractionHistory: (interactionId?: string) => any[];
}

const MicroInteractionContext = createContext<MicroInteractionContextType | null>(null);

export const useMicroInteractions = () => {
  const context = useContext(MicroInteractionContext);
  if (!context) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionProvider');
  }
  return context;
};

// Micro-interaction Provider
export interface MicroInteractionProviderProps {
  children: React.ReactNode;
  interactions?: MicroInteraction[];
  analytics?: {
    trackingEnabled?: boolean;
    customTracker?: (event: string, data: any) => void;
  };
  hapticEnabled?: boolean;
  audioEnabled?: boolean;
}

export const MicroInteractionProvider: React.FC<MicroInteractionProviderProps> = ({
  children,
  interactions = [],
  analytics,
  hapticEnabled = true,
  audioEnabled = true,
}) => {
  const [interactionsMap] = useState(() => new Map(interactions.map(int => [int.id, int])));
  const [state, setState] = useState<InteractionState>({
    triggeredInteractions: new Set(),
    activeInteractions: new Set(),
    interactionHistory: [],
    preferences: {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hapticFeedback: hapticEnabled,
      audioFeedback: audioEnabled,
    },
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const hapticSupportRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize audio context
    if (audioEnabled && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }

    // Check haptic support
    if ('vibrate' in navigator) {
      hapticSupportRef.current = true;
    }

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setState(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          reducedMotion: e.matches,
        },
      }));
    };

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    return () => mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
  }, [audioEnabled]);

  const playHapticFeedback = useCallback((pattern: number[] = [100]) => {
    if (state.preferences.hapticFeedback && hapticSupportRef.current) {
      navigator.vibrate(pattern);
    }
  }, [state.preferences.hapticFeedback]);

  const playAudioFeedback = useCallback((audioUrl?: string) => {
    if (state.preferences.audioFeedback && audioContextRef.current && audioUrl) {
      fetch(audioUrl)
        .then(response => response.arrayBuffer())
        .then(data => audioContextRef.current!.decodeAudioData(data))
        .then(buffer => {
          const source = audioContextRef.current!.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current!.destination);
          source.start();
        })
        .catch(console.error);
    }
  }, [state.preferences.audioFeedback]);

  const trackEvent = useCallback((event: string, data: any) => {
    if (analytics?.trackingEnabled && analytics?.customTracker) {
      analytics.customTracker(event, data);
    }
  }, [analytics]);

  const triggerInteraction = useCallback(async (interactionId: string, data?: any) => {
    const interaction = interactionsMap.get(interactionId);
    if (!interaction) {
      console.warn(`Interaction with id "${interactionId}" not found`);
      return;
    }

    // Check conditions
    if (interaction.conditions) {
      const { deviceType, prefersReducedMotion, connectionSpeed } = interaction.conditions;

      if (deviceType) {
        const currentDevice = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
        if (currentDevice !== deviceType) return;
      }

      if (prefersReducedMotion !== undefined && prefersReducedMotion !== state.preferences.reducedMotion) {
        return;
      }

      if (connectionSpeed) {
        const connection = (navigator as any).connection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        if ((connectionSpeed === 'slow' && !isSlowConnection) || (connectionSpeed === 'fast' && isSlowConnection)) {
          return;
        }
      }
    }

    const startTime = Date.now();

    // Mark as active
    setState(prev => ({
      ...prev,
      activeInteractions: new Set([...prev.activeInteractions, interactionId]),
      triggeredInteractions: new Set([...prev.triggeredInteractions, interactionId]),
    }));

    // Track trigger event
    if (interaction.analytics?.trackTrigger) {
      trackEvent('micro_interaction_triggered', {
        interactionId,
        trigger: interaction.trigger,
        data,
        timestamp: new Date(),
      });
    }

    // Play feedback
    if (interaction.feedback?.haptic) {
      playHapticFeedback();
    }
    if (interaction.feedback?.audio) {
      playAudioFeedback(interaction.feedback.audio);
    }

    // Wait for animation duration
    const duration = interaction.animation.duration || 300;
    await new Promise(resolve => setTimeout(resolve, duration));

    // Mark as inactive and record history
    setState(prev => {
      const newActiveInteractions = new Set(prev.activeInteractions);
      newActiveInteractions.delete(interactionId);

      return {
        ...prev,
        activeInteractions: newActiveInteractions,
        interactionHistory: [
          ...prev.interactionHistory,
          {
            interactionId,
            timestamp: new Date(startTime),
            trigger: interaction.trigger,
            duration: Date.now() - startTime,
          },
        ],
      };
    });

    // Track completion event
    if (interaction.analytics?.trackCompletion) {
      trackEvent('micro_interaction_completed', {
        interactionId,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });
    }
  }, [interactionsMap, state.preferences, trackEvent, playHapticFeedback, playAudioFeedback]);

  const registerInteraction = useCallback((interaction: MicroInteraction) => {
    interactionsMap.set(interaction.id, interaction);
  }, [interactionsMap]);

  const unregisterInteraction = useCallback((interactionId: string) => {
    interactionsMap.delete(interactionId);
  }, [interactionsMap]);

  const updatePreferences = useCallback((preferences: Partial<InteractionState['preferences']>) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences,
      },
    }));
  }, []);

  const isInteractionActive = useCallback((interactionId: string) => {
    return state.activeInteractions.has(interactionId);
  }, [state.activeInteractions]);

  const getInteractionHistory = useCallback((interactionId?: string) => {
    if (interactionId) {
      return state.interactionHistory.filter(h => h.interactionId === interactionId);
    }
    return state.interactionHistory;
  }, [state.interactionHistory]);

  const contextValue: MicroInteractionContextType = {
    interactions: interactionsMap,
    state,
    triggerInteraction,
    registerInteraction,
    unregisterInteraction,
    updatePreferences,
    isInteractionActive,
    getInteractionHistory,
  };

  return (
    <MicroInteractionContext.Provider value={contextValue}>
      {children}
    </MicroInteractionContext.Provider>
  );
};

// Interactive Element Component
export interface InteractiveElementProps {
  children: React.ReactNode;
  interactions?: string[]; // IDs of interactions to trigger
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  disabled?: boolean;
  onInteractionTrigger?: (interactionId: string) => void;
  gestureEnabled?: boolean;
  hoverInteraction?: string;
  clickInteraction?: string;
  focusInteraction?: string;
}

export const InteractiveElement: React.FC<InteractiveElementProps> = ({
  children,
  interactions = [],
  className = '',
  as: Element = 'div',
  disabled = false,
  onInteractionTrigger,
  gestureEnabled = false,
  hoverInteraction,
  clickInteraction,
  focusInteraction,
  ...props
}) => {
  const { triggerInteraction, interactions: allInteractions } = useMicroInteractions();
  const elementRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // React Spring animations
  const [springProps, springApi] = useReactSpring(() => ({
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    opacity: 1,
    config: config.wobbly,
  }));

  // Gesture handling
  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y], velocity: [vx, vy], down }) => {
        if (!gestureEnabled || disabled) return;

        springApi.start({
          x: down ? x : 0,
          y: down ? y : 0,
          scale: down ? 1.1 : 1,
          immediate: down,
        });

        if (down) {
          triggerInteraction('drag_interaction', { x, y, vx, vy });
        }
      },
      onPinch: ({ offset: [scale], down }) => {
        if (!gestureEnabled || disabled) return;

        springApi.start({
          scale: down ? scale : 1,
          immediate: down,
        });

        if (down) {
          triggerInteraction('pinch_interaction', { scale });
        }
      },
      onWheel: ({ direction: [, dy] }) => {
        if (!gestureEnabled || disabled) return;

        triggerInteraction('wheel_interaction', { direction: dy });
      },
    },
    {
      drag: { threshold: 10 },
      pinch: { threshold: 0.1 },
    }
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;

    setIsHovered(true);

    if (hoverInteraction) {
      triggerInteraction(hoverInteraction);
      onInteractionTrigger?.(hoverInteraction);
    }

    springApi.start({
      scale: 1.05,
      config: config.gentle,
    });
  }, [disabled, hoverInteraction, triggerInteraction, onInteractionTrigger, springApi]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);

    springApi.start({
      scale: 1,
      config: config.gentle,
    });
  }, [springApi]);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (clickInteraction) {
      triggerInteraction(clickInteraction);
      onInteractionTrigger?.(clickInteraction);
    }

    // Trigger all associated interactions
    interactions.forEach(interactionId => {
      const interaction = allInteractions.get(interactionId);
      if (interaction?.trigger === 'click') {
        triggerInteraction(interactionId);
        onInteractionTrigger?.(interactionId);
      }
    });

    // Click animation
    springApi.start({
      scale: 0.95,
      config: config.wobbly,
    }).then(() => {
      springApi.start({
        scale: isHovered ? 1.05 : 1,
        config: config.gentle,
      });
    });
  }, [disabled, clickInteraction, interactions, allInteractions, triggerInteraction, onInteractionTrigger, springApi, isHovered]);

  const handleFocus = useCallback(() => {
    if (disabled) return;

    setIsFocused(true);

    if (focusInteraction) {
      triggerInteraction(focusInteraction);
      onInteractionTrigger?.(focusInteraction);
    }
  }, [disabled, focusInteraction, triggerInteraction, onInteractionTrigger]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const combinedProps = {
    ...props,
    ...(gestureEnabled ? bind() : {}),
    ref: elementRef,
    className: `interactive-element ${className} ${disabled ? 'disabled' : ''} ${isHovered ? 'hovered' : ''} ${isFocused ? 'focused' : ''} ${isPressed ? 'pressed' : ''}`,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
    'data-interactive': true,
    'data-gesture-enabled': gestureEnabled,
  };

  return (
    <animated.div style={springProps} className="interactive-wrapper">
      <Element {...combinedProps}>
        {children}
      </Element>
    </animated.div>
  );
};

// Button with micro-interactions
export interface InteractiveButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationEnd'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  rippleEffect?: boolean;
  pulseOnHover?: boolean;
  morphOnClick?: boolean;
  hapticFeedback?: boolean;
  children: React.ReactNode;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  error = false,
  rippleEffect = true,
  pulseOnHover = true,
  morphOnClick = true,
  hapticFeedback = true,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const { triggerInteraction } = useMicroInteractions();
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [buttonSpring, buttonApi] = useReactSpring(() => ({
    scale: 1,
    rotateZ: 0,
    backgroundColor: '#3b82f6',
    config: config.wobbly,
  }));

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback
    if (hapticFeedback) {
      triggerInteraction('button_click_haptic');
    }

    // Ripple effect
    if (rippleEffect && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = `ripple-${Date.now()}`;

      setRipples(prev => [...prev, { id, x, y }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);
    }

    // Morph animation
    if (morphOnClick) {
      buttonApi.start({
        scale: 0.95,
        rotateZ: success ? 360 : error ? -10 : 0,
        backgroundColor: success ? '#10b981' : error ? '#ef4444' : '#3b82f6',
        config: config.wobbly,
      }).then(() => {
        buttonApi.start({
          scale: 1,
          rotateZ: 0,
          config: config.gentle,
        });
      });
    }

    onClick?.(event);
  }, [disabled, loading, hapticFeedback, rippleEffect, morphOnClick, success, error, triggerInteraction, buttonApi, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || loading) return;

    if (pulseOnHover) {
      buttonApi.start({
        scale: 1.05,
        config: config.gentle,
      });
    }
  }, [disabled, loading, pulseOnHover, buttonApi]);

  const handleMouseLeave = useCallback(() => {
    buttonApi.start({
      scale: 1,
      config: config.gentle,
    });
  }, [buttonApi]);

  return (
    <animated.button
      {...props}
      ref={buttonRef}
      style={buttonSpring}
      className={`interactive-button interactive-button--${variant} interactive-button--${size} ${className} ${loading ? 'loading' : ''} ${success ? 'success' : ''} ${error ? 'error' : ''}`}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="interactive-button__content">
        {loading && (
          <motion.div
            className="interactive-button__spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {success && (
          <motion.div
            className="interactive-button__checkmark"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            ✓
          </motion.div>
        )}
        {error && (
          <motion.div
            className="interactive-button__error"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            ✕
          </motion.div>
        )}
        {!loading && !success && !error && children}
      </span>

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="interactive-button__ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </animated.button>
  );
};

// Scroll-triggered micro-interactions
export interface ScrollInteractionProps {
  children: React.ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  interactionId?: string;
  onEnter?: () => void;
  onExit?: () => void;
  className?: string;
}

export const ScrollInteraction: React.FC<ScrollInteractionProps> = ({
  children,
  threshold = 0.1,
  triggerOnce = false,
  interactionId,
  onEnter,
  onExit,
  className = '',
}) => {
  const { triggerInteraction } = useMicroInteractions();
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useReactSpring(() => ({
    opacity: 0,
    y: 50,
    scale: 0.8,
    config: config.gentle,
  }));

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasTriggered || !triggerOnce) {
            if (interactionId) {
              triggerInteraction(interactionId);
            }

            api.start({
              opacity: 1,
              y: 0,
              scale: 1,
            });

            onEnter?.();
            setHasTriggered(true);
          }
        } else {
          if (!triggerOnce) {
            api.start({
              opacity: 0,
              y: 50,
              scale: 0.8,
            });

            onExit?.();
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [threshold, triggerOnce, interactionId, hasTriggered, triggerInteraction, onEnter, onExit, api]);

  return (
    <animated.div
      ref={elementRef}
      style={springs}
      className={`scroll-interaction ${className}`}
    >
      {children}
    </animated.div>
  );
};

export default {
  MicroInteractionProvider,
  InteractiveElement,
  InteractiveButton,
  ScrollInteraction,
  useMicroInteractions,
};
