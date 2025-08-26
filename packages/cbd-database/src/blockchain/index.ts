/**
 * CBD Blockchain Engine - Phase 6 Index
 * 
 * Main exports for the comprehensive blockchain implementation
 */

// Core blockchain types
export * from './types/BlockchainTypes';

// Consensus mechanisms
export { default as HotStuffConsensus } from './consensus/HotStuffConsensus';
export { default as ProofOfStakeValidator } from './consensus/ProofOfStakeValidator';

// Smart contracts
export { default as WASMSmartContractEngine } from './smart-contracts/WASMSmartContractEngine';

// Cryptographic operations
export { default as CryptographicEngine } from './crypto/CryptographicEngine';

// Network layer
export { default as P2PNetworkManager } from './network/P2PNetworkManager';

// State management
export { default as StateManager } from './state/StateManager';

// Transaction validation
export { default as TransactionValidator } from './validation/TransactionValidator';

// Shared utilities
export { Logger } from '../shared/Logger';