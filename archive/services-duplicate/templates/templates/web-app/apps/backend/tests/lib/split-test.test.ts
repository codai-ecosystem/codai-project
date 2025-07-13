import { describe, expect, it } from 'vitest';

describe('Token parsing logic', () => {
  it('should understand the string split behavior', () => {
    const testCases = [
      { input: 'Bearer', expected: ['Bearer'] },
      { input: 'Bearer ', expected: ['Bearer', ''] },
      { input: 'Bearer token', expected: ['Bearer', 'token'] },
    ];

    for (const { input, expected } of testCases) {
      const result = input.split(' ');
      console.log(`Input: "${input}" -> Split result:`, result);
      console.log(`  startsWith('Bearer '): ${input.startsWith('Bearer ')}`);
      console.log(`  split(' ')[1]: "${result[1]}"`);
      console.log(`  split(' ')[1] === undefined: ${result[1] === undefined}`);
      console.log(`  split(' ')[1]?.length === 0: ${result[1]?.length === 0}`);
      expect(result).toEqual(expected);
    }
  });
});
