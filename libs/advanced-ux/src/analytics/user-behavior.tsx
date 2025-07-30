import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// User Behavior Analytics Types
export interface UserBehaviorEvent {
  id: string;
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'input' | 'navigation' | 'error' | 'conversion';
  timestamp: Date;
  element?: {
    tagName: string;
    id?: string;
    className?: string;
    textContent?: string;
    xpath?: string;
  };
  coordinates?: {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
  };
  viewport?: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
  };
  device?: {
    userAgent: string;
    screenResolution: string;
    colorDepth: number;
    touchSupport: boolean;
  };
  session: {
    id: string;
    startTime: Date;
    url: string;
    referrer?: string;
  };
  user?: {
    id?: string;
    segment?: string;
    preferences?: Record<string, any>;
  };
  context?: {
    feature?: string;
    experiment?: string;
    variant?: string;
  };
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: UserBehaviorEvent[];
  interactions: number;
  bounceRate: number;
  conversionEvents: string[];
  exitPage?: string;
  entryPage: string;
  referrer?: string;
  userAgent: string;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
}

export interface BehavioralPattern {
  id: string;
  name: string;
  description: string;
  type: 'navigation' | 'interaction' | 'engagement' | 'conversion' | 'friction';
  conditions: Array<{
    eventType: string;
    properties: Record<string, any>;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
    value: any;
  }>;
  timeWindow: number; // milliseconds
  frequency: {
    min: number;
    max?: number;
  };
  confidence: number; // 0-1
  actions: Array<{
    type: 'personalize' | 'optimize' | 'alert' | 'experiment';
    parameters: Record<string, any>;
  }>;
}

export interface AnalyticsMetrics {
  sessions: {
    total: number;
    unique: number;
    averageDuration: number;
    bounceRate: number;
  };
  interactions: {
    total: number;
    perSession: number;
    mostCommon: Array<{ type: string; count: number }>;
  };
  performance: {
    pageLoadTime: number;
    interactionLatency: number;
    renderTime: number;
  };
  conversion: {
    rate: number;
    funnel: Array<{ step: string; completionRate: number }>;
    dropoffPoints: Array<{ step: string; dropoffRate: number }>;
  };
  engagement: {
    timeOnPage: number;
    scrollDepth: number;
    clickThroughRate: number;
  };
}

// User Behavior Context
interface UserBehaviorContextType {
  session: UserSession | null;
  patterns: Map<string, BehavioralPattern>;
  metrics: AnalyticsMetrics;
  trackEvent: (event: Omit<UserBehaviorEvent, 'id' | 'timestamp' | 'session'>) => void;
  startSession: (userId?: string) => void;
  endSession: () => void;
  identifyUser: (userId: string, properties?: Record<string, any>) => void;
  getMetrics: (timeRange?: { start: Date; end: Date }) => AnalyticsMetrics;
  detectPatterns: () => BehavioralPattern[];
  getHeatmapData: (element?: string) => Array<{ x: number; y: number; intensity: number }>;
  getFrictionPoints: () => Array<{ element: string; issues: string[]; severity: number }>;
  isTrackingEnabled: boolean;
  enableTracking: () => void;
  disableTracking: () => void;
}

const UserBehaviorContext = createContext<UserBehaviorContextType | null>(null);

export const useUserBehavior = () => {
  const context = useContext(UserBehaviorContext);
  if (!context) {
    throw new Error('useUserBehavior must be used within a UserBehaviorProvider');
  }
  return context;
};

// User Behavior Provider
export interface UserBehaviorProviderProps {
  children: React.ReactNode;
  sessionTimeout?: number; // milliseconds
  enableHeatmaps?: boolean;
  enableRecording?: boolean;
  samplingRate?: number; // 0-1
  privacyMode?: boolean;
  customPatterns?: BehavioralPattern[];
  onPatternDetected?: (pattern: BehavioralPattern, events: UserBehaviorEvent[]) => void;
  onSessionEnd?: (session: UserSession) => void;
  dataRetention?: number; // days
}

