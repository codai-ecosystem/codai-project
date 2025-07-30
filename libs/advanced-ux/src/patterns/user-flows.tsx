import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useSpring, useTransform, useScroll } from 'framer-motion';
import { useIntersectionObserver } from '@codai/frontend-architecture';

// User Flow Types
export interface UserFlowStep {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean | Promise<boolean>;
  metadata?: Record<string, any>;
  nextSteps?: string[];
  previousSteps?: string[];
  analytics?: {
    trackEntry?: boolean;
    trackExit?: boolean;
    trackTimeSpent?: boolean;
    customEvents?: string[];
  };
}

export interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: UserFlowStep[];
  entryPoints: string[];
  exitPoints: string[];
  metadata?: Record<string, any>;
  analytics?: {
    conversionGoals?: string[];
    dropoffTracking?: boolean;
    completionMetrics?: boolean;
  };
}

export interface UserFlowState {
  currentStepId: string | null;
  completedSteps: string[];
  flowData: Record<string, any>;
  startTime: Date;
  stepHistory: Array<{
    stepId: string;
    timestamp: Date;
    timeSpent: number;
    exitReason?: 'completion' | 'navigation' | 'abandonment';
  }>;
  metadata?: Record<string, any>;
}

// User Flow Context
interface UserFlowContextType {
  flows: Map<string, UserFlow>;
  currentFlow: UserFlow | null;
  flowState: UserFlowState | null;
  startFlow: (flowId: string, initialData?: any) => Promise<void>;
  navigateToStep: (stepId: string, data?: any) => Promise<void>;
  completeStep: (stepId: string, data?: any) => Promise<void>;
  abandonFlow: (reason?: string) => Promise<void>;
  restartFlow: () => Promise<void>;
  getFlowProgress: () => number;
  getStepData: (stepId: string) => any;
  updateStepData: (stepId: string, data: any) => void;
  isStepAccessible: (stepId: string) => boolean;
  getNextSteps: (stepId?: string) => UserFlowStep[];
  getPreviousSteps: (stepId?: string) => UserFlowStep[];
}

const UserFlowContext = createContext<UserFlowContextType | null>(null);

export const useUserFlow = () => {
  const context = useContext(UserFlowContext);
  if (!context) {
    throw new Error('useUserFlow must be used within a UserFlowProvider');
  }
  return context;
};

// User Flow Provider
export interface UserFlowProviderProps {
  children: React.ReactNode;
  flows: UserFlow[];
  analytics?: {
    trackingEnabled?: boolean;
    customTracker?: (event: string, data: any) => void;
  };
  onFlowComplete?: (flowId: string, data: any) => void;
  onFlowAbandoned?: (flowId: string, reason: string) => void;
  onStepComplete?: (stepId: string, data: any) => void;
}

