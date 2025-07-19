import { AppConfig } from '@codai/shared-ui'

export const appConfig: AppConfig = {
  name: 'KODEX',
  description: 'Intelligent development platform powered by AI',
  tagline: 'Transform your development experience with AI',
  port: 5022,
  theme: {
    primary: 'rgb(59, 130, 246)',
    secondary: 'rgb(147, 51, 234)',
    accent: 'rgb(34, 197, 94)'
  },
  features: [
    'AI-Powered development',
    'Real-time Analytics',
    'Multi-language Support',
    'Advanced Security'
  ],
  navigation: [
    {
      label: 'Dashboard',
      labelKey: 'nav.dashboard',
      href: '/dashboard',
      requiresAuth: true
    },
    {
      label: 'Features',
      labelKey: 'nav.features',
      href: '/features'
    },
    {
      label: 'Settings',
      labelKey: 'nav.settings',
      href: '/settings',
      requiresAuth: true
    }
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
}

export default appConfig
