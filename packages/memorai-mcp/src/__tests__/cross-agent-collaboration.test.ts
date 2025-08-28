/**
 * Cross-Agent Memory Collaboration Engine Tests
 * 
 * Comprehensive test suite for cross-agent memory sharing, synchronization,
 * workspace management, permission control, and conflict resolution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CrossAgentCollaborationEngine, type CollaborationWorkspace, type CollaborationPermission } from '../cross-agent-collaboration.js';
import { EnhancedMemoryStore, type StoredMemory } from '../enhanced-memory-store.js';

describe('CrossAgentCollaborationEngine', () => {
    let collaborationEngine: CrossAgentCollaborationEngine;
    let memoryStore: EnhancedMemoryStore;
    let testMemories: StoredMemory[];
    const testAgents = ['agent-alpha', 'agent-beta', 'agent-gamma', 'agent-delta'];

    beforeEach(async () => {
        // Create real memory store with test data
        const openai = {
            embeddings: {
                create: vi.fn().mockResolvedValue({
                    data: [{ embedding: Array(1536).fill(0.1) }]
                })
            }
        };

        memoryStore = new EnhancedMemoryStore(openai as any);
        // No need to initialize - constructor handles everything

        // Create test memories for different agents
        testMemories = [];
        for (const agent of testAgents) {
            for (let i = 1; i <= 3; i++) {
                const memory = await memoryStore.store(
                    agent,
                    `Test memory ${i} for ${agent}`,
                    {
                        importance: 5 + (i * 2),
                        entityType: 'test_data',
                        project: 'collaboration_test',
                        tags: [`memory${i}`, agent, 'test']
                    }
                );
                testMemories.push(memory);
            }
        }

        // Initialize collaboration engine
        collaborationEngine = new CrossAgentCollaborationEngine(memoryStore, {
            enableCollaboration: true,
            maxWorkspaces: 10,
            maxParticipantsPerWorkspace: 5,
            lockTimeout: 5000,
            syncInterval: 1000,
            conflictResolutionStrategy: 'merge',
            auditEnabled: true,
            encryptionRequired: false,
            permissionCacheSize: 100,
            retryAttempts: 2,
            batchSize: 5
        });
    });

    afterEach(async () => {
        if (collaborationEngine) {
            await collaborationEngine.stop();
        }
    });

    describe('Engine Initialization and Lifecycle', () => {
        it('should initialize collaboration engine successfully', () => {
            expect(collaborationEngine).toBeDefined();
            expect(collaborationEngine).toBeInstanceOf(CrossAgentCollaborationEngine);
        });

        it('should start and stop collaboration engine', async () => {
            await collaborationEngine.start();
            expect(collaborationEngine['isRunning']).toBe(true);

            await collaborationEngine.stop();
            expect(collaborationEngine['isRunning']).toBe(false);
        });

        it('should prevent double start', async () => {
            await collaborationEngine.start();
            await expect(collaborationEngine.start()).rejects.toThrow('already running');
        });
    });

    describe('Workspace Management', () => {
        it('should create new workspace successfully', async () => {
            const workspace = await collaborationEngine.createWorkspace(
                'Test Workspace',
                'A workspace for testing collaboration features',
                'agent-alpha',
                {
                    isPublic: false,
                    requireApproval: true,
                    allowedOperations: ['read', 'write'],
                    encryptionLevel: 'basic'
                }
            );

            expect(workspace.id).toBeDefined();
            expect(workspace.name).toBe('Test Workspace');
            expect(workspace.participants).toHaveLength(1);
            expect(workspace.participants[0].agentId).toBe('agent-alpha');
            expect(workspace.participants[0].role).toBe('owner');
            expect(workspace.configuration.isPublic).toBe(false);
            expect(workspace.configuration.requireApproval).toBe(true);
        });

        it('should allow agents to join workspace', async () => {
            const workspace = await collaborationEngine.createWorkspace(
                'Join Test Workspace',
                'Testing agent joining',
                'agent-alpha'
            );

            await collaborationEngine.joinWorkspace(workspace.id, 'agent-beta', 'editor');

            const updatedWorkspace = collaborationEngine['workspaces'].get(workspace.id);
            expect(updatedWorkspace?.participants).toHaveLength(2);
            expect(updatedWorkspace?.participants[1].agentId).toBe('agent-beta');
            expect(updatedWorkspace?.participants[1].role).toBe('editor');
        });

        it('should prevent duplicate agent joining', async () => {
            const workspace = await collaborationEngine.createWorkspace(
                'Duplicate Test',
                'Testing duplicate join prevention',
                'agent-alpha'
            );

            await expect(
                collaborationEngine.joinWorkspace(workspace.id, 'agent-alpha', 'editor')
            ).rejects.toThrow('already in workspace');
        });

        it('should get agent workspaces correctly', async () => {
            const workspace1 = await collaborationEngine.createWorkspace(
                'Workspace 1',
                'First workspace',
                'agent-alpha'
            );

            const workspace2 = await collaborationEngine.createWorkspace(
                'Workspace 2',
                'Second workspace',
                'agent-beta'
            );

            await collaborationEngine.joinWorkspace(workspace2.id, 'agent-alpha', 'viewer');

            const agentWorkspaces = collaborationEngine.getAgentWorkspaces('agent-alpha');
            expect(agentWorkspaces).toHaveLength(2);
            expect(agentWorkspaces.map(w => w.name)).toContain('Workspace 1');
            expect(agentWorkspaces.map(w => w.name)).toContain('Workspace 2');
        });
    });

    describe('Memory Sharing and Permissions', () => {
        let testWorkspace: CollaborationWorkspace;

        beforeEach(async () => {
            testWorkspace = await collaborationEngine.createWorkspace(
                'Sharing Test Workspace',
                'Testing memory sharing',
                'agent-alpha'
            );
            await collaborationEngine.joinWorkspace(testWorkspace.id, 'agent-beta', 'editor');
        });

        it('should share memory between agents', async () => {
            const sourceMemory = testMemories.find(m => m.agentId === 'agent-alpha')!;

            await collaborationEngine.shareMemory(
                sourceMemory.id,
                'agent-alpha',
                'agent-beta',
                'read',
                testWorkspace.id
            );

            const permissions = Array.from(collaborationEngine['permissions'].values());
            expect(permissions).toHaveLength(1);

            const permission = permissions[0];
            expect(permission.source.agentId).toBe('agent-alpha');
            expect(permission.target.agentId).toBe('agent-beta');
            expect(permission.target.memoryId).toBe(sourceMemory.id);
            expect(permission.permissions.read).toBe(true);
            expect(permission.permissions.write).toBe(false);
        });

        it('should check permissions correctly', async () => {
            const sourceMemory = testMemories.find(m => m.agentId === 'agent-alpha')!;

            await collaborationEngine.shareMemory(
                sourceMemory.id,
                'agent-alpha',
                'agent-beta',
                'write'
            );

            const hasReadPermission = await collaborationEngine.checkPermission(
                'agent-beta',
                sourceMemory.id,
                'read'
            );
            expect(hasReadPermission).toBe(true);

            const hasWritePermission = await collaborationEngine.checkPermission(
                'agent-beta',
                sourceMemory.id,
                'write'
            );
            expect(hasWritePermission).toBe(true);

            const hasDeletePermission = await collaborationEngine.checkPermission(
                'agent-beta',
                sourceMemory.id,
                'delete'
            );
            expect(hasDeletePermission).toBe(false);
        });

        it('should get shared memories for agent', async () => {
            const memory1 = testMemories.find(m => m.agentId === 'agent-alpha')!;
            const memory2 = testMemories.find(m => m.agentId === 'agent-gamma')!;

            await collaborationEngine.shareMemory(memory1.id, 'agent-alpha', 'agent-beta', 'read');
            await collaborationEngine.shareMemory(memory2.id, 'agent-gamma', 'agent-beta', 'write');

            const sharedMemories = await collaborationEngine.getSharedMemories('agent-beta');
            expect(sharedMemories).toHaveLength(2);

            const sharedIds = sharedMemories.map(sm => sm.memory.id);
            expect(sharedIds).toContain(memory1.id);
            expect(sharedIds).toContain(memory2.id);
        });

        it('should prevent sharing without permission', async () => {
            const sourceMemory = testMemories.find(m => m.agentId === 'agent-alpha')!;

            await expect(
                collaborationEngine.shareMemory(
                    sourceMemory.id,
                    'agent-beta', // Beta trying to share Alpha's memory
                    'agent-gamma',
                    'read'
                )
            ).rejects.toThrow('does not have permission to share');
        });
    });

    describe('Synchronization and Locking', () => {
        it('should acquire and release locks', async () => {
            const testMemory = testMemories[0];

            const lock = await collaborationEngine.acquireLock(
                testMemory.id,
                'agent-alpha',
                'write',
                'test_operation',
                { test: true }
            );

            expect(lock.id).toBeDefined();
            expect(lock.memoryId).toBe(testMemory.id);
            expect(lock.agentId).toBe('agent-alpha');
            expect(lock.lockType).toBe('write');
            expect(lock.metadata.operation).toBe('test_operation');

            await collaborationEngine.releaseLock(lock.id, 'agent-alpha');

            const lockExists = collaborationEngine['locks'].has(lock.id);
            expect(lockExists).toBe(false);
        });

        it('should prevent duplicate locks', async () => {
            const testMemory = testMemories[0];

            await collaborationEngine.acquireLock(
                testMemory.id,
                'agent-alpha',
                'write',
                'first_operation'
            );

            await expect(
                collaborationEngine.acquireLock(
                    testMemory.id,
                    'agent-beta',
                    'write',
                    'second_operation'
                )
            ).rejects.toThrow('already locked');
        });

        it('should synchronize memory between agents', async () => {
            const sourceMemory = testMemories.find(m => m.agentId === 'agent-alpha')!;

            // Share memory with beta and gamma
            await collaborationEngine.shareMemory(sourceMemory.id, 'agent-alpha', 'agent-beta', 'write');
            await collaborationEngine.shareMemory(sourceMemory.id, 'agent-alpha', 'agent-gamma', 'write');

            await collaborationEngine.synchronizeMemory(
                sourceMemory.id,
                'agent-alpha',
                ['agent-beta', 'agent-gamma']
            );

            // Check synchronization events
            const events = collaborationEngine.getEvents({ type: 'sync_completed' });
            expect(events).toHaveLength(1);

            const syncEvent = events[0];
            expect(syncEvent.sourceAgent).toBe('agent-alpha');
            expect(syncEvent.memoryId).toBe(sourceMemory.id);
            expect(syncEvent.payload.syncResults).toBeDefined();
        });

        it('should handle sync permission failures gracefully', async () => {
            const sourceMemory = testMemories.find(m => m.agentId === 'agent-alpha')!;

            // Don't share memory with beta - should fail permission check
            await collaborationEngine.synchronizeMemory(
                sourceMemory.id,
                'agent-alpha',
                ['agent-beta', 'agent-gamma']
            );

            const events = collaborationEngine.getEvents({ type: 'sync_completed' });
            expect(events).toHaveLength(1);

            const syncResults = events[0].payload.syncResults;
            expect(syncResults.some((r: any) => !r.success)).toBe(true);
        });
    });

    describe('Event System', () => {
        it('should emit workspace creation events', async () => {
            const eventPromise = new Promise((resolve) => {
                collaborationEngine.once('workspaceCreated', resolve);
            });

            await collaborationEngine.createWorkspace(
                'Event Test Workspace',
                'Testing events',
                'agent-alpha'
            );

            const event = await eventPromise;
            expect(event).toBeDefined();
        });

        it('should emit agent joined events', async () => {
            const workspace = await collaborationEngine.createWorkspace(
                'Join Event Test',
                'Testing join events',
                'agent-alpha'
            );

            const eventPromise = new Promise((resolve) => {
                collaborationEngine.once('agentJoined', resolve);
            });

            await collaborationEngine.joinWorkspace(workspace.id, 'agent-beta', 'editor');

            const event = await eventPromise;
            expect(event).toBeDefined();
        });

        it('should emit memory sharing events', async () => {
            const sourceMemory = testMemories[0];

            const eventPromise = new Promise((resolve) => {
                collaborationEngine.once('memoryShared', resolve);
            });

            await collaborationEngine.shareMemory(
                sourceMemory.id,
                'agent-alpha',
                'agent-beta',
                'read'
            );

            const event = await eventPromise;
            expect(event).toBeDefined();
        });

        it('should filter events correctly', async () => {
            const workspace = await collaborationEngine.createWorkspace(
                'Filter Test',
                'Testing event filtering',
                'agent-alpha'
            );

            await collaborationEngine.joinWorkspace(workspace.id, 'agent-beta', 'editor');

            const sourceMemory = testMemories[0];
            await collaborationEngine.shareMemory(sourceMemory.id, 'agent-alpha', 'agent-beta', 'read');

            // Filter by type
            const workspaceEvents = collaborationEngine.getEvents({ type: 'workspace_created' });
            expect(workspaceEvents.length).toBeGreaterThan(0);
            expect(workspaceEvents.every(e => e.type === 'workspace_created')).toBe(true);

            // Filter by agent
            const agentEvents = collaborationEngine.getEvents({ agentId: 'agent-alpha' });
            expect(agentEvents.length).toBeGreaterThan(0);
            expect(agentEvents.every(e =>
                e.sourceAgent === 'agent-alpha' || e.targetAgent === 'agent-alpha'
            )).toBe(true);

            // Filter by workspace
            const wsEvents = collaborationEngine.getEvents({ workspaceId: workspace.id });
            expect(wsEvents.length).toBeGreaterThan(0);
            expect(wsEvents.every(e => e.workspace === workspace.id)).toBe(true);

            // Filter by time range
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60000);
            const timeEvents = collaborationEngine.getEvents({
                startTime: oneMinuteAgo,
                endTime: now
            });
            expect(timeEvents.length).toBeGreaterThan(0);

            // Filter with limit
            const limitedEvents = collaborationEngine.getEvents({ limit: 2 });
            expect(limitedEvents).toHaveLength(2);
        });
    });

    describe('Permission Caching', () => {
        it('should cache permission checks', async () => {
            const sourceMemory = testMemories[0];

            await collaborationEngine.shareMemory(
                sourceMemory.id,
                'agent-alpha',
                'agent-beta',
                'read'
            );

            // First check - should cache
            const result1 = await collaborationEngine.checkPermission(
                'agent-beta',
                sourceMemory.id,
                'read'
            );
            expect(result1).toBe(true);

            // Second check - should use cache
            const result2 = await collaborationEngine.checkPermission(
                'agent-beta',
                sourceMemory.id,
                'read'
            );
            expect(result2).toBe(true);

            // Verify cache entry exists
            const cacheKey = `agent-beta-${sourceMemory.id}-read`;
            const cached = collaborationEngine['permissionCache'].get(cacheKey);
            expect(cached).toBeDefined();
            expect(cached.allowed).toBe(true);
        });
    });

    describe('Configuration and Management', () => {
        it('should use default configuration', () => {
            const defaultEngine = new CrossAgentCollaborationEngine(memoryStore);
            const config = defaultEngine['config'];

            expect(config.enableCollaboration).toBe(true);
            expect(config.maxWorkspaces).toBe(100);
            expect(config.lockTimeout).toBe(30000);
            expect(config.auditEnabled).toBe(true);
        });

        it('should merge custom configuration', () => {
            const customEngine = new CrossAgentCollaborationEngine(memoryStore, {
                maxWorkspaces: 50,
                lockTimeout: 10000,
                encryptionRequired: true
            });
            const config = customEngine['config'];

            expect(config.maxWorkspaces).toBe(50);
            expect(config.lockTimeout).toBe(10000);
            expect(config.encryptionRequired).toBe(true);
            expect(config.auditEnabled).toBe(true); // Default preserved
        });

        it('should handle role permissions correctly', () => {
            const ownerPerms = collaborationEngine['getRolePermissions']('owner');
            expect(ownerPerms).toContain('read');
            expect(ownerPerms).toContain('write');
            expect(ownerPerms).toContain('delete');
            expect(ownerPerms).toContain('share');
            expect(ownerPerms).toContain('admin');

            const viewerPerms = collaborationEngine['getRolePermissions']('viewer');
            expect(viewerPerms).toEqual(['read']);

            const editorPerms = collaborationEngine['getRolePermissions']('editor');
            expect(editorPerms).toContain('read');
            expect(editorPerms).toContain('write');
            expect(editorPerms).not.toContain('admin');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle non-existent workspace join', async () => {
            await expect(
                collaborationEngine.joinWorkspace('non-existent', 'agent-alpha', 'viewer')
            ).rejects.toThrow('not found');
        });

        it('should handle non-existent memory sharing', async () => {
            await expect(
                collaborationEngine.shareMemory(
                    'non-existent-memory',
                    'agent-alpha',
                    'agent-beta',
                    'read'
                )
            ).rejects.toThrow('not found');
        });

        it('should handle lock release by non-owner', async () => {
            const testMemory = testMemories[0];
            const lock = await collaborationEngine.acquireLock(
                testMemory.id,
                'agent-alpha',
                'write',
                'test'
            );

            await expect(
                collaborationEngine.releaseLock(lock.id, 'agent-beta')
            ).rejects.toThrow('does not own lock');
        });

        it('should handle synchronization of non-existent memory', async () => {
            await expect(
                collaborationEngine.synchronizeMemory(
                    'non-existent-memory',
                    'agent-alpha',
                    ['agent-beta']
                )
            ).rejects.toThrow('not found');
        });

        it('should handle empty agent lists in synchronization', async () => {
            const sourceMemory = testMemories[0];

            await collaborationEngine.synchronizeMemory(
                sourceMemory.id,
                'agent-alpha',
                []
            );

            const events = collaborationEngine.getEvents({ type: 'sync_completed' });
            expect(events).toHaveLength(1);
            expect(events[0].payload.syncResults).toEqual([]);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple simultaneous operations', async () => {
            const operations = [];

            // Create multiple workspaces concurrently
            for (let i = 0; i < 5; i++) {
                operations.push(
                    collaborationEngine.createWorkspace(
                        `Concurrent Workspace ${i}`,
                        `Testing concurrent creation ${i}`,
                        'agent-alpha'
                    )
                );
            }

            const workspaces = await Promise.all(operations);
            expect(workspaces).toHaveLength(5);
            expect(workspaces.every(w => w.id)).toBe(true);
        });

        it('should handle large numbers of events', async () => {
            // Generate many events
            for (let i = 0; i < 20; i++) {
                await collaborationEngine.createWorkspace(
                    `Workspace ${i}`,
                    `Testing scalability ${i}`,
                    'agent-alpha'
                );
            }

            const allEvents = collaborationEngine.getEvents();
            expect(allEvents.length).toBeGreaterThanOrEqual(20);

            // Test filtering performance
            const filteredEvents = collaborationEngine.getEvents({
                type: 'workspace_created',
                limit: 10
            });
            expect(filteredEvents).toHaveLength(10);
        });

        it('should manage permission cache efficiently', async () => {
            const sourceMemory = testMemories[0];

            // Create many permissions to test cache management
            const permissions = [];
            for (let i = 0; i < 10; i++) {
                permissions.push(
                    collaborationEngine.shareMemory(
                        sourceMemory.id,
                        'agent-alpha',
                        `agent-test-${i}`,
                        'read'
                    )
                );
            }

            await Promise.all(permissions);

            // Check all permissions
            const checks = [];
            for (let i = 0; i < 10; i++) {
                checks.push(
                    collaborationEngine.checkPermission(
                        `agent-test-${i}`,
                        sourceMemory.id,
                        'read'
                    )
                );
            }

            const results = await Promise.all(checks);
            expect(results.every(r => r === true)).toBe(true);

            // Verify cache has entries
            expect(collaborationEngine['permissionCache'].size).toBeGreaterThan(0);
        });
    });

    describe('Integration with Memory Store', () => {
        it('should work with real memory store operations', async () => {
            // Store new memory
            const newMemory = await memoryStore.store(
                'agent-alpha',
                'New collaborative memory for testing integration',
                {
                    importance: 8,
                    entityType: 'integration_test',
                    project: 'collaboration',
                    tags: ['new', 'integration', 'test']
                }
            );

            // Share the new memory
            await collaborationEngine.shareMemory(
                newMemory.id,
                'agent-alpha',
                'agent-beta',
                'write'
            );

            // Verify sharing worked
            const hasPermission = await collaborationEngine.checkPermission(
                'agent-beta',
                newMemory.id,
                'write'
            );
            expect(hasPermission).toBe(true);

            // Get shared memories
            const sharedMemories = await collaborationEngine.getSharedMemories('agent-beta');
            expect(sharedMemories.some(sm => sm.memory.id === newMemory.id)).toBe(true);
        });

        it('should handle memory store errors gracefully', async () => {
            // Try to share non-existent memory
            await expect(
                collaborationEngine.shareMemory(
                    'definitely-not-a-real-memory-id',
                    'agent-alpha',
                    'agent-beta',
                    'read'
                )
            ).rejects.toThrow();
        });
    });
});