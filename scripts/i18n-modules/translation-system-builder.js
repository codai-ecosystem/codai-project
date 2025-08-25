/**
 * @fileoverview Translation System Builder
 * @description Builds comprehensive translation infrastructure
 */

import fs from 'fs';
import path from 'path';

export default function buildTranslationSystem(dirs, appName) {
    createTranslationFiles(dirs.publicDir, appName);
    createTranslationHelpers(dirs.utilsDir, appName);
    createTranslationComponents(dirs.componentsDir, appName);
    createDefaultTranslations(dirs.publicDir, appName);
    console.log(`📚 Translation system built for ${appName}`);
}

function createTranslationFiles(publicDir, appName) {
    const localesDir = path.join(publicDir, 'locales');

    // Create directory structure for each locale
    const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi', 'pt', 'ru'];
    const namespaces = ['common', 'auth', 'navigation', 'dashboard', 'forms', 'errors', 'settings'];

    locales.forEach(locale => {
        const localeDir = path.join(localesDir, locale);
        if (!fs.existsSync(localeDir)) {
            fs.mkdirSync(localeDir, { recursive: true });
        }

        namespaces.forEach(ns => {
            const translationFile = path.join(localeDir, `${ns}.json`);
            if (!fs.existsSync(translationFile)) {
                const translations = getDefaultTranslations(ns, locale, appName);
                fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2));
            }
        });
    });
}

