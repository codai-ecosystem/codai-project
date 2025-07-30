/**
 * CODAI AI Code Suggester
 * 
 * Advanced AI-powered code suggestions using OpenAI GPT-4 and Anthropic Claude
 * Provides intelligent code completion, refactoring, and documentation generation
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AISuggesterConfig {
  provider: 'openai' | 'anthropic' | 'hybrid';
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  enableCodeCompletion: boolean;
  enableRefactoring: boolean;
  enableDocumentation: boolean;
  customPrompts?: CustomPromptConfig;
}

export interface CustomPromptConfig {
  codeCompletion?: string;
  refactoring?: string;
  documentation?: string;
  bugFix?: string;
  optimization?: string;
}

export interface AISuggestionResult {
  suggestions: CodeSuggestion[];
  confidence: number;
  processing_time: number;
  model_used: string;
  tokens_used: number;
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'refactor' | 'optimize' | 'fix' | 'documentation';
  title: string;
  description: string;
  originalCode: string;
  suggestedCode: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  reasoning: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface CompletionRequest {
  code: string;
  position: { line: number; character: number };
  language: string;
  context?: string;
}

export interface RefactoringRequest {
  code: string;
  issues: any[];
  language: string;
  preferences?: RefactoringPreferences;
}

export interface RefactoringPreferences {
  style: 'functional' | 'object-oriented' | 'mixed';
  modernize: boolean;
  optimize: boolean;
  simplify: boolean;
}

export class AICodeSuggester {
  private config: AISuggesterConfig;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private statistics = {
    suggestionsGenerated: 0,
    completionsProvided: 0,
    refactoringsPerformed: 0,
    documentationGenerated: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    tokenUsage: 0
  };

  constructor(config: AISuggesterConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    try {
      if (this.config.provider === 'openai' || this.config.provider === 'hybrid') {
        this.openai = new OpenAI({
          apiKey: this.config.apiKey || process.env.OPENAI_API_KEY
        });
      }

      if (this.config.provider === 'anthropic' || this.config.provider === 'hybrid') {
        this.anthropic = new Anthropic({
          apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY
        });
      }

      console.log(`✅ AI Code Suggester initialized with ${this.config.provider} provider`);
    } catch (error) {
      console.error('❌ Failed to initialize AI providers:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive code suggestions
   */
  async generateSuggestions(
    parsedCode: any,
    sourceCode: string,
    context?: string
  ): Promise<AISuggestionResult> {
    const startTime = Date.now();
    const suggestions: CodeSuggestion[] = [];

    try {
      // Analyze code structure and identify improvement opportunities
      const codeAnalysis = this.analyzeCodeStructure(parsedCode, sourceCode);

      // Generate different types of suggestions in parallel
      const [
        refactoringSuggestions,
        optimizationSuggestions,
        modernizationSuggestions,
        documentationSuggestions
      ] = await Promise.all([
        this.generateRefactoringSuggestions(sourceCode, codeAnalysis, context),
        this.generateOptimizationSuggestions(sourceCode, codeAnalysis, context),
        this.generateModernizationSuggestions(sourceCode, codeAnalysis, context),
        this.generateDocumentationSuggestions(sourceCode, codeAnalysis, context)
      ]);

      suggestions.push(
        ...refactoringSuggestions,
        ...optimizationSuggestions,
        ...modernizationSuggestions,
        ...documentationSuggestions
      );

      // Calculate overall confidence
      const confidence = suggestions.length > 0
        ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
        : 0;

      const processingTime = Date.now() - startTime;
      const result: AISuggestionResult = {
        suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
        confidence,
        processing_time: processingTime,
        model_used: this.config.model,
        tokens_used: this.estimateTokenUsage(sourceCode, suggestions.length)
      };

      // Update statistics
      this.updateStatistics(result);

      return result;
    } catch (error) {
      console.error('❌ AI suggestion generation failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time code completions
   */
  async getCompletions(
    code: string,
    position: { line: number; character: number },
    language: string = 'typescript'
  ): Promise<CodeSuggestion[]> {
    if (!this.config.enableCodeCompletion) {
      return [];
    }

    try {
      const prompt = this.buildCompletionPrompt(code, position, language);
      const completion = await this.callAIProvider(prompt, {
        maxTokens: 150,
        temperature: 0.3,
        stop: ['\n\n', '```']
      });

      const suggestions = this.parseCompletionResponse(completion, position);

      this.statistics.completionsProvided += suggestions.length;
      return suggestions;
    } catch (error) {
      console.error('❌ Code completion failed:', error);
      return [];
    }
  }

  /**
   * Auto-fix code issues
   */
  async autoFix(
    code: string,
    issues: any[],
    language: string = 'typescript'
  ): Promise<string> {
    if (issues.length === 0) {
      return code;
    }

    try {
      const prompt = this.buildFixPrompt(code, issues, language);
      const fixedCode = await this.callAIProvider(prompt, {
        maxTokens: Math.min(4000, code.length * 2),
        temperature: 0.1
      });

      return this.extractCodeFromResponse(fixedCode);
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return code;
    }
  }

  /**
   * Generate code documentation
   */
  async generateDocumentation(
    code: string,
    language: string = 'typescript'
  ): Promise<string> {
    if (!this.config.enableDocumentation) {
      return '';
    }

    try {
      const prompt = this.buildDocumentationPrompt(code, language);
      const documentation = await this.callAIProvider(prompt, {
        maxTokens: 1000,
        temperature: 0.2
      });

      this.statistics.documentationGenerated++;
      return this.extractDocumentationFromResponse(documentation);
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      return '';
    }
  }

  /**
   * Perform intelligent refactoring
   */
  async refactorCode(request: RefactoringRequest): Promise<string> {
    if (!this.config.enableRefactoring) {
      return request.code;
    }

    try {
      const prompt = this.buildRefactoringPrompt(request);
      const refactoredCode = await this.callAIProvider(prompt, {
        maxTokens: Math.min(4000, request.code.length * 2),
        temperature: 0.2
      });

      this.statistics.refactoringsPerformed++;
      return this.extractCodeFromResponse(refactoredCode);
    } catch (error) {
      console.error('❌ Code refactoring failed:', error);
      return request.code;
    }
  }

  private analyzeCodeStructure(parsedCode: any, sourceCode: string): CodeAnalysis {
    const lines = sourceCode.split('\n');
    const functions = this.extractFunctions(sourceCode);
    const classes = this.extractClasses(sourceCode);
    const imports = this.extractImports(sourceCode);
    const complexity = this.calculateComplexity(sourceCode);

    return {
      lineCount: lines.length,
      functions,
      classes,
      imports,
      complexity,
      hasAsync: sourceCode.includes('async '),
      hasPromises: sourceCode.includes('Promise') || sourceCode.includes('.then('),
      hasClasses: classes.length > 0,
      language: this.detectLanguage(sourceCode),
      framework: this.detectFramework(sourceCode)
    };
  }

  private async generateRefactoringSuggestions(
    code: string,
    analysis: CodeAnalysis,
    context?: string
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Check for long functions that could be split
    if (analysis.functions.some(f => f.lines > 50)) {
      const suggestion = await this.createRefactoringSuggestion(
        'split-long-function',
        'Split long function into smaller functions',
        code,
        analysis,
        0.8
      );
      if (suggestion) suggestions.push(suggestion);
    }

    // Check for duplicate code patterns
    const duplicatePatterns = this.findDuplicatePatterns(code);
    if (duplicatePatterns.length > 0) {
      const suggestion = await this.createRefactoringSuggestion(
        'extract-common-code',
        'Extract common code into reusable functions',
        code,
        analysis,
        0.7
      );
      if (suggestion) suggestions.push(suggestion);
    }

    // Check for complex conditional logic
    if (code.includes('if') && code.split('if').length > 5) {
      const suggestion = await this.createRefactoringSuggestion(
        'simplify-conditionals',
        'Simplify complex conditional logic',
        code,
        analysis,
        0.6
      );
      if (suggestion) suggestions.push(suggestion);
    }

    return suggestions;
  }

  private async generateOptimizationSuggestions(
    code: string,
    analysis: CodeAnalysis,
    context?: string
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Check for inefficient loops
    if (code.includes('for') || code.includes('while')) {
      const suggestion = await this.createOptimizationSuggestion(
        'optimize-loops',
        'Optimize loop performance',
        code,
        analysis
      );
      if (suggestion) suggestions.push(suggestion);
    }

    // Check for unnecessary re-renders (React)
    if (analysis.framework === 'react' && code.includes('useState')) {
      const suggestion = await this.createOptimizationSuggestion(
        'optimize-react-renders',
        'Optimize React component re-renders',
        code,
        analysis
      );
      if (suggestion) suggestions.push(suggestion);
    }

    // Check for memory leaks
    if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
      suggestions.push({
        id: `optimize-memory-${Date.now()}`,
        type: 'optimize',
        title: 'Prevent memory leaks',
        description: 'Add event listener cleanup to prevent memory leaks',
        originalCode: code,
        suggestedCode: await this.generateMemoryLeakFix(code),
        confidence: 0.9,
        impact: 'high',
        reasoning: 'Event listeners without cleanup can cause memory leaks',
        line: this.findEventListenerLine(code),
        column: 0
      });
    }

    return suggestions;
  }

  private async generateModernizationSuggestions(
    code: string,
    analysis: CodeAnalysis,
    context?: string
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Check for var usage
    if (code.includes('var ')) {
      suggestions.push({
        id: `modernize-var-${Date.now()}`,
        type: 'refactor',
        title: 'Replace var with let/const',
        description: 'Use modern variable declarations (let/const) instead of var',
        originalCode: code,
        suggestedCode: code.replace(/var /g, 'const '),
        confidence: 0.95,
        impact: 'medium',
        reasoning: 'let and const provide better scope control and prevent hoisting issues',
        line: code.indexOf('var '),
        column: 0
      });
    }

    // Check for function declarations vs arrow functions
    if (code.includes('function(') && !code.includes('=>')) {
      const suggestion = await this.createModernizationSuggestion(
        'use-arrow-functions',
        'Convert to arrow functions where appropriate',
        code,
        analysis
      );
      if (suggestion) suggestions.push(suggestion);
    }

    // Check for Promise.then() chains
    if (code.includes('.then(') && !code.includes('async ')) {
      suggestions.push({
        id: `modernize-async-${Date.now()}`,
        type: 'refactor',
        title: 'Convert to async/await',
        description: 'Replace Promise chains with async/await for better readability',
        originalCode: code,
        suggestedCode: await this.convertToAsync(code),
        confidence: 0.8,
        impact: 'medium',
        reasoning: 'async/await provides cleaner, more readable asynchronous code',
        line: code.indexOf('.then('),
        column: 0
      });
    }

    return suggestions;
  }

  private async generateDocumentationSuggestions(
    code: string,
    analysis: CodeAnalysis,
    context?: string
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Check for functions without documentation
    const undocumentedFunctions = analysis.functions.filter(f => !f.hasJSDoc);
    if (undocumentedFunctions.length > 0) {
      for (const func of undocumentedFunctions.slice(0, 3)) { // Limit to 3 suggestions
        const documentation = await this.generateFunctionDocumentation(func, code);
        suggestions.push({
          id: `doc-function-${func.name}`,
          type: 'documentation',
          title: `Add documentation for ${func.name}`,
          description: `Generate JSDoc documentation for function ${func.name}`,
          originalCode: func.code,
          suggestedCode: `${documentation}\n${func.code}`,
          confidence: 0.85,
          impact: 'medium',
          reasoning: 'Proper documentation improves code maintainability and developer experience',
          line: func.line,
          column: 0
        });
      }
    }

    // Check for complex code without comments
    if (analysis.complexity > 10 && code.split('//').length < 3) {
      const suggestion = await this.createDocumentationSuggestion(
        'add-comments',
        'Add explanatory comments for complex code',
        code,
        analysis
      );
      if (suggestion) suggestions.push(suggestion);
    }

    return suggestions;
  }

  private async callAIProvider(
    prompt: string,
    options: { maxTokens: number; temperature: number; stop?: string[] }
  ): Promise<string> {
    try {
      if (this.config.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          stop: options.stop
        });

        return response.choices[0]?.message?.content || '';
      }

      if (this.config.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: this.config.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          messages: [{ role: 'user', content: prompt }]
        });

        return response.content[0]?.text || '';
      }

      throw new Error(`Unsupported AI provider: ${this.config.provider}`);
    } catch (error) {
      console.error('❌ AI provider call failed:', error);
      throw error;
    }
  }

  private buildCompletionPrompt(
    code: string,
    position: { line: number; character: number },
    language: string
  ): string {
    const lines = code.split('\n');
    const currentLine = lines[position.line] || '';
    const context = lines.slice(Math.max(0, position.line - 5), position.line + 1).join('\n');

    return this.config.customPrompts?.codeCompletion || `
You are an expert ${language} developer. Complete the following code:

Context:
\`\`\`${language}
${context}
\`\`\`

Complete the code at the cursor position. Provide only the completion, no explanations.
    `.trim();
  }

  private buildFixPrompt(code: string, issues: any[], language: string): string {
    const issueDescriptions = issues.map(issue =>
      `- ${issue.message} (line ${issue.line})`
    ).join('\n');

    return this.config.customPrompts?.bugFix || `
Fix the following ${language} code issues:

Issues:
${issueDescriptions}

Original code:
\`\`\`${language}
${code}
\`\`\`

Provide the fixed code:
    `.trim();
  }

  private buildDocumentationPrompt(code: string, language: string): string {
    return this.config.customPrompts?.documentation || `
Generate comprehensive JSDoc documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include descriptions, parameter types, return types, and examples where appropriate.
    `.trim();
  }

  private buildRefactoringPrompt(request: RefactoringRequest): string {
    const preferences = request.preferences || {};
    const issueDescriptions = request.issues.map(issue =>
      `- ${issue.message}`
    ).join('\n');

    return this.config.customPrompts?.refactoring || `
Refactor the following ${request.language} code with these preferences:
- Style: ${preferences.style || 'mixed'}
- Modernize: ${preferences.modernize || true}
- Optimize: ${preferences.optimize || true}
- Simplify: ${preferences.simplify || true}

Issues to address:
${issueDescriptions}

Original code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide the refactored code:
    `.trim();
  }

  // Helper methods for code analysis
  private extractFunctions(code: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*:\s*(?:async\s+)?(?:\([^)]*\)|\w+)\s*=>|(?:async\s+)?function\s*\*?\s*(\w*)\s*\([^)]*\))/g;

    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      const name = match[1] || match[2] || match[3] || 'anonymous';
      const startIndex = match.index;
      const lines = code.substring(0, startIndex).split('\n').length;

      functions.push({
        name,
        line: lines,
        code: this.extractFunctionCode(code, startIndex),
        lines: this.countFunctionLines(code, startIndex),
        hasJSDoc: this.hasPrecedingJSDoc(code, startIndex)
      });
    }

    return functions;
  }

  private extractClasses(code: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    const classRegex = /class\s+(\w+)/g;

    let match;
    while ((match = classRegex.exec(code)) !== null) {
      classes.push({
        name: match[1],
        line: code.substring(0, match.index).split('\n').length
      });
    }

    return classes;
  }

  private extractImports(code: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private calculateComplexity(code: string): number {
    // Simplified complexity calculation
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?'];

    return complexityKeywords.reduce((complexity, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }

  private detectLanguage(code: string): string {
    if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) {
      return 'typescript';
    }
    if (code.includes('import React') || code.includes('jsx')) {
      return 'jsx';
    }
    return 'javascript';
  }

  private detectFramework(code: string): string {
    if (code.includes('React') || code.includes('useState') || code.includes('useEffect')) {
      return 'react';
    }
    if (code.includes('Vue') || code.includes('ref(') || code.includes('reactive(')) {
      return 'vue';
    }
    if (code.includes('Angular') || code.includes('@Component') || code.includes('@Injectable')) {
      return 'angular';
    }
    return 'vanilla';
  }

  // Additional helper methods would be implemented here...
  private extractFunctionCode(code: string, startIndex: number): string {
    // Implementation to extract complete function code
    return '';
  }

  private countFunctionLines(code: string, startIndex: number): number {
    // Implementation to count function lines
    return 0;
  }

  private hasPrecedingJSDoc(code: string, startIndex: number): boolean {
    // Implementation to check for JSDoc
    return false;
  }

  private findDuplicatePatterns(code: string): string[] {
    // Implementation to find duplicate code patterns
    return [];
  }

  private async createRefactoringSuggestion(
    id: string,
    title: string,
    code: string,
    analysis: CodeAnalysis,
    confidence: number
  ): Promise<CodeSuggestion | null> {
    // Implementation to create refactoring suggestions
    return null;
  }

  private async createOptimizationSuggestion(
    id: string,
    title: string,
    code: string,
    analysis: CodeAnalysis
  ): Promise<CodeSuggestion | null> {
    // Implementation to create optimization suggestions
    return null;
  }

  private async createModernizationSuggestion(
    id: string,
    title: string,
    code: string,
    analysis: CodeAnalysis
  ): Promise<CodeSuggestion | null> {
    // Implementation to create modernization suggestions
    return null;
  }

  private async createDocumentationSuggestion(
    id: string,
    title: string,
    code: string,
    analysis: CodeAnalysis
  ): Promise<CodeSuggestion | null> {
    // Implementation to create documentation suggestions
    return null;
  }

  private parseCompletionResponse(response: string, position: any): CodeSuggestion[] {
    // Implementation to parse AI completion response
    return [];
  }

  private extractCodeFromResponse(response: string): string {
    const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : response.trim();
  }

  private extractDocumentationFromResponse(response: string): string {
    // Implementation to extract documentation from AI response
    return response.trim();
  }

  private async generateMemoryLeakFix(code: string): Promise<string> {
    // Implementation to generate memory leak fixes
    return code;
  }

  private findEventListenerLine(code: string): number {
    const lines = code.split('\n');
    return lines.findIndex(line => line.includes('addEventListener')) + 1;
  }

  private async convertToAsync(code: string): Promise<string> {
    // Implementation to convert Promise chains to async/await
    return code;
  }

  private async generateFunctionDocumentation(func: FunctionInfo, code: string): Promise<string> {
    // Implementation to generate function documentation
    return `/**\n * TODO: Add description for ${func.name}\n */`;
  }

  private estimateTokenUsage(code: string, suggestionsCount: number): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil((code.length + suggestionsCount * 200) / 4);
  }

  private updateStatistics(result: AISuggestionResult): void {
    this.statistics.suggestionsGenerated += result.suggestions.length;
    this.statistics.averageConfidence =
      (this.statistics.averageConfidence + result.confidence) / 2;
    this.statistics.averageProcessingTime =
      (this.statistics.averageProcessingTime + result.processing_time) / 2;
    this.statistics.tokenUsage += result.tokens_used;
  }

  /**
   * Get suggester statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }
}

// Type definitions
interface CodeAnalysis {
  lineCount: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: string[];
  complexity: number;
  hasAsync: boolean;
  hasPromises: boolean;
  hasClasses: boolean;
  language: string;
  framework: string;
}

interface FunctionInfo {
  name: string;
  line: number;
  code: string;
  lines: number;
  hasJSDoc: boolean;
}

interface ClassInfo {
  name: string;
  line: number;
}
