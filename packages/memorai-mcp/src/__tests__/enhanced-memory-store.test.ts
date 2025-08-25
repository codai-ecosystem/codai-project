/**
 * Enhanced Memory Store Test Suite
 * Tests for Phase 1 emergency fixes to memory recall functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedMemoryStore } from '../enhanced-memory-store.js';

describe('Enhanced Memory Store - Phase 1 Fixes', () => {
    let memoryStore: EnhancedMemoryStore;

    beforeEach(() => {
        memoryStore = new EnhancedMemoryStore();
    });

    describe('Basic Memory Operations', () => {
        it('should store and retrieve a simple memory', async () => {
            const memory = await memoryStore.store('test_agent', 'This is a test memory');
            expect(memory.agentId).toBe('test_agent');
            expect(memory.content).toBe('This is a test memory');
            expect(memory.structuredKey).toMatch(/^test_agent-\d+-[a-z0-9]+$/);
        });

        it('should recall memories with exact text match', async () => {
            await memoryStore.store('test_agent', 'This is a test memory about machine learning');
            
            const results = await memoryStore.recall('test_agent', 'machine learning');
            expect(results.length).toBe(1);
            expect(results[0].content).toContain('machine learning');
            expect(results[0].relevanceScore).toBeGreaterThan(0);
        });
    });

    describe('Enhanced Search Functionality', () => {
        beforeEach(async () => {
            // Set up test memories
            await memoryStore.store('romai_agi_agent', '✅ COMPLETED Todo #2: DeepSeek-style MoE Architecture Implementation\n\nACHIEVEMENTS:\n- Implemented 32-expert DeepSeek-style MoE architecture with sparse activation\n- Enhanced mathematical reasoning capabilities\n- Integrated quantum-enhanced processing', {
                entityType: 'completion',
                importance: 8,
                tags: ['deepseek', 'moe', 'architecture', 'mathematical-reasoning']
            });

            await memoryStore.store('romai_agi_agent', 'Advanced Chain-of-Thought Reasoning Implementation\n\nFeatures:\n- Test-time compute scaling for complex problem solving\n- Multi-step verification loops\n- GPT-5 style thinking mode integration', {
                entityType: 'implementation',
                importance: 9,
                tags: ['chain-of-thought', 'reasoning', 'test-time', 'compute-scaling', 'gpt-5', 'thinking-mode']
            });

            await memoryStore.store('github_copilot', 'GitHub Copilot context analysis for workspace AI integration\n\nKey points:\n- Model Context Protocol integration\n- Agent coordination patterns\n- Memory persistence strategies', {
                entityType: 'analysis',
                importance: 7,
                tags: ['github-copilot', 'mcp', 'agent-coordination']
            });
        });

        it('should find memories with the original failing query', async () => {
            const results = await memoryStore.recall('romai_agi_agent', 
                'test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode'
            );
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].content).toContain('Chain-of-Thought');
            expect(results[0].relevanceScore).toBeGreaterThan(0.3);
        });

        it('should handle partial word matches', async () => {
            const results = await memoryStore.recall('romai_agi_agent', 'DeepSeek MoE mathematical');
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].content).toContain('DeepSeek-style MoE');
            expect(results[0].relevanceScore).toBeGreaterThan(0.4);
        });

        it('should find memories using fuzzy matching for compound words', async () => {
            const results = await memoryStore.recall('romai_agi_agent', 'chain-of-thought reasoning');
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].content).toContain('Chain-of-Thought');
            expect(results[0].relevanceScore).toBeGreaterThan(0.5);
        });

        it('should match based on metadata tags', async () => {
            const results = await memoryStore.recall('romai_agi_agent', 'thinking-mode');
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].metadata.tags).toContain('thinking-mode');
        });

        it('should rank results by relevance and importance', async () => {
            const results = await memoryStore.recall('romai_agi_agent', 'reasoning implementation');
            
            expect(results.length).toBeGreaterThan(0);
            
            // Results should be sorted by relevance score
            for (let i = 1; i < results.length; i++) {
                const prevScore = (results[i-1].relevanceScore || 0) + ((results[i-1].metadata.importance || 5) / 100);
                const currScore = (results[i].relevanceScore || 0) + ((results[i].metadata.importance || 5) / 100);
                expect(prevScore).toBeGreaterThanOrEqual(currScore);
            }
        });
    });

    describe('Cross-Agent Memory Access', () => {
        beforeEach(async () => {
            await memoryStore.store('agent_1', 'Agent 1 memory about machine learning algorithms');
            await memoryStore.store('agent_2', 'Agent 2 memory about deep learning networks');
            await memoryStore.store('agent_3', 'Agent 3 memory about neural networks and AI');
        });

        it('should only search own memories by default', async () => {
            const results = await memoryStore.recall('agent_1', 'machine learning');
            
            expect(results.length).toBe(1);
            expect(results[0].agentId).toBe('agent_1');
            expect(results[0].crossAgent).toBeUndefined();
        });

        it('should search across agents when enabled', async () => {
            const results = await memoryStore.recall('agent_1', 'neural networks', {
                includeOtherAgents: true,
                limit: 10
            });
            
            expect(results.length).toBeGreaterThan(1);
            expect(results.some(r => r.crossAgent)).toBe(true);
            expect(results.some(r => r.sourceAgent && r.sourceAgent !== 'agent_1')).toBe(true);
        });

        it('should mark cross-agent memories appropriately', async () => {
            const results = await memoryStore.recall('agent_1', 'deep learning', {
                includeOtherAgents: true
            });
            
            const crossAgentResult = results.find(r => r.crossAgent);
            expect(crossAgentResult).toBeDefined();
            expect(crossAgentResult!.sourceAgent).toBe('agent_2');
            expect(crossAgentResult!.crossAgent).toBe(true);
        });

        it('should prioritize own agent memories over cross-agent', async () => {
            // Store similar content in multiple agents
            await memoryStore.store('primary_agent', 'Neural networks are important for AI development');
            await memoryStore.store('other_agent', 'Neural networks are crucial for machine learning');
            
            const results = await memoryStore.recall('primary_agent', 'neural networks', {
                includeOtherAgents: true
            });
            
            expect(results.length).toBeGreaterThan(1);
            expect(results[0].agentId).toBe('primary_agent');
            expect(results[0].crossAgent).toBeUndefined();
        });
    });

    describe('Filtering and Options', () => {
        beforeEach(async () => {
            await memoryStore.store('test_agent', 'Low importance memory', {
                importance: 2,
                project: 'project_a'
            });
            
            await memoryStore.store('test_agent', 'High importance memory', {
                importance: 9,
                project: 'project_b',
                session: 'session_1'
            });
            
            await memoryStore.store('test_agent', 'Medium importance memory', {
                importance: 6,
                project: 'project_a',
                session: 'session_2'
            });
        });

        it('should filter by minimum importance', async () => {
            const results = await memoryStore.recall('test_agent', 'memory', {
                minImportance: 7
            });
            
            expect(results.length).toBe(1);
            expect(results[0].content).toContain('High importance');
        });

        it('should filter by project', async () => {
            const results = await memoryStore.recall('test_agent', 'memory', {
                project: 'project_a'
            });
            
            expect(results.length).toBe(2);
            results.forEach(result => {
                expect(result.metadata.project).toBe('project_a');
            });
        });

        it('should filter by session', async () => {
            const results = await memoryStore.recall('test_agent', 'memory', {
                session: 'session_1'
            });
            
            expect(results.length).toBe(1);
            expect(results[0].metadata.session).toBe('session_1');
        });

        it('should respect result limit', async () => {
            const results = await memoryStore.recall('test_agent', 'memory', {
                limit: 2
            });
            
            expect(results.length).toBeLessThanOrEqual(2);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty query gracefully', async () => {
            await memoryStore.store('test_agent', 'Some content');
            
            const results = await memoryStore.recall('test_agent', '');
            expect(results.length).toBe(0);
        });

        it('should handle non-existent agent', async () => {
            const results = await memoryStore.recall('non_existent_agent', 'query');
            expect(results.length).toBe(0);
        });

        it('should handle special characters in query', async () => {
            await memoryStore.store('test_agent', 'Content with special chars: @#$%^&*()');
            
            const results = await memoryStore.recall('test_agent', 'special chars: @#$%');
            expect(results.length).toBeGreaterThan(0);
        });

        it('should handle very long queries', async () => {
            const longQuery = 'very '.repeat(100) + 'long query';
            await memoryStore.store('test_agent', 'This is a very long content piece');
            
            const results = await memoryStore.recall('test_agent', longQuery);
            // Should not crash and may return results based on matching words
            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('Memory Management', () => {
        it('should delete memories correctly', async () => {
            const memory = await memoryStore.store('test_agent', 'Memory to be deleted');
            
            const deleted = await memoryStore.forget('test_agent', memory.structuredKey);
            expect(deleted).toBe(true);
            
            const results = await memoryStore.recall('test_agent', 'Memory to be deleted');
            expect(results.length).toBe(0);
        });

        it('should return false when trying to delete non-existent memory', async () => {
            const deleted = await memoryStore.forget('test_agent', 'non-existent-key');
            expect(deleted).toBe(false);
        });

        it('should provide context with recent memories', async () => {
            await memoryStore.store('test_agent', 'First memory');
            await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
            await memoryStore.store('test_agent', 'Second memory');
            await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
            await memoryStore.store('test_agent', 'Third memory');
            
            const context = await memoryStore.getContext('test_agent', 2);
            
            expect(context.length).toBe(2);
            expect(context[0].content).toBe('Third memory'); // Most recent first
            expect(context[1].content).toBe('Second memory');
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple agents efficiently', async () => {
            // Create memories for multiple agents
            for (let i = 0; i < 10; i++) {
                await memoryStore.store(`agent_${i}`, `Memory for agent ${i} about topic ${i % 3}`);
            }
            
            expect(memoryStore.listAgents()).toHaveLength(10);
            expect(memoryStore.getMemoryCount()).toBe(10);
        });

        it('should calculate relevance scores within reasonable bounds', async () => {
            await memoryStore.store('test_agent', 'Machine learning algorithms and deep neural networks');
            
            const results = await memoryStore.recall('test_agent', 'machine learning');
            
            expect(results[0].relevanceScore).toBeGreaterThan(0);
            expect(results[0].relevanceScore).toBeLessThanOrEqual(1);
        });
    });

    describe('Comprehensive Integration Test', () => {
        it('should pass the original failing test case', async () => {
            // Store the exact memory that was failing
            await memoryStore.store('romai_agi_agent', 
                '✅ COMPLETED Todo #2: DeepSeek-style MoE Architecture Implementation\n\n' +
                'ACHIEVEMENTS:\n' +
                '- Implemented 32-expert DeepSeek-style MoE architecture with sparse activation\n' +
                '- Enhanced mathematical reasoning capabilities with test-time compute scaling\n' +
                '- Integrated chain-of-thought verification loops\n' +
                '- Added GPT-5 thinking mode patterns\n' +
                '- Quantum-enhanced processing for complex reasoning tasks',
                {
                    entityType: 'completion',
                    importance: 9,
                    tags: [
                        'deepseek', 'moe', 'architecture', 'mathematical-reasoning',
                        'test-time', 'compute-scaling', 'chain-of-thought', 
                        'verification', 'gpt-5', 'thinking-mode', 'quantum'
                    ]
                }
            );
            
            // Test the exact query that was failing
            const results = await memoryStore.recall('romai_agi_agent', 
                'test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode',
                { includeOtherAgents: false }
            );
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].content).toContain('DeepSeek-style MoE');
            expect(results[0].relevanceScore).toBeGreaterThan(0.4);
            
            console.log('✅ Original failing query now works!');
            console.log(`Found ${results.length} results with relevance score: ${results[0].relevanceScore}`);
        });
    });
});

// Performance benchmarks
describe('Performance Benchmarks', () => {
    let memoryStore: EnhancedMemoryStore;

    beforeEach(() => {
        memoryStore = new EnhancedMemoryStore();
    });

    it('should handle large-scale memory storage and retrieval', async () => {
        const startTime = Date.now();
        
        // Store 100 memories
        for (let i = 0; i < 100; i++) {
            await memoryStore.store(
                `agent_${i % 10}`, 
                `Memory content ${i} with various keywords like machine learning, AI, neural networks, and data science`,
                {
                    importance: Math.floor(Math.random() * 10) + 1,
                    tags: [`tag_${i % 5}`, `category_${i % 3}`]
                }
            );
        }
        
        const storageTime = Date.now() - startTime;
        console.log(`📊 Storage time for 100 memories: ${storageTime}ms`);
        
        // Test retrieval performance
        const retrievalStart = Date.now();
        const results = await memoryStore.recall('agent_1', 'machine learning neural networks', {
            includeOtherAgents: true,
            limit: 20
        });
        const retrievalTime = Date.now() - retrievalStart;
        
        console.log(`📊 Retrieval time: ${retrievalTime}ms for ${results.length} results`);
        
        expect(storageTime).toBeLessThan(1000); // Should be under 1 second
        expect(retrievalTime).toBeLessThan(500); // Should be under 500ms
        expect(results.length).toBeGreaterThan(0);
    });
});