function createTranslationHelpers(utilsDir, appName) {
    const helpersContent = `/**
 * @fileoverview Translation Helpers
 * @description Utility functions for translation management
 */

import { TFunction } from 'i18next';
import { SUPPORTED_LOCALES } from '../../../../i18n/shared-config';

export interface TranslationParams {
  [key: string]: string | number | Date;
}

export interface PluralOptions {
  count: number;
  [key: string]: any;
}

/**
 * Safe translation function with fallback
 */
export const safeTranslate = (
  t: TFunction,
  key: string,
  fallback?: string,
  params?: TranslationParams
): string => {
  try {
    const translation = t(key, params);
    
    // If translation equals the key, it might be missing
    if (translation === key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(\`Missing translation for key: \${key}\`);
      }
      return fallback || key.split('.').pop() || key;
    }
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return fallback || key;
  }
};

/**
 * Translate with HTML content support
 */
export const translateHTML = (
  t: TFunction,
  key: string,
  params?: TranslationParams
): string => {
  return t(key, {
    ...params,
    interpolation: { escapeValue: false }
  });
};

/**
 * Translate with plural support
 */
export const translatePlural = (
  t: TFunction,
  key: string,
  count: number,
  params?: TranslationParams
): string => {
  return t(key, {
    count,
    ...params
  });
};

/**
 * Get all available translations for a namespace
 */
export const getNamespaceTranslations = (
  t: TFunction,
  namespace: string,
  locale?: string
): Record<string, string> => {
  try {
    const translations = t('', { returnObjects: true, ns: namespace, lng: locale });
    return translations as Record<string, string>;
  } catch (error) {
    console.error('Error getting namespace translations:', error);
    return {};
  }
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (
  t: TFunction,
  key: string,
  namespace?: string
): boolean => {
  try {
    const translation = t(key, { ns: namespace, fallbackLng: false });
    return translation !== key;
  } catch {
    return false;
  }
};

/**
 * Get missing translation keys for a namespace
 */
export const getMissingKeys = (
  t: TFunction,
  keys: string[],
  namespace?: string
): string[] => {
  return keys.filter(key => !hasTranslation(t, key, namespace));
};

/**
 * Translation key generator for forms
 */
export const getFormTranslationKeys = (formName: string): {
  title: string;
  subtitle: string;
  submit: string;
  cancel: string;
  reset: string;
  field: (fieldName: string) => {
    label: string;
    placeholder: string;
    error: string;
    help: string;
  };
} => ({
  title: \`forms.\${formName}.title\`,
  subtitle: \`forms.\${formName}.subtitle\`,
  submit: \`forms.\${formName}.submit\`,
  cancel: \`forms.\${formName}.cancel\`,
  reset: \`forms.\${formName}.reset\`,
  field: (fieldName: string) => ({
    label: \`forms.\${formName}.fields.\${fieldName}.label\`,
    placeholder: \`forms.\${formName}.fields.\${fieldName}.placeholder\`,
    error: \`forms.\${formName}.fields.\${fieldName}.error\`,
    help: \`forms.\${formName}.fields.\${fieldName}.help\`
  })
});

/**
 * Translation key generator for dashboard
 */
export const getDashboardTranslationKeys = (sectionName: string) => ({
  title: \`dashboard.\${sectionName}.title\`,
  description: \`dashboard.\${sectionName}.description\`,
  action: \`dashboard.\${sectionName}.action\`,
  empty: \`dashboard.\${sectionName}.empty\`,
  loading: \`dashboard.\${sectionName}.loading\`,
  error: \`dashboard.\${sectionName}.error\`
});

/**
 * Translation key generator for navigation
 */
export const getNavigationTranslationKeys = () => ({
  home: 'navigation.home',
  dashboard: 'navigation.dashboard',
  settings: 'navigation.settings',
  profile: 'navigation.profile',
  logout: 'navigation.logout',
  menu: 'navigation.menu',
  search: 'navigation.search'
});

/**
 * Error translation helper
 */
export const translateError = (
  t: TFunction,
  errorCode: string,
  fallbackMessage?: string
): string => {
  const key = \`errors.\${errorCode}\`;
  const translation = t(key);
  
  if (translation === key) {
    return fallbackMessage || \`Error: \${errorCode}\`;
  }
  
  return translation;
};

/**
 * Success message translation helper
 */
export const translateSuccess = (
  t: TFunction,
  actionKey: string,
  params?: TranslationParams
): string => {
  return t(\`success.\${actionKey}\`, params);
};

/**
 * Validation message translation helper
 */
export const translateValidation = (
  t: TFunction,
  validationType: string,
  fieldName: string,
  params?: TranslationParams
): string => {
  return t(\`validation.\${validationType}\`, {
    field: t(\`fields.\${fieldName}\`),
    ...params
  });
};

/**
 * Format currency with locale support
 */
export const formatCurrencyWithLocale = (
  amount: number,
  locale: string,
  currency?: string
): string => {
  const localeConfig = SUPPORTED_LOCALES[locale];
  if (!localeConfig) {
    return amount.toString();
  }

  return new Intl.NumberFormat(localeConfig.numberFormat, {
    style: 'currency',
    currency: currency || localeConfig.currency
  }).format(amount);
};

/**
 * Format date with locale support
 */
export const formatDateWithLocale = (
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const localeConfig = SUPPORTED_LOCALES[locale];
  if (!localeConfig) {
    return new Date(date).toLocaleDateString();
  }

  return new Intl.DateTimeFormat(localeConfig.numberFormat, options).format(new Date(date));
};

/**
 * Translation interpolation helper for complex templates
 */
export const interpolateTranslation = (
  template: string,
  params: Record<string, any>
): string => {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const value = params[key.trim()];
    return value !== undefined ? String(value) : match;
  });
};

/**
 * Lazy load translation namespace
 */
export const loadTranslationNamespace = async (
  namespace: string,
  locale: string
): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch(\`/locales/\${locale}/\${namespace}.json\`);
    if (!response.ok) {
      throw new Error(\`Failed to load \${namespace} for \${locale}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading translation namespace:', error);
    return null;
  }
};

/**
 * Translation completeness checker
 */
export const checkTranslationCompleteness = (
  baseTranslations: Record<string, any>,
  targetTranslations: Record<string, any>
): {
  missing: string[];
  extra: string[];
  completeness: number;
} => {
  const baseKeys = flattenKeys(baseTranslations);
  const targetKeys = flattenKeys(targetTranslations);
  
  const missing = baseKeys.filter(key => !targetKeys.includes(key));
  const extra = targetKeys.filter(key => !baseKeys.includes(key));
  
  const completeness = baseKeys.length > 0 
    ? ((baseKeys.length - missing.length) / baseKeys.length) * 100 
    : 100;

  return { missing, extra, completeness };
};

/**
 * Flatten nested object keys
 */
function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'translation-helpers.ts'), helpersContent);
}

function createTranslationComponents(componentsDir, appName) {
    const transComponentContent = `/**
 * @fileoverview Translation Components
 * @description Reusable translation components
 */

import React, { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { safeTranslate, translateHTML } from '../utils/translation-helpers';

interface TranslatedTextProps {
  i18nKey: string;
  namespace?: string;
  fallback?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Safe translated text component with fallback
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  namespace = 'common',
  fallback,
  params,
  className,
  tag: Tag = 'span'
}) => {
  const { t } = useTranslation(namespace);
  const text = safeTranslate(t, i18nKey, fallback, params);

  return <Tag className={className}>{text}</Tag>;
};

interface TranslatedHTMLProps {
  i18nKey: string;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Translated HTML content component
 */
export const TranslatedHTML: React.FC<TranslatedHTMLProps> = ({
  i18nKey,
  namespace = 'common',
  params,
  className,
  tag: Tag = 'div'
}) => {
  const { t } = useTranslation(namespace);
  const html = translateHTML(t, i18nKey, params);

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface PluralTextProps {
  i18nKey: string;
  count: number;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Plural text component
 */
export const PluralText: React.FC<PluralTextProps> = ({
  i18nKey,
  count,
  namespace = 'common',
  params,
  className,
  tag: Tag = 'span'
}) => {
  const { t } = useTranslation(namespace);
  const text = t(i18nKey, { count, ...params });

  return <Tag className={className}>{text}</Tag>;
};

interface TranslatedLinkProps {
  i18nKey: string;
  href: string;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  children?: ReactNode;
  target?: string;
  rel?: string;
}

/**
 * Translated link component
 */
export const TranslatedLink: React.FC<TranslatedLinkProps> = ({
  i18nKey,
  href,
  namespace = 'common',
  params,
  className,
  children,
  target,
  rel
}) => {
  const { t } = useTranslation(namespace);
  const linkText = safeTranslate(t, i18nKey, '', params);

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
    >
      {children || linkText}
    </a>
  );
};

interface TranslatedButtonProps {
  i18nKey: string;
  namespace?: string;
  params?: Record<string, any>;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children?: ReactNode;
}

/**
 * Translated button component
 */
export const TranslatedButton: React.FC<TranslatedButtonProps> = ({
  i18nKey,
  namespace = 'common',
  params,
  onClick,
  disabled = false,
  type = 'button',
  className,
  children
}) => {
  const { t } = useTranslation(namespace);
  const buttonText = safeTranslate(t, i18nKey, '', params);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children || buttonText}
    </button>
  );
};

interface FormattedMessageProps {
  i18nKey: string;
  namespace?: string;
  values?: Record<string, any>;
  components?: Record<string, ReactNode>;
  className?: string;
}

/**
 * Formatted message component with rich text support
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  i18nKey,
  namespace = 'common',
  values,
  components,
  className
}) => {
  return (
    <Trans
      i18nKey={i18nKey}
      ns={namespace}
      values={values}
      components={components}
      className={className}
    />
  );
};

interface ConditionalTranslationProps {
  condition: boolean;
  trueKey: string;
  falseKey: string;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Conditional translation component
 */
export const ConditionalTranslation: React.FC<ConditionalTranslationProps> = ({
  condition,
  trueKey,
  falseKey,
  namespace = 'common',
  params,
  className,
  tag: Tag = 'span'
}) => {
  const { t } = useTranslation(namespace);
  const key = condition ? trueKey : falseKey;
  const text = safeTranslate(t, key, '', params);

  return <Tag className={className}>{text}</Tag>;
};

interface TranslatedSelectProps {
  i18nKey: string;
  options: Array<{ value: string; labelKey: string }>;
  namespace?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Translated select component
 */
export const TranslatedSelect: React.FC<TranslatedSelectProps> = ({
  i18nKey,
  options,
  namespace = 'common',
  value,
  onChange,
  className,
  placeholder
}) => {
  const { t } = useTranslation(namespace);
  const label = safeTranslate(t, i18nKey, '');

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={className}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {safeTranslate(t, option.labelKey, option.value)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default {
  TranslatedText,
  TranslatedHTML,
  PluralText,
  TranslatedLink,
  TranslatedButton,
  FormattedMessage,
  ConditionalTranslation,
  TranslatedSelect
};`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'TranslationComponents.tsx'), transComponentContent);
}

function createDefaultTranslations(publicDir, appName) {
    // This will be called by createTranslationFiles, so we don't need to duplicate
    console.log(`📝 Default translations created for ${appName}`);
}

function getDefaultTranslations(namespace, locale, appName) {
    const translations = {
        common: {
            en: {
                app_name: appName,
                welcome: "Welcome",
                loading: "Loading...",
                error: "An error occurred",
                success: "Success!",
                cancel: "Cancel",
                save: "Save",
                delete: "Delete",
                edit: "Edit",
                close: "Close",
                back: "Back",
                next: "Next",
                previous: "Previous",
                search: "Search",
                filter: "Filter",
                sort: "Sort",
                refresh: "Refresh",
                more: "More",
                less: "Less",
                yes: "Yes",
                no: "No",
                ok: "OK",
                confirm: "Confirm",
                warning: "Warning",
                info: "Information",
                help: "Help",
                contact: "Contact",
                about: "About",
                privacy: "Privacy",
                terms: "Terms of Service",
                language: "Language",
                theme: "Theme",
                settings: "Settings",
                profile: "Profile",
                logout: "Logout",
                login: "Login",
                register: "Register"
            },
            es: {
                app_name: appName,
                welcome: "Bienvenido",
                loading: "Cargando...",
                error: "Ocurrió un error",
                success: "¡Éxito!",
                cancel: "Cancelar",
                save: "Guardar",
                delete: "Eliminar",
                edit: "Editar",
                close: "Cerrar",
                back: "Atrás",
                next: "Siguiente",
                previous: "Anterior",
                search: "Buscar",
                filter: "Filtrar",
                sort: "Ordenar",
                refresh: "Actualizar",
                more: "Más",
                less: "Menos",
                yes: "Sí",
                no: "No",
                ok: "OK",
                confirm: "Confirmar",
                warning: "Advertencia",
                info: "Información",
                help: "Ayuda",
                contact: "Contacto",
                about: "Acerca de",
                privacy: "Privacidad",
                terms: "Términos de Servicio",
                language: "Idioma",
                theme: "Tema",
                settings: "Configuración",
                profile: "Perfil",
                logout: "Cerrar sesión",
                login: "Iniciar sesión",
                register: "Registrarse"
            },
            fr: {
                app_name: appName,
                welcome: "Bienvenue",
                loading: "Chargement...",
                error: "Une erreur s'est produite",
                success: "Succès !",
                cancel: "Annuler",
                save: "Sauvegarder",
                delete: "Supprimer",
                edit: "Modifier",
                close: "Fermer",
                back: "Retour",
                next: "Suivant",
                previous: "Précédent",
                search: "Rechercher",
                filter: "Filtrer",
                sort: "Trier",
                refresh: "Actualiser",
                more: "Plus",
                less: "Moins",
                yes: "Oui",
                no: "Non",
                ok: "OK",
                confirm: "Confirmer",
                warning: "Avertissement",
                info: "Information",
                help: "Aide",
                contact: "Contact",
                about: "À propos",
                privacy: "Confidentialité",
                terms: "Conditions d'utilisation",
                language: "Langue",
                theme: "Thème",
                settings: "Paramètres",
                profile: "Profil",
                logout: "Déconnexion",
                login: "Connexion",
                register: "S'inscrire"
            },
            ar: {
                app_name: appName,
                welcome: "مرحبًا",
                loading: "جاري التحميل...",
                error: "حدث خطأ",
                success: "نجح!",
                cancel: "إلغاء",
                save: "حفظ",
                delete: "حذف",
                edit: "تعديل",
                close: "إغلاق",
                back: "رجوع",
                next: "التالي",
                previous: "السابق",
                search: "بحث",
                filter: "تصفية",
                sort: "ترتيب",
                refresh: "تحديث",
                more: "المزيد",
                less: "أقل",
                yes: "نعم",
                no: "لا",
                ok: "موافق",
                confirm: "تأكيد",
                warning: "تحذير",
                info: "معلومات",
                help: "مساعدة",
                contact: "اتصل بنا",
                about: "حول",
                privacy: "الخصوصية",
                terms: "شروط الخدمة",
                language: "اللغة",
                theme: "المظهر",
                settings: "الإعدادات",
                profile: "الملف الشخصي",
                logout: "تسجيل الخروج",
                login: "تسجيل الدخول",
                register: "التسجيل"
            }
        },
        auth: {
            en: {
                login: {
                    title: "Sign In",
                    subtitle: "Welcome back",
                    email: "Email",
                    password: "Password",
                    remember_me: "Remember me",
                    forgot_password: "Forgot password?",
                    no_account: "Don't have an account?",
                    sign_up: "Sign up"
                },
                register: {
                    title: "Create Account",
                    subtitle: "Get started with us",
                    name: "Full Name",
                    email: "Email",
                    password: "Password",
                    confirm_password: "Confirm Password",
                    have_account: "Already have an account?",
                    sign_in: "Sign in"
                }
            },
            es: {
                login: {
                    title: "Iniciar Sesión",
                    subtitle: "Bienvenido de nuevo",
                    email: "Correo electrónico",
                    password: "Contraseña",
                    remember_me: "Recordarme",
                    forgot_password: "¿Olvidaste tu contraseña?",
                    no_account: "¿No tienes una cuenta?",
                    sign_up: "Registrarse"
                },
                register: {
                    title: "Crear Cuenta",
                    subtitle: "Comienza con nosotros",
                    name: "Nombre completo",
                    email: "Correo electrónico",
                    password: "Contraseña",
                    confirm_password: "Confirmar contraseña",
                    have_account: "¿Ya tienes una cuenta?",
                    sign_in: "Iniciar sesión"
                }
            }
        },
        navigation: {
            en: {
                home: "Home",
                dashboard: "Dashboard",
                settings: "Settings",
                profile: "Profile",
                logout: "Logout",
                menu: "Menu",
                search: "Search"
            },
            es: {
                home: "Inicio",
                dashboard: "Panel",
                settings: "Configuración",
                profile: "Perfil",
                logout: "Cerrar sesión",
                menu: "Menú",
                search: "Buscar"
            }
        }
    };

    // Return translations for the specified namespace and locale, fallback to English
    return translations[namespace]?.[locale] || translations[namespace]?.en || {};
}