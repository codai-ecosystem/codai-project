'use client';

import { ChevronDown, Languages } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../components/ui/Button';
import { cn } from '../utils';
import { useI18n, type Locale } from './I18nContext';

interface LanguageOption {
    locale: Locale;
    label: string;
    flag: string;
    nativeName: string;
}

const languages: LanguageOption[] = [
    { locale: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
    { locale: 'ro', label: 'Română', flag: '🇷🇴', nativeName: 'Română' },
];

interface LanguageSwitcherProps {
    mode?: 'dropdown' | 'button';
    className?: string;
    showLabel?: boolean;
    showFlag?: boolean;
}

export function LanguageSwitcher({
    mode = 'dropdown',
    className,
    showLabel = true,
    showFlag = true,
}: LanguageSwitcherProps): JSX.Element | null {
    const { locale, setLocale, isLoading, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ensure we always have a valid language object
    const currentLanguage = languages.find(lang => lang.locale === locale) ?? languages[0];
    const safeCurrentLanguage = currentLanguage as LanguageOption;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = async (newLocale: Locale) => {
        setIsOpen(false);
        if (newLocale !== locale) {
            await setLocale(newLocale);
        }
    };

    if (mode === 'button') {
        const otherLanguage = languages.find(lang => lang.locale !== locale);
        if (!otherLanguage) return null;

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    void handleLanguageChange(otherLanguage.locale);
                }}
                disabled={isLoading}
                className={cn('flex items-center gap-2', className)}
                aria-label={`Switch to ${otherLanguage.nativeName}`}
            >
                {showFlag && <span>{otherLanguage.flag}</span>}
                {showLabel && (
                    <span className="hidden sm:inline">{otherLanguage.nativeName}</span>
                )}
            </Button>
        );
    }

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                aria-label={t ? t('layout.header.menu') : 'Language Menu'}
                className="flex items-center gap-2"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Languages className="h-4 w-4" />
                {showFlag && <span>{safeCurrentLanguage.flag}</span>}
                {showLabel && (
                    <span className="hidden sm:inline">{safeCurrentLanguage.nativeName}</span>
                )}
                <ChevronDown
                    className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </Button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-border bg-background shadow-lg">
                    <div className="py-1">
                        {languages.map(language => (
                            <button
                                key={language.locale}
                                onClick={() => {
                                    void handleLanguageChange(language.locale);
                                }}
                                disabled={isLoading}
                                className={cn(
                                    'w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                                    'disabled:cursor-not-allowed disabled:opacity-50',
                                    'flex items-center gap-3',
                                    locale === language.locale &&
                                    'bg-accent text-accent-foreground'
                                )}
                                aria-label={`Switch to ${language.nativeName}`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span>{language.nativeName}</span>
                                {locale === language.locale && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
