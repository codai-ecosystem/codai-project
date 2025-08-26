/**
 * CBD Blockchain Types - Phase 6
 * 
 * Comprehensive type definitions for the enterprise blockchain engine
 * including blocks, transactions, smart contracts, validators, and consensus.
 */

export interface Block {
  height: number;
  hash: string;
  previousHash: string;
  merkleRoot: string;
  stateRoot: string;
  timestamp: number;
  proposer: string;
  transactions: Transaction[];
  transactionCount: number;
  gasUsed: bigint;
  gasLimit: bigint;
  size: number;
  signature: string;
  validators: ValidatorInfo[];
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  type: TransactionType;
  data: any;
  gasLimit: bigint;
  gasPrice: bigint;
  nonce: number;
  timestamp: number;
  signature: string;
}

export type TransactionType = 
  | 'transfer'
  | 'contract_deployment'
  | 'contract_call'
  | 'stake'
  | 'unstake'
  | 'delegate'
  | 'undelegate'
  | 'governance_vote'
  | 'governance_proposal';

export interface SmartContract {
  address: string;
  bytecode: Buffer;
  language: 'rust' | 'c' | 'cpp' | 'assemblyscript';
  abi?: ContractABI;
  deployer: string;
  deploymentHeight: number;
  deploymentTxHash: string;
  isActive: boolean;
  gasUsed: bigint;
  callCount: number;
}

export interface ContractABI {
  name: string;
  version: string;
  functions: ContractFunction[];
  events: ContractEvent[];
  structs: ContractStruct[];
}

export interface ContractFunction {
  name: string;
  inputs: ContractParameter[];
  outputs: ContractParameter[];
  mutability: 'pure' | 'view' | 'payable' | 'nonpayable';
  gasEstimate?: number;
}

export interface ContractEvent {
  name: string;
  inputs: ContractParameter[];
  anonymous: boolean;
}

export interface ContractParameter {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractStruct {
  name: string;
  fields: ContractParameter[];
}

export interface Validator {
  address: string;
  publicKey: string;
  stake: bigint;
  votingPower: number;
  isActive: boolean;
  lastActiveHeight: number;
  slashingHistory: SlashingRecord[];
  rewards: bigint;
}

export interface ValidatorInfo {
  address: string;
  publicKey: string;
  stake: bigint;
  votingPower: number;
}

export interface ValidatorSet {
  validators: Validator[];
  totalStake: bigint;
  height: number;
  updateHeight: number;
}

export interface SlashingRecord {
  height: number;
  reason: SlashingReason;
  amount: bigint;
  timestamp: number;
}

export type SlashingReason = 
  | 'double_signing'
  | 'downtime'
  | 'invalid_proposal'
  | 'consensus_violation';

export interface ConsensusMessage {
  type: ConsensusMessageType;
  round: number;
  height: number;
  validatorAddress: string;
  signature: string;
  timestamp: number;
  data: any;
}

export type ConsensusMessageType = 
  | 'block_proposal'
  | 'prevote'
  | 'precommit'
  | 'prepare'
  | 'commit'
  | 'new_round'
  | 'timeout';

export interface ConsensusRound {
  round: number;
  height: number;
  proposer: string;
  startTime: number;
  phase: ConsensusPhase;
  votes: Map<string, Vote>;
  timeouts: Map<string, number>;
}

export type ConsensusPhase = 
  | 'propose'
  | 'prevote' 
  | 'precommit'
  | 'commit'
  | 'new_round';

export interface BlockProposal {
  block: Block;
  proposer: string;
  round: number;
  height: number;
  timestamp: number;
  signature: string;
  proof: ProofOfLock | null;
}

export interface ProofOfLock {
  round: number;
  blockHash: string;
  signatures: string[];
}

export interface Vote {
  type: VoteType;
  validator: string;
  round: number;
  height: number;
  blockHash: string | null;
  timestamp: number;
  signature: string;
}

export type VoteType = 'prevote' | 'precommit';

export interface Commit {
  height: number;
  round: number;
  blockHash: string;
  signatures: CommitSignature[];
}

export interface CommitSignature {
  validator: string;
  signature: string;
  timestamp: number;
}

export interface TransactionPool {
  addTransaction(tx: Transaction): Promise<boolean>;
  removeTransaction(txId: string): Promise<void>;
  selectTransactions(maxCount: number, maxGas: bigint): Promise<Transaction[]>;
  size(): number;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ValidatorRewards {
  validator: string;
  blockRewards: bigint;
  gasRewards: bigint;
  delegationRewards: bigint;
  totalRewards: bigint;
  height: number;
  timestamp: number;
}

export interface SlashingCondition {
  type: SlashingReason;
  threshold: number;
  penalty: number; // Percentage (0-100)
  cooldownBlocks: number;
}

export interface BlockchainConfig {
  chainId: string;
  networkId: string;
  
