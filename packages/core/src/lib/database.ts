// Mock Prisma client for development
export class PrismaClient {
  constructor(options?: any) { }

  async $connect(): Promise<void> {
    console.log('✅ Database connected (mock)');
  }

  async $disconnect(): Promise<void> {
    console.log('📪 Database disconnected (mock)');
  }
}

// Mock Prisma enums for development
export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
  BUSINESS = 'BUSINESS'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER'
}

export enum CardType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PREPAID = 'PREPAID'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

import { env } from './env';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}

export async function connectDatabase(): Promise<void> {
  try {
    await db.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
}