export const UserBehaviorProvider: React.FC<UserBehaviorProviderProps> = ({
  children,
  sessionTimeout = 30 * 60 * 1000, // 30 minutes
  enableHeatmaps = true,
  enableRecording = false,
  samplingRate = 1.0,
  privacyMode = false,
  customPatterns = [],
  onPatternDetected,
  onSessionEnd,
  dataRetention = 30,
}) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [patterns] = useState(() => new Map(customPatterns.map(p => [p.id, p])));
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    sessions: { total: 0, unique: 0, averageDuration: 0, bounceRate: 0 },
    interactions: { total: 0, perSession: 0, mostCommon: [] },
    performance: { pageLoadTime: 0, interactionLatency: 0, renderTime: 0 },
    conversion: { rate: 0, funnel: [], dropoffPoints: [] },
    engagement: { timeOnPage: 0, scrollDepth: 0, clickThroughRate: 0 },
  });
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventsBuffer = useRef<UserBehaviorEvent[]>([]);
  const heatmapData = useRef<Array<{ x: number; y: number; intensity: number }>>([]);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (window.innerWidth < 768) deviceType = 'mobile';
    else if (window.innerWidth < 1024) deviceType = 'tablet';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      userAgent,
      screenResolution,
      colorDepth: screen.colorDepth,
      touchSupport: 'ontouchstart' in window,
      type: deviceType,
      os,
      browser,
    };
  }, []);

  // Generate element XPath
  const getElementXPath = useCallback((element: Element): string => {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    if (element === document.body) {
      return '/html/body';
    }

    let ix = 0;
    const siblings = element.parentNode?.children || [];

    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        break;
      }
      if (sibling.tagName === element.tagName) {
        ix++;
      }
    }

    const tagName = element.tagName.toLowerCase();
    const parentPath = element.parentElement ? getElementXPath(element.parentElement) : '';

    return `${parentPath}/${tagName}[${ix + 1}]`;
  }, []);

  const startSession = useCallback((userId?: string) => {
    if (!isTrackingEnabled || Math.random() > samplingRate) return;

    const deviceInfo = getDeviceInfo();
    const newSession: UserSession = {
      id: generateSessionId(),
      userId,
      startTime: new Date(),
      pageViews: 1,
      events: [],
      interactions: 0,
      bounceRate: 0,
      conversionEvents: [],
      entryPage: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      deviceInfo: {
        type: deviceInfo.type,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
      },
    };

    setSession(newSession);

    // Set session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      endSession();
    }, sessionTimeout);
  }, [isTrackingEnabled, samplingRate, generateSessionId, getDeviceInfo, sessionTimeout]);

  const endSession = useCallback(() => {
    if (!session) return;

    const endTime = new Date();
    const duration = endTime.getTime() - session.startTime.getTime();

    const finalSession: UserSession = {
      ...session,
      endTime,
      duration,
      exitPage: window.location.href,
      bounceRate: session.interactions < 2 ? 1 : 0,
    };

    onSessionEnd?.(finalSession);
    setSession(null);

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, [session, onSessionEnd]);

  const trackEvent = useCallback((eventData: Omit<UserBehaviorEvent, 'id' | 'timestamp' | 'session'>) => {
    if (!isTrackingEnabled || !session) return;

    const event: UserBehaviorEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      session: {
        id: session.id,
        startTime: session.startTime,
        url: window.location.href,
        referrer: document.referrer,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      },
      device: getDeviceInfo(),
      ...eventData,
    };

    // Update session
    setSession(prev => prev ? {
      ...prev,
      events: [...prev.events, event],
      interactions: prev.interactions + 1,
    } : null);

    // Add to events buffer
    eventsBuffer.current.push(event);

    // Update heatmap data for click events
    if (enableHeatmaps && event.type === 'click' && event.coordinates) {
      heatmapData.current.push({
        x: event.coordinates.x,
        y: event.coordinates.y,
        intensity: 1,
      });
    }

    // Reset session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = setTimeout(() => {
        endSession();
      }, sessionTimeout);
    }
  }, [isTrackingEnabled, session, enableHeatmaps, getDeviceInfo, sessionTimeout, endSession]);

  const identifyUser = useCallback((userId: string, properties?: Record<string, any>) => {
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        userId,
        user: {
          id: userId,
          ...properties,
        },
      } : null);
    }
  }, [session]);

  const detectPatterns = useCallback((): BehavioralPattern[] => {
    if (!session) return [];

    const detectedPatterns: BehavioralPattern[] = [];
    const events = session.events;

    patterns.forEach(pattern => {
      const matchingEvents = events.filter(event => {
        return pattern.conditions.every(condition => {
          if (condition.eventType !== event.type) return false;

          const value = condition.properties[Object.keys(condition.properties)[0]];
          const eventValue = (event as any)[Object.keys(condition.properties)[0]];

          switch (condition.operator) {
            case 'equals':
              return eventValue === value;
            case 'contains':
              return String(eventValue).includes(value);
            case 'greater_than':
              return eventValue > value;
            case 'less_than':
              return eventValue < value;
            case 'in_range':
              return eventValue >= value.min && eventValue <= value.max;
            default:
              return false;
          }
        });
      });

      if (matchingEvents.length >= pattern.frequency.min &&
        (!pattern.frequency.max || matchingEvents.length <= pattern.frequency.max)) {
        detectedPatterns.push(pattern);
        onPatternDetected?.(pattern, matchingEvents);
      }
    });

    return detectedPatterns;
  }, [session, patterns, onPatternDetected]);

  const getHeatmapData = useCallback((element?: string) => {
    if (element) {
      return heatmapData.current.filter(point => {
        // Filter by element if specified
        return true; // Simplified - would need element bounds checking
      });
    }
    return heatmapData.current;
  }, []);

  const getFrictionPoints = useCallback(() => {
    if (!session) return [];

    const frictionPoints: Array<{ element: string; issues: string[]; severity: number }> = [];
    const events = session.events;

    // Detect error events
    const errorEvents = events.filter(e => e.type === 'error');
    errorEvents.forEach(event => {
      if (event.element) {
        frictionPoints.push({
          element: event.element.xpath || `${event.element.tagName}#${event.element.id}`,
          issues: ['Error occurred'],
          severity: 0.9,
        });
      }
    });

    // Detect rapid clicking (frustration indicator)
    const clickEvents = events.filter(e => e.type === 'click');
    const rapidClicks = clickEvents.filter((event, index) => {
      const nextEvent = clickEvents[index + 1];
      return nextEvent &&
        nextEvent.timestamp.getTime() - event.timestamp.getTime() < 1000 &&
        event.element?.xpath === nextEvent.element?.xpath;
    });

    rapidClicks.forEach(event => {
      if (event.element) {
        frictionPoints.push({
          element: event.element.xpath || `${event.element.tagName}#${event.element.id}`,
          issues: ['Rapid clicking detected'],
          severity: 0.7,
        });
      }
    });

    return frictionPoints;
  }, [session]);

  const getMetrics = useCallback((timeRange?: { start: Date; end: Date }) => {
    // This would typically query stored data
    // For now, return current session metrics
    return metrics;
  }, [metrics]);

  const enableTracking = useCallback(() => {
    setIsTrackingEnabled(true);
  }, []);

  const disableTracking = useCallback(() => {
    setIsTrackingEnabled(false);
    endSession();
  }, [endSession]);

  // Set up event listeners
  useEffect(() => {
    if (!isTrackingEnabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      trackEvent({
        type: 'click',
        element: {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          textContent: target.textContent?.slice(0, 100),
          xpath: getElementXPath(target),
        },
        coordinates: {
          x: e.clientX,
          y: e.clientY,
          screenX: e.screenX,
          screenY: e.screenY,
        },
      });
    };

    const handleScroll = () => {
      trackEvent({
        type: 'scroll',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        },
      });
    };

    const handleError = (e: ErrorEvent) => {
      trackEvent({
        type: 'error',
        metadata: {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
        },
      });
    };

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', throttledScroll);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('error', handleError);
    };
  }, [isTrackingEnabled, trackEvent, getElementXPath]);

  // Start session on mount
  useEffect(() => {
    startSession();

    return () => {
      endSession();
    };
  }, [startSession, endSession]);

  const contextValue: UserBehaviorContextType = {
    session,
    patterns,
    metrics,
    trackEvent,
    startSession,
    endSession,
    identifyUser,
    getMetrics,
    detectPatterns,
    getHeatmapData,
    getFrictionPoints,
    isTrackingEnabled,
    enableTracking,
    disableTracking,
  };

  return (
    <UserBehaviorContext.Provider value={contextValue}>
      {children}
    </UserBehaviorContext.Provider>
  );
};

