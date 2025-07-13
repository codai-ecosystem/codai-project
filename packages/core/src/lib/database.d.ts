export declare class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
}
export declare enum AccountType {
    SAVINGS = "SAVINGS",
    CHECKING = "CHECKING",
    BUSINESS = "BUSINESS"
}
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    TRANSFER = "TRANSFER"
}
export declare enum CardType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
    PREPAID = "PREPAID"
}
export declare enum KYCStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
declare global {
    var __prisma: PrismaClient | undefined;
}
export declare const db: PrismaClient;
export declare function connectDatabase(): Promise<void>;
export declare function disconnectDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map