/**
 * CBD Text Analysis Engine - Advanced Text Processing for Search
 * 
 * Comprehensive text analysis pipeline based on Lucene and Elasticsearch best practices
 * Features:
 * - Multi-language tokenization and stemming
 * - Stopword removal and synonym expansion
 * - N-gram generation and phonetic matching
 * - Custom analyzers and filter chains
 * - Real-time analysis performance optimization
 * 
 * Based on 2025 NLP best practices and Elasticsearch 8.x analyzers
 * 
 * @author CBD Database Team
 * @version 1.0.0
 * @created 2025-08-26
 */

import { 
  TextAnalyzer, 
  TokenizerType, 
  TokenFilter, 
  TokenFilterType, 
  CharFilter, 
  CharFilterType 
} from './CBDSearchEngine';

/**
 * Text analysis interfaces
 */
export interface AnalysisToken {
  token: string;
  position: number;
  startOffset: number;
  endOffset: number;
  type?: string;
  positionIncrement?: number;
  positionLength?: number;
  keyword?: boolean;
}

export interface AnalysisResult {
  tokens: AnalysisToken[];
  originalText: string;
  analyzer: string;
  took: number; // milliseconds
}

export interface TokenizerConfig {
  type: TokenizerType;
  pattern?: string;
  flags?: string;
  minGram?: number;
  maxGram?: number;
  tokenChars?: string[];
}

export interface LanguageConfig {
  language: string;
  stopwords: string[];
  stemmerRules: Map<string, string>;
  synonyms: Map<string, string[]>;
  phonetic?: PhoneticConfig;
}

export interface PhoneticConfig {
  algorithm: PhoneticAlgorithm;
  replace: boolean;
}

export enum PhoneticAlgorithm {
  METAPHONE = 'metaphone',
  DOUBLE_METAPHONE = 'double_metaphone',
  SOUNDEX = 'soundex',
  REFINED_SOUNDEX = 'refined_soundex',
  BEIDER_MORSE = 'beider_morse'
}

/**
 * Main text analysis engine
 */
export class TextAnalysisEngine {
  private analyzers: Map<string, TextAnalyzer> = new Map();
  private languageConfigs: Map<string, LanguageConfig> = new Map();
  private tokenizers: Map<string, TokenizerConfig> = new Map();
  private analysisCache: Map<string, AnalysisResult> = new Map();

  constructor() {
    this.initializeBuiltInAnalyzers();
    this.initializeLanguageConfigs();
    this.initializeTokenizers();
  }

  /**
   * Analyze text using specified analyzer
   */
  async analyzeText(text: string, analyzerName: string = 'standard'): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `${analyzerName}:${text}`;
    const cached = this.analysisCache.get(cacheKey);
    if (cached) {
      return { ...cached, took: Date.now() - startTime };
    }

    const analyzer = this.analyzers.get(analyzerName);
    if (!analyzer) {
      throw new Error(`Analyzer "${analyzerName}" not found`);
    }

    // Process text through analysis pipeline
    let processedText = text;
    
    // Apply character filters
    if (analyzer.charFilters) {
      for (const charFilter of analyzer.charFilters) {
        processedText = await this.applyCharFilter(processedText, charFilter);
      }
    }

    // Tokenize
    const tokens = await this.tokenize(processedText, analyzer.tokenizer);

    // Apply token filters
    let filteredTokens = tokens;
    for (const filter of analyzer.filters) {
      filteredTokens = await this.applyTokenFilter(filteredTokens, filter, analyzer.language);
    }

    const result: AnalysisResult = {
      tokens: filteredTokens,
      originalText: text,
      analyzer: analyzerName,
      took: Date.now() - startTime
    };

    // Cache result
    this.analysisCache.set(cacheKey, result);
    if (this.analysisCache.size > 10000) {
      // Simple cache eviction
      const firstKey = this.analysisCache.keys().next().value;
      if (firstKey) {
        this.analysisCache.delete(firstKey);
      }
    }

