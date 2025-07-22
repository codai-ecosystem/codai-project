/**
 * AI-Powered Code Assistant
 * Intelligent code generation, analysis, and optimization
 */

import { OpenAI } from 'openai'
import * as ts from 'typescript'
import { ESLint } from 'eslint'

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
  private eslint: ESLint
  private typeChecker?: ts.TypeChecker
  private context: Map<string, any> = new Map()

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
    this.eslint = new ESLint({
      baseConfig: {
        extends: ['eslint:recommended', '@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint', 'security', 'sonarjs']
      }
    })
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
    const codeBeforeCursor = this.getCodeBeforeCursor(code, position)
    const codeAfterCursor = this.getCodeAfterCursor(code, position)

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
    
    // Filter and rank based on context
    return completions
      .filter(c => this.isValidCompletion(c, codeBeforeCursor, codeAfterCursor))
      .slice(0, 5) // Top 5 suggestions
  }

  /**
   * Analyze code quality and provide insights
   */
  async analyzeCode(code: string, context: CodeContext): Promise<CodeAnalysis> {
    const [
      staticAnalysis,
      eslintResults,
      complexityMetrics,
      securityAnalysis,
      performanceAnalysis
    ] = await Promise.all([
      this.performStaticAnalysis(code, context),
      this.runESLint(code, context),
      this.calculateComplexity(code, context),
      this.performSecurityAnalysis(code),
      this.analyzePerformance(code, context)
    ])

    const issues = this.combineIssues([eslintResults, securityAnalysis])
    const suggestions = await this.generateImprovementSuggestions(code, context, issues)

    return {
      complexity: complexityMetrics.cyclomaticComplexity,
      maintainability: this.calculateMaintainability(complexityMetrics, issues),
      performance: performanceAnalysis.score,
      security: securityAnalysis.score,
      issues,
      suggestions,
      metrics: {
        linesOfCode: code.split('\n').length,
        cyclomaticComplexity: complexityMetrics.cyclomaticComplexity,
        cognitiveComplexity: complexityMetrics.cognitiveComplexity,
        maintainabilityIndex: this.calculateMaintainability(complexityMetrics, issues),
        technicalDebt: this.calculateTechnicalDebt(issues, complexityMetrics),
        duplicatedLines: staticAnalysis.duplicatedLines,
        codeSmells: staticAnalysis.codeSmells,
        securityHotspots: securityAnalysis.hotspots
      }
    }
  }

  /**
   * Suggest code refactoring opportunities
   */
  async suggestRefactoring(code: string, context: CodeContext): Promise<CodeSuggestion[]> {
    const analysis = await this.analyzeCode(code, context)
    const refactoringSuggestions: CodeSuggestion[] = []

    // Identify refactoring opportunities
    if (analysis.complexity > 10) {
      refactoringSuggestions.push(await this.suggestComplexityReduction(code, context))
    }

    if (analysis.metrics.duplicatedLines > 0) {
      refactoringSuggestions.push(await this.suggestDuplicationElimination(code, context))
    }

    if (analysis.metrics.codeSmells.length > 0) {
      const smellFixes = await Promise.all(
        analysis.metrics.codeSmells.map(smell => this.suggestSmellFix(code, smell, context))
      )
      refactoringSuggestions.push(...smellFixes)
    }

    // Use AI for advanced refactoring suggestions
    const aiRefactoring = await this.generateAIRefactoring(code, context, analysis)
    refactoringSuggestions.push(...aiRefactoring)

    return refactoringSuggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Optimize code for performance
   */
  async optimizeCode(code: string, context: CodeContext): Promise<OptimizationResult> {
    const performanceAnalysis = await this.analyzePerformance(code, context)
    const optimizationPrompt = this.buildOptimizationPrompt(code, context, performanceAnalysis)

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code optimizer. Analyze the code and provide optimized version with detailed explanations.'
        },
        { role: 'user', content: optimizationPrompt }
      ],
      temperature: 0.1
    })

    const optimizedContent = response.choices[0]?.message?.content || ''
    const optimizedCode = this.extractCodeFromResponse(optimizedContent)
    const improvements = this.extractImprovements(optimizedContent)

    // Measure the improvements
    const originalMetrics = await this.measurePerformance(code, context)
    const optimizedMetrics = await this.measurePerformance(optimizedCode, context)

    return {
      originalCode: code,
      optimizedCode,
      improvements,
      metrics: {
        performanceGain: ((optimizedMetrics.performance - originalMetrics.performance) / originalMetrics.performance) * 100,
        sizeReduction: ((code.length - optimizedCode.length) / code.length) * 100,
        complexityReduction: ((originalMetrics.complexity - optimizedMetrics.complexity) / originalMetrics.complexity) * 100
      }
    }
  }

  /**
   * Generate comprehensive documentation
   */
  async generateDocumentation(code: string, context: CodeContext): Promise<string> {
    const analysis = await this.analyzeCode(code, context)
    const functions = this.extractFunctions(code, context)
    const classes = this.extractClasses(code, context)

    const documentationPrompt = `
      Generate comprehensive documentation for this ${context.language} code:
      
      Code Analysis:
      - Complexity: ${analysis.complexity}
      - Maintainability: ${analysis.maintainability}
      - Functions: ${functions.length}
      - Classes: ${classes.length}
      
      Code:
      \`\`\`${context.language}
      ${code}
      \`\`\`
      
      Include:
      - Overview and purpose
      - Function documentation with parameters and return types
      - Usage examples
      - Implementation notes
      - Performance considerations
    `

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a technical documentation expert. Generate clear, comprehensive documentation.'
        },
        { role: 'user', content: documentationPrompt }
      ],
      temperature: 0.3
    })

    return response.choices[0]?.message?.content || 'Documentation generation failed'
  }

  /**
   * Provide intelligent error diagnosis and fixes
   */
  async diagnoseError(error: string, code: string, context: CodeContext): Promise<CodeSuggestion[]> {
    const errorContext = this.analyzeError(error)
    const relevantCode = this.extractRelevantCodeForError(code, errorContext)

    const diagnosisPrompt = `
      Diagnose and fix this ${context.language} error:
      
      Error: ${error}
      
      Code context:
      \`\`\`${context.language}
      ${relevantCode}
      \`\`\`
      
      Provide:
      1. Root cause analysis
      2. Step-by-step fix
      3. Prevention strategies
      4. Alternative approaches
    `

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert debugger. Provide accurate diagnoses and practical fixes.'
        },
        { role: 'user', content: diagnosisPrompt }
      ],
      temperature: 0.2
    })

    const diagnosis = response.choices[0]?.message?.content || ''
    return this.parseDiagnosisResponse(diagnosis, errorContext)
  }

  // Private helper methods

  private buildSystemPrompt(context: CodeContext): string {
    return `
      You are an expert ${context.language} developer${context.framework ? ` specializing in ${context.framework}` : ''}.
      
      Code Style Guidelines:
      ${context.codeStyle ? this.formatCodeStyle(context.codeStyle) : 'Follow standard conventions'}
      
      Context:
      - Language: ${context.language}
      - Framework: ${context.framework || 'None'}
      - Dependencies: ${context.dependencies?.join(', ') || 'None specified'}
      
      Generate clean, efficient, well-documented code that follows best practices.
      Provide explanations for complex logic and consider performance implications.
    `
  }

  private buildUserPrompt(request: GenerationRequest): string {
    let prompt = `Generate ${request.type}: ${request.prompt}\n`
    
    if (request.context.existingCode) {
      prompt += `\nExisting code context:\n\`\`\`${request.context.language}\n${request.context.existingCode}\n\`\`\`\n`
    }

    if (request.requirements?.length) {
      prompt += `\nRequirements:\n${request.requirements.map(r => `- ${r}`).join('\n')}\n`
    }

    if (request.constraints?.length) {
      prompt += `\nConstraints:\n${request.constraints.map(c => `- ${c}`).join('\n')}\n`
    }

    return prompt
  }

  private async parseGeneratedCode(response: string, request: GenerationRequest): Promise<CodeSuggestion[]> {
    const codeBlocks = this.extractCodeBlocks(response)
    const suggestions: CodeSuggestion[] = []

    for (const [index, code] of codeBlocks.entries()) {
      const suggestion: CodeSuggestion = {
        id: `gen_${Date.now()}_${index}`,
        type: request.type === 'function' ? 'completion' : 'refactor',
        title: `Generated ${request.type}`,
        description: this.extractDescription(response, index),
        code: code.trim(),
        confidence: 0.8,
        reasoning: this.extractReasoning(response, index),
        impact: 'medium',
        tags: [request.type, request.context.language]
      }

      suggestions.push(suggestion)
    }

    return suggestions
  }

  private async analyzeSuggestion(suggestion: CodeSuggestion, context: CodeContext): Promise<CodeSuggestion> {
    // Analyze the suggestion for quality and confidence
    const analysis = await this.analyzeCode(suggestion.code, context)
    
    // Adjust confidence based on analysis
    let confidence = suggestion.confidence
    if (analysis.complexity > 15) confidence -= 0.2
    if (analysis.security < 70) confidence -= 0.3
    if (analysis.issues.filter(i => i.severity === 'critical').length > 0) confidence -= 0.4

    return {
      ...suggestion,
      confidence: Math.max(0.1, Math.min(1.0, confidence))
    }
  }

  private getCodeBeforeCursor(code: string, position: { line: number, column: number }): string {
    const lines = code.split('\n')
    const beforeLines = lines.slice(0, position.line)
    const currentLine = lines[position.line]?.substring(0, position.column) || ''
    return [...beforeLines, currentLine].join('\n')
  }

  private getCodeAfterCursor(code: string, position: { line: number, column: number }): string {
    const lines = code.split('\n')
    const afterLines = lines.slice(position.line + 1)
    const currentLine = lines[position.line]?.substring(position.column) || ''
    return [currentLine, ...afterLines].join('\n')
  }

  private async performStaticAnalysis(code: string, context: CodeContext): Promise<any> {
    // Implement static analysis logic
    return {
      duplicatedLines: 0,
      codeSmells: []
    }
  }

  private async runESLint(code: string, context: CodeContext): Promise<CodeIssue[]> {
    try {
      const results = await this.eslint.lintText(code, { filePath: context.filePath })
      return results[0]?.messages.map(msg => ({
        id: `eslint_${msg.ruleId}_${msg.line}_${msg.column}`,
        type: msg.severity === 2 ? 'error' : 'warning',
        severity: msg.severity === 2 ? 'major' : 'minor',
        message: msg.message,
        line: msg.line,
        column: msg.column,
        rule: msg.ruleId || undefined,
        fix: msg.fix ? {
          title: `Fix ${msg.ruleId}`,
          code: code.substring(0, msg.fix.range[0]) + msg.fix.text + code.substring(msg.fix.range[1]),
          description: `Apply ESLint autofix for ${msg.ruleId}`
        } : undefined
      })) || []
    } catch (error) {
      console.error('ESLint analysis failed:', error)
      return []
    }
  }

  private calculateComplexity(code: string, context: CodeContext): any {
    // Implement complexity calculation
    return {
      cyclomaticComplexity: 5,
      cognitiveComplexity: 3
    }
  }

  private async performSecurityAnalysis(code: string): Promise<any> {
    // Implement security analysis
    return {
      score: 85,
      hotspots: 0
    }
  }

  private async analyzePerformance(code: string, context: CodeContext): Promise<any> {
    // Implement performance analysis
    return {
      score: 80
    }
  }

  private combineIssues(analysisResults: any[]): CodeIssue[] {
    return analysisResults.flat()
  }

  private async generateImprovementSuggestions(code: string, context: CodeContext, issues: CodeIssue[]): Promise<CodeSuggestion[]> {
    // Generate AI-powered improvement suggestions
    return []
  }

  private calculateMaintainability(metrics: any, issues: CodeIssue[]): number {
    // Calculate maintainability score
    return 75
  }

  private calculateTechnicalDebt(issues: CodeIssue[], metrics: any): number {
    // Calculate technical debt
    return issues.filter(i => i.severity === 'critical' || i.severity === 'major').length * 2
  }

  private async suggestComplexityReduction(code: string, context: CodeContext): Promise<CodeSuggestion> {
    return {
      id: 'complexity_reduction',
      type: 'refactor',
      title: 'Reduce Complexity',
      description: 'Break down complex function into smaller parts',
      code: '', // Would generate refactored code
      confidence: 0.8,
      reasoning: 'High complexity detected',
      impact: 'high',
      tags: ['complexity', 'refactoring']
    }
  }

  private async suggestDuplicationElimination(code: string, context: CodeContext): Promise<CodeSuggestion> {
    return {
      id: 'duplication_elimination',
      type: 'refactor',
      title: 'Eliminate Code Duplication',
      description: 'Extract common code into reusable functions',
      code: '', // Would generate refactored code
      confidence: 0.7,
      reasoning: 'Code duplication detected',
      impact: 'medium',
      tags: ['duplication', 'refactoring']
    }
  }

  private async suggestSmellFix(code: string, smell: string, context: CodeContext): Promise<CodeSuggestion> {
    return {
      id: `smell_fix_${smell}`,
      type: 'fix',
      title: `Fix ${smell}`,
      description: `Address ${smell} code smell`,
      code: '', // Would generate fixed code
      confidence: 0.6,
      reasoning: `${smell} code smell detected`,
      impact: 'low',
      tags: ['code-smell', smell]
    }
  }

  private async generateAIRefactoring(code: string, context: CodeContext, analysis: CodeAnalysis): Promise<CodeSuggestion[]> {
    // Generate AI-powered refactoring suggestions
    return []
  }

  private buildOptimizationPrompt(code: string, context: CodeContext, analysis: any): string {
    return `Optimize this ${context.language} code for better performance:\n\`\`\`${context.language}\n${code}\n\`\`\``
  }

  private extractCodeFromResponse(response: string): string {
    const codeBlocks = this.extractCodeBlocks(response)
    return codeBlocks[0] || response
  }

  private extractImprovements(response: string): Array<{type: string, description: string, impact: string}> {
    // Parse improvements from AI response
    return []
  }

  private async measurePerformance(code: string, context: CodeContext): Promise<{performance: number, complexity: number}> {
    // Measure code performance metrics
    return { performance: 80, complexity: 5 }
  }

  private extractFunctions(code: string, context: CodeContext): any[] {
    // Extract function definitions
    return []
  }

  private extractClasses(code: string, context: CodeContext): any[] {
    // Extract class definitions
    return []
  }

  private analyzeError(error: string): any {
    // Analyze error message for context
    return { type: 'syntax', line: 0 }
  }

  private extractRelevantCodeForError(code: string, errorContext: any): string {
    // Extract relevant code section for error
    return code
  }

  private parseDiagnosisResponse(response: string, errorContext: any): CodeSuggestion[] {
    // Parse AI diagnosis response into suggestions
    return []
  }

  private formatCodeStyle(style: CodeStyle): string {
    return `
      Indentation: ${style.indentation} (${style.indentSize})
      Semicolons: ${style.semicolons ? 'Required' : 'Optional'}
      Quotes: ${style.quotes}
      Max line length: ${style.maxLineLength}
    `
  }

  private extractCodeBlocks(text: string): string[] {
    const regex = /```(?:\w+)?\n([\s\S]*?)\n```/g
    const blocks: string[] = []
    let match

    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1])
    }

    return blocks
  }

  private extractDescription(response: string, index: number): string {
    // Extract description for code suggestion
    return `AI-generated code suggestion ${index + 1}`
  }

  private extractReasoning(response: string, index: number): string {
    // Extract reasoning for code suggestion
    return 'Generated based on best practices and context analysis'
  }

  private isValidCompletion(suggestion: CodeSuggestion, before: string, after: string): boolean {
    // Validate if completion makes sense in context
    return suggestion.code.length > 0
  }
}

export default AICodeAssistant