export const UserFlowProvider: React.FC<UserFlowProviderProps> = ({
  children,
  flows,
  analytics,
  onFlowComplete,
  onFlowAbandoned,
  onStepComplete,
}) => {
  const [flowsMap] = useState(() => new Map(flows.map(flow => [flow.id, flow])));
  const [currentFlow, setCurrentFlow] = useState<UserFlow | null>(null);
  const [flowState, setFlowState] = useState<UserFlowState | null>(null);

  const trackEvent = useCallback((event: string, data: any) => {
    if (analytics?.trackingEnabled && analytics?.customTracker) {
      analytics.customTracker(event, data);
    }
  }, [analytics]);

  const startFlow = useCallback(async (flowId: string, initialData?: any) => {
    const flow = flowsMap.get(flowId);
    if (!flow) {
      throw new Error(`Flow with id "${flowId}" not found`);
    }

    const newFlowState: UserFlowState = {
      currentStepId: null,
      completedSteps: [],
      flowData: initialData || {},
      startTime: new Date(),
      stepHistory: [],
      metadata: {}
    };

    setCurrentFlow(flow);
    setFlowState(newFlowState);

    trackEvent('flow_started', {
      flowId,
      initialData,
      timestamp: new Date()
    });

    // Navigate to first entry point
    if (flow.entryPoints.length > 0) {
      await navigateToStep(flow.entryPoints[0]);
    }
  }, [flowsMap, trackEvent]);

  const navigateToStep = useCallback(async (stepId: string, data?: any) => {
    if (!currentFlow || !flowState) {
      throw new Error('No active flow');
    }

    const step = currentFlow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id "${stepId}" not found in current flow`);
    }

    const previousStepId = flowState.currentStepId;
    const stepStartTime = new Date();

    // Update step history if we're leaving a step
    if (previousStepId) {
      const previousStepStartTime = flowState.stepHistory
        .findLast(h => h.stepId === previousStepId)?.timestamp || flowState.startTime;

      setFlowState(prev => ({
        ...prev!,
        stepHistory: [
          ...prev!.stepHistory,
          {
            stepId: previousStepId,
            timestamp: previousStepStartTime,
            timeSpent: stepStartTime.getTime() - previousStepStartTime.getTime(),
            exitReason: 'navigation'
          }
        ]
      }));
    }

    // Update current step
    setFlowState(prev => ({
      ...prev!,
      currentStepId: stepId,
      flowData: { ...prev!.flowData, ...data },
      stepHistory: [
        ...prev!.stepHistory,
        {
          stepId,
          timestamp: stepStartTime,
          timeSpent: 0
        }
      ]
    }));

    trackEvent('step_entered', {
      flowId: currentFlow.id,
      stepId,
      previousStepId,
      data,
      timestamp: stepStartTime
    });
  }, [currentFlow, flowState, trackEvent]);

  const completeStep = useCallback(async (stepId: string, data?: any) => {
    if (!currentFlow || !flowState) {
      throw new Error('No active flow');
    }

    const step = currentFlow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id "${stepId}" not found`);
    }

    // Validate step data if validation function is provided
    if (step.validation) {
      const isValid = await step.validation(data);
      if (!isValid) {
        throw new Error(`Step validation failed for step "${stepId}"`);
      }
    }

    // Update completed steps
    setFlowState(prev => ({
      ...prev!,
      completedSteps: [...prev!.completedSteps, stepId],
      flowData: { ...prev!.flowData, ...data }
    }));

    trackEvent('step_completed', {
      flowId: currentFlow.id,
      stepId,
      data,
      timestamp: new Date()
    });

    onStepComplete?.(stepId, data);

    // Check if flow is complete
    const allStepsCompleted = currentFlow.steps.every(s =>
      flowState.completedSteps.includes(s.id) || s.id === stepId
    );

    if (allStepsCompleted) {
      trackEvent('flow_completed', {
        flowId: currentFlow.id,
        completionTime: new Date().getTime() - flowState.startTime.getTime(),
        data: flowState.flowData,
        timestamp: new Date()
      });

      onFlowComplete?.(currentFlow.id, flowState.flowData);
    }
  }, [currentFlow, flowState, trackEvent, onStepComplete, onFlowComplete]);

  const abandonFlow = useCallback(async (reason = 'user_initiated') => {
    if (!currentFlow || !flowState) return;

    trackEvent('flow_abandoned', {
      flowId: currentFlow.id,
      reason,
      completedSteps: flowState.completedSteps,
      currentStepId: flowState.currentStepId,
      timeSpent: new Date().getTime() - flowState.startTime.getTime(),
      timestamp: new Date()
    });

    onFlowAbandoned?.(currentFlow.id, reason);

    setCurrentFlow(null);
    setFlowState(null);
  }, [currentFlow, flowState, trackEvent, onFlowAbandoned]);

  const restartFlow = useCallback(async () => {
    if (!currentFlow) return;

    const flowId = currentFlow.id;
    const initialData = flowState?.flowData || {};

    await abandonFlow('restart');
    await startFlow(flowId, initialData);
  }, [currentFlow, flowState, abandonFlow, startFlow]);

  const getFlowProgress = useCallback(() => {
    if (!currentFlow || !flowState) return 0;

    return (flowState.completedSteps.length / currentFlow.steps.length) * 100;
  }, [currentFlow, flowState]);

  const getStepData = useCallback((stepId: string) => {
    return flowState?.flowData?.[stepId] || null;
  }, [flowState]);

  const updateStepData = useCallback((stepId: string, data: any) => {
    setFlowState(prev => prev ? {
      ...prev,
      flowData: {
        ...prev.flowData,
        [stepId]: { ...prev.flowData[stepId], ...data }
      }
    } : null);
  }, []);

  const isStepAccessible = useCallback((stepId: string) => {
    if (!currentFlow || !flowState) return false;

    const step = currentFlow.steps.find(s => s.id === stepId);
    if (!step) return false;

    // Check if step has no previous requirements or all are completed
    if (!step.previousSteps || step.previousSteps.length === 0) {
      return true;
    }

    return step.previousSteps.every(prevStepId =>
      flowState.completedSteps.includes(prevStepId)
    );
  }, [currentFlow, flowState]);

  const getNextSteps = useCallback((stepId?: string) => {
    if (!currentFlow) return [];

    const currentStepId = stepId || flowState?.currentStepId;
    if (!currentStepId) return [];

    const currentStep = currentFlow.steps.find(s => s.id === currentStepId);
    if (!currentStep?.nextSteps) return [];

    return currentStep.nextSteps
      .map(nextStepId => currentFlow.steps.find(s => s.id === nextStepId))
      .filter(Boolean) as UserFlowStep[];
  }, [currentFlow, flowState]);

  const getPreviousSteps = useCallback((stepId?: string) => {
    if (!currentFlow) return [];

    const currentStepId = stepId || flowState?.currentStepId;
    if (!currentStepId) return [];

    const currentStep = currentFlow.steps.find(s => s.id === currentStepId);
    if (!currentStep?.previousSteps) return [];

    return currentStep.previousSteps
      .map(prevStepId => currentFlow.steps.find(s => s.id === prevStepId))
      .filter(Boolean) as UserFlowStep[];
  }, [currentFlow, flowState]);

  const contextValue: UserFlowContextType = {
    flows: flowsMap,
    currentFlow,
    flowState,
    startFlow,
    navigateToStep,
    completeStep,
    abandonFlow,
    restartFlow,
    getFlowProgress,
    getStepData,
    updateStepData,
    isStepAccessible,
    getNextSteps,
    getPreviousSteps,
  };

  return (
    <UserFlowContext.Provider value={contextValue}>
      {children}
    </UserFlowContext.Provider>
  );
};

