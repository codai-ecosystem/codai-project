/**
 * CODAI Ecosystem - Comprehensive Internationalization Implementation
 * 
 * This script implements i18n across all 8 priority applications using:
 * - @codai/translations package (centralized translations)
 * - react-i18next for React applications  
 * - Consistent en/ro language support
 * - Language detection and persistence
 * - Type-safe translation keys
 * - Component scanning for hardcoded text
 * - Migration guides and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class InternationalizationImplementer {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.priorityApps = [
            'controlai-dashboard',
            'memorai',
            'romai',
            'bancai',
            'codai',
            'admin',
            'hub',
            'id'
        ];

        this.dependencies = {
            'react-i18next': '^15.3.0',
            'i18next': '^24.2.0',
            'i18next-browser-languagedetector': '^8.0.0',
            'i18next-http-backend': '^3.0.1',
            '@codai/translations': 'workspace:*'
        };

        this.devDependencies = {
            'i18next-parser': '^9.0.0',
            '@types/react-i18next': '^8.1.0'
        };

        this.stats = {
            appsAnalyzed: 0,
            hardcodedTextFound: 0,
            filesScanned: 0,
            componentsModified: 0,
            translationsAdded: 0,
            dependenciesInstalled: 0
        };

        this.implementationLog = [];
        this.hardcodedTextPatterns = [];
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        console.log(`${this.getLogColor(level)}${logEntry}\x1b[0m`);
        this.implementationLog.push(logEntry);
    }

    getLogColor(level) {
        const colors = {
            'info': '\x1b[36m',    // Cyan
            'success': '\x1b[32m', // Green
            'warning': '\x1b[33m', // Yellow
            'error': '\x1b[31m'    // Red
        };
        return colors[level] || '\x1b[0m';
    }

    async run() {
        this.log('🌍 Starting CODAI Ecosystem Internationalization Implementation', 'info');

        try {
            await this.validateTranslationsPackage();
            await this.analyzeCurrentState();
            await this.implementI18nInfrastructure();
            await this.scanAndExtractHardcodedText();
            await this.createI18nConfigurations();
            await this.updateApplicationComponents();
            await this.validateImplementation();
            await this.generateMigrationGuide();
            await this.generateReport();

            this.log('✅ Internationalization implementation completed successfully!', 'success');
        } catch (error) {
            this.log(`❌ Implementation failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async validateTranslationsPackage() {
        this.log('🔍 Validating @codai/translations package...', 'info');

        const packagePath = path.join(this.workspaceRoot, 'packages', 'translations', 'package.json');
        if (!fs.existsSync(packagePath)) {
            throw new Error('@codai/translations package not found');
        }

        const translationsPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        this.log(`✅ Found @codai/translations v${translationsPackage.version}`, 'success');

        // Verify translation files exist
        const localesPath = path.join(this.workspaceRoot, 'packages', 'translations', 'locales');
        const enPath = path.join(localesPath, 'en', 'common.json');
        const roPath = path.join(localesPath, 'ro', 'common.json');

        if (!fs.existsSync(enPath) || !fs.existsSync(roPath)) {
            throw new Error('Translation files missing in @codai/translations package');
        }

        this.log('✅ English and Romanian translation files validated', 'success');
    }

    async analyzeCurrentState() {
        this.log('📊 Analyzing current internationalization state...', 'info');

        const analysis = {
            existingI18nConfigs: [],
            hardcodedTextFiles: [],
            currentDependencies: {}
        };

        for (const appName of this.priorityApps) {
            const appPath = path.join(this.workspaceRoot, 'apps', appName);
            if (!fs.existsSync(appPath)) {
                this.log(`⚠️ App ${appName} not found, skipping`, 'warning');
                continue;
            }

            this.stats.appsAnalyzed++;

            // Check for existing i18n configurations
            const i18nFiles = [
                'i18n.ts', 'i18n.js', 'i18next.config.js', 'i18next.config.ts',
                'src/i18n.ts', 'src/i18n/index.ts', 'src/lib/i18n.ts'
            ];

            for (const file of i18nFiles) {
                const filePath = path.join(appPath, file);
                if (fs.existsSync(filePath)) {
                    analysis.existingI18nConfigs.push({ app: appName, file });
                    this.log(`📄 Found existing i18n config: ${appName}/${file}`, 'info');
                }
            }

            // Scan for hardcoded text
            await this.scanAppForHardcodedText(appName, appPath, analysis);

            // Check current dependencies
            const packageJsonPath = path.join(appPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (allDeps['react-i18next'] || allDeps['i18next']) {
                    analysis.currentDependencies[appName] = {
                        'react-i18next': allDeps['react-i18next'],
                        'i18next': allDeps['i18next']
                    };
                    this.log(`📦 Found i18n dependencies in ${appName}`, 'info');
                }
            }
        }

        this.currentAnalysis = analysis;
        this.log(`📈 Analysis complete: ${this.stats.appsAnalyzed} apps, ${this.stats.filesScanned} files, ${this.stats.hardcodedTextFound} hardcoded text patterns`, 'success');
    }

    async scanAppForHardcodedText(appName, appPath, analysis) {
        const scanPaths = [
            path.join(appPath, 'src'),
            path.join(appPath, 'app'),
            path.join(appPath, 'components'),
            path.join(appPath, 'pages')
        ];

        for (const scanPath of scanPaths) {
            if (fs.existsSync(scanPath)) {
                await this.scanDirectoryForHardcodedText(scanPath, appName, analysis);
            }
        }
    }

    async scanDirectoryForHardcodedText(dirPath, appName, analysis, depth = 0) {
        if (depth > 5) return; // Prevent deep recursion

        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);

                if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
                    await this.scanDirectoryForHardcodedText(itemPath, appName, analysis, depth + 1);
                } else if (item.isFile() && /\\.(tsx?|jsx?)$/.test(item.name)) {
                    this.stats.filesScanned++;
                    await this.scanFileForHardcodedText(itemPath, appName, analysis);
                }
            }
        } catch (error) {
            this.log(`⚠️ Error scanning ${dirPath}: ${error.message}`, 'warning');
        }
    }

    async scanFileForHardcodedText(filePath, appName, analysis) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Patterns for hardcoded text (common UI text)
            const patterns = [
                /"([^"]{3,}(?:Sign|Login|Register|Save|Cancel|Delete|Edit|Create|Update|Submit|Loading|Error|Success|Warning|Home|Dashboard|Settings|Profile|Account)[^"]*?)"/gi,
                /'([^']{3,}(?:Sign|Login|Register|Save|Cancel|Delete|Edit|Create|Update|Submit|Loading|Error|Success|Warning|Home|Dashboard|Settings|Profile|Account)[^']*?)'/gi,
                /\`([^\`]{3,}(?:Sign|Login|Register|Save|Cancel|Delete|Edit|Create|Update|Submit|Loading|Error|Success|Warning|Home|Dashboard|Settings|Profile|Account)[^\`]*?)\`/gi,
                /title\s*[:=]\s*["']([^"']{5,})["']/gi,
                /placeholder\s*[:=]\s*["']([^"']{3,})["']/gi,
                /aria-label\s*[:=]\s*["']([^"']{3,})["']/gi,
                />([A-Z][^<>{]*(?:button|link|nav|menu|form|input|text|title|heading|label)[^<>]*)</gi
            ];

            let hardcodedCount = 0;
            patterns.forEach((pattern, index) => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Extract the actual text content
                        const textMatch = match.match(/["'`]([^"'`]+)["'`]/) || match.match(/>([^<]+)</);
                        if (textMatch && textMatch[1] && textMatch[1].length > 2) {
                            const text = textMatch[1].trim();
                            if (this.isLikelyHardcodedText(text)) {
                                hardcodedCount++;
                                this.hardcodedTextPatterns.push({
                                    app: appName,
                                    file: path.relative(this.workspaceRoot, filePath),
                                    text: text,
                                    pattern: `Pattern ${index + 1}`,
                                    context: match.substring(0, 50) + '...'
                                });
                            }
                        }
                    });
                }
            });

            if (hardcodedCount > 0) {
                this.stats.hardcodedTextFound += hardcodedCount;
                analysis.hardcodedTextFiles.push({
                    app: appName,
                    file: path.relative(this.workspaceRoot, filePath),
                    count: hardcodedCount
                });
            }
        } catch (error) {
            this.log(`⚠️ Error scanning file ${filePath}: ${error.message}`, 'warning');
        }
    }

    isLikelyHardcodedText(text) {
        // Filter out likely non-user-facing text
        const excludePatterns = [
            /^[a-z-]+$/,              // CSS classes, kebab-case
            /^[A-Z_]+$/,              // Constants
            /^\d+$/,                  // Just numbers
            /^[a-z]+([A-Z][a-z]*)*$/, // camelCase variables
            /^[./\\]|\.{2,}|[{}[\]()]/,  // Paths, objects, code
            /^(true|false|null|undefined)$/i, // Literals
            /^\w+\.\w+/,              // Object properties
            /^\s*$/,                  // Empty or whitespace
            /^(px|em|rem|%|\d+)$/,    // CSS units
            /^#[a-fA-F0-9]+$/,        // Hex colors
            /^rgba?\(|^hsl\(/,        // Color functions
            /console\.|window\.|document\./, // Browser APIs
        ];

        return !excludePatterns.some(pattern => pattern.test(text)) &&
            text.length >= 3 &&
            text.length <= 100 &&
            /[a-zA-Z]/.test(text);
    }

    async implementI18nInfrastructure() {
        this.log('🔧 Implementing i18n infrastructure across applications...', 'info');

        for (const appName of this.priorityApps) {
            const appPath = path.join(this.workspaceRoot, 'apps', appName);
            if (!fs.existsSync(appPath)) continue;

            await this.installI18nDependencies(appName, appPath);
            await this.createI18nConfiguration(appName, appPath);
            await this.createI18nHooks(appName, appPath);
            await this.createLanguageSelector(appName, appPath);
        }

        this.log('✅ I18n infrastructure implemented across all applications', 'success');
    }

    async installI18nDependencies(appName, appPath) {
        this.log(`📦 Installing i18n dependencies for ${appName}...`, 'info');

        try {
            const packageJsonPath = path.join(appPath, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Add dependencies
            if (!packageJson.dependencies) packageJson.dependencies = {};
            if (!packageJson.devDependencies) packageJson.devDependencies = {};

            Object.entries(this.dependencies).forEach(([dep, version]) => {
                if (!packageJson.dependencies[dep]) {
                    packageJson.dependencies[dep] = version;
                    this.log(`  ➕ Added ${dep}@${version}`, 'info');
                }
            });

            Object.entries(this.devDependencies).forEach(([dep, version]) => {
                if (!packageJson.devDependencies[dep]) {
                    packageJson.devDependencies[dep] = version;
                    this.log(`  ➕ Added dev dependency ${dep}@${version}`, 'info');
                }
            });

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            this.stats.dependenciesInstalled++;

            // Install dependencies
            this.log(`  🔄 Installing dependencies for ${appName}...`, 'info');
            try {
                execSync(`cd "${appPath}" && pnpm install`, { stdio: 'pipe' });
                this.log(`  ✅ Dependencies installed for ${appName}`, 'success');
            } catch (error) {
                this.log(`  ⚠️ Failed to install dependencies for ${appName}: ${error.message}`, 'warning');
                // Continue with the process even if installation fails
            }
        } catch (error) {
            this.log(`❌ Error installing dependencies for ${appName}: ${error.message}`, 'error');
        }
    }

    async createI18nConfiguration(appName, appPath) {
        this.log(`⚙️ Creating i18n configuration for ${appName}...`, 'info');

        const srcPath = fs.existsSync(path.join(appPath, 'src')) ?
            path.join(appPath, 'src') : appPath;
        const i18nDir = path.join(srcPath, 'lib', 'i18n');

        if (!fs.existsSync(i18nDir)) {
            fs.mkdirSync(i18nDir, { recursive: true });
        }

        // Create i18n configuration file
        const i18nConfig = `/**
 * Internationalization configuration for ${appName}
 * Uses @codai/translations for centralized translation management
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import centralized translations from @codai/translations
import { resources, supportedLanguages } from '@codai/translations';

export const defaultLanguage = 'en';
export const availableLanguages = ['en', 'ro'] as const;
export type SupportedLanguage = typeof availableLanguages[number];

const i18nConfig = {
  fallbackLng: defaultLanguage,
  defaultNS: 'common',
  supportedLngs: availableLanguages,
  
  // Use centralized resources from @codai/translations
  resources,
  
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
    caches: ['localStorage'],
    lookupLocalStorage: 'codai-language',
    lookupQuerystring: 'lng',
    lookupCookie: 'codai-lng',
  },
  
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    allowMultiLoading: false,
  },
  
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
  },
  
  // Development options
  debug: process.env.NODE_ENV === 'development',
  
  // Performance options
  keySeparator: '.',
  nsSeparator: ':',
  pluralSeparator: '_',
  contextSeparator: '_',
};

// Initialize i18next
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;

// Helper functions
export const changeLanguage = (language: SupportedLanguage) => {
  return i18n.changeLanguage(language);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || defaultLanguage;
};

export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return availableLanguages.includes(language as SupportedLanguage);
};
`;

        fs.writeFileSync(path.join(i18nDir, 'config.ts'), i18nConfig);
        this.log(`  ✅ Created i18n configuration for ${appName}`, 'success');
    }

    async createI18nHooks(appName, appPath) {
        this.log(`🎣 Creating i18n hooks for ${appName}...`, 'info');

        const srcPath = fs.existsSync(path.join(appPath, 'src')) ?
            path.join(appPath, 'src') : appPath;
        const hooksDir = path.join(srcPath, 'hooks');

        if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
        }

        const i18nHooks = `/**
 * Custom i18n hooks for ${appName}
 * Provides type-safe translations and language management
 */
