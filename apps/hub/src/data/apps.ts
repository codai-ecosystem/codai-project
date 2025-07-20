export interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'production' | 'beta' | 'development' | 'planned';
  port: number;
  url: string;
  color: string;
  features: string[];
  tier: 1 | 2 | 3 | 4 | 5;
  businessPriority: 'critical' | 'high' | 'medium' | 'low';
  implementationDays: number;
}

export const CODAI_APPS: AppInfo[] = [
  // Tier 1: Financial & Business Apps
  {
    id: 'bancai',
    name: 'BANCAI',
    description: 'AI-powered banking platform with complete financial services',
    icon: 'Banknote',
    category: 'Financial',
    status: 'production',
    port: 3522,
    url: 'http://localhost:3522',
    color: 'from-green-500 to-emerald-600',
    features: ['Account Management', 'Transactions', 'Payments', 'Analytics', 'Security'],
    tier: 1,
    businessPriority: 'critical',
    implementationDays: 7
  },
  {
    id: 'stocai',
    name: 'STOCAI',
    description: 'Real-time stock trading platform with AI analytics',
    icon: 'TrendingUp',
    category: 'Financial',
    status: 'development',
    port: 3523,
    url: 'http://localhost:3523',
    color: 'from-blue-500 to-indigo-600',
    features: ['Real-time Trading', 'Portfolio Management', 'Market Analysis', 'Risk Assessment'],
    tier: 1,
    businessPriority: 'high',
    implementationDays: 12
  },
  {
    id: 'wallet',
    name: 'WALLET',
    description: 'Secure cryptocurrency wallet with DeFi integration',
    icon: 'Wallet',
    category: 'Financial',
    status: 'planned',
    port: 3524,
    url: 'http://localhost:3524',
    color: 'from-purple-500 to-violet-600',
    features: ['Multi-currency', 'DeFi Integration', 'Security', 'Transaction History'],
    tier: 1,
    businessPriority: 'high',
    implementationDays: 10
  },
  {
    id: 'marketai',
    name: 'MARKETAI',
    description: 'Advanced financial market analysis and predictions',
    icon: 'BarChart3',
    category: 'Financial',
    status: 'planned',
    port: 3525,
    url: 'http://localhost:3525',
    color: 'from-orange-500 to-red-600',
    features: ['Market Analysis', 'AI Predictions', 'Risk Modeling', 'Portfolio Optimization'],
    tier: 1,
    businessPriority: 'high',
    implementationDays: 14
  },
  {
    id: 'cumparai',
    name: 'CUMPARAI',
    description: 'Multi-vendor marketplace with AI-powered matching',
    icon: 'ShoppingCart',
    category: 'E-commerce',
    status: 'planned',
    port: 3526,
    url: 'http://localhost:3526',
    color: 'from-pink-500 to-rose-600',
    features: ['Vendor Management', 'Product Catalog', 'AI Matching', 'Secure Payments'],
    tier: 1,
    businessPriority: 'medium',
    implementationDays: 9
  },
  {
    id: 'curtai',
    name: 'CURTAI',
    description: 'E-commerce platform with intelligent product recommendations',
    icon: 'Store',
    category: 'E-commerce',
    status: 'planned',
    port: 3527,
    url: 'http://localhost:3527',
    color: 'from-teal-500 to-cyan-600',
    features: ['Product Catalog', 'AI Recommendations', 'Inventory Management', 'Analytics'],
    tier: 1,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'donai',
    name: 'DONAI',
    description: 'Charitable giving and fundraising platform',
    icon: 'Heart',
    category: 'Social Impact',
    status: 'planned',
    port: 3528,
    url: 'http://localhost:3528',
    color: 'from-red-500 to-pink-600',
    features: ['Campaign Management', 'Donor Tracking', 'Impact Reporting', 'Social Sharing'],
    tier: 1,
    businessPriority: 'medium',
    implementationDays: 7
  },
  {
    id: 'adoptai',
    name: 'ADOPTAI',
    description: 'Pet adoption and animal welfare platform',
    icon: 'Heart',
    category: 'Social Impact',
    status: 'planned',
    port: 3529,
    url: 'http://localhost:3529',
    color: 'from-amber-500 to-orange-600',
    features: ['Pet Profiles', 'Adoption Matching', 'Care Resources', 'Community'],
    tier: 1,
    businessPriority: 'low',
    implementationDays: 6
  },

  // Tier 2: Core Platform Apps
  {
    id: 'codai',
    name: 'CODAI',
    description: 'AI-powered development platform and project management',
    icon: 'Code',
    category: 'Development',
    status: 'development',
    port: 3000,
    url: 'http://localhost:3000',
    color: 'from-slate-500 to-gray-600',
    features: ['Code Generation', 'Project Management', 'AI Assistance', 'Team Collaboration'],
    tier: 2,
    businessPriority: 'critical',
    implementationDays: 14
  },
  {
    id: 'memorai',
    name: 'MEMORAI',
    description: 'Advanced memory management and knowledge system',
    icon: 'Brain',
    category: 'AI & Knowledge',
    status: 'beta',
    port: 3693,
    url: 'http://localhost:3693',
    color: 'from-violet-500 to-purple-600',
    features: ['Knowledge Management', 'AI Memory', 'Search & Discovery', 'Context Awareness'],
    tier: 2,
    businessPriority: 'critical',
    implementationDays: 3
  },
  {
    id: 'hub',
    name: 'HUB',
    description: 'Central ecosystem navigation and app discovery',
    icon: 'Network',
    category: 'Platform',
    status: 'development',
    port: 4700,
    url: 'http://localhost:4700',
    color: 'from-purple-500 to-blue-600',
    features: ['App Discovery', 'Universal Search', 'Navigation', 'Integration Center'],
    tier: 2,
    businessPriority: 'critical',
    implementationDays: 10
  },
  {
    id: 'admin',
    name: 'ADMIN',
    description: 'Administrative tools and user management system',
    icon: 'Settings',
    category: 'Management',
    status: 'development',
    port: 3001,
    url: 'http://localhost:3001',
    color: 'from-gray-500 to-slate-600',
    features: ['User Management', 'System Config', 'Analytics', 'Security Controls'],
    tier: 2,
    businessPriority: 'high',
    implementationDays: 8
  },
  {
    id: 'gateway',
    name: 'GATEWAY',
    description: 'API gateway and service orchestration',
    icon: 'Globe',
    category: 'Infrastructure',
    status: 'planned',
    port: 8000,
    url: 'http://localhost:8000',
    color: 'from-emerald-500 to-teal-600',
    features: ['API Management', 'Service Discovery', 'Load Balancing', 'Security'],
    tier: 2,
    businessPriority: 'high',
    implementationDays: 12
  },

  // Tier 3: Communication & Social Apps
  {
    id: 'conversai',
    name: 'CONVERSAI',
    description: 'Professional email platform with AI enhancements',
    icon: 'Mail',
    category: 'Communication',
    status: 'development',
    port: 3002,
    url: 'http://localhost:3002',
    color: 'from-blue-500 to-cyan-600',
    features: ['AI Email', 'Smart Compose', 'Contact Management', 'Templates'],
    tier: 3,
    businessPriority: 'high',
    implementationDays: 12
  },
  {
    id: 'sociai',
    name: 'SOCIAI',
    description: 'Social media platform with AI content optimization',
    icon: 'Users',
    category: 'Social',
    status: 'planned',
    port: 3003,
    url: 'http://localhost:3003',
    color: 'from-pink-500 to-purple-600',
    features: ['Social Feed', 'Content Creation', 'Community Building', 'Analytics'],
    tier: 3,
    businessPriority: 'medium',
    implementationDays: 14
  },
  {
    id: 'aide',
    name: 'AIDE',
    description: 'AI assistant and help desk system',
    icon: 'Bot',
    category: 'Support',
    status: 'planned',
    port: 3004,
    url: 'http://localhost:3004',
    color: 'from-green-500 to-blue-600',
    features: ['AI Assistant', 'Help Desk', 'Knowledge Base', 'Automation'],
    tier: 3,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'acasai',
    name: 'ACASAI',
    description: 'Home automation and IoT control platform',
    icon: 'Home',
    category: 'IoT',
    status: 'planned',
    port: 3005,
    url: 'http://localhost:3005',
    color: 'from-yellow-500 to-orange-600',
    features: ['Home Automation', 'IoT Control', 'Energy Management', 'Security'],
    tier: 3,
    businessPriority: 'low',
    implementationDays: 12
  },
  {
    id: 'ajutai',
    name: 'AJUTAI',
    description: 'Help desk and customer support system',
    icon: 'HelpCircle',
    category: 'Support',
    status: 'planned',
    port: 3006,
    url: 'http://localhost:3006',
    color: 'from-indigo-500 to-blue-600',
    features: ['Ticket Management', 'Knowledge Base', 'Live Chat', 'Analytics'],
    tier: 3,
    businessPriority: 'medium',
    implementationDays: 8
  },
  {
    id: 'glass',
    name: 'GLASS',
    description: 'UI framework and design system',
    icon: 'Palette',
    category: 'Design',
    status: 'planned',
    port: 3007,
    url: 'http://localhost:3007',
    color: 'from-purple-500 to-pink-600',
    features: ['Design System', 'Component Library', 'Theme Manager', 'Style Guide'],
    tier: 3,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'explorer',
    name: 'EXPLORER',
    description: 'File management and organization system',
    icon: 'FolderOpen',
    category: 'Productivity',
    status: 'planned',
    port: 3008,
    url: 'http://localhost:3008',
    color: 'from-teal-500 to-green-600',
    features: ['File Management', 'Cloud Storage', 'Search', 'Collaboration'],
    tier: 3,
    businessPriority: 'low',
    implementationDays: 7
  },
  {
    id: 'tools',
    name: 'TOOLS',
    description: 'Utility applications and productivity tools',
    icon: 'Wrench',
    category: 'Utilities',
    status: 'planned',
    port: 3009,
    url: 'http://localhost:3009',
    color: 'from-gray-500 to-blue-600',
    features: ['Productivity Tools', 'Utilities', 'Calculators', 'Converters'],
    tier: 3,
    businessPriority: 'low',
    implementationDays: 5
  },

  // Tier 4: Professional Services Apps
  {
    id: 'legalizai',
    name: 'LEGALIZAI',
    description: 'Legal services and document management platform',
    icon: 'Scale',
    category: 'Legal',
    status: 'planned',
    port: 3010,
    url: 'http://localhost:3010',
    color: 'from-blue-500 to-indigo-600',
    features: ['Legal Documents', 'Case Management', 'Compliance', 'Contract Analysis'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 14
  },
  {
    id: 'talentai',
    name: 'TALENTAI',
    description: 'HR and talent management system',
    icon: 'Users',
    category: 'HR',
    status: 'planned',
    port: 3011,
    url: 'http://localhost:3011',
    color: 'from-green-500 to-teal-600',
    features: ['Recruitment', 'Performance Management', 'Skill Assessment', 'Team Analytics'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 12
  },
  {
    id: 'prezentai',
    name: 'PREZENTAI',
    description: 'AI-powered presentation creation platform',
    icon: 'Presentation',
    category: 'Productivity',
    status: 'planned',
    port: 3012,
    url: 'http://localhost:3012',
    color: 'from-orange-500 to-red-600',
    features: ['Slide Creation', 'AI Templates', 'Collaboration', 'Export Options'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'analizai',
    name: 'ANALIZAI',
    description: 'Business intelligence and analytics platform',
    icon: 'BarChart3',
    category: 'Analytics',
    status: 'planned',
    port: 3013,
    url: 'http://localhost:3013',
    color: 'from-purple-500 to-blue-600',
    features: ['Data Visualization', 'Real-time Analytics', 'Custom Reports', 'AI Insights'],
    tier: 4,
    businessPriority: 'high',
    implementationDays: 16
  },
  {
    id: 'publicai',
    name: 'PUBLICAI',
    description: 'Content publishing and management platform',
    icon: 'FileText',
    category: 'Content',
    status: 'planned',
    port: 3014,
    url: 'http://localhost:3014',
    color: 'from-teal-500 to-blue-600',
    features: ['Content Creation', 'Publishing Workflow', 'Multi-channel Distribution', 'Analytics'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 12
  },
  {
    id: 'promovai',
    name: 'PROMOVAI',
    description: 'Marketing automation and campaign management',
    icon: 'Megaphone',
    category: 'Marketing',
    status: 'planned',
    port: 3015,
    url: 'http://localhost:3015',
    color: 'from-pink-500 to-purple-600',
    features: ['Campaign Management', 'Marketing Automation', 'A/B Testing', 'Customer Segmentation'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 14
  },
  {
    id: 'logai',
    name: 'LOGAI',
    description: 'Supply chain and logistics management',
    icon: 'Truck',
    category: 'Logistics',
    status: 'planned',
    port: 3016,
    url: 'http://localhost:3016',
    color: 'from-yellow-500 to-orange-600',
    features: ['Shipment Tracking', 'Route Optimization', 'Inventory Management', 'Cost Analysis'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 16
  },
  {
    id: 'fabricai',
    name: 'FABRICAI',
    description: 'Manufacturing and IoT platform',
    icon: 'Factory',
    category: 'Manufacturing',
    status: 'planned',
    port: 3017,
    url: 'http://localhost:3017',
    color: 'from-gray-500 to-slate-600',
    features: ['Production Monitoring', 'Quality Control', 'IoT Integration', 'Analytics'],
    tier: 4,
    businessPriority: 'low',
    implementationDays: 18
  },
  {
    id: 'sunai',
    name: 'SUNAI',
    description: 'Solar energy management platform',
    icon: 'Sun',
    category: 'Energy',
    status: 'planned',
    port: 3018,
    url: 'http://localhost:3018',
    color: 'from-yellow-500 to-amber-600',
    features: ['Solar Monitoring', 'Energy Analytics', 'Grid Integration', 'ROI Tracking'],
    tier: 4,
    businessPriority: 'low',
    implementationDays: 14
  },
  {
    id: 'metu',
    name: 'METU',
    description: 'Personal AI assistant and productivity platform',
    icon: 'User',
    category: 'Productivity',
    status: 'planned',
    port: 3019,
    url: 'http://localhost:3019',
    color: 'from-indigo-500 to-purple-600',
    features: ['Personal Assistant', 'Task Management', 'Schedule Optimization', 'AI Insights'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'dash',
    name: 'DASH',
    description: 'Dashboard and visualization system',
    icon: 'LayoutDashboard',
    category: 'Analytics',
    status: 'planned',
    port: 3020,
    url: 'http://localhost:3020',
    color: 'from-blue-500 to-teal-600',
    features: ['Custom Dashboards', 'Data Visualization', 'Real-time Updates', 'Widget Library'],
    tier: 4,
    businessPriority: 'high',
    implementationDays: 8
  },
  {
    id: 'mod',
    name: 'MOD',
    description: 'Content moderation and safety tools',
    icon: 'Shield',
    category: 'Security',
    status: 'planned',
    port: 3021,
    url: 'http://localhost:3021',
    color: 'from-red-500 to-orange-600',
    features: ['Content Moderation', 'AI Safety', 'Reporting Tools', 'Policy Management'],
    tier: 4,
    businessPriority: 'medium',
    implementationDays: 10
  },

  // Tier 5: Creative & Educational Apps  
  {
    id: 'studiai',
    name: 'STUDIAI',
    description: 'Educational platform with AI tutoring (Reference Standard)',
    icon: 'GraduationCap',
    category: 'Education',
    status: 'production',
    port: 3100,
    url: 'http://localhost:3100',
    color: 'from-emerald-500 to-green-600',
    features: ['AI Tutoring', 'Course Management', 'Progress Tracking', 'Interactive Learning'],
    tier: 5,
    businessPriority: 'critical',
    implementationDays: 0
  },
  {
    id: 'muzicai',
    name: 'MUZICAI',
    description: 'Music creation and composition platform',
    icon: 'Music',
    category: 'Creative',
    status: 'planned',
    port: 3101,
    url: 'http://localhost:3101',
    color: 'from-purple-500 to-pink-600',
    features: ['AI Composition', 'Audio Processing', 'Collaboration', 'Streaming'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 16
  },
  {
    id: 'jucai',
    name: 'JUCAI',
    description: 'Gaming platform and development tools',
    icon: 'Gamepad2',
    category: 'Gaming',
    status: 'planned',
    port: 3102,
    url: 'http://localhost:3102',
    color: 'from-red-500 to-pink-600',
    features: ['Game Development', 'Player Management', 'Leaderboards', 'Analytics'],
    tier: 5,
    businessPriority: 'low',
    implementationDays: 18
  },
  {
    id: 'kodex',
    name: 'KODEX',
    description: 'Advanced code editor and development environment',
    icon: 'Code2',
    category: 'Development',
    status: 'planned',
    port: 3103,
    url: 'http://localhost:3103',
    color: 'from-slate-500 to-blue-600',
    features: ['Code Editor', 'Syntax Highlighting', 'Git Integration', 'Extensions'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 14
  },
  {
    id: 'docs',
    name: 'DOCS',
    description: 'Documentation and knowledge base system',
    icon: 'Book',
    category: 'Documentation',
    status: 'planned',
    port: 3104,
    url: 'http://localhost:3104',
    color: 'from-blue-500 to-cyan-600',
    features: ['Documentation', 'Knowledge Base', 'Search', 'Version Control'],
    tier: 5,
    businessPriority: 'high',
    implementationDays: 8
  },
  {
    id: 'x',
    name: 'X',
    description: 'Experimental features and innovation lab',
    icon: 'Zap',
    category: 'Experimental',
    status: 'planned',
    port: 3105,
    url: 'http://localhost:3105',
    color: 'from-yellow-500 to-red-600',
    features: ['Experimental Features', 'Innovation Lab', 'Prototyping', 'Research'],
    tier: 5,
    businessPriority: 'low',
    implementationDays: 10
  },
  {
    id: 'romai',
    name: 'ROMAI',
    description: 'Romanian AI assistant with cultural context',
    icon: 'Globe',
    category: 'AI Assistant',
    status: 'planned',
    port: 3106,
    url: 'http://localhost:3106',
    color: 'from-blue-500 to-purple-600',
    features: ['Romanian Language', 'Cultural Context', 'Local Services', 'Translation'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 12
  },
  {
    id: 'dexai',
    name: 'DEXAI',
    description: 'Decentralized exchange trading platform',
    icon: 'Coins',
    category: 'Crypto',
    status: 'planned',
    port: 3107,
    url: 'http://localhost:3107',
    color: 'from-green-500 to-blue-600',
    features: ['DEX Trading', 'Liquidity Pools', 'Yield Farming', 'Portfolio Management'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 14
  },
  {
    id: 'bancai-mobile',
    name: 'BANCAI Mobile',
    description: 'Mobile banking application',
    icon: 'Smartphone',
    category: 'Mobile',
    status: 'planned',
    port: 3108,
    url: 'http://localhost:3108',
    color: 'from-green-500 to-teal-600',
    features: ['Mobile Banking', 'Touch ID', 'Mobile Payments', 'Notifications'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 10
  },
  {
    id: 'codai-mobile',
    name: 'CODAI Mobile',
    description: 'Mobile development platform',
    icon: 'Smartphone',
    category: 'Mobile',
    status: 'planned',
    port: 3109,
    url: 'http://localhost:3109',
    color: 'from-slate-500 to-purple-600',
    features: ['Mobile Development', 'Code Generation', 'Testing', 'Deployment'],
    tier: 5,
    businessPriority: 'medium',
    implementationDays: 12
  },
  {
    id: 'metu-web',
    name: 'METU Web',
    description: 'Web-based personal assistant',
    icon: 'Globe',
    category: 'Web',
    status: 'planned',
    port: 3110,
    url: 'http://localhost:3110',
    color: 'from-indigo-500 to-blue-600',
    features: ['Web Assistant', 'Browser Integration', 'Productivity', 'Automation'],
    tier: 5,
    businessPriority: 'low',
    implementationDays: 8
  },
  {
    id: 'id',
    name: 'ID',
    description: 'Identity and access management system',
    icon: 'Key',
    category: 'Security',
    status: 'planned',
    port: 3111,
    url: 'http://localhost:3111',
    color: 'from-red-500 to-orange-600',
    features: ['Identity Management', 'Single Sign-On', 'Access Control', 'Security'],
    tier: 5,
    businessPriority: 'high',
    implementationDays: 10
  }
];

export const APP_CATEGORIES = [
  'All',
  'Financial',
  'Platform',
  'Communication',
  'Development',
  'AI & Knowledge',
  'E-commerce',
  'Social Impact',
  'Support',
  'IoT',
  'Design',
  'Productivity',
  'Utilities',
  'Legal',
  'HR',
  'Analytics',
  'Content',
  'Marketing',
  'Logistics',
  'Manufacturing',
  'Energy',
  'Security',
  'Education',
  'Creative',
  'Gaming',
  'Documentation',
  'Experimental',
  'AI Assistant',
  'Crypto',
  'Mobile',
  'Web'
];

export const APP_STATUS_COLORS = {
  production: 'bg-green-100 text-green-700 border-green-200',
  beta: 'bg-blue-100 text-blue-700 border-blue-200',
  development: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  planned: 'bg-gray-100 text-gray-700 border-gray-200'
};

export const TIER_INFO: Record<number, { name: string; color: string; priority: string }> = {
  1: { name: 'Financial & Business', color: 'from-green-500 to-emerald-600', priority: 'High Impact' },
  2: { name: 'Core Platform', color: 'from-purple-500 to-blue-600', priority: 'Critical' },
  3: { name: 'Communication & Social', color: 'from-blue-500 to-cyan-600', priority: 'Engagement' },
  4: { name: 'Professional Services', color: 'from-orange-500 to-red-600', priority: 'Specialized' },
  5: { name: 'Creative & Innovation', color: 'from-pink-500 to-purple-600', priority: 'Innovation' }
};

// Helper functions
export function getAppsByCategory(category: string): AppInfo[] {
  if (category === 'All') return CODAI_APPS;
  return CODAI_APPS.filter(app => app.category === category);
}

export function getAppsByStatus(status: AppInfo['status']): AppInfo[] {
  return CODAI_APPS.filter(app => app.status === status);
}

export function getAppsByTier(tier: number): AppInfo[] {
  return CODAI_APPS.filter(app => app.tier === tier);
}

export function getAppById(id: string): AppInfo | undefined {
  return CODAI_APPS.find(app => app.id === id);
}

export function getImplementationStats() {
  const total = CODAI_APPS.length;
  const production = getAppsByStatus('production').length;
  const beta = getAppsByStatus('beta').length;
  const development = getAppsByStatus('development').length;
  const planned = getAppsByStatus('planned').length;

  const completionPercentage = Math.round(((production + beta) / total) * 100);

  return {
    total,
    production,
    beta,
    development,
    planned,
    completionPercentage
  };
}
