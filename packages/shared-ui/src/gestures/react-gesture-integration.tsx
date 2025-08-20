/**
 * 🤝 React Gesture Integration Components
 * 
 * React hooks and components that seamlessly integrate the advanced
 * gesture recognition system with React applications. Provides
 * type-safe gesture handling with animation system integration.
 * 
 * @version 2.1.0 - Mobile Touch Optimization Enhanced
 * @author CODAI Ecosystem
 * @created 2025-08-03
 * @updated 2025-08-03 - Day 7 Mobile Touch Optimization
 */

import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import {
    AdvancedGestureEngine,
    GestureEvent,
    GestureType,
    GestureConfig
} from './advanced-gesture-engine';
import {
    GestureContextManager,
    ServiceGestureConfig,
    GestureTheme,
    ID_SERVICE_GESTURES,
    GATEWAY_SERVICE_GESTURES
} from './gesture-service-configs';
import {
    MobileTouchProvider,
    MobileTouchArea,
    MobileGestureFeedback,
    MobileTouchPerformanceMonitor,
    MobileIDServiceArea,
    MobileAdminServiceArea,
    MobileHubServiceArea,
    useMobileTouch,
    useMobileOptimization
} from './mobile-touch-react';

// ==================== GESTURE CONTEXT ====================

interface GestureContextValue {
    gestureEngine: AdvancedGestureEngine | null;
    contextManager: GestureContextManager;
    currentService: string;
    switchService: (serviceName: string) => void;
    isGestureEnabled: (type: GestureType) => boolean;
    theme: GestureTheme | null;
}

const GestureContext = createContext<GestureContextValue | null>(null);

export const GestureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gestureEngine] = useState(() => new AdvancedGestureEngine());
    const [contextManager] = useState(() => new GestureContextManager());
    const [currentService, setCurrentService] = useState('');
    const [theme, setTheme] = useState<GestureTheme | null>(null);

    const switchService = useCallback((serviceName: string) => {
        const serviceConfig = contextManager.switchToService(serviceName);
        if (serviceConfig) {
            setCurrentService(serviceName);
            setTheme(serviceConfig.theme);

            // Register service-specific gestures with the engine
            serviceConfig.gestures.forEach((config, type) => {
                gestureEngine.registerGesture(config);
            });
        }
    }, [gestureEngine, contextManager]);

    const isGestureEnabled = useCallback((type: GestureType) => {
        return contextManager.isGestureEnabled(currentService, type);
    }, [contextManager, currentService]);

    useEffect(() => {
        return () => {
            gestureEngine.destroy();
        };
    }, [gestureEngine]);

    const value: GestureContextValue = {
        gestureEngine,
        contextManager,
        currentService,
        switchService,
        isGestureEnabled,
        theme
    };

    return (
        <GestureContext.Provider value={value}>
            {children}
        </GestureContext.Provider>
    );
};

export const useGestureContext = (): GestureContextValue => {
    const context = useContext(GestureContext);
    if (!context) {
        throw new Error('useGestureContext must be used within a GestureProvider');
    }
    return context;
};

// ==================== GESTURE HOOKS ====================

export interface UseGestureOptions {
    enabled?: boolean;
    service?: string;
    onGesture?: (event: GestureEvent) => void;
    gestureTypes?: GestureType[];
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

export const useGesture = (options: UseGestureOptions = {}) => {
    const { gestureEngine, switchService } = useGestureContext();
    const elementRef = useRef<HTMLElement>(null);
    const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null);
    const [isActive, setIsActive] = useState(false);

    const {
        enabled = true,
        service,
        onGesture,
        gestureTypes = [],
        preventDefault = false,
        stopPropagation = false
    } = options;

    useEffect(() => {
        if (service) {
            switchService(service);
        }
    }, [service, switchService]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled || !gestureEngine) return;

        const handleGesture = (event: CustomEvent<GestureEvent>) => {
            const gestureEvent = event.detail;

            // Filter by gesture types if specified
            if (gestureTypes.length > 0 && !gestureTypes.includes(gestureEvent.type)) {
                return;
            }

            if (preventDefault) {
                event.preventDefault();
            }
            if (stopPropagation) {
                event.stopPropagation();
            }

            setLastGesture(gestureEvent);
            setIsActive(true);

            if (onGesture) {
                onGesture(gestureEvent);
            }

            // Reset active state after animation
            setTimeout(() => {
                setIsActive(false);
            }, 300);
        };

        element.addEventListener('gestureRecognized', handleGesture as EventListener);

        return () => {
            element.removeEventListener('gestureRecognized', handleGesture as EventListener);
        };
    }, [enabled, gestureEngine, onGesture, gestureTypes, preventDefault, stopPropagation]);

    return {
        ref: elementRef,
        lastGesture,
        isActive,
        gestureEngine
    };
};

