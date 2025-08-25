/**
 * Cross-Agent Permission System - Phase 4 Implementation
 * Provides fine-grained access control for memory sharing across agents
 */

// Import types from enhanced-memory-store
interface MemoryMetadata {
    importance?: number;
    entityType?: string;
    priority?: string;
    project?: string;
    session?: string;
    tags?: string[];
    [key: string]: any;
}

interface StoredMemory {
    id: string;
    agentId: string;
    content: string;
    metadata: MemoryMetadata;
    structuredKey: string;
    timestamp: string;
    embeddings?: number[];
    crossAgent?: boolean;
    sourceAgent?: string;
}

export interface PermissionRule {
    id: string;
    name: string;
    description: string;
    sourceAgentPattern: string; // Regex pattern for source agent
    targetAgentPattern: string; // Regex pattern for target agent
    contentPattern?: string; // Optional content pattern matching
    metadataConditions?: Record<string, any>; // Metadata-based conditions
    accessLevel: 'none' | 'read' | 'read_write' | 'full';
    priority: number; // Higher priority rules override lower ones
    enabled: boolean;
    conditions?: {
        timeRestriction?: {
            startTime?: string; // ISO time format
            endTime?: string;   // ISO time format
            timezone?: string;
        };
        importanceThreshold?: number;
        projectWhitelist?: string[];
        projectBlacklist?: string[];
        tagWhitelist?: string[];
        tagBlacklist?: string[];
        entityTypeWhitelist?: string[];
        entityTypeBlacklist?: string[];
    };
    createdAt: string;
    updatedAt: string;
    usageCount: number;
}

export interface AccessRequest {
    requestingAgent: string;
    targetAgent: string;
    memoryId: string;
    memory: StoredMemory;
    accessType: 'read' | 'write' | 'delete';
    context?: {
        reason?: string;
        urgency?: 'low' | 'medium' | 'high';
        temporaryAccess?: boolean;
        validUntil?: string;
    };
}

export interface AccessResult {
    granted: boolean;
    level: 'none' | 'read' | 'read_write' | 'full';
    reason: string;
    appliedRules: string[];
    restrictions?: {
        readOnly?: boolean;
        expiresAt?: string;
        limitedFields?: string[];
    };
    requiresApproval?: boolean;
    approvalRequired?: {
        approvers: string[];
        reason: string;
    };
}

export interface MemoryAuditLog {
    id: string;
    timestamp: string;
    requestingAgent: string;
    targetAgent: string;
    memoryId: string;
    action: 'read' | 'write' | 'delete' | 'share' | 'access_denied';
    result: 'success' | 'denied' | 'error';
    appliedRules: string[];
    reason: string;
    metadata?: Record<string, any>;
}

export class CrossAgentPermissionManager {
    private rules: Map<string, PermissionRule> = new Map();
    private auditLog: MemoryAuditLog[] = [];
    private defaultRules: PermissionRule[] = [];
    
    constructor() {
        this.initializeDefaultRules();
        console.log('[MemorAI Permissions] Cross-Agent Permission Manager initialized');
    }

    /**
     * Check if an agent has permission to access another agent's memory
     */
    async checkPermission(request: AccessRequest): Promise<AccessResult> {
        const startTime = Date.now();
        
        try {
            // Get applicable rules sorted by priority
            const applicableRules = this.getApplicableRules(request);
            
            if (applicableRules.length === 0) {
                const result = this.createDeniedResult('No applicable rules found');
                await this.logAccess(request, result);
                return result;
            }
            
            // Apply highest priority rule
            const topRule = applicableRules[0];
            
            // Check additional conditions
            const conditionResult = await this.checkConditions(request, topRule);
            if (!conditionResult.passed) {
                const result = this.createDeniedResult(conditionResult.reason);
                await this.logAccess(request, result);
                return result;
            }
            
            // Create result based on rule
            const result = this.createAccessResult(request, topRule, applicableRules);
            
            // Log the access attempt
            await this.logAccess(request, result);
            
            // Update rule usage count
            topRule.usageCount++;
            
            return result;
            
        } catch (error) {
            console.error('[MemorAI Permissions] Permission check failed:', error);
            const result = this.createDeniedResult('Permission check error');
            await this.logAccess(request, result);
            return result;
        }
    }