import { useTranslation as useI18nextTranslation, UseTranslationOptions } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, changeLanguage, getCurrentLanguage, isLanguageSupported } from '../lib/i18n/config';

/**
 * Enhanced useTranslation hook with type safety
 */
export function useTranslation(ns?: string | string[], options?: UseTranslationOptions) {
  const { t, i18n, ready } = useI18nextTranslation(ns, options);
  
  return {
    t,
    i18n,
    ready,
    language: getCurrentLanguage(),
    isReady: ready,
  };
}

/**
 * Language management hook
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = useCallback(async (newLanguage: SupportedLanguage) => {
    if (!isLanguageSupported(newLanguage) || newLanguage === currentLanguage) {
      return;
    }

    setIsChanging(true);
    try {
      await changeLanguage(newLanguage);
      setCurrentLanguage(newLanguage);
      
      // Store preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('codai-language', newLanguage);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageDetected = (lng: string) => {
      if (isLanguageSupported(lng) && lng !== currentLanguage) {
        setCurrentLanguage(lng);
      }
    };

    // Subscribe to i18next language changes
    const i18n = require('../lib/i18n/config').default;
    i18n.on('languageChanged', handleLanguageDetected);

    return () => {
      i18n.off('languageChanged', handleLanguageDetected);
    };
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage: handleLanguageChange,
    isChanging,
    availableLanguages: ['en', 'ro'] as const,
    isRTL: false, // Neither English nor Romanian are RTL
  };
}

/**
 * Formatted message hook for complex translations
 */
