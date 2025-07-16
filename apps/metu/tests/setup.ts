import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Set environment variables for Azure OpenAI (use environment variables for security)
process.env.AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || 'test-key-for-development';
process.env.AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://aide-openai-dev.openai.azure.com/';

// Mock MediaRecorder for test environment (browser-only API)
// This enables testing of Azure OpenAI Whisper integration without requiring actual microphone access
class MockMediaRecorder {
  stream: MediaStream;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType: string;
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onstart: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  constructor(stream: MediaStream, options?: { mimeType?: string }) {
    this.stream = stream;
    this.mimeType = options?.mimeType || 'audio/webm';
  }

  start(timeslice?: number) {
    this.state = 'recording';
    if (this.onstart) this.onstart();
    
    // Simulate audio data for testing
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({
          data: new Blob(['mock audio data'], { type: this.mimeType })
        });
      }
    }, timeslice || 1000);
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
    if (this.onpause) this.onpause();
  }

  resume() {
    this.state = 'recording';
    if (this.onresume) this.onresume();
  }

  static isTypeSupported(_mimeType: string): boolean {
    return true; // Support all types in test environment
  }
}

// Mock navigator.mediaDevices for test environment
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: vi.fn(),
          kind: 'audio',
          label: 'Mock Audio Track'
        }
      ]
    } as unknown as MediaStream)
  }
} as any;

// Set MediaRecorder on global object
(global as any).MediaRecorder = MockMediaRecorder;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Setup before each test
beforeEach(() => {
  // Reset any global state
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));