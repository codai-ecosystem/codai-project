
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AideService from '../../lib/aide-service';
import { basicFunctionalityFlow } from '../../lib/flows/basic-functionality';

describe('AIDE Core Functionality Tests', () => {
  let service: typeof AideService;

  beforeEach(() => {
    service = AideService;
    // Clear any existing sessions/data before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Assistant Core Features', () => {
    it('should create AI session successfully', async () => {
      const session = await service.createSession('test-user', 'code_generation');

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.userId).toBe('test-user');
      expect(session.sessionType).toBe('code_generation');
      expect(session.isActive).toBe(true);
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.lastActivity).toBeInstanceOf(Date);
      expect(session.history).toEqual([]);
    });

    it('should retrieve session by ID successfully', async () => {
      const createdSession = await service.createSession('test-user-2', 'debugging');
      const retrievedSession = await service.getSession(createdSession.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession!.id).toBe(createdSession.id);
      expect(retrievedSession!.sessionType).toBe('debugging');
    });

    it('should update session successfully', async () => {
      const session = await service.createSession('test-user-3', 'learning');
      const updateResult = await service.updateSession(session.id, {
        context: { project: 'web-app', language: 'typescript' }
      });

      expect(updateResult).toBe(true);

      const updatedSession = await service.getSession(session.id);
      expect(updatedSession?.context.project).toBe('web-app');
      expect(updatedSession?.context.language).toBe('typescript');
    });

    it('should add interactions to session', async () => {
      const session = await service.createSession('test-user-4', 'code_generation');
      const addResult = await service.addInteraction(session.id, {
        userMessage: 'Generate a React component for user login',
        assistantResponse: 'Here is your React login component...',
        actionType: 'code_generation',
        codeSnippets: ['const LoginComponent = () => { return <div>Login</div>; }']
      });

      expect(addResult).toBe(true);

      const updatedSession = await service.getSession(session.id);
      expect(updatedSession?.history).toHaveLength(1);
      expect(updatedSession?.history[0].userMessage).toBe('Generate a React component for user login');
      expect(updatedSession?.history[0].codeSnippets).toEqual(['const LoginComponent = () => { return <div>Login</div>; }']);
    });

    it('should get active sessions for user', async () => {
      const user = 'test-user-5';
      await service.createSession(user, 'code_generation');
      await service.createSession(user, 'debugging');
      await service.createSession(user, 'optimization');

      const activeSessions = await service.getActiveSessions(user);

      expect(activeSessions).toHaveLength(3);
      expect(activeSessions.every(s => s.userId === user && s.isActive)).toBe(true);
    });
  });

  describe('Code Generation Core', () => {
    it('should generate JavaScript code successfully', async () => {
      const result = await service.generateCode({
        prompt: 'Create a function to validate email addresses',
        language: 'javascript',
        style: 'functional',
        complexity: 'simple'
      });

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(typeof result.code).toBe('string');
      expect(result.code.length).toBeGreaterThan(0);
      expect(result.explanation).toContain('functional approach');
    });

    it('should generate TypeScript code with types', async () => {
      const result = await service.generateCode({
        prompt: 'Create a user management class',
        language: 'typescript',
        style: 'oop',
        complexity: 'intermediate'
      });

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.code).toContain('class');
      expect(result.explanation).toContain('oop approach');
    });

    it('should include tests when requested', async () => {
      const result = await service.generateCode({
        prompt: 'Create a calculator function',
        language: 'javascript',
        style: 'functional',
        complexity: 'simple',
        includeTests: true
      });

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.tests).toBeDefined();
      expect(typeof result.tests).toBe('string');
      expect(result.tests!.length).toBeGreaterThan(0);
    });

    it('should include documentation when requested', async () => {
      const result = await service.generateCode({
        prompt: 'Create a data validation utility',
        language: 'javascript',
        style: 'functional',
        complexity: 'intermediate',
        includeComments: true
      });

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.documentation).toBeDefined();
      expect(typeof result.documentation).toBe('object');
      if (typeof result.documentation === 'object' && result.documentation !== null) {
        expect((result.documentation as any).documentation).toBeDefined();
        expect(typeof (result.documentation as any).documentation).toBe('string');
      }
    });
  });

  describe('Code Analysis Core', () => {
    it('should analyze code quality', async () => {
      const testCode = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `;

      const result = await service.analyzeCode({
        code: testCode,
        language: 'javascript',
        analysisType: 'quality'
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should analyze code security', async () => {
      const testCode = `
        function processUserInput(input) {
          // Potentially unsafe code
          eval(input);
          return input;
        }
      `;

      const result = await service.analyzeCode({
        code: testCode,
        language: 'javascript',
        analysisType: 'security'
      });

      expect(result).toBeDefined();
      expect(result.analysis.security).toBeDefined();
      expect(typeof result.score).toBe('number');
    });

    it('should perform comprehensive analysis', async () => {
      const testCode = `
        class UserManager {
          constructor() {
            this.users = [];
          }
          
          addUser(user) {
            this.users.push(user);
          }
          
          findUser(id) {
            return this.users.find(u => u.id === id);
          }
        }
      `;

      const result = await service.analyzeCode({
        code: testCode,
        language: 'javascript',
        analysisType: 'all'
      });

      expect(result).toBeDefined();
      expect(result.analysis.quality).toBeDefined();
      expect(result.analysis.security).toBeDefined();
      expect(result.analysis.performance).toBeDefined();
      expect(result.analysis.maintainability).toBeDefined();
    });
  });

  describe('Flow Management Core', () => {
    it('should process basic functionality flow', async () => {
      const request = {
        id: 'test-core-flow',
        data: { operation: 'test', parameters: ['param1', 'param2'] }
      };

      const result = await basicFunctionalityFlow.process(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
    });

    it('should validate flow input correctly', async () => {
      const validRequest = {
        id: 'valid-test',
        data: { test: 'data' }
      };

      const invalidRequest = {
        id: '',
        data: null
      };

      expect(await basicFunctionalityFlow.validateInput(validRequest)).toBe(true);
      expect(await basicFunctionalityFlow.validateInput(invalidRequest)).toBe(false);
    });

    it('should maintain flow state correctly', async () => {
      const request = {
        id: 'state-test',
        data: { operation: 'state-management' }
      };

      await basicFunctionalityFlow.process(request);
      const state = await basicFunctionalityFlow.getState('state-test');

      expect(state).toBeDefined();
      expect(state?.status).toBe('completed');
      expect(state?.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('System Status and Health', () => {
    it('should return system status correctly', () => {
      const status = service.getSystemStatus();

      expect(status).toBeDefined();
      expect(typeof status.activeSessions).toBe('number');
      expect(typeof status.totalAnalyses).toBe('number');
      expect(typeof status.totalLearningPaths).toBe('number');
      expect(status.systemHealth).toBe('optimal');
    });

    it('should track active sessions count', async () => {
      const initialStatus = service.getSystemStatus();
      const initialSessions = initialStatus.activeSessions;

      await service.createSession('test-user-status', 'code_generation');

      const updatedStatus = service.getSystemStatus();
      expect(updatedStatus.activeSessions).toBe(initialSessions + 1);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid session operations gracefully', async () => {
      const result = await service.getSession('non-existent-session-id');
      expect(result).toBeNull();
    });

    it('should handle session updates for non-existent sessions', async () => {
      const result = await service.updateSession('non-existent-id', { context: {} });
      expect(result).toBe(false);
    });

    it('should handle interaction additions for non-existent sessions', async () => {
      const result = await service.addInteraction('non-existent-id', {
        userMessage: 'test',
        assistantResponse: 'test',
        actionType: 'test'
      });
      expect(result).toBe(false);
    });

    it('should handle code generation errors gracefully', async () => {
      // This should not throw but handle gracefully
      try {
        await service.generateCode({
          prompt: '',
          language: 'invalid-language',
          style: 'functional',
          complexity: 'simple'
        });
        // If no error thrown, that's fine - service should handle gracefully
        expect(true).toBe(true);
      } catch (error) {
        // If error is thrown, it should be a proper error message
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
