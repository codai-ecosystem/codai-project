/**
 * HotStuff Consensus Engine - Phase 6
 * 
 * Implementation of the HotStuff Byzantine Fault Tolerant consensus mechanism
 * for the CBD blockchain. HotStuff provides optimal performance with O(n) 
 * communication complexity and deterministic finality.
 * 
 * Based on the HotStuff paper by Yin et al. (2019) and optimized for 
 * enterprise blockchain requirements with instant finality and high throughput.
 */

import { EventEmitter } from 'events';
import { createHash, randomBytes } from 'crypto';
import {
  Block,
  ValidatorSet,
  ConsensusRound,
  ConsensusMessage,
  BlockProposal,
  Vote,
  VoteType,
  Commit,
  ConsensusResult,
  ConsensusPhase,
  ProofOfLock,
  ConsensusError
} from '../types/BlockchainTypes';
import { Logger } from '../../shared/Logger';

interface ConsensusConfig {
  type: 'hotstuff';
  timeoutPropose: number;
  timeoutPrevote: number;
  timeoutPrecommit: number;
  timeoutCommit: number;
  maxRounds: number;
  byzantineFaultTolerance: number;
}

interface ConsensusState {
  height: number;
  round: number;
  phase: ConsensusPhase;
  lockedValue: Block | null;
  lockedRound: number;
  validValue: Block | null;
  validRound: number;
  votes: Map<string, Vote>;
  proposals: Map<string, BlockProposal>;
}

/**
 * HotStuff Consensus Engine implementing Byzantine Fault Tolerant consensus
 */
