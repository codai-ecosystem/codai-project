/**
 * METU Translation Service - Romanian Translations
 * 
 * Romanian language strings for the METU voice assistant interface.
 */

export const ro = {
    // Application
    app: {
        title: 'METU Asistent Vocal',
        description: 'Asistent vocal alimentat de inteligență artificială revoluționară',
        version: 'Versiuneea 1.0.0',
        loading: 'Se încarcă...',
        error: 'A apărut o eroare',
        retry: 'Reîncercare',
    },

    // Voice Interface
    voice: {
        listening: 'Ascult...',
        speaking: 'Vorbesc...',
        processing: 'Procesez...',
        idle: 'Gata să ascult',
        startListening: 'Apasă pentru a începe ascultarea',
        stopListening: 'Apasă pentru a opri ascultarea',
        microphoneAccess: 'Este necesară accesul la microfon',
        microphoneError: 'Nu s-a putut accesa microfonul',
        voiceNotSupported: 'Recunoașterea vocală nu este suportată',
        speakingVolume: 'Volum vorbire',
        listeningVolume: 'Volum ascultare',
    },

    // Settings
    settings: {
        title: 'Setări',
        general: 'General',
        voice: 'Voce',
        appearance: 'Aspect',
        privacy: 'Confidențialitate',
        about: 'Despre',

        // General Settings
        assistantName: 'Numele Asistentului',
        assistantNamePlaceholder: 'Introduceți numele asistentului',
        language: 'Limba',
        personality: 'Personalitate',
        customInstructions: 'Instrucțiuni Personalizate',
        customInstructionsPlaceholder: 'Introduceți instrucțiuni personalizate pentru asistentul dumneavoastră',

        // Voice Settings
        voiceEnabled: 'Voce Activată',
        speechRate: 'Viteza Vorbirii',
        pitch: 'Tonul',
        volume: 'Volumul',
        voiceProvider: 'Furnizor Voce',
        testVoice: 'Testează Vocea',

        // Appearance Settings
        theme: 'Temă',
        highContrast: 'Contrast Ridicat',
        largeText: 'Text Mare',
        animations: 'Animații',

        // Privacy Settings
        saveConversations: 'Salvează Conversațiile',
        analyticsEnabled: 'Analiză',
        crashReporting: 'Raportarea Erorilor',
        shareUsageData: 'Partajează Datele de Utilizare',

        // Personality Options
        personalities: {
            friendly: 'Prietenos',
            professional: 'Profesional',
            casual: 'Casual',
            formal: 'Formal',
            custom: 'Personalizat',
        },

        // Theme Options
        themes: {
            light: 'Luminos',
            dark: 'Întunecat',
            auto: 'Automat',
        },

        // Voice Providers
        providers: {
            romai: 'RomAI',
            azure: 'Azure',
            mock: 'Mock (Testare)',
        },
    },

    // Conversation
    conversation: {
        title: 'Conversație',
        newConversation: 'Conversație Nouă',
        clearConversation: 'Șterge Conversația',
        exportConversation: 'Exportă Conversația',
        conversationHistory: 'Istoricul Conversațiilor',
        noMessages: 'Încă nu există mesaje. Începeți să vorbiți!',
        messageFrom: 'Mesaj de la',
        messageTo: 'Mesaj către',
        timestamp: 'Timestamp',
        copyMessage: 'Copiază Mesajul',
        deleteMessage: 'Șterge Mesajul',
        editMessage: 'Modifică Mesajul',
    },

    // Character
    character: {
        greeting: 'Salut! Sunt {{name}}, asistentul tău vocal cu inteligență artificială.',
        helpPrompt: 'Cu ce te pot ajuta astăzi?',
        statusIdle: 'Gata',
        statusListening: 'Ascult',
        statusSpeaking: 'Vorbesc',
        statusProcessing: 'Mă gândesc',
        statusError: 'Eroare',
    },

    // Notifications
    notifications: {
        settingsSaved: 'Setările au fost salvate cu succes',
        settingsError: 'Nu s-au putut salva setările',
        conversationSaved: 'Conversația a fost salvată',
        conversationCleared: 'Conversația a fost ștearsă',
        microphonePermissionGranted: 'Permisiunea pentru microfon a fost acordată',
        microphonePermissionDenied: 'Permisiunea pentru microfon a fost refuzată',
        voiceTestComplete: 'Testul vocii s-a finalizat',
        databaseError: 'A apărut o eroare de bază de date',
        networkError: 'A apărut o eroare de rețea',
    },

    // Errors
    errors: {
        generic: 'Ceva nu a mers bine',
        network: 'Eroare de conexiune la rețea',
        microphone: 'Eroare de acces la microfon',
        speech: 'Eroare de recunoaștere vocală',
        voice: 'Eroare de sinteză vocală',
        database: 'Eroare de bază de date',
        settings: 'Eroare de setări',
        invalidInput: 'Input invalid furnizat',
        permissionDenied: 'Permisiunea a fost refuzată',
        notSupported: 'Funcția nu este suportată',
    },

    // Buttons
    buttons: {
        ok: 'OK',
        cancel: 'Anulează',
        save: 'Salvează',
        delete: 'Șterge',
        edit: 'Modifică',
        copy: 'Copiază',
        export: 'Exportă',
        import: 'Importă',
        reset: 'Resetează',
        clear: 'Șterge',
        refresh: 'Reîmprospătează',
        close: 'Închide',
        back: 'Înapoi',
        next: 'Următorul',
        previous: 'Anteriorul',
        continue: 'Continuă',
        finish: 'Finalizează',
    },

    // Time & Dates
    time: {
        now: 'Acum',
        today: 'Astăzi',
        yesterday: 'Ieri',
        thisWeek: 'Săptămâna aceasta',
        lastWeek: 'Săptămâna trecută',
        thisMonth: 'Luna aceasta',
        lastMonth: 'Luna trecută',
        longAgo: 'Demult',
        seconds: 'secunde',
        minutes: 'minute',
        hours: 'ore',
        days: 'zile',
        weeks: 'săptămâni',
        months: 'luni',
    },

    // Accessibility
    accessibility: {
        menu: 'Meniu',
        settings: 'Setări',
        voiceControls: 'Controale Vocale',
        conversationArea: 'Zona de Conversație',
        characterAnimation: 'Animația Personajului',
        volumeControl: 'Controlul Volumului',
        languageSelector: 'Selectorul de Limbă',
        themeToggle: 'Comutarea Temei',
        microphoneToggle: 'Comutarea Microfonului',
        screenReaderSupport: 'Suport pentru Cititorul de Ecran',
        keyboardNavigation: 'Navigarea cu Tastatura',
        highContrastMode: 'Modul Contrast Ridicat',
    },
} as const;
