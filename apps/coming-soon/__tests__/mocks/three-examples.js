// Mock implementation of three.js examples for testing
module.exports = {
  OrbitControls: class MockOrbitControls {
    constructor() {
      this.enabled = true;
      this.enableDamping = true;
      this.dampingFactor = 0.05;
      this.update = jest.fn();
      this.dispose = jest.fn();
    }
  },
  EffectComposer: class MockEffectComposer {
    constructor() {
      this.render = jest.fn();
      this.addPass = jest.fn();
      this.setSize = jest.fn();
    }
  },
  RenderPass: class MockRenderPass {
    constructor() {}
  },
  UnrealBloomPass: class MockUnrealBloomPass {
    constructor() {}
  }
};