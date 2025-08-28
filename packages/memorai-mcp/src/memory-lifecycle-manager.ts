/**
 * MemorAI Memory Lifecycle Manager
 * 
 * Comprehensive memory lifecycle management system with automated TTL,
 * archiving strategies, cleanup policies, retention rules, and compliance.
 * 
 * Features:
 * - Time-To-Live (TTL) management with flexible policies
 * - Intelligent archiving strategies based on usage patterns
 * - Automated cleanup policies with safety mechanisms
 * - Configurable retention rules for different memory types
 * - Compliance automation for data governance
 * - Lifecycle events and audit trails
 * - Performance-optimized batch processing
 * - Multi-tenant lifecycle isolation
 * 
 * @version 1.0.0
 * @author MemorAI Development Team
 */

export interface MemoryLifecyclePolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher priority = executes first
  conditions: LifecycleCondition[];
  actions: LifecycleAction[];
  schedule?: ScheduleConfig;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LifecycleCondition {
  type: 'age' | 'usage' | 'importance' | 'size' | 'custom';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'in' | 'regex';
  value: any;
  field?: string; // For custom conditions
}

export interface LifecycleAction {
  type: 'delete' | 'archive' | 'compress' | 'migrate' | 'tag' | 'notify' | 'custom';
  config: Record<string, any>;
  dryRun?: boolean;
}

export interface ScheduleConfig {
  type: 'interval' | 'cron' | 'event';
  value: string | number;
  timezone?: string;
}

export interface ArchiveStrategy {
  id: string;
  name: string;
  storage: 'cold' | 'glacier' | 'local' | 'cloud';
  compression: 'none' | 'gzip' | 'lz4' | 'zstd';
  encryption: boolean;
  metadata: {
    retentionPeriod: number; // in days
    accessPattern: 'rare' | 'occasional' | 'frequent';
    costTier: 'low' | 'medium' | 'high';
  };
}

export interface RetentionRule {
  id: string;
  name: string;
  entityType?: string;
  importance?: number;
  project?: string;
  retentionDays: number;
  archiveDays?: number; // Archive before deletion
  complianceTag?: string;
  exemptions?: string[]; // Memory IDs exempt from rule
}

export interface LifecycleEvent {
  id: string;
  type: 'policy_applied' | 'memory_archived' | 'memory_deleted' | 'policy_created' | 'retention_applied';
  memoryId?: string;
  policyId?: string;
  agentId: string;
  timestamp: Date;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  error?: string;
}

export interface LifecycleStats {
  totalMemories: number;
  archivedMemories: number;
  deletedMemories: number;
  compressedMemories: number;
  activePolicies: number;
  storageByTier: Record<string, number>;
  lifecycleEvents: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
}

export interface BatchOperation {
  id: string;
  type: 'cleanup' | 'archive' | 'compress' | 'migrate';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  results?: Record<string, any>;
}

/**
 * Advanced Memory Lifecycle Manager
 * 
 * Manages the complete lifecycle of memories from creation to deletion,
 * with intelligent policies, archiving strategies, and compliance automation.
 */
