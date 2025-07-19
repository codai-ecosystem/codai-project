#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all apps
const apps = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'conversai',
    'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'donai', 'explorer',
    'fabricai', 'glass', 'hub', 'id', 'jucai', 'kodex', 'legalizai',
    'logai', 'marketai', 'memorai', 'metu', 'mobile', 'mod', 'muzicai',
    'prezentai', 'publicai', 'romai', 'sociai', 'stocai', 'studiai',
    'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// App metadata for titles and descriptions
const appMetadata = {
    acasai: { title: 'ACASAI - Real Estate Intelligence', description: 'AI-powered real estate analysis and property management platform.' },
    admin: { title: 'ADMIN - Administrative Control', description: 'Comprehensive administrative dashboard for system management.' },
    aide: { title: 'AIDE - AI Development Assistant', description: 'Intelligent development assistant providing code suggestions and guidance.' },
    ajutai: { title: 'AJUTAI - Help & Support', description: 'Comprehensive help and support system with AI-powered assistance.' },
    analizai: { title: 'ANALIZAI - Analytics Intelligence', description: 'Advanced analytics platform with machine learning insights.' },
    bancai: { title: 'BANCAI - Banking Intelligence', description: 'AI-powered banking and financial services platform.' },
    conversai: { title: 'CONVERSAI - Conversation Intelligence', description: 'Advanced conversation AI platform with natural language processing.' },
    cumparai: { title: 'CUMPARAI - Shopping Intelligence', description: 'Smart shopping assistant with price comparison and deal finding.' },
    curtai: { title: 'CURTAI - Legal Intelligence', description: 'Legal technology platform with document analysis and case management.' },
    dash: { title: 'DASH - Dashboard Central', description: 'Unified dashboard platform for data visualization and monitoring.' },
    dexai: { title: 'DEXAI - Exchange Intelligence', description: 'Cryptocurrency and trading platform with AI-powered market analysis.' },
    docs: { title: 'DOCS - Documentation Hub', description: 'Comprehensive documentation platform with collaborative editing.' },
    donai: { title: 'DONAI - Donation Platform', description: 'AI-powered donation and fundraising platform with impact tracking.' },
    explorer: { title: 'EXPLORER - Data Explorer', description: 'Advanced data exploration and discovery platform.' },
    fabricai: { title: 'FABRICAI - Content Creation', description: 'AI-powered content creation platform for text, images, and multimedia.' },
    glass: { title: 'GLASS - Interface Design', description: 'Modern glassmorphism UI framework with advanced design components.' },
    hub: { title: 'HUB - Integration Hub', description: 'Central integration platform connecting multiple services.' },
    id: { title: 'ID - Identity Management', description: 'Secure identity and access management platform.' },
    jucai: { title: 'JUCAI - Gaming Intelligence', description: 'AI-powered gaming platform with intelligent gameplay assistance.' },
    kodex: { title: 'KODEX - Code Management', description: 'Advanced code repository and development workflow management.' },
    legalizai: { title: 'LEGALIZAI - Legal Automation', description: 'Automated legal document processing and compliance management.' },
    logai: { title: 'LOGAI - Log Intelligence', description: 'Advanced log analysis and monitoring platform.' },
    marketai: { title: 'MARKETAI - Marketing Intelligence', description: 'AI-driven marketing automation platform with campaign optimization.' },
    memorai: { title: 'MEMORAI - Memory Management', description: 'Advanced memory and context management system.' },
    metu: { title: 'METU - Desktop Application', description: 'Native desktop application with cross-platform compatibility.' },
    mobile: { title: 'MOBILE - Mobile Platform', description: 'Comprehensive mobile application suite.' },
    mod: { title: 'MOD - Module System', description: 'Modular architecture platform with component management.' },
    muzicai: { title: 'MUZICAI - Music Intelligence', description: 'AI-powered music creation and analysis platform.' },
    prezentai: { title: 'PREZENTAI - Presentation Intelligence', description: 'AI-powered presentation creation platform.' },
    publicai: { title: 'PUBLICAI - Public Services', description: 'Public sector AI platform for government services automation.' },
    romai: { title: 'ROMAI - Romanian Intelligence', description: 'Romanian-specific AI platform with localized services.' },
    sociai: { title: 'SOCIAI - Social Intelligence', description: 'Social media management platform with AI-powered content creation.' },
    stocai: { title: 'STOCAI - Stock Intelligence', description: 'AI-powered stock market analysis and trading platform.' },
    studiai: { title: 'STUDIAI - Educational Intelligence', description: 'AI-powered learning platform with personalized education.' },
    sunai: { title: 'SUNAI - Solar Intelligence', description: 'Solar energy management platform with AI-powered optimization.' },
    talentai: { title: 'TALENTAI - Talent Intelligence', description: 'AI-powered talent management and recruitment platform.' },
    tools: { title: 'TOOLS - Development Tools', description: 'Comprehensive development toolkit with code generators and utilities.' },
    wallet: { title: 'WALLET - Digital Wallet', description: 'Secure digital wallet platform with cryptocurrency support.' },
    x: { title: 'X - Experimental Platform', description: 'Cutting-edge experimental platform for testing new technologies.' }
};

// Layout template
const layoutTemplate = `import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import AuthWrapper from './components/AuthWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: '{{APP_TITLE}}',
  description: '{{APP_DESCRIPTION}}',
  keywords: ['{{APP_NAME}}', 'AI', 'platform', 'technology'],
  authors: [{ name: 'CODAI Team' }],
  creator: 'CODAI',
  publisher: 'CODAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://{{APP_NAME}}.codai.ro'),
  openGraph: {
    title: '{{APP_TITLE}}',
    description: '{{APP_DESCRIPTION}}',
    url: 'https://{{APP_NAME}}.codai.ro',
    siteName: '{{APP_TITLE}}',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '{{APP_TITLE}}',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '{{APP_TITLE}}',
    description: '{{APP_DESCRIPTION}}',
    images: ['/og-image.jpg'],
    creator: '@codai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="antialiased">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}`;

// Function to update layout for each app
function updateAppLayout(appName) {
    const appDir = path.join(__dirname, '..', 'apps', appName);
    const layoutPath = path.join(appDir, 'app', 'layout.tsx');

    if (!fs.existsSync(appDir)) {
        console.log(`⚠️  App directory ${appName} does not exist, skipping...`);
        return;
    }

    console.log(`🔧 Updating layout for ${appName}...`);

    const metadata = appMetadata[appName];
    const layoutContent = layoutTemplate
        .replace(/\{\{APP_NAME\}\}/g, appName)
        .replace(/\{\{APP_TITLE\}\}/g, metadata.title)
        .replace(/\{\{APP_DESCRIPTION\}\}/g, metadata.description);

    // Create app directory if it doesn't exist
    const appAppDir = path.join(appDir, 'app');
    if (!fs.existsSync(appAppDir)) {
        fs.mkdirSync(appAppDir, { recursive: true });
    }

    // Write the layout file
    fs.writeFileSync(layoutPath, layoutContent);

    console.log(`✅ Updated layout for ${appName}`);
}

// Main execution
console.log('🚀 Starting layout updates for all apps...\n');

apps.forEach(appName => {
    updateAppLayout(appName);
});

console.log(`\n✨ Layout updates completed for ${apps.length} apps!`);
console.log('\nNext steps:');
console.log('1. Create globals.css files for each app');
console.log('2. Add Tailwind configurations');
console.log('3. Install required dependencies');
console.log('4. Test the authentication flow');