// User Flow Step Component
export interface UserFlowStepProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onEnter?: (stepId: string) => void;
  onExit?: (stepId: string) => void;
  onValidation?: (stepId: string, data: any) => boolean | Promise<boolean>;
}

export const UserFlowStep: React.FC<UserFlowStepProps> = ({
  stepId,
  children,
  className = '',
  animate = true,
  onEnter,
  onExit,
  onValidation,
}) => {
  const { flowState, currentFlow } = useUserFlow();
  const isCurrentStep = flowState?.currentStepId === stepId;
  const isCompleted = flowState?.completedSteps.includes(stepId) || false;
  const controls = useAnimation();
  const prevIsCurrentStep = useRef(isCurrentStep);

  useEffect(() => {
    if (isCurrentStep && !prevIsCurrentStep.current) {
      onEnter?.(stepId);
      if (animate) {
        controls.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.3, ease: 'easeOut' }
        });
      }
    } else if (!isCurrentStep && prevIsCurrentStep.current) {
      onExit?.(stepId);
      if (animate) {
        controls.start({
          opacity: 0,
          y: -20,
          scale: 0.95,
          transition: { duration: 0.2, ease: 'easeIn' }
        });
      }
    }

    prevIsCurrentStep.current = isCurrentStep;
  }, [isCurrentStep, onEnter, onExit, stepId, animate, controls]);

  if (!isCurrentStep) {
    return null;
  }

  const stepContent = (
    <div
      className={`user-flow-step ${className} ${isCompleted ? 'completed' : ''}`}
      data-step-id={stepId}
      data-step-completed={isCompleted}
    >
      {children}
    </div>
  );

  if (!animate) {
    return stepContent;
  }

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {stepContent}
    </motion.div>
  );
};

// Flow Progress Indicator
export interface FlowProgressProps {
  className?: string;
  showStepLabels?: boolean;
  variant?: 'linear' | 'circular' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success';
}

