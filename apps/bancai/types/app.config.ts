// Local AppConfig types for BancAI
// Replaces missing @codai/shared-ui package

export interface NavigationItem {
  label: string;
  labelKey: string;
  href: string;
  requiresAuth?: boolean;
}

export interface AppTheme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface AppAuth {
  enabled: boolean;
  landingPage: string;
  dashboardPage: string;
  loginPage: string;
  signupPage: string;
}

export interface AppI18n {
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface AppConfig {
  name: string;
  description: string;
  tagline: string;
  port: number;
  theme: AppTheme;
  features: string[];
  navigation: NavigationItem[];
  auth: AppAuth;
  i18n: AppI18n;
}
