import { NextRequest, NextResponse } from 'next/server'

interface SuggestionRequest {
    filePath: string
    currentCode: string
    cursorPosition: { line: number; column: number }
    selectedText?: string
    language: string
    action: 'suggest' | 'explain' | 'refactor' | 'optimize' | 'complete' | 'debug'
    context?: string
}

interface AISuggestion {
    id: string
    type: 'completion' | 'refactor' | 'fix' | 'optimization' | 'pattern'
    title: string
    description: string
    code: string
    changes?: Array<{
        type: 'insert' | 'replace' | 'delete'
        position: { line: number; column: number }
        oldText?: string
        newText: string
    }>
    confidence: number
    benefits: string[]
    tags: string[]
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body: SuggestionRequest = await request.json()
        const { filePath, currentCode, cursorPosition, selectedText, language, action, context } = body

        // Analyze code context around cursor
        const lines = currentCode.split('\n')
        const currentLine = lines[cursorPosition.line - 1] || ''
        const previousLines = lines.slice(Math.max(0, cursorPosition.line - 5), cursorPosition.line - 1)
        const nextLines = lines.slice(cursorPosition.line, cursorPosition.line + 5)

        const codeContext = {
            currentLine,
            previousLines,
            nextLines,
            indentation: currentLine.match(/^\\s*/)?.[0] || '',
            isInFunction: previousLines.some(line => line.includes('function') || line.includes('=>')),
            isInClass: previousLines.some(line => line.includes('class ')),
            isInComment: currentLine.trim().startsWith('//') || currentLine.trim().startsWith('/*')
        }

        let suggestions: AISuggestion[] = []

        switch (action) {
            case 'suggest':
                suggestions = await generateCodeSuggestions(language, codeContext, selectedText)
                break
            case 'complete':
                suggestions = await generateCodeCompletion(language, codeContext, currentLine)
                break
            case 'refactor':
                suggestions = await generateRefactoringSuggestions(language, selectedText || currentLine, codeContext)
                break
            case 'optimize':
                suggestions = await generateOptimizationSuggestions(language, selectedText || currentCode, codeContext)
                break
            case 'debug':
                suggestions = await generateDebuggingSuggestions(language, selectedText || currentCode, codeContext)
                break
            case 'explain':
                // For explanations, return a different format
                const explanation = await generateCodeExplanation(language, selectedText || currentLine, codeContext)
                return NextResponse.json({ explanation })
        }

        return NextResponse.json({ suggestions })

    } catch (error) {
        console.error('AI assistant error:', error)
        return NextResponse.json(
            { error: 'Failed to generate AI suggestions' },
            { status: 500 }
        )
    }
}

