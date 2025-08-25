/**
 * @fileoverview Translation Workflow Automator
 * @description Automates translation key extraction, missing translation detection, and translation management
 */

import fs from 'fs';
import path from 'path';

export default function enhanceTranslationWorkflow(dirs, appName) {
    createTranslationExtractor(dirs.utilsDir, appName);
    createMissingTranslationDetector(dirs.utilsDir, appName);
    createTranslationManager(dirs.utilsDir, appName);
    createTranslationScripts(dirs.scriptsDir || dirs.baseDir, appName);
    console.log(`🔧 Translation workflow automated for ${appName}`);
}

function createTranslationExtractor(utilsDir, appName) {
    const extractorContent = `/**
 * @fileoverview Translation Key Extractor
 * @description Automatically extracts translation keys from source code
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface TranslationKey {
  key: string;
  namespace: string;
  context?: string;
  file: string;
  line: number;
  column: number;
  defaultValue?: string;
}

interface ExtractorOptions {
  srcPaths: string[];
  extensions: string[];
  patterns: RegExp[];
  outputPath: string;
  namespaceFromPath: boolean;
  includeContext: boolean;
}

export class TranslationExtractor {
  private options: ExtractorOptions;

  constructor(options: Partial<ExtractorOptions> = {}) {
    this.options = {
      srcPaths: ['src/**/*.{ts,tsx,js,jsx}'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      patterns: [
        // t('key') or t("key")
        /t\\(\\s*['"\`]([^'"\`]+)['"\`]/g,
        // t('namespace:key') or t("namespace:key")
        /t\\(\\s*['"\`]([^'"\`]+:[^'"\`]+)['"\`]/g,
        // useTranslation hook with namespace
        /useTranslation\\(\\s*['"\`]([^'"\`]+)['"\`]/g,
        // Trans component with i18nKey
        /i18nKey=['"\`]([^'"\`]+)['"\`]/g,
        // Translation function with options
        /t\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*,\\s*\\{[^}]*\\}/g
      ],
      outputPath: 'translations/extracted-keys.json',
      namespaceFromPath: true,
      includeContext: true,
      ...options
    };
  }

  /**
   * Extract translation keys from source files
   */
  async extractKeys(): Promise<TranslationKey[]> {
    const allKeys: TranslationKey[] = [];
    const files = await this.getSourceFiles();

    for (const file of files) {
      try {
        const keys = await this.extractFromFile(file);
        allKeys.push(...keys);
      } catch (error) {
        console.warn(\`Warning: Could not extract keys from \${file}:\`, error.message);
      }
    }

    return this.deduplicateKeys(allKeys);
  }

  /**
   * Extract keys from a single file
   */
  private async extractFromFile(filePath: string): Promise<TranslationKey[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys: TranslationKey[] = [];
    const lines = content.split('\\n');

    for (const pattern of this.options.patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const keyString = match[1];
        const { line, column } = this.getLineColumn(content, match.index);
        
        const namespace = this.extractNamespace(keyString, filePath);
        const cleanKey = keyString.includes(':') ? keyString.split(':')[1] : keyString;
        
        const translationKey: TranslationKey = {
          key: cleanKey,
          namespace,
          file: path.relative(process.cwd(), filePath),
          line,
          column
        };

        if (this.options.includeContext) {
          translationKey.context = this.extractContext(lines, line - 1);
        }

        // Try to extract default value
        const defaultValue = this.extractDefaultValue(content, match.index);
        if (defaultValue) {
          translationKey.defaultValue = defaultValue;
        }

        keys.push(translationKey);
      }
    }

    return keys;
  }

  /**
   * Get source files matching the patterns
   */
  private async getSourceFiles(): Promise<string[]> {
    const files: string[] = [];
    
    for (const pattern of this.options.srcPaths) {
      const matches = await glob(pattern, { 
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
      });
      files.push(...matches);
    }

    return files.filter(file => 
      this.options.extensions.some(ext => file.endsWith(ext))
    );
  }

  /**
   * Extract namespace from key or file path
   */
  private extractNamespace(keyString: string, filePath: string): string {
    // If key contains namespace, use it
    if (keyString.includes(':')) {
      return keyString.split(':')[0];
    }

    // Otherwise, derive from file path if enabled
    if (this.options.namespaceFromPath) {
      const relativePath = path.relative(process.cwd(), filePath);
      const pathParts = relativePath.split(path.sep);
      
      // Look for common patterns
      if (pathParts.includes('components')) {
        return 'components';
      }
      if (pathParts.includes('pages')) {
        return 'pages';
      }
      if (pathParts.includes('features')) {
        const featureIndex = pathParts.indexOf('features');
        if (featureIndex + 1 < pathParts.length) {
          return pathParts[featureIndex + 1];
        }
      }
    }

    return 'common';
  }

  /**
   * Get line and column number from character index
   */
  private getLineColumn(content: string, index: number): { line: number; column: number } {
    const beforeMatch = content.substring(0, index);
    const lines = beforeMatch.split('\\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  /**
   * Extract context around the translation key
   */
  private extractContext(lines: string[], lineIndex: number): string {
    const contextLines = [];
    const startIndex = Math.max(0, lineIndex - 2);
    const endIndex = Math.min(lines.length, lineIndex + 3);
    
    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i].trim();
      if (line) {
        contextLines.push(line);
      }
    }
    
    return contextLines.join(' ... ').substring(0, 200);
  }

  /**
   * Try to extract default value from t() function call
   */
  private extractDefaultValue(content: string, matchIndex: number): string | undefined {
    // Look for default value in t() call options
    const afterMatch = content.substring(matchIndex);
    const defaultMatch = afterMatch.match(/defaultValue\\s*:\\s*['"\`]([^'"\`]+)['"\`]/);
    
    if (defaultMatch) {
      return defaultMatch[1];
    }

    // Look for fallback value in Trans component
    const fallbackMatch = afterMatch.match(/defaults=['"\`]([^'"\`]+)['"\`]/);
    if (fallbackMatch) {
      return fallbackMatch[1];
    }

    return undefined;
  }

  /**
   * Remove duplicate keys
   */
  private deduplicateKeys(keys: TranslationKey[]): TranslationKey[] {
    const seen = new Set<string>();
    const uniqueKeys: TranslationKey[] = [];

    for (const key of keys) {
      const identifier = \`\${key.namespace}:\${key.key}\`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueKeys.push(key);
      }
    }

    return uniqueKeys;
  }

  /**
   * Save extracted keys to file
   */
  async saveKeys(keys: TranslationKey[]): Promise<void> {
    const outputDir = path.dirname(this.options.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      extractedAt: new Date().toISOString(),
      totalKeys: keys.length,
      keysByNamespace: this.groupKeysByNamespace(keys),
      keys
    };

    fs.writeFileSync(this.options.outputPath, JSON.stringify(output, null, 2));
    console.log(\`✅ Extracted \${keys.length} translation keys to \${this.options.outputPath}\`);
  }

  /**
   * Group keys by namespace
   */
  private groupKeysByNamespace(keys: TranslationKey[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const key of keys) {
      groups[key.namespace] = (groups[key.namespace] || 0) + 1;
    }
    
    return groups;
  }

  /**
   * Generate translation template files
   */
  async generateTemplates(keys: TranslationKey[], locales: string[]): Promise<void> {
    const keysByNamespace = this.groupKeysByNamespaceWithKeys(keys);
    
    for (const locale of locales) {
      for (const [namespace, namespaceKeys] of Object.entries(keysByNamespace)) {
        const templatePath = path.join('locales', locale, \`\${namespace}.json\`);
        const templateDir = path.dirname(templatePath);
        
        if (!fs.existsSync(templateDir)) {
          fs.mkdirSync(templateDir, { recursive: true });
        }

        // Load existing translations if they exist
        let existingTranslations = {};
        if (fs.existsSync(templatePath)) {
          try {
            existingTranslations = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
          } catch (error) {
            console.warn(\`Warning: Could not parse existing translations for \${templatePath}\`);
          }
        }

        // Create template with existing translations and new keys
        const template: Record<string, string> = { ...existingTranslations };
        
        for (const key of namespaceKeys) {
          if (!template[key.key]) {
            template[key.key] = key.defaultValue || \`[TRANSLATE: \${key.key}]\`;
          }
        }

        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
      }
    }
    
    console.log(\`✅ Generated translation templates for \${locales.length} locales\`);
  }

  /**
   * Group keys by namespace with key objects
   */
  private groupKeysByNamespaceWithKeys(keys: TranslationKey[]): Record<string, TranslationKey[]> {
    const groups: Record<string, TranslationKey[]> = {};
    
    for (const key of keys) {
      if (!groups[key.namespace]) {
        groups[key.namespace] = [];
      }
      groups[key.namespace].push(key);
    }
    
    return groups;
  }
}

/**
 * Create a translation extractor instance
 */
export const createTranslationExtractor = (options?: Partial<ExtractorOptions>) => {
  return new TranslationExtractor(options);
};

export default TranslationExtractor;`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'translation-extractor.ts'), extractorContent);
}

