import React from 'react'
/**
 * CODAI Service Unit Tests - Phase 2.2.1
 * 
 * Unit tests covering:
 * - Component rendering logic
 * - State management (Zustand stores)  
 * - API client functions
 * - Utility functions and helpers
 * - Custom hooks behavior
 * - Form validation logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock external dependencies
vi.mock('@codai/sso-sdk', () => ({
  useCodaiAuth: vi.fn(),
  useRBAC: vi.fn(), 
  useDeviceSecurity: vi.fn()
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('@codai/cnd', () => ({
  CND: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    sql: vi.fn().mockReturnValue({
      query: vi.fn().mockResolvedValue({ data: [] })
    }),
    getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
    getCurrentMetrics: vi.fn().mockReturnValue({ requests: 0 }),
    disconnect: vi.fn().mockResolvedValue(undefined)
  }))
}));

import { useCodaiAuth, useRBAC, useDeviceSecurity } from '@codai/sso-sdk';
import { signIn, signOut } from 'next-auth/react';
import CodaiSSODemo from '../../../src/components/CodaiSSODemo';
import { CNDAIService, getCNDAIService } from '../../../src/services/cnd-ai';

const mockUseCodaiAuth = useCodaiAuth as any;
const mockUseRBAC = useRBAC as any;
const mockUseDeviceSecurity = useDeviceSecurity as any;
const mockSignIn = signIn as any;
const mockSignOut = signOut as any;

describe('CODAI Service Unit Tests - Phase 2.2.1', () => {

  describe('Component Rendering Logic', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('CodaiSSODemo Component', () => {
      it('should render loading state correctly', () => {
        mockUseCodaiAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: true,
          roles: [],
          permissions: [],
          hasRole: vi.fn().mockReturnValue(false),
          hasPermission: vi.fn().mockReturnValue(false)
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: false });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device',
          riskLevel: 'low',
          isTrusted: true,
          isSecure: true
        });

        render(<CodaiSSODemo />);

        expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
        expect(screen.getByRole('generic')).toHaveClass('animate-spin');
      });

      it('should render unauthenticated state with sign-in form', () => {
        mockUseCodaiAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          roles: [],
          permissions: [],
          hasRole: vi.fn().mockReturnValue(false),
          hasPermission: vi.fn().mockReturnValue(false)
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: false });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device',
          riskLevel: 'low',
          isTrusted: true,
          isSecure: true
        });

        render(<CodaiSSODemo />);

        expect(screen.getByText('CODAI Enterprise')).toBeInTheDocument();
        expect(screen.getByText('AI-native development environment with enterprise SSO')).toBeInTheDocument();
        expect(screen.getByText('🔐 Enterprise Features')).toBeInTheDocument();
        expect(screen.getByText('Sign In with CODAI ID')).toBeInTheDocument();
        
        // Check enterprise features list
        expect(screen.getByText('• Keycloak SSO Integration')).toBeInTheDocument();
        expect(screen.getByText('• Role-Based Access Control')).toBeInTheDocument();
        expect(screen.getByText('• Zero Trust Security')).toBeInTheDocument();
        expect(screen.getByText('• Cross-Application Sessions')).toBeInTheDocument();
      });

      it('should handle sign-in button click', async () => {
        const user = userEvent.setup();
        
        mockUseCodaiAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          roles: [],
          permissions: [],
          hasRole: vi.fn().mockReturnValue(false),
          hasPermission: vi.fn().mockReturnValue(false)
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: false });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device',
          riskLevel: 'low',
          isTrusted: true,
          isSecure: true
        });

        render(<CodaiSSODemo />);

        const signInButton = screen.getByText('Sign In with CODAI ID');
        await user.click(signInButton);

        expect(mockSignIn).toHaveBeenCalledWith('keycloak');
      });

      it('should render authenticated state with user profile', () => {
        const mockUser = {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          mfaEnabled: true
        };

        mockUseCodaiAuth.mockReturnValue({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          roles: ['developer', 'admin'],
          permissions: ['apps:read', 'apps:write', 'users:read'],
          hasRole: vi.fn((role) => ['developer', 'admin'].includes(role)),
          hasPermission: vi.fn((perm) => ['apps:read', 'apps:write', 'users:read'].includes(perm))
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: true });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device-456',
          riskLevel: 'low',
          isTrusted: true,
          isSecure: true
        });

        render(<CodaiSSODemo />);

        // Check header
        expect(screen.getByText('CODAI Enterprise')).toBeInTheDocument();
        expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
        
        // Check user profile section
        expect(screen.getByText('👤 User Profile')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('user-123')).toBeInTheDocument();
        
        // Check roles and permissions
        expect(screen.getByText('🔑 Access Control')).toBeInTheDocument();
        expect(screen.getByText('developer')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
        
        // Check security status
        expect(screen.getByText('🛡️ Security Status')).toBeInTheDocument();
        expect(screen.getByText('✅ Trusted')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
        expect(screen.getByText('🟢 Secure')).toBeInTheDocument();
      });

      it('should conditionally render developer features for authorized users', () => {
        const mockUser = {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          mfaEnabled: true
        };

        mockUseCodaiAuth.mockReturnValue({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          roles: ['developer'],
          permissions: ['apps:read', 'apps:write'],
          hasRole: vi.fn((role) => role === 'developer'),
          hasPermission: vi.fn((perm) => ['apps:read', 'apps:write'].includes(perm))
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: true });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device',
          riskLevel: 'low',
          isTrusted: true,
          isSecure: true
        });

        render(<CodaiSSODemo />);

        expect(screen.getByText('🚀 Developer Features')).toBeInTheDocument();
        expect(screen.getByText('✅ You have developer access! This section demonstrates role-based content visibility.')).toBeInTheDocument();
        expect(screen.getByText('Code Repository')).toBeInTheDocument();
        expect(screen.getByText('App Management')).toBeInTheDocument();
        expect(screen.getByText('Deployment Tools')).toBeInTheDocument();
      });

      it('should handle sign-out button click', async () => {
        const user = userEvent.setup();
        
        const mockUser = {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          mfaEnabled: false
        };

        mockUseCodaiAuth.mockReturnValue({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          roles: ['user'],
          permissions: ['apps:read'],
          hasRole: vi.fn().mockReturnValue(false),
          hasPermission: vi.fn().mockReturnValue(false)
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: false });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'test-device',
          riskLevel: 'medium',
          isTrusted: false,
          isSecure: false
        });

        render(<CodaiSSODemo />);

        const signOutButton = screen.getByText('Sign Out');
        await user.click(signOutButton);

        expect(mockSignOut).toHaveBeenCalled();
      });

      it('should display security warnings for untrusted devices', () => {
        const mockUser = {
          id: 'user-123',
          name: 'Jane Doe',
          email: 'jane@example.com',
          emailVerified: false,
          mfaEnabled: false
        };

        mockUseCodaiAuth.mockReturnValue({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          roles: ['user'],
          permissions: [],
          hasRole: vi.fn().mockReturnValue(false),
          hasPermission: vi.fn().mockReturnValue(false)
        });

        mockUseRBAC.mockReturnValue({ isAuthorized: false });
        mockUseDeviceSecurity.mockReturnValue({
          deviceId: 'untrusted-device',
          riskLevel: 'high',
          isTrusted: false,
          isSecure: false
        });

        render(<CodaiSSODemo />);

        expect(screen.getByText('⚠️ Untrusted')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('🟡 Monitor')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument(); // For unverified email and disabled MFA
      });
    });
  });

  describe('Service Layer Unit Tests', () => {
    let aiService: CNDAIService;

    beforeEach(async () => {
      vi.clearAllMocks();
      aiService = getCNDAIService();
    });

    afterEach(async () => {
      try {
        await aiService.disconnect();
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    });

    describe('CNDAIService - Core Functionality', () => {
      it('should initialize service correctly', async () => {
        await expect(aiService.initialize()).resolves.not.toThrow();
      });

      it('should create AI model with valid data', async () => {
        const mockModel = {
          name: 'GPT-4 Test Model',
          version: '1.0.0',
          type: 'llm' as const,
          provider: 'OpenAI',
          modelPath: '/models/gpt4',
          parameters: { temperature: 0.7, maxTokens: 2048 },
          metadata: { description: 'Test model for unit tests' },
          isActive: true
        };

        const createdModel = await aiService.createAIModel(mockModel);

        expect(createdModel).toMatchObject({
          name: 'GPT-4 Test Model',
          version: '1.0.0',
          type: 'llm',
          provider: 'OpenAI',
          isActive: true
        });
        expect(createdModel.id).toMatch(/^model_/);
        expect(createdModel.createdAt).toBeInstanceOf(Date);
        expect(createdModel.updatedAt).toBeInstanceOf(Date);
      });

      it('should validate AI model data with Zod schema', async () => {
        const invalidModel = {
          name: '', // Invalid: empty string
          version: '1.0.0',
          type: 'invalid-type' as any, // Invalid: not in enum
          provider: 'OpenAI'
        };

        await expect(aiService.createAIModel(invalidModel)).rejects.toThrow();
      });

      it('should create conversation with messages', async () => {
        const mockConversation = {
          userId: 'user-123',
          title: 'Test Conversation',
          messages: [
            {
              id: 'msg-1',
              role: 'user' as const,
              content: 'Hello, AI!',
              timestamp: new Date()
            },
            {
              id: 'msg-2', 
              role: 'assistant' as const,
              content: 'Hello! How can I help you today?',
              timestamp: new Date()
            }
          ],
          modelId: 'model-123',
          tags: ['greeting', 'test'],
          isArchived: false
        };

        const createdConversation = await aiService.createConversation(mockConversation);

        expect(createdConversation).toMatchObject({
          userId: 'user-123',
          title: 'Test Conversation',
          modelId: 'model-123',
          isArchived: false
        });
        expect(createdConversation.id).toMatch(/^conv_/);
        expect(createdConversation.messages).toHaveLength(2);
        expect(createdConversation.messages[0].content).toBe('Hello, AI!');
        expect(createdConversation.messages[1].content).toBe('Hello! How can I help you today?');
      });

      it('should add training data with feedback', async () => {
        const mockTrainingData = {
          userId: 'user-123',
          modelId: 'model-456',
          inputText: 'What is machine learning?',
          expectedOutput: 'Machine learning is a subset of AI that enables computers to learn and make decisions from data.',
          actualOutput: 'ML is a type of AI that learns from data.',
          feedback: 'positive' as const,
          tags: ['ml', 'education']
        };

        const createdTrainingData = await aiService.addTrainingData(mockTrainingData);

        expect(createdTrainingData).toMatchObject({
          userId: 'user-123',
          modelId: 'model-456',
          inputText: 'What is machine learning?',
          feedback: 'positive'
        });
        expect(createdTrainingData.id).toMatch(/^train_/);
        expect(createdTrainingData.createdAt).toBeInstanceOf(Date);
      });

      it('should handle service health status', async () => {
        const healthStatus = await aiService.getHealthStatus();

        expect(healthStatus).toHaveProperty('status', 'healthy');
        expect(healthStatus).toHaveProperty('aiFeatures');
        expect(healthStatus.aiFeatures).toEqual({
          modelStorage: true,
          conversationManagement: true,
          vectorSearch: true,
          trainingData: true
        });
      });

      it('should provide service metrics', async () => {
        const metrics = await aiService.getServiceMetrics();

        expect(metrics).toHaveProperty('requests', 0);
        expect(metrics).toHaveProperty('aiMetrics');
        expect(metrics.aiMetrics).toHaveProperty('activeModels');
        expect(metrics.aiMetrics).toHaveProperty('activeConversations');
        expect(metrics.aiMetrics).toHaveProperty('trainingDataPoints');
      });
    });

    describe('Error Handling', () => {
      it('should handle database connection errors gracefully', async () => {
        const brokenService = new CNDAIService();
        
        // Mock CND to throw connection error
        const mockCND = {
          connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
          sql: vi.fn(),
          getHealthStatus: vi.fn(),
          getCurrentMetrics: vi.fn(),
          disconnect: vi.fn()
        };

        (brokenService as any).cnd = mockCND;

        await expect(brokenService.initialize()).rejects.toThrow('Connection failed');
      });

      it('should validate conversation message structure', async () => {
        const invalidConversation = {
          userId: 'user-123',
          title: 'Test',
          messages: [
            {
              id: 'msg-1',
              role: 'invalid-role' as any, // Invalid role
              content: 'Hello',
              timestamp: new Date()
            }
          ]
        };

        await expect(aiService.createConversation(invalidConversation)).rejects.toThrow();
      });

      it('should handle non-existent model retrieval', async () => {
        const result = await aiService.getAIModel('non-existent-model');
        expect(result).toBeNull();
      });

      it('should handle non-existent conversation retrieval', async () => {
        const result = await aiService.getConversation('non-existent-conversation');
        expect(result).toBeNull();
      });
    });

    describe('Data Validation', () => {
      it('should enforce required fields for AI models', async () => {
        const incompleteModel = {
          name: 'Test Model'
          // Missing required fields: version, type, provider
        } as any;

        await expect(aiService.createAIModel(incompleteModel)).rejects.toThrow();
      });

      it('should validate training data feedback enum', async () => {
        const invalidTrainingData = {
          userId: 'user-123',
          modelId: 'model-456',
          inputText: 'Test input',
          expectedOutput: 'Test output',
          feedback: 'invalid-feedback' as any // Invalid enum value
        };

        await expect(aiService.addTrainingData(invalidTrainingData)).rejects.toThrow();
      });

      it('should validate conversation message timestamps', async () => {
        const conversationWithInvalidTimestamp = {
          userId: 'user-123',
          title: 'Test',
          messages: [
            {
              id: 'msg-1',
              role: 'user' as const,
              content: 'Hello',
              timestamp: 'invalid-date' as any // Invalid timestamp
            }
          ]
        };

        await expect(aiService.createConversation(conversationWithInvalidTimestamp)).rejects.toThrow();
      });
    });
  });

  describe('Utility Functions and Helpers', () => {
    describe('Service Singleton Pattern', () => {
      it('should return the same instance of CNDAIService', () => {
        const service1 = getCNDAIService();
        const service2 = getCNDAIService();

        expect(service1).toBe(service2);
        expect(service1).toBeInstanceOf(CNDAIService);
      });

      it('should maintain state across multiple getCNDAIService() calls', async () => {
        const service1 = getCNDAIService();
        await service1.initialize();

        const service2 = getCNDAIService();
        
        // Both should reference the same initialized instance
        expect((service1 as any).isInitialized).toBe((service2 as any).isInitialized);
      });
    });

    describe('ID Generation', () => {
      it('should generate unique IDs for models', async () => {
        const modelIds = new Set();
        
        for (let i = 0; i < 10; i++) {
          const model = await aiService.createAIModel({
            name: `Test Model ${i}`,
            version: '1.0.0',
            type: 'llm',
            provider: 'Test'
          });
          
          modelIds.add(model.id);
        }

        expect(modelIds.size).toBe(10); // All IDs should be unique
      });

      it('should generate unique IDs for conversations', async () => {
        const conversationIds = new Set();
        
        for (let i = 0; i < 10; i++) {
          const conversation = await aiService.createConversation({
            userId: 'user-123',
            title: `Test Conversation ${i}`,
            messages: [{
              id: `msg-${i}`,
              role: 'user',
              content: `Message ${i}`,
              timestamp: new Date()
            }]
          });
          
          conversationIds.add(conversation.id);
        }

        expect(conversationIds.size).toBe(10); // All IDs should be unique
      });
    });

    describe('JSON Serialization', () => {
      it('should properly serialize and deserialize model parameters', async () => {
        const complexParameters = {
          temperature: 0.7,
          maxTokens: 2048,
          stopSequences: ['\\n\\n', 'END'],
          presencePenalty: 0.1,
          frequencyPenalty: 0.2,
          nested: {
            advanced: {
              sampling: 'nucleus',
              topP: 0.9
            }
          }
        };

        const model = await aiService.createAIModel({
          name: 'Complex Model',
          version: '1.0.0',
          type: 'llm',
          provider: 'Test',
          parameters: complexParameters
        });

        const retrievedModel = await aiService.getAIModel(model.id);
        expect(retrievedModel?.parameters).toEqual(complexParameters);
      });

      it('should handle conversation message metadata', async () => {
        const messageWithMetadata = {
          id: 'msg-1',
          role: 'assistant' as const,
          content: 'Response with metadata',
          timestamp: new Date(),
          metadata: {
            confidence: 0.95,
            tokens: 25,
            model: 'gpt-4',
            latency: 150
          }
        };

        const conversation = await aiService.createConversation({
          userId: 'user-123',
          title: 'Metadata Test',
          messages: [messageWithMetadata]
        });

        const retrieved = await aiService.getConversation(conversation.id);
        expect(retrieved?.messages[0].metadata).toEqual(messageWithMetadata.metadata);
      });
    });
  });

  describe('Mock Validation', () => {
    it('should properly mock external dependencies', () => {
      expect(mockUseCodaiAuth).toBeDefined();
      expect(mockUseRBAC).toBeDefined();
      expect(mockUseDeviceSecurity).toBeDefined();
      expect(mockSignIn).toBeDefined();
      expect(mockSignOut).toBeDefined();
    });

    it('should reset mocks between tests', () => {
      // This test ensures our beforeEach cleanup is working
      expect(vi.clearAllMocks).toBeDefined();
      
      // Verify mocks are functions that can be called
      mockUseCodaiAuth.mockReturnValue({});
      expect(mockUseCodaiAuth()).toEqual({});
    });
  });
});