async function generateCodeSuggestions(language: string, context: any, selectedText?: string): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Pattern-based suggestions
    if (language === 'typescript' || language === 'javascript') {
        // React component patterns
        if (context.isInFunction && context.currentLine.includes('useState')) {
            suggestions.push({
                id: 'useState-pattern',
                type: 'pattern',
                title: 'Add useEffect hook',
                description: 'Add a useEffect hook to handle side effects',
                code: `\\n${context.indentation}useEffect(() => {\\n${context.indentation}  // Effect logic here\\n${context.indentation}}, [])`,
                confidence: 0.8,
                benefits: ['Proper lifecycle management', 'Side effect handling'],
                tags: ['react', 'hooks', 'lifecycle']
            })
        }

        // Error handling patterns
        if (context.currentLine.includes('try') || context.currentLine.includes('catch')) {
            suggestions.push({
                id: 'error-handling',
                type: 'pattern',
                title: 'Enhanced error handling',
                description: 'Add comprehensive error handling with logging',
                code: `${context.indentation}try {\\n${context.indentation}  // Your code here\\n${context.indentation}} catch (error) {\\n${context.indentation}  console.error('Error:', error)\\n${context.indentation}  // Handle error appropriately\\n${context.indentation}}`,
                confidence: 0.9,
                benefits: ['Better error tracking', 'Improved debugging'],
                tags: ['error-handling', 'logging', 'debugging']
            })
        }

        // Function documentation
        if (context.previousLines.some(line => line.includes('function') || line.includes('=>'))) {
            suggestions.push({
                id: 'function-docs',
                type: 'pattern',
                title: 'Add JSDoc documentation',
                description: 'Document the function with JSDoc comments',
                code: `${context.indentation}/**\\n${context.indentation} * Description of the function\\n${context.indentation} * @param {type} param - Description\\n${context.indentation} * @returns {type} Description\\n${context.indentation} */`,
                confidence: 0.7,
                benefits: ['Better documentation', 'IDE autocomplete'],
                tags: ['documentation', 'jsdoc', 'maintainability']
            })
        }
    }

    // Type safety suggestions for TypeScript
    if (language === 'typescript') {
        if (selectedText && !selectedText.includes(':') && selectedText.includes('=')) {
            suggestions.push({
                id: 'add-type-annotation',
                type: 'optimization',
                title: 'Add type annotation',
                description: 'Add explicit type annotation for better type safety',
                code: selectedText.replace('=', ': any ='),
                changes: [{
                    type: 'replace',
                    position: context.currentLine.indexOf(selectedText) >= 0 ?
                        { line: context.currentLine, column: context.currentLine.indexOf(selectedText) } :
                        { line: 1, column: 1 },
                    oldText: selectedText,
                    newText: selectedText.replace('=', ': any =')
                }],
                confidence: 0.6,
                benefits: ['Type safety', 'Better IDE support'],
                tags: ['typescript', 'types', 'safety']
            })
        }
    }

    return suggestions
}

async function generateCodeCompletion(language: string, context: any, currentLine: string): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    if (language === 'typescript' || language === 'javascript') {
        // Import statement completion
        if (currentLine.trim().startsWith('import')) {
            const commonImports = [
                "import React, { useState, useEffect } from 'react'",
                "import { NextRequest, NextResponse } from 'next/server'",
                "import { motion } from 'framer-motion'"
            ]

            commonImports.forEach((importStatement, index) => {
                if (importStatement.toLowerCase().includes(currentLine.toLowerCase().replace('import', '').trim())) {
                    suggestions.push({
                        id: `import-${index}`,
                        type: 'completion',
                        title: 'Complete import statement',
                        description: `Complete with: ${importStatement}`,
                        code: importStatement,
                        confidence: 0.9,
                        benefits: ['Faster coding', 'Correct syntax'],
                        tags: ['import', 'completion']
                    })
                }
            })
        }

        // Function completion
        if (currentLine.includes('function') || currentLine.includes('=>')) {
            suggestions.push({
                id: 'function-body',
                type: 'completion',
                title: 'Complete function body',
                description: 'Add basic function structure',
                code: ` {\\n${context.indentation}  // Function implementation\\n${context.indentation}  return\\n${context.indentation}}`,
                confidence: 0.8,
                benefits: ['Structure guidance', 'Faster development'],
                tags: ['function', 'structure']
            })
        }
    }

    return suggestions
}

async function generateRefactoringSuggestions(language: string, code: string, context: any): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    if (language === 'typescript' || language === 'javascript') {
        // Extract to function
        if (code.length > 50 && code.includes(';')) {
            suggestions.push({
                id: 'extract-function',
                type: 'refactor',
                title: 'Extract to function',
                description: 'Extract selected code into a separate function',
                code: `${context.indentation}const extractedFunction = () => {\\n${context.indentation}  ${code.replace(/\\n/g, `\\n${context.indentation}  `)}\\n${context.indentation}}\\n\\n${context.indentation}extractedFunction()`,
                confidence: 0.7,
                benefits: ['Code reusability', 'Better organization'],
                tags: ['refactor', 'function', 'organization']
            })
        }

        // Convert to arrow function
        if (code.includes('function')) {
            const arrowFunction = code.replace(/function\\s+(\\w+)?\\s*\\(([^)]*)\\)\\s*{/, '($2) => {')
            suggestions.push({
                id: 'arrow-function',
                type: 'refactor',
                title: 'Convert to arrow function',
                description: 'Convert function declaration to arrow function',
                code: arrowFunction,
                confidence: 0.8,
                benefits: ['Modern syntax', 'Lexical this binding'],
                tags: ['es6', 'arrow-function', 'modern']
            })
        }
    }

    return suggestions
}

