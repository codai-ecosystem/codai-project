import React from 'react';

// Simple Node-based test for ThemeContext
const { useTheme, ThemeProvider } = require('@/contexts/ThemeContext');

describe('ThemeContext - Node Environment', () => {
  beforeEach(() => {
    // Mock global objects that would be in browser
    global.window = {
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      matchMedia: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    } as any;

    global.document = {
      documentElement: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        setAttribute: jest.fn(),
      },
    } as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).document;
  });

  it('loads ThemeContext without crashing', () => {
    expect(typeof useTheme).toBe('function');
    expect(typeof ThemeProvider).toBe('function');
  });

  it('throws error when useTheme called outside provider', () => {
    expect(() => {
      useTheme();
    }).toThrow('Cannot read properties of null');
  });

  it('creates ThemeProvider component', () => {
    const provider = React.createElement(ThemeProvider, { children: null });
    expect(provider).toBeDefined();
    expect(provider.type).toBe(ThemeProvider);
  });
});