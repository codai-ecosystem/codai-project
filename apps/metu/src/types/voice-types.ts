/**
 * Advanced Voice Features Type Definitions
 * Phase 5.1: Voice commands, conversation context, language settings
 */

export interface VoiceCommand {
    id: string;
    trigger: string[];
    category: 'system' | 'automation' | 'navigation' | 'control' | 'query';
    description: string;
    parameters: string[];
    handler: string;
    enabled?: boolean;
    priority?: number;
}

export interface ConversationContext {
    type: 'message' | 'command' | 'response' | 'error' | 'system';
    content?: string;
    command?: string;
    transcript?: string;
    result?: any;
    metadata?: Record<string, any>;
    timestamp: number;
    sessionId?: string;
    userId?: string;
}

export interface LanguageSettings {
    locale: string;
    speechRecognitionSensitivity: number;
    responseSpeed: number;
    culturalAdaptation: boolean;
    userPreferences: Record<string, any>;
    customVocabulary?: string[];
    pronunciationAdjustments?: Record<string, string>;
}

export interface VoiceMacro {
    id: string;
    name: string;
    commands: string[];
    createdBy: string;
    createdAt: number;
    usage: number;
    enabled: boolean;
    description?: string;
    tags?: string[];
    shortcut?: string;
}

export interface InterruptionHandler {
    id: string;
    sessionId: string;
    type: 'user_interrupt' | 'system_interrupt' | 'priority_interrupt' | 'emergency';
    priority: number;
    pauseCurrentOperation: boolean;
    resumeAfter: boolean;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface VoiceAnalytics {
    sessionId: string;
    userId: string;
    startTime: number;
    endTime?: number;
    totalCommands: number;
    successfulCommands: number;
    failedCommands: number;
    averageResponseTime: number;
    languagesUsed: string[];
    macrosExecuted: number;
    interruptionsHandled: number;
    userSatisfactionScore?: number;
}

export interface SystemIntegrationCommand extends VoiceCommand {
    systemType: 'file' | 'calendar' | 'email' | 'task' | 'development' | 'monitoring';
    permissions: string[];
    confirmationRequired: boolean;
    undoable: boolean;
}

export interface VoiceResponse {
    id: string;
    sessionId: string;
    type: 'text' | 'audio' | 'action' | 'error';
    content: string;
    metadata?: Record<string, any>;
    timestamp: number;
    processingTime?: number;
    confidence?: number;
}

export interface ConversationSummary {
    sessionId: string;
    userId: string;
    startTime: number;
    endTime: number;
    totalInteractions: number;
    mainTopics: string[];
    keyDecisions: string[];
    actionItemsCreated: number;
    overallSentiment: 'positive' | 'neutral' | 'negative';
    languageBreakdown: Record<string, number>;
}

export interface VoiceAdaptationData {
    userId: string;
    speechPatterns: Record<string, number>;
    preferredLanguages: string[];
    commandUsageFrequency: Record<string, number>;
    responseTimePreferences: number;
    interruptionTolerance: number;
    customVocabulary: string[];
    learningPreferences: {
        confirmationsRequired: boolean;
        verboseExplanations: boolean;
        proactivesSuggestions: boolean;
    };
}

export interface MultiLanguageSupport {
    primaryLanguage: string;
    secondaryLanguages: string[];
    autoDetection: boolean;
    translationEnabled: boolean;
    culturalContextAware: boolean;
    localizedResponses: boolean;
    regionSpecificFeatures: Record<string, any>;
}

export interface VoiceSecuritySettings {
    voiceprintAuthentication: boolean;
    commandAuthorizationLevel: 'none' | 'basic' | 'strict' | 'biometric';
    sensitiveCommandProtection: boolean;
    sessionTimeoutMinutes: number;
    encryptConversationHistory: boolean;
    allowedIPRanges?: string[];
    restrictedCommands: string[];
}