async function generateOptimizationSuggestions(language: string, code: string, context: any): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    if (language === 'typescript' || language === 'javascript') {
        // React optimization
        if (code.includes('useState') && code.includes('useEffect')) {
            suggestions.push({
                id: 'usecallback-optimization',
                type: 'optimization',
                title: 'Add useCallback optimization',
                description: 'Memoize callback functions to prevent unnecessary re-renders',
                code: `${context.indentation}const memoizedCallback = useCallback(() => {\\n${context.indentation}  // Callback logic\\n${context.indentation}}, [dependencies])`,
                confidence: 0.6,
                benefits: ['Performance improvement', 'Reduced re-renders'],
                tags: ['react', 'performance', 'memoization']
            })
        }

        // Loop optimization
        if (code.includes('for') || code.includes('forEach')) {
            suggestions.push({
                id: 'map-optimization',
                type: 'optimization',
                title: 'Use array methods',
                description: 'Consider using map, filter, or reduce for better readability',
                code: `${context.indentation}// Consider using: array.map(item => /* transform */)`,
                confidence: 0.5,
                benefits: ['Functional programming', 'Better readability'],
                tags: ['functional', 'array-methods', 'readability']
            })
        }
    }

    return suggestions
}

async function generateDebuggingSuggestions(language: string, code: string, context: any): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Add console.log for debugging
    suggestions.push({
        id: 'add-console-log',
        type: 'fix',
        title: 'Add debug logging',
        description: 'Add console.log statement for debugging',
        code: `${context.indentation}console.log('Debug:', /* variable name */)`,
        confidence: 0.9,
        benefits: ['Debugging assistance', 'Runtime inspection'],
        tags: ['debugging', 'logging']
    })

    // Try-catch wrapper
    if (!code.includes('try') && !code.includes('catch')) {
        suggestions.push({
            id: 'add-try-catch',
            type: 'fix',
            title: 'Wrap in try-catch',
            description: 'Add error handling with try-catch block',
            code: `${context.indentation}try {\\n${context.indentation}  ${code.replace(/\\n/g, `\\n${context.indentation}  `)}\\n${context.indentation}} catch (error) {\\n${context.indentation}  console.error('Error:', error)\\n${context.indentation}}`,
            confidence: 0.8,
            benefits: ['Error handling', 'Better stability'],
            tags: ['error-handling', 'stability']
        })
    }

    return suggestions
}

async function generateCodeExplanation(language: string, code: string, context: any): Promise<string> {
    // Simple pattern-based explanation
    let explanation = `This ${language} code: \\n\\n`

    if (code.includes('useState')) {
        explanation += "• Uses React's useState hook to manage component state\\n"
    }
    if (code.includes('useEffect')) {
        explanation += "• Uses useEffect hook for side effects and lifecycle management\\n"
    }
    if (code.includes('async') || code.includes('await')) {
        explanation += "• Contains asynchronous operations using async/await pattern\\n"
    }
    if (code.includes('try') && code.includes('catch')) {
        explanation += "• Implements error handling with try-catch blocks\\n"
    }
    if (code.includes('map') || code.includes('filter') || code.includes('reduce')) {
        explanation += "• Uses functional array methods for data transformation\\n"
    }

    // Add complexity assessment
    const lines = code.split('\\n').length
    if (lines > 20) {
        explanation += "\\n⚠️ This is a complex function that might benefit from being broken down into smaller functions."
    }

    return explanation
}
