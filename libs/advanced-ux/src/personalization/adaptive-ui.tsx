import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Personalization Types
export interface UserProfile {
  id: string;
  demographics?: {
    age?: number;
    location?: string;
    language?: string;
    timezone?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme?: string;
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    notifications: boolean;
    privacy: 'public' | 'private' | 'custom';
    layout?: 'compact' | 'comfortable' | 'spacious';
  };
  behavior: {
    visitCount: number;
    lastVisit: Date;
    averageSessionDuration: number;
    preferredFeatures: string[];
    interactionPatterns: Record<string, number>;
    conversionEvents: string[];
  };
  context: {
    device: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
    connectionSpeed: 'slow' | 'fast';
    currentUrl: string;
    referrer?: string;
  };
  segments: string[];
  customData?: Record<string, any>;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }>;
  actions: Array<{
    type: 'show' | 'hide' | 'modify' | 'redirect' | 'track';
    target: string;
    parameters: Record<string, any>;
  }>;
  priority: number;
  active: boolean;
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    timeZone?: string;
  };
  audience?: {
    segments?: string[];
    percentage?: number;
  };
}

export interface ContentVariant {
  id: string;
  name: string;
  content: React.ReactNode | string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  weight?: number;
  performance?: {
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
}

export interface PersonalizationState {
  profile: UserProfile | null;
  rules: Map<string, PersonalizationRule>;
  activeRules: Set<string>;
  contentVariants: Map<string, ContentVariant[]>;
  appliedPersonalizations: Map<string, any>;
  experiments: Map<string, {
    id: string;
    variant: string;
    startTime: Date;
  }>;
}

// Personalization Context
interface PersonalizationContextType {
  state: PersonalizationState;
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getPersonalizedContent: (contentId: string, defaultContent?: React.ReactNode) => React.ReactNode;
  shouldShowElement: (elementId: string) => boolean;
  trackInteraction: (action: string, element: string, data?: any) => void;
  getRecommendations: (type: string, limit?: number) => any[];
  setPreference: (key: string, value: any) => void;
  getPreference: (key: string, defaultValue?: any) => any;
  joinExperiment: (experimentId: string) => string;
  recordConversion: (goal: string, value?: number) => void;
  isInAudience: (audienceId: string) => boolean;
}

const PersonalizationContext = createContext<PersonalizationContextType | null>(null);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

// Personalization Provider
export interface PersonalizationProviderProps {
  children: React.ReactNode;
  userId?: string;
  rules?: PersonalizationRule[];
  onProfileUpdate?: (profile: UserProfile) => void;
  onPersonalizationApplied?: (rule: PersonalizationRule, element: string) => void;
  enableBehaviorTracking?: boolean;
  enableAutoSegmentation?: boolean;
  enableRecommendations?: boolean;
  apiEndpoint?: string;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({
  children,
  userId,
  rules = [],
  onProfileUpdate,
  onPersonalizationApplied,
  enableBehaviorTracking = true,
  enableAutoSegmentation = true,
  enableRecommendations = true,
  apiEndpoint,
}) => {
  const [state, setState] = useState<PersonalizationState>({
    profile: null,
    rules: new Map(rules.map(r => [r.id, r])),
    activeRules: new Set(),
    contentVariants: new Map(),
    appliedPersonalizations: new Map(),
    experiments: new Map(),
  });

  const behaviorTrackerRef = useRef<{
    interactions: Array<{ action: string; element: string; timestamp: Date; data?: any }>;
    sessionStart: Date;
  }>({
    interactions: [],
    sessionStart: new Date(),
  });

  // Initialize user profile
  const initializeProfile = useCallback(async () => {
    let profile: UserProfile;

    if (userId && apiEndpoint) {
      // Fetch profile from API
      try {
        const response = await fetch(`${apiEndpoint}/profiles/${userId}`);
        if (response.ok) {
          profile = await response.json();
        } else {
          throw new Error('Profile not found');
        }
      } catch (error) {
        // Create new profile if not found
        profile = createDefaultProfile(userId);
      }
    } else {
      // Load from localStorage or create new
      const savedProfile = localStorage.getItem(`personalization_profile_${userId || 'anonymous'}`);
      if (savedProfile) {
        profile = JSON.parse(savedProfile);
      } else {
        profile = createDefaultProfile(userId || `anonymous_${Date.now()}`);
      }
    }

    setState(prev => ({ ...prev, profile }));
    return profile;
  }, [userId, apiEndpoint]);

  // Create default profile
  const createDefaultProfile = useCallback((id: string): UserProfile => {
    const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      if (window.innerWidth < 768) return 'mobile';
      if (window.innerWidth < 1024) return 'tablet';
      return 'desktop';
    };

    const getBrowser = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    const getOS = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Windows')) return 'Windows';
      if (userAgent.includes('Mac')) return 'macOS';
      if (userAgent.includes('Linux')) return 'Linux';
      if (userAgent.includes('Android')) return 'Android';
      if (userAgent.includes('iOS')) return 'iOS';
      return 'Unknown';
    };

    return {
      id,
      preferences: {
        theme: 'auto',
        fontSize: 'medium',
        animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        notifications: true,
        privacy: 'private',
        layout: 'comfortable',
      },
      behavior: {
        visitCount: 1,
        lastVisit: new Date(),
        averageSessionDuration: 0,
        preferredFeatures: [],
        interactionPatterns: {},
        conversionEvents: [],
      },
      context: {
        device: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        connectionSpeed: (navigator as any).connection?.effectiveType === '4g' ? 'fast' : 'slow',
        currentUrl: window.location.href,
        referrer: document.referrer,
      },
      segments: [],
    };
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.profile) return;

