/**
 * 📱 Mobile Touch React Integration
 * 
 * React components and hooks for mobile touch optimization.
 * Provides mobile-specific gesture handling and touch feedback.
 * 
 * @version 1.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import {
    MobileTouchDetector,
    MobileTouchConfig,
    MobileTouchMetrics,
    mobileTouchDetector
} from './mobile-touch-optimization';
import { GestureType } from './advanced-gesture-engine';

// ==================== MOBILE TOUCH PROVIDER ====================

interface MobileTouchContextType {
    detector: MobileTouchDetector;
    metrics: MobileTouchMetrics;
    isMobile: boolean;
    hasHaptics: boolean;
}

const MobileTouchContext = React.createContext<MobileTouchContextType | null>(null);

interface MobileTouchProviderProps {
    children: ReactNode;
    config?: Partial<MobileTouchConfig>;
}

export const MobileTouchProvider: React.FC<MobileTouchProviderProps> = ({ children, config }) => {
    const [detector] = useState(() => new MobileTouchDetector(config));
    const [metrics, setMetrics] = useState<MobileTouchMetrics>(() => detector.getMetrics());
    const [isMobile] = useState(() => detectMobileDevice());
    const [hasHaptics] = useState(() => detectHapticSupport());

    useEffect(() => {
        const updateMetrics = () => {
            setMetrics(detector.getMetrics());
        };

        const interval = setInterval(updateMetrics, 1000);
        return () => clearInterval(interval);
    }, [detector]);

    return (
        <MobileTouchContext.Provider value={{ detector, metrics, isMobile, hasHaptics }}>
            {children}
        </MobileTouchContext.Provider>
    );
};

// ==================== MOBILE TOUCH HOOKS ====================

export const useMobileTouch = () => {
    const context = React.useContext(MobileTouchContext);
    if (!context) {
        throw new Error('useMobileTouch must be used within a MobileTouchProvider');
    }
    return context;
};

export const useMobileTouchMetrics = () => {
    const { metrics } = useMobileTouch();
    return metrics;
};

export const useMobileGestureHandler = (
    onGesture: (type: GestureType, data: any) => void
) => {
    useEffect(() => {
        const handleMobileGesture = (event: CustomEvent) => {
            const { type, data } = event.detail;
            onGesture(type, data);
        };

        document.addEventListener('mobileGesture', handleMobileGesture as EventListener);

        return () => {
            document.removeEventListener('mobileGesture', handleMobileGesture as EventListener);
        };
    }, [onGesture]);
};

// ==================== MOBILE TOUCH AREA COMPONENT ====================

interface MobileTouchAreaProps {
    children: ReactNode;
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onLongPress?: () => void;
    onPinchOut?: () => void;
    onPinchIn?: () => void;
    className?: string;
    touchAreaId?: string;
    sensitivity?: number;
    hapticPattern?: { pattern: number[]; intensity: 'light' | 'medium' | 'heavy' };
}

export const MobileTouchArea: React.FC<MobileTouchAreaProps> = ({
    children,
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onPinchOut,
    onPinchIn,
    className = '',
    touchAreaId = `mobile-touch-${Math.random().toString(36).substr(2, 9)}`,
    sensitivity = 1.0,
    hapticPattern
}) => {
    const touchAreaRef = useRef<HTMLDivElement>(null);
    const { detector, isMobile } = useMobileTouch();
    const [isActive, setIsActive] = useState(false);

    const handleGesture = useCallback((type: GestureType) => {
        const handlers = {
            'swipe_right': onSwipeRight,
            'swipe_left': onSwipeLeft,
            'swipe_up': onSwipeUp,
            'swipe_down': onSwipeDown,
            'long_press': onLongPress,
            'pinch_out': onPinchOut,
            'pinch_in': onPinchIn
        };

        const handler = handlers[type];
        if (handler) {
            setIsActive(true);
            handler();
            setTimeout(() => setIsActive(false), 200);
        }
    }, [onSwipeRight, onSwipeLeft, onSwipeUp, onSwipeDown, onLongPress, onPinchOut, onPinchIn]);

    useMobileGestureHandler(handleGesture);

    useEffect(() => {
        if (touchAreaRef.current) {
            const enabledGestures: GestureType[] = [];

            if (onSwipeRight) enabledGestures.push('swipe_right');
            if (onSwipeLeft) enabledGestures.push('swipe_left');
            if (onSwipeUp) enabledGestures.push('swipe_up');
            if (onSwipeDown) enabledGestures.push('swipe_down');
            if (onLongPress) enabledGestures.push('long_press');
            if (onPinchOut) enabledGestures.push('pinch_out');
            if (onPinchIn) enabledGestures.push('pinch_in');

            detector.registerTouchArea({
                id: touchAreaId,
                element: touchAreaRef.current,
                gestures: enabledGestures,
                sensitivity,
                hapticPattern
            });
        }
    }, [detector, touchAreaId, sensitivity, hapticPattern, onSwipeRight, onSwipeLeft, onSwipeUp, onSwipeDown, onLongPress, onPinchOut, onPinchIn]);

    return (
        <div
            ref={touchAreaRef}
            className={`mobile-touch-area ${className} ${isActive ? 'mobile-touch-active' : ''} ${isMobile ? 'mobile-optimized' : ''}`}
            data-gesture-area={touchAreaId}
            style={{
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                transition: 'transform 0.1s ease-out',
                transform: isActive ? 'scale(0.98)' : 'scale(1)',
                minHeight: isMobile ? '44px' : 'auto',
                minWidth: isMobile ? '44px' : 'auto'
            }}
        >
            {children}
        </div>
    );
};

// ==================== MOBILE GESTURE FEEDBACK ====================

interface MobileGestureFeedbackProps {
    isVisible: boolean;
    gestureType: GestureType | null;
    position: { x: number; y: number };
    theme?: {
        feedbackColor?: string;
        successColor?: string;
        errorColor?: string;
        animationDuration?: number;
    };
}

export const MobileGestureFeedback: React.FC<MobileGestureFeedbackProps> = ({
    isVisible,
    gestureType,
    position,
    theme = {}
}) => {
    const { isMobile } = useMobileTouch();

    if (!isVisible || !gestureType || !isMobile) return null;

    const defaultTheme = {
        feedbackColor: '#3b82f6',
        successColor: '#22c55e',
        errorColor: '#ef4444',
        animationDuration: 300,
        ...theme
    };

    const getGestureIcon = (type: GestureType): string => {
        const icons = {
            'swipe_right': '→',
            'swipe_left': '←',
            'swipe_up': '↑',
            'swipe_down': '↓',
            'long_press': '●',
            'pinch_out': '⤴',
            'pinch_in': '⤵'
        };
        return icons[type] || '●';
    };

    const getGestureColor = (type: GestureType): string => {
        const colors = {
            'swipe_right': defaultTheme.successColor,
            'swipe_left': defaultTheme.feedbackColor,
            'swipe_up': defaultTheme.errorColor,
            'swipe_down': defaultTheme.feedbackColor,
            'long_press': defaultTheme.feedbackColor,
            'pinch_out': defaultTheme.successColor,
            'pinch_in': defaultTheme.feedbackColor
        };
        return colors[type] || defaultTheme.feedbackColor;
    };

    return (
        <div
            className="mobile-gesture-feedback"
            style={{
                position: 'fixed',
                left: position.x - 25,
                top: position.y - 25,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: getGestureColor(gestureType),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 10000,
                animation: `mobileGesturePulse ${defaultTheme.animationDuration}ms ease-out`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
        >
            {getGestureIcon(gestureType)}
        </div>
    );
};

// ==================== MOBILE TOUCH PERFORMANCE MONITOR ====================

export const MobileTouchPerformanceMonitor: React.FC = () => {
    const { metrics, isMobile, hasHaptics } = useMobileTouch();

    if (!isMobile) return null;

    return (
        <div
            className="mobile-touch-performance-monitor"
            style={{
                position: 'fixed',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 9999,
                maxWidth: '200px'
            }}
        >
            <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>
                📱 Mobile Touch Monitor
            </div>
            <div style={{ display: 'grid', gap: '4px' }}>
                <div>Touch Events: {metrics.touchEvents}</div>
                <div>Accuracy: {(metrics.gestureAccuracy * 100).toFixed(1)}%</div>
                <div>Avg Response: {metrics.averageResponseTime.toFixed(1)}ms</div>
                <div>Pressure: {(metrics.touchPressure * 100).toFixed(0)}%</div>
                <div>Multi-Touch: {metrics.multiTouchEvents}</div>
                {hasHaptics && <div>Haptic Events: {metrics.hapticEvents}</div>}
            </div>
        </div>
    );
};

// ==================== MOBILE OPTIMIZATION HOOKS ====================

export const useMobileOptimization = () => {
    const { isMobile } = useMobileTouch();

    useEffect(() => {
        if (isMobile) {
            // Add mobile-specific CSS
            const style = document.createElement('style');
            style.textContent = `
        .mobile-touch-area {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .mobile-touch-active {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        
        .mobile-optimized {
          touch-action: manipulation;
          -webkit-touch-callout: none;
        }
        
        @keyframes mobileGesturePulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        @media (max-width: 768px) {
          .mobile-touch-area {
            min-height: 44px;
            min-width: 44px;
            padding: 8px;
          }
        }
      `;
            document.head.appendChild(style);

            return () => {
                document.head.removeChild(style);
            };
        }
    }, [isMobile]);

    return { isMobile };
};

// ==================== UTILITY FUNCTIONS ====================

function detectMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0);
}

function detectHapticSupport(): boolean {
    return 'vibrate' in navigator ||
        'hapticActuators' in navigator ||
        ('webkitVibrate' in navigator);
}

// ==================== SERVICE-SPECIFIC MOBILE COMPONENTS ====================

export const MobileIDServiceArea: React.FC<{
    children: ReactNode;
    onQuickLogin?: () => void;
    onSecurityDetails?: () => void;
    onQREnhance?: () => void;
    onEmergencyLock?: () => void;
    className?: string;
}> = ({ children, onQuickLogin, onSecurityDetails, onQREnhance, onEmergencyLock, className }) => (
    <MobileTouchArea
        onSwipeRight={onQuickLogin}
        onLongPress={onSecurityDetails}
        onPinchOut={onQREnhance}
        onSwipeUp={onEmergencyLock}
        className={className}
        hapticPattern={{ pattern: [50], intensity: 'medium' }}
    >
        {children}
    </MobileTouchArea>
);

export const MobileAdminServiceArea: React.FC<{
    children: ReactNode;
    onQuickRefresh?: () => void;
    onSystemMonitor?: () => void;
    onUserManagement?: () => void;
    onBulkOperations?: () => void;
    onQuickFilters?: () => void;
    onEmergencyDashboard?: () => void;
    className?: string;
}> = ({ children, onQuickRefresh, onSystemMonitor, onUserManagement, onBulkOperations, onQuickFilters, onEmergencyDashboard, className }) => (
    <MobileTouchArea
        onSwipeRight={onQuickRefresh}
        onPinchOut={onSystemMonitor}
        onLongPress={onUserManagement}
        onSwipeLeft={onBulkOperations}
        onPinchIn={onQuickFilters}
        onSwipeUp={onEmergencyDashboard}
        className={className}
        hapticPattern={{ pattern: [100], intensity: 'medium' }}
    >
        {children}
    </MobileTouchArea>
);

export const MobileHubServiceArea: React.FC<{
    children: ReactNode;
    onNetworkTopology?: () => void;
    onServiceOrchestration?: () => void;
    onWorkflowManagement?: () => void;
    onRealTimeMonitoring?: () => void;
    onQuickActions?: () => void;
    onEmergencyControl?: () => void;
    className?: string;
}> = ({ children, onNetworkTopology, onServiceOrchestration, onWorkflowManagement, onRealTimeMonitoring, onQuickActions, onEmergencyControl, className }) => (
    <MobileTouchArea
        onLongPress={onNetworkTopology}
        onSwipeRight={onServiceOrchestration}
        onPinchIn={onWorkflowManagement}
        onPinchOut={onRealTimeMonitoring}
        onSwipeLeft={onQuickActions}
        onSwipeUp={onEmergencyControl}
        className={className}
        hapticPattern={{ pattern: [50, 50], intensity: 'heavy' }}
    >
        {children}
    </MobileTouchArea>
);
