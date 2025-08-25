/**
 * Enhanced Theme Configuration System for CODAI Ecosystem
 * Supports app-specific gradient themes, dark/light modes, and comprehensive theming
 */

export type AppName =
    | 'codai' | 'memorai' | 'bancai' | 'romai' | 'curtai' | 'studiai' | 'sociai' | 'stocai'
    | 'sunai' | 'talentai' | 'marketai' | 'logai' | 'prezentai' | 'metu' | 'muzicai'
    | 'admin' | 'hub' | 'id' | 'controlai' | 'glass' | 'tools' | 'wallet' | 'x'
    | 'publicai' | 'analizai' | 'conversai' | 'cumparai' | 'donai' | 'ajutai'
    | 'fabricai' | 'acasai' | 'adoptai' | 'mod' | 'dash' | 'aide' | 'gateway'
    | 'docs' | 'explorer' | 'jucai' | 'kodex' | 'legalizai' | 'promovai' | 'dexai'
    | 'bancai-mobile' | 'memorai-landing' | 'metu-web' | 'control'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppThemeConfig {
    name: string
    displayName: string
    description: string
    domain: string
    gradient: {
        from: string
        to: string
        direction: string
    }
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        foreground: string
    }
    darkMode: {
        primary: string
        secondary: string
        accent: string
        background: string
        foreground: string
    }
}