function createMissingTranslationDetector(utilsDir, appName) {
    const detectorContent = `/**
 * @fileoverview Missing Translation Detector
 * @description Detects missing translations and provides reports
 */

import fs from 'fs';
import path from 'path';

interface MissingTranslation {
  key: string;
  namespace: string;
  locale: string;
  usedIn: string[];
  defaultValue?: string;
}

interface TranslationCoverage {
  locale: string;
  namespace: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number;
}

interface DetectorOptions {
  localesPath: string;
  supportedLocales: string[];
  supportedNamespaces: string[];
  outputPath: string;
  minCoverageThreshold: number;
}

export class MissingTranslationDetector {
  private options: DetectorOptions;

  constructor(options: Partial<DetectorOptions> = {}) {
    this.options = {
      localesPath: 'locales',
      supportedLocales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi', 'pt', 'ru'],
      supportedNamespaces: ['common', 'components', 'pages', 'auth', 'navigation', 'errors', 'validation'],
      outputPath: 'translations/missing-translations.json',
      minCoverageThreshold: 80,
      ...options
    };
  }

  /**
   * Detect missing translations across all locales and namespaces
   */
  async detectMissingTranslations(): Promise<MissingTranslation[]> {
    const missingTranslations: MissingTranslation[] = [];
    const allKeys = await this.getAllTranslationKeys();

    for (const locale of this.options.supportedLocales) {
      for (const namespace of this.options.supportedNamespaces) {
        const existing = await this.loadTranslations(locale, namespace);
        const required = allKeys[namespace] || [];

        for (const key of required) {
          if (!existing[key]) {
            missingTranslations.push({
              key,
              namespace,
              locale,
              usedIn: await this.findKeyUsage(namespace, key)
            });
          }
        }
      }
    }

    return missingTranslations;
  }

  /**
   * Generate translation coverage report
   */
  async generateCoverageReport(): Promise<TranslationCoverage[]> {
    const coverageReport: TranslationCoverage[] = [];
    const allKeys = await this.getAllTranslationKeys();

    for (const locale of this.options.supportedLocales) {
      for (const namespace of this.options.supportedNamespaces) {
        const existing = await this.loadTranslations(locale, namespace);
        const required = allKeys[namespace] || [];
        
        const missingKeys = required.filter(key => !existing[key]);
        const translatedKeys = required.length - missingKeys.length;
        const coverage = required.length > 0 ? (translatedKeys / required.length) * 100 : 100;

        coverageReport.push({
          locale,
          namespace,
          totalKeys: required.length,
          translatedKeys,
          missingKeys,
          coverage: Math.round(coverage * 100) / 100
        });
      }
    }

    return coverageReport;
  }

  /**
   * Find untranslated keys (keys with placeholder values)
   */
  async findUntranslatedKeys(): Promise<MissingTranslation[]> {
    const untranslated: MissingTranslation[] = [];

    for (const locale of this.options.supportedLocales) {
      if (locale === 'en') continue; // Skip base locale

      for (const namespace of this.options.supportedNamespaces) {
        const translations = await this.loadTranslations(locale, namespace);
        
        for (const [key, value] of Object.entries(translations)) {
          if (this.isUntranslatedValue(value, key)) {
            untranslated.push({
              key,
              namespace,
              locale,
              usedIn: await this.findKeyUsage(namespace, key),
              defaultValue: value
            });
          }
        }
      }
    }

    return untranslated;
  }

  /**
   * Find unused translation keys
   */
  async findUnusedKeys(): Promise<Array<{ key: string; namespace: string; locale: string }>> {
    const unusedKeys: Array<{ key: string; namespace: string; locale: string }> = [];
    const usedKeys = await this.getUsedKeys();

    for (const locale of this.options.supportedLocales) {
      for (const namespace of this.options.supportedNamespaces) {
        const translations = await this.loadTranslations(locale, namespace);
        
        for (const key of Object.keys(translations)) {
          const fullKey = \`\${namespace}:\${key}\`;
          if (!usedKeys.has(fullKey) && !usedKeys.has(key)) {
            unusedKeys.push({ key, namespace, locale });
          }
        }
      }
    }

    return unusedKeys;
  }

  /**
   * Generate missing translations report
   */
  async generateMissingTranslationsReport(): Promise<void> {
    const missing = await this.detectMissingTranslations();
    const untranslated = await this.findUntranslatedKeys();
    const coverage = await this.generateCoverageReport();
    const unused = await this.findUnusedKeys();

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalMissing: missing.length,
        totalUntranslated: untranslated.length,
        totalUnused: unused.length,
        averageCoverage: this.calculateAverageCoverage(coverage),
        localesCoverage: this.getLocalesCoverage(coverage)
      },
      missingTranslations: this.groupByLocaleAndNamespace(missing),
      untranslatedKeys: this.groupByLocaleAndNamespace(untranslated),
      coverageReport: coverage,
      unusedKeys: this.groupUnusedByNamespace(unused),
      recommendations: this.generateRecommendations(coverage, missing.length, unused.length)
    };

    const outputDir = path.dirname(this.options.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(this.options.outputPath, JSON.stringify(report, null, 2));
    console.log(\`📊 Translation report generated: \${this.options.outputPath}\`);
    
    // Print summary
    this.printSummary(report.summary);
  }

  /**
   * Auto-fix missing translations using various strategies
   */
  async autoFixMissingTranslations(strategy: 'copy-from-base' | 'placeholder' | 'ai-translate' = 'copy-from-base'): Promise<void> {
    const missing = await this.detectMissingTranslations();
    const baseLocale = 'en';

    for (const missingKey of missing) {
      try {
        let translationValue = '';

        switch (strategy) {
          case 'copy-from-base':
            const baseTranslations = await this.loadTranslations(baseLocale, missingKey.namespace);
            translationValue = baseTranslations[missingKey.key] || \`[TRANSLATE: \${missingKey.key}]\`;
            break;

          case 'placeholder':
            translationValue = \`[TRANSLATE: \${missingKey.key}]\`;
            break;

          case 'ai-translate':
            // In a real implementation, this would call an AI translation service
            translationValue = await this.aiTranslate(missingKey.key, baseLocale, missingKey.locale);
            break;
        }

        await this.addTranslation(missingKey.locale, missingKey.namespace, missingKey.key, translationValue);
      } catch (error) {
        console.warn(\`Could not auto-fix translation \${missingKey.namespace}:\${missingKey.key} for \${missingKey.locale}:\`, error.message);
      }
    }

    console.log(\`✅ Auto-fixed \${missing.length} missing translations using '\${strategy}' strategy\`);
  }

  /**
   * Load translation file for a specific locale and namespace
   */
  private async loadTranslations(locale: string, namespace: string): Promise<Record<string, string>> {
    const filePath = path.join(this.options.localesPath, locale, \`\${namespace}.json\`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(\`Warning: Could not parse translations file \${filePath}\`);
      return {};
    }
  }

  /**
   * Get all translation keys from base locale (English)
   */
  private async getAllTranslationKeys(): Promise<Record<string, string[]>> {
    const baseLocale = 'en';
    const allKeys: Record<string, string[]> = {};

    for (const namespace of this.options.supportedNamespaces) {
      const translations = await this.loadTranslations(baseLocale, namespace);
      allKeys[namespace] = Object.keys(translations);
    }

    return allKeys;
  }

  /**
   * Find where a translation key is used in the codebase
   */
  private async findKeyUsage(namespace: string, key: string): Promise<string[]> {
    // This is a simplified implementation
    // In a real application, you'd scan the source code for usage
    return [\`Used in \${namespace} namespace\`];
  }

  /**
   * Check if a translation value is untranslated (placeholder)
   */
  private isUntranslatedValue(value: string, key: string): boolean {
    // Check for common placeholder patterns
    const placeholderPatterns = [
      /^\[TRANSLATE:/i,
      /^\[TODO:/i,
      /^TODO:/i,
      new RegExp(\`^\${key}$\`, 'i'), // Same as key
      /^\\s*$/ // Empty or whitespace only
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Get used translation keys from extracted keys file
   */
  private async getUsedKeys(): Promise<Set<string>> {
    const extractedKeysPath = 'translations/extracted-keys.json';
    const usedKeys = new Set<string>();

    if (fs.existsSync(extractedKeysPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(extractedKeysPath, 'utf-8'));
        if (content.keys) {
          for (const keyInfo of content.keys) {
            usedKeys.add(\`\${keyInfo.namespace}:\${keyInfo.key}\`);
            usedKeys.add(keyInfo.key);
          }
        }
      } catch (error) {
        console.warn('Could not load extracted keys for usage analysis');
      }
    }

    return usedKeys;
  }

  /**
   * Group missing translations by locale and namespace
   */
  private groupByLocaleAndNamespace(items: MissingTranslation[]): Record<string, Record<string, MissingTranslation[]>> {
    const grouped: Record<string, Record<string, MissingTranslation[]>> = {};

    for (const item of items) {
      if (!grouped[item.locale]) {
        grouped[item.locale] = {};
      }
      if (!grouped[item.locale][item.namespace]) {
        grouped[item.locale][item.namespace] = [];
      }
      grouped[item.locale][item.namespace].push(item);
    }

    return grouped;
  }

  /**
   * Group unused keys by namespace
   */
  private groupUnusedByNamespace(unused: Array<{ key: string; namespace: string; locale: string }>): Record<string, Array<{ key: string; locale: string }>> {
    const grouped: Record<string, Array<{ key: string; locale: string }>> = {};

    for (const item of unused) {
      if (!grouped[item.namespace]) {
        grouped[item.namespace] = [];
      }
      grouped[item.namespace].push({ key: item.key, locale: item.locale });
    }

    return grouped;
  }

  /**
   * Calculate average coverage across all locales and namespaces
   */
  private calculateAverageCoverage(coverage: TranslationCoverage[]): number {
    if (coverage.length === 0) return 100;
    
    const totalCoverage = coverage.reduce((sum, item) => sum + item.coverage, 0);
    return Math.round((totalCoverage / coverage.length) * 100) / 100;
  }

  /**
   * Get coverage summary by locale
   */
  private getLocalesCoverage(coverage: TranslationCoverage[]): Record<string, number> {
    const localesCoverage: Record<string, number> = {};

    for (const locale of this.options.supportedLocales) {
      const localeCoverage = coverage.filter(item => item.locale === locale);
      if (localeCoverage.length > 0) {
        const avgCoverage = localeCoverage.reduce((sum, item) => sum + item.coverage, 0) / localeCoverage.length;
        localesCoverage[locale] = Math.round(avgCoverage * 100) / 100;
      } else {
        localesCoverage[locale] = 0;
      }
    }

    return localesCoverage;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(coverage: TranslationCoverage[], missingCount: number, unusedCount: number): string[] {
    const recommendations: string[] = [];

    // Coverage recommendations
    const lowCoverageLocales = Object.entries(this.getLocalesCoverage(coverage))
      .filter(([, cov]) => cov < this.options.minCoverageThreshold)
      .map(([locale]) => locale);

    if (lowCoverageLocales.length > 0) {
      recommendations.push(\`Priority: Improve translation coverage for locales: \${lowCoverageLocales.join(', ')}\`);
    }

    // Missing translations
    if (missingCount > 0) {
      recommendations.push(\`Add \${missingCount} missing translations using 'npm run i18n:fix-missing' command\`);
    }

    // Unused keys
    if (unusedCount > 50) {
      recommendations.push(\`Clean up \${unusedCount} unused translation keys to reduce bundle size\`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Excellent! All translations are up to date and well covered.');
    } else {
      recommendations.push('Run translation extraction before adding new keys: npm run i18n:extract');
      recommendations.push('Set up automated translation validation in your CI/CD pipeline');
    }

    return recommendations;
  }

  /**
   * Print summary to console
   */
  private printSummary(summary: any): void {
    console.log('\\n📊 Translation Summary:');
    console.log(\`   Missing: \${summary.totalMissing}\`);
    console.log(\`   Untranslated: \${summary.totalUntranslated}\`);
    console.log(\`   Unused: \${summary.totalUnused}\`);
    console.log(\`   Average Coverage: \${summary.averageCoverage}%\`);
    
    console.log('\\n🌐 Coverage by Locale:');
    for (const [locale, coverage] of Object.entries(summary.localesCoverage)) {
      const status = coverage >= this.options.minCoverageThreshold ? '✅' : '⚠️';
      console.log(\`   \${status} \${locale}: \${coverage}%\`);
    }
    console.log('');
  }

  /**
   * Add a translation to a specific locale and namespace
   */
  private async addTranslation(locale: string, namespace: string, key: string, value: string): Promise<void> {
    const filePath = path.join(this.options.localesPath, locale, \`\${namespace}.json\`);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    let translations = {};
    if (fs.existsSync(filePath)) {
      translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    translations[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
  }

  /**
   * AI translation placeholder (would integrate with actual service)
   */
  private async aiTranslate(text: string, fromLocale: string, toLocale: string): Promise<string> {
    // Placeholder for AI translation service integration
    // In real implementation, you'd call services like Google Translate, DeepL, etc.
    return \`[AI_TRANSLATE: \${text}]\`;
  }
}

/**
 * Create a missing translation detector instance
 */
export const createMissingTranslationDetector = (options?: Partial<DetectorOptions>) => {
  return new MissingTranslationDetector(options);
};

export default MissingTranslationDetector;`;

    fs.writeFileSync(path.join(utilsDir, 'missing-translation-detector.ts'), detectorContent);
}

