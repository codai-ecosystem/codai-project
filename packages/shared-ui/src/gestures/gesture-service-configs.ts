/**
 * 🎯 Gesture Types and Service-Specific Configurations
 * 
 * Comprehensive gesture definitions and service-specific patterns
 * for the CODAI ecosystem. Provides type-safe gesture configurations
 * and service-optimized interaction patterns.
 * 
 * @version 2.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import { GestureType, GestureConfig } from './advanced-gesture-engine';
import { AnimationConfig } from '../animations/core-animation-system';

// ==================== SERVICE-SPECIFIC GESTURE PATTERNS ====================

export interface ServiceGestureConfig {
    serviceName: string;
    gestures: Map<GestureType, GestureConfig>;
    theme: GestureTheme;
    accessibility: AccessibilityConfig;
}

export interface GestureTheme {
    feedbackColor: string;
    successColor: string;
    errorColor: string;
    neutralColor: string;
    animationDuration: number;
}

export interface AccessibilityConfig {
    reduceMotion: boolean;
    highContrast: boolean;
    largeTargets: boolean;
    voiceAnnouncements: boolean;
    alternativeInputs: boolean;
}

// ==================== ID SERVICE GESTURES ====================

export const ID_SERVICE_GESTURES: ServiceGestureConfig = {
    serviceName: 'id-service',
    gestures: new Map([
        [GestureType.SWIPE_RIGHT, {
            type: GestureType.SWIPE_RIGHT,
            threshold: { distance: 120, velocity: 350 },
            animation: {
                name: 'quickLoginSlide',
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                properties: {
                    transform: 'translateX(100px) scale(1.05)',
                    opacity: 0.9
                }
            },
            enabled: true,
            priority: 1
        }],
        [GestureType.LONG_PRESS, {
            type: GestureType.LONG_PRESS,
            threshold: { duration: 800 },
            animation: {
                name: 'securityDetailsExpand',
                duration: 500,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                properties: {
                    transform: 'scale(1.1)',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.PINCH_OUT, {
            type: GestureType.PINCH_OUT,
            threshold: { distance: 60 },
            animation: {
                name: 'qrCodeEnhance',
                duration: 400,
                easing: 'ease-out',
                properties: {
                    transform: 'scale(1.5)',
                    filter: 'brightness(1.2) contrast(1.1)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.DOUBLE_TAP, {
            type: GestureType.DOUBLE_TAP,
            threshold: { duration: 300 },
            animation: {
                name: 'securityScanPulse',
                duration: 600,
                easing: 'ease-in-out',
                properties: {
                    transform: 'scale(1.05)',
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
                }
            },
            enabled: true,
            priority: 3
        }],
        [GestureType.SWIPE_UP, {
            type: GestureType.SWIPE_UP,
            threshold: { distance: 100, velocity: 300 },
            animation: {
                name: 'emergencyLockActivate',
                duration: 250,
                easing: 'ease-out',
                properties: {
                    transform: 'translateY(-20px)',
                    background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                    color: 'white'
                }
            },
            enabled: true,
            priority: 1
        }]
    ]),
    theme: {
        feedbackColor: '#3b82f6',
        successColor: '#22c55e',
        errorColor: '#ef4444',
        neutralColor: '#6b7280',
        animationDuration: 300
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeTargets: true,
        voiceAnnouncements: true,
        alternativeInputs: true
    }
};

// ==================== GATEWAY SERVICE GESTURES ====================

export const GATEWAY_SERVICE_GESTURES: ServiceGestureConfig = {
    serviceName: 'gateway-service',
    gestures: new Map([
        [GestureType.SWIPE_UP, {
            type: GestureType.SWIPE_UP,
            threshold: { distance: 80, velocity: 250 },
            animation: {
                name: 'serviceHealthReveal',
                duration: 400,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                properties: {
                    transform: 'translateY(-10px)',
                    opacity: 1,
                    background: 'rgba(59, 130, 246, 0.05)'
                }
            },
            enabled: true,
            priority: 1
        }],
        [GestureType.PINCH_IN, {
            type: GestureType.PINCH_IN,
            threshold: { distance: 50 },
            animation: {
                name: 'metricsCollapse',
                duration: 350,
                easing: 'ease-in',
                properties: {
                    transform: 'scale(0.8)',
                    opacity: 0.7
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.ROTATE_CLOCKWISE, {
            type: GestureType.ROTATE_CLOCKWISE,
            threshold: { angle: 30 },
            animation: {
                name: 'serviceViewRotate',
                duration: 500,
                easing: 'ease-out',
                properties: {
                    transform: 'rotate(5deg) scale(1.02)',
                    filter: 'hue-rotate(10deg)'
                }
            },
            enabled: true,
            priority: 3
        }],
        [GestureType.TRIPLE_TAP, {
            type: GestureType.TRIPLE_TAP,
            threshold: { duration: 500 },
            animation: {
                name: 'debugModeActivate',
                duration: 300,
                easing: 'ease-out',
                properties: {
                    border: '2px solid #f59e0b',
                    background: 'rgba(245, 158, 11, 0.1)',
                    transform: 'scale(1.02)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.LONG_PRESS, {
            type: GestureType.LONG_PRESS,
            threshold: { duration: 600 },
            animation: {
                name: 'serviceActionsMenu',
                duration: 400,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                properties: {
                    transform: 'scale(1.05)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    zIndex: 100
                }
            },
            enabled: true,
            priority: 2
        }]
    ]),
    theme: {
        feedbackColor: '#8b5cf6',
        successColor: '#10b981',
        errorColor: '#f43f5e',
        neutralColor: '#64748b',
        animationDuration: 350
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeTargets: true,
        voiceAnnouncements: false,
        alternativeInputs: true
    }
};

// ==================== ADMIN SERVICE GESTURES ====================

export const ADMIN_SERVICE_GESTURES: ServiceGestureConfig = {
    serviceName: 'admin-service',
    gestures: new Map([
        [GestureType.SWIPE_LEFT, {
            type: GestureType.SWIPE_LEFT,
            threshold: { distance: 100, velocity: 300 },
            animation: {
                name: 'adminPanelSlide',
                duration: 300,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                properties: {
                    transform: 'translateX(-20px)',
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)'
                }
            },
            enabled: true,
            priority: 1
        }],
        [GestureType.DOUBLE_TAP, {
            type: GestureType.DOUBLE_TAP,
            threshold: { duration: 350 },
            animation: {
                name: 'quickActionActivate',
                duration: 200,
                easing: 'ease-out',
                properties: {
                    transform: 'scale(0.95)',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderColor: '#22c55e'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.LONG_PRESS, {
            type: GestureType.LONG_PRESS,
            threshold: { duration: 700 },
            animation: {
                name: 'adminContextMenu',
                duration: 400,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                properties: {
                    transform: 'scale(1.03)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.PINCH_OUT, {
            type: GestureType.PINCH_OUT,
            threshold: { distance: 70 },
            animation: {
                name: 'dataVisualizationExpand',
                duration: 500,
                easing: 'ease-out',
                properties: {
                    transform: 'scale(1.2)',
                    filter: 'brightness(1.05) saturate(1.1)'
                }
            },
            enabled: true,
            priority: 3
        }]
    ]),
    theme: {
        feedbackColor: '#3b82f6',
        successColor: '#22c55e',
        errorColor: '#ef4444',
        neutralColor: '#6b7280',
        animationDuration: 300
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeTargets: true,
        voiceAnnouncements: true,
        alternativeInputs: true
    }
};

// ==================== HUB SERVICE GESTURES ====================

export const HUB_SERVICE_GESTURES: ServiceGestureConfig = {
    serviceName: 'hub-service',
    gestures: new Map([
        [GestureType.SWIPE_RIGHT, {
            type: GestureType.SWIPE_RIGHT,
            threshold: { distance: 110, velocity: 320 },
            animation: {
                name: 'workflowNavigation',
                duration: 350,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                properties: {
                    transform: 'translateX(15px) scale(1.02)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.05) 100%)'
                }
            },
            enabled: true,
            priority: 1
        }],
        [GestureType.ROTATE_CLOCKWISE, {
            type: GestureType.ROTATE_CLOCKWISE,
            threshold: { angle: 45 },
            animation: {
                name: 'ecosystemRotate',
                duration: 600,
                easing: 'ease-out',
                properties: {
                    transform: 'rotate(3deg) scale(1.01)',
                    filter: 'hue-rotate(5deg) brightness(1.02)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.PINCH_IN, {
            type: GestureType.PINCH_IN,
            threshold: { distance: 55 },
            animation: {
                name: 'networkViewCollapse',
                duration: 400,
                easing: 'ease-in',
                properties: {
                    transform: 'scale(0.85)',
                    opacity: 0.8,
                    filter: 'blur(0.5px)'
                }
            },
            enabled: true,
            priority: 2
        }],
        [GestureType.DOUBLE_TAP, {
            type: GestureType.DOUBLE_TAP,
            threshold: { duration: 300 },
            animation: {
                name: 'serviceConnectionPulse',
                duration: 500,
                easing: 'ease-in-out',
                properties: {
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    transform: 'scale(1.03)'
                }
            },
            enabled: true,
            priority: 3
        }],
        [GestureType.LONG_PRESS, {
            type: GestureType.LONG_PRESS,
            threshold: { duration: 650 },
            animation: {
                name: 'hubControlPanel',
                duration: 450,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                properties: {
                    transform: 'scale(1.04)',
                    boxShadow: '0 25px 50px rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }
            },
            enabled: true,
            priority: 2
        }]
    ]),
    theme: {
        feedbackColor: '#8b5cf6',
        successColor: '#10b981',
        errorColor: '#f43f5e',
        neutralColor: '#64748b',
        animationDuration: 375
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeTargets: true,
        voiceAnnouncements: false,
        alternativeInputs: true
    }
};

// ==================== GESTURE CONTEXT MANAGER ====================

export class GestureContextManager {
    private currentService: string = '';
    private activeGestures: Map<string, ServiceGestureConfig> = new Map();
    private globalOverrides: Partial<AccessibilityConfig> = {};

    constructor() {
        this.initializeServices();
        this.setupAccessibilityObserver();
    }

    private initializeServices(): void {
        this.activeGestures.set('id-service', ID_SERVICE_GESTURES);
        this.activeGestures.set('gateway-service', GATEWAY_SERVICE_GESTURES);
        this.activeGestures.set('admin-service', ADMIN_SERVICE_GESTURES);
        this.activeGestures.set('hub-service', HUB_SERVICE_GESTURES);
    }

    private setupAccessibilityObserver(): void {
        // Monitor for accessibility preference changes
        if (typeof window !== 'undefined' && window.matchMedia) {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            prefersReducedMotion.addEventListener('change', () => {
                this.globalOverrides.reduceMotion = prefersReducedMotion.matches;
                this.updateAllGestureConfigs();
            });

            const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
            prefersHighContrast.addEventListener('change', () => {
                this.globalOverrides.highContrast = prefersHighContrast.matches;
                this.updateAllGestureConfigs();
            });
        }
    }

    public switchToService(serviceName: string): ServiceGestureConfig | null {
        this.currentService = serviceName;
        const config = this.activeGestures.get(serviceName);

        if (config) {
            this.applyAccessibilityOverrides(config);
            return config;
        }

        return null;
    }

    public getCurrentServiceGestures(): ServiceGestureConfig | null {
        return this.activeGestures.get(this.currentService) || null;
    }

    public updateGestureConfig(serviceName: string, gestureType: GestureType, updates: Partial<GestureConfig>): void {
        const serviceConfig = this.activeGestures.get(serviceName);
        if (serviceConfig && serviceConfig.gestures.has(gestureType)) {
            const currentConfig = serviceConfig.gestures.get(gestureType)!;
            const updatedConfig = { ...currentConfig, ...updates };
            serviceConfig.gestures.set(gestureType, updatedConfig);
        }
    }

    public setAccessibilityOverride(overrides: Partial<AccessibilityConfig>): void {
        this.globalOverrides = { ...this.globalOverrides, ...overrides };
        this.updateAllGestureConfigs();
    }

    private applyAccessibilityOverrides(config: ServiceGestureConfig): void {
        if (this.globalOverrides.reduceMotion) {
            config.accessibility.reduceMotion = true;
            config.theme.animationDuration = Math.min(config.theme.animationDuration, 150);
        }

        if (this.globalOverrides.highContrast) {
            config.accessibility.highContrast = true;
            config.theme.feedbackColor = '#0066cc';
            config.theme.successColor = '#008000';
            config.theme.errorColor = '#cc0000';
        }

        if (this.globalOverrides.largeTargets) {
            config.accessibility.largeTargets = true;
        }
    }

    private updateAllGestureConfigs(): void {
        this.activeGestures.forEach(config => {
            this.applyAccessibilityOverrides(config);
        });
    }

    public getAllServiceConfigs(): Map<string, ServiceGestureConfig> {
        return new Map(this.activeGestures);
    }

    public isGestureEnabled(serviceName: string, gestureType: GestureType): boolean {
        const serviceConfig = this.activeGestures.get(serviceName);
        if (!serviceConfig) return false;

        const gestureConfig = serviceConfig.gestures.get(gestureType);
        return gestureConfig ? gestureConfig.enabled : false;
    }

    public getGestureTheme(serviceName: string): GestureTheme | null {
        const serviceConfig = this.activeGestures.get(serviceName);
        return serviceConfig ? serviceConfig.theme : null;
    }
}

// ==================== GESTURE UTILITY FUNCTIONS ====================

export class GestureUtils {
    static createGestureConfig(
        type: GestureType,
        threshold: any,
        animation?: AnimationConfig,
        callback?: (event: any) => void
    ): GestureConfig {
        return {
            type,
            threshold,
            animation,
            callback,
            enabled: true,
            priority: 1
        };
    }

    static combineGestureConfigs(
        config1: ServiceGestureConfig,
        config2: ServiceGestureConfig
    ): ServiceGestureConfig {
        const combined: ServiceGestureConfig = {
            serviceName: `${config1.serviceName}-${config2.serviceName}`,
            gestures: new Map([...config1.gestures, ...config2.gestures]),
            theme: { ...config1.theme, ...config2.theme },
            accessibility: { ...config1.accessibility, ...config2.accessibility }
        };

        return combined;
    }

    static validateGestureConfig(config: GestureConfig): boolean {
        if (!config.type || !config.threshold) return false;
        if (config.priority < 0 || config.priority > 10) return false;
        if (config.animation && !config.animation.name) return false;

        return true;
    }

    static optimizeForDevice(config: ServiceGestureConfig, deviceType: 'mobile' | 'tablet' | 'desktop'): ServiceGestureConfig {
        const optimized = JSON.parse(JSON.stringify(config)); // Deep copy

        switch (deviceType) {
            case 'mobile':
                optimized.accessibility.largeTargets = true;
                optimized.theme.animationDuration = Math.min(optimized.theme.animationDuration, 200);
                break;
            case 'tablet':
                optimized.accessibility.largeTargets = true;
                break;
            case 'desktop':
                optimized.accessibility.largeTargets = false;
                optimized.theme.animationDuration = Math.max(optimized.theme.animationDuration, 250);
                break;
        }

        return optimized;
    }
}

// ==================== EXPORTS ====================

export { GestureContextManager, GestureUtils };
export type { ServiceGestureConfig, GestureTheme, AccessibilityConfig };
