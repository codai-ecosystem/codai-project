'use client';

import React, { createContext, useContext, useState } from 'react';

export interface I18nContextType {
    locale: string;
    setLocale: (locale: string) => void;
    isLoading: boolean;
    t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState('en');
    const [isLoading] = useState(false);

    const t = (key: string, _params?: Record<string, string>) => {
        // Simple translation function - in real app this would use i18n library
        return key; // Return key as default translation
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, isLoading, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Alias for compatibility
export const useTranslation = useI18n;
