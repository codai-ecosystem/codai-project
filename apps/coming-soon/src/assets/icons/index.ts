// Icon SVG content for better maintainability
export const iconSvgContent = {
    'codai-logo': `
    <defs>
      <linearGradient id="codai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea" />
        <stop offset="100%" style="stop-color:#764ba2" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="3" fill="url(#codai-gradient)" stroke="currentColor" stroke-width="2"/>
    <g stroke="url(#codai-gradient)" stroke-width="2" fill="none" stroke-linecap="round">
      <line x1="12" y1="9" x2="12" y2="3"/>
      <line x1="12" y1="3" x2="8" y2="5"/>
      <line x1="12" y1="3" x2="16" y2="5"/>
      <line x1="15" y1="12" x2="21" y2="12"/>
      <line x1="21" y1="12" x2="19" y2="8"/>
      <line x1="21" y1="12" x2="19" y2="16"/>
      <line x1="12" y1="15" x2="12" y2="21"/>
      <line x1="12" y1="21" x2="8" y2="19"/>
      <line x1="12" y1="21" x2="16" y2="19"/>
      <line x1="9" y1="12" x2="3" y2="12"/>
      <line x1="3" y1="12" x2="5" y2="8"/>
      <line x1="3" y1="12" x2="5" y2="16"/>
    </g>
    <g fill="url(#codai-gradient)">
      <circle cx="8" cy="5" r="1.5"/>
      <circle cx="16" cy="5" r="1.5"/>
      <circle cx="19" cy="8" r="1.5"/>
      <circle cx="19" cy="16" r="1.5"/>
      <circle cx="16" cy="19" r="1.5"/>
      <circle cx="8" cy="19" r="1.5"/>
      <circle cx="5" cy="16" r="1.5"/>
      <circle cx="5" cy="8" r="1.5"/>
    </g>
  `,

    'memorai': `
    <defs>
      <linearGradient id="memorai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#a8edea" />
        <stop offset="100%" style="stop-color:#fed6e3" />
      </linearGradient>
    </defs>
    <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="url(#memorai-gradient)" stroke-width="2"/>
    <g fill="url(#memorai-gradient)">
      <rect x="5" y="8" width="2" height="8" rx="1"/>
      <rect x="8" y="8" width="2" height="8" rx="1"/>
      <rect x="11" y="8" width="2" height="8" rx="1"/>
      <rect x="14" y="8" width="2" height="8" rx="1"/>
      <rect x="17" y="8" width="2" height="8" rx="1"/>
    </g>
    <g stroke="url(#memorai-gradient)" stroke-width="2" stroke-linecap="round">
      <line x1="6" y1="6" x2="6" y2="4"/>
      <line x1="9" y1="6" x2="9" y2="4"/>
      <line x1="12" y1="6" x2="12" y2="4"/>
      <line x1="15" y1="6" x2="15" y2="4"/>
      <line x1="18" y1="6" x2="18" y2="4"/>
      <line x1="6" y1="18" x2="6" y2="20"/>
      <line x1="9" y1="18" x2="9" y2="20"/>
      <line x1="12" y1="18" x2="12" y2="20"/>
      <line x1="15" y1="18" x2="15" y2="20"/>
      <line x1="18" y1="18" x2="18" y2="20"/>
    </g>
  `,

    // More icons can be added here as needed
};

// Service information for the ecosystem
export const serviceInformation = [
    {
        name: 'codai-logo' as const,
        title: 'CODAI Platform',
        description: 'Central AI orchestration hub with 71 applications and comprehensive ecosystem management',
        gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    },
    {
        name: 'memorai' as const,
        title: 'MemorAI',
        description: 'Advanced memory management system with 95% efficiency and persistent context storage',
        gradient: 'bg-gradient-to-br from-teal-300 to-pink-300'
    },
    {
        name: 'bancai' as const,
        title: 'BancAI',
        description: 'AI-powered financial services with banking, payments, and investment automation',
        gradient: 'bg-gradient-to-br from-yellow-300 to-orange-400'
    },
    {
        name: 'stocai' as const,
        title: 'StocAI',
        description: 'Intelligent stock trading platform with AI-driven market analysis and predictions',
        gradient: 'bg-gradient-to-br from-cyan-300 to-blue-500'
    },
    {
        name: 'marketai' as const,
        title: 'MarketAI',
        description: 'Marketing automation and analytics platform with targeted campaign optimization',
        gradient: 'bg-gradient-to-br from-pink-400 to-red-500'
    },
    {
        name: 'talentai' as const,
        title: 'TalentAI',
        description: 'HR and recruitment automation with AI-powered talent matching and assessment',
        gradient: 'bg-gradient-to-br from-blue-400 to-cyan-300'
    },
    {
        name: 'legalai' as const,
        title: 'LegalAI',
        description: 'Legal document processing and compliance management with AI-powered analysis',
        gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    },
    {
        name: 'adminai' as const,
        title: 'AdminAI',
        description: 'Business administration automation with intelligent workflow optimization',
        gradient: 'bg-gradient-to-br from-green-400 to-blue-400'
    },
    {
        name: 'studiai' as const,
        title: 'StudiAI',
        description: 'AI-powered education platform with personalized learning and knowledge management',
        gradient: 'bg-gradient-to-br from-yellow-300 to-orange-400'
    }
];

export default iconSvgContent;