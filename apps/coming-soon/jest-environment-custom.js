/**
 * Custom Jest Environment for CODAI
 * Prevents canvas dependencies from loading while maintaining jsdom functionality
 */

const { TestEnvironment } = require('jest-environment-jsdom');

class CustomJestEnvironment extends TestEnvironment {
  constructor(config, context) {
    // Override global configuration before creating the environment
    const customConfig = {
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        // Prevent canvas-related resources from loading
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        // Disable canvas in jsdom
        canvas: false,
      }
    };
    
    super(customConfig, context);
    
    // Override require to prevent canvas loading
    this.mockCanvas();
  }
  
  async setup() {
    await super.setup();
    
    // Mock canvas in the global context
    this.global.HTMLCanvasElement = class MockHTMLCanvasElement {
      constructor(width = 150, height = 150) {
        this.width = width;
        this.height = height;
        this.style = {};
      }
      
      getContext(type) {
        return {
          canvas: this,
          fillRect: () => {},
          clearRect: () => {},
          getImageData: () => ({ data: [] }),
          putImageData: () => {},
          createImageData: () => [],
          setTransform: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          closePath: () => {},
          measureText: () => ({ width: 0 }),
          fillText: () => {},
          strokeText: () => {},
        };
      }
      
      toDataURL() {
        return 'data:image/png;base64,mock';
      }
      
      toBlob() {
        return new Blob();
      }
    };
    
    // Mock canvas creation
    this.global.document.createElement = ((originalCreateElement) => {
      return function(tagName) {
        if (tagName === 'canvas') {
          return new CustomJestEnvironment.prototype.global.HTMLCanvasElement();
        }
        return originalCreateElement.call(this, tagName);
      };
    })(this.global.document.createElement.bind(this.global.document));
    
    // Mock requestAnimationFrame for animations
    this.global.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 16);
    };
    
    this.global.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }
  
  mockCanvas() {
    // Override module resolution for canvas
    const originalResolve = require.resolve;
    require.resolve = (id, options) => {
      if (id === 'canvas' || id.includes('canvas')) {
        // Return path to our mock instead
        return require.resolve('./__mocks__/canvas.js');
      }
      return originalResolve(id, options);
    };
    
    // Prevent dynamic requires of canvas
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    
    Module.prototype.require = function(id) {
      if (id === 'canvas' || id.includes('canvas.node') || id.includes('build/Release')) {
        // Return our mock canvas
        return {
          Canvas: class MockCanvas {
            constructor(width = 150, height = 150) {
              this.width = width;
              this.height = height;
            }
            getContext() {
              return {
                fillRect: jest.fn(),
                clearRect: jest.fn(),
                getImageData: jest.fn(() => ({ data: [] })),
                putImageData: jest.fn(),
                createImageData: jest.fn(() => []),
                setTransform: jest.fn(),
                drawImage: jest.fn(),
                save: jest.fn(),
                restore: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),
                closePath: jest.fn(),
                measureText: jest.fn(() => ({ width: 0 })),
                fillText: jest.fn(),
                strokeText: jest.fn(),
              };
            }
            toDataURL() {
              return 'data:image/png;base64,mock';
            }
            toBuffer() {
              return Buffer.from('');
            }
          },
          createCanvas: jest.fn().mockImplementation((w, h) => new MockCanvas(w, h)),
          createImageData: jest.fn(() => ({ data: [] })),
          loadImage: jest.fn(() => Promise.resolve({})),
        };
      }
      return originalRequire.apply(this, arguments);
    };
  }
  
  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomJestEnvironment;