/**
 * KodexService - CodaiChain Core Protocol & AI Economic Layer
 * The canonical rulebook and smart contract system for programmable money, AI automation, and trust layers
 */

interface KodexAgent {
  id: string;
  name: string;
  type: 'wallet' | 'trading' | 'governance' | 'compliance' | 'analytics' | 'social' | 'custom';
  owner: string;
  permissions: KodexPermission[];
  rules: KodexRule[];
  status: 'active' | 'suspended' | 'auditing' | 'draft';
  version: string;
  createdAt: Date;
  lastActive: Date;
  reputation: {
    score: number;
    level: 'untested' | 'basic' | 'trusted' | 'verified' | 'expert' | 'authority';
    completedActions: number;
    successRate: number;
    auditHistory: AuditRecord[];
  };
  constraints: {
    maxTransactionAmount?: number;
    allowedCurrencies?: string[];
    timeRestrictions?: TimeRestriction[];
    geographicLimits?: string[];
    requiresApproval?: boolean;
  };
  metadata?: Record<string, any>;
}

interface KodexPermission {
  id: string;
  scope: 'wallet.transfer' | 'wallet.receive' | 'exchange.trade' | 'governance.vote' | 'data.read' | 'data.write' | 'agent.create' | 'agent.manage';
  resource: string; // wallet address, contract, or wildcard
  conditions?: string[]; // conditional logic
  expiresAt?: Date;
  grantedBy: string;
  grantedAt: Date;
}

interface KodexRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    event: string; // 'salary_received', 'balance_threshold', 'time_based', 'price_change', etc.
    conditions: Record<string, any>;
  };
  actions: KodexAction[];
  priority: number;
  active: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  executionCount: number;
}

interface KodexAction {
  type: 'transfer' | 'swap' | 'save' | 'invest' | 'notify' | 'pause' | 'escalate';
  params: Record<string, any>;
  maxAmount?: number;
  confirmationRequired?: boolean;
}

interface TimeRestriction {
  type: 'hours' | 'days' | 'blackout_dates';
  rules: string[]; // e.g., ["9-17", "Mon-Fri", "not 2024-12-25"]
}

interface AuditRecord {
  id: string;
  auditorId: string;
  type: 'security' | 'performance' | 'compliance' | 'behavior';
  result: 'passed' | 'failed' | 'warning' | 'pending';
  findings: string[];
  recommendations: string[];
  score: number;
  timestamp: Date;
}

interface KodexTransaction {
  id: string;
  agentId: string;
  type: 'automated' | 'manual' | 'triggered';
  operation: string;
  amount?: number;
  currency?: string;
  fromAddress?: string;
  toAddress?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  blockHash?: string;
  gasUsed?: number;
  executedAt: Date;
  ruleId?: string; // if triggered by automation
  approvedBy?: string; // if manual approval required
  metadata?: Record<string, any>;
}

interface KodexProtocolSettings {
  version: string;
  chainId: number;
  nativeToken: string;
  governance: {
    votingPeriod: number; // blocks
    quorumThreshold: number; // percentage
    proposalThreshold: number; // tokens required
    timelock: number; // seconds
  };
  security: {
    maxDailyTransactionAmount: number;
    emergencyPauseEnabled: boolean;
    multiSigRequired: boolean;
    auditFrequency: number; // days
  };
  economics: {
    transactionFee: number; // basis points
    agentRegistrationFee: number;
    reputationDecayRate: number;
    stakingRewards: number;
  };
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  type: 'parameter_change' | 'agent_upgrade' | 'security_update' | 'feature_addition' | 'emergency';
  status: 'draft' | 'voting' | 'passed' | 'rejected' | 'executed' | 'cancelled';
  votingStartBlock: number;
  votingEndBlock: number;
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  quorumReached: boolean;
  executionETA?: Date;
  proposalData?: any;
  createdAt: Date;
}

interface KodexMetrics {
  protocol: {
    totalAgents: number;
    activeAgents: number;
    totalTransactions: number;
    totalValueLocked: number;
    averageGasPrice: number;
    networkUtilization: number;
  };
  governance: {
    activeProposals: number;
    voterParticipation: number;
    averageVotingTime: number;
    proposalSuccessRate: number;
  };
  security: {
    auditScore: number;
    securityIncidents: number;
    emergencyPauses: number;
    fraudDetected: number;
  };
  economics: {
    totalFees: number;
    revenueDistribution: Record<string, number>;
    stakingParticipation: number;
    tokenPrice?: number;
  };
}

