/**
 * @fileoverview Translation Components
 * @description Reusable translation components
 */

import React, { ReactNode, ElementType } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { safeTranslate, translateHTML } from '../utils/translation-helpers';

interface TranslatedTextProps {
  i18nKey: string;
  namespace?: string;
  fallback?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: ElementType;
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

  return <Tag className={className} {...({} as any)}>{text}</Tag>;
};

interface TranslatedHTMLProps {
  i18nKey: string;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: ElementType;
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
      {...({} as any)}
    />
  );
};

interface PluralTextProps {
  i18nKey: string;
  count: number;
  namespace?: string;
  params?: Record<string, any>;
  className?: string;
  tag?: ElementType;
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

  return <Tag className={className} {...({} as any)}>{text}</Tag>;
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
      components={components as any}
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
  tag?: ElementType;
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

  return <Tag className={className} {...({} as any)}>{text}</Tag>;
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
};