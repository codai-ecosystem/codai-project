import type { ServiceName } from './types';

// Feature flags system for the Codai ecosystem

export interface FeatureFlag {
    name: string;
    enabled: boolean;
    description: string;
    rolloutPercentage?: number;
    services?: ServiceName[];
    conditions?: Record<string, any>;
}

class FeatureFlagManager {
    private flags: Map<string, FeatureFlag> = new Map();

    constructor() {
        this.initializeDefaultFlags();
    }

    private initializeDefaultFlags() {
        const defaultFlags: FeatureFlag[] = [
            {
                name: 'ai_assistant',
                enabled: true,
                description: 'Enable AI assistant features across all services',
                rolloutPercentage: 100,
            },
            {
                name: 'realtime_collaboration',
                enabled: true,
                description: 'Enable real-time collaboration features',
                services: ['aide'],
                rolloutPercentage: 100,
            },
            {
                name: 'advanced_memory',
                enabled: true,
                description: 'Enable advanced memory features and context persistence',
                services: ['memorai'],
                rolloutPercentage: 100,
            },
            {
                name: 'payment_processing',
                enabled: false,
                description: 'Enable payment and billing features',
                services: ['bancai'],
                rolloutPercentage: 0,
            },
            {
                name: 'beta_features',
                enabled: false,
                description: 'Enable beta features for testing',
                rolloutPercentage: 5,
            },
            {
                name: 'analytics_tracking',
                enabled: true,
                description: 'Enable detailed analytics and usage tracking',
                rolloutPercentage: 100,
            },
            {
                name: 'dark_mode',
                enabled: true,
                description: 'Enable dark mode theme',
                rolloutPercentage: 100,
            },
            {
                name: 'multi_language',
                enabled: false,
                description: 'Enable multi-language support',
                rolloutPercentage: 0,
            },
        ];

        defaultFlags.forEach(flag => {
            this.flags.set(flag.name, flag);
        });
    }

    isEnabled(flagName: string, context?: { userId?: string; service?: ServiceName }): boolean {
        const flag = this.flags.get(flagName);
        if (!flag) return false;

        // Check basic enabled status
        if (!flag.enabled) return false;

        // Check service restrictions
        if (flag.services && context?.service && !flag.services.includes(context.service)) {
            return false;
        }

        // Check rollout percentage
        if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
            if (context?.userId) {
                // Simple hash-based rollout
                const hash = this.hashString(context.userId + flagName);
                const percentage = hash % 100;
                return percentage < flag.rolloutPercentage;
            }
            return false;
        }

        return true;
    }

    setFlag(flagName: string, flag: FeatureFlag): void {
        this.flags.set(flagName, flag);
    }

    getFlag(flagName: string): FeatureFlag | undefined {
        return this.flags.get(flagName);
    }

    getAllFlags(): FeatureFlag[] {
        return Array.from(this.flags.values());
    }

    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Global feature flag manager instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export function isFeatureEnabled(flagName: string, context?: { userId?: string; service?: ServiceName }): boolean {
    return featureFlags.isEnabled(flagName, context);
}

export function getFeatureFlag(flagName: string): FeatureFlag | undefined {
    return featureFlags.getFlag(flagName);
}
