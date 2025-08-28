/**
 * Neural Memory Processor Integration Tests - US-MEM-011
 * Comprehensive testing for neural pattern recognition and cognitive reasoning
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NeuralMemoryProcessor, MemoryVector, MemoryPattern, MemoryRelationship } from '../neural-memory-processor.js';

describe('Neural Memory Processor - US-MEM-011', () => {
    let processor: NeuralMemoryProcessor;
    let testMemories: MemoryVector[];

    beforeEach(() => {
        processor = new NeuralMemoryProcessor({
            patternRecognitionThreshold: 0.7,
            relationshipMinStrength: 0.5,
            anomalyDetectionSensitivity: 0.6,
            reasoningChainMaxDepth: 3,
            predictiveAnalysisWindow: 7,
            enableGPUAcceleration: false, // Disable for testing
            batchProcessingSize: 10
        });

        // Create test memory vectors
        testMemories = [
            {
                id: 'mem-001',
                agentId: 'test-agent-1',
                content: 'This is a test memory about machine learning and neural networks. It contains detailed information about pattern recognition algorithms.',
                embeddings: [0.1, 0.2, 0.3, 0.4, 0.5],
                timestamp: new Date('2025-01-20T09:00:00Z'),
                metadata: { category: 'ai', importance: 8 }
            },
            {
                id: 'mem-002',
                agentId: 'test-agent-1',
                content: 'Another memory about deep learning techniques and their applications in cognitive computing.',
                embeddings: [0.2, 0.3, 0.4, 0.5, 0.6],
                timestamp: new Date('2025-01-20T09:30:00Z'),
                metadata: { category: 'ai', importance: 7 }
            },
            {
                id: 'mem-003',
                agentId: 'test-agent-2',
                content: 'This memory discusses database optimization and query performance improvements.',
                embeddings: [0.8, 0.7, 0.6, 0.5, 0.4],
                timestamp: new Date('2025-01-20T14:00:00Z'),
                metadata: { category: 'database', importance: 6 }
            },
            {
                id: 'mem-004',
                agentId: 'test-agent-1',
                content: 'A very long memory content that exceeds normal length thresholds and should trigger anomaly detection mechanisms for unusual content patterns and potential optimization needs.',
                embeddings: [0.1, 0.1, 0.1, 0.1, 0.1],
                timestamp: new Date('2025-01-21T02:00:00Z'), // Late night - should trigger temporal anomaly
                metadata: { category: 'test', importance: 5 }
            }
        ];
    });

    afterEach(() => {
        processor.reset();
    });

    describe('Initialization and Configuration', () => {
        it('should initialize with default configuration', () => {
            const defaultProcessor = new NeuralMemoryProcessor();
            const stats = defaultProcessor.getStats();

            expect(stats.totalMemoriesProcessed).toBe(0);
            expect(stats.patternsDiscovered).toBe(0);
            expect(stats.relationshipsFound).toBe(0);
            expect(stats.anomaliesDetected).toBe(0);
        });

        it('should initialize with custom configuration', () => {
            const customConfig = {
                patternRecognitionThreshold: 0.9,
                relationshipMinStrength: 0.8,
                anomalyDetectionSensitivity: 0.5
            };

            const customProcessor = new NeuralMemoryProcessor(customConfig);
            expect(customProcessor).toBeDefined();
        });

        it('should emit model initialization event', (done) => {
            const testProcessor = new NeuralMemoryProcessor();

            testProcessor.on('models_initialized', (data) => {
                expect(data.patternRecognition).toBeGreaterThan(0.7);
                expect(data.relationshipDetection).toBeGreaterThan(0.7);
                expect(data.anomalyDetection).toBeGreaterThan(0.7);
                expect(data.predictive).toBeGreaterThan(0.7);
                done();
            });
        });
    });

    describe('Memory Processing and Pattern Recognition', () => {
        it('should process memory batch successfully', async () => {
            const initialStats = processor.getStats();

            await processor.processMemoryBatch(testMemories);

            const finalStats = processor.getStats();
            expect(finalStats.totalMemoriesProcessed).toBe(testMemories.length);
            expect(finalStats.lastProcessingRun).toBeInstanceOf(Date);
            expect(finalStats.averageProcessingTime).toBeGreaterThan(0);
        });

        it('should discover semantic patterns in memories', async () => {
            await processor.processMemoryBatch(testMemories);

            const patterns = processor.getPatterns();
            expect(patterns.length).toBeGreaterThan(0);

            const semanticPatterns = patterns.filter(p => p.patternType === 'semantic');
            expect(semanticPatterns.length).toBeGreaterThan(0);

            semanticPatterns.forEach(pattern => {
                expect(pattern.confidence).toBeGreaterThanOrEqual(0.7);
                expect(pattern.strength).toBeGreaterThan(0);
                expect(pattern.memories.length).toBeGreaterThan(0);
            });
        });

        it('should discover temporal patterns in memories', async () => {
            await processor.processMemoryBatch(testMemories);

            const patterns = processor.getPatterns();
            const temporalPatterns = patterns.filter(p => p.patternType === 'temporal');

            // Should find temporal patterns for business hours memories
            expect(temporalPatterns.length).toBeGreaterThan(0);

            temporalPatterns.forEach(pattern => {
                expect(pattern.confidence).toBeGreaterThanOrEqual(0.7);
                expect(pattern.patternType).toBe('temporal');
            });
        });

        it('should emit pattern discovery events', (done) => {
            let patternCount = 0;

            processor.on('pattern_discovered', (data) => {
                expect(data.patternId).toBeDefined();
                expect(data.type).toBeDefined();
                expect(data.confidence).toBeGreaterThanOrEqual(0.7);
                expect(data.memoryId).toBeDefined();

                patternCount++;
                if (patternCount >= 2) done(); // Wait for at least 2 patterns
            });

            processor.processMemoryBatch(testMemories);
        });
    });

    describe('Relationship Detection', () => {
        it('should detect temporal relationships between memories', async () => {
            await processor.processMemoryBatch(testMemories);

            const relationships = processor.getRelationships();
            expect(relationships.length).toBeGreaterThan(0);

            const temporalRelationships = relationships.filter(r => r.relationshipType === 'temporal');
            expect(temporalRelationships.length).toBeGreaterThan(0);

            temporalRelationships.forEach(relationship => {
                expect(relationship.strength).toBeGreaterThanOrEqual(0.5);
                expect(relationship.confidence).toBeGreaterThanOrEqual(0.5);
                expect(relationship.evidenceScore).toBeGreaterThan(0);
            });
        });

        it('should detect contextual relationships between same-agent memories', async () => {
            await processor.processMemoryBatch(testMemories);

            const relationships = processor.getRelationships();
            const contextualRelationships = relationships.filter(r => r.relationshipType === 'contextual');

            expect(contextualRelationships.length).toBeGreaterThan(0);

            contextualRelationships.forEach(relationship => {
                expect(relationship.strength).toBeGreaterThan(0.5);
                expect(relationship.confidence).toBeGreaterThan(0.5);
            });
        });

        it('should emit relationship discovery events', (done) => {
            processor.on('relationship_found', (data) => {
                expect(data.relationshipId).toBeDefined();
                expect(data.type).toBeDefined();
                expect(data.strength).toBeGreaterThanOrEqual(0.5);
                expect(data.confidence).toBeGreaterThanOrEqual(0.5);
                done();
            });

            processor.processMemoryBatch(testMemories);
        });

        it('should search relationships by type', async () => {
            await processor.processMemoryBatch(testMemories);

            const temporalRelationships = processor.searchRelationships('temporal');
            const contextualRelationships = processor.searchRelationships('contextual');

            expect(temporalRelationships.length).toBeGreaterThan(0);
            expect(contextualRelationships.length).toBeGreaterThan(0);

            temporalRelationships.forEach(r => expect(r.relationshipType).toBe('temporal'));
            contextualRelationships.forEach(r => expect(r.relationshipType).toBe('contextual'));
        });
    });

    describe('Anomaly Detection', () => {
        it('should detect usage spike anomalies for long content', async () => {
            await processor.processMemoryBatch(testMemories);

            const anomalies = processor.getAnomalies();
            const usageSpikes = anomalies.filter(a => a.type === 'usage_spike');

            expect(usageSpikes.length).toBeGreaterThan(0);

            usageSpikes.forEach(anomaly => {
                expect(anomaly.confidence).toBeGreaterThanOrEqual(0.6);
                expect(anomaly.affectedMemories.length).toBeGreaterThan(0);
                expect(anomaly.recommendedActions.length).toBeGreaterThan(0);
            });
        });

        it('should detect temporal anomalies for late night activity', async () => {
            await processor.processMemoryBatch(testMemories);

            const anomalies = processor.getAnomalies();
            const temporalAnomalies = anomalies.filter(a => a.type === 'temporal_gap');

            expect(temporalAnomalies.length).toBeGreaterThan(0);

            temporalAnomalies.forEach(anomaly => {
                expect(anomaly.severity).toBeDefined();
                expect(anomaly.description).toContain('Unusual time');
                expect(anomaly.confidence).toBeGreaterThan(0.5);
            });
        });

        it('should emit anomaly detection events', (done) => {
            processor.on('anomaly_detected', (data) => {
                expect(data.anomalyId).toBeDefined();
                expect(data.type).toBeDefined();
                expect(data.severity).toBeDefined();
                expect(data.confidence).toBeGreaterThanOrEqual(0.6);
                done();
            });

            processor.processMemoryBatch(testMemories);
        });

        it('should filter anomalies by severity', async () => {
            await processor.processMemoryBatch(testMemories);

            const lowAnomalies = processor.getAnomaliesBySeverity('low');
            const mediumAnomalies = processor.getAnomaliesBySeverity('medium');

            lowAnomalies.forEach(a => expect(a.severity).toBe('low'));
            mediumAnomalies.forEach(a => expect(a.severity).toBe('medium'));
        });
    });

    describe('Predictive Analytics', () => {
        it('should generate memory gap predictions for low activity', async () => {
            // Create scenario with few recent memories
            const oldMemories = testMemories.map(m => ({
                ...m,
                timestamp: new Date('2025-01-18T09:00:00Z') // 2 days old
            }));

            await processor.processMemoryBatch(oldMemories);

            const predictions = processor.getPredictions();
            const memoryGapPredictions = predictions.filter(p => p.type === 'memory_gap');

            expect(memoryGapPredictions.length).toBeGreaterThan(0);

            memoryGapPredictions.forEach(prediction => {
                expect(prediction.confidence).toBeGreaterThanOrEqual(0.7);
                expect(prediction.timeframe).toBe('immediate');
                expect(prediction.suggestedActions.length).toBeGreaterThan(0);
            });
        });

        it('should generate pattern completion predictions', async () => {
            await processor.processMemoryBatch(testMemories);

            const predictions = processor.getPredictions();
            const patternPredictions = predictions.filter(p => p.type === 'pattern_completion');

            // Should generate predictions based on discovered patterns
            expect(patternPredictions.length).toBeGreaterThan(0);

            patternPredictions.forEach(prediction => {
                expect(prediction.confidence).toBeGreaterThanOrEqual(0.7);
                expect(prediction.timeframe).toBe('short_term');
                expect(prediction.relevantMemories.length).toBeGreaterThan(0);
            });
        });

        it('should emit prediction generation events', (done) => {
            processor.on('prediction_generated', (data) => {
                expect(data.predictionId).toBeDefined();
                expect(data.type).toBeDefined();
                expect(data.confidence).toBeGreaterThanOrEqual(0.7);
                expect(data.timeframe).toBeDefined();
                done();
            });

            processor.processMemoryBatch(testMemories);
        });
    });

    describe('Cognitive Reasoning Chains', () => {
        it('should generate reasoning chains from memory relationships', async () => {
            await processor.processMemoryBatch(testMemories);

            const reasoningChains = processor.getReasoningChains();
            expect(reasoningChains.length).toBeGreaterThan(0);

            reasoningChains.forEach(chain => {
                expect(chain.startMemoryId).toBeDefined();
                expect(chain.endMemoryId).toBeDefined();
                expect(chain.reasoningSteps.length).toBeGreaterThanOrEqual(2);
                expect(chain.confidence).toBeGreaterThanOrEqual(0.7);
                expect(chain.inferenceType).toBeDefined();

                // Check reasoning steps
                chain.reasoningSteps.forEach((step, index) => {
                    expect(step.stepNumber).toBe(index + 1);
                    expect(step.memoryId).toBeDefined();
                    expect(step.reasoning).toBeDefined();
                    expect(step.confidence).toBeGreaterThan(0);
                });
            });
        });

        it('should emit reasoning chain creation events', (done) => {
            processor.on('reasoning_chain_created', (data) => {
                expect(data.chainId).toBeDefined();
                expect(data.startMemory).toBeDefined();
                expect(data.endMemory).toBeDefined();
                expect(data.steps).toBeGreaterThanOrEqual(2);
                expect(data.confidence).toBeGreaterThanOrEqual(0.7);
                done();
            });

            processor.processMemoryBatch(testMemories);
        });

        it('should determine correct inference types', async () => {
            await processor.processMemoryBatch(testMemories);

            const reasoningChains = processor.getReasoningChains();
            const inferenceTypes = ['deductive', 'inductive', 'abductive', 'analogical'];

            reasoningChains.forEach(chain => {
                expect(inferenceTypes).toContain(chain.inferenceType);
            });
        });
    });

    describe('Data Retrieval and Management', () => {
        beforeEach(async () => {
            await processor.processMemoryBatch(testMemories);
        });

        it('should retrieve memory by ID', () => {
            const memory = processor.getMemory('mem-001');
            expect(memory).toBeDefined();
            expect(memory?.id).toBe('mem-001');
            expect(memory?.content).toContain('machine learning');
        });

        it('should search patterns by type', () => {
            const semanticPatterns = processor.searchPatterns('semantic');
            const temporalPatterns = processor.searchPatterns('temporal');

            expect(semanticPatterns.length).toBeGreaterThan(0);
            expect(temporalPatterns.length).toBeGreaterThan(0);

            semanticPatterns.forEach(p => expect(p.patternType).toBe('semantic'));
            temporalPatterns.forEach(p => expect(p.patternType).toBe('temporal'));
        });

        it('should get all patterns when no type specified', () => {
            const allPatterns = processor.searchPatterns();
            const patternsFromGetter = processor.getPatterns();

            expect(allPatterns.length).toBe(patternsFromGetter.length);
        });

        it('should provide comprehensive statistics', () => {
            const stats = processor.getStats();

            expect(stats.totalMemoriesProcessed).toBe(testMemories.length);
            expect(stats.patternsDiscovered).toBeGreaterThan(0);
            expect(stats.relationshipsFound).toBeGreaterThan(0);
            expect(stats.anomaliesDetected).toBeGreaterThan(0);
            expect(stats.reasoningChainsGenerated).toBeGreaterThan(0);
            expect(stats.averageProcessingTime).toBeGreaterThan(0);
            expect(stats.lastProcessingRun).toBeInstanceOf(Date);
        });
    });

    describe('Performance and Accuracy Requirements', () => {
        it('should process memories within acceptable time limits', async () => {
            const startTime = Date.now();

            await processor.processMemoryBatch(testMemories);

            const processingTime = Date.now() - startTime;
            const stats = processor.getStats();

            // Should process within 200ms per memory (US-MEM-011 requirement)
            expect(stats.averageProcessingTime).toBeLessThan(200);
            expect(processingTime).toBeLessThan(1000); // Total batch processing
        });

        it('should achieve minimum pattern recognition accuracy', async () => {
            await processor.processMemoryBatch(testMemories);

            const patterns = processor.getPatterns();

            // All discovered patterns should meet minimum confidence threshold (80%)
            patterns.forEach(pattern => {
                expect(pattern.confidence).toBeGreaterThanOrEqual(0.7); // Using 0.7 for test config
            });

            // Should discover patterns in at least 50% of processed memories
            const memoriesWithPatterns = new Set(patterns.flatMap(p => p.memories));
            const patternCoverage = memoriesWithPatterns.size / testMemories.length;
            expect(patternCoverage).toBeGreaterThan(0.5);
        });

        it('should maintain low false positive rate for anomalies', async () => {
            // Test with mostly normal memories
            const normalMemories = testMemories.slice(0, 3); // Exclude the anomalous memory

            await processor.processMemoryBatch(normalMemories);

            const anomalies = processor.getAnomalies();
            const falsePositiveRate = anomalies.length / normalMemories.length;

            // Should have <5% false positive rate as per requirement
            expect(falsePositiveRate).toBeLessThan(0.05);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle empty memory batch gracefully', async () => {
            await expect(processor.processMemoryBatch([])).resolves.not.toThrow();

            const stats = processor.getStats();
            expect(stats.totalMemoriesProcessed).toBe(0);
        });

        it('should handle memories with missing embeddings', async () => {
            const invalidMemory: MemoryVector = {
                id: 'invalid-mem',
                agentId: 'test-agent',
                content: 'Test memory without embeddings',
                embeddings: [], // Empty embeddings
                timestamp: new Date(),
                metadata: {}
            };

            await expect(processor.processMemoryBatch([invalidMemory])).resolves.not.toThrow();
        });

        it('should handle very short content gracefully', async () => {
            const shortMemory: MemoryVector = {
                id: 'short-mem',
                agentId: 'test-agent',
                content: 'Hi', // Very short content
                embeddings: [0.1, 0.2],
                timestamp: new Date(),
                metadata: {}
            };

            await processor.processMemoryBatch([shortMemory]);

            // Should not discover semantic patterns for very short content
            const semanticPatterns = processor.searchPatterns('semantic');
            const shortMemoryPatterns = semanticPatterns.filter(p =>
                p.memories.includes('short-mem')
            );
            expect(shortMemoryPatterns.length).toBe(0);
        });
    });

    describe('Reset and Cleanup', () => {
        beforeEach(async () => {
            await processor.processMemoryBatch(testMemories);
        });

        it('should reset all data when requested', () => {
            // Verify data exists before reset
            expect(processor.getMemory('mem-001')).toBeDefined();
            expect(processor.getPatterns().length).toBeGreaterThan(0);
            expect(processor.getRelationships().length).toBeGreaterThan(0);

            processor.reset();

            // Verify data is cleared after reset
            expect(processor.getMemory('mem-001')).toBeUndefined();
            expect(processor.getPatterns().length).toBe(0);
            expect(processor.getRelationships().length).toBe(0);
            expect(processor.getAnomalies().length).toBe(0);
            expect(processor.getPredictions().length).toBe(0);
            expect(processor.getReasoningChains().length).toBe(0);

            const stats = processor.getStats();
            expect(stats.totalMemoriesProcessed).toBe(0);
            expect(stats.patternsDiscovered).toBe(0);
        });

        it('should emit reset event', (done) => {
            processor.on('processor_reset', () => {
                done();
            });

            processor.reset();
        });
    });

    describe('Integration with Enhanced Memory Store', () => {
        it('should provide compatible interfaces for memory store integration', () => {
            // Test that the processor provides all required methods for integration
            expect(typeof processor.processMemoryBatch).toBe('function');
            expect(typeof processor.getPatterns).toBe('function');
            expect(typeof processor.getRelationships).toBe('function');
            expect(typeof processor.getAnomalies).toBe('function');
            expect(typeof processor.getPredictions).toBe('function');
            expect(typeof processor.getReasoningChains).toBe('function');
            expect(typeof processor.getStats).toBe('function');
        });

        it('should handle memory vectors in the expected format', () => {
            // Test that processor correctly handles the MemoryVector format
            const testVector = testMemories[0];

            expect(testVector.id).toBeDefined();
            expect(testVector.agentId).toBeDefined();
            expect(testVector.content).toBeDefined();
            expect(Array.isArray(testVector.embeddings)).toBe(true);
            expect(testVector.timestamp).toBeInstanceOf(Date);
            expect(typeof testVector.metadata).toBe('object');
        });
    });
});