/**
 * @fileoverview Locale Exports
 * @author Cautai Team
 * @version 1.0.0
 */

export { enTranslations, enConfig } from './en';
export { roTranslations, roConfig } from './ro';

import { enTranslations, enConfig } from './en';
import { roTranslations, roConfig } from './ro';
import type { Language, TranslationKeys, LanguageConfig } from '../types';

export const translations: Record<Language, TranslationKeys> = {
  en: enTranslations,
  ro: roTranslations
};

export const languageConfigs: Record<Language, LanguageConfig> = {
  en: enConfig,
  ro: roConfig
};

export const supportedLanguages: Language[] = ['en', 'ro'];
export const defaultLanguage: Language = 'en';
export const fallbackLanguage: Language = 'en';