export interface AppConfig {
  name: string;
  description: string;
  tagline: string;
  port: number;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
  navigation: Array<{
    label: string;
    labelKey: string;
    href: string;
    requiresAuth?: boolean;
  }>;
  auth: {
    enabled: boolean;
    landingPage: string;
    dashboardPage: string;
    loginPage: string;
    signupPage: string;
  };
  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}
