# 🔬 Sprint 15 Automated Testing Pipeline

**Project**: CODAI Mobile App & AI Router Testing  
**Sprint**: 15 (September 11-24, 2025)  
**Pipeline Version**: 1.0  
**Implementation Date**: August 27, 2025  

---

## 🎯 Testing Strategy Overview

### Comprehensive Testing Framework
```yaml
Testing Pyramid:
  e2e_tests:
    percentage: "10% of total tests"
    focus: "Critical user journeys"
    tools: ["Detox (React Native)", "Playwright (Web)"]
    execution: "On deployment to staging"
  
  integration_tests:
    percentage: "20% of total tests"
    focus: "API endpoints and service communication"
    tools: ["Supertest", "Jest", "Testcontainers"]
    execution: "On every pull request"
  
  unit_tests:
    percentage: "70% of total tests"
    focus: "Individual functions and components"
    tools: ["Jest", "React Native Testing Library"]
    execution: "On every commit"

quality_gates:
  code_coverage: "≥85% for all new code"
  test_execution_time: "≤8 minutes for full suite"
  test_reliability: "≥98% pass rate (flaky test threshold)"
  performance_regression: "No degradation >5% in key metrics"
```

---

## 📱 Mobile App Testing Pipeline

### React Native Testing Configuration

#### Unit Testing Setup
```javascript
// Jest configuration for React Native
// packages/mobile-app/jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['module:metro-react-native-babel-preset'],
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/__tests__/**',
    '!src/**/*.stories.{js,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

// Test utilities setup
// src/test-utils/setup.js
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve({ username: 'test', password: 'test' })),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
}));

// Mock Voice Recording
jest.mock('react-native-voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
  onSpeechResults: jest.fn(),
  onSpeechError: jest.fn(),
}));

// Mock Biometric Authentication
jest.mock('react-native-biometrics', () => ({
  createKeys: jest.fn(() => Promise.resolve({ publicKey: 'mock-key' })),
  biometricKeysExist: jest.fn(() => Promise.resolve({ keysExist: true })),
  createSignature: jest.fn(() => Promise.resolve({ success: true, signature: 'mock-signature' })),
}));

// Global test utilities
global.mockApiResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});
```

#### Component Testing Framework
```typescript
// Example component test
// src/components/__tests__/ChatMessage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatMessage } from '../ChatMessage';
import { mockApiResponse } from '../../test-utils/setup';

describe('ChatMessage Component', () => {
  const mockProps = {
    message: {
      id: '1',
      content: 'Hello AI',
      role: 'user' as const,
      timestamp: new Date('2025-08-27T10:00:00Z'),
    },
    onResend: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(<ChatMessage {...mockProps} />);
    
    expect(screen.getByText('Hello AI')).toBeTruthy();
    expect(screen.getByTestId('user-message')).toBeTruthy();
  });

  it('renders AI assistant message with metadata', () => {
    const assistantMessage = {
      ...mockProps,
      message: {
        ...mockProps.message,
        role: 'assistant' as const,
        content: 'Hello! How can I help you?',
        metadata: {
          model_used: 'gpt4o',
          tokens_used: 15,
          response_time_ms: 150,
        },
      },
    };

    render(<ChatMessage {...assistantMessage} />);
    
    expect(screen.getByText('Hello! How can I help you?')).toBeTruthy();
    expect(screen.getByTestId('ai-message')).toBeTruthy();
    expect(screen.getByText('GPT-4o')).toBeTruthy();
    expect(screen.getByText('150ms')).toBeTruthy();
  });

  it('handles message resend action', async () => {
    render(<ChatMessage {...mockProps} />);
    
    const resendButton = screen.getByTestId('resend-button');
    fireEvent.press(resendButton);
    
    await waitFor(() => {
      expect(mockProps.onResend).toHaveBeenCalledWith(mockProps.message.id);
    });
  });

  it('handles voice playback for AI messages', async () => {
    const voiceMessage = {
      ...mockProps,
      message: {
        ...mockProps.message,
        role: 'assistant' as const,
        content: 'This is a voice response',
        metadata: {
          has_audio: true,
          audio_url: 'https://api.codai.dev/audio/123',
        },
      },
    };

    render(<ChatMessage {...voiceMessage} />);
    
    const playButton = screen.getByTestId('play-voice-button');
    expect(playButton).toBeTruthy();
    
    fireEvent.press(playButton);
    
    // Voice playback would be tested with mocked audio service
    await waitFor(() => {
      expect(screen.getByTestId('voice-playing-indicator')).toBeTruthy();
    });
  });
});
```

