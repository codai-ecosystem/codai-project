/**
 * Test setup file for CODAI SDK
 */

import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock sessionStorage for Node.js environment
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock FormData
global.FormData = class FormData {
  private data: Map<string, any> = new Map();

  append(name: string, value: any) {
    this.data.set(name, value);
  }

  get(name: string) {
    return this.data.get(name);
  }

  has(name: string) {
    return this.data.has(name);
  }

  delete(name: string) {
    this.data.delete(name);
  }

  entries() {
    return this.data.entries();
  }
} as any;

// Mock Headers
global.Headers = class Headers {
  private headers: Map<string, string> = new Map();

  append(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  get(name: string) {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string) {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  delete(name: string) {
    this.headers.delete(name.toLowerCase());
  }

  entries() {
    return this.headers.entries();
  }
} as any;

// Mock File and Blob
global.File = class File {
  name: string;
  size: number;
  type: string;

  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0);
    this.type = options.type || '';
  }
} as any;

global.Blob = class Blob {
  size: number;
  type: string;

  constructor(chunks: any[] = [], options: any = {}) {
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0);
    this.type = options.type || '';
  }
} as any;
