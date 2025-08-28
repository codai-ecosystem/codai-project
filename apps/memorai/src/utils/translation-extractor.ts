/**
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
        /t\(\s*['"`]([^'"`]+)['"`]/g,
        // t('namespace:key') or t("namespace:key")
        /t\(\s*['"`]([^'"`]+:[^'"`]+)['"`]/g,
        // useTranslation hook with namespace
        /useTranslation\(\s*['"`]([^'"`]+)['"`]/g,
        // Trans component with i18nKey
        /i18nKey=['"`]([^'"`]+)['"`]/g,
        // Translation function with options
        /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}/g
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
        console.warn(`Warning: Could not extract keys from ${file}:`, (error as Error).message);
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
    const lines = content.split('\n');

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
    const lines = beforeMatch.split('\n');
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
    const defaultMatch = afterMatch.match(/defaultValue\s*:\s*['"`]([^'"`]+)['"`]/);
    
    if (defaultMatch) {
      return defaultMatch[1];
    }

    // Look for fallback value in Trans component
    const fallbackMatch = afterMatch.match(/defaults=['"`]([^'"`]+)['"`]/);
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
      const identifier = `${key.namespace}:${key.key}`;
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
    console.log(`✅ Extracted ${keys.length} translation keys to ${this.options.outputPath}`);
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
        const templatePath = path.join('locales', locale, `${namespace}.json`);
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
            console.warn(`Warning: Could not parse existing translations for ${templatePath}`);
          }
        }

        // Create template with existing translations and new keys
        const template: Record<string, string> = { ...existingTranslations };
        
        for (const key of namespaceKeys) {
          if (!template[key.key]) {
            template[key.key] = key.defaultValue || `[TRANSLATE: ${key.key}]`;
          }
        }

        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
      }
    }
    
    console.log(`✅ Generated translation templates for ${locales.length} locales`);
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

export default TranslationExtractor;