#### API Integration Testing
```typescript
// API service testing
// src/services/__tests__/AIService.test.ts
import { AIService } from '../AIService';
import { mockApiResponse } from '../../test-utils/setup';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIService', () => {
  let aiService: AIService;
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    aiService = new AIService();
    aiService.setAuthToken(mockToken);
    jest.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('sends chat message successfully', async () => {
      const mockResponse = {
        response: 'AI response to your question',
        model_used: 'gpt4o',
        conversation_id: 'conv-123',
        tokens_used: 25,
        latency_ms: 180,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockResponse)
      );

      const result = await aiService.sendChatMessage({
        message: 'What is the weather?',
        conversationId: 'conv-123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.codai.dev/mobile/v1/ai/chat',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
            'X-Platform': 'ios', // or 'android' based on platform
          },
          body: JSON.stringify({
            message: 'What is the weather?',
            conversation_id: 'conv-123',
            context: expect.any(Object),
            platform: 'mobile',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles API error gracefully', async () => {
      const mockError = {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        retry_after: 30,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockError, 429)
      );

      await expect(
        aiService.sendChatMessage({
          message: 'Test message',
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('implements retry logic for network failures', async () => {
      // First call fails, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          mockApiResponse({ response: 'Success after retry' })
        );

      const result = await aiService.sendChatMessage({
        message: 'Test retry',
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result.response).toBe('Success after retry');
    });
  });

  describe('WebSocket connection', () => {
    it('establishes WebSocket connection for streaming', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        readyState: WebSocket.OPEN,
      };

      // Mock WebSocket constructor
      (global as any).WebSocket = jest.fn(() => mockWebSocket);

      const ws = aiService.connectToStreaming();
      
      expect(WebSocket).toHaveBeenCalledWith(
        'wss://api.codai.dev/ai/chat/stream',
        undefined,
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });
  });
});
```

### Mobile End-to-End Testing

#### Detox E2E Configuration
```javascript
// .detoxrc.json
{
  "testRunner": "jest",
  "runnerConfig": "e2e/jest.config.js",
  "skipLegacyWorkersInjection": true,
  "apps": {
    "ios.debug": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/CODAIMobile.app",
      "build": "xcodebuild -workspace ios/CODAIMobile.xcworkspace -scheme CODAIMobile -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "ios.release": {
      "type": "ios.app", 
      "binaryPath": "ios/build/Build/Products/Release-iphonesimulator/CODAIMobile.app",
      "build": "xcodebuild -workspace ios/CODAIMobile.xcworkspace -scheme CODAIMobile -configuration Release -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "android.debug": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
      "build": "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug"
    },
    "android.release": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/release/app-release.apk", 
      "build": "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release"
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 14 Pro"
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_4_API_30"
      }
    }
  },
  "configurations": {
    "ios.sim.debug": {
      "device": "simulator",
      "app": "ios.debug"
    },
    "ios.sim.release": {
      "device": "simulator", 
      "app": "ios.release"
    },
    "android.emu.debug": {
      "device": "emulator",
      "app": "android.debug"
    },
    "android.emu.release": {
      "device": "emulator",
      "app": "android.release"
    }
  }
}

// E2E test configuration
// e2e/jest.config.js
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'detox/runners/jest/reporter',
    ['jest-html-reporters', {
      'publicPath': './e2e/reports',
      'filename': 'e2e-test-report.html',
      'openReport': false
    }]
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
```

