// Mock canvas module to prevent native binding issues
module.exports = {
    createCanvas: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4)
            }))
        })),
        toBuffer: jest.fn(),
        toDataURL: jest.fn()
    })),
    loadImage: jest.fn()
};