    /**
     * Add a new permission rule
     */
    addRule(rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): PermissionRule {
        const fullRule: PermissionRule = {
            ...rule,
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0
        };
        
        this.rules.set(fullRule.id, fullRule);
        console.log(`[MemorAI Permissions] Added rule: ${fullRule.name}`);
        return fullRule;
    }

    /**
     * Update an existing permission rule
     */
    updateRule(ruleId: string, updates: Partial<PermissionRule>): PermissionRule | null {
        const rule = this.rules.get(ruleId);
        if (!rule) return null;
        
        const updatedRule = {
            ...rule,
            ...updates,
            id: rule.id, // Prevent ID changes
            createdAt: rule.createdAt, // Preserve creation time
            updatedAt: new Date().toISOString()
        };
        
        this.rules.set(ruleId, updatedRule);
        console.log(`[MemorAI Permissions] Updated rule: ${updatedRule.name}`);
        return updatedRule;
    }

    /**
     * Delete a permission rule
     */
    deleteRule(ruleId: string): boolean {
        return this.rules.delete(ruleId);
    }

    /**
     * Get all permission rules
     */
    getRules(): PermissionRule[] {
        return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
    }

    /**
     * Get permission rule by ID
     */
    getRule(ruleId: string): PermissionRule | null {
        return this.rules.get(ruleId) || null;
    }

    /**
     * Enable or disable a rule
     */
    toggleRule(ruleId: string, enabled: boolean): boolean {
        const rule = this.rules.get(ruleId);
        if (!rule) return false;
        
        rule.enabled = enabled;
        rule.updatedAt = new Date().toISOString();
        console.log(`[MemorAI Permissions] Rule ${rule.name} ${enabled ? 'enabled' : 'disabled'}`);
        return true;
    }

    /**
     * Get audit log entries
     */
    getAuditLog(limit: number = 100, agentFilter?: string): MemoryAuditLog[] {
        let logs = [...this.auditLog].reverse(); // Most recent first
        
        if (agentFilter) {
            logs = logs.filter(log => 
                log.requestingAgent === agentFilter || log.targetAgent === agentFilter
            );
        }
        
        return logs.slice(0, limit);
    }

    /**
     * Clear audit log entries older than specified days
     */
    cleanupAuditLog(olderThanDays: number = 30): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        const initialCount = this.auditLog.length;
        this.auditLog = this.auditLog.filter(log => 
            new Date(log.timestamp) > cutoffDate
        );
        