#### E2E Test Scenarios
```javascript
// e2e/authentication.test.js
import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should complete email/password login flow', async () => {
    // Navigate to login screen
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await element(by.id('login-button')).tap();
    
    // Enter credentials
    await expect(element(by.id('login-form'))).toBeVisible();
    await element(by.id('email-input')).typeText('test@codai.dev');
    await element(by.id('password-input')).typeText('SecurePass123!');
    
    // Submit login
    await element(by.id('submit-login')).tap();
    
    // Verify successful login
    await expect(element(by.id('chat-screen'))).toBeVisible(10000);
    await expect(element(by.text('Welcome back!'))).toBeVisible();
  });

  it('should handle SSO authentication flow', async () => {
    // Start SSO flow
    await element(by.id('sso-login-button')).tap();
    
    // Select SSO provider (mocked in test environment)
    await expect(element(by.id('sso-provider-selection'))).toBeVisible();
    await element(by.id('microsoft-sso')).tap();
    
    // Mock SSO success (would normally open web view)
    await device.sendUserNotification({
      trigger: {
        type: 'push',
      },
      payload: {
        sso_success: true,
        token: 'mock-sso-token',
      },
    });
    
    // Verify SSO login success
    await expect(element(by.id('chat-screen'))).toBeVisible(15000);
  });

  it('should enable biometric authentication after login', async () => {
    // Complete login first
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@codai.dev');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('submit-login')).tap();
    
    // Navigate to settings
    await expect(element(by.id('chat-screen'))).toBeVisible();
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();
    
    // Enable biometric authentication
    await element(by.id('biometric-toggle')).tap();
    
    // Mock biometric enrollment
    await expect(element(by.text('Enable Face ID?'))).toBeVisible();
    await element(by.text('Enable')).tap();
    
    // Verify biometric enabled
    await expect(element(by.id('biometric-enabled-indicator'))).toBeVisible();
  });
});

// e2e/ai-chat.test.js
describe('AI Chat Functionality', () => {
  beforeEach(async () => {
    await device.launchApp();
    // Auto-login for chat tests
    await device.sendUserNotification({
      payload: { auto_login: true, token: 'test-token' }
    });
    await expect(element(by.id('chat-screen'))).toBeVisible();
  });

  it('should send text message and receive AI response', async () => {
    const testMessage = 'What is artificial intelligence?';
    
    // Type message
    await element(by.id('message-input')).typeText(testMessage);
    await element(by.id('send-button')).tap();
    
    // Verify message sent
    await expect(element(by.text(testMessage))).toBeVisible();
    await expect(element(by.id('user-message'))).toBeVisible();
    
    // Wait for AI response
    await expect(element(by.id('ai-response'))).toBeVisible(10000);
    await expect(element(by.id('ai-metadata'))).toBeVisible();
    
    // Verify response contains model information
    await expect(element(by.text('GPT-4o'))).toBeVisible();
  });

  it('should handle voice input and playback', async () => {
    // Start voice recording
    await element(by.id('voice-button')).tap();
    await expect(element(by.id('recording-indicator'))).toBeVisible();
    
    // Simulate voice input (mocked in test environment)
    await device.shake(); // Trigger voice input mock
    
    // Stop recording
    await element(by.id('stop-recording')).tap();
    
    // Wait for transcription
    await expect(element(by.id('transcription-text'))).toBeVisible(5000);
    
    // Verify AI response with voice
    await expect(element(by.id('ai-voice-response'))).toBeVisible(10000);
    await expect(element(by.id('play-voice-button'))).toBeVisible();
    
    // Test voice playback
    await element(by.id('play-voice-button')).tap();
    await expect(element(by.id('voice-playing-indicator'))).toBeVisible();
  });

  it('should work offline and sync when back online', async () => {
    // Disable network
    await device.setURLBlacklist(['*']);
    
    // Send message while offline
    const offlineMessage = 'This is an offline message';
    await element(by.id('message-input')).typeText(offlineMessage);
    await element(by.id('send-button')).tap();
    
    // Verify offline indicator
    await expect(element(by.id('offline-indicator'))).toBeVisible();
    await expect(element(by.id('message-queued'))).toBeVisible();
    
    // Re-enable network
    await device.setURLBlacklist([]);
    
    // Verify sync process
    await expect(element(by.id('syncing-indicator'))).toBeVisible();
    await expect(element(by.id('sync-complete'))).toBeVisible(15000);
    
    // Verify message was sent
    await expect(element(by.text(offlineMessage))).toBeVisible();
    await expect(element(by.id('ai-response'))).toBeVisible();
  });
});
```

