/**
 * AI Integration Test Suite
 * Comprehensive tests for the AI Integration Layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock child_process.spawn before any imports
vi.mock('node:child_process', () => ({
    spawn: vi.fn(),
}));

// Mock fetch for HTTP requests
global.fetch = vi.fn();

import { AdvancedAIIntegration, advancedAI } from '../ai-integration';
import { spawn } from 'node:child_process';

describe('AdvancedAIIntegration', () => {
    let integration: AdvancedAIIntegration;
    const mockSpawn = vi.mocked(spawn);

    beforeEach(() => {
        vi.clearAllMocks();
        integration = new AdvancedAIIntegration();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with correct configuration', () => {
            expect(integration).toBeDefined();
            expect(integration).toBeInstanceOf(AdvancedAIIntegration);
        });

        it('should log initialization messages', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            new AdvancedAIIntegration();

            expect(consoleSpy).toHaveBeenCalledWith('🧠 Initializing Advanced AI Integration Layer...');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('RomAI Path:'));

            consoleSpy.mockRestore();
        });
    });

    describe('Health Check', () => {
        it('should return health status successfully', async () => {
            // Mock successful spawn for health check
            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify({ status: 'healthy' }));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const health = await integration.healthCheck();

            expect(health).toEqual({
                status: 'healthy',
                romaiIntegration: true,
                pythonPath: expect.any(String),
                fallbackMode: false,
                capabilities: [
                    'knowledge_graph',
                    'pattern_analysis',
                    'multimodal_synthesis',
                    'semantic_clustering',
                    'temporal_analysis',
                    'cross_modal_reasoning',
                    'intelligence_query',
                    'quantum_engine',
                    'consciousness_engine',
                    'advanced_ai_models'
                ],
            });
        });

        it('should handle health check failures gracefully', async () => {
            // Mock failing spawn
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const health = await integration.healthCheck();

            expect(health).toEqual({
                status: 'fallback',
                romaiIntegration: false,
                error: 'Python not available',
                capabilities: ['basic_fallback_only'],
            });
        });

        it('should handle spawn process failures', async () => {
            const mockProcess = {
                stdout: { on: vi.fn() },
                stderr: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback('Python error');
                        }
                    }),
                },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(1);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const health = await integration.healthCheck();

            expect(health.status).toBe('fallback');
            expect(health.romaiIntegration).toBe(false);
            expect(health.capabilities).toEqual(['basic_fallback_only']);
        });
    });

    describe('Knowledge Graph Operations', () => {
        it('should generate knowledge graph successfully', async () => {
            const mockGraphData = {
                nodes: [
                    { id: '1', label: 'Concept A', type: 'concept' },
                    { id: '2', label: 'Concept B', type: 'concept' },
                ],
                edges: [
                    { from: '1', to: '2', relationship: 'relates_to' },
                ],
            };

            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify(mockGraphData));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];
            const options = { layout: 'force', maxNodes: 100 };

            const result = await integration.createKnowledgeGraph(agentId, memories, options);

            // Since it returns a graph structure, just verify it's an object with expected properties
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });

        it('should handle knowledge graph generation with fallback', async () => {
            // Mock spawn to fail, triggering fallback
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];

            const result = await integration.createKnowledgeGraph(agentId, memories);

            // Should return error object with fallback
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result.success).toBe(false);
            expect(result.fallback).toBeDefined();
            expect(result.fallback.nodes).toBeDefined();
            expect(result.fallback.edges).toBeDefined();
        });
    });

    describe('Pattern Analysis', () => {
        it('should analyze patterns successfully', async () => {
            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify({ patterns: ['pattern1'] }));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];
            const analysisType = 'all';

            const result = await integration.analyzePatterns(agentId, memories, analysisType);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result.success).toBe(true);
        });

        it('should handle pattern analysis with fallback', async () => {
            // Mock spawn to fail, triggering fallback
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];

            const result = await integration.analyzePatterns(agentId, memories);

            // Should return error object with fallback
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result.success).toBe(false);
            expect(result.fallback).toBeDefined();
            expect(result.fallback.patterns).toBeDefined();
            expect(Array.isArray(result.fallback.patterns)).toBe(true);
        });
    });

    describe('Semantic Clustering', () => {
        it('should perform semantic clustering successfully', async () => {
            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify({ clusters: ['cluster1'] }));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];
            const clusterCount = 10;

            const result = await integration.performSemanticClustering(agentId, memories, clusterCount);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });

        it('should handle semantic clustering with fallback', async () => {
            // Mock spawn to fail, triggering fallback
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const agentId = 'test-agent';
            const memories = [{ content: 'test memory' }];

            const result = await integration.performSemanticClustering(agentId, memories);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result.success).toBe(false);
            expect(result.fallback).toBeDefined();
            expect(result.fallback.clusters).toBeDefined();
        });
    });

    describe('Multimodal Synthesis', () => {
        it('should perform multimodal synthesis successfully', async () => {
            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify({ synthesis: 'result' }));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const content = { text: 'Test content for synthesis' };
            const mode = 'TRANSCENDENT';

            const result = await integration.synthesizeMultimodal(content, mode);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });

        it('should handle multimodal synthesis with fallback', async () => {
            // Mock spawn to fail, triggering fallback
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const content = { text: 'Test content' };

            const result = await integration.synthesizeMultimodal(content);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });
    });

    describe('Intelligence Query', () => {
        it('should process intelligence queries successfully', async () => {
            const mockProcess = {
                stdout: {
                    on: vi.fn((event, callback) => {
                        if (event === 'data') {
                            callback(JSON.stringify({ response: 'intelligent response' }));
                        }
                    }),
                },
                stderr: { on: vi.fn() },
                on: vi.fn((event, callback) => {
                    if (event === 'close') {
                        callback(0);
                    }
                }),
                kill: vi.fn(),
            };

            mockSpawn.mockReturnValue(mockProcess);

            const query = 'What are the key patterns in the data?';
            const context = { types: ['analytical', 'creative'] };

            const result = await integration.processIntelligenceQuery(query, context);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });

        it('should handle intelligence query with fallback', async () => {
            // Mock spawn to fail, triggering fallback
            mockSpawn.mockImplementation(() => {
                throw new Error('Python not available');
            });

            const query = 'Test query';

            const result = await integration.processIntelligenceQuery(query);

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });
    });
});

describe('Advanced AI Integration Exported Instance', () => {
    it('should export advancedAI instance', () => {
        expect(advancedAI).toBeDefined();
        expect(advancedAI).toBeInstanceOf(AdvancedAIIntegration);
    });

    it('should have all required methods', () => {
        expect(typeof advancedAI.healthCheck).toBe('function');
        expect(typeof advancedAI.createKnowledgeGraph).toBe('function');
        expect(typeof advancedAI.analyzePatterns).toBe('function');
        expect(typeof advancedAI.performSemanticClustering).toBe('function');
        expect(typeof advancedAI.synthesizeMultimodal).toBe('function');
        expect(typeof advancedAI.processIntelligenceQuery).toBe('function');
        expect(typeof advancedAI.analyzeTemporalEvolution).toBe('function');
        expect(typeof advancedAI.performCrossModalReasoning).toBe('function');
    });
});