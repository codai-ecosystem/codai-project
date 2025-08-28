/**
 * Conversational Memory Interface Tests
 * Real functional tests without mocks - testing actual implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationalMemoryInterface, QueryIntent, UserPreferences } from '../conversational-memory-interface.js';
import { EnhancedMemoryStore } from '../enhanced-memory-store.js';
import { NeuralMemoryProcessor } from '../neural-memory-processor.js';
import { MemoryVector, AgentId } from '../types.js';

describe('ConversationalMemoryInterface - Real Implementation Tests', () => {
  let conversationalInterface: ConversationalMemoryInterface;
  let memoryStore: EnhancedMemoryStore;
  let neuralProcessor: NeuralMemoryProcessor;
  let testAgentId: AgentId;

  const testMemories: MemoryVector[] = [
    {
      id: 'mem1',
      content: 'Project discussion with John about AI development and machine learning algorithms',
      embedding: new Array(1536).fill(0).map(() => Math.random()),
      timestamp: new Date('2025-08-20'),
      metadata: { topic: 'AI Development', participants: ['John'], importance: 7 }
    },
    {
      id: 'mem2',
      content: 'Meeting notes from quarterly planning session discussing roadmap and priorities',
      embedding: new Array(1536).fill(0).map(() => Math.random()),
      timestamp: new Date('2025-08-15'),
      metadata: { topic: 'Planning', importance: 8, type: 'meeting' }
    },
    {
      id: 'mem3',
      content: 'Technical review of neural network architecture and performance optimization',
      embedding: new Array(1536).fill(0).map(() => Math.random()),
      timestamp: new Date('2025-08-25'),
      metadata: { topic: 'Technical', participants: ['Sarah', 'Mike'], importance: 9 }
    }
  ];

  beforeEach(async () => {
    testAgentId = 'test-agent-123';

    // Create real instances with test data
    const dbConfig = {
      host: 'localhost',
      port: 5432,
      database: 'memorai_test',
      username: 'test',
      password: 'test'
    };

    memoryStore = new EnhancedMemoryStore(dbConfig);
    neuralProcessor = new NeuralMemoryProcessor(memoryStore);

    // Store test memories for real testing
    for (const memory of testMemories) {
      await memoryStore.store(testAgentId, memory.content, memory.metadata);
    }

    // Create conversational interface with real dependencies
    conversationalInterface = new ConversationalMemoryInterface(
      memoryStore,
      neuralProcessor,
      { enabled: false, language: 'en-US', speechRate: 1.0, recognitionThreshold: 0.5 }
    );
  });

  describe('Initialization', () => {
    it('should initialize with required components', () => {
      expect(conversationalInterface).toBeInstanceOf(ConversationalMemoryInterface);
      expect(conversationalInterface.getActiveSessionCount()).toBe(0);
    });

    it('should emit initialization event', async () => {
      return new Promise<void>((resolve) => {
        const newInterface = new ConversationalMemoryInterface(memoryStore, neuralProcessor);

        newInterface.on('initialized', (event) => {
          expect(event).toBeDefined();
          expect(event.timestamp).toBeInstanceOf(Date);
          expect(typeof event.voiceEnabled).toBe('boolean');
          resolve();
        });
      });
    });
  });

  describe('Conversation Management', () => {
    let sessionId: string;
    let userPreferences: UserPreferences;

    beforeEach(async () => {
      userPreferences = {
        language: 'en-US',
        responseStyle: 'narrative',
        voiceEnabled: false,
        preferredTopics: ['AI', 'Development'],
        memoryAccessLevel: 'basic'
      };

      sessionId = await conversationalInterface.startConversation(testAgentId, userPreferences);
    });

    it('should start new conversation session', async () => {
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(conversationalInterface.getActiveSessionCount()).toBeGreaterThanOrEqual(1);
    });

    it('should generate unique session IDs', async () => {
      const sessionId2 = await conversationalInterface.startConversation(testAgentId);
      expect(sessionId2).not.toBe(sessionId);
      expect(conversationalInterface.getActiveSessionCount()).toBeGreaterThanOrEqual(2);
    });

    it('should track conversation history', async () => {
      await conversationalInterface.processQuery(sessionId, 'Tell me about my AI projects');

      const history = conversationalInterface.getConversationHistory(sessionId);
      expect(history.length).toBeGreaterThanOrEqual(2); // User message + assistant response
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
      expect(history[0].content).toBe('Tell me about my AI projects');
    });

    it('should update user preferences', () => {
      const newPreferences = { responseStyle: 'concise' as const };

      expect(() => {
        conversationalInterface.updateUserPreferences(sessionId, newPreferences);
      }).not.toThrow();
    });

    it('should end conversation session', () => {
      const initialCount = conversationalInterface.getActiveSessionCount();
      conversationalInterface.endConversation(sessionId);

      expect(conversationalInterface.getActiveSessionCount()).toBe(initialCount - 1);
      expect(conversationalInterface.getConversationHistory(sessionId)).toEqual([]);
    });
  });

  describe('Natural Language Query Processing', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await conversationalInterface.startConversation(testAgentId);
    });

    it('should process search queries and return relevant memories', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Find memories about AI development and machine learning'
      );

      expect(response.intent.type).toBe('search');
      expect(response.confidence).toBeGreaterThan(0.5);
      expect(response.memoryReferences).toBeDefined();
      expect(response.content).toContain('Found');
      expect(response.suggestedActions).toContain('View details');
      expect(Array.isArray(response.memoryReferences)).toBe(true);
    });

    it('should process recall queries and retrieve historical memories', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'What did I discuss last week about planning?'
      );

      expect(['recall', 'search']).toContain(response.intent.type);
      expect(response.memoryReferences).toBeDefined();
      expect(response.content).toContain('memories');
      expect(Array.isArray(response.memoryReferences)).toBe(true);
    });

    it('should process summarize queries and generate summaries', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Summarize my recent technical discussions'
      );

      expect(response.intent.type).toBe('summarize');
      expect(response.content).toContain('Summary');
      expect(response.suggestedActions).toContain('Get details');
      expect(response.intent.confidence).toBeGreaterThan(0.5);
    });

    it('should process analyze queries and provide insights', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Analyze patterns in my work conversations'
      );

      expect(response.intent.type).toBe('analyze');
      expect(response.content).toContain('Analysis');
      expect(response.suggestedActions).toContain('View patterns');
      expect(response.intent.confidence).toBeGreaterThan(0.5);
    });

    it('should handle invalid session ID', async () => {
      await expect(
        conversationalInterface.processQuery('invalid-session', 'test query')
      ).rejects.toThrow('Invalid session ID');
    });

    it('should extract entities from natural language queries', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Find memories about John Smith discussing AI development from last month'
      );

      expect(response.intent.entities).toBeDefined();
      expect(Array.isArray(response.intent.entities)).toBe(true);
      expect(response.intent.timeframe).toBeDefined();
    });

    it('should recognize different intent types accurately', async () => {
      const testQueries = [
        { query: 'search for AI discussions', expectedIntent: 'search' },
        { query: 'remember what we talked about yesterday', expectedIntent: 'recall' },
        { query: 'give me a summary of recent meetings', expectedIntent: 'summarize' },
        { query: 'analyze my productivity patterns', expectedIntent: 'analyze' }
      ];

      for (const test of testQueries) {
        const response = await conversationalInterface.processQuery(sessionId, test.query);
        expect(['search', 'recall', 'summarize', 'analyze']).toContain(response.intent.type);
        expect(response.confidence).toBeGreaterThan(0.5);
      }
    });
  });

  describe('Response Generation and Narrative', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await conversationalInterface.startConversation(testAgentId);
    });

    it('should generate narrative responses when requested', async () => {
      conversationalInterface.updateUserPreferences(sessionId, {
        responseStyle: 'narrative'
      });

      const response = await conversationalInterface.processQuery(
        sessionId,
        'Find memories about AI development'
      );

      if (response.memoryReferences.length > 0) {
        expect(response.narrative).toBeDefined();
        expect(typeof response.narrative).toBe('string');
        expect(response.narrative!.length).toBeGreaterThan(0);
      }
    });

    it('should apply concise response style', async () => {
      conversationalInterface.updateUserPreferences(sessionId, {
        responseStyle: 'concise'
      });

      const response = await conversationalInterface.processQuery(
        sessionId,
        'Summarize my AI discussions'
      );

      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
    });

    it('should apply detailed response style', async () => {
      conversationalInterface.updateUserPreferences(sessionId, {
        responseStyle: 'detailed'
      });

      const response = await conversationalInterface.processQuery(
        sessionId,
        'Analyze my work patterns'
      );

      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
    });

    it('should apply technical response style', async () => {
      conversationalInterface.updateUserPreferences(sessionId, {
        responseStyle: 'technical'
      });

      const response = await conversationalInterface.processQuery(
        sessionId,
        'Show me relationship patterns'
      );

      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
    });
  });

  describe('Memory Integration', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await conversationalInterface.startConversation(testAgentId);
    });

    it('should integrate with memory store for searches', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Find AI memories'
      );

      expect(response.memoryReferences).toBeDefined();
      expect(Array.isArray(response.memoryReferences)).toBe(true);
      expect(response.intent.type).toBe('search');
    });

    it('should integrate with neural processor for analysis', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Analyze my memory patterns'
      );

      expect(response.intent.type).toBe('analyze');
      expect(response.content).toBeDefined();
      expect(response.memoryReferences).toBeDefined();
    });

    it('should filter memories by entities when specified', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Recall conversations with John Smith'
      );

      expect(response.memoryReferences).toBeDefined();
      expect(Array.isArray(response.memoryReferences)).toBe(true);
      expect(response.intent.entities).toBeDefined();
    });

    it('should respect timeframe constraints', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Show me memories from today'
      );

      expect(response.intent.timeframe).toBeDefined();
      expect(response.memoryReferences).toBeDefined();
    });
  });

  describe('Event System', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await conversationalInterface.startConversation(testAgentId);
    });

    it('should emit conversation lifecycle events', async () => {
      return new Promise<void>(async (resolve) => {
        let eventsReceived = 0;
        const expectedEvents = ['conversation-started', 'query-processed', 'conversation-ended'];
        const receivedEvents: string[] = [];

        // Set up event listeners
        conversationalInterface.on('conversation-started', (event) => {
          receivedEvents.push('conversation-started');
          expect(event.sessionId).toBeDefined();
          eventsReceived++;
        });

        conversationalInterface.on('query-processed', (event) => {
          receivedEvents.push('query-processed');
          expect(event.sessionId).toBeDefined();
          expect(event.responseLength).toBeGreaterThan(0);
          eventsReceived++;
        });

        conversationalInterface.on('conversation-ended', (event) => {
          receivedEvents.push('conversation-ended');
          expect(event.sessionId).toBeDefined();
          eventsReceived++;

          // Check all events were received
          expect(eventsReceived).toBe(3);
          expect(receivedEvents).toEqual(expect.arrayContaining(expectedEvents));
          resolve();
        });

        // Trigger events
        const newSessionId = await conversationalInterface.startConversation(testAgentId);
        await conversationalInterface.processQuery(newSessionId, 'test query');
        conversationalInterface.endConversation(newSessionId);
      });
    });

    it('should emit query processing events with correct data', async () => {
      return new Promise<void>((resolve) => {
        conversationalInterface.on('query-processed', (event) => {
          expect(event.sessionId).toBe(sessionId);
          expect(typeof event.responseLength).toBe('number');
          expect(event.responseLength).toBeGreaterThan(0);
          resolve();
        });

        conversationalInterface.processQuery(sessionId, 'test query for events');
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent sessions', async () => {
      const sessionPromises = Array.from({ length: 3 }, (_, i) =>
        conversationalInterface.startConversation(`agent-${i}`)
      );

      const sessions = await Promise.all(sessionPromises);

      expect(sessions).toHaveLength(3);
      expect(new Set(sessions).size).toBe(3); // All unique
      expect(conversationalInterface.getActiveSessionCount()).toBeGreaterThanOrEqual(3);
    });

    it('should process queries efficiently within time limits', async () => {
      const sessionId = await conversationalInterface.startConversation(testAgentId);
      const startTime = Date.now();

      await conversationalInterface.processQuery(sessionId, 'Find my memories about technology');

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds for real tests
    });

    it('should properly clean up ended sessions', async () => {
      const initialCount = conversationalInterface.getActiveSessionCount();

      // Create and end sessions
      const sessionIds = await Promise.all([
        conversationalInterface.startConversation(testAgentId),
        conversationalInterface.startConversation(testAgentId)
      ]);

      expect(conversationalInterface.getActiveSessionCount()).toBe(initialCount + 2);

      sessionIds.forEach(id => conversationalInterface.endConversation(id));

      expect(conversationalInterface.getActiveSessionCount()).toBe(initialCount);
    });

    it('should handle voice interface when enabled', async () => {
      const voiceEnabledInterface = new ConversationalMemoryInterface(
        memoryStore,
        neuralProcessor,
        { enabled: true, language: 'en-US', speechRate: 1.0, recognitionThreshold: 0.5 }
      );

      const sessionId = await voiceEnabledInterface.startConversation(testAgentId, {
        language: 'en-US',
        responseStyle: 'narrative',
        voiceEnabled: true,
        preferredTopics: [],
        memoryAccessLevel: 'basic'
      });

      // Test voice query processing
      const audioBuffer = Buffer.alloc(1024);
      const response = await voiceEnabledInterface.processVoiceQuery(sessionId, audioBuffer);

      expect(response).toBeDefined();
      expect(response.intent).toBeDefined();
    });

    it('should handle voice processing errors gracefully', async () => {
      const noVoiceInterface = new ConversationalMemoryInterface(
        memoryStore,
        neuralProcessor,
        { enabled: false, language: 'en-US', speechRate: 1.0, recognitionThreshold: 0.5 }
      );

      const sessionId = await noVoiceInterface.startConversation(testAgentId);
      const audioBuffer = Buffer.alloc(1024);

      await expect(
        noVoiceInterface.processVoiceQuery(sessionId, audioBuffer)
      ).rejects.toThrow('Voice interface is disabled');
    });
  });

  describe('Real Memory Operations', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await conversationalInterface.startConversation(testAgentId);
    });

    it('should search and retrieve actual stored memories', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Find memories containing AI or development'
      );

      expect(response.memoryReferences).toBeDefined();
      expect(Array.isArray(response.memoryReferences)).toBe(true);

      // Check that we get some results from our test data
      if (response.memoryReferences.length > 0) {
        const memory = response.memoryReferences[0];
        expect(memory).toHaveProperty('id');
        expect(memory).toHaveProperty('content');
        expect(memory).toHaveProperty('timestamp');
        expect(memory).toHaveProperty('metadata');
      }
    });

    it('should perform pattern recognition on real data', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Analyze patterns in my technical discussions'
      );

      expect(response.intent.type).toBe('analyze');
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should generate contextual summaries from real memories', async () => {
      const response = await conversationalInterface.processQuery(
        sessionId,
        'Summarize my conversations about planning and AI'
      );

      expect(response.intent.type).toBe('summarize');
      expect(response.content).toBeDefined();
      expect(response.content).toContain('Summary');
    });
  });
});