---

## 🧠 AI Router Testing Pipeline

### AI Service Integration Testing

#### Model Integration Tests
```typescript
// AI Router testing framework
// services/ai-router/__tests__/AIRouter.test.ts
import { AIRouter } from '../AIRouter';
import { GPT4oAdapter } from '../adapters/GPT4oAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter'; 
import { RomAIAdapter } from '../adapters/RomAIAdapter';

describe('AIRouter', () => {
  let aiRouter: AIRouter;
  let mockGPT4o: jest.Mocked<GPT4oAdapter>;
  let mockClaude: jest.Mocked<ClaudeAdapter>;
  let mockRomAI: jest.Mocked<RomAIAdapter>;

  beforeEach(() => {
    mockGPT4o = {
      execute: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getCapabilities: jest.fn().mockReturnValue(['text', 'vision', 'code']),
    } as any;

    mockClaude = {
      execute: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getCapabilities: jest.fn().mockReturnValue(['text', 'analysis', 'creative']),
    } as any;

    mockRomAI = {
      execute: jest.fn(),
      isHealthy: jest.fn().mockResolvedValue(true),
      getCapabilities: jest.fn().mockReturnValue(['text', 'romanian', 'math']),
    } as any;

    aiRouter = new AIRouter({
      models: new Map([
        ['gpt4o', mockGPT4o],
        ['claude35', mockClaude],
        ['romai', mockRomAI],
      ]),
    });
  });

  describe('request routing', () => {
    it('routes Romanian language requests to RomAI', async () => {
      const request = {
        content: 'Salut! Cum te cheamă?',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      mockRomAI.execute.mockResolvedValue({
        content: 'Salut! Mă numesc RomAI.',
        metadata: { model: 'romai', tokens: 15 },
      });

      const response = await aiRouter.route(request);

      expect(mockRomAI.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          content: request.content,
          context: request.context,
        })
      );
      expect(response.content).toBe('Salut! Mă numesc RomAI.');
      expect(response.metadata.model_used).toBe('romai');
    });

    it('routes visual content to GPT-4o', async () => {
      const request = {
        content: 'What do you see in this image?',
        context: { 
          conversationId: 'conv-1',
          attachments: [{ type: 'image', url: 'image.jpg' }],
        },
        userPreferences: {},
      };

      mockGPT4o.execute.mockResolvedValue({
        content: 'I can see a beautiful landscape with mountains.',
        metadata: { model: 'gpt4o', tokens: 25 },
      });

      const response = await aiRouter.route(request);

      expect(mockGPT4o.execute).toHaveBeenCalled();
      expect(response.metadata.model_used).toBe('gpt4o');
    });

    it('routes creative writing requests to Claude', async () => {
      const request = {
        content: 'Write a creative short story about time travel.',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      mockClaude.execute.mockResolvedValue({
        content: 'Once upon a time, in a world where time bent like water...',
        metadata: { model: 'claude35', tokens: 150 },
      });

      const response = await aiRouter.route(request);

      expect(mockClaude.execute).toHaveBeenCalled();
      expect(response.metadata.model_used).toBe('claude35');
    });

    it('routes mathematical problems to RomAI', async () => {
      const request = {
        content: 'Calculate the derivative of x^2 + 3x + 2',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      mockRomAI.execute.mockResolvedValue({
        content: 'The derivative is 2x + 3',
        metadata: { model: 'romai', tokens: 12 },
      });

      const response = await aiRouter.route(request);

      expect(mockRomAI.execute).toHaveBeenCalled();
      expect(response.metadata.model_used).toBe('romai');
    });
  });

  describe('fallback handling', () => {
    it('falls back to secondary model when primary fails', async () => {
      const request = {
        content: 'General question about AI',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      // Primary model (GPT-4o) fails
      mockGPT4o.execute.mockRejectedValue(new Error('Service unavailable'));
      
      // Fallback to Claude
      mockClaude.execute.mockResolvedValue({
        content: 'AI is a broad field of computer science...',
        metadata: { model: 'claude35', tokens: 45 },
      });

      const response = await aiRouter.route(request);

      expect(mockGPT4o.execute).toHaveBeenCalled();
      expect(mockClaude.execute).toHaveBeenCalled();
      expect(response.metadata.model_used).toBe('claude35');
      expect(response.metadata.fallback_used).toBe(true);
    });

    it('tracks fallback usage for performance monitoring', async () => {
      const request = {
        content: 'Test request',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      mockGPT4o.execute.mockRejectedValue(new Error('Timeout'));
      mockClaude.execute.mockResolvedValue({
        content: 'Fallback response',
        metadata: { model: 'claude35', tokens: 10 },
      });

      await aiRouter.route(request);

      // Verify performance metrics are updated
      const metrics = aiRouter.getPerformanceMetrics();
      expect(metrics.fallback_count).toBeGreaterThan(0);
      expect(metrics.model_reliability.gpt4o).toBeLessThan(1.0);
    });
  });

  describe('performance optimization', () => {
    it('caches responses for identical requests', async () => {
      const request = {
        content: 'What is 2 + 2?',
        context: { conversationId: 'conv-1' },
        userPreferences: {},
      };

      mockRomAI.execute.mockResolvedValue({
        content: '2 + 2 = 4',
        metadata: { model: 'romai', tokens: 8 },
      });

      // First request
      const response1 = await aiRouter.route(request);
      expect(mockRomAI.execute).toHaveBeenCalledTimes(1);

      // Second identical request should use cache
      const response2 = await aiRouter.route(request);
      expect(mockRomAI.execute).toHaveBeenCalledTimes(1); // No additional call
      expect(response2.metadata.cache_hit).toBe(true);
    });

    it('routes to fastest performing model for general queries', async () => {
      // Set up performance history
      aiRouter.updatePerformanceMetrics('claude35', { avgLatency: 150, successRate: 0.98 });
      aiRouter.updatePerformanceMetrics('gpt4o', { avgLatency: 200, successRate: 0.95 });

      const request = {
        content: 'General question without specific requirements',
        context: { conversationId: 'conv-1' },
        userPreferences: { optimizeFor: 'speed' },
      };

      mockClaude.execute.mockResolvedValue({
        content: 'Response from fastest model',
        metadata: { model: 'claude35', tokens: 20 },
      });

      const response = await aiRouter.route(request);

      expect(mockClaude.execute).toHaveBeenCalled();
      expect(response.metadata.model_used).toBe('claude35');
      expect(response.metadata.routing_reason).toContain('performance');
    });
  });
});
```