export const FlowProgress: React.FC<FlowProgressProps> = ({
  className = '',
  showStepLabels = false,
  variant = 'linear',
  size = 'md',
  color = 'primary',
}) => {
  const { currentFlow, flowState, getFlowProgress } = useUserFlow();

  if (!currentFlow || !flowState) return null;

  const progress = getFlowProgress();
  const currentStepIndex = currentFlow.steps.findIndex(step =>
    step.id === flowState.currentStepId
  );

  if (variant === 'linear') {
    return (
      <div className={`flow-progress flow-progress--linear flow-progress--${size} ${className}`}>
        <div className="flow-progress__track">
          <motion.div
            className={`flow-progress__fill flow-progress__fill--${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        {showStepLabels && (
          <div className="flow-progress__steps">
            {currentFlow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flow-progress__step ${index === currentStepIndex ? 'current' : ''
                  } ${flowState.completedSteps.includes(step.id) ? 'completed' : ''
                  }`}
              >
                <span className="flow-progress__step-label">
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flow-progress flow-progress--dots flow-progress--${size} ${className}`}>
        {currentFlow.steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`flow-progress__dot ${index === currentStepIndex ? 'current' : ''
              } ${flowState.completedSteps.includes(step.id) ? 'completed' : ''
              }`}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: index === currentStepIndex ? 1.2 : 1,
              opacity: flowState.completedSteps.includes(step.id) || index === currentStepIndex ? 1 : 0.5
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Flow Navigation Component
export interface FlowNavigationProps {
  className?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
  allowBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export const FlowNavigation: React.FC<FlowNavigationProps> = ({
  className = '',
  showProgress = true,
  allowSkip = false,
  allowBack = true,
  nextLabel = 'Next',
  backLabel = 'Back',
  skipLabel = 'Skip',
  onNext,
  onBack,
  onSkip,
}) => {
  const {
    currentFlow,
    flowState,
    navigateToStep,
    getNextSteps,
    getPreviousSteps,
    isStepAccessible
  } = useUserFlow();

  if (!currentFlow || !flowState) return null;

  const nextSteps = getNextSteps();
  const previousSteps = getPreviousSteps();
  const canGoNext = nextSteps.length > 0 && nextSteps.some(step => isStepAccessible(step.id));
  const canGoBack = allowBack && previousSteps.length > 0;

  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (canGoNext) {
      const nextStep = nextSteps.find(step => isStepAccessible(step.id));
      if (nextStep) {
        navigateToStep(nextStep.id);
      }
    }
  }, [onNext, canGoNext, nextSteps, isStepAccessible, navigateToStep]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (canGoBack) {
      const previousStep = previousSteps[0];
      if (previousStep) {
        navigateToStep(previousStep.id);
      }
    }
  }, [onBack, canGoBack, previousSteps, navigateToStep]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else if (allowSkip && canGoNext) {
      handleNext();
    }
  }, [onSkip, allowSkip, canGoNext, handleNext]);

  return (
    <div className={`flow-navigation ${className}`}>
      {showProgress && <FlowProgress variant="linear" size="sm" />}

      <div className="flow-navigation__actions">
        {canGoBack && (
          <motion.button
            type="button"
            className="flow-navigation__button flow-navigation__button--back"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {backLabel}
          </motion.button>
        )}

        {allowSkip && (
          <motion.button
            type="button"
            className="flow-navigation__button flow-navigation__button--skip"
            onClick={handleSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {skipLabel}
          </motion.button>
        )}

        <motion.button
          type="button"
          className={`flow-navigation__button flow-navigation__button--next ${!canGoNext ? 'disabled' : ''
            }`}
          onClick={handleNext}
          disabled={!canGoNext}
          whileHover={canGoNext ? { scale: 1.02 } : {}}
          whileTap={canGoNext ? { scale: 0.98 } : {}}
        >
          {nextLabel}
        </motion.button>
      </div>
    </div>
  );
};

export default {
  UserFlowProvider,
  UserFlowStep,
  FlowProgress,
  FlowNavigation,
  useUserFlow,
};
