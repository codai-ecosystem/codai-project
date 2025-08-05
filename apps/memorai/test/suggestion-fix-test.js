/**
 * MemorAI MCP Suggestion Fix Test
 * Tests the suggestion deduplication functionality
 */

import { SuggestionDeduplicator, deduplicateSuggestions } from '../src/utils/suggestion-deduplicator';

// Test cases based on actual bug reports
const testCases = [
    {
        name: 'Repetitive Week 14 Pattern',
        input: [
            'Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan',
            'Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan',
            'Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan Week 14 Romanian AGI Advanced Optimization plan'
        ],
        originalQuery: 'Week 14 Romanian AGI Advanced Optimization plan',
        expectedOutput: [
            'Week 14 Romanian AGI Advanced Optimization plan',
            'Week 14 Romanian AGI Advanced Optimization plan progress',
            'Week 14 Romanian AGI Advanced Optimization plan status',
            'Week 14 Romanian AGI Advanced Optimization plan update',
            'Week 14 Romanian AGI Advanced Optimization plan results'
        ]
    },
    {
        name: 'Simple Repetitive Pattern',
        input: [
            'Romanian AGI optimization Romanian AGI optimization Romanian AGI optimization Romanian AGI optimization Romanian AGI optimization'
        ],
        originalQuery: 'Romanian AGI optimization',
        expectedOutput: [
            'Romanian AGI optimization',
            'Romanian AGI optimization progress',
            'Romanian AGI optimization status',
            'Romanian AGI optimization update',
            'Romanian AGI optimization results'
        ]
    },
    {
        name: 'Mixed Quality Suggestions',
        input: [
            'valid suggestion one',
            'test test test test test test',
            'another good suggestion',
            'repeat repeat repeat repeat',
            'final valid suggestion'
        ],
        originalQuery: 'test query',
        expectedOutput: [
            'valid suggestion one',
            'another good suggestion',
            'final valid suggestion',
            'test query progress',
            'test query status'
        ]
    },
    {
        name: 'Empty Input',
        input: [],
        originalQuery: 'empty test',
        expectedOutput: [
            'empty test progress',
            'empty test status',
            'empty test notes',
            'empty test details'
        ]
    }
];

function runTests() {
    console.log('🧪 Running MemorAI MCP Suggestion Fix Tests\n');

    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
        console.log('─'.repeat(50));

        try {
            const result = deduplicateSuggestions(
                testCase.input,
                testCase.originalQuery,
                5
            );

            console.log('Input suggestions:');
            testCase.input.forEach((suggestion, i) => {
                const truncated = suggestion.length > 80 ? suggestion.substring(0, 80) + '...' : suggestion;
                console.log(`  ${i + 1}. "${truncated}"`);
            });

            console.log('\nOutput suggestions:');
            result.forEach((suggestion, i) => {
                console.log(`  ${i + 1}. "${suggestion}"`);
            });

            // Validate results
            const validationResult = validateTestResult(result, testCase);

            if (validationResult.passed) {
                console.log('✅ PASSED');
                passed++;
            } else {
                console.log('❌ FAILED');
                console.log('Validation errors:');
                validationResult.errors.forEach(error => {
                    console.log(`  - ${error}`);
                });
                failed++;
            }

        } catch (error) {
            console.log('❌ FAILED - Exception occurred');
            console.error('Error:', error);
            failed++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All tests passed! Suggestion fix is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please review the implementation.');
    }
}

function validateTestResult(result: string[], testCase: any): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if result is not empty
    if (result.length === 0) {
        errors.push('Result is empty');
    }

    // Check for duplicates
    const uniqueResults = new Set(result);
    if (uniqueResults.size !== result.length) {
        errors.push('Result contains duplicates');
    }

    // Check for repetitive patterns
    result.forEach((suggestion, index) => {
        if (isRepetitive(suggestion)) {
            errors.push(`Suggestion ${index + 1} is still repetitive: "${suggestion}"`);
        }
    });

    // Check length constraints
    result.forEach((suggestion, index) => {
        if (suggestion.length < 3) {
            errors.push(`Suggestion ${index + 1} is too short: "${suggestion}"`);
        }
        if (suggestion.length > 100) {
            errors.push(`Suggestion ${index + 1} is too long: "${suggestion}"`);
        }
    });

    return {
        passed: errors.length === 0,
        errors
    };
}

function isRepetitive(text: string): boolean {
    const words = text.split(/\s+/);

    // Check for repeated sequences
    if (words.length >= 6) {
        const firstThird = words.slice(0, Math.floor(words.length / 3));
        const secondThird = words.slice(Math.floor(words.length / 3), Math.floor(words.length * 2 / 3));

        if (firstThird.join(' ') === secondThird.join(' ')) {
            return true;
        }
    }

    // Check for consecutive repeated words
    let consecutiveCount = 1;
    for (let i = 1; i < words.length; i++) {
        if (words[i] === words[i - 1]) {
            consecutiveCount++;
            if (consecutiveCount > 2) {
                return true;
            }
        } else {
            consecutiveCount = 1;
        }
    }

    return false;
}

// Performance test
function performanceTest() {
    console.log('\n🚀 Performance Test');
    console.log('─'.repeat(30));

    const largeInput = Array(1000).fill('repeated text repeated text repeated text repeated text repeated text');
    const query = 'performance test query';

    const startTime = Date.now();
    const result = deduplicateSuggestions(largeInput, query, 10);
    const endTime = Date.now();

    console.log(`Input size: ${largeInput.length} suggestions`);
    console.log(`Output size: ${result.length} suggestions`);
    console.log(`Processing time: ${endTime - startTime}ms`);

    if (endTime - startTime < 100) {
        console.log('✅ Performance: Excellent (< 100ms)');
    } else if (endTime - startTime < 500) {
        console.log('✅ Performance: Good (< 500ms)');
    } else {
        console.log('⚠️ Performance: Needs optimization (> 500ms)');
    }
}

// Run tests
if (require.main === module) {
    runTests();
    performanceTest();
}