export const appThemes: Record<AppName, AppThemeConfig> = {
    // Tier 1: Core Platform Apps
    codai: {
        name: 'codai',
        displayName: 'CODAI',
        description: 'AI Development Environment Hub',
        domain: 'codai.ro',
        gradient: {
            from: 'rgb(59, 130, 246)', // blue-500
            to: 'rgb(147, 51, 234)', // purple-600
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(147, 51, 234)',
            accent: 'rgb(99, 102, 241)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(96, 165, 250)',
            secondary: 'rgb(168, 85, 247)',
            accent: 'rgb(129, 140, 248)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    memorai: {
        name: 'memorai',
        displayName: 'MemorAI',
        description: 'AI Database Platform',
        domain: 'memorai.ro',
        gradient: {
            from: 'rgb(147, 51, 234)', // purple-600
            to: 'rgb(99, 102, 241)', // indigo-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(147, 51, 234)',
            secondary: 'rgb(99, 102, 241)',
            accent: 'rgb(139, 92, 246)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(168, 85, 247)',
            secondary: 'rgb(129, 140, 248)',
            accent: 'rgb(167, 139, 250)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    fabricai: {
        name: 'fabricai',
        displayName: 'FabricAI',
        description: 'AI Services Marketplace',
        domain: 'fabricai.ro',
        gradient: {
            from: 'rgb(249, 115, 22)', // orange-500
            to: 'rgb(245, 158, 11)', // amber-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(249, 115, 22)',
            secondary: 'rgb(245, 158, 11)',
            accent: 'rgb(251, 146, 60)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(251, 146, 60)',
            secondary: 'rgb(251, 191, 36)',
            accent: 'rgb(252, 176, 64)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    // Tier 2: Specialized Domain Apps
    publicai: {
        name: 'publicai',
        displayName: 'PublicAI',
        description: 'Civic Technology Platform',
        domain: 'publicai.ro',
        gradient: {
            from: 'rgb(59, 130, 246)', // blue-500
            to: 'rgb(6, 182, 212)', // cyan-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(6, 182, 212)',
            accent: 'rgb(34, 197, 224)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(96, 165, 250)',
            secondary: 'rgb(34, 211, 238)',
            accent: 'rgb(56, 189, 248)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    studiai: {
        name: 'studiai',
        displayName: 'StudiAI',
        description: 'AI Education Platform',
        domain: 'studiai.ro',
        gradient: {
            from: 'rgb(20, 184, 166)', // teal-500
            to: 'rgb(59, 130, 246)', // blue-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(20, 184, 166)',
            secondary: 'rgb(59, 130, 246)',
            accent: 'rgb(45, 212, 191)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(45, 212, 191)',
            secondary: 'rgb(96, 165, 250)',
            accent: 'rgb(94, 234, 212)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    sociai: {
        name: 'sociai',
        displayName: 'SociAI',
        description: 'AI Social Platform',
        domain: 'sociai.ro',
        gradient: {
            from: 'rgb(236, 72, 153)', // pink-500
            to: 'rgb(147, 51, 234)', // purple-600
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(236, 72, 153)',
            secondary: 'rgb(147, 51, 234)',
            accent: 'rgb(244, 114, 182)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(244, 114, 182)',
            secondary: 'rgb(168, 85, 247)',
            accent: 'rgb(249, 168, 212)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    cumparai: {
        name: 'cumparai',
        displayName: 'CumparAI',
        description: 'AI Commerce Platform',
        domain: 'cumparai.ro',
        gradient: {
            from: 'rgb(34, 197, 94)', // green-500
            to: 'rgb(16, 185, 129)', // emerald-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(34, 197, 94)',
            secondary: 'rgb(16, 185, 129)',
            accent: 'rgb(74, 222, 128)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(74, 222, 128)',
            secondary: 'rgb(52, 211, 153)',
            accent: 'rgb(134, 239, 172)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    bancai: {
        name: 'bancai',
        displayName: 'BancAI',
        description: 'AI Financial Platform',
        domain: 'bancai.ro',
        gradient: {
            from: 'rgb(59, 130, 246)', // blue-500
            to: 'rgb(34, 197, 94)', // green-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(59, 130, 246)',
            secondary: 'rgb(34, 197, 94)',
            accent: 'rgb(20, 184, 166)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(96, 165, 250)',
            secondary: 'rgb(74, 222, 128)',
            accent: 'rgb(45, 212, 191)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    // Additional specialized apps with unique themes
    curtai: {
        name: 'curtai',
        displayName: 'CurtAI',
        description: 'AI Customer Relations',
        domain: 'curtai.ro',
        gradient: {
            from: 'rgb(236, 72, 153)', // pink-500
            to: 'rgb(244, 63, 94)', // rose-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(236, 72, 153)',
            secondary: 'rgb(244, 63, 94)',
            accent: 'rgb(251, 113, 133)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(244, 114, 182)',
            secondary: 'rgb(251, 113, 133)',
            accent: 'rgb(249, 168, 212)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    romai: {
        name: 'romai',
        displayName: 'RomAI',
        description: 'Romanian AI Platform',
        domain: 'romai.ro',
        gradient: {
            from: 'rgb(220, 38, 127)', // rose-600
            to: 'rgb(245, 158, 11)', // amber-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(220, 38, 127)',
            secondary: 'rgb(245, 158, 11)',
            accent: 'rgb(236, 72, 153)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(244, 114, 182)',
            secondary: 'rgb(251, 191, 36)',
            accent: 'rgb(249, 168, 212)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    // Core utility apps
    gateway: {
        name: 'gateway',
        displayName: 'Gateway',
        description: 'Ecosystem Navigation Center',
        domain: 'gateway.codai.ro',
        gradient: {
            from: 'rgb(71, 85, 105)', // slate-600
            to: 'rgb(99, 102, 241)', // indigo-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(71, 85, 105)',
            secondary: 'rgb(99, 102, 241)',
            accent: 'rgb(100, 116, 139)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(148, 163, 184)',
            secondary: 'rgb(129, 140, 248)',
            accent: 'rgb(203, 213, 225)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    docs: {
        name: 'docs',
        displayName: 'Docs',
        description: 'Documentation and Guides',
        domain: 'docs.codai.ro',
        gradient: {
            from: 'rgb(99, 102, 241)', // indigo-500
            to: 'rgb(139, 92, 246)', // violet-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(99, 102, 241)',
            secondary: 'rgb(139, 92, 246)',
            accent: 'rgb(129, 140, 248)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(129, 140, 248)',
            secondary: 'rgb(167, 139, 250)',
            accent: 'rgb(165, 180, 252)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    // Add remaining apps with placeholder themes (to be customized)
    aide: {
        name: 'aide',
        displayName: 'AIDE',
        description: 'AI Development Environment',
        domain: 'aide.codai.ro',
        gradient: {
            from: 'rgb(71, 85, 105)', // slate-600
            to: 'rgb(59, 130, 246)', // blue-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(71, 85, 105)',
            secondary: 'rgb(59, 130, 246)',
            accent: 'rgb(100, 116, 139)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(148, 163, 184)',
            secondary: 'rgb(96, 165, 250)',
            accent: 'rgb(203, 213, 225)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    explorer: {
        name: 'explorer',
        displayName: 'Explorer',
        description: 'Data and Service Discovery',
        domain: 'explorer.codai.ro',
        gradient: {
            from: 'rgb(6, 182, 212)', // cyan-500
            to: 'rgb(34, 197, 94)', // green-500
            direction: '135deg'
        },
        colors: {
            primary: 'rgb(6, 182, 212)',
            secondary: 'rgb(34, 197, 94)',
            accent: 'rgb(34, 211, 238)',
            background: 'rgb(255, 255, 255)',
            foreground: 'rgb(15, 23, 42)'
        },
        darkMode: {
            primary: 'rgb(34, 211, 238)',
            secondary: 'rgb(74, 222, 128)',
            accent: 'rgb(103, 232, 249)',
            background: 'rgb(15, 23, 42)',
            foreground: 'rgb(248, 250, 252)'
        }
    },

    // Default themes for remaining apps (to be customized)
    stocai: { name: 'stocai', displayName: 'StocAI', description: 'Stock Trading AI', domain: 'stocai.ro', gradient: { from: 'rgb(34, 197, 94)', to: 'rgb(20, 184, 166)', direction: '135deg' }, colors: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(20, 184, 166)', accent: 'rgb(74, 222, 128)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(74, 222, 128)', secondary: 'rgb(45, 212, 191)', accent: 'rgb(134, 239, 172)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    sunai: { name: 'sunai', displayName: 'SunAI', description: 'Solar Energy AI', domain: 'sunai.ro', gradient: { from: 'rgb(245, 158, 11)', to: 'rgb(249, 115, 22)', direction: '135deg' }, colors: { primary: 'rgb(245, 158, 11)', secondary: 'rgb(249, 115, 22)', accent: 'rgb(251, 191, 36)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(251, 191, 36)', secondary: 'rgb(251, 146, 60)', accent: 'rgb(252, 211, 77)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    talentai: { name: 'talentai', displayName: 'TalentAI', description: 'HR and Talent Management', domain: 'talentai.ro', gradient: { from: 'rgb(139, 92, 246)', to: 'rgb(236, 72, 153)', direction: '135deg' }, colors: { primary: 'rgb(139, 92, 246)', secondary: 'rgb(236, 72, 153)', accent: 'rgb(167, 139, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(167, 139, 250)', secondary: 'rgb(244, 114, 182)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    marketai: { name: 'marketai', displayName: 'MarketAI', description: 'Marketing Automation', domain: 'marketai.ro', gradient: { from: 'rgb(239, 68, 68)', to: 'rgb(245, 158, 11)', direction: '135deg' }, colors: { primary: 'rgb(239, 68, 68)', secondary: 'rgb(245, 158, 11)', accent: 'rgb(248, 113, 113)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(248, 113, 113)', secondary: 'rgb(251, 191, 36)', accent: 'rgb(252, 165, 165)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    logai: { name: 'logai', displayName: 'LogAI', description: 'Professional Logging', domain: 'logai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(100, 116, 139)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(100, 116, 139)', accent: 'rgb(148, 163, 184)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(203, 213, 225)', accent: 'rgb(226, 232, 240)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    prezentai: { name: 'prezentai', displayName: 'PrezentAI', description: 'Presentation Creation', domain: 'prezentai.ro', gradient: { from: 'rgb(99, 102, 241)', to: 'rgb(139, 92, 246)', direction: '135deg' }, colors: { primary: 'rgb(99, 102, 241)', secondary: 'rgb(139, 92, 246)', accent: 'rgb(129, 140, 248)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(129, 140, 248)', secondary: 'rgb(167, 139, 250)', accent: 'rgb(165, 180, 252)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    metu: { name: 'metu', displayName: 'METU', description: 'Voice AI Assistant', domain: 'metu.ro', gradient: { from: 'rgb(147, 51, 234)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(147, 51, 234)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(168, 85, 247)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(168, 85, 247)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    muzicai: { name: 'muzicai', displayName: 'MuzicAI', description: 'AI Music Platform', domain: 'muzicai.ro', gradient: { from: 'rgb(236, 72, 153)', to: 'rgb(139, 92, 246)', direction: '135deg' }, colors: { primary: 'rgb(236, 72, 153)', secondary: 'rgb(139, 92, 246)', accent: 'rgb(244, 114, 182)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(244, 114, 182)', secondary: 'rgb(167, 139, 250)', accent: 'rgb(249, 168, 212)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    admin: { name: 'admin', displayName: 'Admin', description: 'Administration Dashboard', domain: 'admin.codai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    hub: { name: 'hub', displayName: 'Hub', description: 'Central Ecosystem Coordinator', domain: 'hub.codai.ro', gradient: { from: 'rgb(59, 130, 246)', to: 'rgb(147, 51, 234)', direction: '135deg' }, colors: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(147, 51, 234)', accent: 'rgb(96, 165, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(96, 165, 250)', secondary: 'rgb(168, 85, 247)', accent: 'rgb(129, 140, 248)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    id: { name: 'id', displayName: 'ID', description: 'Identity Management System', domain: 'id.codai.ro', gradient: { from: 'rgb(99, 102, 241)', to: 'rgb(59, 130, 246)', direction: '135deg' }, colors: { primary: 'rgb(99, 102, 241)', secondary: 'rgb(59, 130, 246)', accent: 'rgb(129, 140, 248)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(129, 140, 248)', secondary: 'rgb(96, 165, 250)', accent: 'rgb(165, 180, 252)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    controlai: { name: 'controlai', displayName: 'ControlAI', description: 'Project Management Dashboard', domain: 'controlai.ro', gradient: { from: 'rgb(59, 130, 246)', to: 'rgb(147, 51, 234)', direction: '135deg' }, colors: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(147, 51, 234)', accent: 'rgb(96, 165, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(96, 165, 250)', secondary: 'rgb(168, 85, 247)', accent: 'rgb(129, 140, 248)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    glass: { name: 'glass', displayName: 'Glass', description: 'UI Automation Platform', domain: 'glass.codai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(6, 182, 212)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(6, 182, 212)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(34, 211, 238)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    tools: { name: 'tools', displayName: 'Tools', description: 'Development Tools Suite', domain: 'tools.codai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(100, 116, 139)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(100, 116, 139)', accent: 'rgb(148, 163, 184)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(203, 213, 225)', accent: 'rgb(226, 232, 240)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    wallet: { name: 'wallet', displayName: 'Wallet', description: 'Cryptocurrency Wallet', domain: 'wallet.codai.ro', gradient: { from: 'rgb(34, 197, 94)', to: 'rgb(59, 130, 246)', direction: '135deg' }, colors: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(59, 130, 246)', accent: 'rgb(74, 222, 128)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(74, 222, 128)', secondary: 'rgb(96, 165, 250)', accent: 'rgb(134, 239, 172)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    x: { name: 'x', displayName: 'X Platform', description: 'AI-Powered Trading', domain: 'x.codai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(239, 68, 68)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(239, 68, 68)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(248, 113, 113)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    analizai: { name: 'analizai', displayName: 'AnalizAI', description: 'Advanced Analytics', domain: 'analizai.ro', gradient: { from: 'rgb(99, 102, 241)', to: 'rgb(6, 182, 212)', direction: '135deg' }, colors: { primary: 'rgb(99, 102, 241)', secondary: 'rgb(6, 182, 212)', accent: 'rgb(129, 140, 248)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(129, 140, 248)', secondary: 'rgb(34, 211, 238)', accent: 'rgb(165, 180, 252)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    conversai: { name: 'conversai', displayName: 'ConversAI', description: 'Professional Communication', domain: 'conversai.ro', gradient: { from: 'rgb(139, 92, 246)', to: 'rgb(236, 72, 153)', direction: '135deg' }, colors: { primary: 'rgb(139, 92, 246)', secondary: 'rgb(236, 72, 153)', accent: 'rgb(167, 139, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(167, 139, 250)', secondary: 'rgb(244, 114, 182)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    donai: { name: 'donai', displayName: 'DonAI', description: 'Charitable Giving Platform', domain: 'donai.ro', gradient: { from: 'rgb(34, 197, 94)', to: 'rgb(16, 185, 129)', direction: '135deg' }, colors: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(16, 185, 129)', accent: 'rgb(74, 222, 128)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(74, 222, 128)', secondary: 'rgb(52, 211, 153)', accent: 'rgb(134, 239, 172)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    ajutai: { name: 'ajutai', displayName: 'AjutAI', description: 'AI Assistance Platform', domain: 'ajutai.ro', gradient: { from: 'rgb(59, 130, 246)', to: 'rgb(139, 92, 246)', direction: '135deg' }, colors: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(139, 92, 246)', accent: 'rgb(96, 165, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(96, 165, 250)', secondary: 'rgb(167, 139, 250)', accent: 'rgb(129, 140, 248)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    acasai: { name: 'acasai', displayName: 'AcasAI', description: 'Home Automation Platform', domain: 'acasai.ro', gradient: { from: 'rgb(16, 185, 129)', to: 'rgb(59, 130, 246)', direction: '135deg' }, colors: { primary: 'rgb(16, 185, 129)', secondary: 'rgb(59, 130, 246)', accent: 'rgb(52, 211, 153)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(52, 211, 153)', secondary: 'rgb(96, 165, 250)', accent: 'rgb(110, 231, 183)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    adoptai: { name: 'adoptai', displayName: 'AdoptAI', description: 'AI Adoption Platform', domain: 'adoptai.ro', gradient: { from: 'rgb(236, 72, 153)', to: 'rgb(245, 158, 11)', direction: '135deg' }, colors: { primary: 'rgb(236, 72, 153)', secondary: 'rgb(245, 158, 11)', accent: 'rgb(244, 114, 182)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(244, 114, 182)', secondary: 'rgb(251, 191, 36)', accent: 'rgb(249, 168, 212)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    mod: { name: 'mod', displayName: 'MOD', description: 'Modular Platform', domain: 'mod.codai.ro', gradient: { from: 'rgb(147, 51, 234)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(147, 51, 234)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(168, 85, 247)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(168, 85, 247)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    dash: { name: 'dash', displayName: 'Dash', description: 'Analytics Platform', domain: 'dash.codai.ro', gradient: { from: 'rgb(59, 130, 246)', to: 'rgb(147, 51, 234)', direction: '135deg' }, colors: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(147, 51, 234)', accent: 'rgb(96, 165, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(96, 165, 250)', secondary: 'rgb(168, 85, 247)', accent: 'rgb(129, 140, 248)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    jucai: { name: 'jucai', displayName: 'JucAI', description: 'Gaming and Entertainment', domain: 'jucai.ro', gradient: { from: 'rgb(239, 68, 68)', to: 'rgb(236, 72, 153)', direction: '135deg' }, colors: { primary: 'rgb(239, 68, 68)', secondary: 'rgb(236, 72, 153)', accent: 'rgb(248, 113, 113)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(248, 113, 113)', secondary: 'rgb(244, 114, 182)', accent: 'rgb(252, 165, 165)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    kodex: { name: 'kodex', displayName: 'Kodex', description: 'Development Tools Platform', domain: 'kodex.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    legalizai: { name: 'legalizai', displayName: 'LegalizAI', description: 'Legal Automation Platform', domain: 'legalizai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(239, 68, 68)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(239, 68, 68)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(248, 113, 113)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    promovai: { name: 'promovai', displayName: 'PromovAI', description: 'Marketing Automation Tools', domain: 'promovai.ro', gradient: { from: 'rgb(245, 158, 11)', to: 'rgb(236, 72, 153)', direction: '135deg' }, colors: { primary: 'rgb(245, 158, 11)', secondary: 'rgb(236, 72, 153)', accent: 'rgb(251, 191, 36)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(251, 191, 36)', secondary: 'rgb(244, 114, 182)', accent: 'rgb(252, 211, 77)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    dexai: { name: 'dexai', displayName: 'DexAI', description: 'Data Exchange Platform', domain: 'dexai.ro', gradient: { from: 'rgb(6, 182, 212)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(6, 182, 212)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(34, 211, 238)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(34, 211, 238)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(103, 232, 249)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    'bancai-mobile': { name: 'bancai-mobile', displayName: 'BancAI Mobile', description: 'Mobile Banking App', domain: 'mobile.bancai.ro', gradient: { from: 'rgb(59, 130, 246)', to: 'rgb(34, 197, 94)', direction: '135deg' }, colors: { primary: 'rgb(59, 130, 246)', secondary: 'rgb(34, 197, 94)', accent: 'rgb(96, 165, 250)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(96, 165, 250)', secondary: 'rgb(74, 222, 128)', accent: 'rgb(129, 140, 248)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    'memorai-landing': { name: 'memorai-landing', displayName: 'MemorAI Landing', description: 'Database Platform Showcase', domain: 'memorai.ro', gradient: { from: 'rgb(147, 51, 234)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(147, 51, 234)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(168, 85, 247)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(168, 85, 247)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    'metu-web': { name: 'metu-web', displayName: 'METU Web', description: 'Browser-based Voice AI', domain: 'web.metu.ro', gradient: { from: 'rgb(147, 51, 234)', to: 'rgb(99, 102, 241)', direction: '135deg' }, colors: { primary: 'rgb(147, 51, 234)', secondary: 'rgb(99, 102, 241)', accent: 'rgb(168, 85, 247)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(168, 85, 247)', secondary: 'rgb(129, 140, 248)', accent: 'rgb(196, 181, 253)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } },
    control: { name: 'control', displayName: 'Control', description: 'System Control Center', domain: 'control.codai.ro', gradient: { from: 'rgb(71, 85, 105)', to: 'rgb(59, 130, 246)', direction: '135deg' }, colors: { primary: 'rgb(71, 85, 105)', secondary: 'rgb(59, 130, 246)', accent: 'rgb(100, 116, 139)', background: 'rgb(255, 255, 255)', foreground: 'rgb(15, 23, 42)' }, darkMode: { primary: 'rgb(148, 163, 184)', secondary: 'rgb(96, 165, 250)', accent: 'rgb(203, 213, 225)', background: 'rgb(15, 23, 42)', foreground: 'rgb(248, 250, 252)' } }
}

// CSS Custom Properties generator
export const generateAppCSSVariables = (appName: AppName, isDark = false): Record<string, string> => {
    const theme = appThemes[appName]
    const colors = isDark ? theme.darkMode : theme.colors

    return {
        '--color-primary': colors.primary,
        '--color-secondary': colors.secondary,
        '--color-accent': colors.accent,
        '--color-background': colors.background,
        '--color-foreground': colors.foreground,
        '--gradient-primary': `linear-gradient(${theme.gradient.direction}, ${theme.gradient.from}, ${theme.gradient.to})`,
        '--gradient-from': theme.gradient.from,
        '--gradient-to': theme.gradient.to,
        '--gradient-direction': theme.gradient.direction
    }
}

// Tailwind CSS class generator
export const generateAppTailwindClasses = (appName: AppName): Record<string, string> => {
    const theme = appThemes[appName]

    return {
        gradientBg: `bg-gradient-to-br from-[${theme.gradient.from}] to-[${theme.gradient.to}]`,
        primaryBg: `bg-[${theme.colors.primary}]`,
        secondaryBg: `bg-[${theme.colors.secondary}]`,
        accentBg: `bg-[${theme.colors.accent}]`,
        primaryText: `text-[${theme.colors.primary}]`,
        secondaryText: `text-[${theme.colors.secondary}]`,
        accentText: `text-[${theme.colors.accent}]`,
        primaryBorder: `border-[${theme.colors.primary}]`,
        secondaryBorder: `border-[${theme.colors.secondary}]`,
        accentBorder: `border-[${theme.colors.accent}]`
    }
}

export default appThemes
