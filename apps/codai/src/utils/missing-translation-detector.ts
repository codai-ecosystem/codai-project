/**
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
          const fullKey = `${namespace}:${key}`;
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
    console.log(`📊 Translation report generated: ${this.options.outputPath}`);
    
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
            translationValue = baseTranslations[missingKey.key] || `[TRANSLATE: ${missingKey.key}]`;
            break;

          case 'placeholder':
            translationValue = `[TRANSLATE: ${missingKey.key}]`;
            break;

          case 'ai-translate':
            // In a real implementation, this would call an AI translation service
            translationValue = await this.aiTranslate(missingKey.key, baseLocale, missingKey.locale);
            break;
        }

        await this.addTranslation(missingKey.locale, missingKey.namespace, missingKey.key, translationValue);
      } catch (error) {
        console.warn(`Could not auto-fix translation ${missingKey.namespace}:${missingKey.key} for ${missingKey.locale}:`, error.message);
      }
    }

    console.log(`✅ Auto-fixed ${missing.length} missing translations using '${strategy}' strategy`);
  }

  /**
   * Load translation file for a specific locale and namespace
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
    return [`Used in ${namespace} namespace`];
  }

  /**
   * Check if a translation value is untranslated (placeholder)
   */
  private isUntranslatedValue(value: string, key: string): boolean {
    // Check for common placeholder patterns
    const placeholderPatterns = [
      /^TRANSLATE:/i,
      /^TODO:/i,
      /^TODO:/i,
      new RegExp(`^${key}$`, 'i'), // Same as key
      /^\s*$/ // Empty or whitespace only
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
            usedKeys.add(`${keyInfo.namespace}:${keyInfo.key}`);
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
      recommendations.push(`Priority: Improve translation coverage for locales: ${lowCoverageLocales.join(', ')}`);
    }

    // Missing translations
    if (missingCount > 0) {
      recommendations.push(`Add ${missingCount} missing translations using 'npm run i18n:fix-missing' command`);
    }

    // Unused keys
    if (unusedCount > 50) {
      recommendations.push(`Clean up ${unusedCount} unused translation keys to reduce bundle size`);
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
    console.log('\n📊 Translation Summary:');
    console.log(`   Missing: ${summary.totalMissing}`);
    console.log(`   Untranslated: ${summary.totalUntranslated}`);
    console.log(`   Unused: ${summary.totalUnused}`);
    console.log(`   Average Coverage: ${summary.averageCoverage}%`);
    
    console.log('\n🌐 Coverage by Locale:');
    for (const [locale, coverage] of Object.entries(summary.localesCoverage)) {
      const status = coverage >= this.options.minCoverageThreshold ? '✅' : '⚠️';
      console.log(`   ${status} ${locale}: ${coverage}%`);
    }
    console.log('');
  }

  /**
   * Add a translation to a specific locale and namespace
   */
  private async addTranslation(locale: string, namespace: string, key: string, value: string): Promise<void> {
    const filePath = path.join(this.options.localesPath, locale, `${namespace}.json`);
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
    return `[AI_TRANSLATE: ${text}]`;
  }
}

/**
 * Create a missing translation detector instance
 */
export const createMissingTranslationDetector = (options?: Partial<DetectorOptions>) => {
  return new MissingTranslationDetector(options);
};

export default MissingTranslationDetector;