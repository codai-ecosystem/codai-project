#!/usr/bin/env node

/**
 * MemorAI MCP PHASE 3: INTELLIGENCE LAYER
 * Advanced semantic analysis, context-aware retrieval, and intelligent suggestions
 * 
 * Features:
 * - Semantic analysis with embeddings
 * - Context-aware memory retrieval
 * - Intelligent suggestions and patterns
 * - Temporal reasoning and evolution
 * - Cross-memory relationship discovery
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

class IntelligenceEngine {
    constructor() {
        this.semanticIndex = new Map(); // Semantic similarity index
        this.contextGraph = new Map();  // Context relationship graph
        this.temporalIndex = new Map();  // Time-based memory index
        this.patternCache = new Map();   // Pattern recognition cache
        this.domainKnowledge = new Map(); // Domain-specific knowledge

        console.log('🧠 Intelligence Engine initialized');
    }

    /**
     * Generate semantic embeddings for content
     * In production, this would use OpenAI or local models
     */
    generateEmbedding(content) {
        // Simplified embedding simulation (in production: use real embeddings)
        const words = content.toLowerCase().split(/\s+/);
        const embedding = new Array(384).fill(0); // Reduced dimension for demo

        // Simple hash-based embedding simulation
        words.forEach((word, index) => {
            const hash = this.simpleHash(word);
            embedding[hash % 384] += 1 / (index + 1);
        });

        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Calculate semantic similarity between two embeddings
     */
    calculateSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }

        const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
        return magnitude > 0 ? dotProduct / magnitude : 0;
    }

    /**
     * Advanced semantic analysis of content
     */
    analyzeSemantics(content, metadata = {}) {
        const embedding = this.generateEmbedding(content);

        // Extract key concepts
        const concepts = this.extractConcepts(content);

        // Determine domain
        const domain = this.identifyDomain(content, concepts);

        // Extract entities and relationships
        const entities = this.extractEntities(content);

        // Calculate sentiment and intent
        const sentiment = this.analyzeSentiment(content);
        const intent = this.analyzeIntent(content);

        return {
            embedding,
            concepts,
            domain,
            entities,
            sentiment,
            intent,
            complexity: this.calculateComplexity(content),
            keywords: this.extractKeywords(content),
            summary: this.generateSummary(content)
        };
    }

    extractConcepts(content) {
        const words = content.toLowerCase().split(/\s+/);
        const conceptPatterns = {
            'technology': ['code', 'software', 'programming', 'algorithm', 'system', 'data'],
            'business': ['project', 'task', 'meeting', 'deadline', 'client', 'strategy'],
            'personal': ['idea', 'thought', 'reminder', 'note', 'plan', 'goal'],
            'research': ['study', 'analysis', 'finding', 'hypothesis', 'experiment', 'result']
        };

        const concepts = [];
        for (const [concept, patterns] of Object.entries(conceptPatterns)) {
            const matches = patterns.filter(pattern =>
                words.some(word => word.includes(pattern) || pattern.includes(word))
            );
            if (matches.length > 0) {
                concepts.push({ concept, confidence: matches.length / patterns.length });
            }
        }

        return concepts.sort((a, b) => b.confidence - a.confidence);
    }

    identifyDomain(content, concepts) {
        if (concepts.length === 0) return 'general';
        return concepts[0].concept;
    }

    extractEntities(content) {
        // Simple entity extraction (in production: use NER models)
        const entities = [];
        const patterns = {
            'DATE': /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g,
            'TIME': /\b\d{1,2}:\d{2}\s*(AM|PM)?\b/gi,
            'EMAIL': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            'URL': /https?:\/\/[^\s]+/g,
            'PERSON': /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = content.match(pattern) || [];
            matches.forEach(match => {
                entities.push({ type, value: match, confidence: 0.8 });
            });
        }

        return entities;
    }

    analyzeSentiment(content) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'achieve'];
        const negativeWords = ['bad', 'terrible', 'awful', 'problem', 'issue', 'fail', 'error'];

        const words = content.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
            if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
        });

        const total = positiveCount + negativeCount;
        if (total === 0) return { polarity: 'neutral', confidence: 0.5 };

        const score = (positiveCount - negativeCount) / total;
        return {
            polarity: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
            confidence: Math.abs(score),
            score
        };
    }

    analyzeIntent(content) {
        const intentPatterns = {
            'question': ['what', 'how', 'why', 'when', 'where', 'who', '?'],
            'task': ['need to', 'should', 'must', 'todo', 'task', 'do'],
            'information': ['note', 'remember', 'info', 'fact', 'data'],
            'planning': ['plan', 'schedule', 'organize', 'prepare', 'arrange'],
            'problem': ['problem', 'issue', 'bug', 'error', 'fix', 'solve']
        };

        const words = content.toLowerCase().split(/\s+/);
        const intents = [];

        for (const [intent, patterns] of Object.entries(intentPatterns)) {
            const matches = patterns.filter(pattern =>
                words.some(word => word.includes(pattern) || content.includes(pattern))
            );
            if (matches.length > 0) {
                intents.push({ intent, confidence: matches.length / patterns.length });
            }
        }

        return intents.sort((a, b) => b.confidence - a.confidence)[0] || { intent: 'general', confidence: 0.5 };
    }

    calculateComplexity(content) {
        const factors = {
            length: content.length,
            sentences: (content.match(/[.!?]+/g) || []).length,
            words: content.split(/\s+/).length,
            uniqueWords: new Set(content.toLowerCase().split(/\s+/)).size
        };

        // Simple complexity score
        const avgWordsPerSentence = factors.sentences > 0 ? factors.words / factors.sentences : factors.words;
        const vocabularyRichness = factors.words > 0 ? factors.uniqueWords / factors.words : 0;

        return {
            score: Math.min(1.0, (avgWordsPerSentence / 20 + vocabularyRichness) / 2),
            factors
        };
    }

    extractKeywords(content) {
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, frequency: count }));
    }

    generateSummary(content) {
        // Simple extractive summarization
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length <= 2) return content.substring(0, 100) + '...';

        // Return first and most informative sentence
        const firstSentence = sentences[0].trim();
        const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b).trim();

        return firstSentence !== longestSentence
            ? `${firstSentence}. ${longestSentence}.`
            : firstSentence + '.';
    }

    /**
     * Context-aware memory retrieval with intelligence
     */
    intelligentRetrieve(query, memories, context = {}) {
        const queryAnalysis = this.analyzeSemantics(query);
        const results = [];

        memories.forEach(memory => {
            const memoryAnalysis = memory.analysis || this.analyzeSemantics(memory.content);

            // Calculate multiple similarity scores
            const semanticSimilarity = this.calculateSimilarity(
                queryAnalysis.embedding,
                memoryAnalysis.embedding
            );

            const conceptSimilarity = this.calculateConceptSimilarity(
                queryAnalysis.concepts,
                memoryAnalysis.concepts
            );

            const domainRelevance = queryAnalysis.domain === memoryAnalysis.domain ? 1.0 : 0.5;
            const intentAlignment = this.calculateIntentAlignment(
                queryAnalysis.intent,
                memoryAnalysis.intent
            );

            // Temporal relevance
            const temporalRelevance = this.calculateTemporalRelevance(memory, context);

            // Combined relevance score
            const relevanceScore = (
                semanticSimilarity * 0.3 +
                conceptSimilarity * 0.2 +
                domainRelevance * 0.2 +
                intentAlignment * 0.15 +
                temporalRelevance * 0.15
            );

            if (relevanceScore > 0.1) { // Only include relevant results
                results.push({
                    memory,
                    relevanceScore,
                    semanticSimilarity,
                    conceptSimilarity,
                    domainRelevance,
                    intentAlignment,
                    temporalRelevance,
                    explanation: this.generateRelevanceExplanation(
                        queryAnalysis, memoryAnalysis, relevanceScore
                    )
                });
            }
        });

        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10); // Top 10 results
    }

    calculateConceptSimilarity(concepts1, concepts2) {
        if (concepts1.length === 0 || concepts2.length === 0) return 0;

        let matchScore = 0;
        concepts1.forEach(c1 => {
            const match = concepts2.find(c2 => c2.concept === c1.concept);
            if (match) {
                matchScore += Math.min(c1.confidence, match.confidence);
            }
        });

        return matchScore / Math.max(concepts1.length, concepts2.length);
    }

    calculateIntentAlignment(intent1, intent2) {
        if (intent1.intent === intent2.intent) {
            return Math.min(intent1.confidence, intent2.confidence);
        }

        // Some intents are related
        const relatedIntents = {
            'question': ['information', 'problem'],
            'task': ['planning', 'problem'],
            'planning': ['task', 'information']
        };

        const related = relatedIntents[intent1.intent];
        if (related && related.includes(intent2.intent)) {
            return 0.5 * Math.min(intent1.confidence, intent2.confidence);
        }

        return 0;
    }

    calculateTemporalRelevance(memory, context) {
        const now = Date.now();
        const memoryTime = memory.timestamp || now;
        const ageInDays = (now - memoryTime) / (1000 * 60 * 60 * 24);

        // Recent memories are more relevant, but not always
        let temporalScore = Math.exp(-ageInDays / 30); // Decay over 30 days

        // But some memories become more relevant over time (patterns, learnings)
        if (memory.type === 'pattern' || memory.type === 'learning') {
            temporalScore = Math.min(1.0, temporalScore + ageInDays / 100);
        }

        return temporalScore;
    }

    generateRelevanceExplanation(queryAnalysis, memoryAnalysis, score) {
        const reasons = [];

        if (queryAnalysis.domain === memoryAnalysis.domain) {
            reasons.push(`Same domain: ${queryAnalysis.domain}`);
        }

        if (queryAnalysis.intent.intent === memoryAnalysis.intent.intent) {
            reasons.push(`Matching intent: ${queryAnalysis.intent.intent}`);
        }

        const commonConcepts = queryAnalysis.concepts.filter(c1 =>
            memoryAnalysis.concepts.some(c2 => c2.concept === c1.concept)
        );

        if (commonConcepts.length > 0) {
            reasons.push(`Shared concepts: ${commonConcepts.map(c => c.concept).join(', ')}`);
        }

        return reasons.join('; ') || 'General semantic similarity';
    }

    /**
     * Generate intelligent suggestions based on memory patterns
     */
    generateSuggestions(context, memories) {
        const suggestions = [];

        // Pattern-based suggestions
        const patterns = this.discoverPatterns(memories);
        patterns.forEach(pattern => {
            if (pattern.confidence > 0.7) {
                suggestions.push({
                    type: 'pattern',
                    suggestion: `Based on your patterns, you might want to: ${pattern.description}`,
                    confidence: pattern.confidence,
                    source: 'pattern_analysis'
                });
            }
        });

        // Context-based suggestions
        if (context.currentTime) {
            const timeBasedSuggestions = this.generateTimeBasedSuggestions(memories, context.currentTime);
            suggestions.push(...timeBasedSuggestions);
        }

        // Domain-specific suggestions
        const domainSuggestions = this.generateDomainSuggestions(memories, context);
        suggestions.push(...domainSuggestions);

        return suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }

    discoverPatterns(memories) {
        const patterns = [];

        // Temporal patterns
        const timePatterns = this.analyzeTemporalPatterns(memories);
        patterns.push(...timePatterns);

        // Content patterns
        const contentPatterns = this.analyzeContentPatterns(memories);
        patterns.push(...contentPatterns);

        // Behavioral patterns
        const behaviorPatterns = this.analyzeBehavioralPatterns(memories);
        patterns.push(...behaviorPatterns);

        return patterns;
    }

    analyzeTemporalPatterns(memories) {
        // Analyze when user typically creates memories
        const hourCounts = new Array(24).fill(0);
        const dayOfWeekCounts = new Array(7).fill(0);

        memories.forEach(memory => {
            if (memory.timestamp) {
                const date = new Date(memory.timestamp);
                hourCounts[date.getHours()]++;
                dayOfWeekCounts[date.getDay()]++;
            }
        });

        const patterns = [];

        // Peak hour pattern
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        if (hourCounts[peakHour] > memories.length * 0.2) {
            patterns.push({
                type: 'temporal',
                description: `Most active at ${peakHour}:00`,
                confidence: hourCounts[peakHour] / memories.length,
                data: { peakHour, distribution: hourCounts }
            });
        }

        return patterns;
    }

    analyzeContentPatterns(memories) {
        const patterns = [];

        // Domain frequency
        const domains = {};
        memories.forEach(memory => {
            const analysis = memory.analysis || this.analyzeSemantics(memory.content);
            domains[analysis.domain] = (domains[analysis.domain] || 0) + 1;
        });

        const totalMemories = memories.length;
        for (const [domain, count] of Object.entries(domains)) {
            if (count > totalMemories * 0.3) {
                patterns.push({
                    type: 'content',
                    description: `Frequently works with ${domain} content`,
                    confidence: count / totalMemories,
                    data: { domain, count, percentage: count / totalMemories * 100 }
                });
            }
        }

        return patterns;
    }

    analyzeBehavioralPatterns(memories) {
        const patterns = [];

        // Memory creation frequency
        if (memories.length > 10) {
            const timestamps = memories.map(m => m.timestamp).filter(t => t).sort();
            if (timestamps.length > 1) {
                const intervals = [];
                for (let i = 1; i < timestamps.length; i++) {
                    intervals.push(timestamps[i] - timestamps[i - 1]);
                }

                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const avgDays = avgInterval / (1000 * 60 * 60 * 24);

                patterns.push({
                    type: 'behavioral',
                    description: `Creates memories every ${avgDays.toFixed(1)} days on average`,
                    confidence: 0.8,
                    data: { avgInterval, avgDays, totalMemories: memories.length }
                });
            }
        }

        return patterns;
    }

    generateTimeBasedSuggestions(memories, currentTime) {
        const suggestions = [];
        const hour = new Date(currentTime).getHours();

        // Morning suggestions
        if (hour >= 6 && hour <= 10) {
            const recentGoals = memories.filter(m =>
                m.content.toLowerCase().includes('goal') ||
                m.content.toLowerCase().includes('plan')
            ).slice(0, 3);

            if (recentGoals.length > 0) {
                suggestions.push({
                    type: 'time_based',
                    suggestion: 'Good morning! Review your recent goals and plans for the day',
                    confidence: 0.8,
                    source: 'morning_routine',
                    relatedMemories: recentGoals.map(m => m.id)
                });
            }
        }

        // Evening suggestions
        if (hour >= 18 && hour <= 22) {
            suggestions.push({
                type: 'time_based',
                suggestion: 'End of day reflection: What did you learn or accomplish today?',
                confidence: 0.7,
                source: 'evening_reflection'
            });
        }

        return suggestions;
    }

    generateDomainSuggestions(memories, context) {
        const suggestions = [];

        // Recent domain analysis
        const recentMemories = memories
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 10);

        const domainCounts = {};
        recentMemories.forEach(memory => {
            const analysis = memory.analysis || this.analyzeSemantics(memory.content);
            domainCounts[analysis.domain] = (domainCounts[analysis.domain] || 0) + 1;
        });

        const primaryDomain = Object.entries(domainCounts)
            .sort(([, a], [, b]) => b - a)[0];

        if (primaryDomain && primaryDomain[1] > 3) {
            const [domain, count] = primaryDomain;
            suggestions.push({
                type: 'domain_specific',
                suggestion: `You've been focusing on ${domain} recently. Consider organizing these memories or creating a summary.`,
                confidence: count / recentMemories.length,
                source: 'domain_analysis',
                data: { domain, count, recentCount: recentMemories.length }
            });
        }

        return suggestions;
    }
}

