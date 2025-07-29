/**
 * METU Translation Service - English Translations
 * 
 * English language strings for the METU voice assistant interface.
 */

export const en = {
    // Application
    app: {
        title: 'METU Voice Assistant',
        description: 'Revolutionary AI-powered voice assistant',
        version: 'Version 1.0.0',
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
    },

    // Voice Interface
    voice: {
        listening: 'Listening...',
        speaking: 'Speaking...',
        processing: 'Processing...',
        idle: 'Ready to listen',
        startListening: 'Click to start listening',
        stopListening: 'Click to stop listening',
        microphoneAccess: 'Microphone access required',
        microphoneError: 'Could not access microphone',
        voiceNotSupported: 'Voice recognition not supported',
        speakingVolume: 'Speaking volume',
        listeningVolume: 'Listening volume',
    },

    // Settings
    settings: {
        title: 'Settings',
        general: 'General',
        voice: 'Voice',
        appearance: 'Appearance',
        privacy: 'Privacy',
        about: 'About',

        // General Settings
        assistantName: 'Assistant Name',
        assistantNamePlaceholder: 'Enter assistant name',
        language: 'Language',
        personality: 'Personality',
        customInstructions: 'Custom Instructions',
        customInstructionsPlaceholder: 'Enter custom instructions for your assistant',

        // Voice Settings
        voiceEnabled: 'Voice Enabled',
        speechRate: 'Speech Rate',
        pitch: 'Pitch',
        volume: 'Volume',
        voiceProvider: 'Voice Provider',
        testVoice: 'Test Voice',

        // Appearance Settings
        theme: 'Theme',
        highContrast: 'High Contrast',
        largeText: 'Large Text',
        animations: 'Animations',

        // Privacy Settings
        saveConversations: 'Save Conversations',
        analyticsEnabled: 'Analytics',
        crashReporting: 'Crash Reporting',
        shareUsageData: 'Share Usage Data',

        // Personality Options
        personalities: {
            friendly: 'Friendly',
            professional: 'Professional',
            casual: 'Casual',
            formal: 'Formal',
            custom: 'Custom',
        },

        // Theme Options
        themes: {
            light: 'Light',
            dark: 'Dark',
            auto: 'Auto',
        },

        // Voice Providers
        providers: {
            romai: 'RomAI',
            azure: 'Azure',
            mock: 'Mock (Testing)',
        },
    },

    // Conversation
    conversation: {
        title: 'Conversation',
        newConversation: 'New Conversation',
        clearConversation: 'Clear Conversation',
        exportConversation: 'Export Conversation',
        conversationHistory: 'Conversation History',
        noMessages: 'No messages yet. Start talking!',
        messageFrom: 'Message from',
        messageTo: 'Message to',
        timestamp: 'Timestamp',
        copyMessage: 'Copy Message',
        deleteMessage: 'Delete Message',
        editMessage: 'Edit Message',
    },

    // Character
    character: {
        greeting: 'Hello! I\'m {{name}}, your AI voice assistant.',
        helpPrompt: 'How can I help you today?',
        statusIdle: 'Ready',
        statusListening: 'Listening',
        statusSpeaking: 'Speaking',
        statusProcessing: 'Thinking',
        statusError: 'Error',
    },

    // Notifications
    notifications: {
        settingsSaved: 'Settings saved successfully',
        settingsError: 'Failed to save settings',
        conversationSaved: 'Conversation saved',
        conversationCleared: 'Conversation cleared',
        microphonePermissionGranted: 'Microphone permission granted',
        microphonePermissionDenied: 'Microphone permission denied',
        voiceTestComplete: 'Voice test complete',
        databaseError: 'Database error occurred',
        networkError: 'Network error occurred',
    },

    // Errors
    errors: {
        generic: 'Something went wrong',
        network: 'Network connection error',
        microphone: 'Microphone access error',
        speech: 'Speech recognition error',
        voice: 'Voice synthesis error',
        database: 'Database error',
        settings: 'Settings error',
        invalidInput: 'Invalid input provided',
        permissionDenied: 'Permission denied',
        notSupported: 'Feature not supported',
    },

    // Buttons
    buttons: {
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        copy: 'Copy',
        export: 'Export',
        import: 'Import',
        reset: 'Reset',
        clear: 'Clear',
        refresh: 'Refresh',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        continue: 'Continue',
        finish: 'Finish',
    },

    // Time & Dates
    time: {
        now: 'Now',
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This week',
        lastWeek: 'Last week',
        thisMonth: 'This month',
        lastMonth: 'Last month',
        longAgo: 'Long ago',
        seconds: 'seconds',
        minutes: 'minutes',
        hours: 'hours',
        days: 'days',
        weeks: 'weeks',
        months: 'months',
    },

    // Accessibility
    accessibility: {
        menu: 'Menu',
        settings: 'Settings',
        voiceControls: 'Voice Controls',
        conversationArea: 'Conversation Area',
        characterAnimation: 'Character Animation',
        volumeControl: 'Volume Control',
        languageSelector: 'Language Selector',
        themeToggle: 'Theme Toggle',
        microphoneToggle: 'Microphone Toggle',
        screenReaderSupport: 'Screen Reader Support',
        keyboardNavigation: 'Keyboard Navigation',
        highContrastMode: 'High Contrast Mode',
    },
} as const;