### Load Testing Configuration
```yaml
# Load testing with Artillery.js
# load-tests/ai-router-load-test.yml
config:
  target: 'http://localhost:6101'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120  
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
    - duration: 60
      arrivalRate: 200  
      name: "Peak load"
  variables:
    test_messages:
      - "What is artificial intelligence?"
      - "Explain quantum computing"
      - "Write a poem about technology"
      - "Calculate 15% of 250"
      - "Salut! Cum merge ziua?"

scenarios:
  - name: "AI Chat Load Test"
    weight: 70
    flow:
      - post:
          url: "/ai/v1/route"
          headers:
            X-Service-Token: "{{ $processEnvironment.TEST_SERVICE_TOKEN }}"
            Content-Type: "application/json"
          json:
            content: "{{ test_messages }}"
            context:
              conversationId: "load-test-{{ $uuid }}"
            userPreferences:
              optimizeFor: "quality"
          expect:
            - statusCode: 200
            - hasProperty: "content"
            - hasProperty: "metadata.model_used"
          capture:
            - json: "$.metadata.processing_time_ms"
              as: "processing_time"

  - name: "Concurrent Model Requests"
    weight: 30
    flow:
      - parallel:
        - post:
            url: "/ai/v1/execute"
            headers:
              X-Service-Token: "{{ $processEnvironment.TEST_SERVICE_TOKEN }}"
            json:
              model: "gpt4o"
              content: "Complex reasoning task"
        - post:
            url: "/ai/v1/execute" 
            headers:
              X-Service-Token: "{{ $processEnvironment.TEST_SERVICE_TOKEN }}"
            json:
              model: "claude35"
              content: "Creative writing task"
        - post:
            url: "/ai/v1/execute"
            headers:
              X-Service-Token: "{{ $processEnvironment.TEST_SERVICE_TOKEN }}"
            json:
              model: "romai"
              content: "Mathematical computation"
```