    const updatedProfile = { ...state.profile, ...updates };
    setState(prev => ({ ...prev, profile: updatedProfile }));

    // Save to localStorage
    localStorage.setItem(
      `personalization_profile_${updatedProfile.id}`,
      JSON.stringify(updatedProfile)
    );

    // Save to API if available
    if (apiEndpoint) {
      try {
        await fetch(`${apiEndpoint}/profiles/${updatedProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile),
        });
      } catch (error) {
        console.warn('Failed to save profile to API:', error);
      }
    }

    onProfileUpdate?.(updatedProfile);
  }, [state.profile, apiEndpoint, onProfileUpdate]);

  // Evaluate personalization rules
  const evaluateRules = useCallback(() => {
    if (!state.profile) return;

    const activeRules = new Set<string>();

    state.rules.forEach(rule => {
      if (!rule.active) return;

      // Check schedule
      if (rule.schedule) {
        const now = new Date();
        if (rule.schedule.startDate && now < rule.schedule.startDate) return;
        if (rule.schedule.endDate && now > rule.schedule.endDate) return;
      }

      // Check audience
      if (rule.audience) {
        if (rule.audience.segments && !rule.audience.segments.some(s => state.profile!.segments.includes(s))) {
          return;
        }
        if (rule.audience.percentage && Math.random() > rule.audience.percentage / 100) {
          return;
        }
      }

      // Evaluate conditions
      const conditionsMet = rule.conditions.every(condition => {
        const fieldValue = getFieldValue(state.profile!, condition.field);
        return evaluateCondition(fieldValue, condition.operator, condition.value);
      });

      if (conditionsMet) {
        activeRules.add(rule.id);
      }
    });

    setState(prev => ({ ...prev, activeRules }));
  }, [state.profile, state.rules]);

  // Get field value from profile
  const getFieldValue = (profile: UserProfile, field: string): any => {
    const parts = field.split('.');
    let value: any = profile;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  };

  // Evaluate condition
  const evaluateCondition = (fieldValue: any, operator: string, value: any): boolean => {
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  };

  // Get personalized content
  const getPersonalizedContent = useCallback((contentId: string, defaultContent?: React.ReactNode): React.ReactNode => {
    const variants = state.contentVariants.get(contentId);
    if (!variants || variants.length === 0) {
      return defaultContent;
    }

    // Find matching variant
    const matchingVariant = variants.find(variant => {
      if (!variant.conditions) return true;

      return variant.conditions.every(condition => {
        const fieldValue = getFieldValue(state.profile!, condition.field);
        return evaluateCondition(fieldValue, condition.operator, condition.value);
      });
    });

    if (matchingVariant) {
      // Track impression
      setState(prev => {
        const updatedVariants = new Map(prev.contentVariants);
        const variantList = updatedVariants.get(contentId)!;
        const updatedList = variantList.map(v =>
          v.id === matchingVariant.id
            ? {
              ...v,
              performance: {
                ...v.performance,
                impressions: (v.performance?.impressions || 0) + 1
              }
            }
            : v
        );
        updatedVariants.set(contentId, updatedList);

        return { ...prev, contentVariants: updatedVariants };
      });

      return matchingVariant.content;
    }

    return defaultContent;
  }, [state.contentVariants, state.profile]);

  // Check if element should be shown
  const shouldShowElement = useCallback((elementId: string): boolean => {
    const appliedRules = Array.from(state.activeRules)
      .map(ruleId => state.rules.get(ruleId))
      .filter(Boolean)
      .sort((a, b) => (b!.priority || 0) - (a!.priority || 0));

    for (const rule of appliedRules) {
      const action = rule!.actions.find(a => a.target === elementId);
      if (action) {
        onPersonalizationApplied?.(rule!, elementId);

        switch (action.type) {
          case 'show':
            return true;
          case 'hide':
            return false;
        }
      }
    }

    return true; // Show by default
  }, [state.activeRules, state.rules, onPersonalizationApplied]);

  // Track interaction
  const trackInteraction = useCallback((action: string, element: string, data?: any) => {
    if (!enableBehaviorTracking) return;

    const interaction = {
      action,
      element,
      timestamp: new Date(),
      data,
    };

    behaviorTrackerRef.current.interactions.push(interaction);

    // Update profile behavior
    if (state.profile) {
      const interactionKey = `${action}_${element}`;
      const currentCount = state.profile.behavior.interactionPatterns[interactionKey] || 0;

      updateProfile({
        behavior: {
          ...state.profile.behavior,
          interactionPatterns: {
            ...state.profile.behavior.interactionPatterns,
            [interactionKey]: currentCount + 1,
          },
        },
      });
    }
  }, [enableBehaviorTracking, state.profile, updateProfile]);

  // Get recommendations
  const getRecommendations = useCallback((type: string, limit = 5): any[] => {
    if (!enableRecommendations || !state.profile) return [];

    // This is a simplified recommendation engine
    // In production, this would use ML algorithms and historical data

    const recommendations: any[] = [];
    const userInteractions = state.profile.behavior.interactionPatterns;

    // Content-based filtering example
    Object.entries(userInteractions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .forEach(([pattern, count]) => {
        recommendations.push({
          type,
          pattern,
          score: count,
          reason: 'Based on your interaction history',
        });
      });

    return recommendations;
  }, [enableRecommendations, state.profile]);

  // Set preference
  const setPreference = useCallback((key: string, value: any) => {
    if (!state.profile) return;

    updateProfile({
      preferences: {
        ...state.profile.preferences,
        [key]: value,
      },
    });
  }, [state.profile, updateProfile]);

  // Get preference
  const getPreference = useCallback((key: string, defaultValue?: any) => {
    return (state.profile?.preferences as any)?.[key] ?? defaultValue;
  }, [state.profile]);

  // Join experiment
  const joinExperiment = useCallback((experimentId: string): string => {
    const existingExperiment = state.experiments.get(experimentId);
    if (existingExperiment) {
      return existingExperiment.variant;
    }

    // Simple variant assignment (would be more sophisticated in production)
    const variants = ['A', 'B'];
    const variant = variants[Math.floor(Math.random() * variants.length)];

    setState(prev => ({
      ...prev,
      experiments: new Map(prev.experiments).set(experimentId, {
        id: experimentId,
        variant,
        startTime: new Date(),
      }),
    }));

    return variant;
  }, [state.experiments]);

  // Record conversion
  const recordConversion = useCallback((goal: string, value = 1) => {
    if (!state.profile) return;

    const updatedConversions = [...state.profile.behavior.conversionEvents, goal];

    updateProfile({
      behavior: {
        ...state.profile.behavior,
        conversionEvents: updatedConversions,
      },
    });

    // Update content variant performance
    state.contentVariants.forEach((variants, contentId) => {
      variants.forEach(variant => {
        if (variant.performance) {
          variant.performance.conversions += value;
          variant.performance.conversionRate =
            variant.performance.conversions / Math.max(variant.performance.impressions, 1);
        }
      });
    });
  }, [state.profile, state.contentVariants, updateProfile]);

  // Check audience membership
  const isInAudience = useCallback((audienceId: string): boolean => {
    return state.profile?.segments.includes(audienceId) || false;
  }, [state.profile]);

  // Auto-segmentation
  useEffect(() => {
    if (!enableAutoSegmentation || !state.profile) return;

    const segments: string[] = [];

    // Device-based segmentation
    segments.push(`device_${state.profile.context.device}`);

    // Behavior-based segmentation
    if (state.profile.behavior.visitCount === 1) {
      segments.push('new_user');
    } else if (state.profile.behavior.visitCount > 10) {
      segments.push('loyal_user');
    }

    // Engagement-based segmentation
    const totalInteractions = Object.values(state.profile.behavior.interactionPatterns)
      .reduce((sum, count) => sum + count, 0);

    if (totalInteractions > 50) {
      segments.push('highly_engaged');
    } else if (totalInteractions > 10) {
      segments.push('moderately_engaged');
    } else {
      segments.push('low_engagement');
    }

    // Update segments if changed
    if (JSON.stringify(segments.sort()) !== JSON.stringify(state.profile.segments.sort())) {
      updateProfile({ segments });
    }
  }, [enableAutoSegmentation, state.profile, updateProfile]);

  // Initialize on mount
  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  // Evaluate rules when profile or rules change
  useEffect(() => {
    evaluateRules();
  }, [evaluateRules]);

  // Update session behavior on unmount
  useEffect(() => {
    return () => {
      if (state.profile) {
        const sessionDuration = new Date().getTime() - behaviorTrackerRef.current.sessionStart.getTime();
        const currentAverage = state.profile.behavior.averageSessionDuration;
        const visitCount = state.profile.behavior.visitCount;

        const newAverage = ((currentAverage * (visitCount - 1)) + sessionDuration) / visitCount;

        updateProfile({
          behavior: {
            ...state.profile.behavior,
            lastVisit: new Date(),
            averageSessionDuration: newAverage,
          },
        });
      }
    };
  }, [state.profile, updateProfile]);

  const contextValue: PersonalizationContextType = {
    state,
    profile: state.profile,
    updateProfile,
    getPersonalizedContent,
    shouldShowElement,
    trackInteraction,
    getRecommendations,
    setPreference,
    getPreference,
    joinExperiment,
    recordConversion,
    isInAudience,
  };

  return (
    <PersonalizationContext.Provider value={contextValue}>
      {children}
    </PersonalizationContext.Provider>
  );
};

// Personalized Content Component
export interface PersonalizedContentProps {
  contentId: string;
  variants: ContentVariant[];
  defaultContent?: React.ReactNode;
  trackImpressions?: boolean;
  className?: string;
}

export const PersonalizedContent: React.FC<PersonalizedContentProps> = ({
  contentId,
  variants,
  defaultContent,
  trackImpressions = true,
  className = '',
}) => {
  const { getPersonalizedContent, trackInteraction } = usePersonalization();

  useEffect(() => {
    if (trackImpressions) {
      trackInteraction('view', `content_${contentId}`);
    }
  }, [contentId, trackImpressions, trackInteraction]);

  const content = getPersonalizedContent(contentId, defaultContent);

  return (
    <div className={`personalized-content ${className}`} data-content-id={contentId}>
      {content}
    </div>
  );
};

// Conditional Element Component
export interface ConditionalElementProps {
  elementId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const ConditionalElement: React.FC<ConditionalElementProps> = ({
  elementId,
  children,
  fallback,
  className = '',
}) => {
  const { shouldShowElement } = usePersonalization();
  const shouldShow = shouldShowElement(elementId);

  if (!shouldShow) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className={`conditional-element ${className}`} data-element-id={elementId}>
      {children}
    </div>
  );
};

// Recommendation List Component
export interface RecommendationListProps {
  type: string;
  limit?: number;
  className?: string;
  renderItem: (item: any, index: number) => React.ReactNode;
  onItemClick?: (item: any, index: number) => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  type,
  limit = 5,
  className = '',
  renderItem,
  onItemClick,
}) => {
  const { getRecommendations, trackInteraction } = usePersonalization();
  const recommendations = getRecommendations(type, limit);

  const handleItemClick = useCallback((item: any, index: number) => {
    trackInteraction('click', `recommendation_${type}_${index}`, item);
    onItemClick?.(item, index);
  }, [trackInteraction, type, onItemClick]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`recommendation-list ${className}`} data-recommendation-type={type}>
      {recommendations.map((item, index) => (
        <div
          key={index}
          className="recommendation-item"
          onClick={() => handleItemClick(item, index)}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default {
  PersonalizationProvider,
  PersonalizedContent,
  ConditionalElement,
  RecommendationList,
  usePersonalization,
};