export class MemoryLifecycleManager {
  private policies: Map<string, MemoryLifecyclePolicy> = new Map();
  private archiveStrategies: Map<string, ArchiveStrategy> = new Map();
  private retentionRules: Map<string, RetentionRule> = new Map();
  private lifecycleEvents: LifecycleEvent[] = [];
  private batchOperations: Map<string, BatchOperation> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private memoryStore: any, // Reference to enhanced memory store
    private config: {
      enableScheduler?: boolean;
      batchSize?: number;
      maxConcurrentOperations?: number;
      auditRetentionDays?: number;
      defaultArchiveStrategy?: string;
      complianceMode?: 'strict' | 'moderate' | 'lenient';
    } = {}
  ) {
    this.config = {
      enableScheduler: true,
      batchSize: 1000,
      maxConcurrentOperations: 5,
      auditRetentionDays: 365,
      defaultArchiveStrategy: 'standard',
      complianceMode: 'moderate',
      ...config
    };

    this.initializeDefaultPolicies();
    this.initializeDefaultArchiveStrategies();
    this.initializeDefaultRetentionRules();

    if (this.config.enableScheduler) {
      this.startScheduler();
    }
  }

  /**
   * Create a new lifecycle policy
   */
  async createPolicy(policy: Omit<MemoryLifecyclePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const fullPolicy: MemoryLifecyclePolicy = {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...policy
    };

    // Validate policy
    this.validatePolicy(fullPolicy);

    this.policies.set(id, fullPolicy);

    // Schedule if needed
    if (fullPolicy.enabled && fullPolicy.schedule) {
      this.schedulePolicy(fullPolicy);
    }

    // Log event
    await this.logEvent({
      type: 'policy_created',
      policyId: id,
      agentId: 'system',
      details: { policy: fullPolicy },
      result: 'success'
    });

    return id;
  }

  /**
   * Update an existing lifecycle policy
   */
  async updatePolicy(id: string, updates: Partial<MemoryLifecyclePolicy>): Promise<void> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy ${id} not found`);
    }

    const updatedPolicy = {
      ...policy,
      ...updates,
      updatedAt: new Date()
    };

    this.validatePolicy(updatedPolicy);
    this.policies.set(id, updatedPolicy);

    // Reschedule if needed
    this.unschedulePolicy(id);
    if (updatedPolicy.enabled && updatedPolicy.schedule) {
      this.schedulePolicy(updatedPolicy);
    }
  }

  /**
   * Delete a lifecycle policy
   */
  async deletePolicy(id: string): Promise<void> {
    if (!this.policies.has(id)) {
      throw new Error(`Policy ${id} not found`);
    }

    this.policies.delete(id);
    this.unschedulePolicy(id);
  }

  /**
   * Get all lifecycle policies
   */
  getPolicies(): MemoryLifecyclePolicy[] {
    return Array.from(this.policies.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Apply lifecycle policies to memories
   */
  async applyPolicies(agentId: string, dryRun: boolean = false): Promise<{
    processed: number;
    archived: number;
    deleted: number;
    errors: Array<{ memoryId: string; error: string }>;
  }> {
    const results = {
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [] as Array<{ memoryId: string; error: string }>
    };

    // Get memories for agent
    const memories = await this.memoryStore.getAllMemories(agentId);

    // Sort policies by priority
    const activePolicies = this.getPolicies().filter(p => p.enabled);

    for (const memory of memories) {
      try {
        results.processed++;

        for (const policy of activePolicies) {
          if (await this.evaluateConditions(memory, policy.conditions)) {
            const actionResults = await this.executeActions(memory, policy.actions, dryRun);

            if (actionResults.archived) results.archived++;
            if (actionResults.deleted) results.deleted++;

            // Log policy application
            if (!dryRun) {
              await this.logEvent({
                type: 'policy_applied',
                memoryId: memory.id,
                policyId: policy.id,
                agentId: memory.agentId,
                details: { actions: actionResults },
                result: actionResults.success ? 'success' : 'failure',
                error: actionResults.error
              });
            }

            // Stop at first matching policy (unless configured otherwise)
            break;
          }
        }
      } catch (error) {
        results.errors.push({
          memoryId: memory.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * Create archive strategy
   */
  createArchiveStrategy(strategy: ArchiveStrategy): void {
    this.validateArchiveStrategy(strategy);
    this.archiveStrategies.set(strategy.id, strategy);
  }

  /**
   * Archive memory using specified strategy
   */
  async archiveMemory(
    memoryId: string,
    strategyId: string = this.config.defaultArchiveStrategy || 'standard'
  ): Promise<void> {
    const strategy = this.archiveStrategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Archive strategy ${strategyId} not found`);
    }

    const memory = await this.memoryStore.getMemory(memoryId);
    if (!memory) {
      throw new Error(`Memory ${memoryId} not found`);
    }

    // Create archived version
    const archivedMemory = {
      ...memory,
      archived: true,
      archivedAt: new Date(),
      archiveStrategy: strategyId,
      originalSize: JSON.stringify(memory).length
    };

    // Apply compression if specified
    if (strategy.compression !== 'none') {
      archivedMemory.content = await this.compressContent(memory.content, strategy.compression);
      archivedMemory.compressed = true;
    }

    // Apply encryption if specified
    if (strategy.encryption) {
      archivedMemory.content = await this.encryptContent(archivedMemory.content);
      archivedMemory.encrypted = true;
    }

    // Store in appropriate storage tier
    await this.storeInArchiveTier(archivedMemory, strategy.storage);

    // Update original memory with archive reference
    await this.memoryStore.updateMemory(memoryId, {
      archived: true,
      archivedAt: new Date(),
      archiveReference: this.generateArchiveReference(memoryId, strategy)
    });

    // Log archive event
    await this.logEvent({
      type: 'memory_archived',
      memoryId,
      agentId: memory.agentId,
      details: { strategy: strategyId, size: archivedMemory.originalSize },
      result: 'success'
    });
  }

  /**
   * Create retention rule
   */
  createRetentionRule(rule: RetentionRule): void {
    this.validateRetentionRule(rule);
    this.retentionRules.set(rule.id, rule);
  }

  /**
   * Apply retention rules
   */
  async applyRetentionRules(agentId: string): Promise<{
    processed: number;
    retained: number;
    archived: number;
    deleted: number;
  }> {
    const results = {
      processed: 0,
      retained: 0,
      archived: 0,
      deleted: 0
    };

    const memories = await this.memoryStore.getAllMemories(agentId);
    const rules = Array.from(this.retentionRules.values());

    for (const memory of memories) {
      results.processed++;

      // Find applicable rule
      const rule = this.findApplicableRetentionRule(memory, rules);
      if (!rule) {
        results.retained++;
        continue;
      }

      // Check if memory is exempt
      if (rule.exemptions?.includes(memory.id)) {
        results.retained++;
        continue;
      }

      const age = Date.now() - new Date(memory.timestamp).getTime();
      const ageDays = age / (1000 * 60 * 60 * 24);

      if (ageDays > rule.retentionDays) {
        // Delete memory
        await this.memoryStore.deleteMemory(memory.id);
        results.deleted++;

        await this.logEvent({
          type: 'retention_applied',
          memoryId: memory.id,
          agentId: memory.agentId,
          details: { rule: rule.id, action: 'delete', ageDays },
          result: 'success'
        });
      } else if (rule.archiveDays && ageDays > rule.archiveDays) {
        // Archive memory
        await this.archiveMemory(memory.id);
        results.archived++;

        await this.logEvent({
          type: 'retention_applied',
          memoryId: memory.id,
          agentId: memory.agentId,
          details: { rule: rule.id, action: 'archive', ageDays },
          result: 'success'
        });
      } else {
        results.retained++;
      }
    }

    return results;
  }

  /**
   * Start batch cleanup operation
   */
  async startBatchCleanup(
    agentId: string,
    options: {
      maxAge?: number; // days
      minImportance?: number;
      entityTypes?: string[];
      dryRun?: boolean;
    } = {}
  ): Promise<string> {
    const operationId = this.generateId();
    const operation: BatchOperation = {
      id: operationId,
      type: 'cleanup',
      status: 'pending',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      startTime: new Date()
    };

    this.batchOperations.set(operationId, operation);

    // Start async operation
    this.executeBatchCleanup(operationId, agentId, options).catch(error => {
      operation.status = 'failed';
      operation.error = error.message;
      operation.endTime = new Date();
    });

    return operationId;
  }

  /**
   * Get batch operation status
   */
  getBatchOperationStatus(operationId: string): BatchOperation | undefined {
    return this.batchOperations.get(operationId);
  }

  /**
   * Get lifecycle statistics
   */
  async getLifecycleStats(agentId: string): Promise<LifecycleStats> {
    const memories = await this.memoryStore.getAllMemories(agentId);
    const events = this.lifecycleEvents.filter(e => e.agentId === agentId);

    const stats: LifecycleStats = {
      totalMemories: memories.length,
      archivedMemories: memories.filter(m => m.archived).length,
      deletedMemories: events.filter(e => e.type === 'memory_deleted').length,
      compressedMemories: memories.filter(m => m.compressed).length,
      activePolicies: this.getPolicies().filter(p => p.enabled).length,
      storageByTier: {},
      lifecycleEvents: events.length,
      complianceStatus: await this.checkComplianceStatus(agentId)
    };

    // Calculate storage by tier
    for (const memory of memories) {
      if (memory.archived && memory.archiveStrategy) {
        const strategy = this.archiveStrategies.get(memory.archiveStrategy);
        if (strategy) {
          const tier = strategy.storage;
          stats.storageByTier[tier] = (stats.storageByTier[tier] || 0) + 1;
        }
      } else {
        stats.storageByTier['active'] = (stats.storageByTier['active'] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Get lifecycle events
   */
  getLifecycleEvents(
    agentId?: string,
    limit: number = 100,
    offset: number = 0
  ): LifecycleEvent[] {
    let events = this.lifecycleEvents;

    if (agentId) {
      events = events.filter(e => e.agentId === agentId);
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  // Private helper methods

  private initializeDefaultPolicies(): void {
    // Default policy for old, low-importance memories
    this.createPolicy({
      name: 'Archive Old Low-Importance Memories',
      description: 'Archive memories older than 90 days with importance < 3',
      enabled: true,
      priority: 100,
      conditions: [
        { type: 'age', operator: 'gt', value: 90 },
        { type: 'importance', operator: 'lt', value: 3 }
      ],
      actions: [
        { type: 'archive', config: { strategy: 'standard' } }
      ],
      schedule: {
        type: 'cron',
        value: '0 2 * * 0' // Weekly on Sunday at 2 AM
      }
    });

    // Default policy for very old memories
    this.createPolicy({
      name: 'Delete Very Old Memories',
      description: 'Delete memories older than 2 years',
      enabled: false, // Disabled by default for safety
      priority: 200,
      conditions: [
        { type: 'age', operator: 'gt', value: 730 }
      ],
      actions: [
        { type: 'delete', config: {} }
      ],
      schedule: {
        type: 'cron',
        value: '0 3 1 * *' // Monthly on 1st at 3 AM
      }
    });
  }

  private initializeDefaultArchiveStrategies(): void {
    this.createArchiveStrategy({
      id: 'standard',
      name: 'Standard Archive',
      storage: 'cold',
      compression: 'gzip',
      encryption: true,
      metadata: {
        retentionPeriod: 2555, // ~7 years
        accessPattern: 'rare',
        costTier: 'low'
      }
    });

    this.createArchiveStrategy({
      id: 'quick-access',
      name: 'Quick Access Archive',
      storage: 'local',
      compression: 'lz4',
      encryption: true,
      metadata: {
        retentionPeriod: 365,
        accessPattern: 'occasional',
        costTier: 'medium'
      }
    });
  }

  private initializeDefaultRetentionRules(): void {
    this.createRetentionRule({
      id: 'default',
      name: 'Default Retention',
      retentionDays: 2555, // ~7 years
      archiveDays: 90
    });

    this.createRetentionRule({
      id: 'high-importance',
      name: 'High Importance Retention',
      importance: 8,
      retentionDays: 3650, // 10 years
      archiveDays: 365
    });

    this.createRetentionRule({
      id: 'temporary',
      name: 'Temporary Data',
      entityType: 'temporary',
      retentionDays: 7
    });
  }

  private validatePolicy(policy: MemoryLifecyclePolicy): void {
    if (!policy.name || !policy.conditions || !policy.actions) {
      throw new Error('Policy must have name, conditions, and actions');
    }

    if (policy.conditions.length === 0) {
      throw new Error('Policy must have at least one condition');
    }

    if (policy.actions.length === 0) {
      throw new Error('Policy must have at least one action');
    }
  }

  private validateArchiveStrategy(strategy: ArchiveStrategy): void {
    const validStorageTypes = ['cold', 'glacier', 'local', 'cloud'];
    const validCompressionTypes = ['none', 'gzip', 'lz4', 'zstd'];

    if (!validStorageTypes.includes(strategy.storage)) {
      throw new Error(`Invalid storage type: ${strategy.storage}`);
    }

    if (!validCompressionTypes.includes(strategy.compression)) {
      throw new Error(`Invalid compression type: ${strategy.compression}`);
    }
  }

  private validateRetentionRule(rule: RetentionRule): void {
    if (rule.retentionDays < 0) {
      throw new Error('Retention days must be non-negative');
    }

    if (rule.archiveDays && rule.archiveDays >= rule.retentionDays) {
      throw new Error('Archive days must be less than retention days');
    }
  }

  private async evaluateConditions(memory: any, conditions: LifecycleCondition[]): Promise<boolean> {
    for (const condition of conditions) {
      if (!(await this.evaluateCondition(memory, condition))) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(memory: any, condition: LifecycleCondition): Promise<boolean> {
    let value: any;

    switch (condition.type) {
      case 'age':
        const age = Date.now() - new Date(memory.timestamp).getTime();
        value = age / (1000 * 60 * 60 * 24); // days
        break;
      case 'importance':
        value = memory.importance || 5;
        break;
      case 'size':
        value = JSON.stringify(memory).length;
        break;
      case 'usage':
        value = memory.accessCount || 0;
        break;
      case 'custom':
        value = condition.field ? memory[condition.field] : memory;
        break;
      default:
        return false;
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gt': return actual > expected;
      case 'gte': return actual >= expected;
      case 'lt': return actual < expected;
      case 'lte': return actual <= expected;
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'regex': return new RegExp(expected).test(String(actual));
      default: return false;
    }
  }

  private async executeActions(
    memory: any,
    actions: LifecycleAction[],
    dryRun: boolean
  ): Promise<{
    success: boolean;
    archived: boolean;
    deleted: boolean;
    error?: string;
  }> {
    const result = { success: true, archived: false, deleted: false };

    for (const action of actions) {
      try {
        if (!dryRun || action.dryRun) {
          switch (action.type) {
            case 'archive':
              await this.archiveMemory(memory.id, action.config.strategy);
              result.archived = true;
              break;
            case 'delete':
              await this.memoryStore.deleteMemory(memory.id);
              result.deleted = true;
              break;
            case 'compress':
              await this.compressMemory(memory.id, action.config.algorithm);
              break;
            case 'tag':
              await this.tagMemory(memory.id, action.config.tags);
              break;
            // Add more action types as needed
          }
        }
      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : String(error);
        break;
      }
    }

    return result;
  }

  private findApplicableRetentionRule(memory: any, rules: RetentionRule[]): RetentionRule | null {
    // Find most specific rule that matches
    const applicableRules = rules.filter(rule => {
      if (rule.entityType && memory.entityType !== rule.entityType) return false;
      if (rule.importance && memory.importance < rule.importance) return false;
      if (rule.project && memory.project !== rule.project) return false;
      return true;
    });

    // Return most specific rule (has more criteria)
    return applicableRules.sort((a, b) => {
      const aSpecificity = (a.entityType ? 1 : 0) + (a.importance ? 1 : 0) + (a.project ? 1 : 0);
      const bSpecificity = (b.entityType ? 1 : 0) + (b.importance ? 1 : 0) + (b.project ? 1 : 0);
      return bSpecificity - aSpecificity;
    })[0] || null;
  }

  private async executeBatchCleanup(
    operationId: string,
    agentId: string,
    options: any
  ): Promise<void> {
    const operation = this.batchOperations.get(operationId)!;
    operation.status = 'running';

    try {
      const memories = await this.memoryStore.getAllMemories(agentId);
      operation.totalItems = memories.length;

      for (let i = 0; i < memories.length; i += this.config.batchSize!) {
        const batch = memories.slice(i, i + this.config.batchSize!);

        for (const memory of batch) {
          try {
            // Apply cleanup logic based on options
            if (await this.shouldCleanupMemory(memory, options)) {
              if (!options.dryRun) {
                await this.memoryStore.deleteMemory(memory.id);
              }
            }
            operation.processedItems++;
          } catch (error) {
            operation.failedItems++;
          }

          operation.progress = Math.round((operation.processedItems / operation.totalItems) * 100);
        }
      }

      operation.status = 'completed';
      operation.endTime = new Date();
    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : String(error);
      operation.endTime = new Date();
    }
  }

  private async shouldCleanupMemory(memory: any, options: any): Promise<boolean> {
    if (options.maxAge) {
      const age = Date.now() - new Date(memory.timestamp).getTime();
      const ageDays = age / (1000 * 60 * 60 * 24);
      if (ageDays <= options.maxAge) return false;
    }

    if (options.minImportance && memory.importance >= options.minImportance) {
      return false;
    }

    if (options.entityTypes && !options.entityTypes.includes(memory.entityType)) {
      return false;
    }

    return true;
  }

  private async logEvent(event: Omit<LifecycleEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: LifecycleEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...event
    };

    this.lifecycleEvents.push(fullEvent);

    // Keep only recent events to manage memory
    const maxEvents = 10000;
    if (this.lifecycleEvents.length > maxEvents) {
      this.lifecycleEvents = this.lifecycleEvents.slice(-maxEvents);
    }
  }

  private async checkComplianceStatus(agentId: string): Promise<'compliant' | 'warning' | 'violation'> {
    // Implement compliance checking logic based on regulations
    // This is a simplified version
    const stats = await this.getLifecycleStats(agentId);

    if (stats.totalMemories > 100000) {
      return 'warning'; // Large dataset requires attention
    }

    return 'compliant';
  }

  private schedulePolicy(policy: MemoryLifecyclePolicy): void {
    if (!policy.schedule) return;

    if (policy.schedule.type === 'interval') {
      const interval = setInterval(async () => {
        try {
          await this.applyPolicies('all');
        } catch (error) {
          console.error(`Error applying scheduled policy ${policy.id}:`, error);
        }
      }, Number(policy.schedule.value));

      this.scheduledJobs.set(policy.id, interval);
    }
    // Add cron scheduling support if needed
  }

  private unschedulePolicy(policyId: string): void {
    const job = this.scheduledJobs.get(policyId);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(policyId);
    }
  }

  private startScheduler(): void {
    // Start global scheduler for periodic cleanup
    const globalScheduler = setInterval(async () => {
      try {
        // Apply enabled policies
        const activePolicies = this.getPolicies().filter(p => p.enabled);
        for (const policy of activePolicies) {
          if (this.shouldRunScheduledPolicy(policy)) {
            await this.applyPolicies('all');
          }
        }

        // Clean up old events
        const cutoffDate = new Date(Date.now() - (this.config.auditRetentionDays! * 24 * 60 * 60 * 1000));
        this.lifecycleEvents = this.lifecycleEvents.filter(e => e.timestamp >= cutoffDate);
      } catch (error) {
        console.error('Error in global scheduler:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    this.scheduledJobs.set('global', globalScheduler);
  }

  private shouldRunScheduledPolicy(policy: MemoryLifecyclePolicy): boolean {
    // Simple implementation - check if it's time to run based on schedule
    // In production, use a proper cron library
    return true; // Simplified for this example
  }

  // Utility methods for compression, encryption, storage
  private async compressContent(content: string, algorithm: string): Promise<string> {
    // Implement compression based on algorithm
    // This is a placeholder - use actual compression libraries
    return Buffer.from(content).toString('base64');
  }

  private async encryptContent(content: string): Promise<string> {
    // Implement encryption
    // This is a placeholder - use actual encryption
    return Buffer.from(content).toString('base64');
  }

  private async compressMemory(memoryId: string, algorithm: string): Promise<void> {
    // Implement memory compression
    const memory = await this.memoryStore.getMemory(memoryId);
    if (memory) {
      const compressed = await this.compressContent(memory.content, algorithm);
      await this.memoryStore.updateMemory(memoryId, {
        content: compressed,
        compressed: true,
        compressionAlgorithm: algorithm
      });
    }
  }

  private async tagMemory(memoryId: string, tags: string[]): Promise<void> {
    const memory = await this.memoryStore.getMemory(memoryId);
    if (memory) {
      const existingTags = memory.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];
      await this.memoryStore.updateMemory(memoryId, { tags: newTags });
    }
  }

  private async storeInArchiveTier(memory: any, storage: string): Promise<void> {
    // Implement storage tier logic
    // This would integrate with cloud storage services
    console.log(`Storing memory ${memory.id} in ${storage} tier`);
  }

  private generateArchiveReference(memoryId: string, strategy: ArchiveStrategy): string {
    return `${strategy.storage}:${strategy.id}:${memoryId}:${Date.now()}`;
  }

  private generateId(): string {
    return `lifecycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources and stop scheduler
   */
  async dispose(): Promise<void> {
    // Clear all scheduled jobs
    for (const job of this.scheduledJobs.values()) {
      clearInterval(job);
    }
    this.scheduledJobs.clear();

    // Cancel running batch operations
    for (const operation of this.batchOperations.values()) {
      if (operation.status === 'running') {
        operation.status = 'cancelled';
        operation.endTime = new Date();
      }
    }
  }
}

export default MemoryLifecycleManager;