/**
 * AI Assistant API Endpoint
 * Provides AI-powered code assistance and real-time suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

interface AIAssistantRequest {
    action: 'suggest' | 'explain' | 'refactor' | 'optimize' | 'complete' | 'debug'
    context: {
        filePath?: string
        code?: string
        language?: string
        line?: number
        column?: number
        selection?: {
            start: { line: number; column: number }
            end: { line: number; column: number }
        }
        errorMessage?: string
        userQuery?: string
    }
    options?: {
        includeExplanation?: boolean
        includeAlternatives?: boolean
        maxSuggestions?: number
        difficulty?: 'beginner' | 'intermediate' | 'advanced'
    }
}

interface AIAssistantResponse {
    type: string
    suggestions: AISuggestion[]
    explanation?: string
    alternatives?: string[]
    confidence: number
    timestamp: string
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
        const { id } = params
        const body: AIAssistantRequest = await request.json()

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Process AI assistant request
        const response = await processAIAssistantRequest(body, projectPath)

        return NextResponse.json(response)

    } catch (error) {
        console.error('AI Assistant error:', error)
        return NextResponse.json(
            { error: 'Failed to process AI assistant request' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const filePath = searchParams.get('file')

        // Validate project exists
        const projectsDir = path.join(process.cwd(), 'projects')
        const projectPath = path.join(projectsDir, id)

        try {
            await fs.access(projectPath)
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        switch (action) {
            case 'capabilities':
                return NextResponse.json({
                    capabilities: [
                        'Code completion and suggestions',
                        'Code explanation and documentation',
                        'Refactoring recommendations',
                        'Performance optimization',
                        'Bug detection and fixes',
                        'Best practices suggestions',
                        'Design pattern recommendations',
                        'Code quality improvements'
                    ],
                    supportedLanguages: [
                        'typescript', 'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'
                    ],
                    features: {
                        realTime: true,
                        contextAware: true,
                        multiLanguage: true,
                        intelliSense: true,
                        refactoring: true,
                        debugging: true
                    }
                })

            case 'context':
                if (filePath) {
                    const context = await getFileContext(projectPath, filePath)
                    return NextResponse.json(context)
                }

                const projectContext = await getProjectContext(projectPath)
                return NextResponse.json(projectContext)

            case 'suggestions':
                // Get general suggestions for the project
                const suggestions = await getGeneralSuggestions(projectPath)
                return NextResponse.json({ suggestions })

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('AI Assistant GET error:', error)
        return NextResponse.json(
            { error: 'Failed to process AI assistant request' },
            { status: 500 }
        )
    }
}

/**
 * Process AI assistant request
 */
async function processAIAssistantRequest(
    request: AIAssistantRequest,
    projectPath: string
): Promise<AIAssistantResponse> {
    const { action, context, options = {} } = request

    switch (action) {
        case 'suggest':
            return await generateCodeSuggestions(context, projectPath, options)

        case 'explain':
            return await explainCode(context, projectPath, options)

        case 'refactor':
            return await generateRefactoringSuggestions(context, projectPath, options)

        case 'optimize':
            return await generateOptimizations(context, projectPath, options)

        case 'complete':
            return await generateCodeCompletion(context, projectPath, options)

        case 'debug':
            return await generateDebuggingSuggestions(context, projectPath, options)

        default:
            throw new Error(`Unsupported action: ${action}`)
    }
}

/**
 * Generate code suggestions
 */
async function generateCodeSuggestions(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    const suggestions: AISuggestion[] = []

    // Analyze the context and generate suggestions
    if (context.code) {
        const language = context.language || detectLanguage(context.filePath || '')

        // Generate specific suggestions based on code analysis
        if (language === 'typescript' || language === 'javascript') {
            suggestions.push(...await generateJavaScriptSuggestions(context.code, context))
        } else if (language === 'python') {
            suggestions.push(...await generatePythonSuggestions(context.code, context))
        }
    }

    // Add general suggestions if no specific code provided
    if (suggestions.length === 0) {
        suggestions.push(...await getGeneralCodeSuggestions(context, projectPath))
    }

    return {
        type: 'suggestions',
        suggestions: suggestions.slice(0, options?.maxSuggestions || 5),
        confidence: calculateAverageConfidence(suggestions),
        timestamp: new Date().toISOString()
    }
}

/**
 * Explain code functionality
 */
async function explainCode(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    if (!context.code) {
        throw new Error('Code context required for explanation')
    }

    const language = context.language || detectLanguage(context.filePath || '')
    const difficulty = options?.difficulty || 'intermediate'

    // Generate explanation based on code complexity and user level
    const explanation = await generateCodeExplanation(context.code, language, difficulty)

    return {
        type: 'explanation',
        suggestions: [],
        explanation,
        confidence: 0.9,
        timestamp: new Date().toISOString()
    }
}

/**
 * Generate refactoring suggestions
 */
async function generateRefactoringSuggestions(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    const suggestions: AISuggestion[] = []

    if (context.code) {
        const language = context.language || detectLanguage(context.filePath || '')

        // Analyze code for refactoring opportunities
        const refactorings = await analyzeRefactoringOpportunities(context.code, language)
        suggestions.push(...refactorings)
    }

    return {
        type: 'refactoring',
        suggestions,
        confidence: calculateAverageConfidence(suggestions),
        timestamp: new Date().toISOString()
    }
}

/**
 * Generate optimization suggestions
 */
async function generateOptimizations(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    const suggestions: AISuggestion[] = []

    if (context.code) {
        const language = context.language || detectLanguage(context.filePath || '')

        // Analyze code for performance optimizations
        const optimizations = await analyzePerformanceOptimizations(context.code, language)
        suggestions.push(...optimizations)
    }

    return {
        type: 'optimization',
        suggestions,
        confidence: calculateAverageConfidence(suggestions),
        timestamp: new Date().toISOString()
    }
}

/**
 * Generate code completion
 */
async function generateCodeCompletion(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    const suggestions: AISuggestion[] = []

    if (context.code && context.line !== undefined && context.column !== undefined) {
        const language = context.language || detectLanguage(context.filePath || '')

        // Generate intelligent code completion
        const completions = await generateIntelligentCompletion(
            context.code,
            context.line,
            context.column,
            language,
            projectPath
        )
        suggestions.push(...completions)
    }

    return {
        type: 'completion',
        suggestions,
        confidence: calculateAverageConfidence(suggestions),
        timestamp: new Date().toISOString()
    }
}

/**
 * Generate debugging suggestions
 */
async function generateDebuggingSuggestions(
    context: AIAssistantRequest['context'],
    projectPath: string,
    options: AIAssistantRequest['options']
): Promise<AIAssistantResponse> {
    const suggestions: AISuggestion[] = []

    if (context.errorMessage || context.code) {
        const language = context.language || detectLanguage(context.filePath || '')

        // Analyze error and suggest fixes
        const debuggingSuggestions = await analyzeErrorAndSuggestFixes(
            context.errorMessage || '',
            context.code || '',
            language
        )
        suggestions.push(...debuggingSuggestions)
    }

    return {
        type: 'debugging',
        suggestions,
        confidence: calculateAverageConfidence(suggestions),
        timestamp: new Date().toISOString()
    }
}

// Helper functions for language-specific analysis

async function generateJavaScriptSuggestions(
    code: string,
    context: AIAssistantRequest['context']
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Check for modern JavaScript patterns
    if (code.includes('var ')) {
        suggestions.push({
            id: 'modernize-var',
            type: 'refactor',
            title: 'Use let/const instead of var',
            description: 'Replace var declarations with let or const for better scoping',
            code: code.replace(/var /g, 'const '),
            confidence: 0.9,
            benefits: ['Better scoping', 'Prevents accidental reassignment', 'Modern JavaScript'],
            tags: ['modernization', 'best-practices']
        })
    }

    // Check for arrow function opportunities
    if (code.includes('function(') && !code.includes('this.')) {
        suggestions.push({
            id: 'arrow-functions',
            type: 'refactor',
            title: 'Convert to arrow functions',
            description: 'Use arrow functions for cleaner syntax',
            code: code.replace(/function\s*\([^)]*\)\s*{/, '() => {'),
            confidence: 0.8,
            benefits: ['Cleaner syntax', 'Lexical this binding', 'Modern JavaScript'],
            tags: ['modernization', 'syntax']
        })
    }

    return suggestions
}

async function generatePythonSuggestions(
    code: string,
    context: AIAssistantRequest['context']
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Check for list comprehension opportunities
    if (code.includes('for ') && code.includes('append(')) {
        suggestions.push({
            id: 'list-comprehension',
            type: 'refactor',
            title: 'Use list comprehension',
            description: 'Replace for loop with list comprehension for better performance',
            code: '# Example: [x for x in items if condition]',
            confidence: 0.85,
            benefits: ['Better performance', 'More Pythonic', 'Cleaner code'],
            tags: ['performance', 'pythonic']
        })
    }

    return suggestions
}

async function getGeneralCodeSuggestions(
    context: AIAssistantRequest['context'],
    projectPath: string
): Promise<AISuggestion[]> {
    return [
        {
            id: 'add-comments',
            type: 'pattern',
            title: 'Add documentation comments',
            description: 'Improve code readability with comprehensive comments',
            code: '// TODO: Add JSDoc comments for better documentation',
            confidence: 0.7,
            benefits: ['Better maintainability', 'Team collaboration', 'Self-documenting code'],
            tags: ['documentation', 'maintainability']
        },
        {
            id: 'error-handling',
            type: 'pattern',
            title: 'Add error handling',
            description: 'Implement proper error handling for robust code',
            code: 'try {\n  // Your code here\n} catch (error) {\n  console.error(error)\n}',
            confidence: 0.8,
            benefits: ['Robust code', 'Better user experience', 'Easier debugging'],
            tags: ['error-handling', 'robustness']
        }
    ]
}

async function generateCodeExplanation(
    code: string,
    language: string,
    difficulty: string
): Promise<string> {
    // Simplified explanation generation
    const lines = code.split('\n').length
    const complexity = code.includes('if') || code.includes('for') || code.includes('while') ? 'complex' : 'simple'

    let explanation = `This ${language} code snippet contains ${lines} lines and appears to be ${complexity}. `

    if (difficulty === 'beginner') {
        explanation += 'Let me break it down step by step:\n\n'
        explanation += '1. The code defines functionality that...\n'
        explanation += '2. It uses variables and functions to...\n'
        explanation += '3. The main purpose is to...'
    } else if (difficulty === 'intermediate') {
        explanation += 'The code structure follows these patterns:\n\n'
        explanation += '- Implementation details\n'
        explanation += '- Design considerations\n'
        explanation += '- Performance implications'
    } else {
        explanation += 'Advanced analysis:\n\n'
        explanation += '- Architectural patterns\n'
        explanation += '- Optimization opportunities\n'
        explanation += '- Potential edge cases'
    }

    return explanation
}

async function analyzeRefactoringOpportunities(
    code: string,
    language: string
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Check for long functions
    const lines = code.split('\n')
    if (lines.length > 50) {
        suggestions.push({
            id: 'extract-function',
            type: 'refactor',
            title: 'Extract smaller functions',
            description: 'Break down large function into smaller, focused functions',
            code: '// Extract logical blocks into separate functions',
            confidence: 0.8,
            benefits: ['Better readability', 'Easier testing', 'Reusable code'],
            tags: ['refactoring', 'modularity']
        })
    }

    return suggestions
}

async function analyzePerformanceOptimizations(
    code: string,
    language: string
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Check for inefficient loops
    if (code.includes('for') && code.includes('indexOf')) {
        suggestions.push({
            id: 'optimize-search',
            type: 'optimization',
            title: 'Use Set for O(1) lookups',
            description: 'Replace indexOf in loops with Set for better performance',
            code: 'const itemSet = new Set(items)\nif (itemSet.has(searchItem)) { ... }',
            confidence: 0.9,
            benefits: ['O(1) vs O(n) lookup', 'Better performance', 'Scalable solution'],
            tags: ['performance', 'data-structures']
        })
    }

    return suggestions
}

async function generateIntelligentCompletion(
    code: string,
    line: number,
    column: number,
    language: string,
    projectPath: string
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    const lines = code.split('\n')
    const currentLine = lines[line - 1] || ''
    const beforeCursor = currentLine.substring(0, column)

    // Simple completion suggestions
    if (beforeCursor.endsWith('console.')) {
        suggestions.push({
            id: 'console-log',
            type: 'completion',
            title: 'log()',
            description: 'Log a message to the console',
            code: 'log()',
            confidence: 0.95,
            benefits: ['Quick debugging', 'Standard logging'],
            tags: ['debugging', 'logging']
        })
    }

    return suggestions
}

async function analyzeErrorAndSuggestFixes(
    errorMessage: string,
    code: string,
    language: string
): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    if (errorMessage.includes('undefined')) {
        suggestions.push({
            id: 'fix-undefined',
            type: 'fix',
            title: 'Check for undefined values',
            description: 'Add null/undefined checks to prevent runtime errors',
            code: 'if (variable !== undefined && variable !== null) {\n  // Your code here\n}',
            confidence: 0.85,
            benefits: ['Prevents runtime errors', 'Defensive programming', 'Better error handling'],
            tags: ['debugging', 'error-prevention']
        })
    }

    return suggestions
}

// Utility functions

function detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const languageMap: Record<string, string> = {
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.py': 'python',
        '.java': 'java'
    }
    return languageMap[ext] || 'unknown'
}

function calculateAverageConfidence(suggestions: AISuggestion[]): number {
    if (suggestions.length === 0) return 0
    const total = suggestions.reduce((sum, suggestion) => sum + suggestion.confidence, 0)
    return total / suggestions.length
}

async function getFileContext(projectPath: string, filePath: string) {
    try {
        const fullPath = path.resolve(projectPath, filePath)
        const content = await fs.readFile(fullPath, 'utf-8')
        const stats = await fs.stat(fullPath)

        return {
            file: filePath,
            content,
            size: stats.size,
            lastModified: stats.mtime,
            language: detectLanguage(filePath),
            lines: content.split('\n').length
        }
    } catch (error) {
        throw new Error(`Failed to get file context: ${error}`)
    }
}

async function getProjectContext(projectPath: string) {
    try {
        // Get basic project information
        const packageJsonPath = path.join(projectPath, 'package.json')
        let packageInfo = null

        try {
            const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
            packageInfo = JSON.parse(packageContent)
        } catch {
            // No package.json or invalid JSON
        }

        return {
            projectPath,
            packageInfo,
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        throw new Error(`Failed to get project context: ${error}`)
    }
}

async function getGeneralSuggestions(projectPath: string): Promise<AISuggestion[]> {
    return [
        {
            id: 'setup-testing',
            type: 'pattern',
            title: 'Set up testing framework',
            description: 'Add unit tests to ensure code quality',
            code: '// npm install --save-dev jest\n// Add test files with .test.js extension',
            confidence: 0.8,
            benefits: ['Code quality', 'Regression prevention', 'Confidence in changes'],
            tags: ['testing', 'quality']
        },
        {
            id: 'add-linting',
            type: 'pattern',
            title: 'Configure ESLint',
            description: 'Set up linting for consistent code style',
            code: '// npm install --save-dev eslint\n// Create .eslintrc.json configuration',
            confidence: 0.9,
            benefits: ['Consistent style', 'Error prevention', 'Team collaboration'],
            tags: ['linting', 'code-style']
        }
    ]
}