  // Block configuration
  blocks: {
    maxTransactionsPerBlock: number;
    maxGasPerBlock: number;
    targetBlockTime: number; // milliseconds
    maxBlockSize: number; // bytes
  };
  
  // Consensus configuration
  consensus: {
    type: 'hotstuff';
    timeoutPropose: number;
    timeoutPrevote: number;
    timeoutPrecommit: number;
    timeoutCommit: number;
    maxRounds: number;
    byzantineFaultTolerance: number; // 1/3 = 0.33
  };
  
  // Proof-of-Stake configuration
  pos: {
    minStake: string; // BigInt as string
    maxValidators: number;
    unbondingPeriod: number; // blocks
    validatorUpdateInterval: number; // blocks
    blockReward: string; // BigInt as string
    gasRewardMultiplier: number;
    stakingContractAddress: string;
    slashingConditions: SlashingCondition[];
  };
  
  // Smart contract configuration
  contracts: {
    maxGasPerContract: number;
    defaultGasLimit: number;
    defaultGasPrice: number;
    wasmRuntimeVersion: string;
    maxContractSize: number; // bytes
    maxCallDepth: number;
    enableDebugging: boolean;
  };
  
  // WebAssembly configuration
  wasm: {
    runtimeType: 'wasmer' | 'wasmtime';
    memoryLimit: number; // bytes
    executionTimeout: number; // milliseconds
    enableJIT: boolean;
    optimizationLevel: 0 | 1 | 2 | 3;
    allowedImports: string[];
  };
  
  // Network configuration
  network: {
    listenAddress: string;
    bootstrapPeers: string[];
    maxPeers: number;
    enableDiscovery: boolean;
    protocolVersion: string;
    networkKey?: string;
    enableTLS: boolean;
  };
  
  // State management configuration
  state: {
    stateDBPath: string;
    cacheSize: number; // MB
    enablePruning: boolean;
    pruningInterval: number; // blocks
    snapshotInterval: number; // blocks
  };
  
  // Storage configuration
  storage: {
    blockStorePath: string;
    transactionStorePath: string;
    stateStorePath: string;
    indexStorePath: string;
    compressionLevel: number;
    enableBackup: boolean;
    backupInterval: number; // hours
  };
  
  // Transaction pool configuration
  mempool: {
    maxTransactions: number;
    maxTransactionSize: number;
    maxAccountTransactions: number;
    transactionTTL: number; // seconds
    priceLimit: string; // Minimum gas price
    enableMetrics: boolean;
  };
  
  // Validation configuration
  validation: {
    strictGasChecking: boolean;
    requireSignature: boolean;
    maxNonceDiff: number;
    enablePrevalidation: boolean;
    customValidators: string[];
  };
  