class MemorAIMCPIntelligent {
    constructor() {
        this.memories = new Map();
        this.intelligence = new IntelligenceEngine();
        this.app = express();
        this.server = null;

        this.initializeHTTP();
        console.log('🎯 MemorAI MCP Intelligent initialized - Phase 3 Implementation');
    }

    initializeHTTP() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));

        // Authentication middleware
        this.app.use('/tools', (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid authorization header' });
            }

            const token = authHeader.substring(7);
            if (token !== process.env.MEMORAI_API_KEY) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            next();
        });

        // Health endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                service: 'MemorAI MCP Intelligent',
                version: '3.0.0',
                status: 'operational',
                intelligence: 'enabled',
                features: [
                    'semantic_analysis',
                    'context_aware_retrieval',
                    'intelligent_suggestions',
                    'pattern_recognition',
                    'temporal_reasoning'
                ],
                uptime: process.uptime() * 1000,
                memoryCount: this.memories.size,
                timestamp: new Date().toISOString()
            });
        });

        // Tools endpoint
        this.app.get('/tools', (req, res) => {
            res.json({
                tools: [
                    {
                        name: 'memorai_intelligent_remember',
                        description: 'Store memories with advanced semantic analysis and intelligence',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                content: { type: 'string', description: 'Memory content' },
                                metadata: { type: 'object', description: 'Additional metadata' },
                                tags: { type: 'array', items: { type: 'string' } },
                                context: { type: 'object', description: 'Contextual information' }
                            },
                            required: ['content']
                        }
                    },
                    {
                        name: 'memorai_intelligent_recall',
                        description: 'Intelligently retrieve memories with context-aware ranking',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Search query' },
                                context: { type: 'object', description: 'Query context' },
                                limit: { type: 'number', description: 'Maximum results', default: 5 },
                                includeAnalysis: { type: 'boolean', description: 'Include semantic analysis', default: false }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'memorai_generate_suggestions',
                        description: 'Generate intelligent suggestions based on memory patterns',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                context: { type: 'object', description: 'Current context' },
                                includePatterns: { type: 'boolean', description: 'Include pattern analysis', default: true }
                            }
                        }
                    },
                    {
                        name: 'memorai_analyze_patterns',
                        description: 'Discover patterns in stored memories',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                timeRange: { type: 'string', description: 'Time range for analysis' },
                                minConfidence: { type: 'number', description: 'Minimum pattern confidence', default: 0.5 }
                            }
                        }
                    }
                ],
                mcp_compatible: true,
                intelligence_enabled: true
            });
        });

        // Tool execution endpoints
        this.app.post('/tools/memorai_intelligent_remember', async (req, res) => {
            try {
                const { content, metadata = {}, tags = [], context = {} } = req.body;

                if (!content) {
                    return res.status(400).json({ error: 'Content is required' });
                }

                const id = uuidv4();
                const timestamp = Date.now();

                // Perform semantic analysis
                const analysis = this.intelligence.analyzeSemantics(content, metadata);

                const memory = {
                    id,
                    content,
                    metadata: {
                        ...metadata,
                        tags,
                        context,
                        timestamp,
                        createdAt: new Date().toISOString()
                    },
                    analysis,
                    timestamp
                };

                this.memories.set(id, memory);

                console.log(`📝 Intelligent memory stored: ${id}`);

                res.json({
                    success: true,
                    memoryId: id,
                    analysis: {
                        domain: analysis.domain,
                        concepts: analysis.concepts,
                        intent: analysis.intent,
                        sentiment: analysis.sentiment,
                        complexity: analysis.complexity.score,
                        keywordCount: analysis.keywords.length
                    },
                    suggestions: this.intelligence.generateSuggestions(context, Array.from(this.memories.values()))
                });

            } catch (error) {
                console.error('❌ Error in intelligent remember:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/tools/memorai_intelligent_recall', async (req, res) => {
            try {
                const { query, context = {}, limit = 5, includeAnalysis = false } = req.body;

                if (!query) {
                    return res.status(400).json({ error: 'Query is required' });
                }

                const memories = Array.from(this.memories.values());
                const results = this.intelligence.intelligentRetrieve(query, memories, context);

                const response = results.slice(0, limit).map(result => ({
                    id: result.memory.id,
                    content: result.memory.content,
                    metadata: result.memory.metadata,
                    relevanceScore: result.relevanceScore,
                    explanation: result.explanation,
                    ...(includeAnalysis && {
                        analysis: result.memory.analysis,
                        semanticSimilarity: result.semanticSimilarity,
                        conceptSimilarity: result.conceptSimilarity,
                        domainRelevance: result.domainRelevance,
                        intentAlignment: result.intentAlignment,
                        temporalRelevance: result.temporalRelevance
                    })
                }));

                console.log(`🔍 Intelligent recall: ${query} -> ${results.length} results`);

                res.json({
                    success: true,
                    query,
                    results: response,
                    totalFound: results.length,
                    queryAnalysis: includeAnalysis ? this.intelligence.analyzeSemantics(query) : undefined
                });

            } catch (error) {
                console.error('❌ Error in intelligent recall:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/tools/memorai_generate_suggestions', async (req, res) => {
            try {
                const { context = {}, includePatterns = true } = req.body;

                const memories = Array.from(this.memories.values());
                const suggestions = this.intelligence.generateSuggestions(context, memories);

                console.log(`💡 Generated ${suggestions.length} intelligent suggestions`);

                res.json({
                    success: true,
                    suggestions,
                    context,
                    memoryCount: memories.length,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error generating suggestions:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/tools/memorai_analyze_patterns', async (req, res) => {
            try {
                const { timeRange, minConfidence = 0.5 } = req.body;

                let memories = Array.from(this.memories.values());

                // Filter by time range if specified
                if (timeRange) {
                    const now = Date.now();
                    const ranges = {
                        'day': 24 * 60 * 60 * 1000,
                        'week': 7 * 24 * 60 * 60 * 1000,
                        'month': 30 * 24 * 60 * 60 * 1000,
                        'year': 365 * 24 * 60 * 60 * 1000
                    };

                    const rangeMs = ranges[timeRange] || ranges.month;
                    const cutoff = now - rangeMs;

                    memories = memories.filter(m => m.timestamp && m.timestamp > cutoff);
                }

                const patterns = this.intelligence.discoverPatterns(memories)
                    .filter(pattern => pattern.confidence >= minConfidence);

                console.log(`🔍 Discovered ${patterns.length} patterns`);

                res.json({
                    success: true,
                    patterns,
                    analyzed: memories.length,
                    timeRange,
                    minConfidence,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error analyzing patterns:', error);
                res.status(500).json({ error: error.message });
            }
        });
    }

    async start() {
        const port = process.env.MEMORAI_PORT || 8003;

        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, (error) => {
                if (error) {
                    console.error('❌ Failed to start HTTP server:', error);
                    reject(error);
                } else {
                    console.log('============================================================');
                    console.log('✅ ALL SERVICES INITIALIZED SUCCESSFULLY');
                    console.log(`📍 HTTP: http://localhost:${port}`);
                    console.log(`🔑 API Key: ${process.env.MEMORAI_API_KEY}`);
                    console.log('🧠 Intelligence: Enabled');
                    console.log('🎯 Semantic Analysis: Ready');
                    console.log('💡 Pattern Recognition: Active');
                    console.log('🔍 Context-Aware Retrieval: Operational');
                    console.log('============================================================');
                    resolve();
                }
            });
        });
    }

    async shutdown() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
            console.log('✅ HTTP server closed');
        }
    }
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down MemorAI MCP Intelligent...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down MemorAI MCP Intelligent...');
    process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
    console.log('============================================================');
    console.log('🧠 MEMORAI MCP INTELLIGENT - PHASE 3 INITIALIZATION');
    console.log('============================================================');
    console.log('🔧 Loading Intelligence Engine...');

    const server = new MemorAIMCPIntelligent();
    server.start().catch(error => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
}

module.exports = { MemorAIMCPIntelligent, IntelligenceEngine };
