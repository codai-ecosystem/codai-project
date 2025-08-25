/**
 * Language Selector Component for controlai-dashboard
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
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.language', 'Language')}:
          </span>
        )}
        <button
          onClick={() => handleLanguageChange(currentLanguage === 'en' ? 'ro' : 'en')}
          disabled={isChanging}
          className={`
            inline-flex items-center gap-2 ${getSizeClasses()}
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
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
      <div className={`flex items-center gap-1 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            disabled={isChanging}
            className={`
              ${getSizeClasses()} rounded-md transition-all duration-200
              ${currentLanguage === lang
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
              border focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Switch to ${languages[lang].name}`}
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
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('common.language', 'Language')}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          inline-flex items-center justify-between w-full ${getSizeClasses()}
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `}
        aria-expanded={isOpen}
        aria-haspopup={true}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{languages[currentLanguage].flag}</span>
          <span>{languages[currentLanguage].nativeName}</span>
        </div>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              className={`
                w-full flex items-center gap-2 ${getSizeClasses()}
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${currentLanguage === lang ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : ''}
                first:rounded-t-md last:rounded-b-md
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={`Switch to ${languages[lang].name}`}
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