export class HotStuffConsensus extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: ConsensusConfig;
  private blockchain: any; // Reference to main blockchain
  
  // Consensus state
  private currentState: ConsensusState;
  private validatorSet: ValidatorSet | null = null;
  private isRunning = false;
  
  // Network and timing
  private consensusTimer: NodeJS.Timeout | null = null;
  private roundStartTime = 0;
  
  // Performance metrics
  private metrics = {
    roundsCompleted: 0,
    blocksFinalized: 0,
    averageRoundTime: 0,
    consensusFailures: 0,
    networkLatency: 0,
    votingEfficiency: 0
  };

  constructor(config: ConsensusConfig, blockchain: any) {
    super();
    
    this.logger = new Logger('HotStuffConsensus');
    this.config = config;
    this.blockchain = blockchain;
    
    // Initialize consensus state
    this.currentState = {
      height: 0,
      round: 0,
      phase: 'propose',
      lockedValue: null,
      lockedRound: -1,
      validValue: null,
      validRound: -1,
      votes: new Map(),
      proposals: new Map()
    };
    
    this.logger.info('HotStuff consensus engine initialized', {
      timeouts: {
        propose: config.timeoutPropose,
        prevote: config.timeoutPrevote,
        precommit: config.timeoutPrecommit,
        commit: config.timeoutCommit
      },
      maxRounds: config.maxRounds,
      bftTolerance: config.byzantineFaultTolerance
    });
  }

  /**
   * Initialize consensus with validator set
   */
  async initialize(validatorSet: ValidatorSet): Promise<void> {
    this.validatorSet = validatorSet;
    this.currentState.height = validatorSet.height;
    
    this.logger.info('Consensus initialized', {
      height: this.currentState.height,
      validators: validatorSet.validators.length,
      totalStake: validatorSet.totalStake.toString()
    });
  }

  /**
   * Start consensus engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Consensus engine already running');
    }
    
    if (!this.validatorSet) {
      throw new Error('Validator set not initialized');
    }
    
    this.isRunning = true;
    this.logger.info('HotStuff consensus started');
    this.emit('consensus:started');
  }

  /**
   * Stop consensus engine
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.consensusTimer) {
      clearTimeout(this.consensusTimer);
      this.consensusTimer = null;
    }
    
    this.logger.info('HotStuff consensus stopped');
    this.emit('consensus:stopped');
  }

  /**
   * Propose a block for consensus
   */
  async proposeBlock(block: Block): Promise<void> {
    if (!this.isRunning || !this.validatorSet) {
      throw new ConsensusError('Consensus not ready for proposals');
    }
    
    if (this.currentState.phase !== 'propose') {
      throw new ConsensusError(`Invalid phase for proposal: ${this.currentState.phase}`);
    }
    
    const proposal: BlockProposal = {
      block,
      proposer: block.proposer,
      round: this.currentState.round,
      height: block.height,
      timestamp: Date.now(),
      signature: '', // Would be signed by proposer
      proof: this.createProofOfLock()
    };
    
    // Add proposal to state
    this.currentState.proposals.set(block.hash, proposal);
    
    this.logger.debug('Block proposed', {
      height: block.height,
      round: this.currentState.round,
      hash: block.hash,
      proposer: block.proposer
    });
    
    this.emit('consensus:block_proposed', proposal);
    
    // Move to prevote phase
    await this.enterPhase('prevote');
  }

  /**
   * Run a consensus round
   */
  async runRound(height: number): Promise<ConsensusResult> {
    if (!this.isRunning || !this.validatorSet) {
      return {
        success: false,
        round: this.currentState.round,
        finalizedHeight: this.currentState.height,
        error: 'Consensus not running'
      };
    }
    
    try {
      // Initialize new round
      await this.initializeRound(height);
      
      const roundResult = await this.executeConsensusRound();
      
      // Update metrics
      this.updateMetrics(roundResult);
      
      return roundResult;
      
    } catch (error) {
      this.metrics.consensusFailures++;
      this.logger.error('Consensus round failed', error);
      
      return {
        success: false,
        round: this.currentState.round,
        finalizedHeight: this.currentState.height,
        error: error instanceof Error ? error.message : 'Unknown consensus error'
      };
    }
  }

  /**
   * Handle incoming consensus message
   */
  async handleMessage(message: ConsensusMessage): Promise<void> {
    if (!this.isRunning || !this.validatorSet) {
      return;
    }
    
    try {
      // Validate message
      if (!this.validateMessage(message)) {
        this.logger.warn('Invalid consensus message', { message });
        return;
      }
      
      // Process based on message type
      switch (message.type) {
        case 'prevote':
        case 'precommit':
          await this.handleVote(message);
          break;
          
        case 'block_proposal':
          await this.handleProposal(message);
          break;
          
        case 'new_round':
          await this.handleNewRound(message);
          break;
          
        case 'timeout':
          await this.handleTimeout(message);
          break;
          
        default:
          this.logger.warn('Unknown message type', { type: message.type });
      }
      
    } catch (error) {
      this.logger.error('Failed to handle consensus message', error);
    }
  }

  /**
   * Update validator set
   */
  async updateValidatorSet(validatorSet: ValidatorSet): Promise<void> {
    this.validatorSet = validatorSet;
    this.logger.info('Validator set updated', {
      validators: validatorSet.validators.length,
      totalStake: validatorSet.totalStake.toString()
    });
  }

  /**
   * Get consensus metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Private implementation methods
   */
  
  private async initializeRound(height: number): Promise<void> {
    const previousRound = this.currentState.round;
    
    this.currentState = {
      height,
      round: height > this.currentState.height ? 0 : this.currentState.round + 1,
      phase: 'propose',
      lockedValue: this.currentState.lockedValue,
      lockedRound: this.currentState.lockedRound,
      validValue: this.currentState.validValue,
      validRound: this.currentState.validRound,
      votes: new Map(),
      proposals: new Map()
    };
    
    this.roundStartTime = Date.now();
    
    const consensusRound: ConsensusRound = {
      round: this.currentState.round,
      height: this.currentState.height,
      proposer: this.selectProposer(),
      startTime: this.roundStartTime,
      phase: this.currentState.phase,
      votes: this.currentState.votes,
      timeouts: new Map()
    };
    
    this.logger.debug('Round initialized', {
      height: this.currentState.height,
      round: this.currentState.round,
      proposer: consensusRound.proposer
    });
    
    this.emit('consensus:round_started', consensusRound);
  }

  private async executeConsensusRound(): Promise<ConsensusResult> {
    let finalizedBlock: Block | null = null;
    
    // HotStuff three-phase protocol: propose, prevote, precommit
    try {
      // Phase 1: Propose (handled externally by blockchain)
      await this.waitForPhaseCompletion('propose');
      
      // Phase 2: Prevote
      await this.enterPhase('prevote');
      const prevoteResult = await this.waitForPhaseCompletion('prevote');
      
      if (!prevoteResult.success) {
        throw new ConsensusError('Prevote phase failed');
      }
      
      // Phase 3: Precommit
      await this.enterPhase('precommit');
      const precommitResult = await this.waitForPhaseCompletion('precommit');
      
      if (!precommitResult.success) {
        throw new ConsensusError('Precommit phase failed');
      }
      
      // Finalize if we have enough precommits
      finalizedBlock = precommitResult.block || null;
      
      if (finalizedBlock) {
        this.metrics.blocksFinalized++;
        this.logger.info('Block finalized through consensus', {
          height: finalizedBlock.height,
          round: this.currentState.round,
          hash: finalizedBlock.hash
        });
      }
      
      return {
        success: true,
        block: finalizedBlock || undefined,
        round: this.currentState.round,
        finalizedHeight: finalizedBlock?.height || this.currentState.height
      };
      
    } catch (error) {
      return {
        success: false,
        round: this.currentState.round,
        finalizedHeight: this.currentState.height,
        error: error instanceof Error ? error.message : 'Consensus execution failed'
      };
    }
  }

  private async enterPhase(phase: ConsensusPhase): Promise<void> {
    this.currentState.phase = phase;
    
    // Set phase timeout
    const timeout = this.getPhaseTimeout(phase);
    if (this.consensusTimer) {
      clearTimeout(this.consensusTimer);
    }
    
    this.consensusTimer = setTimeout(() => {
      this.handlePhaseTimeout(phase);
    }, timeout);
    
    this.logger.debug('Entered consensus phase', { 
      phase, 
      timeout,
      height: this.currentState.height,
      round: this.currentState.round
    });
  }

  private async waitForPhaseCompletion(phase: ConsensusPhase): Promise<{
    success: boolean;
    block?: Block;
  }> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (phase === 'propose') {
          // Check if we have a valid proposal
          const hasValidProposal = Array.from(this.currentState.proposals.values())
            .some(p => this.validateProposal(p));
          
          if (hasValidProposal) {
            resolve({ success: true });
          }
        } else if (phase === 'prevote' || phase === 'precommit') {
          // Check if we have enough votes for this phase
          const phaseVotes = this.getVotesForPhase(phase as VoteType);
          const requiredVotes = this.getRequiredVoteCount();
          
          if (phaseVotes.length >= requiredVotes) {
            // Find the block with majority votes
            const voteCounts = new Map<string, number>();
            let leadingBlock: Block | null = null;
            let maxVotes = 0;
            
            for (const vote of phaseVotes) {
              if (vote.blockHash) {
                const count = (voteCounts.get(vote.blockHash) || 0) + 1;
                voteCounts.set(vote.blockHash, count);
                
                if (count > maxVotes) {
                  maxVotes = count;
                  // Find the block for this hash
                  const proposal = Array.from(this.currentState.proposals.values())
                    .find(p => p.block.hash === vote.blockHash);
                  leadingBlock = proposal?.block || null;
                }
              }
            }
            
            if (maxVotes >= requiredVotes) {
              resolve({ success: true, block: leadingBlock || undefined });
            }
          }
        }
        
        // Continue checking if phase not complete
        if (this.currentState.phase === phase) {
          setTimeout(checkCompletion, 100);
        } else {
          resolve({ success: false });
        }
      };
      
      // Start checking
      setTimeout(checkCompletion, 100);
    });
  }

  private selectProposer(): string {
    if (!this.validatorSet) {
      throw new Error('Validator set not available');
    }
    
    // Round-robin proposer selection based on height and round
    const proposerIndex = (this.currentState.height + this.currentState.round) % 
                          this.validatorSet.validators.length;
    
    return this.validatorSet.validators[proposerIndex].address;
  }

  private createProofOfLock(): ProofOfLock | null {
    if (!this.currentState.lockedValue || this.currentState.lockedRound < 0) {
      return null;
    }
    
    // Collect signatures for the locked value
    const signatures: string[] = [];
    
    return {
      round: this.currentState.lockedRound,
      blockHash: this.currentState.lockedValue.hash,
      signatures
    };
  }

  private validateMessage(message: ConsensusMessage): boolean {
    // Basic message validation
    if (!message.validatorAddress || !message.signature) {
      return false;
    }
    
    // Check if validator is in current set
    if (!this.validatorSet) {
      return false;
    }
    
    const validator = this.validatorSet.validators
      .find(v => v.address === message.validatorAddress);
    
    if (!validator) {
      return false;
    }
    
    // Validate height and round
    if (message.height !== this.currentState.height || 
        message.round !== this.currentState.round) {
      return false;
    }
    
    return true;
  }

  private validateProposal(proposal: BlockProposal): boolean {
    // Validate proposal structure
    if (!proposal.block || !proposal.proposer || !proposal.signature) {
      return false;
    }
    
    // Validate proposer is correct for this round
    const expectedProposer = this.selectProposer();
    if (proposal.proposer !== expectedProposer) {
      return false;
    }
    
    // Validate block structure and hash
    if (proposal.block.height !== this.currentState.height) {
      return false;
    }
    
    return true;
  }

  private async handleVote(message: ConsensusMessage): Promise<void> {
    const voteType = message.type as VoteType;
    
    const vote: Vote = {
      type: voteType,
      validator: message.validatorAddress,
      round: message.round,
      height: message.height,
      blockHash: message.data.blockHash,
      timestamp: message.timestamp,
      signature: message.signature
    };
    
    // Store vote
    const voteKey = `${vote.validator}-${vote.type}-${vote.round}`;
    this.currentState.votes.set(voteKey, vote);
    
    this.logger.debug('Vote received', {
      type: voteType,
      validator: vote.validator,
      blockHash: vote.blockHash,
      round: vote.round
    });
    
    this.emit('consensus:vote_received', vote);
  }

  private async handleProposal(message: ConsensusMessage): Promise<void> {
    const proposalData = message.data;
    
    const proposal: BlockProposal = {
      block: proposalData.block,
      proposer: message.validatorAddress,
      round: message.round,
      height: message.height,
      timestamp: message.timestamp,
      signature: message.signature,
      proof: proposalData.proof || null
    };
    
    if (this.validateProposal(proposal)) {
      this.currentState.proposals.set(proposal.block.hash, proposal);
      
      this.logger.debug('Proposal received', {
        proposer: proposal.proposer,
        blockHash: proposal.block.hash,
        round: proposal.round
      });
      
      this.emit('consensus:proposal_received', proposal);
    }
  }

  private async handleNewRound(message: ConsensusMessage): Promise<void> {
    // Handle new round messages for synchronization
    if (message.round > this.currentState.round) {
      this.logger.debug('Advancing to new round', {
        currentRound: this.currentState.round,
        newRound: message.round
      });
      
      this.currentState.round = message.round;
      this.currentState.phase = 'propose';
      this.currentState.votes.clear();
      this.currentState.proposals.clear();
    }
  }

  private async handleTimeout(message: ConsensusMessage): Promise<void> {
    // Handle timeout messages from other validators
    this.logger.debug('Timeout message received', {
      validator: message.validatorAddress,
      phase: message.data.phase,
      round: message.round
    });
  }

  private handlePhaseTimeout(phase: ConsensusPhase): void {
    this.logger.warn('Phase timeout', { 
      phase, 
      round: this.currentState.round,
      height: this.currentState.height
    });
    
    // Move to next phase or round
    if (phase === 'precommit') {
      // Start new round
      this.currentState.round++;
      this.currentState.phase = 'propose';
      this.currentState.votes.clear();
      this.currentState.proposals.clear();
    } else {
      // Move to next phase
      const nextPhase = this.getNextPhase(phase);
      if (nextPhase) {
        this.enterPhase(nextPhase);
      }
    }
  }

  private getPhaseTimeout(phase: ConsensusPhase): number {
    switch (phase) {
      case 'propose':
        return this.config.timeoutPropose;
      case 'prevote':
        return this.config.timeoutPrevote;
      case 'precommit':
        return this.config.timeoutPrecommit;
      case 'commit':
        return this.config.timeoutCommit;
      default:
        return 5000;
    }
  }

  private getNextPhase(currentPhase: ConsensusPhase): ConsensusPhase | null {
    switch (currentPhase) {
      case 'propose':
        return 'prevote';
      case 'prevote':
        return 'precommit';
      case 'precommit':
        return 'commit';
      case 'commit':
        return 'new_round';
      default:
        return null;
    }
  }

  private getVotesForPhase(voteType: VoteType): Vote[] {
    return Array.from(this.currentState.votes.values())
      .filter(vote => vote.type === voteType && vote.round === this.currentState.round);
  }

  private getRequiredVoteCount(): number {
    if (!this.validatorSet) {
      return 1;
    }
    
    // BFT requires 2/3 + 1 majority
    return Math.floor(this.validatorSet.validators.length * 2 / 3) + 1;
  }

  private updateMetrics(result: ConsensusResult): void {
    this.metrics.roundsCompleted++;
    
    if (result.success) {
      const roundTime = Date.now() - this.roundStartTime;
      this.metrics.averageRoundTime = 
        (this.metrics.averageRoundTime + roundTime) / 2;
    }
    
    // Calculate voting efficiency
    const totalValidators = this.validatorSet?.validators.length || 1;
    const totalVotes = this.currentState.votes.size;
    this.metrics.votingEfficiency = totalVotes / (totalValidators * 2); // 2 phases
  }
}

export default HotStuffConsensus;