const { describe, it, expect } = require('@jest/globals');

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
});
