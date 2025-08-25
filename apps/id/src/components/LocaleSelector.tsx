/**
 * @fileoverview Locale Selector Component
 * @description Language switching component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_LOCALES } from '../../../../i18n/shared-config';
import { useI18n } from './I18nProvider';

interface LocaleSelectorProps {
  className?: string;
  showLabel?: boolean;
  showFlag?: boolean;
  variant?: 'dropdown' | 'inline' | 'modal';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  className = '',
  showLabel = true,
  showFlag = true,
  variant = 'dropdown',
  placement = 'bottom'
}) => {
  const { t } = useTranslation('common');
  const { currentLocale, supportedLocales, changeLanguage, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (locale: string) => {
    setIsOpen(false);
    await changeLanguage(locale);
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top': return 'bottom-full mb-2';
      case 'left': return 'right-full mr-2';
      case 'right': return 'left-full ml-2';
      default: return 'top-full mt-2';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {Object.entries(supportedLocales).map(([code, locale]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            disabled={isLoading}
            className={`
              flex items-center space-x-2 px-3 py-1 rounded-md text-sm
              transition-colors duration-200
              ${currentLocale.code === code
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {showFlag && <span className="text-lg">{locale.flag}</span>}
            {showLabel && <span>{locale.nativeName}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            bg-white border border-gray-300 shadow-sm
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        >
          {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
          <GlobeAltIcon className="w-4 h-4" />
          {showLabel && <span>{currentLocale.nativeName}</span>}
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('language')}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(supportedLocales).map(([code, locale]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      text-left w-full transition-colors duration-200
                      ${currentLocale.code === code
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    <span className="text-2xl">{locale.flag}</span>
                    <div>
                      <div className="font-medium">{locale.nativeName}</div>
                      <div className="text-sm text-gray-500">{locale.name}</div>
                    </div>
                    {currentLocale.code === code && (
                      <div className="ml-auto">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-white border border-gray-300 shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
        {showLabel && <span className="text-sm font-medium">{currentLocale.nativeName}</span>}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`
            absolute ${getPlacementClasses()} left-0 z-20
            bg-white rounded-lg shadow-lg border border-gray-200
            min-w-max max-h-64 overflow-y-auto
          `}>
            {Object.entries(supportedLocales).map(([code, locale]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`
                  flex items-center space-x-3 px-4 py-2 text-left w-full
                  hover:bg-gray-50 transition-colors duration-200
                  first:rounded-t-lg last:rounded-b-lg
                  ${currentLocale.code === code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <span className="text-lg">{locale.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{locale.nativeName}</div>
                  <div className="text-xs text-gray-500">{locale.name}</div>
                </div>
                {currentLocale.code === code && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface CompactLocaleSelectorProps {
  className?: string;
}

export const CompactLocaleSelector: React.FC<CompactLocaleSelectorProps> = ({
  className = ''
}) => {
  return (
    <LocaleSelector
      className={className}
      showLabel={false}
      showFlag={true}
      variant="dropdown"
    />
  );
};

interface LocaleSelectorListProps {
  className?: string;
  onLanguageChange?: (locale: string) => void;
}

export const LocaleSelectorList: React.FC<LocaleSelectorListProps> = ({
  className = '',
  onLanguageChange
}) => {
  const { currentLocale, supportedLocales, changeLanguage } = useI18n();

  const handleLanguageChange = async (locale: string) => {
    await changeLanguage(locale);
    onLanguageChange?.(locale);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(supportedLocales).map(([code, locale]) => (
        <label
          key={code}
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
        >
          <input
            type="radio"
            name="language"
            value={code}
            checked={currentLocale.code === code}
            onChange={() => handleLanguageChange(code)}
            className="sr-only"
          />
          <div className={`
            w-4 h-4 rounded-full border-2 transition-colors duration-200
            ${currentLocale.code === code
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-300'
            }
          `}>
            {currentLocale.code === code && (
              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
            )}
          </div>
          <span className="text-2xl">{locale.flag}</span>
          <div>
            <div className="font-medium">{locale.nativeName}</div>
            <div className="text-sm text-gray-500">{locale.name}</div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default LocaleSelector;