        const removedCount = initialCount - this.auditLog.length;
        console.log(`[MemorAI Permissions] Cleaned up ${removedCount} audit log entries`);
        return removedCount;
    }

    /**
     * Create a shareable memory link with permissions
     */
    createShareableLink(
        memory: StoredMemory,
        requestingAgent: string,
        permissions: {
            allowedAgents?: string[];
            accessLevel: 'read' | 'read_write';
            expiresAt?: string;
            maxUses?: number;
        }
    ): {
        linkId: string;
        url: string;
        permissions: typeof permissions;
        createdAt: string;
    } {
        const linkId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create temporary rule for this share link
        const shareRule = this.addRule({
            name: `Share Link: ${memory.id}`,
            description: `Temporary share rule for memory ${memory.id}`,
            sourceAgentPattern: requestingAgent,
            targetAgentPattern: permissions.allowedAgents?.join('|') || '.*',
            accessLevel: permissions.accessLevel === 'read' ? 'read' : 'read_write',
            priority: 1000, // High priority for explicit shares
            enabled: true,
            conditions: permissions.expiresAt ? {
                timeRestriction: {
                    endTime: permissions.expiresAt
                }
            } : undefined
        });

        return {
            linkId: shareRule.id,
            url: `/shared/memory/${linkId}`,
            permissions,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Get permission analytics and insights
     */
    getPermissionAnalytics(): {
        totalRules: number;
        activeRules: number;
        accessAttempts: number;
        accessGranted: number;
        accessDenied: number;
        topAgents: Array<{ agent: string; requests: number }>;
        topRules: Array<{ rule: string; usage: number }>;
        recentTrends: {
            dailyRequests: number;
            weeklyRequests: number;
            monthlyRequests: number;
        };
    } {
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const rules = Array.from(this.rules.values());
        const logs = this.auditLog;

        // Agent request counts
        const agentCounts = new Map<string, number>();
        logs.forEach(log => {
            const current = agentCounts.get(log.requestingAgent) || 0;
            agentCounts.set(log.requestingAgent, current + 1);
        });

        const topAgents = Array.from(agentCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([agent, requests]) => ({ agent, requests }));

        // Rule usage counts
        const topRules = rules
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
            .map(rule => ({ rule: rule.name, usage: rule.usageCount }));

        return {
            totalRules: rules.length,
            activeRules: rules.filter(r => r.enabled).length,
            accessAttempts: logs.length,
            accessGranted: logs.filter(l => l.result === 'success').length,
            accessDenied: logs.filter(l => l.result === 'denied').length,
            topAgents,
            topRules,
            recentTrends: {
                dailyRequests: logs.filter(l => new Date(l.timestamp) > dayAgo).length,
                weeklyRequests: logs.filter(l => new Date(l.timestamp) > weekAgo).length,
                monthlyRequests: logs.filter(l => new Date(l.timestamp) > monthAgo).length,
            }
        };
    }

    // Private helper methods

    private initializeDefaultRules(): void {
        // Same agent access - full access to own memories
        this.addRule({
            name: 'Self Access',
            description: 'Agents have full access to their own memories',
            sourceAgentPattern: '(.*)',
            targetAgentPattern: '\\1', // Same as source
            accessLevel: 'full',
            priority: 100,
            enabled: true
        });

        // Cross-agent read access for high importance memories
        this.addRule({
            name: 'High Importance Cross-Agent Read',
            description: 'Allow read access to high importance memories across agents',
            sourceAgentPattern: '.*',
            targetAgentPattern: '.*',
            accessLevel: 'read',
            priority: 50,
            enabled: true,
            conditions: {
                importanceThreshold: 8
            }
        });

        // Public memories - memories explicitly marked for sharing
        this.addRule({
            name: 'Public Memory Access',
            description: 'Allow access to memories marked as public',
            sourceAgentPattern: '.*',
            targetAgentPattern: '.*',
            accessLevel: 'read',
            priority: 75,
            enabled: true,
            metadataConditions: {
                visibility: 'public'
            }
        });

        // Project-based access - agents working on same project
        this.addRule({
            name: 'Same Project Access',
            description: 'Allow read access to memories within the same project',
            sourceAgentPattern: '.*',
            targetAgentPattern: '.*',
            accessLevel: 'read',
            priority: 60,
            enabled: true,
            // This would need custom logic to check if agents are on same project
        });

        console.log('[MemorAI Permissions] Initialized default permission rules');
    }

    private getApplicableRules(request: AccessRequest): PermissionRule[] {
        const { requestingAgent, targetAgent, memory } = request;
        
        return Array.from(this.rules.values())
            .filter(rule => rule.enabled)
            .filter(rule => {
                // Check agent patterns
                const sourceMatches = new RegExp(rule.sourceAgentPattern).test(requestingAgent);
                const targetMatches = new RegExp(rule.targetAgentPattern).test(targetAgent);
                
                if (!sourceMatches || !targetMatches) return false;
                
                // Check content pattern if specified
                if (rule.contentPattern) {
                    const contentMatches = new RegExp(rule.contentPattern, 'i').test(memory.content);
                    if (!contentMatches) return false;
                }
                
                // Check metadata conditions if specified
                if (rule.metadataConditions) {
                    for (const [key, value] of Object.entries(rule.metadataConditions)) {
                        if (memory.metadata[key] !== value) return false;
                    }
                }
                
                return true;
            })
            .sort((a, b) => b.priority - a.priority);
    }

    private async checkConditions(request: AccessRequest, rule: PermissionRule): Promise<{passed: boolean, reason: string}> {
        if (!rule.conditions) return { passed: true, reason: 'No conditions' };
        
        const { memory } = request;
        const conditions = rule.conditions;
        
        // Time restriction check
        if (conditions.timeRestriction) {
            const now = new Date();
            if (conditions.timeRestriction.startTime) {
                const startTime = new Date(conditions.timeRestriction.startTime);
                if (now < startTime) {
                    return { passed: false, reason: 'Access not yet allowed by time restriction' };
                }
            }
            if (conditions.timeRestriction.endTime) {
                const endTime = new Date(conditions.timeRestriction.endTime);
                if (now > endTime) {
                    return { passed: false, reason: 'Access expired due to time restriction' };
                }
            }
        }
        
        // Importance threshold check
        if (conditions.importanceThreshold) {
            const importance = memory.metadata.importance || 5;
            if (importance < conditions.importanceThreshold) {
                return { passed: false, reason: `Memory importance ${importance} below threshold ${conditions.importanceThreshold}` };
            }
        }
        
        // Project whitelist/blacklist
        if (conditions.projectWhitelist && memory.metadata.project) {
            if (!conditions.projectWhitelist.includes(memory.metadata.project)) {
                return { passed: false, reason: `Project ${memory.metadata.project} not in whitelist` };
            }
        }
        if (conditions.projectBlacklist && memory.metadata.project) {
            if (conditions.projectBlacklist.includes(memory.metadata.project)) {
                return { passed: false, reason: `Project ${memory.metadata.project} is blacklisted` };
            }
        }
        
        // Tag whitelist/blacklist
        if (conditions.tagWhitelist && memory.metadata.tags) {
            const hasWhitelistedTag = memory.metadata.tags.some(tag => 
                conditions.tagWhitelist!.includes(tag)
            );
            if (!hasWhitelistedTag) {
                return { passed: false, reason: 'No whitelisted tags found' };
            }
        }
        if (conditions.tagBlacklist && memory.metadata.tags) {
            const hasBlacklistedTag = memory.metadata.tags.some(tag => 
                conditions.tagBlacklist!.includes(tag)
            );
            if (hasBlacklistedTag) {
                return { passed: false, reason: 'Memory contains blacklisted tags' };
            }
        }
        
        // Entity type whitelist/blacklist
        if (conditions.entityTypeWhitelist && memory.metadata.entityType) {
            if (!conditions.entityTypeWhitelist.includes(memory.metadata.entityType)) {
                return { passed: false, reason: `Entity type ${memory.metadata.entityType} not in whitelist` };
            }
        }
        if (conditions.entityTypeBlacklist && memory.metadata.entityType) {
            if (conditions.entityTypeBlacklist.includes(memory.metadata.entityType)) {
                return { passed: false, reason: `Entity type ${memory.metadata.entityType} is blacklisted` };
            }
        }
        
        return { passed: true, reason: 'All conditions passed' };
    }

    private createAccessResult(request: AccessRequest, rule: PermissionRule, applicableRules: PermissionRule[]): AccessResult {
        const { accessType } = request;
        
        // Check if requested access type is allowed by the rule
        let granted = false;
        let level = rule.accessLevel;
        
        switch (accessType) {
            case 'read':
                granted = ['read', 'read_write', 'full'].includes(rule.accessLevel);
                break;
            case 'write':
                granted = ['read_write', 'full'].includes(rule.accessLevel);
                break;
            case 'delete':
                granted = rule.accessLevel === 'full';
                break;
        }
        
        const result: AccessResult = {
            granted,
            level: granted ? level : 'none',
            reason: granted 
                ? `Access granted by rule: ${rule.name}`
                : `Access denied: rule ${rule.name} does not allow ${accessType} access`,
            appliedRules: applicableRules.map(r => r.name)
        };
        
        // Add restrictions if applicable
        if (granted && rule.conditions?.timeRestriction?.endTime) {
            result.restrictions = {
                expiresAt: rule.conditions.timeRestriction.endTime
            };
        }
        
        if (granted && level === 'read') {
            result.restrictions = {
                ...result.restrictions,
                readOnly: true
            };
        }
        
        return result;
    }

    private createDeniedResult(reason: string): AccessResult {
        return {
            granted: false,
            level: 'none',
            reason,
            appliedRules: []
        };
    }

    private async logAccess(request: AccessRequest, result: AccessResult): Promise<void> {
        const logEntry: MemoryAuditLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            requestingAgent: request.requestingAgent,
            targetAgent: request.targetAgent,
            memoryId: request.memoryId,
            action: request.accessType,
            result: result.granted ? 'success' : 'denied',
            appliedRules: result.appliedRules,
            reason: result.reason,
            metadata: {
                memoryImportance: request.memory.metadata.importance,
                memoryEntityType: request.memory.metadata.entityType,
                memoryProject: request.memory.metadata.project,
                accessLevel: result.level,
                context: request.context
            }
        };
        
        this.auditLog.push(logEntry);
        
        // Keep only last 10000 entries to prevent memory bloat
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-5000); // Keep last 5000
        }
    }
}