function createTranslationManager(utilsDir, appName) {
    const managerContent = `/**
 * @fileoverview Translation Manager
 * @description Comprehensive translation management and workflow automation
 */

import fs from 'fs';
import path from 'path';
import { TranslationExtractor } from './translation-extractor';
import { MissingTranslationDetector } from './missing-translation-detector';

interface TranslationManagerOptions {
  srcPaths: string[];
  localesPath: string;
  outputPath: string;
  supportedLocales: string[];
  supportedNamespaces: string[];
  baseLocale: string;
}

interface WorkflowOptions {
  extractKeys: boolean;
  detectMissing: boolean;
  generateTemplates: boolean;
  autoFix: boolean;
  autoFixStrategy: 'copy-from-base' | 'placeholder' | 'ai-translate';
  cleanupUnused: boolean;
  validateTranslations: boolean;
}

export class TranslationManager {
  private options: TranslationManagerOptions;
  private extractor: TranslationExtractor;
  private detector: MissingTranslationDetector;

  constructor(options: Partial<TranslationManagerOptions> = {}) {
    this.options = {
      srcPaths: ['src/**/*.{ts,tsx,js,jsx}'],
      localesPath: 'locales',
      outputPath: 'translations',
      supportedLocales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi', 'pt', 'ru'],
      supportedNamespaces: ['common', 'components', 'pages', 'auth', 'navigation', 'errors', 'validation'],
      baseLocale: 'en',
      ...options
    };

    this.extractor = new TranslationExtractor({
      srcPaths: this.options.srcPaths,
      outputPath: path.join(this.options.outputPath, 'extracted-keys.json')
    });

    this.detector = new MissingTranslationDetector({
      localesPath: this.options.localesPath,
      supportedLocales: this.options.supportedLocales,
      supportedNamespaces: this.options.supportedNamespaces,
      outputPath: path.join(this.options.outputPath, 'missing-translations.json')
    });
  }

  /**
   * Run complete translation workflow
   */
  async runWorkflow(workflowOptions: Partial<WorkflowOptions> = {}): Promise<void> {
    const options: WorkflowOptions = {
      extractKeys: true,
      detectMissing: true,
      generateTemplates: true,
      autoFix: false,
      autoFixStrategy: 'placeholder',
      cleanupUnused: false,
      validateTranslations: true,
      ...workflowOptions
    };

    console.log('🚀 Starting translation workflow...');

    try {
      // Step 1: Extract translation keys from source code
      if (options.extractKeys) {
        console.log('\\n📝 Extracting translation keys...');
        const keys = await this.extractor.extractKeys();
        await this.extractor.saveKeys(keys);
        console.log(\`   Found \${keys.length} translation keys\`);
      }

      // Step 2: Generate translation templates
      if (options.generateTemplates) {
        console.log('\\n📋 Generating translation templates...');
        const keys = await this.extractor.extractKeys();
        await this.extractor.generateTemplates(keys, this.options.supportedLocales);
      }

      // Step 3: Detect missing translations
      if (options.detectMissing) {
        console.log('\\n🔍 Detecting missing translations...');
        await this.detector.generateMissingTranslationsReport();
      }

      // Step 4: Auto-fix missing translations
      if (options.autoFix) {
        console.log(\`\\n🔧 Auto-fixing missing translations using '\${options.autoFixStrategy}' strategy...\`);
        await this.detector.autoFixMissingTranslations(options.autoFixStrategy);
      }

      // Step 5: Cleanup unused translations
      if (options.cleanupUnused) {
        console.log('\\n🧹 Cleaning up unused translations...');
        await this.cleanupUnusedTranslations();
      }

      // Step 6: Validate translations
      if (options.validateTranslations) {
        console.log('\\n✅ Validating translations...');
        await this.validateTranslations();
      }

      console.log('\\n🎉 Translation workflow completed successfully!');
    } catch (error) {
      console.error('❌ Translation workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract translation keys only
   */
  async extractKeys(): Promise<void> {
    console.log('📝 Extracting translation keys...');
    const keys = await this.extractor.extractKeys();
    await this.extractor.saveKeys(keys);
    console.log(\`✅ Extracted \${keys.length} translation keys\`);
  }

  /**
   * Generate missing translations report
   */
  async generateReport(): Promise<void> {
    console.log('📊 Generating translation report...');
    await this.detector.generateMissingTranslationsReport();
    console.log('✅ Translation report generated');
  }

  /**
   * Auto-fix missing translations
   */
  async fixMissing(strategy: 'copy-from-base' | 'placeholder' | 'ai-translate' = 'placeholder'): Promise<void> {
    console.log(\`🔧 Auto-fixing missing translations using '\${strategy}' strategy...\`);
    await this.detector.autoFixMissingTranslations(strategy);
    console.log('✅ Missing translations auto-fixed');
  }

  /**
   * Cleanup unused translation keys
   */
  async cleanupUnusedTranslations(): Promise<void> {
    const unusedKeys = await this.detector.findUnusedKeys();
    
    if (unusedKeys.length === 0) {
      console.log('✅ No unused translation keys found');
      return;
    }

    console.log(\`🧹 Found \${unusedKeys.length} unused translation keys\`);
    
    // Group by locale and namespace
    const groupedUnused: Record<string, Record<string, string[]>> = {};
    for (const { key, namespace, locale } of unusedKeys) {
      if (!groupedUnused[locale]) groupedUnused[locale] = {};
      if (!groupedUnused[locale][namespace]) groupedUnused[locale][namespace] = [];
      groupedUnused[locale][namespace].push(key);
    }

    // Remove unused keys
    for (const [locale, namespaces] of Object.entries(groupedUnused)) {
      for (const [namespace, keys] of Object.entries(namespaces)) {
        await this.removeTranslationKeys(locale, namespace, keys);
      }
    }

    console.log(\`✅ Cleaned up \${unusedKeys.length} unused translation keys\`);
  }

  /**
   * Validate translation files
   */
  async validateTranslations(): Promise<void> {
    const validationErrors: string[] = [];

    for (const locale of this.options.supportedLocales) {
      for (const namespace of this.options.supportedNamespaces) {
        const filePath = path.join(this.options.localesPath, locale, \`\${namespace}.json\`);
        
        if (!fs.existsSync(filePath)) {
          continue;
        }

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const translations = JSON.parse(content);
          
          // Validate JSON structure
          if (typeof translations !== 'object' || Array.isArray(translations)) {
            validationErrors.push(\`\${locale}/\${namespace}.json: Invalid JSON structure (must be an object)\`);
            continue;
          }

          // Validate translation values
          for (const [key, value] of Object.entries(translations)) {
            if (typeof value !== 'string') {
              validationErrors.push(\`\${locale}/\${namespace}.json: Key '\${key}' has non-string value\`);
            }
            
            if (typeof value === 'string' && value.trim() === '') {
              validationErrors.push(\`\${locale}/\${namespace}.json: Key '\${key}' has empty value\`);
            }

            // Check for placeholder values
            if (typeof value === 'string' && this.isPlaceholderValue(value, key)) {
              validationErrors.push(\`\${locale}/\${namespace}.json: Key '\${key}' appears to be untranslated\`);
            }
          }

          // Validate interpolation syntax
          for (const [key, value] of Object.entries(translations)) {
            if (typeof value === 'string') {
              const interpolationErrors = this.validateInterpolation(value);
              if (interpolationErrors.length > 0) {
                validationErrors.push(\`\${locale}/\${namespace}.json: Key '\${key}' has interpolation errors: \${interpolationErrors.join(', ')}\`);
              }
            }
          }

        } catch (error) {
          validationErrors.push(\`\${locale}/\${namespace}.json: Invalid JSON - \${error.message}\`);
        }
      }
    }

    if (validationErrors.length === 0) {
      console.log('✅ All translation files are valid');
    } else {
      console.log(\`⚠️  Found \${validationErrors.length} validation errors:\`);
      for (const error of validationErrors.slice(0, 10)) {
        console.log(\`   • \${error}\`);
      }
      if (validationErrors.length > 10) {
        console.log(\`   ... and \${validationErrors.length - 10} more errors\`);
      }
    }
  }

  /**
   * Sync translations between locales
   */
  async syncTranslations(): Promise<void> {
    console.log('🔄 Syncing translations...');
    
    const baseTranslations = await this.loadAllTranslations(this.options.baseLocale);
    
    for (const locale of this.options.supportedLocales) {
      if (locale === this.options.baseLocale) continue;
      
      for (const namespace of this.options.supportedNamespaces) {
        const baseKeys = Object.keys(baseTranslations[namespace] || {});
        const localeTranslations = await this.loadTranslations(locale, namespace);
        
        // Add missing keys
        let addedCount = 0;
        for (const key of baseKeys) {
          if (!localeTranslations[key]) {
            localeTranslations[key] = \`[TRANSLATE: \${key}]\`;
            addedCount++;
          }
        }
        
        // Save updated translations
        if (addedCount > 0) {
          await this.saveTranslations(locale, namespace, localeTranslations);
          console.log(\`   Added \${addedCount} missing keys to \${locale}/\${namespace}.json\`);
        }
      }
    }
    
    console.log('✅ Translation sync completed');
  }

  /**
   * Get translation statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    const stats = {
      totalLocales: this.options.supportedLocales.length,
      totalNamespaces: this.options.supportedNamespaces.length,
      totalKeys: 0,
      totalTranslations: 0,
      completionRate: 0,
      localeStats: {} as Record<string, any>
    };

    const baseTranslations = await this.loadAllTranslations(this.options.baseLocale);
    stats.totalKeys = Object.values(baseTranslations).reduce((sum, ns) => sum + Object.keys(ns).length, 0);

    for (const locale of this.options.supportedLocales) {
      const localeTranslations = await this.loadAllTranslations(locale);
      const translatedKeys = Object.values(localeTranslations).reduce((sum, ns) => {
        return sum + Object.entries(ns).filter(([key, value]) => 
          !this.isPlaceholderValue(value, key)
        ).length;
      }, 0);

      stats.localeStats[locale] = {
        totalKeys: stats.totalKeys,
        translatedKeys,
        completionRate: stats.totalKeys > 0 ? Math.round((translatedKeys / stats.totalKeys) * 100) : 100
      };

      stats.totalTranslations += translatedKeys;
    }

    stats.completionRate = stats.totalKeys > 0 
      ? Math.round((stats.totalTranslations / (stats.totalKeys * this.options.supportedLocales.length)) * 100)
      : 100;

    return stats;
  }

  /**
   * Load translations for a specific locale and namespace
   */
  private async loadTranslations(locale: string, namespace: string): Promise<Record<string, string>> {
    const filePath = path.join(this.options.localesPath, locale, \`\${namespace}.json\`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(\`Warning: Could not parse translations file \${filePath}\`);
      return {};
    }
  }

  /**
   * Load all translations for a locale
   */
  private async loadAllTranslations(locale: string): Promise<Record<string, Record<string, string>>> {
    const allTranslations: Record<string, Record<string, string>> = {};
    
    for (const namespace of this.options.supportedNamespaces) {
      allTranslations[namespace] = await this.loadTranslations(locale, namespace);
    }
    
    return allTranslations;
  }

  /**
   * Save translations for a specific locale and namespace
   */
  private async saveTranslations(locale: string, namespace: string, translations: Record<string, string>): Promise<void> {
    const filePath = path.join(this.options.localesPath, locale, \`\${namespace}.json\`);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
  }

  /**
   * Remove specific translation keys
   */
  private async removeTranslationKeys(locale: string, namespace: string, keys: string[]): Promise<void> {
    const translations = await this.loadTranslations(locale, namespace);
    
    for (const key of keys) {
      delete translations[key];
    }
    
    await this.saveTranslations(locale, namespace, translations);
  }

  /**
   * Check if a value is a placeholder
   */
  private isPlaceholderValue(value: string, key: string): boolean {
    const placeholderPatterns = [
      /^\[TRANSLATE:/i,
      /^\[TODO:/i,
      /^TODO:/i,
      new RegExp(\`^\${key}$\`, 'i'),
      /^\\s*$/
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Validate interpolation syntax in translation values
   */
  private validateInterpolation(value: string): string[] {
    const errors: string[] = [];
    
    // Check for unmatched braces
    const openBraces = (value.match(/\\{/g) || []).length;
    const closeBraces = (value.match(/\\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unmatched braces');
    }
    
    // Check for valid interpolation patterns
    const interpolations = value.match(/\\{\\{[^}]*\\}\\}/g) || [];
    for (const interpolation of interpolations) {
      const content = interpolation.slice(2, -2).trim();
      if (!content) {
        errors.push('Empty interpolation');
      }
    }
    
    return errors;
  }
}

/**
 * Create a translation manager instance
 */
export const createTranslationManager = (options?: Partial<TranslationManagerOptions>) => {
  return new TranslationManager(options);
};

export default TranslationManager;`;

    fs.writeFileSync(path.join(utilsDir, 'translation-manager.ts'), managerContent);
}