// ==================== GESTURE COMPONENTS ====================

interface GestureAreaProps {
    service: string;
    onGesture?: (event: GestureEvent) => void;
    enabledGestures?: GestureType[];
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const GestureArea: React.FC<GestureAreaProps> = ({
    service,
    onGesture,
    enabledGestures,
    className = '',
    children,
    style = {}
}) => {
    const { ref, isActive, theme } = useGesture({
        service,
        onGesture,
        gestureTypes: enabledGestures,
        enabled: true
    });

    const dynamicStyle: React.CSSProperties = {
        ...style,
        transition: 'all 0.2s ease',
        ...(isActive && theme && {
            outline: `2px solid ${theme.feedbackColor}`,
            transform: 'scale(1.01)'
        })
    };

    return (
        <div
            ref={ref}
            className={`gesture-area ${className} ${isActive ? 'gesture-active' : ''}`}
            style={dynamicStyle}
        >
            {children}
        </div>
    );
};

// ==================== SERVICE-SPECIFIC COMPONENTS ====================

interface IDServiceGestureAreaProps {
    onQuickLogin?: () => void;
    onSecurityDetails?: () => void;
    onQREnhance?: () => void;
    onEmergencyLock?: () => void;
    className?: string;
    children: React.ReactNode;
}

export const IDServiceGestureArea: React.FC<IDServiceGestureAreaProps> = ({
    onQuickLogin,
    onSecurityDetails,
    onQREnhance,
    onEmergencyLock,
    className = '',
    children
}) => {
    const handleGesture = (event: GestureEvent) => {
        switch (event.type) {
            case GestureType.SWIPE_RIGHT:
                onQuickLogin?.();
                break;
            case GestureType.LONG_PRESS:
                onSecurityDetails?.();
                break;
            case GestureType.PINCH_OUT:
                onQREnhance?.();
                break;
            case GestureType.SWIPE_UP:
                onEmergencyLock?.();
                break;
        }
    };

    return (
        <GestureArea
            service="id-service"
            onGesture={handleGesture}
            enabledGestures={[
                GestureType.SWIPE_RIGHT,
                GestureType.LONG_PRESS,
                GestureType.PINCH_OUT,
                GestureType.SWIPE_UP,
                GestureType.DOUBLE_TAP
            ]}
            className={`id-service-gesture ${className}`}
        >
            {children}
        </GestureArea>
    );
};

interface GatewayServiceGestureAreaProps {
    onShowHealth?: () => void;
    onCollapseMetrics?: () => void;
    onRotateView?: () => void;
    onDebugMode?: () => void;
    onServiceActions?: () => void;
    className?: string;
    children: React.ReactNode;
}

export const GatewayServiceGestureArea: React.FC<GatewayServiceGestureAreaProps> = ({
    onShowHealth,
    onCollapseMetrics,
    onRotateView,
    onDebugMode,
    onServiceActions,
    className = '',
    children
}) => {
    const handleGesture = (event: GestureEvent) => {
        switch (event.type) {
            case GestureType.SWIPE_UP:
                onShowHealth?.();
                break;
            case GestureType.PINCH_IN:
                onCollapseMetrics?.();
                break;
            case GestureType.ROTATE_CLOCKWISE:
                onRotateView?.();
                break;
            case GestureType.TRIPLE_TAP:
                onDebugMode?.();
                break;
            case GestureType.LONG_PRESS:
                onServiceActions?.();
                break;
        }
    };

    return (
        <GestureArea
            service="gateway-service"
            onGesture={handleGesture}
            enabledGestures={[
                GestureType.SWIPE_UP,
                GestureType.PINCH_IN,
                GestureType.ROTATE_CLOCKWISE,
                GestureType.TRIPLE_TAP,
                GestureType.LONG_PRESS
            ]}
            className={`gateway-service-gesture ${className}`}
        >
            {children}
        </GestureArea>
    );
};

// ==================== GESTURE FEEDBACK COMPONENTS ====================

interface Gesturefeedback {
    isVisible: boolean;
    gestureType: GestureType | null;
    position: { x: number; y: number };
    theme: GestureTheme | null;
}

export const GestureFeedback: React.FC<GestureInfo> = ({
    isVisible,
    gestureType,
    position,
    theme
}) => {
    if (!isVisible || !gestureType || !theme) return null;

    const getGestureIcon = (type: GestureType): string => {
        switch (type) {
            case GestureType.SWIPE_UP:
                return '↑';
            case GestureType.SWIPE_DOWN:
                return '↓';
            case GestureType.SWIPE_LEFT:
                return '←';
            case GestureType.SWIPE_RIGHT:
                return '→';
            case GestureType.PINCH_IN:
                return '⊖';
            case GestureType.PINCH_OUT:
                return '⊕';
            case GestureType.LONG_PRESS:
                return '⊙';
            case GestureType.DOUBLE_TAP:
                return '◉';
            case GestureType.ROTATE_CLOCKWISE:
                return '↻';
            default:
                return '●';
        }
    };

    const feedbackStyle: React.CSSProperties = {
        position: 'fixed',
        left: position.x - 20,
        top: position.y - 20,
        width: 40,
        height: 40,
        backgroundColor: theme.feedbackColor,
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: `gestureImpact ${theme.animationDuration}ms ease-out`,
        boxShadow: `0 4px 20px ${theme.feedbackColor}40`
    };

    return (
        <div style={feedbackStyle}>
            {getGestureIcon(gestureType)}
        </div>
    );
};

// ==================== GESTURE PERFORMANCE MONITOR ====================

export const useGesturePerformance = () => {
    const { gestureEngine } = useGestureContext();
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        if (!gestureEngine) return;

        const interval = setInterval(() => {
            const currentMetrics = gestureEngine.getPerformanceMetrics();
            setMetrics(currentMetrics);
        }, 1000);

        return () => clearInterval(interval);
    }, [gestureEngine]);

    return metrics;
};

