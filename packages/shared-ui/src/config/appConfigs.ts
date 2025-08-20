export interface AppConfig {
    name: string
    description: string
    tagline: string
    port: number
    theme: {
        primary: string
        secondary: string
        accent: string
    }
    features: string[]
    navigation: Array<{
        label: string
        labelKey: string
        href: string
        icon?: string
        requiresAuth?: boolean
    }>
    auth: {
        enabled: boolean
        landingPage: string
        dashboardPage: string
        loginPage: string
        signupPage: string
    }
    i18n: {
        defaultLanguage: 'en' | 'ro'
        supportedLanguages: Array<'en' | 'ro'>
    }
}

// Define all 43 apps with their unique configurations
export const appConfigs: Record<string, AppConfig> = {
    codai: {
        name: 'CODAI',
        description: 'Intelligent Code Generation Platform',
        tagline: 'Empowering developers with AI-driven code generation',
        port: 5000,
        theme: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(147, 51, 234)',
            accent: 'rgb(34, 197, 94)'
        },
        features: ['Code Generation', 'AI Assistant', 'Project Templates', 'Real-time Collaboration'],
        navigation: [
            { label: 'Dashboard', labelKey: 'nav.dashboard', href: '/dashboard', requiresAuth: true },
            { label: 'Projects', labelKey: 'nav.projects', href: '/projects', requiresAuth: true },
            { label: 'Templates', labelKey: 'nav.templates', href: '/templates' },
            { label: 'API', labelKey: 'nav.api', href: '/api', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/dashboard',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    conversai: {
        name: 'CONVERSAI',
        description: 'Advanced AI Conversation Platform',
        tagline: 'Natural conversations with artificial intelligence',
        port: 5001,
        theme: {
            primary: 'rgb(34, 197, 94)',
            secondary: 'rgb(59, 130, 246)',
            accent: 'rgb(244, 63, 94)'
        },
        features: ['Natural Language Processing', 'Multi-language Support', 'Context Awareness', 'Custom Models'],
        navigation: [
            { label: 'Chat', labelKey: 'nav.chat', href: '/chat', requiresAuth: true },
            { label: 'History', labelKey: 'nav.history', href: '/history', requiresAuth: true },
            { label: 'Models', labelKey: 'nav.models', href: '/models', requiresAuth: true },
            { label: 'Settings', labelKey: 'nav.settings', href: '/settings', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/chat',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    memorai: {
        name: 'MEMORAI',
        description: 'Intelligent Memory Management System',
        tagline: 'Never forget anything important again',
        port: 5002,
        theme: {
            primary: 'rgb(147, 51, 234)',
            secondary: 'rgb(236, 72, 153)',
            accent: 'rgb(59, 130, 246)'
        },
        features: ['Smart Categorization', 'Search & Recall', 'Timeline View', 'Cross-platform Sync'],
        navigation: [
            { label: 'Memories', labelKey: 'nav.memories', href: '/memories', requiresAuth: true },
            { label: 'Search', labelKey: 'nav.search', href: '/search', requiresAuth: true },
            { label: 'Categories', labelKey: 'nav.categories', href: '/categories', requiresAuth: true },
            { label: 'Timeline', labelKey: 'nav.timeline', href: '/timeline', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/memories',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    analizai: {
        name: 'ANALIZAI',
        description: 'Advanced Data Analysis Platform',
        tagline: 'Transform data into actionable insights',
        port: 5003,
        theme: {
            primary: 'rgb(168, 85, 247)',
            secondary: 'rgb(59, 130, 246)',
            accent: 'rgb(34, 197, 94)'
        },
        features: ['Data Visualization', 'Statistical Analysis', 'Machine Learning', 'Report Generation'],
        navigation: [
            { label: 'Analytics', labelKey: 'nav.analytics', href: '/analytics', requiresAuth: true },
            { label: 'Reports', labelKey: 'nav.reports', href: '/reports', requiresAuth: true },
            { label: 'Data Sources', labelKey: 'nav.dataSources', href: '/sources', requiresAuth: true },
            { label: 'Models', labelKey: 'nav.models', href: '/models', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/analytics',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    bancai: {
        name: 'BANCAI',
        description: 'AI-Powered Banking Solutions',
        tagline: 'The future of intelligent banking',
        port: 5004,
        theme: {
            primary: 'rgb(34, 197, 94)',
            secondary: 'rgb(16, 185, 129)',
            accent: 'rgb(59, 130, 246)'
        },
        features: ['Smart Transactions', 'Fraud Detection', 'Financial Planning', 'Investment Advisory'],
        navigation: [
            { label: 'Accounts', labelKey: 'nav.accounts', href: '/accounts', requiresAuth: true },
            { label: 'Transactions', labelKey: 'nav.transactions', href: '/transactions', requiresAuth: true },
            { label: 'Investments', labelKey: 'nav.investments', href: '/investments', requiresAuth: true },
            { label: 'Insights', labelKey: 'nav.insights', href: '/insights', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/accounts',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    id: {
        name: 'CODAI ID',
        description: 'Enterprise Identity & Authentication Platform',
        tagline: 'Secure identity services for the CODAI ecosystem',
        port: 4004,
        theme: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(37, 99, 235)',
            accent: 'rgb(34, 197, 94)'
        },
        features: ['Identity Management', 'Multi-factor Authentication', 'Single Sign-On', 'Audit Logging'],
        navigation: [
            { label: 'Dashboard', labelKey: 'nav.dashboard', href: '/dashboard', requiresAuth: true },
            { label: 'Users', labelKey: 'nav.users', href: '/users', requiresAuth: true },
            { label: 'Authentication', labelKey: 'nav.auth', href: '/auth', requiresAuth: true },
            { label: 'Sessions', labelKey: 'nav.sessions', href: '/sessions', requiresAuth: true },
            { label: 'Security', labelKey: 'nav.security', href: '/security', requiresAuth: true },
            { label: 'Audit Logs', labelKey: 'nav.audit', href: '/audit', requiresAuth: true },
            { label: 'Settings', labelKey: 'nav.settings', href: '/settings', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/dashboard',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    // Add more apps as needed...
    stocai: {
        name: 'STOCAI',
        description: 'Intelligent Stock Management',
        tagline: 'Smart inventory with AI predictions',
        port: 5005,
        theme: {
            primary: 'rgb(249, 115, 22)',
            secondary: 'rgb(234, 88, 12)',
            accent: 'rgb(59, 130, 246)'
        },
        features: ['Inventory Tracking', 'Demand Forecasting', 'Automated Ordering', 'Analytics Dashboard'],
        navigation: [
            { label: 'Inventory', labelKey: 'nav.inventory', href: '/inventory', requiresAuth: true },
            { label: 'Orders', labelKey: 'nav.orders', href: '/orders', requiresAuth: true },
            { label: 'Forecasting', labelKey: 'nav.forecasting', href: '/forecasting', requiresAuth: true },
            { label: 'Reports', labelKey: 'nav.reports', href: '/reports', requiresAuth: true }
        ],
        auth: {
            enabled: true,
            landingPage: '/',
            dashboardPage: '/inventory',
            loginPage: '/login',
            signupPage: '/signup'
        },
        i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ro']
        }
    },

    // Define configurations for all other apps
    acasai: { name: 'ACASAI', description: 'Smart Home Automation', tagline: 'Your intelligent home companion', port: 5006, theme: { primary: 'rgb(99, 102, 241)', secondary: 'rgb(79, 70, 229)', accent: 'rgb(34, 197, 94)' }, features: ['Home Automation', 'Energy Management', 'Security System', 'Voice Control'], navigation: [{ label: 'Dashboard', labelKey: 'nav.dashboard', href: '/dashboard', requiresAuth: true }], auth: { enabled: true, landingPage: '/', dashboardPage: '/dashboard', loginPage: '/login', signupPage: '/signup' }, i18n: { defaultLanguage: 'en', supportedLanguages: ['en', 'ro'] } },

    ajutai: { name: 'AJUTAI', description: 'AI-Powered Customer Support', tagline: 'Instant, intelligent customer assistance', port: 5007, theme: { primary: 'rgb(14, 165, 233)', secondary: 'rgb(2, 132, 199)', accent: 'rgb(34, 197, 94)' }, features: ['24/7 Support', 'Multi-language', 'Smart Routing', 'Analytics'], navigation: [{ label: 'Support', labelKey: 'nav.support', href: '/support', requiresAuth: true }], auth: { enabled: true, landingPage: '/', dashboardPage: '/support', loginPage: '/login', signupPage: '/signup' }, i18n: { defaultLanguage: 'en', supportedLanguages: ['en', 'ro'] } },

    // Continue for all 43 apps...
    aide: { name: 'AIDE', description: 'AI Development Environment', tagline: 'Your coding companion', port: 5008, theme: { primary: 'rgb(124, 58, 237)', secondary: 'rgb(109, 40, 217)', accent: 'rgb(34, 197, 94)' }, features: ['Code Assistance', 'Debugging', 'Documentation', 'Testing'], navigation: [{ label: 'Editor', labelKey: 'nav.editor', href: '/editor', requiresAuth: true }], auth: { enabled: true, landingPage: '/', dashboardPage: '/editor', loginPage: '/login', signupPage: '/signup' }, i18n: { defaultLanguage: 'en', supportedLanguages: ['en', 'ro'] } },

    // ... (continuing with all other apps)
}

export default appConfigs