    return result;
  }

  /**
   * Create custom analyzer
   */
  createAnalyzer(name: string, analyzer: TextAnalyzer): void {
    this.analyzers.set(name, analyzer);
  }

  /**
   * Get available analyzers
   */
  getAvailableAnalyzers(): string[] {
    return Array.from(this.analyzers.keys());
  }

  /**
   * Explain analysis - detailed breakdown of analysis process
   */
  async explainAnalysis(text: string, analyzerName: string = 'standard'): Promise<AnalysisExplanation> {
    const analyzer = this.analyzers.get(analyzerName);
    if (!analyzer) {
      throw new Error(`Analyzer "${analyzerName}" not found`);
    }

    const steps: AnalysisStep[] = [];
    let currentText = text;

    // Character filters
    if (analyzer.charFilters) {
      for (const charFilter of analyzer.charFilters) {
        const before = currentText;
        currentText = await this.applyCharFilter(currentText, charFilter);
        steps.push({
          name: `char_filter_${charFilter.type}`,
          input: before,
          output: currentText,
          type: 'char_filter'
        });
      }
    }

    // Tokenizer
    const tokens = await this.tokenize(currentText, analyzer.tokenizer);
    steps.push({
      name: `tokenizer_${analyzer.tokenizer}`,
      input: currentText,
      output: tokens.map(t => t.token).join(', '),
      tokens: tokens,
      type: 'tokenizer'
    });

    // Token filters
    let currentTokens = tokens;
    for (const filter of analyzer.filters) {
      const before = currentTokens;
      currentTokens = await this.applyTokenFilter(currentTokens, filter, analyzer.language);
      steps.push({
        name: `filter_${filter.type}`,
        input: before.map(t => t.token).join(', '),
        output: currentTokens.map(t => t.token).join(', '),
        tokens: currentTokens,
        type: 'filter'
      });
    }

    return {
      analyzer: analyzerName,
      originalText: text,
      finalTokens: currentTokens,
      steps
    };
  }

  // Private implementation methods

  private initializeBuiltInAnalyzers(): void {
    // Standard analyzer
    this.analyzers.set('standard', {
      name: 'standard',
      tokenizer: TokenizerType.STANDARD,
      filters: [
        { type: TokenFilterType.LOWERCASE }
      ]
    });

    // Keyword analyzer (no tokenization)
    this.analyzers.set('keyword', {
      name: 'keyword',
      tokenizer: TokenizerType.KEYWORD,
      filters: []
    });

    // Whitespace analyzer
    this.analyzers.set('whitespace', {
      name: 'whitespace',
      tokenizer: TokenizerType.WHITESPACE,
      filters: [
        { type: TokenFilterType.LOWERCASE }
      ]
    });

    // Stop analyzer (removes stopwords)
    this.analyzers.set('stop', {
      name: 'stop',
      tokenizer: TokenizerType.STANDARD,
      filters: [
        { type: TokenFilterType.LOWERCASE },
        { type: TokenFilterType.STOP }
      ]
    });

    // Simple analyzer
    this.analyzers.set('simple', {
      name: 'simple',
      tokenizer: TokenizerType.STANDARD,
      filters: [
        { type: TokenFilterType.LOWERCASE }
      ]
    });

    // Language-specific analyzers
    for (const lang of ['english', 'spanish', 'french', 'german', 'italian', 'portuguese']) {
      this.analyzers.set(lang, {
        name: lang,
        tokenizer: TokenizerType.STANDARD,
        filters: [
          { type: TokenFilterType.LOWERCASE },
          { type: TokenFilterType.STOP, config: { language: lang } },
          { type: TokenFilterType.STEMMER, config: { language: lang } }
        ],
        language: lang
      });
    }
  }

  private initializeLanguageConfigs(): void {
    // English configuration
    this.languageConfigs.set('english', {
      language: 'english',
      stopwords: [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 
        'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 
        'the', 'to', 'was', 'will', 'with', 'would'
      ],
      stemmerRules: new Map([
        ['running', 'run'],
        ['ran', 'run'],
        ['flies', 'fly'],
        ['dogs', 'dog'],
        ['churches', 'church'],
        ['crying', 'cry'],
        ['better', 'good'],
        ['best', 'good']
      ]),
      synonyms: new Map([
        ['quick', ['fast', 'rapid', 'speedy']],
        ['big', ['large', 'huge', 'enormous']],
        ['small', ['tiny', 'little', 'miniature']]
      ])
    });

    // Add more language configurations as needed
  }

  private initializeTokenizers(): void {
    this.tokenizers.set('standard', {
      type: TokenizerType.STANDARD
    });

    this.tokenizers.set('keyword', {
      type: TokenizerType.KEYWORD
    });

    this.tokenizers.set('whitespace', {
      type: TokenizerType.WHITESPACE
    });

    this.tokenizers.set('pattern', {
      type: TokenizerType.PATTERN,
      pattern: '\\W+',
      flags: 'g'
    });

    this.tokenizers.set('ngram', {
      type: TokenizerType.NGRAM,
      minGram: 2,
      maxGram: 3
    });

    this.tokenizers.set('edge_ngram', {
      type: TokenizerType.EDGE_NGRAM,
      minGram: 2,
      maxGram: 10
    });
  }

  private async applyCharFilter(text: string, charFilter: CharFilter): Promise<string> {
    switch (charFilter.type) {
      case CharFilterType.HTML_STRIP:
        return text.replace(/<[^>]*>/g, '');
      
      case CharFilterType.MAPPING:
        if (charFilter.config?.mappings) {
          let result = text;
          for (const [from, to] of Object.entries(charFilter.config.mappings)) {
            result = result.replace(new RegExp(from, 'g'), String(to));
          }
          return result;
        }
        return text;
      
      case CharFilterType.PATTERN_REPLACE:
        if (charFilter.config?.pattern && charFilter.config?.replacement) {
          const pattern = new RegExp(charFilter.config.pattern, charFilter.config.flags || 'g');
          return text.replace(pattern, charFilter.config.replacement);
        }
        return text;
      
      default:
        return text;
    }
  }

  private async tokenize(text: string, tokenizerType: TokenizerType): Promise<AnalysisToken[]> {
    const tokenizerConfig = this.tokenizers.get(tokenizerType);
    if (!tokenizerConfig) {
      throw new Error(`Tokenizer "${tokenizerType}" not configured`);
    }

    switch (tokenizerType) {
      case TokenizerType.STANDARD:
        return this.standardTokenize(text);
      
      case TokenizerType.KEYWORD:
        return this.keywordTokenize(text);
      
      case TokenizerType.WHITESPACE:
        return this.whitespaceTokenize(text);
      
      case TokenizerType.PATTERN:
        return this.patternTokenize(text, tokenizerConfig);
      
      case TokenizerType.NGRAM:
        return this.ngramTokenize(text, tokenizerConfig);
      
      case TokenizerType.EDGE_NGRAM:
        return this.edgeNgramTokenize(text, tokenizerConfig);
      
      default:
        return this.standardTokenize(text);
    }
  }

  private standardTokenize(text: string): AnalysisToken[] {
    const tokens: AnalysisToken[] = [];
    const regex = /\b\w+\b/g;
    let match;
    let position = 0;

    while ((match = regex.exec(text)) !== null) {
      tokens.push({
        token: match[0],
        position: position++,
        startOffset: match.index,
        endOffset: match.index + match[0].length
      });
    }

    return tokens;
  }

  private keywordTokenize(text: string): AnalysisToken[] {
    return [{
      token: text,
      position: 0,
      startOffset: 0,
      endOffset: text.length,
      keyword: true
    }];
  }

  private whitespaceTokenize(text: string): AnalysisToken[] {
    const tokens: AnalysisToken[] = [];
    const words = text.split(/\s+/).filter(word => word.length > 0);
    let offset = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const startOffset = text.indexOf(word, offset);
      tokens.push({
        token: word,
        position: i,
        startOffset,
        endOffset: startOffset + word.length
      });
      offset = startOffset + word.length;
    }

    return tokens;
  }

  private patternTokenize(text: string, config: TokenizerConfig): AnalysisToken[] {
    const tokens: AnalysisToken[] = [];
    const pattern = new RegExp(config.pattern || '\\W+', config.flags || 'g');
    const words = text.split(pattern).filter(word => word.length > 0);
    let position = 0;
    let offset = 0;

    for (const word of words) {
      const startOffset = text.indexOf(word, offset);
      tokens.push({
        token: word,
        position: position++,
        startOffset,
        endOffset: startOffset + word.length
      });
      offset = startOffset + word.length;
    }

    return tokens;
  }

  private ngramTokenize(text: string, config: TokenizerConfig): AnalysisToken[] {
    const tokens: AnalysisToken[] = [];
    const minGram = config.minGram || 2;
    const maxGram = config.maxGram || 3;
    let position = 0;

    for (let gramSize = minGram; gramSize <= maxGram; gramSize++) {
      for (let i = 0; i <= text.length - gramSize; i++) {
        const gram = text.substring(i, i + gramSize);
        tokens.push({
          token: gram,
          position: position++,
          startOffset: i,
          endOffset: i + gramSize
        });
      }
    }

    return tokens;
  }

  private edgeNgramTokenize(text: string, config: TokenizerConfig): AnalysisToken[] {
    const tokens: AnalysisToken[] = [];
    const minGram = config.minGram || 2;
    const maxGram = Math.min(config.maxGram || 10, text.length);

    for (let gramSize = minGram; gramSize <= maxGram; gramSize++) {
      const gram = text.substring(0, gramSize);
      tokens.push({
        token: gram,
        position: gramSize - minGram,
        startOffset: 0,
        endOffset: gramSize
      });
    }

    return tokens;
  }

  private async applyTokenFilter(
    tokens: AnalysisToken[], 
    filter: TokenFilter, 
    language?: string
  ): Promise<AnalysisToken[]> {
    switch (filter.type) {
      case TokenFilterType.LOWERCASE:
        return tokens.map(token => ({
          ...token,
          token: token.token.toLowerCase()
        }));

      case TokenFilterType.UPPERCASE:
        return tokens.map(token => ({
          ...token,
          token: token.token.toUpperCase()
        }));

      case TokenFilterType.STOP:
        return this.applyStopFilter(tokens, language);

      case TokenFilterType.STEMMER:
        return this.applyStemmerFilter(tokens, language);

      case TokenFilterType.SYNONYM:
        return this.applySynonymFilter(tokens, language);

      case TokenFilterType.PHONETIC:
        return this.applyPhoneticFilter(tokens, filter.config);

      case TokenFilterType.NGRAM:
        return this.applyNgramFilter(tokens, filter.config);

      case TokenFilterType.EDGE_NGRAM:
        return this.applyEdgeNgramFilter(tokens, filter.config);

      case TokenFilterType.TRIM:
        return tokens.map(token => ({
          ...token,
          token: token.token.trim()
        }));

      case TokenFilterType.REVERSE:
        return tokens.map(token => ({
          ...token,
          token: token.token.split('').reverse().join('')
        }));

      default:
        return tokens;
    }
  }

  private applyStopFilter(tokens: AnalysisToken[], language?: string): AnalysisToken[] {
    const langConfig = language ? this.languageConfigs.get(language) : null;
    const stopwords = langConfig?.stopwords || this.languageConfigs.get('english')?.stopwords || [];
    const stopwordSet = new Set(stopwords);

    return tokens.filter(token => !stopwordSet.has(token.token.toLowerCase()));
  }

  private applyStemmerFilter(tokens: AnalysisToken[], language?: string): AnalysisToken[] {
    const langConfig = language ? this.languageConfigs.get(language) : null;
    const stemmerRules = langConfig?.stemmerRules || new Map();

    return tokens.map(token => {
      const stemmed = stemmerRules.get(token.token.toLowerCase());
      return {
        ...token,
        token: stemmed || this.porterStem(token.token)
      };
    });
  }

  private applySynonymFilter(tokens: AnalysisToken[], language?: string): AnalysisToken[] {
    const langConfig = language ? this.languageConfigs.get(language) : null;
    const synonyms = langConfig?.synonyms || new Map();
    
    const expandedTokens: AnalysisToken[] = [];

    for (const token of tokens) {
      expandedTokens.push(token);
      
      const synonymList = synonyms.get(token.token.toLowerCase());
      if (synonymList) {
        for (const synonym of synonymList) {
          expandedTokens.push({
            ...token,
            token: synonym,
            positionIncrement: 0 // Same position as original token
          });
        }
      }
    }

    return expandedTokens;
  }

  private applyPhoneticFilter(tokens: AnalysisToken[], config?: any): AnalysisToken[] {
    const algorithm = config?.algorithm || PhoneticAlgorithm.METAPHONE;
    
    return tokens.map(token => ({
      ...token,
      token: this.generatePhoneticCode(token.token, algorithm)
    }));
  }

  private applyNgramFilter(tokens: AnalysisToken[], config?: any): AnalysisToken[] {
    const minGram = config?.minGram || 2;
    const maxGram = config?.maxGram || 3;
    const expandedTokens: AnalysisToken[] = [];

    for (const token of tokens) {
      for (let gramSize = minGram; gramSize <= Math.min(maxGram, token.token.length); gramSize++) {
        for (let i = 0; i <= token.token.length - gramSize; i++) {
          const gram = token.token.substring(i, i + gramSize);
          expandedTokens.push({
            ...token,
            token: gram,
            startOffset: token.startOffset + i,
            endOffset: token.startOffset + i + gramSize
          });
        }
      }
    }

    return expandedTokens;
  }

  private applyEdgeNgramFilter(tokens: AnalysisToken[], config?: any): AnalysisToken[] {
    const minGram = config?.minGram || 2;
    const maxGram = config?.maxGram || 10;
    const expandedTokens: AnalysisToken[] = [];

    for (const token of tokens) {
      for (let gramSize = minGram; gramSize <= Math.min(maxGram, token.token.length); gramSize++) {
        const gram = token.token.substring(0, gramSize);
        expandedTokens.push({
          ...token,
          token: gram,
          endOffset: token.startOffset + gramSize
        });
      }
    }

    return expandedTokens;
  }

  // Helper methods for advanced text processing

  private porterStem(word: string): string {
    // Simplified Porter Stemmer implementation
    word = word.toLowerCase();
    
    // Step 1a
    word = word.replace(/sses$/g, 'ss');
    word = word.replace(/ies$/g, 'i');
    word = word.replace(/ss$/g, 'ss');
    word = word.replace(/s$/g, '');
    
    // Step 1b
    word = word.replace(/eed$/g, 'ee');
    word = word.replace(/ed$/g, '');
    word = word.replace(/ing$/g, '');
    
    // Step 2
    word = word.replace(/ational$/g, 'ate');
    word = word.replace(/tional$/g, 'tion');
    word = word.replace(/enci$/g, 'ence');
    word = word.replace(/anci$/g, 'ance');
    
    return word;
  }

  private generatePhoneticCode(word: string, algorithm: PhoneticAlgorithm): string {
    switch (algorithm) {
      case PhoneticAlgorithm.METAPHONE:
        return this.metaphone(word);
      case PhoneticAlgorithm.SOUNDEX:
        return this.soundex(word);
      default:
        return word;
    }
  }

  private metaphone(word: string): string {
    // Simplified Metaphone algorithm
    word = word.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (word.length === 0) return '';
    
    let metaphone = '';
    let current = 0;
    
    // Initial transformations
    if (word.match(/^(KN|GN|PN|AE|WR)/)) {
      current = 1;
    }
    
    if (word[0] === 'X') {
      metaphone = 'S';
      current = 1;
    } else {
      metaphone = word[0];
    }
    
    // Process remaining characters
    while (current < word.length && metaphone.length < 4) {
      const char = word[current];
      
      switch (char) {
        case 'B':
          metaphone += (current === word.length - 1 && word[current - 1] === 'M') ? '' : 'B';
          break;
        case 'C':
          if (current > 0 && word[current - 1] === 'S' && 'EIY'.includes(word[current + 1])) {
            // Silent
          } else if ('EIY'.includes(word[current + 1])) {
            metaphone += 'S';
          } else {
            metaphone += 'K';
          }
          break;
        case 'D':
          metaphone += ('GE'.includes(word.substring(current + 1, current + 3))) ? 'J' : 'T';
          break;
        case 'F':
        case 'J':
        case 'L':
        case 'M':
        case 'N':
        case 'R':
          metaphone += char;
          break;
        case 'G':
          if (word[current + 1] === 'H' && current > 0 && !'AEIOU'.includes(word[current - 1])) {
            // Silent
          } else if (word[current + 1] === 'N' && current === word.length - 2) {
            // Silent
          } else if ('EIY'.includes(word[current + 1])) {
            metaphone += 'J';
          } else {
            metaphone += 'K';
          }
          break;
        case 'H':
          if (current === 0 || 'AEIOU'.includes(word[current - 1])) {
            metaphone += 'H';
          }
          break;
        case 'K':
          if (current === 0 || word[current - 1] !== 'C') {
            metaphone += 'K';
          }
          break;
        case 'P':
          metaphone += (word[current + 1] === 'H') ? 'F' : 'P';
          break;
        case 'Q':
          metaphone += 'K';
          break;
        case 'S':
          if ('EIY'.includes(word[current + 1])) {
            metaphone += 'S';
          } else if (word.substring(current, current + 2) === 'SH') {
            metaphone += 'X';
          } else {
            metaphone += 'S';
          }
          break;
        case 'T':
          if (word.substring(current, current + 2) === 'TH') {
            metaphone += '0';
          } else if ('EIY'.includes(word[current + 1])) {
            metaphone += 'S';
          } else {
            metaphone += 'T';
          }
          break;
        case 'V':
          metaphone += 'F';
          break;
        case 'W':
        case 'Y':
          if ('AEIOU'.includes(word[current + 1])) {
            metaphone += char;
          }
          break;
        case 'X':
          metaphone += 'KS';
          break;
        case 'Z':
          metaphone += 'S';
          break;
      }
      current++;
    }
    
    return metaphone;
  }

  private soundex(word: string): string {
    // Soundex algorithm implementation
    word = word.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (word.length === 0) return '0000';
    
    let soundex = word[0];
    const mapping: { [key: string]: string } = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    for (let i = 1; i < word.length && soundex.length < 4; i++) {
      const code = mapping[word[i]];
      if (code && code !== soundex.slice(-1)) {
        soundex += code;
      }
    }
    
    return soundex.padEnd(4, '0');
  }
}

// Supporting interfaces

export interface AnalysisStep {
  name: string;
  input: string;
  output: string;
  tokens?: AnalysisToken[];
  type: 'char_filter' | 'tokenizer' | 'filter';
}

export interface AnalysisExplanation {
  analyzer: string;
  originalText: string;
  finalTokens: AnalysisToken[];
  steps: AnalysisStep[];
}

export default TextAnalysisEngine;