export const GesturePerformanceDisplay: React.FC<{ className?: string }> = ({
    className = ''
}) => {
    const metrics = useGesturePerformance();

    if (!metrics) return null;

    return (
        <div className={`gesture-performance ${className}`}>
            <h4>Gesture Performance</h4>
            <div>Uptime: {Math.round(metrics.uptime / 1000)}s</div>
            <div>Total Gestures: {Object.values(metrics.gestureCount).reduce((a: any, b: any) => a + b, 0)}</div>
            <div>Avg Latency: {metrics.averageLatency.touchStart?.toFixed(2)}ms</div>
        </div>
    );
};

// ==================== GESTURE ACCESSIBILITY ====================

export const useGestureAccessibility = () => {
    const { contextManager } = useGestureContext();
    const [accessibilitySettings, setAccessibilitySettings] = useState({
        reduceMotion: false,
        highContrast: false,
        largeTargets: false,
        voiceAnnouncements: false
    });

    const updateAccessibility = useCallback((settings: Partial<typeof accessibilitySettings>) => {
        const newSettings = { ...accessibilitySettings, ...settings };
        setAccessibilitySettings(newSettings);
        contextManager.setAccessibilityOverride(newSettings);
    }, [accessibilitySettings, contextManager]);

    return {
        accessibilitySettings,
        updateAccessibility
    };
};

// ==================== CSS STYLES ====================

export const injectGestureStyles = () => {
    const styles = `
    @keyframes gestureImpact {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }

    .gesture-area {
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    .gesture-active {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .id-service-gesture {
      --gesture-primary: #3b82f6;
      --gesture-success: #22c55e;
      --gesture-warning: #f59e0b;
      --gesture-danger: #ef4444;
    }

    .gateway-service-gesture {
      --gesture-primary: #8b5cf6;
      --gesture-success: #10b981;
      --gesture-warning: #f59e0b;
      --gesture-danger: #f43f5e;
    }

    @media (prefers-reduced-motion: reduce) {
      .gesture-area {
        transition: none !important;
        animation: none !important;
      }
    }

    @media (prefers-contrast: high) {
      .gesture-active {
        outline-color: #000;
        outline-width: 3px;
      }
    }
  `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
};

// ==================== MOBILE-ENHANCED GESTURE PROVIDER ====================

export const MobileEnhancedGestureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <MobileTouchProvider>
            <GestureProvider>
                {children}
                <MobileTouchPerformanceMonitor />
            </GestureProvider>
        </MobileTouchProvider>
    );
};

// ==================== EXPORTS ====================

// Core Gesture Components
export { useGesture, useGestureContext, useGesturePerformance, useGestureAccessibility };
export { GestureProvider, GestureArea, IDServiceGestureArea, GatewayServiceGestureArea };
export { GestureFeedback, GesturePerformanceDisplay, injectGestureStyles };

// Mobile Touch Optimization Components
export { MobileTouchProvider, MobileTouchArea, MobileGestureFeedback, MobileTouchPerformanceMonitor };
export { MobileIDServiceArea, MobileAdminServiceArea, MobileHubServiceArea };
export { useMobileTouch, useMobileOptimization };

// Service-Specific Components with Mobile Enhancement
export const AdminGestureArea = MobileAdminServiceArea;
export const HubGestureArea = MobileHubServiceArea;
