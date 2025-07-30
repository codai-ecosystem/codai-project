'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, type JSX } from 'react';

type Locale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

// Mock translations
const translations: Record<Locale, Record<string, string>> = {
    en: {
        'welcome': 'Welcome',
        'login': 'Login',
        'logout': 'Logout',
        'email': 'Email',
        'password': 'Password',
        'register': 'Register',
        'profile': 'Profile',
        'settings': 'Settings',
        'save': 'Save',
        'cancel': 'Cancel',
        'loading': 'Loading...',
        'error': 'An error occurred',
        'success': 'Success',
    },
    es: {
        'welcome': 'Bienvenido',
        'login': 'Iniciar sesión',
        'logout': 'Cerrar sesión',
        'email': 'Correo electrónico',
        'password': 'Contraseña',
        'register': 'Registrarse',
        'profile': 'Perfil',
        'settings': 'Configuración',
        'save': 'Guardar',
        'cancel': 'Cancelar',
        'loading': 'Cargando...',
        'error': 'Ocurrió un error',
        'success': 'Éxito',
    },
    fr: {
        'welcome': 'Bienvenue',
        'login': 'Connexion',
        'logout': 'Déconnexion',
        'email': 'Email',
        'password': 'Mot de passe',
        'register': 'S\'inscrire',
        'profile': 'Profil',
        'settings': 'Paramètres',
        'save': 'Enregistrer',
        'cancel': 'Annuler',
        'loading': 'Chargement...',
        'error': 'Une erreur s\'est produite',
        'success': 'Succès',
    },
    de: {
        'welcome': 'Willkommen',
        'login': 'Anmelden',
        'logout': 'Abmelden',
        'email': 'E-Mail',
        'password': 'Passwort',
        'register': 'Registrieren',
        'profile': 'Profil',
        'settings': 'Einstellungen',
        'save': 'Speichern',
        'cancel': 'Abbrechen',
        'loading': 'Laden...',
        'error': 'Ein Fehler ist aufgetreten',
        'success': 'Erfolg',
    },
    it: {
        'welcome': 'Benvenuto',
        'login': 'Accedi',
        'logout': 'Esci',
        'email': 'Email',
        'password': 'Password',
        'register': 'Registrati',
        'profile': 'Profilo',
        'settings': 'Impostazioni',
        'save': 'Salva',
        'cancel': 'Annulla',
        'loading': 'Caricamento...',
        'error': 'Si è verificato un errore',
        'success': 'Successo',
    },
    pt: {
        'welcome': 'Bem-vindo',
        'login': 'Entrar',
        'logout': 'Sair',
        'email': 'Email',
        'password': 'Senha',
        'register': 'Registrar',
        'profile': 'Perfil',
        'settings': 'Configurações',
        'save': 'Salvar',
        'cancel': 'Cancelar',
        'loading': 'Carregando...',
        'error': 'Ocorreu um erro',
        'success': 'Sucesso',
    },
    ja: {
        'welcome': 'ようこそ',
        'login': 'ログイン',
        'logout': 'ログアウト',
        'email': 'メール',
        'password': 'パスワード',
        'register': '登録',
        'profile': 'プロフィール',
        'settings': '設定',
        'save': '保存',
        'cancel': 'キャンセル',
        'loading': '読み込み中...',
        'error': 'エラーが発生しました',
        'success': '成功',
    },
    ko: {
        'welcome': '환영합니다',
        'login': '로그인',
        'logout': '로그아웃',
        'email': '이메일',
        'password': '비밀번호',
        'register': '가입',
        'profile': '프로필',
        'settings': '설정',
        'save': '저장',
        'cancel': '취소',
        'loading': '로딩 중...',
        'error': '오류가 발생했습니다',
        'success': '성공',
    },
    zh: {
        'welcome': '欢迎',
        'login': '登录',
        'logout': '登出',
        'email': '邮箱',
        'password': '密码',
        'register': '注册',
        'profile': '个人资料',
        'settings': '设置',
        'save': '保存',
        'cancel': '取消',
        'loading': '加载中...',
        'error': '发生错误',
        'success': '成功',
    },
};

export function I18nProvider({ children }: I18nProviderProps): JSX.Element {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize locale from localStorage or browser
        const savedLocale = localStorage.getItem('locale') as Locale;
        const browserLocale = navigator.language.split('-')[0] as Locale;

        if (savedLocale && translations[savedLocale]) {
            setLocaleState(savedLocale);
        } else if (translations[browserLocale]) {
            setLocaleState(browserLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setIsLoading(true);
        try {
            localStorage.setItem('locale', newLocale);
            setLocaleState(newLocale);
        } catch (error) {
            console.error('Failed to set locale:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const translation = translations[locale]?.[key] || key;

        if (!params) return translation;

        // Simple parameter replacement
        return Object.entries(params).reduce((str, [param, value]) => {
            return str.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        }, translation);
    };

    const value: I18nContextType = {
        locale,
        setLocale,
        t,
        isLoading,
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