  // Cryptography configuration
  crypto: {
    hashAlgorithm: 'sha256' | 'blake2b' | 'keccak256';
    signatureScheme: 'ed25519' | 'secp256k1' | 'bls';
    keyDerivationFunction: 'pbkdf2' | 'scrypt' | 'argon2';
    enableHSM: boolean;
    hsmConfig?: HSMConfig;
  };
}

export interface HSMConfig {
  provider: string;
  endpoint: string;
  keyId: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface GenesisConfig {
  chainId: string;
  timestamp: number;
  validators: GenesisValidator[];
  accounts: GenesisAccount[];
  contracts: GenesisContract[];
  params: GenesisParams;
}

export interface GenesisValidator {
  address: string;
  publicKey: string;
  stake: string; // BigInt as string
  votingPower: number;
  name?: string;
}

export interface GenesisAccount {
  address: string;
  balance: string; // BigInt as string
  nonce: number;
  code?: string;
  storage?: { [key: string]: string };
}

export interface GenesisContract {
  address: string;
  bytecode: string;
  language: 'rust' | 'c' | 'cpp' | 'assemblyscript';
  deployer: string;
  constructorArgs: any[];
}

export interface GenesisParams {
  blockReward: string; // BigInt as string
  gasLimit: number;
  gasPrice: number;
  stakingParams: {
    minStake: string;
    unbondingPeriod: number;
  };
  governanceParams: {
    votingPeriod: number;
    quorum: number;
    threshold: number;
  };
}

// Execution context for smart contracts
export interface ExecutionContext {
  caller?: string;
  deployer?: string;
  gasLimit: bigint;
  gasUsed?: bigint;
  blockHeight: number;
  blockTimestamp: number;
  transactionHash?: string;
  contractAddress?: string;
  value?: bigint;
}

// Smart contract execution result
export interface ExecutionResult {
  success: boolean;
  returnValue?: any;
  gasUsed: bigint;
  error?: string;
  logs?: ContractLog[];
  stateChanges?: StateChange[];
}

export interface ContractLog {
  address: string;
  topics: string[];
  data: string;
  blockHeight: number;
  transactionHash: string;
  logIndex: number;
}

export interface StateChange {
  account: string;
  key: string;
  oldValue: string;
  newValue: string;
}

// Account state
export interface AccountState {
  balance: bigint;
  nonce: number;
  codeHash?: string;
  storageRoot?: string;
  isContract: boolean;
}

// Network message types
export interface NetworkMessage {
  type: MessageType;
  from: string;
  to?: string;
  data: any;
  timestamp: number;
  signature: string;
}

export type MessageType = 
  | 'block_announcement'
  | 'transaction_broadcast'
  | 'consensus_message'
  | 'peer_discovery'
  | 'sync_request'
  | 'sync_response';

// Performance metrics
export interface BlockchainMetrics {
  blocksProduced: number;
  transactionsProcessed: number;
  smartContractsExecuted: number;
  consensusRounds: number;
  averageBlockTime: number;
  tps: number;
  gasUsed: bigint;
  validatorUptime: Map<string, number>;
  networkLatency: number;
  memoryUsage: number;
  diskUsage: number;
  syncStatus: SyncStatus;
}

export interface SyncStatus {
  isSyncing: boolean;
  currentHeight: number;
  targetHeight: number;
  syncProgress: number; // 0-1
  peersConnected: number;
  lastSyncTime: number;
}

// Error types
export class BlockchainError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export class ConsensusError extends BlockchainError {
  constructor(message: string, context?: any) {
    super(message, 'CONSENSUS_ERROR', context);
    this.name = 'ConsensusError';
  }
}

export class ValidationError extends BlockchainError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class ContractError extends BlockchainError {
  constructor(message: string, context?: any) {
    super(message, 'CONTRACT_ERROR', context);
    this.name = 'ContractError';
  }
}

export class NetworkError extends BlockchainError {
  constructor(message: string, context?: any) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

// Event types for the blockchain engine
export interface BlockchainEvents {
  'blockchain:started': () => void;
  'blockchain:stopped': () => void;
  'block:proposed': (block: Block) => void;
  'block:finalized': (block: Block) => void;
  'transaction:submitted': (data: { transaction: Transaction; hash: string }) => void;
  'transaction:executed': (data: { transaction: Transaction; result: ExecutionResult }) => void;
  'transaction:failed': (data: { transaction: Transaction; error: string }) => void;
  'transaction:added': (transaction: Transaction) => void;
  'transaction:removed': (txId: string) => void;
  'consensus:round_started': (round: ConsensusRound) => void;
  'consensus:round_finished': (result: ConsensusResult) => void;
  'validator:slashed': (validator: string, reason: SlashingReason, amount: bigint) => void;
  'validator:rewarded': (validator: string, amount: bigint) => void;
  'contract:deployed': (address: string, deployer: string) => void;
  'contract:called': (address: string, method: string, caller: string) => void;
  'sync:started': () => void;
  'sync:completed': () => void;
  'peer:connected': (peerId: string) => void;
  'peer:disconnected': (peerId: string) => void;
}

export interface ConsensusResult {
  success: boolean;
  block?: Block;
  round: number;
  finalizedHeight: number;
  error?: string;
}

// Additional types for transaction validation

export interface SignedTransaction extends Transaction {
  hash: string;
  value: bigint;
  networkId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  transactionHash: string;
  gasUsed: bigint;
  error?: string;
}