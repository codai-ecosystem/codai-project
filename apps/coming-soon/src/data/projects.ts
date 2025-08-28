import {
    Brain, Code, Database, Globe, GraduationCap, Heart, Shield, ShoppingCart,
    Users, Zap, Building, Briefcase, BookOpen, Palette, Music, Camera, Car,
    Home, Gamepad2, Calculator, MapPin, Plane, Coffee, Phone, Mail, Clock,
    Calendar, FileText, PenTool, Search, BarChart, Settings, Cloud, Lock,
    Wifi, Battery, Smartphone, Laptop, Tablet, Watch, Headphones, Speaker,
    Monitor, Keyboard, Mouse, Printer, HardDrive, Cpu, MemoryStick, Router,
    Server, Fingerprint, Eye, Ear, Lightbulb, Thermometer, Wind, Sun,
    Umbrella, Snowflake, Flame, Droplets, Leaf, Flower, Trees, Mountain,
    Waves, Star, Moon, Sunrise, CreditCard, Wallet, TrendingUp, Store,
    Scale, HelpCircle, Archive, BarChart3, User, Layers, Wrench, Target,
    Utensils, Navigation, RefreshCw, Headphones as Audio, Presentation,
    Flag, Zap as Energy, UserCheck, Hammer, Building2, Gavel, MessageSquare,
    Network, TrendingDown, Gift
} from 'lucide-react';

export interface Project {
    id: string;
    name: string;
    domain: string;
    description: string;
    fullDescription: string;
    status: 'production' | 'development' | 'beta' | 'coming-soon' | 'planned';
    category: string;
    icon: React.ComponentType;
    features: string[];
    launchDate: string;
    tier: 1 | 2 | 3 | 4 | 5;
    tagline?: string;
    techStack?: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
    gradient: string;
    accentColor: string;
}

export const projectCategories = [
    'Foundation Services',    // Tier 1 - Essential backbone services
    'New Generation',        // Tier 2 - Innovative market expansion  
    'Infrastructure',        // Tier 3 - Critical infrastructure services
    'Specialized Services',  // Tier 4 - Unique value propositions
    'Emerging Platforms'     // Tier 5 - Future innovation platforms
];