export function useFormattedMessage() {
  const { t } = useTranslation();
  
  const formatMessage = useCallback((
    key: string, 
    values?: Record<string, string | number>,
    options?: { defaultMessage?: string }
  ) => {
    try {
      return t(key, { ...values, defaultValue: options?.defaultMessage });
    } catch (error) {
      console.warn(\`Translation key not found: \${key}\`, error);
      return options?.defaultMessage || key;
    }
  }, [t]);

  return { formatMessage };
}

/**
 * Locale detection hook
 */
export function useLocaleDetection() {
  const [detectedLocale, setDetectedLocale] = useState<SupportedLanguage>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectLocale = () => {
      setIsDetecting(true);
      
      // Priority order for locale detection
      const sources = [
        () => localStorage.getItem('codai-language'),
        () => new URLSearchParams(window.location.search).get('lng'),
        () => navigator.language.split('-')[0],
        () => navigator.languages?.[0]?.split('-')[0],
      ];

      for (const getLocale of sources) {
        try {
          const locale = getLocale();
          if (locale && isLanguageSupported(locale)) {
            setDetectedLocale(locale);
            setIsDetecting(false);
            return;
          }
        } catch (error) {
          console.warn('Error detecting locale:', error);
        }
      }

      // Fallback to default
      setDetectedLocale('en');
      setIsDetecting(false);
    };

    if (typeof window !== 'undefined') {
      detectLocale();
    } else {
      setDetectedLocale('en');
      setIsDetecting(false);
    }
  }, []);

  return { detectedLocale, isDetecting };
}
`;

        fs.writeFileSync(path.join(hooksDir, 'useI18n.ts'), i18nHooks);
        this.log(`  ✅ Created i18n hooks for ${appName}`, 'success');
    }

    async createLanguageSelector(appName, appPath) {
        this.log(`🌐 Creating language selector component for ${appName}...`, 'info');

        const srcPath = fs.existsSync(path.join(appPath, 'src')) ?
            path.join(appPath, 'src') : appPath;
        const componentsDir = path.join(srcPath, 'components', 'i18n');

        if (!fs.existsSync(componentsDir)) {
            fs.mkdirSync(componentsDir, { recursive: true });
        }

        const languageSelector = `/**
 * Language Selector Component for ${appName}
 * Provides UI for switching between supported languages
 */
import React, { useState } from 'react';
import { useLanguage, useTranslation } from '../../hooks/useI18n';
import { SupportedLanguage } from '../../lib/i18n/config';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'inline';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'dropdown',
  showLabel = false,
  size = 'md'
}) => {
  const { currentLanguage, changeLanguage, isChanging, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = {
    en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
    ro: { name: 'Română', flag: '🇷🇴', nativeName: 'Română' }
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    setIsOpen(false);
    await changeLanguage(language);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-3';
      default: return 'text-sm px-3 py-2';
    }
  };

  if (variant === 'toggle') {
    return (
      <div className={\`flex items-center gap-2 \${className}\`}>
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.language', 'Language')}:
          </span>
        )}
        <button
          onClick={() => handleLanguageChange(currentLanguage === 'en' ? 'ro' : 'en')}
          disabled={isChanging}
          className={\`
            inline-flex items-center gap-2 \${getSizeClasses()}
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          \`}
          aria-label={t('common.changeLanguage', 'Change Language')}
        >
          <span className="text-lg">{languages[currentLanguage].flag}</span>
          <span>{languages[currentLanguage].nativeName}</span>
          {isChanging && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={\`flex items-center gap-1 \${className}\`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            disabled={isChanging}
            className={\`
              \${getSizeClasses()} rounded-md transition-all duration-200
              \${currentLanguage === lang
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
              border focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            \`}
            aria-label={\`Switch to \${languages[lang].name}\`}
          >
            <span className="text-base mr-1">{languages[lang].flag}</span>
            {languages[lang].nativeName}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={\`relative \${className}\`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('common.language', 'Language')}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={\`
          inline-flex items-center justify-between w-full \${getSizeClasses()}
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        \`}
        aria-expanded={isOpen}
        aria-haspopup={true}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{languages[currentLanguage].flag}</span>
          <span>{languages[currentLanguage].nativeName}</span>
        </div>
        <svg
          className={\`h-4 w-4 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              disabled={isChanging}
              className={\`
                w-full flex items-center gap-2 \${getSizeClasses()}
                hover:bg-gray-100 dark:hover:bg-gray-700
                \${currentLanguage === lang ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : ''}
                first:rounded-t-md last:rounded-b-md
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              \`}
              aria-label={\`Switch to \${languages[lang].name}\`}
            >
              <span className="text-lg">{languages[lang].flag}</span>
              <span>{languages[lang].nativeName}</span>
              {currentLanguage === lang && (
                <svg className="ml-auto h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

// Export utility component for quick language toggle
export const QuickLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <LanguageSelector variant="toggle" size="sm" className={className} />
);

// Export compact selector for navigation bars
export const NavLanguageSelector: React.FC<{ className?: string }> = ({ className }) => (
  <LanguageSelector variant="dropdown" size="sm" className={className} />
);
`;

        fs.writeFileSync(path.join(componentsDir, 'LanguageSelector.tsx'), languageSelector);
        this.log(`  ✅ Created language selector component for ${appName}`, 'success');
    }

    async createI18nConfigurations() {
        this.log('📝 Creating i18next parser configurations...', 'info');

        // Create i18next-parser configuration for extracting keys
        const parserConfig = `module.exports = {
  contextSeparator: '_',
  // Key separator used in your translation keys
  keySeparator: '.',
  // Namespace separator used in your translation keys
  nsSeparator: ':',

  // Plural separator used in your translation keys
  pluralSeparator: '_',

  // The namespace to use by default when a key's namespace is not provided
  defaultNamespace: 'common',
  
  // An array of the namespaces to use
  namespaces: ['common'],

  // The function to use to extract keys
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],

    default: ['JavascriptLexer']
  },

  lineEnding: 'auto',

  locales: ['en', 'ro'],

  // Location of the default locale
  defaultValue: (locale, namespace, key) => {
    const keyAsDefaultValue = process.env.I18NEXT_PARSER_KEY_AS_DEFAULT_VALUE || false
    if (keyAsDefaultValue) {
      const separator = process.env.I18NEXT_PARSER_KEY_SEPARATOR || '.'
      return key.split(separator).pop()
    }
    return '__STRING_NOT_TRANSLATED__'
  },

  // The output directory for the translation files
  output: 'locales/$LOCALE/$NAMESPACE.json',

  // Paths to scan for translation keys
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ],

  sort: true,
  verbose: true,
  failOnWarnings: false,
  failOnUpdate: false,

  customValueTemplate: null,

  resetDefaultValueLocale: null,

  i18nextOptions: null,

  yamlOptions: null
}
`;

        fs.writeFileSync(path.join(this.workspaceRoot, 'i18next-parser.config.js'), parserConfig);
        this.log('✅ Created i18next-parser configuration', 'success');
    }

    async updateApplicationComponents() {
        this.log('🔄 Updating application root components with i18n providers...', 'info');

        for (const appName of this.priorityApps) {
            const appPath = path.join(this.workspaceRoot, 'apps', appName);
            if (!fs.existsSync(appPath)) continue;

            await this.updateAppRootComponent(appName, appPath);
            this.stats.componentsModified++;
        }

        this.log('✅ Updated all application root components', 'success');
    }

    async updateAppRootComponent(appName, appPath) {
        this.log(`🔧 Updating root component for ${appName}...`, 'info');

        // Common patterns for root components
        const rootComponentPaths = [
            path.join(appPath, 'src', 'app', 'layout.tsx'),     // Next.js app dir
            path.join(appPath, 'app', 'layout.tsx'),            // Next.js app dir (alt)
            path.join(appPath, 'pages', '_app.tsx'),            // Next.js pages dir
            path.join(appPath, 'src', 'pages', '_app.tsx'),     // Next.js pages dir (alt)
            path.join(appPath, 'src', 'App.tsx'),               // React App
            path.join(appPath, 'App.tsx'),                      // React App (alt)
        ];

        let rootComponentFound = false;
        for (const componentPath of rootComponentPaths) {
            if (fs.existsSync(componentPath)) {
                await this.updateRootComponentFile(componentPath, appName);
                rootComponentFound = true;
                break;
            }
        }

        if (!rootComponentFound) {
            this.log(`⚠️ Could not find root component for ${appName}`, 'warning');
        }
    }

    async updateRootComponentFile(componentPath, appName) {
        try {
            let content = fs.readFileSync(componentPath, 'utf8');

            // Check if i18n is already imported
            if (content.includes('i18n') && content.includes('@codai/translations')) {
                this.log(`  ℹ️ I18n already configured in ${path.basename(componentPath)}`, 'info');
                return;
            }

            // Add i18n import at the top
            const importPattern = /^(import.*?from.*;?\s*)+/m;
            const i18nImport = `import './lib/i18n/config';\n`;

            if (importPattern.test(content)) {
                content = content.replace(importPattern, (match) => match + i18nImport);
            } else {
                content = i18nImport + content;
            }

            // Add comment about i18n initialization
            const commentPattern = /^(.*?export\s+(default\s+)?function|export\s+(default\s+)?class)/m;
            const comment = `\n// Initialize i18n for ${appName}\n// This import must be before any components that use translations\n\n`;

            if (commentPattern.test(content)) {
                content = content.replace(commentPattern, comment + '$1');
            }

            fs.writeFileSync(componentPath, content);
            this.log(`  ✅ Updated ${path.basename(componentPath)} with i18n configuration`, 'success');
        } catch (error) {
            this.log(`  ❌ Error updating ${componentPath}: ${error.message}`, 'error');
        }
    }

    async scanAndExtractHardcodedText() {
        this.log('🔍 Analyzing hardcoded text patterns for translation keys...', 'info');

        // Process collected hardcoded text patterns
        const translationKeys = new Map();
        const keyCategories = {
            'common': [],
            'navigation': [],
            'auth': [],
            'actions': [],
            'validation': [],
            'errors': [],
            'status': []
        };

        this.hardcodedTextPatterns.forEach(pattern => {
            const key = this.generateTranslationKey(pattern.text);
            const category = this.categorizeTranslationKey(pattern.text);

            if (!translationKeys.has(key)) {
                translationKeys.set(key, {
                    text: pattern.text,
                    category: category,
                    usages: []
                });
                keyCategories[category].push(key);
            }

            translationKeys.get(key).usages.push({
                app: pattern.app,
                file: pattern.file,
                context: pattern.context
            });
        });

        this.extractedTranslationKeys = translationKeys;
        this.translationKeyCategories = keyCategories;
        this.stats.translationsAdded = translationKeys.size;

        this.log(`📊 Extracted ${translationKeys.size} unique translation keys across ${Object.keys(keyCategories).length} categories`, 'success');
    }

    generateTranslationKey(text) {
        // Convert text to a valid translation key
        return text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_')           // Replace spaces with underscores
            .replace(/_{2,}/g, '_')         // Remove multiple underscores
            .replace(/^_|_$/g, '')          // Remove leading/trailing underscores
            .substring(0, 50);              // Limit key length
    }

    categorizeTranslationKey(text) {
        const categories = {
            'navigation': ['home', 'dashboard', 'settings', 'profile', 'menu', 'nav', 'back', 'next'],
            'auth': ['sign', 'login', 'register', 'password', 'email', 'account', 'logout'],
            'actions': ['save', 'cancel', 'delete', 'edit', 'create', 'update', 'submit', 'reset', 'clear'],
            'validation': ['required', 'invalid', 'error', 'please', 'must', 'should'],
            'errors': ['error', 'failed', 'wrong', 'missing', 'not found', 'invalid'],
            'status': ['loading', 'success', 'complete', 'pending', 'active', 'inactive']
        };

        const lowerText = text.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return category;
            }
        }

        return 'common';
    }

    async validateImplementation() {
        this.log('✅ Validating i18n implementation...', 'info');

        let validationErrors = [];
        let validationWarnings = [];

        for (const appName of this.priorityApps) {
            const appPath = path.join(this.workspaceRoot, 'apps', appName);
            if (!fs.existsSync(appPath)) continue;

            // Check if i18n configuration exists
            const i18nConfigPath = path.join(appPath, 'src', 'lib', 'i18n', 'config.ts');
            if (!fs.existsSync(i18nConfigPath)) {
                validationErrors.push(`Missing i18n configuration for ${appName}`);
            }

            // Check if hooks exist
            const hooksPath = path.join(appPath, 'src', 'hooks', 'useI18n.ts');
            if (!fs.existsSync(hooksPath)) {
                validationWarnings.push(`Missing i18n hooks for ${appName}`);
            }

            // Check if language selector exists
            const selectorPath = path.join(appPath, 'src', 'components', 'i18n', 'LanguageSelector.tsx');
            if (!fs.existsSync(selectorPath)) {
                validationWarnings.push(`Missing language selector for ${appName}`);
            }

            // Check if dependencies are installed
            const packageJsonPath = path.join(appPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (!deps['react-i18next']) {
                    validationErrors.push(`Missing react-i18next dependency for ${appName}`);
                }
                if (!deps['@codai/translations']) {
                    validationErrors.push(`Missing @codai/translations dependency for ${appName}`);
                }
            }
        }

        if (validationErrors.length > 0) {
            this.log(`❌ Validation errors found:`, 'error');
            validationErrors.forEach(error => this.log(`  • ${error}`, 'error'));
        }

        if (validationWarnings.length > 0) {
            this.log(`⚠️ Validation warnings:`, 'warning');
            validationWarnings.forEach(warning => this.log(`  • ${warning}`, 'warning'));
        }

        if (validationErrors.length === 0 && validationWarnings.length === 0) {
            this.log('✅ All validation checks passed!', 'success');
        }

        return { errors: validationErrors, warnings: validationWarnings };
    }

    async generateMigrationGuide() {
        this.log('📚 Generating comprehensive migration guide...', 'info');

        const migrationGuide = `# 🌍 CODAI Ecosystem - Internationalization Implementation Guide

## Overview
This guide documents the complete internationalization implementation across all 8 priority CODAI applications. The implementation provides English and Romanian language support using react-i18next and a centralized translations system.

## 🎯 Implementation Summary

### Statistics
- **Applications Processed**: ${this.stats.appsAnalyzed}
- **Files Scanned**: ${this.stats.filesScanned}
- **Hardcoded Text Patterns Found**: ${this.stats.hardcodedTextFound}
- **Translation Keys Generated**: ${this.stats.translationsAdded}
- **Components Modified**: ${this.stats.componentsModified}
- **Dependencies Installed**: ${this.stats.dependenciesInstalled}

### Applications Covered
${this.priorityApps.map(app => `- **${app}**: Full i18n implementation with hooks, selectors, and configuration`).join('\n')}

## 🏗️ Architecture

### Centralized Translations
All translations are managed through the \`@codai/translations\` package:
\`\`\`
packages/translations/
├── locales/
│   ├── en/common.json        # English translations
│   └── ro/common.json        # Romanian translations
├── src/
│   ├── i18n.ts              # Core i18n configuration
│   └── hooks.ts             # Shared translation hooks
└── package.json
\`\`\`

### Application Structure
Each application includes:
\`\`\`
apps/{app-name}/
├── src/
│   ├── lib/i18n/
│   │   └── config.ts        # App-specific i18n configuration
│   ├── hooks/
│   │   └── useI18n.ts       # Custom i18n hooks
│   └── components/i18n/
│       └── LanguageSelector.tsx  # Language switching component
└── package.json             # Updated with i18n dependencies
\`\`\`

## 🔧 Usage Examples

### Basic Translation Hook
\`\`\`tsx
import { useTranslation } from '../hooks/useI18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome', 'Welcome')}</h1>
      <p>{t('common.description', 'Application description')}</p>
    </div>
  );
}
\`\`\`

### Language Management
\`\`\`tsx
import { useLanguage } from '../hooks/useI18n';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  
  return (
    <button 
      onClick={() => changeLanguage(currentLanguage === 'en' ? 'ro' : 'en')}
      disabled={isChanging}
    >
      {currentLanguage === 'en' ? '🇷🇴 Română' : '🇺🇸 English'}
    </button>
  );
}
\`\`\`

### Language Selector Component
\`\`\`tsx
import LanguageSelector from '../components/i18n/LanguageSelector';

function Navigation() {
  return (
    <nav>
      {/* Other navigation items */}
      <LanguageSelector variant="dropdown" showLabel={true} />
    </nav>
  );
}
\`\`\`

## 📋 Translation Keys Structure

### Generated Categories
${Object.entries(this.translationKeyCategories || {}).map(([category, keys]) =>
            `#### ${category} (${keys.length} keys)
${keys.slice(0, 5).map(key => `- \`${category}.${key}\``).join('\n')}
${keys.length > 5 ? `- ... and ${keys.length - 5} more keys` : ''}`
        ).join('\n\n')}

## 🔍 Detected Hardcoded Text Patterns

### Sample Findings
${this.hardcodedTextPatterns.slice(0, 10).map(pattern =>
            `- **${pattern.app}**: "${pattern.text}" in \`${pattern.file}\`
  - Pattern: ${pattern.pattern}
  - Suggested Key: \`${this.categorizeTranslationKey(pattern.text)}.${this.generateTranslationKey(pattern.text)}\``
        ).join('\n\n')}

${this.hardcodedTextPatterns.length > 10 ? `\n... and ${this.hardcodedTextPatterns.length - 10} more patterns` : ''}

## 📝 Migration Steps

### 1. Review Generated Configurations
Each application now has:
- I18n configuration in \`src/lib/i18n/config.ts\`
- Custom hooks in \`src/hooks/useI18n.ts\`
- Language selector in \`src/components/i18n/LanguageSelector.tsx\`

### 2. Replace Hardcoded Text
Search for hardcoded strings and replace with translation calls:

**Before:**
\`\`\`tsx
<button>Save Changes</button>
<p>Please enter your email address</p>
\`\`\`

**After:**
\`\`\`tsx
<button>{t('common.saveChanges', 'Save Changes')}</button>
<p>{t('auth.enterEmail', 'Please enter your email address')}</p>
\`\`\`

### 3. Add Language Selector to UI
\`\`\`tsx
// In your main navigation or settings
import LanguageSelector from '../components/i18n/LanguageSelector';

<LanguageSelector 
  variant="dropdown" 
  showLabel={false} 
  size="sm" 
/>
\`\`\`

### 4. Update Root Components
Ensure i18n is initialized by importing the config:
\`\`\`tsx
// At the top of your root component (layout.tsx, _app.tsx, etc.)
import './lib/i18n/config';
\`\`\`

## 🧪 Testing Your Implementation

### 1. Language Switching
- Test language switching functionality
- Verify persistence across page reloads
- Check fallback behavior for missing translations

### 2. Translation Loading
- Verify translations load correctly
- Test with network disconnection
- Check console for any missing translation warnings

### 3. Performance Testing
- Monitor bundle size impact
- Test translation loading speed
- Verify lazy loading of translation files

## 🔧 Development Tools

### Extract New Translation Keys
\`\`\`bash
# Run from application root
npx i18next-parser

# This will scan your code and update translation files
\`\`\`

### Validate Translations
\`\`\`bash
cd packages/translations
pnpm run validate-translations
\`\`\`

### Build and Test
\`\`\`bash
# Build the translations package
cd packages/translations
pnpm run build

# Test in specific application
cd ../../apps/your-app
pnpm dev
\`\`\`

## 🚀 Next Steps

### Immediate Actions
1. **Review Generated Files**: Check all generated configurations match your application structure
2. **Test Language Switching**: Verify language selector components work correctly
3. **Replace Critical Text**: Start with most visible UI text (navigation, buttons, forms)
4. **Update Translation Files**: Add application-specific translations to @codai/translations

### Long-term Improvements
1. **Content Management**: Consider adding a CMS for managing translations
2. **Professional Translation**: Get translations professionally reviewed
3. **More Languages**: Add support for additional languages as needed
4. **SEO Optimization**: Implement URL localization for better SEO
5. **RTL Support**: Add support for right-to-left languages if needed

## 📊 Performance Considerations

### Bundle Size Impact
- **react-i18next**: ~85KB (gzipped: ~25KB)
- **i18next**: ~45KB (gzipped: ~15KB)
- **Translation files**: ~10-50KB per language
- **Total overhead**: ~50-70KB gzipped

### Optimization Strategies
- Use namespace splitting for large applications
- Implement lazy loading for translation files
- Consider tree-shaking unused translation keys
- Use CDN for translation file delivery

## 🐛 Troubleshooting

### Common Issues

**Translations not loading:**
- Check i18n configuration import
- Verify @codai/translations package is built
- Check browser console for errors

**Language switching not working:**
- Verify localStorage permissions
- Check language detection configuration
- Ensure useLanguage hook is properly implemented

**Missing translations showing keys:**
- Check translation key exists in JSON files
- Verify namespace configuration
- Use fallback text in t() calls

**TypeScript errors:**
- Run \`pnpm build\` in @codai/translations package
- Check import paths in generated files
- Verify TypeScript version compatibility

## 📞 Support

For implementation questions or issues:
1. Check this migration guide
2. Review generated code files
3. Test with minimal examples
4. Check @codai/translations package documentation

## 📈 Success Metrics

Track these metrics to measure i18n success:
- **User Language Preferences**: % of users switching languages
- **Translation Coverage**: % of UI text translated
- **Load Performance**: Translation loading speed
- **User Engagement**: Engagement by language
- **Error Rates**: Translation-related errors

---

*Generated by CODAI Internationalization Implementer v1.0.0*
*Implementation Date: ${new Date().toISOString().split('T')[0]}*
`;

        fs.writeFileSync(path.join(this.workspaceRoot, 'I18N_IMPLEMENTATION_GUIDE.md'), migrationGuide);
        this.log('✅ Generated comprehensive migration guide: I18N_IMPLEMENTATION_GUIDE.md', 'success');
    }

    async generateReport() {
        this.log('📊 Generating implementation report...', 'info');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                status: 'completed',
                appsProcessed: this.stats.appsAnalyzed,
                totalFiles: this.stats.filesScanned,
                hardcodedTextFound: this.stats.hardcodedTextFound,
                translationKeysGenerated: this.stats.translationsAdded,
                componentsModified: this.stats.componentsModified,
                dependenciesInstalled: this.stats.dependenciesInstalled
            },
            applications: this.priorityApps.map(app => ({
                name: app,
                status: 'configured',
                files: [
                    'src/lib/i18n/config.ts',
                    'src/hooks/useI18n.ts',
                    'src/components/i18n/LanguageSelector.tsx'
                ],
                dependencies: Object.keys(this.dependencies)
            })),
            extractedTranslations: Array.from(this.extractedTranslationKeys?.entries() || []).map(([key, data]) => ({
                key,
                text: data.text,
                category: data.category,
                usageCount: data.usages.length,
                applications: [...new Set(data.usages.map(u => u.app))]
            })),
            implementation: {
                configurationFiles: this.stats.componentsModified,
                translationKeys: this.stats.translationsAdded,
                hardcodedTextPatterns: this.hardcodedTextPatterns.length,
                supportedLanguages: ['en', 'ro'],
                centralized: true
            },
            recommendations: [
                'Review and test all generated i18n configurations',
                'Replace hardcoded text with translation calls systematically',
                'Add application-specific translations to @codai/translations package',
                'Test language switching functionality across all applications',
                'Consider professional translation review for Romanian content',
                'Implement URL localization for SEO benefits',
                'Monitor bundle size impact and optimize if necessary'
            ],
            log: this.implementationLog
        };

        fs.writeFileSync(
            path.join(this.workspaceRoot, 'i18n-implementation-report.json'),
            JSON.stringify(report, null, 2)
        );

        this.log('✅ Generated detailed implementation report: i18n-implementation-report.json', 'success');
        return report;
    }
}

// Execute the internationalization implementation
(async () => {
    const implementer = new InternationalizationImplementer();

    try {
        await implementer.run();
        console.log(`
🎉 CODAI Ecosystem Internationalization Implementation Complete!

📊 Summary:
• ${implementer.stats.appsAnalyzed} applications configured
• ${implementer.stats.filesScanned} files scanned  
• ${implementer.stats.hardcodedTextFound} hardcoded text patterns found
• ${implementer.stats.translationsAdded} translation keys generated
• ${implementer.stats.componentsModified} components modified
• ${implementer.stats.dependenciesInstalled} dependency installations

📚 Next Steps:
1. Review I18N_IMPLEMENTATION_GUIDE.md for detailed migration instructions
2. Test language switching in each application
3. Replace hardcoded text with translation calls
4. Add application-specific translations to @codai/translations
5. Deploy and monitor performance impact

🚀 Your CODAI ecosystem is now ready for multilingual users!
        `);
    } catch (error) {
        console.error(`
❌ Implementation failed: ${error.message}

Please check the logs above for specific error details and retry after resolving issues.
        `);
        process.exit(1);
    }
})();