function generateKodexId(): string {
  return 'kodex_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function generateTransactionHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class KodexService {
  private static instance: KodexService;
  private agents: Map<string, KodexAgent> = new Map();
  private transactions: Map<string, KodexTransaction> = new Map();
  private proposals: Map<string, GovernanceProposal> = new Map();
  private protocolSettings: KodexProtocolSettings;

  static getInstance(): KodexService {
    if (!KodexService.instance) {
      KodexService.instance = new KodexService();
    }
    return KodexService.instance;
  }

  constructor() {
    this.protocolSettings = this.getDefaultProtocolSettings();
    this.initializeMockData();
  }

  private getDefaultProtocolSettings(): KodexProtocolSettings {
    return {
      version: '1.0.0',
      chainId: 2024, // CodaiChain ID
      nativeToken: 'KODEX',
      governance: {
        votingPeriod: 17280, // ~3 days at 15s blocks
        quorumThreshold: 10, // 10% participation required
        proposalThreshold: 100000, // 100k KODEX tokens
        timelock: 86400 // 24 hours
      },
      security: {
        maxDailyTransactionAmount: 1000000, // 1M KODEX
        emergencyPauseEnabled: true,
        multiSigRequired: true,
        auditFrequency: 30 // monthly
      },
      economics: {
        transactionFee: 25, // 0.25%
        agentRegistrationFee: 100, // 100 KODEX
        reputationDecayRate: 1, // 1% per month
        stakingRewards: 500 // 5% APY
      }
    };
  }

  private initializeMockData(): void {
    // Create sample agents
    const sampleAgents: Partial<KodexAgent>[] = [
      {
        id: 'agent-wallet-001',
        name: 'Personal Finance Manager',
        type: 'wallet',
        owner: 'user-001',
        status: 'active',
        version: '2.1.0',
        reputation: {
          score: 95,
          level: 'expert',
          completedActions: 1247,
          successRate: 98.4,
          auditHistory: []
        },
        constraints: {
          maxTransactionAmount: 50000,
          allowedCurrencies: ['KODEX', 'ETH', 'BTC', 'USDC'],
          requiresApproval: false
        }
      },
      {
        id: 'agent-trading-002',
        name: 'Algorithmic Trading Bot',
        type: 'trading',
        owner: 'user-002',
        status: 'active',
        version: '1.8.3',
        reputation: {
          score: 87,
          level: 'trusted',
          completedActions: 3456,
          successRate: 89.2,
          auditHistory: []
        },
        constraints: {
          maxTransactionAmount: 100000,
          allowedCurrencies: ['KODEX', 'ETH', 'BTC'],
          timeRestrictions: [{
            type: 'hours',
            rules: ['9-17'] // Trading hours only
          }],
          requiresApproval: true
        }
      },
      {
        id: 'agent-governance-003',
        name: 'DAO Participation Agent',
        type: 'governance',
        owner: 'user-003',
        status: 'active',
        version: '1.2.1',
        reputation: {
          score: 78,
          level: 'verified',
          completedActions: 89,
          successRate: 94.4,
          auditHistory: []
        }
      }
    ];

    sampleAgents.forEach(agentData => {
      const agent = this.createCompleteAgent(agentData);
      this.agents.set(agent.id, agent);
    });

    // Create sample governance proposals
    const sampleProposals: Partial<GovernanceProposal>[] = [
      {
        id: 'prop-001',
        title: 'Increase Transaction Fee to 0.30%',
        description: 'Proposal to increase the protocol transaction fee from 0.25% to 0.30% to fund additional security audits and infrastructure improvements.',
        proposer: 'council-001',
        type: 'parameter_change',
        status: 'voting',
        votes: { for: 250000, against: 180000, abstain: 20000 },
        quorumReached: true
      },
      {
        id: 'prop-002',
        title: 'Enable Cross-Chain Bridge Module',
        description: 'Add support for Ethereum and Polygon bridge functionality to allow seamless asset transfers.',
        proposer: 'developer-dao',
        type: 'feature_addition',
        status: 'draft'
      }
    ];

    sampleProposals.forEach(proposalData => {
      const proposal = this.createCompleteProposal(proposalData);
      this.proposals.set(proposal.id, proposal);
    });
  }

  private createCompleteAgent(agentData: Partial<KodexAgent>): KodexAgent {
    const now = new Date();

    return {
      id: agentData.id || generateKodexId(),
      name: agentData.name || 'Unnamed Agent',
      type: agentData.type || 'custom',
      owner: agentData.owner || 'unknown',
      permissions: agentData.permissions || [],
      rules: agentData.rules || [],
      status: agentData.status || 'draft',
      version: agentData.version || '1.0.0',
      createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      lastActive: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      reputation: agentData.reputation || {
        score: 50,
        level: 'untested',
        completedActions: 0,
        successRate: 0,
        auditHistory: []
      },
      constraints: agentData.constraints || {},
      metadata: agentData.metadata || {}
    };
  }

  private createCompleteProposal(proposalData: Partial<GovernanceProposal>): GovernanceProposal {
    const now = new Date();
    const currentBlock = 1000000; // Mock current block

    return {
      id: proposalData.id || generateKodexId(),
      title: proposalData.title || 'Untitled Proposal',
      description: proposalData.description || '',
      proposer: proposalData.proposer || 'unknown',
      type: proposalData.type || 'parameter_change',
      status: proposalData.status || 'draft',
      votingStartBlock: currentBlock,
      votingEndBlock: currentBlock + this.protocolSettings.governance.votingPeriod,
      votes: proposalData.votes || { for: 0, against: 0, abstain: 0 },
      quorumReached: proposalData.quorumReached || false,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    };
  }

  // Agent Management
  async registerAgent(agentData: {
    name: string;
    type: KodexAgent['type'];
    owner: string;
    permissions: KodexPermission[];
    rules?: KodexRule[];
    constraints?: KodexAgent['constraints'];
  }): Promise<KodexAgent> {
    const agent = this.createCompleteAgent({
      ...agentData,
      status: 'draft' // New agents start in draft
    });

    this.agents.set(agent.id, agent);

    // Create registration transaction
    await this.createTransaction({
      agentId: agent.id,
      type: 'manual',
      operation: 'agent_registration',
      amount: this.protocolSettings.economics.agentRegistrationFee,
      currency: 'KODEX'
    });

    return agent;
  }

  async updateAgent(
    agentId: string,
    updates: Partial<KodexAgent>
  ): Promise<KodexAgent | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const updatedAgent = { ...agent, ...updates };
    this.agents.set(agentId, updatedAgent);

    return updatedAgent;
  }

  async activateAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    // Security check
    if (agent.reputation.score < 60) {
      throw new Error('Agent reputation too low for activation');
    }

    agent.status = 'active';
    agent.lastActive = new Date();
    this.agents.set(agentId, agent);

    return true;
  }

  async suspendAgent(agentId: string, reason: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.status = 'suspended';
    agent.metadata = { ...agent.metadata, suspensionReason: reason };
    this.agents.set(agentId, agent);

    return true;
  }

  // Rule Engine
  async addRule(agentId: string, rule: Omit<KodexRule, 'id' | 'createdAt' | 'executionCount'>): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    const newRule: KodexRule = {
      ...rule,
      id: generateKodexId(),
      createdAt: new Date(),
      executionCount: 0
    };

    agent.rules.push(newRule);
    this.agents.set(agentId, agent);

    return newRule.id;
  }

  async executeRule(agentId: string, ruleId: string, context: Record<string, any>): Promise<KodexTransaction[]> {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'active') {
      throw new Error('Agent not found or inactive');
    }

    const rule = agent.rules.find(r => r.id === ruleId && r.active);
    if (!rule) throw new Error('Rule not found or inactive');

    const transactions: KodexTransaction[] = [];

    // Execute each action in the rule
    for (const action of rule.actions) {
      const transaction = await this.executeAction(agent, action, context);
      transactions.push(transaction);
    }

    // Update rule execution count
    rule.executionCount++;
    rule.lastTriggered = new Date();
    this.agents.set(agentId, agent);

    return transactions;
  }

  private async executeAction(
    agent: KodexAgent,
    action: KodexAction,
    context: Record<string, any>
  ): Promise<KodexTransaction> {
    // Validate permissions
    const hasPermission = this.validatePermission(agent, action.type, context);
    if (!hasPermission) {
      throw new Error(`Agent ${agent.id} lacks permission for action ${action.type}`);
    }

    // Create and execute transaction
    const transaction = await this.createTransaction({
      agentId: agent.id,
      type: 'automated',
      operation: action.type,
      amount: action.params.amount,
      currency: action.params.currency,
      fromAddress: action.params.from,
      toAddress: action.params.to,
      metadata: { action: action.type, context }
    });

    return transaction;
  }

  private validatePermission(agent: KodexAgent, actionType: string, context: Record<string, any>): boolean {
    // Check if agent has required permission
    const requiredScope = this.mapActionToPermission(actionType);
    const hasPermission = agent.permissions.some(p =>
      p.scope === requiredScope &&
      (!p.expiresAt || p.expiresAt > new Date())
    );

    if (!hasPermission) return false;

    // Check constraints
    if (agent.constraints.maxTransactionAmount &&
      context.amount > agent.constraints.maxTransactionAmount) {
      return false;
    }

    if (agent.constraints.allowedCurrencies &&
      !agent.constraints.allowedCurrencies.includes(context.currency)) {
      return false;
    }

    return true;
  }

  private mapActionToPermission(actionType: string): string {
    const mapping: Record<string, string> = {
      'transfer': 'wallet.transfer',
      'swap': 'exchange.trade',
      'save': 'wallet.transfer',
      'invest': 'exchange.trade'
    };
    return mapping[actionType] || 'data.read';
  }

  // Transaction Management
  async createTransaction(data: {
    agentId: string;
    type: 'automated' | 'manual' | 'triggered';
    operation: string;
    amount?: number;
    currency?: string;
    fromAddress?: string;
    toAddress?: string;
    ruleId?: string;
    approvedBy?: string;
    metadata?: Record<string, any>;
  }): Promise<KodexTransaction> {
    const transaction: KodexTransaction = {
      id: generateKodexId(),
      ...data,
      status: 'pending',
      executedAt: new Date()
    };

    // Simulate blockchain execution
    await new Promise(resolve => setTimeout(resolve, 500));

    transaction.status = 'confirmed';
    transaction.blockHash = generateTransactionHash();
    transaction.gasUsed = Math.floor(Math.random() * 50000) + 21000;

    this.transactions.set(transaction.id, transaction);

    // Update agent reputation
    await this.updateAgentReputation(data.agentId, true);

    return transaction;
  }

  async getTransactionHistory(
    agentId?: string,
    limit: number = 50
  ): Promise<KodexTransaction[]> {
    let transactions = Array.from(this.transactions.values());

    if (agentId) {
      transactions = transactions.filter(t => t.agentId === agentId);
    }

    return transactions
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  // Governance
  async createProposal(proposalData: {
    title: string;
    description: string;
    proposer: string;
    type: GovernanceProposal['type'];
    proposalData?: any;
  }): Promise<GovernanceProposal> {
    const proposal = this.createCompleteProposal(proposalData);
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async voteOnProposal(
    proposalId: string,
    voter: string,
    vote: 'for' | 'against' | 'abstain',
    tokenAmount: number
  ): Promise<boolean> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'voting') return false;

    // Add vote
    proposal.votes[vote] += tokenAmount;

    // Check if quorum reached
    const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
    const quorumRequired = 1000000; // Mock total supply * quorum threshold
    proposal.quorumReached = totalVotes >= quorumRequired;

    this.proposals.set(proposalId, proposal);
    return true;
  }

  async executeProposal(proposalId: string): Promise<boolean> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || !proposal.quorumReached) return false;

    const passed = proposal.votes.for > proposal.votes.against;
    proposal.status = passed ? 'executed' : 'rejected';

    if (passed && proposal.proposalData) {
      // Apply proposal changes to protocol settings
      await this.applyProposalChanges(proposal);
    }

    this.proposals.set(proposalId, proposal);
    return passed;
  }

  private async applyProposalChanges(proposal: GovernanceProposal): Promise<void> {
    if (proposal.type === 'parameter_change' && proposal.proposalData) {
      // Update protocol settings
      this.protocolSettings = {
        ...this.protocolSettings,
        ...proposal.proposalData
      };
    }
  }

  // Analytics and Reputation
  async updateAgentReputation(agentId: string, success: boolean): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.reputation.completedActions++;

    if (success) {
      agent.reputation.score = Math.min(100, agent.reputation.score + 0.1);
    } else {
      agent.reputation.score = Math.max(0, agent.reputation.score - 1);
    }

    // Recalculate success rate
    const recentTransactions = await this.getTransactionHistory(agentId, 100);
    const successfulTxs = recentTransactions.filter(t => t.status === 'confirmed').length;
    agent.reputation.successRate = (successfulTxs / recentTransactions.length) * 100;

    // Update reputation level
    agent.reputation.level = this.calculateReputationLevel(agent.reputation.score);

    this.agents.set(agentId, agent);
  }

  private calculateReputationLevel(score: number): KodexAgent['reputation']['level'] {
    if (score >= 95) return 'authority';
    if (score >= 85) return 'expert';
    if (score >= 75) return 'verified';
    if (score >= 60) return 'trusted';
    if (score >= 40) return 'basic';
    return 'untested';
  }

  async auditAgent(agentId: string, auditorId: string): Promise<AuditRecord> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 1000));

    const auditRecord: AuditRecord = {
      id: generateKodexId(),
      auditorId,
      type: 'security',
      result: agent.reputation.score > 80 ? 'passed' : 'warning',
      findings: this.generateAuditFindings(agent),
      recommendations: this.generateAuditRecommendations(agent),
      score: Math.min(100, agent.reputation.score + Math.random() * 10 - 5),
      timestamp: new Date()
    };

    agent.reputation.auditHistory.push(auditRecord);
    this.agents.set(agentId, agent);

    return auditRecord;
  }

  private generateAuditFindings(agent: KodexAgent): string[] {
    const findings: string[] = [];

    if (agent.reputation.score < 70) {
      findings.push('Low reputation score detected');
    }

    if (agent.permissions.length > 10) {
      findings.push('High number of permissions - review necessity');
    }

    if (!agent.constraints.maxTransactionAmount) {
      findings.push('No transaction amount limits set');
    }

    return findings;
  }

  private generateAuditRecommendations(agent: KodexAgent): string[] {
    const recommendations: string[] = [];

    if (agent.reputation.score < 80) {
      recommendations.push('Implement additional monitoring for low-reputation agent');
    }

    if (!agent.constraints.requiresApproval) {
      recommendations.push('Consider requiring manual approval for high-value transactions');
    }

    recommendations.push('Regular security reviews recommended');

    return recommendations;
  }

  // Metrics and Analytics
  async getKodexMetrics(): Promise<KodexMetrics> {
    const agents = Array.from(this.agents.values());
    const transactions = Array.from(this.transactions.values());
    const proposals = Array.from(this.proposals.values());

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => t.executedAt > last24Hours);

    return {
      protocol: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        totalTransactions: transactions.length,
        totalValueLocked: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        averageGasPrice: recentTransactions.reduce((sum, t) => sum + (t.gasUsed || 0), 0) / Math.max(1, recentTransactions.length),
        networkUtilization: Math.min(100, (recentTransactions.length / 1000) * 100)
      },
      governance: {
        activeProposals: proposals.filter(p => p.status === 'voting').length,
        voterParticipation: 65, // Mock percentage
        averageVotingTime: 2.5, // Mock days
        proposalSuccessRate: 78 // Mock percentage
      },
      security: {
        auditScore: agents.reduce((sum, a) => sum + a.reputation.score, 0) / Math.max(1, agents.length),
        securityIncidents: 0,
        emergencyPauses: 0,
        fraudDetected: transactions.filter(t => t.status === 'failed').length
      },
      economics: {
        totalFees: transactions.reduce((sum, t) => sum + ((t.amount || 0) * 0.0025), 0),
        revenueDistribution: {
          'security_fund': 40,
          'development_fund': 30,
          'community_rewards': 20,
          'operations': 10
        },
        stakingParticipation: 45, // Mock percentage
        tokenPrice: 2.45 // Mock price in USD
      }
    };
  }

  // Public API for frontend
  async getAgentsByOwner(owner: string): Promise<KodexAgent[]> {
    return Array.from(this.agents.values()).filter(a => a.owner === owner);
  }

  async getAgentDetails(agentId: string): Promise<KodexAgent | null> {
    return this.agents.get(agentId) || null;
  }

  async getActiveProposals(): Promise<GovernanceProposal[]> {
    return Array.from(this.proposals.values()).filter(p => p.status === 'voting');
  }

  async getProtocolSettings(): Promise<KodexProtocolSettings> {
    return { ...this.protocolSettings };
  }

  async searchAgents(query: {
    type?: KodexAgent['type'];
    status?: KodexAgent['status'];
    minReputation?: number;
    owner?: string;
  }): Promise<KodexAgent[]> {
    let agents = Array.from(this.agents.values());

    if (query.type) {
      agents = agents.filter(a => a.type === query.type);
    }

    if (query.status) {
      agents = agents.filter(a => a.status === query.status);
    }

    if (query.minReputation !== undefined) {
      agents = agents.filter(a => a.reputation.score >= query.minReputation);
    }

    if (query.owner) {
      agents = agents.filter(a => a.owner === query.owner);
    }

    return agents;
  }

  // Emergency functions
  async emergencyPause(): Promise<boolean> {
    if (!this.protocolSettings.security.emergencyPauseEnabled) return false;

    // Pause all agent activities
    this.agents.forEach(agent => {
      if (agent.status === 'active') {
        agent.status = 'suspended';
        agent.metadata = { ...agent.metadata, emergencyPause: true };
      }
    });

    return true;
  }

  async emergencyResume(): Promise<boolean> {
    // Resume all emergency-paused agents
    this.agents.forEach(agent => {
      if (agent.metadata?.emergencyPause) {
        agent.status = 'active';
        delete agent.metadata.emergencyPause;
      }
    });

    return true;
  }
}
