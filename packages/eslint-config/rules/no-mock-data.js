/**
 * ESLint Rule: No Mock Data
 * Prevents hardcoded mock data in production code
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent usage of mock/fake data in production code',
      category: 'Best Practices',
      recommended: true
    },
    schema: [],
    messages: {
      noMockData: 'Mock data detected: {{pattern}}. Use real data sources instead.',
      noMockVariable: 'Mock variable name detected: {{name}}. Use real data variables instead.',
      noHardcodedData: 'Hardcoded data detected. Use configuration or data fetching instead.',
      noPlaceholderText: 'Placeholder text detected: {{text}}. Use real content instead.'
    }
  },

  create(context) {
    // Mock data patterns to detect
    const mockPatterns = [
      // Common mock numbers
      /\b12\.4K\b/,
      /\b98\.5%\b/,
      /\b4\.9\/5\b/,
      /\b99\.9%\b/,

      // Mock text
      /lorem\s+ipsum/i,
      /placeholder.*text/i,
      /dummy.*data/i,
      /fake.*data/i,
      /test.*data/i,
      /mock.*data/i,
      /sample.*data/i,
      /example.*data/i,

      // Mock emails
      /\w+@example\.(com|org|net)/i,
      /test.*@.*\.(com|org|net)/i,

      // Mock phone numbers
      /555-\d{3}-\d{4}/,
      /\(555\)\s*\d{3}-\d{4}/,

      // Mock addresses
      /123\s+main\s+street/i,
      /456\s+elm\s+street/i
    ]

    // Mock variable names
    const mockVariableNames = [
      'mockData',
      'fakeData',
      'testData',
      'dummyData',
      'sampleData',
      'placeholderData',
      'exampleData',
      'hardcodedData'
    ]

    function checkStringLiteral(node) {
      const value = node.value

      // Check for mock patterns
      for (const pattern of mockPatterns) {
        if (pattern.test(value)) {
          context.report({
            node,
            messageId: 'noMockData',
            data: { pattern: pattern.toString() }
          })
          return
        }
      }

      // Check for common placeholder text
      if (value.toLowerCase().includes('lorem') ||
        value.toLowerCase().includes('placeholder') ||
        value.toLowerCase().includes('example')) {
        context.report({
          node,
          messageId: 'noPlaceholderText',
          data: { text: value }
        })
      }
    }

    function checkIdentifier(node) {
      const name = node.name.toLowerCase()

      for (const mockName of mockVariableNames) {
        if (name === mockName.toLowerCase()) {
          context.report({
            node,
            messageId: 'noMockVariable',
            data: { name: node.name }
          })
          return
        }
      }
    }

    function checkObjectExpression(node) {
      // Check for hardcoded arrays with sequential IDs (mock data pattern)
      if (node.properties.length > 2) {
        const hasIdPattern = node.properties.some(prop =>
          prop.key && prop.key.name === 'id' &&
          prop.value && prop.value.type === 'Literal' &&
          (prop.value.value === '1' || prop.value.value === 1)
        )

        if (hasIdPattern) {
          context.report({
            node,
            messageId: 'noHardcodedData'
          })
        }
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkStringLiteral(node)
        }
      },

      Identifier(node) {
        // Only check variable declarations and function names
        if (node.parent.type === 'VariableDeclarator' ||
          node.parent.type === 'FunctionDeclaration') {
          checkIdentifier(node)
        }
      },

      ObjectExpression(node) {
        checkObjectExpression(node)
      },

      ArrayExpression(node) {
        // Check for arrays of mock objects
        if (node.elements.length > 0 &&
          node.elements[0] &&
          node.elements[0].type === 'ObjectExpression') {

          const firstObj = node.elements[0]
          const hasIdOne = firstObj.properties.some(prop =>
            prop.key && prop.key.name === 'id' &&
            prop.value && prop.value.type === 'Literal' &&
            (prop.value.value === '1' || prop.value.value === 1)
          )

          if (hasIdOne) {
            context.report({
              node,
              messageId: 'noHardcodedData'
            })
          }
        }
      }
    }
  }
}
