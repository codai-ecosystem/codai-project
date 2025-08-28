/**
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
        console.log('\n📝 Extracting translation keys...');
        const keys = await this.extractor.extractKeys();
        await this.extractor.saveKeys(keys);
        console.log(`   Found ${keys.length} translation keys`);
      }

      // Step 2: Generate translation templates
      if (options.generateTemplates) {
        console.log('\n📋 Generating translation templates...');
        const keys = await this.extractor.extractKeys();
        await this.extractor.generateTemplates(keys, this.options.supportedLocales);
      }

      // Step 3: Detect missing translations
      if (options.detectMissing) {
        console.log('\n🔍 Detecting missing translations...');
        await this.detector.generateMissingTranslationsReport();
      }

      // Step 4: Auto-fix missing translations
      if (options.autoFix) {
        console.log(`\n🔧 Auto-fixing missing translations using '${options.autoFixStrategy}' strategy...`);
        await this.detector.autoFixMissingTranslations(options.autoFixStrategy);
      }

      // Step 5: Cleanup unused translations
      if (options.cleanupUnused) {
        console.log('\n🧹 Cleaning up unused translations...');
        await this.cleanupUnusedTranslations();
      }

      // Step 6: Validate translations
      if (options.validateTranslations) {
        console.log('\n✅ Validating translations...');
        await this.validateTranslations();
      }

      console.log('\n🎉 Translation workflow completed successfully!');
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
    console.log(`✅ Extracted ${keys.length} translation keys`);
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
    console.log(`🔧 Auto-fixing missing translations using '${strategy}' strategy...`);
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

    console.log(`🧹 Found ${unusedKeys.length} unused translation keys`);
    
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

    console.log(`✅ Cleaned up ${unusedKeys.length} unused translation keys`);
  }

  /**
   * Validate translation files
   */
  async validateTranslations(): Promise<void> {
    const validationErrors: string[] = [];

    for (const locale of this.options.supportedLocales) {
      for (const namespace of this.options.supportedNamespaces) {
        const filePath = path.join(this.options.localesPath, locale, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          continue;
        }

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const translations = JSON.parse(content);
          
          // Validate JSON structure
          if (typeof translations !== 'object' || Array.isArray(translations)) {
            validationErrors.push(`${locale}/${namespace}.json: Invalid JSON structure (must be an object)`);
            continue;
          }

          // Validate translation values
          for (const [key, value] of Object.entries(translations)) {
            if (typeof value !== 'string') {
              validationErrors.push(`${locale}/${namespace}.json: Key '${key}' has non-string value`);
            }
            
            if (typeof value === 'string' && value.trim() === '') {
              validationErrors.push(`${locale}/${namespace}.json: Key '${key}' has empty value`);
            }

            // Check for placeholder values
            if (typeof value === 'string' && this.isPlaceholderValue(value, key)) {
              validationErrors.push(`${locale}/${namespace}.json: Key '${key}' appears to be untranslated`);
            }
          }

          // Validate interpolation syntax
          for (const [key, value] of Object.entries(translations)) {
            if (typeof value === 'string') {
              const interpolationErrors = this.validateInterpolation(value);
              if (interpolationErrors.length > 0) {
                validationErrors.push(`${locale}/${namespace}.json: Key '${key}' has interpolation errors: ${interpolationErrors.join(', ')}`);
              }
            }
          }

        } catch (error) {
          validationErrors.push(`${locale}/${namespace}.json: Invalid JSON - ${error.message}`);
        }
      }
    }

    if (validationErrors.length === 0) {
      console.log('✅ All translation files are valid');
    } else {
      console.log(`⚠️  Found ${validationErrors.length} validation errors:`);
      for (const error of validationErrors.slice(0, 10)) {
        console.log(`   • ${error}`);
      }
      if (validationErrors.length > 10) {
        console.log(`   ... and ${validationErrors.length - 10} more errors`);
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
            localeTranslations[key] = `[TRANSLATE: ${key}]`;
            addedCount++;
          }
        }
        
        // Save updated translations
        if (addedCount > 0) {
          await this.saveTranslations(locale, namespace, localeTranslations);
          console.log(`   Added ${addedCount} missing keys to ${locale}/${namespace}.json`);
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
    const filePath = path.join(this.options.localesPath, locale, `${namespace}.json`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Warning: Could not parse translations file ${filePath}`);
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
    const filePath = path.join(this.options.localesPath, locale, `${namespace}.json`);
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
      new RegExp(`^${key}$`, 'i'),
      /^\s*$/
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Validate interpolation syntax in translation values
   */
  private validateInterpolation(value: string): string[] {
    const errors: string[] = [];
    
    // Check for unmatched braces
    const openBraces = (value.match(/\{/g) || []).length;
    const closeBraces = (value.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unmatched braces');
    }
    
    // Check for valid interpolation patterns
    const interpolations = value.match(/\{\{[^}]*\}\}/g) || [];
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

export default TranslationManager;