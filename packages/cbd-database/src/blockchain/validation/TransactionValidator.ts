/**
 * Transaction Validator - Phase 6
 * 
 * Implementation of transaction validation with signature verification,
 * balance checks, gas validation, and anti-fraud mechanisms.
 */

import { EventEmitter } from 'events';
import {
  Transaction,
  TransactionType,
  SignedTransaction,
  Block,
  AccountState,
  ValidationResult,
  SmartContract,
  ExecutionResult
} from '../types/BlockchainTypes';
import { Logger } from '../../shared/Logger';

interface ValidationConfig {
  maxTransactionSize: number;
  maxGasLimit: bigint;
  minGasPrice: bigint;
  networkId: string;
  enableAntiSpam: boolean;
  maxTransactionsPerBlock: number;
  transactionTimeoutMinutes: number;
}

interface ValidationContext {
  blockHeight: number;
  blockTimestamp: number;
  gasUsed: bigint;
  accountStates: Map<string, AccountState>;
  contractStates: Map<string, SmartContract>;
}

/**
 * Transaction Validator for comprehensive transaction validation
 */
export class TransactionValidator extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: ValidationConfig;
  
  // Transaction pools and tracking
  private validTransactions: Map<string, SignedTransaction> = new Map();
  private invalidTransactions: Map<string, ValidationResult> = new Map();
  private pendingTransactions: Map<string, SignedTransaction> = new Map();
  
  // Anti-fraud and rate limiting
  private transactionCounts: Map<string, number> = new Map();
  private lastTransactionTime: Map<string, number> = new Map();
  private suspiciousAddresses: Set<string> = new Set();
  
  private isRunning = false;

  constructor(config: ValidationConfig) {
    super();
    
    this.logger = new Logger('TransactionValidator');
    this.config = config;
    
    this.logger.info('Transaction Validator initialized', {
      maxTransactionSize: config.maxTransactionSize,
      maxGasLimit: config.maxGasLimit.toString(),
      minGasPrice: config.minGasPrice.toString(),
      networkId: config.networkId
    });
  }

  /**
   * Start the transaction validator
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Transaction Validator already running');
    }
    
    this.isRunning = true;
    
    // Start cleanup interval
    this.startCleanupInterval();
    
    this.logger.info('Transaction Validator started');
  }

  /**
   * Stop the transaction validator
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Transaction Validator stopped');
  }

  /**
   * Validate a single transaction
   */
  async validateTransaction(
    transaction: SignedTransaction,
    context: ValidationContext
  ): Promise<ValidationResult> {
    if (!this.isRunning) {
      throw new Error('Transaction Validator not running');
    }

    const txHash = this.calculateTransactionHash(transaction);
    
    try {
      // Basic structure validation
      const structureResult = this.validateTransactionStructure(transaction);
      if (!structureResult.isValid) {
        this.invalidTransactions.set(txHash, structureResult);
        return structureResult;
      }

      // Signature validation
      const signatureResult = await this.validateSignature(transaction);
      if (!signatureResult.isValid) {
        this.invalidTransactions.set(txHash, signatureResult);
        return signatureResult;
      }

      // Network validation
      const networkResult = this.validateNetwork(transaction);
      if (!networkResult.isValid) {
        this.invalidTransactions.set(txHash, networkResult);
        return networkResult;
      }

      // Temporal validation
      const temporalResult = this.validateTiming(transaction, context);
      if (!temporalResult.isValid) {
        this.invalidTransactions.set(txHash, temporalResult);
        return temporalResult;
      }

      // Balance and gas validation
      const balanceResult = await this.validateBalanceAndGas(transaction, context);
      if (!balanceResult.isValid) {
        this.invalidTransactions.set(txHash, balanceResult);
        return balanceResult;
      }

      // Anti-spam validation
      if (this.config.enableAntiSpam) {
        const spamResult = this.validateAntiSpam(transaction);
        if (!spamResult.isValid) {
          this.invalidTransactions.set(txHash, spamResult);
          return spamResult;
        }
      }

      // Transaction-type specific validation
      const typeResult = await this.validateTransactionType(transaction, context);
      if (!typeResult.isValid) {
        this.invalidTransactions.set(txHash, typeResult);
        return typeResult;
      }

      // Mark as valid
      this.validTransactions.set(txHash, transaction);
      
      const result: ValidationResult = {
        isValid: true,
        transactionHash: txHash,
        gasUsed: transaction.gasLimit,
        error: undefined
      };

      this.logger.debug('Transaction validated successfully', {
        hash: txHash,
        from: transaction.from,
        type: transaction.type
      });

      this.emit('transaction:validated', { transaction, result });
      return result;

    } catch (error) {
      const result: ValidationResult = {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };

      this.invalidTransactions.set(txHash, result);
      
      this.logger.error('Transaction validation failed', {
        hash: txHash,
        error: result.error
      });

      return result;
    }
  }

  /**
   * Validate multiple transactions for a block
   */
  async validateTransactions(
    transactions: SignedTransaction[],
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    if (transactions.length > this.config.maxTransactionsPerBlock) {
      throw new Error(`Too many transactions: ${transactions.length} > ${this.config.maxTransactionsPerBlock}`);
    }

    const results: ValidationResult[] = [];
    let cumulativeGasUsed = BigInt(0);
    
    // Create modified context for cumulative gas tracking
    const blockContext = { ...context };

    for (const transaction of transactions) {
      // Update gas context
      blockContext.gasUsed = cumulativeGasUsed;
      
      const result = await this.validateTransaction(transaction, blockContext);
      results.push(result);

      if (result.isValid) {
        cumulativeGasUsed += result.gasUsed;
      }

      // Check gas limit for block
      if (cumulativeGasUsed > this.config.maxGasLimit) {
        // Mark remaining transactions as invalid
        for (let i = results.length; i < transactions.length; i++) {
          results.push({
            isValid: false,
            transactionHash: this.calculateTransactionHash(transactions[i]),
            gasUsed: BigInt(0),
            error: 'Block gas limit exceeded'
          });
        }
        break;
      }
    }

    this.logger.info('Block transactions validated', {
      total: transactions.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      gasUsed: cumulativeGasUsed.toString()
    });

    return results;
  }

  /**
   * Validate transaction structure and basic fields
   */
  private validateTransactionStructure(transaction: SignedTransaction): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check required fields
    if (!transaction.hash || !transaction.from || !transaction.signature) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Missing required transaction fields'
      };
    }

    // Check transaction size
    const transactionSize = JSON.stringify(transaction).length;
    if (transactionSize > this.config.maxTransactionSize) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Transaction size exceeds limit: ${transactionSize} > ${this.config.maxTransactionSize}`
      };
    }

    // Check gas limits
    if (transaction.gasLimit > this.config.maxGasLimit) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Gas limit exceeds maximum: ${transaction.gasLimit} > ${this.config.maxGasLimit}`
      };
    }

    if (transaction.gasPrice < this.config.minGasPrice) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Gas price below minimum: ${transaction.gasPrice} < ${this.config.minGasPrice}`
      };
    }

    // Check value is non-negative
    if (transaction.value < BigInt(0)) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Transaction value cannot be negative'
      };
    }

    // Check nonce is non-negative
    if (transaction.nonce < 0) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Transaction nonce cannot be negative'
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate transaction signature
   */
  private async validateSignature(transaction: SignedTransaction): Promise<ValidationResult> {
    const txHash = this.calculateTransactionHash(transaction);

    try {
      // Mock signature validation - in real implementation would use cryptographic library
      const isValidSignature = this.verifyTransactionSignature(transaction);
      
      if (!isValidSignature) {
        return {
          isValid: false,
          transactionHash: txHash,
          gasUsed: BigInt(0),
          error: 'Invalid transaction signature'
        };
      }

      return {
        isValid: true,
        transactionHash: txHash,
        gasUsed: transaction.gasLimit,
        error: undefined
      };

    } catch (error) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Signature validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate network-specific fields
   */
  private validateNetwork(transaction: SignedTransaction): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check network ID if present
    if (transaction.networkId && transaction.networkId !== this.config.networkId) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Invalid network ID: ${transaction.networkId} !== ${this.config.networkId}`
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate transaction timing and expiration
   */
  private validateTiming(transaction: SignedTransaction, context: ValidationContext): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check transaction expiration
    const transactionAge = context.blockTimestamp - transaction.timestamp;
    const timeoutMs = this.config.transactionTimeoutMinutes * 60 * 1000;

    if (transactionAge > timeoutMs) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Transaction expired: age ${transactionAge}ms > timeout ${timeoutMs}ms`
      };
    }

    // Check future timestamps
    if (transaction.timestamp > context.blockTimestamp + 60000) { // 1 minute tolerance
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Transaction timestamp too far in the future'
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate account balance and gas fees
   */
  private async validateBalanceAndGas(
    transaction: SignedTransaction, 
    context: ValidationContext
  ): Promise<ValidationResult> {
    const txHash = this.calculateTransactionHash(transaction);

    // Get account state
    const accountState = context.accountStates.get(transaction.from);
    if (!accountState) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Account not found: ${transaction.from}`
      };
    }

    // Check nonce sequence
    if (transaction.nonce !== accountState.nonce + 1) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Invalid nonce: expected ${accountState.nonce + 1}, got ${transaction.nonce}`
      };
    }

    // Calculate total cost (value + gas fees)
    const gasCost = transaction.gasLimit * transaction.gasPrice;
    const totalCost = transaction.value + gasCost;

    // Check sufficient balance
    if (accountState.balance < totalCost) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Insufficient balance: ${accountState.balance} < ${totalCost}`
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate anti-spam measures
   */
  private validateAntiSpam(transaction: SignedTransaction): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check suspicious addresses
    if (this.suspiciousAddresses.has(transaction.from)) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Transaction from suspicious address: ${transaction.from}`
      };
    }

    // Rate limiting per address
    const currentCount = this.transactionCounts.get(transaction.from) || 0;
    const lastTime = this.lastTransactionTime.get(transaction.from) || 0;
    const now = Date.now();

    // Reset counter if enough time has passed (1 minute window)
    if (now - lastTime > 60000) {
      this.transactionCounts.set(transaction.from, 1);
    } else {
      this.transactionCounts.set(transaction.from, currentCount + 1);
      
      // Check rate limit (max 100 transactions per minute)
      if (currentCount + 1 > 100) {
        return {
          isValid: false,
          transactionHash: txHash,
          gasUsed: BigInt(0),
          error: `Rate limit exceeded for address: ${transaction.from}`
        };
      }
    }

    this.lastTransactionTime.set(transaction.from, now);

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate transaction-type specific logic
   */
  private async validateTransactionType(
    transaction: SignedTransaction,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const txHash = this.calculateTransactionHash(transaction);

    switch (transaction.type) {
      case 'transfer':
        return this.validateTransferTransaction(transaction, context);
      
      case 'contract_deployment':
        return this.validateContractDeployment(transaction, context);
      
      case 'contract_call':
        return this.validateContractCall(transaction, context);
      
      default:
        return {
          isValid: false,
          transactionHash: txHash,
          gasUsed: BigInt(0),
          error: `Unknown transaction type: ${transaction.type}`
        };
    }
  }

  /**
   * Validate transfer transaction
   */
  private validateTransferTransaction(
    transaction: SignedTransaction,
    context: ValidationContext
  ): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check recipient address
    if (!transaction.to) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Transfer transaction requires recipient address'
      };
    }

    // Check self-transfer (allowed but flagged)
    if (transaction.from === transaction.to) {
      this.logger.warn('Self-transfer detected', {
        hash: txHash,
        from: transaction.from
      });
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate contract deployment transaction
   */
  private validateContractDeployment(
    transaction: SignedTransaction,
    context: ValidationContext
  ): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check contract data
    if (!transaction.data || transaction.data.length === 0) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Contract deployment requires bytecode data'
      };
    }

    // Check recipient should be null for deployment
    if (transaction.to) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Contract deployment should not specify recipient address'
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Validate contract call transaction
   */
  private validateContractCall(
    transaction: SignedTransaction,
    context: ValidationContext
  ): ValidationResult {
    const txHash = this.calculateTransactionHash(transaction);

    // Check contract address
    if (!transaction.to) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: 'Contract call requires contract address'
      };
    }

    // Check contract exists
    const contractState = context.contractStates.get(transaction.to);
    if (!contractState) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Contract not found: ${transaction.to}`
      };
    }

    // Check contract is active
    if (!contractState.isActive) {
      return {
        isValid: false,
        transactionHash: txHash,
        gasUsed: BigInt(0),
        error: `Contract is not active: ${transaction.to}`
      };
    }

    return {
      isValid: true,
      transactionHash: txHash,
      gasUsed: transaction.gasLimit,
      error: undefined
    };
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    validTransactions: number;
    invalidTransactions: number;
    pendingTransactions: number;
    suspiciousAddresses: number;
  } {
    return {
      validTransactions: this.validTransactions.size,
      invalidTransactions: this.invalidTransactions.size,
      pendingTransactions: this.pendingTransactions.size,
      suspiciousAddresses: this.suspiciousAddresses.size
    };
  }

  /**
   * Mark address as suspicious
   */
  markSuspiciousAddress(address: string): void {
    this.suspiciousAddresses.add(address);
    this.logger.warn('Address marked as suspicious', { address });
  }

  /**
   * Clear suspicious address
   */
  clearSuspiciousAddress(address: string): void {
    this.suspiciousAddresses.delete(address);
    this.logger.info('Address cleared from suspicious list', { address });
  }

  /**
   * Private helper methods
   */

  private calculateTransactionHash(transaction: SignedTransaction): string {
    // Mock hash calculation - in real implementation would use proper cryptographic hash
    const data = JSON.stringify({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value.toString(),
      nonce: transaction.nonce,
      gasLimit: transaction.gasLimit.toString(),
      gasPrice: transaction.gasPrice.toString(),
      data: transaction.data,
      timestamp: transaction.timestamp
    });
    
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private verifyTransactionSignature(transaction: SignedTransaction): boolean {
    // Mock signature verification - in real implementation would use cryptographic library
    return transaction.signature.length > 0 && transaction.signature.startsWith('0x');
  }

  private startCleanupInterval(): void {
    // Clean up old transaction data every 5 minutes
    setInterval(() => {
      if (!this.isRunning) return;

      const now = Date.now();
      const cleanupThreshold = 5 * 60 * 1000; // 5 minutes

      // Clear old transaction counts
      for (const [address, lastTime] of this.lastTransactionTime.entries()) {
        if (now - lastTime > cleanupThreshold) {
          this.transactionCounts.delete(address);
          this.lastTransactionTime.delete(address);
        }
      }

      // Clear old invalid transactions (keep last 1000)
      if (this.invalidTransactions.size > 1000) {
        const entries = Array.from(this.invalidTransactions.entries());
        entries.slice(0, entries.length - 1000).forEach(([hash]) => {
          this.invalidTransactions.delete(hash);
        });
      }

      this.logger.debug('Cleanup completed', {
        validTransactions: this.validTransactions.size,
        invalidTransactions: this.invalidTransactions.size,
        transactionCounts: this.transactionCounts.size
      });

    }, 5 * 60 * 1000);
  }
}

export default TransactionValidator;