---

## 🔄 CI/CD Pipeline Configuration

### GitHub Actions Workflow

#### Main Testing Pipeline
```yaml
# .github/workflows/sprint-15-testing.yml
name: Sprint 15 Testing Pipeline

on:
  push:
    branches: [ sprint-15, main ]
    paths:
      - 'packages/mobile-app/**'
      - 'services/ai-router/**'
      - 'packages/shared-ui/**'
  pull_request:
    branches: [ sprint-15, main ]
    paths:
      - 'packages/mobile-app/**'
      - 'services/ai-router/**'

env:
  NODE_VERSION: '18.x'
  PYTHON_VERSION: '3.11'
  JAVA_VERSION: '11'

jobs:
  # Static Analysis & Linting
  code-quality:
    name: Code Quality & Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Run TypeScript check
        run: pnpm run type-check

      - name: Run Prettier check
        run: pnpm run format:check

      - name: Security audit
        run: pnpm audit --audit-level moderate

      - name: SonarQube analysis
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Upload code quality results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: sonar-results.sarif

  # Unit Tests - Mobile App
  mobile-unit-tests:
    name: Mobile App Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run mobile app unit tests
        run: pnpm run test:mobile --coverage --maxWorkers=4
        env:
          NODE_OPTIONS: --max-old-space-size=4096

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: packages/mobile-app/coverage/lcov.info
          flags: mobile-unit-tests
          name: mobile-coverage

      - name: Archive test results
        uses: actions/upload-artifact@v3
        with:
          name: mobile-unit-test-results
          path: packages/mobile-app/coverage/

  # Unit Tests - AI Router
  ai-router-unit-tests:
    name: AI Router Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install Python dependencies
        run: |
          pip install -r services/ai-router/requirements.txt
          pip install -r services/ai-router/requirements-dev.txt

      - name: Run AI router unit tests
        run: |
          cd services/ai-router
          python -m pytest tests/unit/ --cov=. --cov-report=xml --cov-report=html

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: services/ai-router/coverage.xml
          flags: ai-router-unit-tests
          name: ai-router-coverage

  # Integration Tests
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: codai_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup test database
        run: |
          PGPASSWORD=testpass psql -h localhost -U postgres -d codai_test -f database/test-schema.sql

      - name: Run API integration tests
        run: pnpm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/codai_test
          REDIS_URL: redis://localhost:6379
          TEST_OPENAI_API_KEY: ${{ secrets.TEST_OPENAI_API_KEY }}
          TEST_ANTHROPIC_API_KEY: ${{ secrets.TEST_ANTHROPIC_API_KEY }}

      - name: Upload integration test results
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/integration/

  # Mobile E2E Tests
  mobile-e2e-tests:
    name: Mobile E2E Tests
    runs-on: macos-latest
    strategy:
      matrix:
        platform: [ios, android]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Setup Java for Android
        if: matrix.platform == 'android'
        uses: actions/setup-java@v3
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'

      - name: Setup Android SDK
        if: matrix.platform == 'android'
        uses: android-actions/setup-android@v2

      - name: Setup iOS environment
        if: matrix.platform == 'ios'
        run: |
          sudo xcode-select -s /Applications/Xcode_14.3.app
          xcrun simctl list devices

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Detox CLI
        run: npm install -g detox-cli

      - name: Build app for testing (iOS)
        if: matrix.platform == 'ios'
        run: |
          cd packages/mobile-app
          detox build --configuration ios.sim.debug

      - name: Build app for testing (Android) 
        if: matrix.platform == 'android'
        run: |
          cd packages/mobile-app
          detox build --configuration android.emu.debug

      - name: Run E2E tests
        run: |
          cd packages/mobile-app
          detox test --configuration ${{ matrix.platform }}.sim.debug --headless

      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-test-results-${{ matrix.platform }}
          path: packages/mobile-app/e2e/reports/

  # Performance Tests
  performance-tests:
    name: Performance Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Start services for testing
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 30

      - name: Run load tests
        run: |
          npx artillery run load-tests/ai-router-load-test.yml --output performance-results.json

      - name: Generate performance report
        run: |
          npx artillery report performance-results.json --output performance-report.html

      - name: Check performance thresholds
        run: |
          node scripts/check-performance-thresholds.js performance-results.json

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-test-results
          path: |
            performance-results.json
            performance-report.html

  # Security Tests
  security-tests:
    name: Security Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run dependency vulnerability scan
        run: pnpm audit --audit-level moderate

      - name: OWASP ZAP security scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'http://localhost:4000'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Upload security scan results
        uses: actions/upload-artifact@v3
        with:
          name: security-scan-results
          path: |
            report_html.html
            report_json.json

  # Build & Deploy (Success Gate)
  build-deploy:
    name: Build & Deploy to Staging
    needs: [
      code-quality,
      mobile-unit-tests, 
      ai-router-unit-tests,
      integration-tests,
      mobile-e2e-tests,
      performance-tests,
      security-tests
    ]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/sprint-15'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build mobile app
        run: pnpm run build:mobile

      - name: Build AI router service
        run: |
          cd services/ai-router
          docker build -t codai/ai-router:sprint-15 .

      - name: Deploy to staging environment
        run: |
          echo "Deploying Sprint 15 features to staging..."
          # Add deployment commands here

      - name: Run smoke tests on staging
        run: pnpm run test:smoke:staging

      - name: Notify team of successful deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#sprint-15'
          message: '🚀 Sprint 15 features deployed to staging! Ready for testing.'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Test Reporting & Metrics

#### Test Results Dashboard
```yaml
Test Metrics Collection:

automated_metrics:
  unit_tests:
    - test_count: "Total number of unit tests"
    - coverage_percentage: "Code coverage percentage"
    - execution_time: "Test suite execution time"
    - flaky_test_count: "Number of flaky tests detected"
  
  integration_tests:
    - api_endpoint_coverage: "Percentage of endpoints tested"
    - database_interaction_tests: "DB integration test count"
    - service_communication_tests: "Inter-service communication tests"
    - error_scenario_coverage: "Error handling test coverage"
  
  e2e_tests:
    - user_journey_coverage: "Critical user flow coverage"
    - platform_test_parity: "iOS vs Android test coverage"
    - performance_assertion_count: "Performance-related assertions"
    - accessibility_test_coverage: "Accessibility feature testing"

quality_gates:
  must_pass_criteria:
    - unit_test_coverage: "≥85%"
    - integration_test_pass_rate: "100%"
    - e2e_test_pass_rate: "≥95%"
    - security_scan_critical_issues: "0"
    - performance_regression: "≤5% degradation"
  
  warning_criteria:
    - flaky_test_percentage: ">2% triggers review"
    - test_execution_time: ">15 minutes triggers optimization"
    - coverage_decrease: ">3% from baseline triggers investigation"

reporting:
  daily_reports:
    - Test execution summary
    - Coverage trend analysis  
    - Performance regression detection
    - Flaky test identification
  
  sprint_reports:
    - Overall test quality assessment
    - Testing velocity metrics
    - Quality trend analysis
    - Recommendations for improvement
```

---

## 📋 Test Execution Strategy

### Automated Test Execution Schedule
```yaml
Test Execution Timeline:

continuous_integration:
  trigger: "Every commit to sprint-15 branch"
  tests: ["unit tests", "linting", "type checking"]
  duration: "≤5 minutes"
  failure_action: "Block PR merge"

pull_request_validation:
  trigger: "PR creation/update"
  tests: ["unit tests", "integration tests", "security scan"]
  duration: "≤15 minutes" 
  failure_action: "Require fixes before merge"

nightly_testing:
  schedule: "2 AM UTC daily"
  tests: ["full E2E suite", "performance tests", "load tests"]
  duration: "≤45 minutes"
  failure_action: "Alert team, create bug tickets"

release_candidate_testing:
  trigger: "RC tag creation"
  tests: ["complete test suite", "security scan", "performance benchmark"]
  duration: "≤60 minutes"
  failure_action: "Block release deployment"
```

### Manual Testing Coordination
```yaml
Manual Testing Strategy:

exploratory_testing:
  schedule: "Daily during sprint execution"
  focus: ["usability testing", "edge case discovery", "UX validation"]
  testers: ["QA team", "UX designers", "product managers"]
  
device_testing:
  mobile_devices:
    ios: ["iPhone 14 Pro", "iPhone 13", "iPad Air"]
    android: ["Pixel 7", "Samsung Galaxy S23", "OnePlus 11"]
  testing_focus: ["performance", "battery usage", "network conditions"]
  
user_acceptance_testing:
  participants: ["enterprise customers", "beta users", "internal stakeholders"]
  scenarios: ["real-world usage patterns", "business workflow validation"]
  feedback_collection: "structured feedback forms + user interviews"
```

---

## 🎯 Success Criteria & Metrics

### Testing Success Validation
```yaml
Sprint 15 Testing Success Criteria:

coverage_requirements:
  unit_tests: "≥85% code coverage for new code"
  integration_tests: "100% API endpoint coverage"
  e2e_tests: "100% critical user journey coverage"
  performance_tests: "All key metrics benchmarked"

quality_requirements:
  zero_critical_bugs: "No P0/P1 bugs in testing"
  security_compliance: "No high/critical security vulnerabilities"
  performance_standards: "All performance targets met"
  accessibility_compliance: "WCAG 2.1 AA standards met"

process_requirements:
  automation_coverage: "≥90% of tests automated"
  test_execution_time: "CI pipeline ≤15 minutes"
  test_reliability: "≤2% flaky test rate"
  documentation_coverage: "100% test scenarios documented"
```

---

## 📊 Testing Tools & Infrastructure

### Testing Infrastructure
```yaml
Testing Environment Setup:

test_environments:
  unit_testing:
    runner: "Jest with React Native Testing Library"
    coverage: "Istanbul coverage reporting"
    mocking: "Manual mocks + MSW for API mocking"
    
  integration_testing:
    database: "PostgreSQL test containers"
    cache: "Redis test containers"
    api_testing: "Supertest with Express"
    service_mocking: "WireMock for external services"
    
  e2e_testing:
    mobile: "Detox with iOS Simulator + Android Emulator"
    web: "Playwright with Chromium/Firefox/Safari"
    device_farm: "AWS Device Farm for real device testing"
    
  performance_testing:
    load_testing: "Artillery.js for API load testing"
    mobile_performance: "Flipper + Metro profiler"
    monitoring: "New Relic synthetics"

ci_cd_integration:
  github_actions: "Primary CI/CD pipeline"
  sonarqube: "Code quality and security analysis"
  codecov: "Coverage tracking and reporting" 
  slack_notifications: "Test result notifications"
  jira_integration: "Automatic bug ticket creation"
```

---

**Testing Pipeline Owner**: QA Team + DevOps  
**Test Environment Manager**: DevOps Team  
**Review Schedule**: Daily test result reviews, Weekly pipeline optimization  
**Approval Status**: Ready for Sprint 15 Implementation  
**Document Version**: 1.0  
**Last Updated**: August 27, 2025  

---

*This comprehensive testing pipeline ensures Sprint 15 mobile app and AI router features meet enterprise quality standards through automated testing, continuous validation, and robust quality gates.*