export const codaiProjects: Project[] = [
    // ========== TIER 1: FOUNDATION SERVICES (8 Apps) ==========
    {
        id: 'codai',
        name: 'CODAI Platform',
        domain: 'codai.ro',
        description: 'Central Platform & AIDE Hub - AI development environment that makes coding as simple as conversation',
        fullDescription: 'CODAI is the central AI-native development environment where AIDE is presented as the main platform. Features chat-driven development, GitHub Copilot integration, instant project setup, and works everywhere (web browser or desktop app).',
        status: 'production',
        category: 'Foundation Services',
        icon: Brain,
        features: [
            'Chat-Driven Development: Describe your project, get working code',
            'Minimal & Focused: Only what you need with GitHub Copilot built-in',
            'Works Everywhere: Web browser or desktop app',
            'Instant Setup: New project in 30 seconds',
            'AI-First: Powered by GitHub Copilot for intelligent code completion'
        ],
        techStack: ['Next.js', 'GitHub Copilot', 'TypeScript', 'WebRTC', 'Docker'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'critical',
        tagline: 'Code is conversation. AIDE handles the complexity.',
        gradient: 'from-blue-600 via-purple-600 to-indigo-700',
        accentColor: '#6366F1'
    },
    {
        id: 'memorai',
        name: 'MemorAI',
        domain: 'memorai.ro',
        description: 'Memory and Database SaaS - Next-generation AI-specialized database for all scenarios',
        fullDescription: 'MemorAI is a next-generation database that specializes in AI scenarios, working with any database type (Firebase, SQL). Features local.memorai.ro dashboard for localhost MCP server and mcp.memorai.ro for cloud MCP tool endpoint.',
        status: 'production',
        category: 'Foundation Services',
        icon: Database,
        features: [
            'AI-Specialized Database: Works with Firebase, SQL, and all database types',
            'MCP Server Integration: Memory storage for AI agents with sync capabilities',
            'Complete Dashboard: All database tools and MCP configurations available',
            'Easy Setup: Intuitive modern UI with easy configuration',
            'Enterprise Security: Highest enterprise AI security standards'
        ],
        techStack: ['PostgreSQL', 'GraphQL', 'Vector DB', 'MCP Protocol', 'Redis'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'critical',
        tagline: 'Firebase + CosmosDB + Supabase + MongoDB + phpMyAdmin + GraphQL combined and better.',
        gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
        accentColor: '#10B981'
    },
    {
        id: 'fabricai',
        name: 'FabricAI',
        domain: 'fabricai.ro',
        description: 'AI-Powered Services Platform - Domains, hosting, AI integrations, and custom solutions',
        fullDescription: 'FabricAI is the services-focused brand providing AI-powered services to end users and businesses. Sells domains, hosting, AI integrations, and custom solutions as a public-facing services platform.',
        status: 'production',
        category: 'Foundation Services',
        icon: Building2,
        features: [
            'AI-Powered Service Creation',
            'Domain & Hosting Solutions',
            'Custom AI Integrations',
            'Business Automation Tools',
            'End-User AI Applications'
        ],
        techStack: ['Next.js', 'AI Services', 'Cloud Infrastructure', 'Custom Development'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'high',
        tagline: 'AI services and solutions for everyone.',
        gradient: 'from-fuchsia-500 via-pink-600 to-rose-700',
        accentColor: '#D946EF'
    },
    {
        id: 'publicai',
        name: 'PublicAI',
        domain: 'publicai.ro',
        description: 'AI for Society, Politics, and the Public Good - Civic transparency and democracy tools',
        fullDescription: 'PublicAI provides tools, agents, and platforms that empower citizens, governments, NGOs, journalists, and activists to use AI for transparency, accountability, democracy, and civic innovation.',
        status: 'production',
        category: 'Foundation Services',
        icon: Flag,
        features: [
            'Agentul Digital al Poporului (Digital Citizen Agent)',
            'Harta Transparentă a Banilor Publici (Public Money Transparency Map)',
            'AI watchdog tools for analyzing public data, budgets, and laws',
            'Citizen request portals, FOIA assistants, auto-generated petitions',
            'AI assistants for local councils, legal transparency, voting guides'
        ],
        techStack: ['Next.js', 'Government APIs', 'Blockchain', 'Data Analytics'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'high',
        tagline: 'AI for the People. Powered by Truth.',
        gradient: 'from-slate-500 via-gray-600 to-zinc-700',
        accentColor: '#64748B'
    },
    {
        id: 'studiai',
        name: 'StudiAI',
        domain: 'studiai.ro',
        description: 'AI for Learning, Teaching, and Personal Growth - Personalized education with AI tutors',
        fullDescription: 'StudiAI is a personalized education platform that adapts to each student\'s learning style, providing AI-powered tutoring and adaptive learning materials with emphasis on neurodivergent support.',
        status: 'production',
        category: 'Foundation Services',
        icon: GraduationCap,
        features: [
            'Adaptive AI tutors for every subject',
            'Neurodivergent-friendly learning environments (ADHD/autistic learners)',
            'Curriculum-to-prompt tools for educators',
            'Essay feedback, idea refinement, and personalized coaching',
            'Parent dashboards, emotion-aware learning feedback'
        ],
        techStack: ['Next.js', 'AI Tutoring', 'Adaptive Learning', 'Analytics'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'high',
        tagline: 'Learn with AI. Your way, every day.',
        gradient: 'from-indigo-500 via-purple-600 to-pink-700',
        accentColor: '#6366F1'
    },
    {
        id: 'sociai',
        name: 'SociAI',
        domain: 'sociai.ro',
        description: 'AI-Powered Social Platform - Modern MySpace/Hi5 with AI enhancement and cross-platform sync',
        fullDescription: 'SociAI is like a new modern version of MySpace, Hi5, where users can stylize their profile how they please and have all functionalities of other social platforms plus sync their posts from those other socials.',
        status: 'production',
        category: 'Foundation Services',
        icon: Users,
        features: [
            'AI companions, digital twins, or virtual influencers',
            'Customizable Profile Styling (MySpace/Hi5 style)',
            'Cross-Platform Social Media Sync',
            'Relationship advisors, breakup recovery agents',
            'Social media content assistants (reels, captions, trends)'
        ],
        techStack: ['Next.js', 'Social APIs', 'AI Companions', 'Profile Customization'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'high',
        tagline: 'AI that gets you. Be more you with AI.',
        gradient: 'from-violet-500 via-purple-600 to-pink-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'cumparai',
        name: 'CumparAI',
        domain: 'cumparai.ro',
        description: 'AI-Powered Marketplace - Smart commerce with AI recommendations and e-commerce platform',
        fullDescription: 'CumparAI is a personalized e-commerce marketplace powered by AI that recommends products based on user preferences. Can be used as standalone WooCommerce/Prestashop alternative or cloud solution.',
        status: 'production',
        category: 'Foundation Services',
        icon: ShoppingCart,
        features: [
            'AI personal shopper (clothing, gifts, gadgets)',
            'Taste-based product recommenders ("show me items that match my vibe")',
            'Price tracker & smart deal finder (AI-powered Price.ro)',
            'AI product review summarizer',
            'WooCommerce/Prestashop/Magento Alternative'
        ],
        techStack: ['Next.js', 'E-commerce', 'AI Recommendations', 'Stripe Integration'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'high',
        tagline: 'Cumperi mai bine. Cu AI. (AI that shops smart. So you don\'t have to.)',
        gradient: 'from-purple-500 via-violet-600 to-indigo-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'bancai',
        name: 'BancAI',
        domain: 'bancai.ro',
        description: 'AI for Banking, Finance & Digital Wealth - Intelligent financial services with KYC/AML',
        fullDescription: 'BancAI provides AI-powered financial platform offering KYC/AML compliance, payment processing, digital wealth management, and serves as the core payment gateway for the Codai ecosystem.',
        status: 'production',
        category: 'Foundation Services',
        icon: CreditCard,
        features: [
            'AI financial advisor (automated insights, savings tips)',
            'KYC/AML integrations for all Codai ecosystem products',
            'Stripe/PayPal/crypto integrations as services',
            'Subscription & payment layer for all .ro services',
            'Romanian fiscal compliance helper (ANAF filings)'
        ],
        techStack: ['Next.js', 'Stripe', 'KYC/AML', 'Financial APIs', 'Compliance'],
        launchDate: '2024-Q4',
        tier: 1,
        priority: 'critical',
        tagline: 'Viitorul banilor e automat. Și personal. (Bank smart. Live free.)',
        gradient: 'from-green-500 via-emerald-600 to-teal-700',
        accentColor: '#059669'
    },

    // ========== TIER 2: NEW GENERATION PLATFORMS (3 Apps) ==========
    {
        id: 'schimbai',
        name: 'SchimbAI',
        domain: 'schimbai.ro',
        description: 'AI-Powered Exchange & Transformation - Universal transformation hub for currencies, data, and formats',
        fullDescription: 'SchimbAI serves as the universal transformation hub handling currency exchange, data transformation, format conversion, and intelligent optimization across all digital assets.',
        status: 'development',
        category: 'New Generation',
        icon: RefreshCw,
        features: [
            'Multi-currency exchange (RON, EUR, USD, crypto) with AI predictions',
            'Real-time rate optimization with smart arbitrage detection',
            'Data transformation (JSON ↔ XML ↔ CSV) with intelligent schema mapping',
            'Content conversion (PDF, DOCX, HTML, Markdown)',
            'API-first architecture for developer integration'
        ],
        techStack: ['Next.js', 'Financial APIs', 'Data Transformation', 'AI Optimization'],
        launchDate: '2025-Q2',
        tier: 2,
        priority: 'high',
        tagline: 'Schimbă tot. Cu AI. (The intelligent transformation layer.)',
        gradient: 'from-yellow-500 via-orange-600 to-red-700',
        accentColor: '#F59E0B'
    },
    {
        id: 'mancai',
        name: 'MancAI',
        domain: 'mancai.ro',
        description: 'AI-Powered Food Delivery - Revolutionary food delivery surpassing Glovo and Bolt Food',
        fullDescription: 'MancAI revolutionizes food delivery with AI-powered recommendations, intelligent logistics, and superior user experience beyond traditional delivery platforms.',
        status: 'development',
        category: 'New Generation',
        icon: Utensils,
        features: [
            '"What should I eat?" conversational AI interface',
            'Mood-based food recommendations with dietary intelligence',
            'AI-verified authentic reviews with sentiment analysis',
            'Superior logistics with real-time delivery optimization',
            'Zero delivery fees for subscription members'
        ],
        techStack: ['Next.js', 'AI Recommendations', 'Logistics APIs', 'Real-time Tracking'],
        launchDate: '2025-Q2',
        tier: 2,
        priority: 'high',
        tagline: 'Nu doar mâncare. Experiență culinară inteligentă. (AI that knows what you\'re craving.)',
        gradient: 'from-orange-500 via-red-600 to-pink-700',
        accentColor: '#F97316'
    },
    {
        id: 'plecai',
        name: 'PlecAI',
        domain: 'plecai.ro',
        description: 'AI-Powered Ride Sharing - Transparent ride sharing surpassing Uber and Bolt',
        fullDescription: 'PlecAI transforms ride sharing with complete transparency, driver-controlled pricing, mutual public reviews, and AI-optimized safety surpassing traditional platforms.',
        status: 'development',
        category: 'New Generation',
        icon: Car,
        features: [
            'Drivers set their own rates with transparent dynamic pricing',
            'Bidirectional public review system (drivers can review passengers)',
            'AI-enhanced safety monitoring with emergency protocols',
            'Complete transparency dashboard with open-source pricing algorithms',
            'Environmental focus with carbon footprint tracking'
        ],
        techStack: ['Next.js', 'Real-time Tracking', 'Safety Monitoring', 'Payment Processing'],
        launchDate: '2025-Q2',
        tier: 2,
        priority: 'high',
        tagline: 'Transport transparent. Prețuri corecte. Siguranță maximă. (Fair rides. Real safety. AI-powered.)',
        gradient: 'from-blue-500 via-indigo-600 to-purple-700',
        accentColor: '#3B82F6'
    },

    // ========== TIER 3: INFRASTRUCTURE SERVICES (10 Apps) ==========
    {
        id: 'ajutai',
        name: 'AjutAI',
        domain: 'ajutai.ro',
        description: 'AI Help for Everything - Unified customer support and help across all Codai projects',
        fullDescription: 'AjutAI serves as the AI support layer across all Codai projects, offering help, onboarding, customer support, AI copilots, and community care.',
        status: 'production',
        category: 'Infrastructure',
        icon: HelpCircle,
        features: [
            'Unified helpdesk for all .ro services',
            'AIDE-powered chatbot trained on all Codai services',
            'AI onboarding wizard for wallets, agents, automations',
            'Live copilot mode with screen-sharing assistance',
            'AI voice support for accessibility (blind/ADHD users)'
        ],
        techStack: ['Next.js', 'AI Chatbots', 'Voice Recognition', 'Screen Sharing'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Ajutor. Instant. Inteligent. (Când nu știi, întreabă-l pe AjutAI.)',
        gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
        accentColor: '#06B6D4'
    },
    {
        id: 'legalizai',
        name: 'LegalizAI',
        domain: 'legalizai.ro',
        description: 'AI for Legal, Compliance, and Trust - Legal guardian for the entire Codai ecosystem',
        fullDescription: 'LegalizAI serves as the legal guardian and compliance agent for the entire Codai platform, providing smart contract legalization, compliance automation, and legal document generation.',
        status: 'production',
        category: 'Infrastructure',
        icon: Gavel,
        features: [
            'Smart contract legalization with human-readable summaries',
            'KYC/AML compliance automation (shared with bancai.ro)',
            'AI-generated contracts, NDAs, service agreements',
            'Romanian legal templates with ANAF compliance',
            'DAO dispute resolution framework tied to kodex.codai.ro'
        ],
        techStack: ['Next.js', 'Legal APIs', 'Smart Contracts', 'Compliance Tools'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Legal, fără avocați. Cu AI. (Automatizează-ți siguranța legală.)',
        gradient: 'from-amber-500 via-yellow-600 to-orange-700',
        accentColor: '#F59E0B'
    },
    {
        id: 'api-codai',
        name: 'API Gateway',
        domain: 'api.codai.ro',
        description: 'Unified API Gateway - Central API hub for all Codai services with AI-generated recipes',
        fullDescription: 'API.codai.ro serves as the central API hub providing access to wallet ops, agent creation & control, trading commands, data analytics, and AI-generated API recipes.',
        status: 'production',
        category: 'Infrastructure',
        icon: Zap,
        features: [
            'API aggregation for all Codai ecosystem apps',
            'Rate limiting & security with AI-powered monitoring',
            'AI-generated API recipes (like Postman + GPT)',
            'Automatic documentation generation',
            'SDK docs, webhooks, and developer tools'
        ],
        techStack: ['API Gateway', 'OpenAPI', 'AI Documentation', 'Rate Limiting'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'All Codai services. One programmable layer.',
        gradient: 'from-purple-500 via-pink-600 to-red-700',
        accentColor: '#A855F7'
    },
    {
        id: 'admin-codai',
        name: 'Admin Panel',
        domain: 'admin.codai.ro',
        description: 'Control Center for Ecosystem Health - AI command deck for monitoring and management',
        fullDescription: 'Admin.codai.ro provides comprehensive monitoring, agent behavior analysis, smart alerts, and centralized management for the entire Codai ecosystem.',
        status: 'production',
        category: 'Infrastructure',
        icon: Settings,
        features: [
            'Real-time system health and performance monitoring',
            'Agent behavior heatmap with AI analysis',
            'Smart alerts for suspicious access and broken flows',
            'License enforcement for agent usage and marketplace items',
            'Cross-app notifications and role management'
        ],
        techStack: ['Next.js', 'Monitoring', 'Analytics', 'Alert Systems'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Your AI command deck.',
        gradient: 'from-slate-500 via-gray-600 to-zinc-700',
        accentColor: '#64748B'
    },
    {
        id: 'docs-codai',
        name: 'Documentation Hub',
        domain: 'docs.codai.ro',
        description: 'Knowledge Base - AI-enhanced documentation platform with automated generation',
        fullDescription: 'Docs.codai.ro provides comprehensive documentation, guides, tutorials, and API references with AI-powered search and automated documentation generation.',
        status: 'production',
        category: 'Infrastructure',
        icon: BookOpen,
        features: [
            'Comprehensive documentation hub for all Codai apps',
            'AI-powered automated documentation generation',
            'Interactive tutorials and code examples',
            'Multi-language support (English and Romanian)',
            'AI-enhanced search with contextual results'
        ],
        techStack: ['Next.js', 'MDX', 'AI Search', 'Documentation APIs'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'high',
        tagline: 'Knowledge at your fingertips. AI-enhanced.',
        gradient: 'from-green-500 via-emerald-600 to-teal-700',
        accentColor: '#22C55E'
    },
    {
        id: 'logai',
        name: 'LogAI',
        domain: 'logai.ro',
        description: 'AI-Powered Identity & Access Management - Universal authentication with smart AI features',
        fullDescription: 'LogAI provides centralized auth & user management for the entire *.codai.ro ecosystem with unified login, identity management, and smart AI features.',
        status: 'production',
        category: 'Infrastructure',
        icon: Lock,
        features: [
            'Universal login for all .codai.ro subdomains',
            'Multi-factor authentication (social, email+code, wallet connect)',
            'Codai ID: smart decentralized identity NFT on CodaiChain',
            'Adaptive login flow optimizing methods per user/device',
            'Behavioral fraud detection with AI anomaly detection'
        ],
        techStack: ['Authentication', 'OAuth', 'Blockchain Identity', 'AI Security'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Un singur cont. Toate AI-urile tale. (Identitate inteligentă. Acces securizat.)',
        gradient: 'from-red-500 via-orange-600 to-yellow-700',
        accentColor: '#EF4444'
    },
    {
        id: 'marketai',
        name: 'MarketAI',
        domain: 'marketai.ro',
        description: 'AI Tools & Agents Marketplace - Buy/sell AI agents, automations, and services',
        fullDescription: 'MarketAI is the Codai ecosystem hub for buying/selling AI agents, automations, workflows, templates, and discovering premium AI functionality.',
        status: 'production',
        category: 'Infrastructure',
        icon: Store,
        features: [
            'Marketplace for Codai agents (trading bots, wallet automations)',
            'Prompt packs, templates, integrations, and workflows',
            'Smart recommendations based on usage across ecosystem',
            'AI price advisor for fair pricing based on quality',
            'Agent sandbox: try before you buy with live simulation'
        ],
        techStack: ['Next.js', 'Marketplace', 'AI Agents', 'Payment Processing'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'high',
        tagline: 'Marketplace-ul inteligenței artificiale – by Codai.',
        gradient: 'from-pink-500 via-rose-600 to-red-700',
        accentColor: '#EC4899'
    },
    {
        id: 'stocai',
        name: 'StocAI',
        domain: 'stocai.ro',
        description: 'AI-Native Storage - Centralized storage layer for files, datasets, and AI knowledge bases',
        fullDescription: 'StocAI serves as the centralized storage layer for files, datasets, vectors, and AI knowledge bases with intelligent management and AI-ready optimization.',
        status: 'production',
        category: 'Infrastructure',
        icon: Database,
        features: [
            'AI dataset hosting (JSON, CSV, image/audio/text) fine-tune ready',
            'Vector storage for embeddings and semantic search',
            'Agent memory: persistent agent conversations and knowledge',
            'Auto-summarization of stored PDFs, docs, audio',
            'RAG-ready knowledge: upload → instantly usable by agents'
        ],
        techStack: ['Storage APIs', 'Vector Database', 'File Processing', 'AI Integration'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Tot ce stochezi, AI-ul înțelege. (Memoria AI-ului tău începe aici.)',
        gradient: 'from-indigo-500 via-blue-600 to-cyan-700',
        accentColor: '#6366F1'
    },
    {
        id: 'analizai',
        name: 'AnalizAI',
        domain: 'analizai.ro',
        description: 'Analytics & Insights - AI analytics layer across the Codai network',
        fullDescription: 'AnalizAI provides the AI analytics layer extracting insights, patterns, anomalies, and predictions from user behavior, financial flows, agent decisions, and business metrics.',
        status: 'production',
        category: 'Infrastructure',
        icon: BarChart3,
        features: [
            'Explainable summaries: "Your top-selling agents last week were..."',
            'Auto-generated reports: weekly/monthly PDF exports',
            'Query-by-language: "Show me all users who activated more than 3 agents"',
            'Anomaly detection: sudden drops in usage with likely causes',
            'Scenario simulation: "If user engagement grows 5%, what\'s expected revenue?"'
        ],
        techStack: ['Analytics', 'AI Insights', 'Data Visualization', 'Report Generation'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'critical',
        tagline: 'Nu doar vezi datele. Le înțelegi. (Analiză inteligentă pentru ecosistemul tău AI.)',
        gradient: 'from-emerald-500 via-green-600 to-teal-700',
        accentColor: '#10B981'
    },
    {
        id: 'metu',
        name: 'METU',
        domain: 'metu.ro',
        description: 'Personal AI Assistant - The AI that helps you manage you',
        fullDescription: 'METU is your personal life assistant helping you organize, reflect, act, and grow. Think: Notion + ChatGPT + Forest + Co-Pilot in one beautiful, animated app.',
        status: 'production',
        category: 'Infrastructure',
        icon: User,
        features: [
            'Smart to-do lists, schedule optimizer, focus sessions',
            'Mood tracking, breathing exercises, gratitude journaling',
            'Daily AI journal, memory highlights, timeline of thoughts',
            'ADHD/Neurodivergent tools: adaptive routines, dopamine-safe reminders',
            'Self-talk agent: conversations with past self, future self, ideal self'
        ],
        techStack: ['Next.js', 'AI Assistant', 'Productivity Tools', 'Mental Health'],
        launchDate: '2024-Q4',
        tier: 3,
        priority: 'high',
        tagline: 'Tu, dar cu AI. (Fii tu, în versiunea care face. Cel mai bun tu, în fiecare zi. Cu AI.)',
        gradient: 'from-pink-500 via-rose-600 to-purple-700',
        accentColor: '#EC4899'
    },

    // ========== TIER 4: SPECIALIZED SERVICES (6 Apps) ==========
    {
        id: 'hub-codai',
        name: 'CODAI Hub',
        domain: 'hub.codai.ro',
        description: 'Integration Hub - Zapier-style connectors for Google Calendar, Notion, WhatsApp, Discord',
        fullDescription: 'Hub.codai.ro provides Zapier-style app connectors with 200+ services, triggers & actions as plug-and-play Codai modules for global integration.',
        status: 'production',
        category: 'Specialized Services',
        icon: Network,
        features: [
            'Universal connectors: 200+ pre-built service integrations',
            'Triggers & actions exposed as plug-and-play Codai modules',
            'Users and devs can build "Connectors" as NFTs or open modules',
            'Visual workflow builder with AI assistance',
            'Real-time sync between services'
        ],
        techStack: ['Integration APIs', 'Workflow Engine', 'AI Automation', 'NFT Connectors'],
        launchDate: '2024-Q4',
        tier: 4,
        priority: 'high',
        tagline: 'Legătura dintre AI-ul tău și restul lumii.',
        gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
        accentColor: '#06B6D4'
    },
    {
        id: 'dash-codai',
        name: 'Visual Dashboards',
        domain: 'dash.codai.ro',
        description: 'Visual Layer - Dashboards, reports, and graphs with prebuilt dashboard kits',
        fullDescription: 'Dash.codai.ro provides prebuilt dashboard kits for wallet insights, market trends, agent performance, learning data, and white-labeled B2B dashboards.',
        status: 'production',
        category: 'Specialized Services',
        icon: Monitor,
        features: [
            'Prebuilt dashboard kits for wallet insights',
            'Market trends and agent performance dashboards',
            'Graph explorer for CodaiChain',
            'White-labeled dashboards for B2B/FabricAI',
            'Visual clarity = trust + insight'
        ],
        techStack: ['Data Visualization', 'Dashboard Builder', 'Graph APIs', 'White-label'],
        launchDate: '2024-Q4',
        tier: 4,
        priority: 'high',
        tagline: 'Datele tale. Vizualizate cu sens.',
        gradient: 'from-blue-500 via-cyan-600 to-teal-700',
        accentColor: '#3B82F6'
    },
    {
        id: 'mod-codai',
        name: 'Module Builder',
        domain: 'mod.codai.ro',
        description: 'Build your AI - Codai module builder and store for developers',
        fullDescription: 'Mod.codai.ro allows developers to create + bundle CodaiChain smart modules: access control, reputation scoring, payment rules, automation templates.',
        status: 'production',
        category: 'Specialized Services',
        icon: Wrench,
        features: [
            'Create + bundle CodaiChain smart modules',
            'Access control and reputation scoring modules',
            'Payment rules and automation templates',
            'Sell on marketai.ro or use in your own apps',
            'Modular, reusable unit system like "npm for agents"'
        ],
        techStack: ['Smart Contracts', 'Module Builder', 'Blockchain', 'Developer Tools'],
        launchDate: '2024-Q4',
        tier: 4,
        priority: 'medium',
        tagline: 'Build your AI. Piece by piece.',
        gradient: 'from-gray-500 via-slate-600 to-zinc-700',
        accentColor: '#6B7280'
    },
    {
        id: 'id-codai',
        name: 'Digital Identity',
        domain: 'id.codai.ro',
        description: 'Unified Digital Identity & Reputation - Codai Identity NFTs and trust scoring',
        fullDescription: 'ID.codai.ro provides Codai Identity NFTs (CodaiID), reputation scoring engine, social links, and is used across marketai.ro, studiai.ro, wallet.bancai.ro, publicai.ro.',
        status: 'production',
        category: 'Specialized Services',
        icon: Fingerprint,
        features: [
            'Codai Identity NFTs (CodaiID) on blockchain',
            'Reputation scoring engine with trust metrics',
            'Social links, certifications, verifications (optional)',
            'Trust glue for agents, users, and open Codai economy',
            'Used across entire ecosystem for identity verification'
        ],
        techStack: ['Blockchain Identity', 'NFTs', 'Reputation System', 'Trust Scoring'],
        launchDate: '2024-Q4',
        tier: 4,
        priority: 'high',
        tagline: 'Cine ești, ce știi, cât ești de de încredere — în blockchain.',
        gradient: 'from-purple-500 via-indigo-600 to-blue-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'jucai',
        name: 'JucAI',
        domain: 'jucai.ro',
        description: 'AI-Native Game Platform - Where living worlds are born, not just played',
        fullDescription: 'JucAI is the AI-native game platform that doesn\'t just compete with Steam but creates entirely new category of living, intelligent game worlds.',
        status: 'development',
        category: 'Specialized Services',
        icon: Gamepad2,
        features: [
            'Zero-code game creation via prompt + voice using AIDE',
            'Agent-store: buy personalities, behavior packs',
            'Auto-rebalancing economies via Kodex rules',
            'Playable AI simulations (Agent War, Build-a-Mind)',
            'Pay-to-train agents (level up intelligence, not stats)'
        ],
        techStack: ['Game Engine', 'AI Agents', 'Blockchain Gaming', 'AI Training'],
        launchDate: '2025-Q3',
        tier: 4,
        priority: 'medium',
        tagline: 'Not just where games are played. Where living worlds are born.',
        gradient: 'from-violet-500 via-purple-600 to-pink-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'tools-codai',
        name: 'AI Tools',
        domain: 'tools.codai.ro',
        description: 'AI Utilities - Collection of standalone AI tools and utilities',
        fullDescription: 'Tools.codai.ro provides a collection of standalone AI utilities and tools that don\'t fit into other categories but provide valuable AI functionality.',
        status: 'development',
        category: 'Specialized Services',
        icon: Hammer,
        features: [
            'Text processing: AI writing, editing, translation tools',
            'Media tools: image, audio, video processing utilities',
            'Data tools: CSV processing, format conversion, analysis',
            'Developer tools: code utilities, API testing, documentation',
            'Productivity tools: calendar management, email tools, automation'
        ],
        techStack: ['AI Processing', 'Media Tools', 'Developer Utilities', 'Productivity'],
        launchDate: '2025-Q2',
        tier: 4,
        priority: 'low',
        tagline: 'AI tools for everything else.',
        gradient: 'from-orange-500 via-amber-600 to-yellow-700',
        accentColor: '#F97316'
    },

    // ========== TIER 5: EMERGING PLATFORMS (15+ Apps) ==========
    {
        id: 'wallet-bancai',
        name: 'Wallet BancAI',
        domain: 'wallet.bancai.ro',
        description: 'The Intelligent Wallet of the Future - Programmable wallet with AI automation',
        fullDescription: 'Wallet BancAI is a unified programmable wallet for both FIAT and crypto, backed by AI agents and smart automations. Think: Revolut + Metamask + Notion AI.',
        status: 'production',
        category: 'Emerging Platforms',
        icon: Wallet,
        features: [
            'Multi-currency balance (RON, EUR, USD + ETH, BTC, SOL, etc.)',
            'AI budgeting, savings, and spending suggestions',
            'Custom automations: "When salary comes in, convert 10% to BTC"',
            'QR payments, IBAN management, card issuing via Stripe',
            'Agent-controlled spending categories with offline-first capabilities'
        ],
        techStack: ['Blockchain', 'Banking APIs', 'AI Automation', 'Multi-currency'],
        launchDate: '2024-Q4',
        tier: 5,
        priority: 'critical',
        tagline: 'Send. Spend. Save. In any currency, powered by AI.',
        gradient: 'from-yellow-500 via-amber-600 to-orange-700',
        accentColor: '#F59E0B'
    },
    {
        id: 'x-codai',
        name: 'X.CodAI Trading',
        domain: 'x.codai.ro',
        description: 'AI-Powered Trading & Exchange - Trade anything with AI agents',
        fullDescription: 'X.codai.ro is an advanced trading station across FIAT, crypto, stocks, forex, commodities with AI automation, real-time market analysis, and DeFi protocol integration.',
        status: 'production',
        category: 'Emerging Platforms',
        icon: TrendingUp,
        features: [
            'Unified trading interface: spot, margin, futures (Binance, Coinbase, eToro)',
            'AI signal engine: pattern detection, news sentiment, algorithmic triggers',
            'Auto-trader with rule-based + GPT strategies',
            'Social trading layer (copy traders, leaderboards)',
            'Fiat–crypto–asset conversion funnel plugged into wallet.bancai.ro'
        ],
        techStack: ['Trading APIs', 'AI Algorithms', 'DeFi Protocols', 'Market Data'],
        launchDate: '2024-Q4',
        tier: 5,
        priority: 'critical',
        tagline: 'Trade anything. Let your agent do the work.',
        gradient: 'from-blue-500 via-indigo-600 to-purple-700',
        accentColor: '#3B82F6'
    },
    {
        id: 'explorai',
        name: 'ExplorAI',
        domain: 'explorai.ro',
        description: 'AI-Native Blockchain Explorer - Explore the CodaiChain with AI explanations',
        fullDescription: 'ExplorAI (explorer.codai.ro) is the dedicated blockchain explorer for CodaiChain, making on-chain data readable and actionable using Codai\'s AI layer.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Eye,
        features: [
            'AI summary of transactions: explain what happened in plain language',
            'Smart wallet views: personalized transaction history breakdown',
            'Agent audit trails: every AI decision is traceable',
            'CodaiChain modules overview: live metrics and usage',
            'Search by question: "Who made the most trades on Monday?"'
        ],
        techStack: ['Blockchain Explorer', 'AI Explanations', 'Data Analysis', 'Search'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'Explore the CodaiChain. Understand every transaction.',
        gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
        accentColor: '#10B981'
    },
    {
        id: 'kodex-codai',
        name: 'Kodex Core Protocol',
        domain: 'kodex.codai.ro',
        description: 'CodaiChain Core Protocol & AI Economic Layer - The Kodex is law for agents and money',
        fullDescription: 'Kodex.codai.ro is the canonical interface for CodaiChain protocol, KODEX smart contract system, and rules governing programmable money and AI automation.',
        status: 'production',
        category: 'Emerging Platforms',
        icon: Code,
        features: [
            'KODEX Protocol: base layer of programmable rules for AI-agent financial ops',
            'KODEX Agent Framework: agents registered on-chain with public logic',
            'KODEX Reputation Layer: on-chain public trust model',
            'KODEX SDK: dev tools to integrate programmable wallet logic',
            'KODEX Governance: upgrade proposals, feature activation, compliance rules'
        ],
        techStack: ['Blockchain Protocol', 'Smart Contracts', 'AI Economics', 'DAO Governance'],
        launchDate: '2024-Q4',
        tier: 5,
        priority: 'critical',
        tagline: 'The Kodex is law. For agents, money, and reputation.',
        gradient: 'from-gray-600 via-slate-700 to-zinc-800',
        accentColor: '#6B7280'
    },
    {
        id: 'acasai',
        name: 'AcasAI',
        domain: 'acasai.ro',
        description: 'AI Home & Living - Smart home automation and residential services',
        fullDescription: 'AcasAI provides AI-powered home automation, smart living solutions, and residential service marketplace with intelligent home control.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Home,
        features: [
            'Smart home control: IoT device management and automation',
            'Energy optimization: AI-powered energy efficiency',
            'Security systems: intelligent home security and monitoring',
            'Service marketplace: cleaning, maintenance, repair service booking',
            'Quality assurance: service quality monitoring and insurance'
        ],
        techStack: ['IoT Integration', 'Smart Home', 'Service Marketplace', 'AI Automation'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'Casa inteligentă. Viața simplificată.',
        gradient: 'from-green-500 via-emerald-600 to-teal-700',
        accentColor: '#10B981'
    },
    {
        id: 'aide-codai',
        name: 'AIDE Environment',
        domain: 'aide.codai.ro',
        description: 'AI Development Environment - The ultimate AI coding companion',
        fullDescription: 'AIDE.codai.ro is the advanced AI development environment with intelligent code assistance, project management, and collaborative development tools.',
        status: 'production',
        category: 'Emerging Platforms',
        icon: Code,
        features: [
            'AI code assistant: context-aware code generation and completion',
            'Project templates: quick project scaffolding and setup',
            'Collaboration tools: real-time collaborative coding',
            'Natural language coding: describe features, get implementations',
            'Performance optimization: AI-suggested improvements'
        ],
        techStack: ['AI Code Generation', 'Collaborative Development', 'Project Management'],
        launchDate: '2024-Q4',
        tier: 5,
        priority: 'high',
        tagline: 'The ultimate AI coding companion.',
        gradient: 'from-purple-500 via-violet-600 to-indigo-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'conversai',
        name: 'ConversAI',
        domain: 'conversai.ro',
        description: 'AI Conversation Platform - Conversations that matter, powered by AI',
        fullDescription: 'ConversAI provides advanced conversational AI platform for customer service, content creation, and intelligent dialogue systems.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: MessageSquare,
        features: [
            'Multi-modal chat: text, voice, video conversations',
            'Context awareness: long-term conversation memory',
            'Personality customization: configurable AI personalities',
            'Business applications: customer service, sales assistance',
            'Training simulations: role-playing and skill development'
        ],
        techStack: ['Conversational AI', 'Multi-modal', 'Context Management', 'Business Integration'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'Conversations that matter. Powered by AI.',
        gradient: 'from-blue-500 via-cyan-600 to-teal-700',
        accentColor: '#3B82F6'
    },
    {
        id: 'curtai',
        name: 'CurtAI',
        domain: 'curtai.ro',
        description: 'AI Soulmate Discovery - Find your AI-matched soulmate',
        fullDescription: 'CurtAI is an AI-powered relationship matching platform that goes beyond traditional dating to find genuine compatibility and meaningful connections.',
        status: 'planned',
        category: 'Emerging Platforms',
        icon: Heart,
        features: [
            'Deep compatibility analysis: psychological and behavioral matching',
            'AI conversation starters: intelligent icebreakers and topics',
            'Relationship coaching: AI guidance for healthy relationships',
            'Video dating: AI-enhanced video matching and calls',
            'Safety features: AI-powered safety monitoring and verification'
        ],
        techStack: ['AI Matching', 'Video Chat', 'Psychology AI', 'Safety Monitoring'],
        launchDate: '2025-Q3',
        tier: 5,
        priority: 'low',
        tagline: 'Find your AI-matched soulmate.',
        gradient: 'from-pink-500 via-rose-600 to-red-700',
        accentColor: '#EC4899'
    },
    {
        id: 'dexai',
        name: 'DexAI',
        domain: 'dexai.ro',
        description: 'Decentralized Exchange AI - AI-powered DeFi trading intelligence',
        fullDescription: 'DexAI provides AI-powered decentralized exchange with intelligent trading, liquidity optimization, and DeFi automation (work in progress).',
        status: 'planned',
        category: 'Emerging Platforms',
        icon: TrendingDown,
        features: [
            'Automated market making: AI-optimized liquidity provision',
            'Smart trading: intelligent trade execution and optimization',
            'Yield farming: AI-managed yield optimization strategies',
            'MEV protection: maximal extractable value mitigation',
            'Cross-chain integration: multi-blockchain trading support'
        ],
        techStack: ['DeFi Protocols', 'AI Trading', 'Cross-chain', 'MEV Protection'],
        launchDate: '2025-Q4',
        tier: 5,
        priority: 'low',
        tagline: 'Work in Progress - Decentralized Trading Intelligence',
        gradient: 'from-purple-500 via-indigo-600 to-blue-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'donai',
        name: 'DonAI',
        domain: 'donai.ro',
        description: 'AI Charity & Donation Platform - Give smart, impact amplified',
        fullDescription: 'DonAI is an AI-powered donation platform that maximizes charitable impact through intelligent giving, transparency, and outcome tracking.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Gift,
        features: [
            'Impact optimization: AI-suggested donation allocation for maximum impact',
            'Charity verification: AI-powered charity assessment and verification',
            'Outcome tracking: real-time impact measurement and reporting',
            'Blockchain tracking: transparent donation flow tracking',
            'Tax optimization: AI-optimized tax-deductible giving strategies'
        ],
        techStack: ['Charity APIs', 'Blockchain Tracking', 'Impact Analytics', 'Tax Optimization'],
        launchDate: '2025-Q3',
        tier: 5,
        priority: 'medium',
        tagline: 'Give smart. Impact amplified.',
        gradient: 'from-pink-500 via-rose-600 to-red-700',
        accentColor: '#EC4899'
    },
    {
        id: 'glass-codai',
        name: 'Glass Control',
        domain: 'glass.codai.ro',
        description: 'Window Control & Automation - See through, control everything',
        fullDescription: 'Glass.codai.ro provides advanced window management and desktop automation platform with AI-powered productivity optimization.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Eye,
        features: [
            'Intelligent layouts: AI-optimized window arrangement',
            'Workspace management: multi-desktop organization',
            'App integration: deep application control and automation',
            'Gesture control: custom gesture-based automation',
            'Context switching: intelligent workspace transitions'
        ],
        techStack: ['Desktop Automation', 'AI Optimization', 'Gesture Control', 'Productivity'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'See through. Control everything.',
        gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
        accentColor: '#06B6D4'
    },
    {
        id: 'mobile-codai',
        name: 'Mobile Platform',
        domain: 'mobile.codai.ro',
        description: 'Mobile Experience Platform - Codai in your pocket',
        fullDescription: 'Mobile.codai.ro provides mobile-first experience platform with optimized access to the entire Codai ecosystem on mobile devices.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Smartphone,
        features: [
            'Progressive Web App: fast, native-like mobile experience',
            'Offline capabilities: offline functionality with sync',
            'Push notifications: intelligent notification system',
            'Context awareness: location and activity-based suggestions',
            'Voice interface: mobile-optimized voice interactions'
        ],
        techStack: ['PWA', 'Mobile Optimization', 'Offline Sync', 'Push Notifications'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'high',
        tagline: 'Codai in your pocket.',
        gradient: 'from-blue-500 via-indigo-600 to-purple-700',
        accentColor: '#3B82F6'
    },
    {
        id: 'muzicai',
        name: 'MuzicAI',
        domain: 'muzicai.ro',
        description: 'AI Music Platform - Music that moves, AI that understands',
        fullDescription: 'MuzicAI is an AI-powered music creation, discovery, and experience platform that revolutionizes how we interact with music.',
        status: 'planned',
        category: 'Emerging Platforms',
        icon: Music,
        features: [
            'AI composition: intelligent music generation and arrangement',
            'Collaborative creation: multi-user music collaboration',
            'Style transfer: convert music between genres and styles',
            'Mood-based playlists: AI curated music for any mood',
            'Rights management: blockchain-based music rights tracking'
        ],
        techStack: ['AI Music Generation', 'Blockchain Rights', 'Collaborative Tools', 'Streaming'],
        launchDate: '2025-Q4',
        tier: 5,
        priority: 'low',
        tagline: 'Music that moves. AI that understands.',
        gradient: 'from-violet-500 via-purple-600 to-indigo-700',
        accentColor: '#8B5CF6'
    },
    {
        id: 'prezentai',
        name: 'PrezentAI',
        domain: 'prezentai.ro',
        description: 'AI Presentation Platform - Presentations that persuade, AI that inspires',
        fullDescription: 'PrezentAI is an AI-powered presentation creation platform that generates compelling presentations from simple prompts and optimizes for maximum impact.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Presentation,
        features: [
            'AI content generation: create presentations from simple text prompts',
            'Smart templates: AI-selected templates based on content and audience',
            'Visual enhancement: automatic image selection and graphic generation',
            'Real-time collaboration: team-based presentation development',
            'Presentation coach: AI feedback for presentation improvement'
        ],
        techStack: ['AI Content Generation', 'Template Engine', 'Collaboration Tools', 'Analytics'],
        launchDate: '2025-Q3',
        tier: 5,
        priority: 'medium',
        tagline: 'Presentations that persuade. AI that inspires.',
        gradient: 'from-rose-500 via-pink-600 to-purple-700',
        accentColor: '#F43F5E'
    },
    {
        id: 'romai',
        name: 'RomAI',
        domain: 'romai.ro',
        description: 'Romanian AI Culture Platform - AI românesc pentru România',
        fullDescription: 'RomAI is a Romanian-first AI platform celebrating and preserving Romanian culture, language, and heritage through advanced AI technologies.',
        status: 'production',
        category: 'Emerging Platforms',
        icon: Flag,
        features: [
            'Advanced Romanian language AI: superior Romanian language processing',
            'Cultural content: AI-curated Romanian cultural content',
            'Heritage preservation: digital preservation of Romanian traditions',
            'Legal compliance: Romanian law and regulation integration',
            'Community building: Romanian diaspora connection platform'
        ],
        techStack: ['Romanian NLP', 'Cultural AI', 'Heritage Systems', 'Community Platform'],
        launchDate: '2024-Q4',
        tier: 5,
        priority: 'high',
        tagline: 'AI românesc. Pentru România.',
        gradient: 'from-yellow-500 via-orange-600 to-red-700',
        accentColor: '#F59E0B'
    },
    {
        id: 'sunai',
        name: 'SunAI',
        domain: 'sunai.ro',
        description: 'Solar Energy Optimization - Energia soarelui optimizată cu AI',
        fullDescription: 'SunAI provides AI-powered solar energy optimization platform for residential and commercial solar installations with intelligent energy management.',
        status: 'planned',
        category: 'Emerging Platforms',
        icon: Sun,
        features: [
            'Installation planning: AI-optimized solar panel placement and sizing',
            'Energy prediction: weather-based energy generation forecasting',
            'Performance monitoring: real-time solar system performance analysis',
            'Smart grid integration: intelligent grid interaction and energy trading',
            'Carbon tracking: carbon footprint reduction measurement'
        ],
        techStack: ['Solar Analytics', 'IoT Sensors', 'Energy Management', 'Grid Integration'],
        launchDate: '2025-Q4',
        tier: 5,
        priority: 'low',
        tagline: 'Energia soarelui. Optimizată cu AI.',
        gradient: 'from-yellow-400 via-orange-500 to-red-600',
        accentColor: '#F59E0B'
    },
    {
        id: 'talentai',
        name: 'TalentAI',
        domain: 'talentai.ro',
        description: 'AI Talent Acquisition - Find talent, AI finds the best',
        fullDescription: 'TalentAI is an AI-powered talent acquisition and human resources platform that revolutionizes hiring through intelligent candidate matching.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: UserCheck,
        features: [
            'AI candidate matching: intelligent skill and culture fit assessment',
            'Resume analysis: AI-powered resume screening and ranking',
            'Interview automation: AI-conducted initial screening interviews',
            'Bias reduction: AI algorithms designed to reduce hiring bias',
            'Performance prediction: AI-powered job performance forecasting'
        ],
        techStack: ['AI Matching', 'Resume Analysis', 'Interview AI', 'Bias Reduction'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'Find talent. AI finds the best.',
        gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
        accentColor: '#06B6D4'
    },
    {
        id: 'metu-web-codai',
        name: 'METU Web',
        domain: 'metu-web.codai.ro',
        description: 'METU Web Interface - METU Voice AI now on the web',
        fullDescription: 'METU-web.codai.ro provides web-based interface for the METU voice AI assistant with browser-based access to personal AI assistance.',
        status: 'development',
        category: 'Emerging Platforms',
        icon: Globe,
        features: [
            'Voice interface: browser-based voice interaction',
            'Cross-device sync: seamless synchronization with mobile METU',
            'Web integration: browser extension and web app integration',
            'Browser integration: Chrome, Firefox, Safari extensions',
            'Productivity integration: calendar, email, and task integration'
        ],
        techStack: ['Web Voice AI', 'Browser Extensions', 'Cross-device Sync', 'PWA'],
        launchDate: '2025-Q2',
        tier: 5,
        priority: 'medium',
        tagline: 'METU Voice AI. Now on the web.',
        gradient: 'from-teal-500 via-cyan-600 to-blue-700',
        accentColor: '#14B8A6'
    }
];

export const getProjectsByCategory = (category: string): Project[] => {
    return codaiProjects.filter(project => project.category === category);
};

export const getProjectsByTier = (tier: number): Project[] => {
    return codaiProjects.filter(project => project.tier === tier);
};

export const getProjectsByStatus = (status: string): Project[] => {
    return codaiProjects.filter(project => project.status === status);
};

export const searchProjects = (query: string): Project[] => {
    const lowercaseQuery = query.toLowerCase();
    return codaiProjects.filter(project =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.domain.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery) ||
        project.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
    );
};

export const getTotalProjectStats = () => {
    const stats = {
        total: codaiProjects.length,
        production: codaiProjects.filter(p => p.status === 'production').length,
        development: codaiProjects.filter(p => p.status === 'development').length,
        beta: codaiProjects.filter(p => p.status === 'beta').length,
        planned: codaiProjects.filter(p => p.status === 'planned').length,
        tiers: 5,
        categories: projectCategories.length
    };
    return stats;
};