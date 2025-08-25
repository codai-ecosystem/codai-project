interface AppConfig {
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
    defaultLanguage: string
    supportedLanguages: string[]
  }
}

export const appConfig: AppConfig = {
  name: 'EXPLORER',
  description: 'Intelligent files platform powered by AI',
  tagline: 'Transform your files experience with AI',
  port: 5016,
  theme: {
    primary: 'rgb(59, 130, 246)',
    secondary: 'rgb(147, 51, 234)',
    accent: 'rgb(34, 197, 94)'
  },
  features: [
    'AI-Powered files',
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
