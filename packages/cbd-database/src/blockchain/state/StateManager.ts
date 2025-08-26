/**
 * State Manager - Phase 6
 * 
 * Implementation of blockchain state management with account states,
 * contract storage, state trees, and efficient state transitions.
 */

import { EventEmitter } from 'events';
import {
  Block,
  Transaction,
  AccountState,
  SmartContract,
  ExecutionResult,
  StateChange
} from '../types/BlockchainTypes';
import { Logger } from '../../shared/Logger';

interface StateConfig {
  stateDBPath: string;
  cacheSize: number; // MB
  enablePruning: boolean;
  pruningInterval: number; // blocks
  snapshotInterval: number; // blocks
  maxStateSize: number; // MB
  enableCompression: boolean;
  compressionLevel: number;
}

interface StateTree {
  height: number;
  stateRoot: string;
  accounts: Map<string, AccountState>;
  contracts: Map<string, SmartContract>;
  contractStorage: Map<string, Map<string, string>>;
  merkleTree: MerkleNode | null;
}

interface MerkleNode {
  hash: string;
  left: MerkleNode | null;
  right: MerkleNode | null;
  value?: string;
  key?: string;
}

interface StateSnapshot {
  height: number;
  timestamp: number;
  stateRoot: string;
  accounts: number;
  contracts: number;
  storageSize: number;
  filePath: string;
}

interface StateDiff {
  height: number;
  changes: StateChange[];
  accountsAdded: string[];
  accountsModified: string[];
  contractsDeployed: string[];
  contractsModified: string[];
}

/**
 * State Manager for blockchain state operations
 */