// Heatmap Visualization Component
export interface HeatmapProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  showGrid?: boolean;
  element?: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  className = '',
  intensity = 'medium',
  showGrid = false,
  element,
}) => {
  const { getHeatmapData } = useUserBehavior();
  const [heatmapPoints, setHeatmapPoints] = useState<Array<{ x: number; y: number; intensity: number }>>([]);

  useEffect(() => {
    const data = getHeatmapData(element);
    setHeatmapPoints(data);
  }, [getHeatmapData, element]);

  return (
    <div className={`heatmap ${className}`} style={{ position: 'relative', pointerEvents: 'none' }}>
      {showGrid && (
        <div className="heatmap__grid" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />
      )}

      {heatmapPoints.map((point, index) => (
        <motion.div
          key={index}
          className="heatmap__point"
          style={{
            position: 'absolute',
            left: point.x - 10,
            top: point.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: `rgba(255, 0, 0, ${point.intensity * 0.3})`,
            pointerEvents: 'none',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
};

// Analytics Dashboard Component
export interface AnalyticsDashboardProps {
  className?: string;
  showRealTime?: boolean;
  timeRange?: { start: Date; end: Date };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  showRealTime = true,
  timeRange,
}) => {
  const { session, metrics, getFrictionPoints, detectPatterns } = useUserBehavior();
  const [frictionPoints, setFrictionPoints] = useState<Array<{ element: string; issues: string[]; severity: number }>>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<BehavioralPattern[]>([]);

  useEffect(() => {
    const friction = getFrictionPoints();
    const patterns = detectPatterns();

    setFrictionPoints(friction);
    setDetectedPatterns(patterns);
  }, [getFrictionPoints, detectPatterns]);

  return (
    <div className={`analytics-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>User Behavior Analytics</h2>
        {showRealTime && (
          <div className="realtime-indicator">
            <div className="pulse-dot" />
            Live
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Session Info */}
        <div className="dashboard-card">
          <h3>Current Session</h3>
          {session ? (
            <div>
              <p>Session ID: {session.id.slice(-8)}</p>
              <p>Duration: {session.duration ? `${Math.round(session.duration / 1000)}s` : 'Active'}</p>
              <p>Events: {session.events.length}</p>
              <p>Interactions: {session.interactions}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>

        {/* Metrics */}
        <div className="dashboard-card">
          <h3>Key Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Bounce Rate</span>
              <span className="metric-value">{(metrics.sessions.bounceRate * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg. Session</span>
              <span className="metric-value">{Math.round(metrics.sessions.averageDuration / 1000)}s</span>
            </div>
            <div className="metric">
              <span className="metric-label">Conversion Rate</span>
              <span className="metric-value">{(metrics.conversion.rate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Friction Points */}
        <div className="dashboard-card">
          <h3>Friction Points</h3>
          {frictionPoints.length > 0 ? (
            <div className="friction-list">
              {frictionPoints.map((point, index) => (
                <div key={index} className="friction-item">
                  <div className="friction-element">{point.element.split('/').pop()}</div>
                  <div className="friction-issues">
                    {point.issues.map((issue, i) => (
                      <span key={i} className="friction-issue">{issue}</span>
                    ))}
                  </div>
                  <div className="friction-severity" style={{
                    backgroundColor: `rgba(255, 0, 0, ${point.severity})`,
                  }}>
                    {Math.round(point.severity * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No friction points detected</p>
          )}
        </div>

        {/* Detected Patterns */}
        <div className="dashboard-card">
          <h3>Behavioral Patterns</h3>
          {detectedPatterns.length > 0 ? (
            <div className="patterns-list">
              {detectedPatterns.map((pattern, index) => (
                <div key={index} className="pattern-item">
                  <div className="pattern-name">{pattern.name}</div>
                  <div className="pattern-description">{pattern.description}</div>
                  <div className="pattern-confidence">
                    Confidence: {Math.round(pattern.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No patterns detected yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  UserBehaviorProvider,
  Heatmap,
  AnalyticsDashboard,
  useUserBehavior,
};
