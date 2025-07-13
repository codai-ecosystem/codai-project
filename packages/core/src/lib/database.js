// Mock Prisma client for development
export class PrismaClient {
    constructor(options) { }
    async $connect() {
        console.log('✅ Database connected (mock)');
    }
    async $disconnect() {
        console.log('📪 Database disconnected (mock)');
    }
}
// Mock Prisma enums for development
export var AccountType;
(function (AccountType) {
    AccountType["SAVINGS"] = "SAVINGS";
    AccountType["CHECKING"] = "CHECKING";
    AccountType["BUSINESS"] = "BUSINESS";
})(AccountType || (AccountType = {}));
export var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["TRANSFER"] = "TRANSFER";
})(TransactionType || (TransactionType = {}));
export var CardType;
(function (CardType) {
    CardType["DEBIT"] = "DEBIT";
    CardType["CREDIT"] = "CREDIT";
    CardType["PREPAID"] = "PREPAID";
})(CardType || (CardType = {}));
export var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["APPROVED"] = "APPROVED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (KYCStatus = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
})(RiskLevel || (RiskLevel = {}));
import { env } from './env';
export const db = globalThis.__prisma || new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (env.NODE_ENV !== 'production') {
    globalThis.__prisma = db;
}
export async function connectDatabase() {
    try {
        await db.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
export async function disconnectDatabase() {
    await db.$disconnect();
}