export class StateManager extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: StateConfig;
  
  // Current state
  private currentState: StateTree;
  private stateHistory: Map<number, StateTree> = new Map();
  
  // Caching
  private accountCache: Map<string, AccountState> = new Map();
  private contractCache: Map<string, SmartContract> = new Map();
  private storageCache: Map<string, Map<string, string>> = new Map();
  
  // State management
  private pendingChanges: Map<number, StateDiff> = new Map();
  private snapshots: Map<number, StateSnapshot> = new Map();
  
  // Performance tracking
  private stateSize = 0;
  private lastSnapshot = 0;
  private lastPruning = 0;
  
  private isRunning = false;

  constructor(config: StateConfig) {
    super();
    
    this.logger = new Logger('StateManager');
    this.config = config;
    
    // Initialize empty state
    this.currentState = {
      height: 0,
      stateRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
      accounts: new Map(),
      contracts: new Map(),
      contractStorage: new Map(),
      merkleTree: null
    };
    
    this.logger.info('State Manager initialized', {
      stateDBPath: config.stateDBPath,
      cacheSize: config.cacheSize,
      enablePruning: config.enablePruning,
      snapshotInterval: config.snapshotInterval
    });
  }

  /**
   * Start the state manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('State Manager already running');
    }
    
    // Load existing state if available
    await this.loadState();
    
    // Start background tasks
    this.startBackgroundTasks();
    
    this.isRunning = true;
    
    this.logger.info('State Manager started', {
      currentHeight: this.currentState.height,
      accounts: this.currentState.accounts.size,
      contracts: this.currentState.contracts.size,
      stateRoot: this.currentState.stateRoot
    });
  }

  /**
   * Stop the state manager
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Save current state
    await this.saveState();
    
    // Clear caches
    this.clearCaches();
    
    this.logger.info('State Manager stopped');
  }

  /**
   * Apply block to state
   */
  async applyBlock(block: Block): Promise<StateTree> {
    if (!this.isRunning) {
      throw new Error('State Manager not running');
    }

    const blockHeight = block.height;
    
    this.logger.debug('Applying block to state', {
      height: blockHeight,
      transactions: block.transactions.length,
      previousStateRoot: this.currentState.stateRoot
    });

    // Create new state tree from current
    const newState = this.cloneStateTree(this.currentState);
    newState.height = blockHeight;
    
    const stateDiff: StateDiff = {
      height: blockHeight,
      changes: [],
      accountsAdded: [],
      accountsModified: [],
      contractsDeployed: [],
      contractsModified: []
    };

    // Process each transaction
    for (const transaction of block.transactions) {
      await this.applyTransaction(transaction, newState, stateDiff);
    }

    // Update Merkle tree and state root
    newState.merkleTree = await this.buildMerkleTree(newState);
    newState.stateRoot = newState.merkleTree ? newState.merkleTree.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';

    // Store state and diff
    this.currentState = newState;
    this.stateHistory.set(blockHeight, this.cloneStateTree(newState));
    this.pendingChanges.set(blockHeight, stateDiff);

    // Update caches
    this.updateCaches(newState);

    this.logger.info('Block applied to state', {
      height: blockHeight,
      newStateRoot: newState.stateRoot,
      changes: stateDiff.changes.length,
      accounts: newState.accounts.size,
      contracts: newState.contracts.size
    });

    this.emit('state:updated', { 
      height: blockHeight, 
      stateRoot: newState.stateRoot,
      diff: stateDiff 
    });

    // Check for snapshot creation
    if (blockHeight - this.lastSnapshot >= this.config.snapshotInterval) {
      await this.createSnapshot(blockHeight);
    }

    // Check for pruning
    if (this.config.enablePruning && 
        blockHeight - this.lastPruning >= this.config.pruningInterval) {
      await this.pruneOldStates(blockHeight);
    }

    return newState;
  }

  /**
   * Revert state to a specific block height
   */
  async revertToHeight(targetHeight: number): Promise<void> {
    if (!this.isRunning) {
      throw new Error('State Manager not running');
    }

    if (targetHeight > this.currentState.height) {
      throw new Error(`Cannot revert to future height: ${targetHeight} > ${this.currentState.height}`);
    }

    const targetState = this.stateHistory.get(targetHeight);
    if (!targetState) {
      // Try to load from snapshot
      const snapshot = await this.loadSnapshot(targetHeight);
      if (!snapshot) {
        throw new Error(`No state available for height: ${targetHeight}`);
      }
    }

    // Revert to target state
    this.currentState = targetState ? 
      this.cloneStateTree(targetState) : 
      await this.loadSnapshotState(targetHeight);

    // Remove future states
    for (const [height] of this.stateHistory.entries()) {
      if (height > targetHeight) {
        this.stateHistory.delete(height);
        this.pendingChanges.delete(height);
      }
    }

    // Update caches
    this.updateCaches(this.currentState);

    this.logger.warn('State reverted', {
      targetHeight,
      currentHeight: this.currentState.height,
      stateRoot: this.currentState.stateRoot
    });

    this.emit('state:reverted', { 
      height: targetHeight, 
      stateRoot: this.currentState.stateRoot 
    });
  }

  /**
   * Get account state
   */
  async getAccount(address: string, height?: number): Promise<AccountState | null> {
    // Check cache first
    const cached = this.accountCache.get(address);
    if (cached && !height) {
      return cached;
    }

    const state = height ? this.stateHistory.get(height) : this.currentState;
    if (!state) {
      return null;
    }

    const account = state.accounts.get(address);
    if (account && !height) {
      // Cache current state account
      this.accountCache.set(address, account);
    }

    return account || null;
  }

  /**
   * Set account state
   */
  async setAccount(address: string, accountState: AccountState): Promise<void> {
    if (!this.isRunning) {
      throw new Error('State Manager not running');
    }

    this.currentState.accounts.set(address, accountState);
    this.accountCache.set(address, accountState);

    this.logger.debug('Account state updated', {
      address,
      balance: accountState.balance.toString(),
      nonce: accountState.nonce
    });
  }

  /**
   * Get contract state
   */
  async getContract(address: string, height?: number): Promise<SmartContract | null> {
    // Check cache first
    const cached = this.contractCache.get(address);
    if (cached && !height) {
      return cached;
    }

    const state = height ? this.stateHistory.get(height) : this.currentState;
    if (!state) {
      return null;
    }

    const contract = state.contracts.get(address);
    if (contract && !height) {
      // Cache current state contract
      this.contractCache.set(address, contract);
    }

    return contract || null;
  }

  /**
   * Set contract state
   */
  async setContract(address: string, contract: SmartContract): Promise<void> {
    if (!this.isRunning) {
      throw new Error('State Manager not running');
    }

    this.currentState.contracts.set(address, contract);
    this.contractCache.set(address, contract);

    this.logger.debug('Contract state updated', {
      address,
      isActive: contract.isActive,
      gasUsed: contract.gasUsed.toString()
    });
  }

  /**
   * Get contract storage
   */
  async getContractStorage(contractAddress: string, key: string, height?: number): Promise<string | null> {
    // Check cache first
    const cached = this.storageCache.get(contractAddress);
    if (cached && !height) {
      return cached.get(key) || null;
    }

    const state = height ? this.stateHistory.get(height) : this.currentState;
    if (!state) {
      return null;
    }

    const storage = state.contractStorage.get(contractAddress);
    const value = storage?.get(key) || null;

    if (storage && !height) {
      // Cache current state storage
      this.storageCache.set(contractAddress, new Map(storage));
    }

    return value;
  }

  /**
   * Set contract storage
   */
  async setContractStorage(contractAddress: string, key: string, value: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error('State Manager not running');
    }

    let storage = this.currentState.contractStorage.get(contractAddress);
    if (!storage) {
      storage = new Map();
      this.currentState.contractStorage.set(contractAddress, storage);
    }

    storage.set(key, value);

    // Update cache
    let cachedStorage = this.storageCache.get(contractAddress);
    if (!cachedStorage) {
      cachedStorage = new Map();
      this.storageCache.set(contractAddress, cachedStorage);
    }
    cachedStorage.set(key, value);

    this.logger.debug('Contract storage updated', {
      contractAddress,
      key,
      valueLength: value.length
    });
  }

  /**
   * Get current state root
   */
  getCurrentStateRoot(): string {
    return this.currentState.stateRoot;
  }

  /**
   * Get current block height
   */
  getCurrentHeight(): number {
    return this.currentState.height;
  }

  /**
   * Get state statistics
   */
  getStateStats(): {
    height: number;
    stateRoot: string;
    accounts: number;
    contracts: number;
    cacheSize: number;
    stateSize: number;
    snapshots: number;
  } {
    return {
      height: this.currentState.height,
      stateRoot: this.currentState.stateRoot,
      accounts: this.currentState.accounts.size,
      contracts: this.currentState.contracts.size,
      cacheSize: this.accountCache.size + this.contractCache.size + this.storageCache.size,
      stateSize: this.stateSize,
      snapshots: this.snapshots.size
    };
  }

  /**
   * Private helper methods
   */

  private async applyTransaction(
    transaction: Transaction, 
    state: StateTree, 
    diff: StateDiff
  ): Promise<void> {
    const fromAccount = state.accounts.get(transaction.from);
    if (!fromAccount) {
      throw new Error(`Account not found: ${transaction.from}`);
    }

    // Check nonce
    if (transaction.nonce !== fromAccount.nonce + 1) {
      throw new Error(`Invalid nonce: expected ${fromAccount.nonce + 1}, got ${transaction.nonce}`);
    }

    // Calculate gas cost
    const gasCost = transaction.gasLimit * transaction.gasPrice;
    const totalCost = transaction.type === 'transfer' ? 
      BigInt(transaction.data?.value || 0) + gasCost : gasCost;

    // Check balance
    if (fromAccount.balance < totalCost) {
      throw new Error(`Insufficient balance: ${fromAccount.balance} < ${totalCost}`);
    }

    // Update sender account
    fromAccount.balance -= totalCost;
    fromAccount.nonce++;
    
    diff.changes.push({
      account: transaction.from,
      key: 'balance',
      oldValue: (fromAccount.balance + totalCost).toString(),
      newValue: fromAccount.balance.toString()
    });

    if (!diff.accountsModified.includes(transaction.from)) {
      diff.accountsModified.push(transaction.from);
    }

    // Process transaction type
    switch (transaction.type) {
      case 'transfer':
        await this.applyTransferTransaction(transaction, state, diff);
        break;
      case 'contract_deployment':
        await this.applyContractDeployment(transaction, state, diff);
        break;
      case 'contract_call':
        await this.applyContractCall(transaction, state, diff);
        break;
      default:
        this.logger.warn('Unknown transaction type', { 
          type: transaction.type, 
          id: transaction.id 
        });
    }
  }

  private async applyTransferTransaction(
    transaction: Transaction, 
    state: StateTree, 
    diff: StateDiff
  ): Promise<void> {
    if (!transaction.to) {
      throw new Error('Transfer transaction requires recipient');
    }

    const value = BigInt(transaction.data?.value || 0);
    if (value <= 0) {
      return; // No-op transfer
    }

    // Get or create recipient account
    let toAccount = state.accounts.get(transaction.to);
    if (!toAccount) {
      toAccount = {
        balance: BigInt(0),
        nonce: 0,
        isContract: false
      };
      state.accounts.set(transaction.to, toAccount);
      diff.accountsAdded.push(transaction.to);
    }

    // Transfer value
    const oldBalance = toAccount.balance;
    toAccount.balance += value;

    diff.changes.push({
      account: transaction.to,
      key: 'balance',
      oldValue: oldBalance.toString(),
      newValue: toAccount.balance.toString()
    });

    if (!diff.accountsModified.includes(transaction.to)) {
      diff.accountsModified.push(transaction.to);
    }
  }

  private async applyContractDeployment(
    transaction: Transaction, 
    state: StateTree, 
    diff: StateDiff
  ): Promise<void> {
    // Generate contract address
    const contractAddress = await this.generateContractAddress(transaction);
    
    // Create contract
    const contract: SmartContract = {
      address: contractAddress,
      bytecode: Buffer.from(transaction.data?.bytecode || '', 'hex'),
      language: transaction.data?.language || 'rust',
      deployer: transaction.from,
      deploymentHeight: state.height,
      deploymentTxHash: transaction.id,
      isActive: true,
      gasUsed: BigInt(0),
      callCount: 0
    };

    state.contracts.set(contractAddress, contract);
    diff.contractsDeployed.push(contractAddress);

    // Create contract account
    const contractAccount: AccountState = {
      balance: BigInt(transaction.data?.value || 0),
      nonce: 0,
      isContract: true,
      codeHash: await this.hashData(contract.bytecode),
      storageRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };

    state.accounts.set(contractAddress, contractAccount);
    diff.accountsAdded.push(contractAddress);
  }

  private async applyContractCall(
    transaction: Transaction, 
    state: StateTree, 
    diff: StateDiff
  ): Promise<void> {
    if (!transaction.to) {
      throw new Error('Contract call requires contract address');
    }

    const contract = state.contracts.get(transaction.to);
    if (!contract) {
      throw new Error(`Contract not found: ${transaction.to}`);
    }

    if (!contract.isActive) {
      throw new Error(`Contract not active: ${transaction.to}`);
    }

    // Mock contract execution
    contract.callCount++;
    contract.gasUsed += transaction.gasLimit;

    diff.contractsModified.push(transaction.to);
  }

  private cloneStateTree(state: StateTree): StateTree {
    return {
      height: state.height,
      stateRoot: state.stateRoot,
      accounts: new Map(state.accounts),
      contracts: new Map(state.contracts),
      contractStorage: new Map(
        Array.from(state.contractStorage.entries())
          .map(([k, v]) => [k, new Map(v)])
      ),
      merkleTree: state.merkleTree // Shallow copy for performance
    };
  }

  private updateCaches(state: StateTree): void {
    // Update account cache with recent accounts
    const accountEntries = Array.from(state.accounts.entries());
    for (const [address, account] of accountEntries.slice(-1000)) { // Keep last 1000
      this.accountCache.set(address, account);
    }

    // Update contract cache
    const contractEntries = Array.from(state.contracts.entries());
    for (const [address, contract] of contractEntries.slice(-500)) { // Keep last 500
      this.contractCache.set(address, contract);
    }

    // Limit cache size
    this.limitCacheSize();
  }

  private limitCacheSize(): void {
    const maxCacheEntries = 10000;
    
    if (this.accountCache.size > maxCacheEntries) {
      const entries = Array.from(this.accountCache.entries());
      this.accountCache.clear();
      
      // Keep the most recent entries
      for (const entry of entries.slice(-maxCacheEntries / 2)) {
        this.accountCache.set(entry[0], entry[1]);
      }
    }

    if (this.contractCache.size > maxCacheEntries / 2) {
      const entries = Array.from(this.contractCache.entries());
      this.contractCache.clear();
      
      for (const entry of entries.slice(-maxCacheEntries / 4)) {
        this.contractCache.set(entry[0], entry[1]);
      }
    }
  }

  private clearCaches(): void {
    this.accountCache.clear();
    this.contractCache.clear();
    this.storageCache.clear();
  }

  private async buildMerkleTree(state: StateTree): Promise<MerkleNode | null> {
    const entries: { key: string; value: string }[] = [];
    
    // Add account entries
    for (const [address, account] of state.accounts.entries()) {
      entries.push({
        key: `account:${address}`,
        value: JSON.stringify({
          balance: account.balance.toString(),
          nonce: account.nonce,
          isContract: account.isContract
        })
      });
    }
    
    // Add contract entries
    for (const [address, contract] of state.contracts.entries()) {
      entries.push({
        key: `contract:${address}`,
        value: JSON.stringify({
          bytecode: contract.bytecode.toString('hex'),
          isActive: contract.isActive,
          gasUsed: contract.gasUsed.toString()
        })
      });
    }

    if (entries.length === 0) {
      return null;
    }

    // Build merkle tree (simplified implementation)
    return this.buildMerkleTreeFromEntries(entries);
  }

  private async buildMerkleTreeFromEntries(entries: { key: string; value: string }[]): Promise<MerkleNode> {
    if (entries.length === 1) {
      const hash = await this.hashData(Buffer.from(entries[0].key + entries[0].value));
      return {
        hash,
        left: null,
        right: null,
        key: entries[0].key,
        value: entries[0].value
      };
    }

    const mid = Math.ceil(entries.length / 2);
    const left = await this.buildMerkleTreeFromEntries(entries.slice(0, mid));
    const right = await this.buildMerkleTreeFromEntries(entries.slice(mid));
    
    const combinedHash = await this.hashData(Buffer.from(left.hash + right.hash));
    
    return {
      hash: combinedHash,
      left,
      right
    };
  }

  private async generateContractAddress(transaction: Transaction): Promise<string> {
    const data = transaction.from + transaction.nonce.toString();
    const hash = await this.hashData(Buffer.from(data));
    return '0x' + hash.slice(-40);
  }

  private async hashData(data: Buffer): Promise<string> {
    // Mock hash function
    let hash = 0;
    const str = data.toString('hex');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  private async createSnapshot(height: number): Promise<void> {
    const snapshot: StateSnapshot = {
      height,
      timestamp: Date.now(),
      stateRoot: this.currentState.stateRoot,
      accounts: this.currentState.accounts.size,
      contracts: this.currentState.contracts.size,
      storageSize: this.stateSize,
      filePath: `${this.config.stateDBPath}/snapshot_${height}.json`
    };

    this.snapshots.set(height, snapshot);
    this.lastSnapshot = height;

    this.logger.info('State snapshot created', {
      height,
      accounts: snapshot.accounts,
      contracts: snapshot.contracts,
      stateRoot: snapshot.stateRoot
    });
  }

  private async loadSnapshot(height: number): Promise<StateSnapshot | null> {
    return this.snapshots.get(height) || null;
  }

  private async loadSnapshotState(height: number): Promise<StateTree> {
    // Mock snapshot loading
    return this.cloneStateTree(this.currentState);
  }

  private async pruneOldStates(currentHeight: number): Promise<void> {
    const pruneThreshold = currentHeight - this.config.pruningInterval;
    let pruned = 0;

    for (const [height] of this.stateHistory.entries()) {
      if (height < pruneThreshold) {
        this.stateHistory.delete(height);
        this.pendingChanges.delete(height);
        pruned++;
      }
    }

    this.lastPruning = currentHeight;

    this.logger.info('Old states pruned', {
      currentHeight,
      pruneThreshold,
      statesPruned: pruned,
      remainingStates: this.stateHistory.size
    });
  }

  private async loadState(): Promise<void> {
    // Mock state loading
    this.logger.info('State loaded from disk');
  }

  private async saveState(): Promise<void> {
    // Mock state saving
    this.logger.info('State saved to disk');
  }

  private startBackgroundTasks(): void {
    // Start periodic cache cleanup
    setInterval(() => {
      if (this.isRunning) {
        this.limitCacheSize();
      }
    }, 60000); // Every minute
  }
}

export default StateManager;