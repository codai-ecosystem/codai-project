// Mock for three.js to prevent testing issues
module.exports = {
    Scene: jest.fn(() => ({
        add: jest.fn(),
        remove: jest.fn(),
    })),
    Camera: jest.fn(),
    PerspectiveCamera: jest.fn(() => ({
        position: { set: jest.fn() },
        lookAt: jest.fn(),
    })),
    WebGLRenderer: jest.fn(() => ({
        setSize: jest.fn(),
        render: jest.fn(),
        domElement: document.createElement('canvas'),
    })),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(() => ({
        rotation: { x: 0, y: 0, z: 0 },
        position: { set: jest.fn() },
    })),
    Vector3: jest.fn(() => ({
        set: jest.fn(),
    })),
    Color: jest.fn(),
};