// Mock canvas module to prevent Jest failures
module.exports = {
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
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    toBuffer() {
      return Buffer.from('');
    }
  },

  createCanvas: jest.fn().mockImplementation((width = 150, height = 150) => {
    return new module.exports.Canvas(width, height);
  }),

  createImageData: jest.fn(() => ({ data: [] })),
  loadImage: jest.fn(() => Promise.resolve({})),
  registerFont: jest.fn(),
};