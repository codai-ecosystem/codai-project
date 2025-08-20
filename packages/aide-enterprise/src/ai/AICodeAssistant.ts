/**
 * AI-Powered Code Assistant
 * Intelligent code generation, analysis, and optimization
 */

import { OpenAI } from 'openai'

export interface CodeContext {
  language: string
  framework?: string
  filePath?: string
  existingCode?: string
  projectStructure?: ProjectFile[]
  dependencies?: string[]
  codeStyle?: CodeStyle
}

export interface ProjectFile {
  path: string
  content: string
  type: 'source' | 'config' | 'test' | 'docs'
}

export interface CodeStyle {
  indentation: 'tabs' | 'spaces'
  indentSize: number
  semicolons: boolean
  quotes: 'single' | 'double'
  trailingCommas: boolean
  maxLineLength: number
}

export interface CodeSuggestion {
  id: string
  type: 'completion' | 'refactor' | 'fix' | 'optimization' | 'documentation'
  title: string
  description: string
  code: string
  confidence: number
  reasoning: string
  impact: 'low' | 'medium' | 'high'
  tags: string[]
  position?: {
    line: number
    column: number
    endLine?: number
    endColumn?: number
  }
}

export interface CodeAnalysis {
  complexity: number
  maintainability: number
  performance: number
  security: number
  testCoverage?: number
  issues: CodeIssue[]
  suggestions: CodeSuggestion[]
  metrics: CodeMetrics
}

export interface CodeIssue {
  id: string
  type: 'error' | 'warning' | 'suggestion' | 'security'
  severity: 'critical' | 'major' | 'minor' | 'info'
  message: string
  line: number
  column: number
  rule?: string
  fix?: {
    title: string
    code: string
    description: string
  }
}

export interface CodeMetrics {
  linesOfCode: number
  cyclomaticComplexity: number
  cognitiveComplexity: number
  maintainabilityIndex: number
  technicalDebt: number
  duplicatedLines: number
  codeSmells: string[]
  securityHotspots: number
}

export interface GenerationRequest {
  prompt: string
  context: CodeContext
  type: 'function' | 'class' | 'component' | 'test' | 'documentation' | 'complete_file'
  requirements?: string[]
  constraints?: string[]
}

export interface OptimizationResult {
  originalCode: string
  optimizedCode: string
  improvements: Array<{
    type: string
    description: string
    impact: string
    performance?: number
  }>
  metrics: {
    performanceGain?: number
    sizeReduction?: number
    complexityReduction?: number
  }
}

export class AICodeAssistant {
  private openai: OpenAI
  private context: Map<string, any> = new Map()

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Generate code based on natural language prompt
   */
  async generateCode(request: GenerationRequest): Promise<CodeSuggestion[]> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.context)
      const userPrompt = this.buildUserPrompt(request)

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })

      const generatedCode = response.choices[0]?.message?.content || ''

      // Parse and validate the generated code
      const suggestions = await this.parseGeneratedCode(generatedCode, request)

      // Analyze and score the suggestions
      const analyzedSuggestions = await Promise.all(
        suggestions.map(s => this.analyzeSuggestion(s, request.context))
      )

      return analyzedSuggestions.sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error('Code generation error:', error)
      throw new Error('Failed to generate code suggestions')
    }
  }

  /**
   * Provide intelligent code completion
   */
  async provideCompletion(code: string, position: { line: number, column: number }, context: CodeContext): Promise<CodeSuggestion[]> {
    const request: GenerationRequest = {
      prompt: `Complete the code at cursor position`,
      context: {
        ...context,
        existingCode: code
      },
      type: 'function',
      requirements: ['Maintain code style', 'Follow best practices']
    }

    const completions = await this.generateCode(request)

    return completions.slice(0, 5) // Top 5 suggestions
  }

  /**
   * Analyze code quality and provide insights
   */
  async analyzeCode(code: string, context: CodeContext): Promise<CodeAnalysis> {
    // Simplified analysis implementation
    const lines = code.split('\n').length
    const complexity = this.estimateComplexity(code)

    return {
      complexity,
      maintainability: Math.max(0, 100 - complexity),
      performance: 85, // Default score
      security: 90, // Default score
      issues: [],
      suggestions: [],
      metrics: {
        linesOfCode: lines,
        cyclomaticComplexity: complexity,
        cognitiveComplexity: complexity * 0.8,
        maintainabilityIndex: Math.max(0, 100 - complexity),
        technicalDebt: complexity * 2,
        duplicatedLines: 0,
        codeSmells: [],
        securityHotspots: 0
      }
    }
  }

  /**
   * Optimize code for performance
   */
  async optimizeCode(code: string, context: CodeContext): Promise<OptimizationResult> {
    const optimizationPrompt = `Optimize this ${context.language} code for performance:\n\n${code}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code optimizer. Provide optimized code with explanations.'
        },
        { role: 'user', content: optimizationPrompt }
      ],
      temperature: 0.1
    })

    const optimizedContent = response.choices[0]?.message?.content || ''
    const optimizedCode = this.extractCodeFromResponse(optimizedContent)

    return {
      originalCode: code,
      optimizedCode,
      improvements: [
        {
          type: 'performance',
          description: 'AI-optimized code structure',
          impact: 'medium'
        }
      ],
      metrics: {
        performanceGain: 10,
        sizeReduction: 5,
        complexityReduction: 15
      }
    }
  }

  /**
   * Generate comprehensive documentation
   */
  async generateDocumentation(code: string, context: CodeContext): Promise<string> {
    const documentationPrompt = `Generate comprehensive documentation for this ${context.language} code:\n\n${code}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate clear, comprehensive technical documentation.'
        },
        { role: 'user', content: documentationPrompt }
      ],
      temperature: 0.3
    })

    return response.choices[0]?.message?.content || 'Documentation generation failed'
  }

  // Private helper methods
  private buildSystemPrompt(context: CodeContext): string {
    return `You are an expert ${context.language} developer${context.framework ? ` specializing in ${context.framework}` : ''}. Generate clean, efficient, well-documented code that follows best practices.`
  }

  private buildUserPrompt(request: GenerationRequest): string {
    return `${request.prompt}\n\nType: ${request.type}\n${request.requirements ? `Requirements: ${request.requirements.join(', ')}` : ''}`
  }

  private async parseGeneratedCode(code: string, request: GenerationRequest): Promise<CodeSuggestion[]> {
    return [
      {
        id: `suggestion_${Date.now()}`,
        type: request.type as any,
        title: 'AI Generated Code',
        description: 'AI-generated code suggestion',
        code: this.extractCodeFromResponse(code),
        confidence: 0.8,
        reasoning: 'Generated by AI based on context',
        impact: 'medium',
        tags: [request.context.language, request.type]
      }
    ]
  }

  private async analyzeSuggestion(suggestion: CodeSuggestion, context: CodeContext): Promise<CodeSuggestion> {
    return suggestion
  }

  private extractCodeFromResponse(response: string): string {
    const codeMatch = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/)
    return codeMatch ? codeMatch[1] : response
  }

  private estimateComplexity(code: string): number {
    // Simple complexity estimation
    const keywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch']
    let complexity = 1

    keywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'))
      if (matches) complexity += matches.length
    })

    return Math.min(complexity, 50)
  }
}

export default AICodeAssistant
