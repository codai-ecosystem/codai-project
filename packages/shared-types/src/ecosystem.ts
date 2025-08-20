// CODAI Ecosystem Integration Types
export interface EcosystemApp {
  id: string;
  name: string;
  domain: string;
  port: number;
  category: AppCategory;
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  description: string;
  icon: string;
  routes: AppRoute[];
  features: string[];
  integrations: string[];
}

export type AppCategory =
  | 'core'           // CODAI, Hub, Admin, ID
  | 'financial'      // BancAI, StocAI, Wallet
  | 'ai-ml'          // MemorAI, RomAI, AnalizeAI
  | 'business'       // MarketAI, TalentAI, LogAI
  | 'creative'       // MuzicAI, PrezentAI, MOD
  | 'productivity'   // Tools, Glass, StudiAI
  | 'specialized';   // SunAI, PublicAI, SociAI

export interface AppRoute {
  path: string;
  name: string;
  description: string;
  icon?: string;
  protected: boolean;
  roles?: UserRole[];
  category?: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchy: number; // 1 = highest (master_admin), 10 = lowest (guest)
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'admin')[];
}

export interface EcosystemUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  preferences: UserPreferences;
  apps: UserAppAccess[];
  createdAt: Date;
  lastActive: Date;
}

export interface UserAppAccess {
  appId: string;
  accessLevel: 'full' | 'limited' | 'readonly';
  features: string[];
  customPermissions?: Permission[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  navigation: NavigationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    security: boolean;
    financial: boolean;
    updates: boolean;
    marketing: boolean;
  };
}

export interface NavigationSettings {
  sidebarCollapsed: boolean;
  favoriteApps: string[];
  recentApps: string[];
  quickActions: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  dataSharing: boolean;
  analytics: boolean;
  thirdPartyIntegrations: boolean;
}

// Cross-App Integration Types
export interface CrossAppAction {
  sourceApp: string;
  targetApp: string;
  action: string;
  data: any;
  timestamp: Date;
  userId: string;
}

export interface EcosystemEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  userId?: string;
  timestamp: Date;
}

// API Integration Types
export interface EcosystemAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface EcosystemAPIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

// Navigation Integration
export interface EcosystemNavigation {
  apps: EcosystemApp[];
  currentApp: string;
  user: EcosystemUser;
  quickAccess: QuickAccessItem[];
  breadcrumbs: BreadcrumbItem[];
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  action: string;
  appId?: string;
  url?: string;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  appId?: string;
}

// Financial Integration Types (for BancAI and financial apps)
export interface FinancialAccount {
  id: string;
  userId: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'business';
  name: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  features: string[];
  limits: AccountLimits;
  integrations: {
    stocai?: boolean;
    wallet?: boolean;
    analytics?: boolean;
  };
}

export interface AccountLimits {
  dailyTransfer: number;
  monthlyTransfer: number;
  atmWithdrawal: number;
  purchaseLimit: number;
}

// Investment Integration (BancAI <-> StocAI)
export interface InvestmentPortfolio {
  id: string;
  userId: string;
  accountId: string;
  totalValue: number;
  holdings: InvestmentHolding[];
  performance: PortfolioPerformance;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface InvestmentHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioPerformance {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  allTime: number;
}