function createTranslationScripts(scriptsDir, appName) {
    const packageJsonContent = `{
  "scripts": {
    "i18n:extract": "node translation-scripts/extract-keys.js",
    "i18n:detect-missing": "node translation-scripts/detect-missing.js",
    "i18n:fix-missing": "node translation-scripts/fix-missing.js",
    "i18n:cleanup-unused": "node translation-scripts/cleanup-unused.js",
    "i18n:validate": "node translation-scripts/validate.js",
    "i18n:sync": "node translation-scripts/sync.js",
    "i18n:stats": "node translation-scripts/stats.js",
    "i18n:workflow": "node translation-scripts/workflow.js"
  }
}`;

    const extractKeysScript = `#!/usr/bin/env node
/**
 * Extract translation keys from source code
 */
const { createTranslationManager } = require('../utils/translation-manager');

async function extractKeys() {
  try {
    const manager = createTranslationManager();
    await manager.extractKeys();
  } catch (error) {
    console.error('Failed to extract keys:', error.message);
    process.exit(1);
  }
}

extractKeys();`;

    const detectMissingScript = `#!/usr/bin/env node
/**
 * Detect missing translations and generate report
 */
const { createTranslationManager } = require('../utils/translation-manager');

async function detectMissing() {
  try {
    const manager = createTranslationManager();
    await manager.generateReport();
  } catch (error) {
    console.error('Failed to detect missing translations:', error.message);
    process.exit(1);
  }
}

detectMissing();`;

    const fixMissingScript = `#!/usr/bin/env node
/**
 * Auto-fix missing translations
 */
const { createTranslationManager } = require('../utils/translation-manager');

async function fixMissing() {
  try {
    const strategy = process.argv[2] || 'placeholder';
    const validStrategies = ['copy-from-base', 'placeholder', 'ai-translate'];
    
    if (!validStrategies.includes(strategy)) {
      console.error(\`Invalid strategy. Use: \${validStrategies.join(', ')}\`);
      process.exit(1);
    }
    
    const manager = createTranslationManager();
    await manager.fixMissing(strategy);
  } catch (error) {
    console.error('Failed to fix missing translations:', error.message);
    process.exit(1);
  }
}

fixMissing();`;

    const workflowScript = `#!/usr/bin/env node
/**
 * Run complete translation workflow
 */
const { createTranslationManager } = require('../utils/translation-manager');

async function runWorkflow() {
  try {
    const manager = createTranslationManager();
    
    const options = {
      extractKeys: true,
      detectMissing: true,
      generateTemplates: true,
      autoFix: process.argv.includes('--auto-fix'),
      autoFixStrategy: 'placeholder',
      cleanupUnused: process.argv.includes('--cleanup'),
      validateTranslations: true
    };
    
    await manager.runWorkflow(options);
  } catch (error) {
    console.error('Translation workflow failed:', error.message);
    process.exit(1);
  }
}

runWorkflow();`;

    const statsScript = `#!/usr/bin/env node
/**
 * Display translation statistics
 */
const { createTranslationManager } = require('../utils/translation-manager');

async function showStats() {
  try {
    const manager = createTranslationManager();
    const stats = await manager.getStatistics();
    
    console.log('📊 Translation Statistics:');
    console.log(\`   Total Locales: \${stats.totalLocales}\`);
    console.log(\`   Total Keys: \${stats.totalKeys}\`);
    console.log(\`   Total Translations: \${stats.totalTranslations}\`);
    console.log(\`   Overall Completion: \${stats.completionRate}%\`);
    console.log('');
    
    console.log('🌐 Completion by Locale:');
    for (const [locale, localeStats] of Object.entries(stats.localeStats)) {
      const status = localeStats.completionRate >= 80 ? '✅' : '⚠️';
      console.log(\`   \${status} \${locale}: \${localeStats.completionRate}% (\${localeStats.translatedKeys}/\${localeStats.totalKeys})\`);
    }
    
  } catch (error) {
    console.error('Failed to get translation statistics:', error.message);
    process.exit(1);
  }
}

showStats();`;

    // Create scripts directory and files
    const translationScriptsDir = path.join(scriptsDir, 'translation-scripts');
    if (!fs.existsSync(translationScriptsDir)) {
        fs.mkdirSync(translationScriptsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(translationScriptsDir, 'extract-keys.js'), extractKeysScript);
    fs.writeFileSync(path.join(translationScriptsDir, 'detect-missing.js'), detectMissingScript);
    fs.writeFileSync(path.join(translationScriptsDir, 'fix-missing.js'), fixMissingScript);
    fs.writeFileSync(path.join(translationScriptsDir, 'workflow.js'), workflowScript);
    fs.writeFileSync(path.join(translationScriptsDir, 'stats.js'), statsScript);

    // Create package.json with scripts
    fs.writeFileSync(path.join(scriptsDir, 'i18n-package-scripts.json'), packageJsonContent);

    console.log(`📝 Translation scripts created in ${translationScriptsDir}`);
}