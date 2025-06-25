// Type definitions for BancAI

export interface ServiceConfig {
  name: string;
  version: string;
  domain: string;
}

// Codai Ecosystem Types
export interface CodaiService {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unreachable';
  version?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  port: number;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  dependencies: Record<string, string>;
}

// Financial Platform Types
export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  category: string;
  description: string;
  merchantName?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
  kycStatus: 'pending' | 'verified' | 'rejected';
  accounts: BankAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// AI Features Types
export interface AIInsight {
  id: string;
  userId: string;
  type:
    | 'spending_pattern'
    | 'saving_opportunity'
    | 'investment_advice'
    | 'fraud_alert';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  analysisType:
    | 'spending_analysis'
    | 'risk_assessment'
    | 'investment_recommendation';
  result: Record<string, any>;
  confidence: number;
  timestamp: string;
}
