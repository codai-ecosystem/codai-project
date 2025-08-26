/**
 * Proof of Stake Validator - Phase 6
 * 
 * Implementation of Proof-of-Stake consensus validator with economic incentives,
 * slashing conditions, and validator management for the CBD blockchain.
 */

import { EventEmitter } from 'events';
import {
  Validator,
  ValidatorSet,
  ValidatorRewards,
  SlashingCondition,
  SlashingReason,
  SlashingRecord
} from '../types/BlockchainTypes';
import { Logger } from '../../shared/Logger';

interface PoSConfig {
  minStake: string;
  maxValidators: number;
  unbondingPeriod: number;
  validatorUpdateInterval: number;
  blockReward: string;
  gasRewardMultiplier: number;
  stakingContractAddress: string;
  slashingConditions: SlashingCondition[];
}

interface DelegationInfo {
  delegator: string;
  validator: string;
  amount: bigint;
  height: number;
  unbondingHeight?: number;
}

/**
 * Proof of Stake Validator managing staking, delegation, and validator selection
 */
export class ProofOfStakeValidator extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: PoSConfig;
  
  // Validator and delegation state
  private validators: Map<string, Validator> = new Map();
  private delegations: Map<string, DelegationInfo[]> = new Map();
  private unbondingQueue: Map<number, DelegationInfo[]> = new Map();
  
  // Staking pools and rewards
  private stakingPools: Map<string, bigint> = new Map();
  private rewardPool: bigint = BigInt(0);
  private slashingPool: bigint = BigInt(0);
  
  // Validator performance tracking
  private validatorMetrics: Map<string, {
    blocksProposed: number;
    blocksValidated: number;
    uptime: number;
    lastActiveHeight: number;
    reputationScore: number;
  }> = new Map();
  
  private isRunning = false;
  private currentHeight = 0;

  constructor(config: PoSConfig) {
    super();
    
    this.logger = new Logger('ProofOfStakeValidator');
    this.config = config;
    
    this.logger.info('PoS Validator initialized', {
      minStake: config.minStake,
      maxValidators: config.maxValidators,
      unbondingPeriod: config.unbondingPeriod,
      blockReward: config.blockReward
    });
  }

  /**
   * Start the PoS validator with initial validator set
   */
  async start(initialValidatorSet: ValidatorSet): Promise<void> {
    if (this.isRunning) {
      throw new Error('PoS Validator already running');
    }
    
    // Initialize validators from set
    for (const validator of initialValidatorSet.validators) {
      this.validators.set(validator.address, { ...validator });
      this.stakingPools.set(validator.address, validator.stake);
      
      // Initialize metrics
      this.validatorMetrics.set(validator.address, {
        blocksProposed: 0,
        blocksValidated: 0,
        uptime: 100,
        lastActiveHeight: initialValidatorSet.height,
        reputationScore: 100
      });
    }
    
    this.currentHeight = initialValidatorSet.height;
    this.isRunning = true;
    
    this.logger.info('PoS Validator started', {
      validators: this.validators.size,
      totalStake: initialValidatorSet.totalStake.toString()
    });
  }

  /**
   * Stop the PoS validator
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('PoS Validator stopped');
  }

  /**
   * Add stake for a validator
   */
  async addStake(validatorAddress: string, amount: bigint): Promise<void> {
    if (!this.isRunning) {
      throw new Error('PoS Validator not running');
    }
    
    let validator = this.validators.get(validatorAddress);
    
    if (!validator) {
      // Create new validator
      validator = {
        address: validatorAddress,
        publicKey: '', // Would be provided in real implementation
        stake: BigInt(0),
        votingPower: 0,
        isActive: true,
        lastActiveHeight: this.currentHeight,
        slashingHistory: [],
        rewards: BigInt(0)
      };
      
      this.validators.set(validatorAddress, validator);
      this.stakingPools.set(validatorAddress, BigInt(0));
      
      // Initialize metrics
      this.validatorMetrics.set(validatorAddress, {
        blocksProposed: 0,
        blocksValidated: 0,
        uptime: 100,
        lastActiveHeight: this.currentHeight,
        reputationScore: 100
      });
    }
    
    // Add stake
    validator.stake += amount;
    const currentPool = this.stakingPools.get(validatorAddress) || BigInt(0);
    this.stakingPools.set(validatorAddress, currentPool + amount);
    
    // Recalculate voting power
    this.updateVotingPowers();
    
    this.logger.info('Stake added', {
      validator: validatorAddress,
      amount: amount.toString(),
      newStake: validator.stake.toString()
    });
    
    this.emit('stake:added', { validator: validatorAddress, amount });
  }

  /**
   * Remove stake from a validator (start unbonding process)
   */
  async removeStake(validatorAddress: string, amount: bigint): Promise<void> {
    if (!this.isRunning) {
      throw new Error('PoS Validator not running');
    }
    
    const validator = this.validators.get(validatorAddress);
    if (!validator) {
      throw new Error(`Validator not found: ${validatorAddress}`);
    }
    
    if (validator.stake < amount) {
      throw new Error('Insufficient stake to remove');
    }
    
    // Check minimum stake requirement
    const remainingStake = validator.stake - amount;
    const minStake = BigInt(this.config.minStake);
    
    if (remainingStake > BigInt(0) && remainingStake < minStake) {
      throw new Error(`Remaining stake below minimum: ${minStake.toString()}`);
    }
    
    // Start unbonding process
    const unbondingHeight = this.currentHeight + this.config.unbondingPeriod;
    const unbondingInfo: DelegationInfo = {
      delegator: validatorAddress,
      validator: validatorAddress,
      amount,
      height: this.currentHeight,
      unbondingHeight
    };
    
    // Add to unbonding queue
    const unbondingAtHeight = this.unbondingQueue.get(unbondingHeight) || [];
    unbondingAtHeight.push(unbondingInfo);
    this.unbondingQueue.set(unbondingHeight, unbondingAtHeight);
    
    // Remove from active stake
    validator.stake -= amount;
    const currentPool = this.stakingPools.get(validatorAddress) || BigInt(0);
    this.stakingPools.set(validatorAddress, currentPool - amount);
    
    // If stake is zero, deactivate validator
    if (validator.stake === BigInt(0)) {
      validator.isActive = false;
    }
    
    // Recalculate voting power
    this.updateVotingPowers();
    
    this.logger.info('Stake unbonding started', {
      validator: validatorAddress,
      amount: amount.toString(),
      unbondingHeight,
      remainingStake: validator.stake.toString()
    });
    
    this.emit('stake:unbonding', { 
      validator: validatorAddress, 
      amount, 
      unbondingHeight 
    });
  }

  /**
   * Delegate stake to a validator
   */
  async delegate(
    delegator: string, 
    validator: string, 
    amount: bigint
  ): Promise<void> {
    if (!this.isRunning) {
      throw new Error('PoS Validator not running');
    }
    
    const validatorInfo = this.validators.get(validator);
    if (!validatorInfo || !validatorInfo.isActive) {
      throw new Error(`Validator not found or inactive: ${validator}`);
    }
    
    const delegation: DelegationInfo = {
      delegator,
      validator,
      amount,
      height: this.currentHeight
    };
    
    // Add delegation
    const validatorDelegations = this.delegations.get(validator) || [];
    validatorDelegations.push(delegation);
    this.delegations.set(validator, validatorDelegations);
    
    // Increase validator stake
    validatorInfo.stake += amount;
    const currentPool = this.stakingPools.get(validator) || BigInt(0);
    this.stakingPools.set(validator, currentPool + amount);
    
    // Recalculate voting power
    this.updateVotingPowers();
    
    this.logger.info('Delegation added', {
      delegator,
      validator,
      amount: amount.toString(),
      newValidatorStake: validatorInfo.stake.toString()
    });
    
    this.emit('delegation:added', { delegator, validator, amount });
  }

  /**
   * Select proposer for the next block
   */
  async selectProposer(validatorSet: ValidatorSet, height: number): Promise<Validator> {
    const activeValidators = validatorSet.validators.filter(v => v.isActive);
    
    if (activeValidators.length === 0) {
      throw new Error('No active validators available');
    }
    
    // Weighted random selection based on stake
    const totalStake = activeValidators.reduce((sum, v) => sum + v.stake, BigInt(0));
    
    // Use deterministic pseudorandom selection based on height
    const seed = this.createDeterministicSeed(height);
    const random = this.pseudoRandom(seed, Number(totalStake));
    
    let cumulativeStake = BigInt(0);
    for (const validator of activeValidators) {
      cumulativeStake += validator.stake;
      if (BigInt(random) <= cumulativeStake) {
        return validator;
      }
    }
    
    // Fallback to first validator
    return activeValidators[0];
  }

  /**
   * Distribute block rewards to validators
   */
  async distributeReward(validatorAddress: string, amount: bigint): Promise<void> {
    const validator = this.validators.get(validatorAddress);
    if (!validator) {
      throw new Error(`Validator not found: ${validatorAddress}`);
    }
    
    // Update validator rewards
    validator.rewards += amount;
    
    // Update metrics
    const metrics = this.validatorMetrics.get(validatorAddress);
    if (metrics) {
      metrics.blocksProposed++;
    }
    
    // Distribute to delegators proportionally
    const validatorDelegations = this.delegations.get(validatorAddress) || [];
    const totalDelegatedStake = validatorDelegations.reduce(
      (sum, d) => sum + d.amount, 
      BigInt(0)
    );
    
    if (totalDelegatedStake > BigInt(0)) {
      // Calculate commission (example: 10% to validator, 90% to delegators)
      const commission = amount * BigInt(10) / BigInt(100);
      const delegatorRewards = amount - commission;
      
      validator.rewards += commission;
      
      // Distribute to delegators
      for (const delegation of validatorDelegations) {
        const delegatorReward = delegatorRewards * delegation.amount / totalDelegatedStake;
        
        this.emit('reward:delegator', {
          delegator: delegation.delegator,
          validator: validatorAddress,
          amount: delegatorReward
        });
      }
    }
    
    this.logger.debug('Rewards distributed', {
      validator: validatorAddress,
      amount: amount.toString(),
      totalRewards: validator.rewards.toString()
    });
    
    this.emit('reward:validator', { validator: validatorAddress, amount });
  }

  /**
   * Slash a validator for misbehavior
   */
  async slashValidator(
    validatorAddress: string,
    reason: SlashingReason,
    evidenceHeight: number
  ): Promise<void> {
    const validator = this.validators.get(validatorAddress);
    if (!validator) {
      throw new Error(`Validator not found: ${validatorAddress}`);
    }
    
    // Find applicable slashing condition
    const slashingCondition = this.config.slashingConditions
      .find(c => c.type === reason);
    
    if (!slashingCondition) {
      throw new Error(`No slashing condition for: ${reason}`);
    }
    
    // Calculate slashing amount
    const slashingAmount = validator.stake * BigInt(slashingCondition.penalty) / BigInt(100);
    
    // Apply slashing
    validator.stake = validator.stake > slashingAmount ? 
      validator.stake - slashingAmount : BigInt(0);
    
    // Add to slashing history
    const slashingRecord: SlashingRecord = {
      height: evidenceHeight,
      reason,
      amount: slashingAmount,
      timestamp: Date.now()
    };
    
    validator.slashingHistory.push(slashingRecord);
    
    // Update slashing pool
    this.slashingPool += slashingAmount;
    
    // Update validator metrics
    const metrics = this.validatorMetrics.get(validatorAddress);
    if (metrics) {
      metrics.reputationScore = Math.max(0, metrics.reputationScore - 20);
    }
    
    // Deactivate if slashed too much
    if (validator.stake < BigInt(this.config.minStake)) {
      validator.isActive = false;
    }
    
    // Recalculate voting powers
    this.updateVotingPowers();
    
    this.logger.warn('Validator slashed', {
      validator: validatorAddress,
      reason,
      amount: slashingAmount.toString(),
      remainingStake: validator.stake.toString()
    });
    
    this.emit('validator:slashed', { 
      validator: validatorAddress, 
      reason, 
      amount: slashingAmount 
    });
  }

  /**
   * Process unbonding queue for completed unbonding periods
   */
  async processUnbondingQueue(currentHeight: number): Promise<void> {
    this.currentHeight = currentHeight;
    
    const completedUnbonding = this.unbondingQueue.get(currentHeight);
    if (!completedUnbonding || completedUnbonding.length === 0) {
      return;
    }
    
    for (const unbonding of completedUnbonding) {
      this.logger.info('Unbonding completed', {
        delegator: unbonding.delegator,
        validator: unbonding.validator,
        amount: unbonding.amount.toString()
      });
      
      this.emit('stake:unbonded', {
        delegator: unbonding.delegator,
        validator: unbonding.validator,
        amount: unbonding.amount
      });
    }
    
    // Remove processed unbonding
    this.unbondingQueue.delete(currentHeight);
  }

  /**
   * Get updated validator set with current stakes and voting powers
   */
  async getUpdatedValidatorSet(): Promise<Validator[]> {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive && v.stake >= BigInt(this.config.minStake))
      .sort((a, b) => {
        // Sort by stake descending
        if (a.stake > b.stake) return -1;
        if (a.stake < b.stake) return 1;
        return 0;
      })
      .slice(0, this.config.maxValidators); // Limit validator count
    
    return activeValidators;
  }

  /**
   * Get validator metrics
   */
  getValidatorMetrics(validatorAddress: string): any {
    return this.validatorMetrics.get(validatorAddress);
  }

  /**
   * Get all validators
   */
  getValidators(): Validator[] {
    return Array.from(this.validators.values());
  }

  /**
   * Private helper methods
   */
  
  private updateVotingPowers(): void {
    const totalStake = Array.from(this.validators.values())
      .reduce((sum, v) => sum + (v.isActive ? v.stake : BigInt(0)), BigInt(0));
    
    if (totalStake === BigInt(0)) {
      return;
    }
    
    for (const validator of this.validators.values()) {
      if (validator.isActive && validator.stake > BigInt(0)) {
        // Voting power as percentage of total stake (0-100)
        validator.votingPower = Number(
          (validator.stake * BigInt(100)) / totalStake
        );
      } else {
        validator.votingPower = 0;
      }
    }
  }

  private createDeterministicSeed(height: number): string {
    // Create deterministic seed from height for proposer selection
    return `proposer-seed-${height}`;
  }

  private pseudoRandom(seed: string, max: number): number {
    // Simple deterministic pseudorandom generator
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash) % max;
  }
}

export default ProofOfStakeValidator;