/**
 * @fileoverview RTL Support Components
 * @description Components that handle RTL layout automatically
 */

import React, { ReactNode } from 'react';
import { useI18n } from './I18nProvider';
import { RTL_LOCALES } from '../../../../i18n/shared-config';

interface RTLSupportProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Container that automatically handles RTL/LTR direction
 */
export const RTLContainer: React.FC<RTLSupportProps> = ({
  children,
  className = '',
  as: Component = 'div'
}) => {
  const { isRTL } = useI18n();

  return (
    <Component
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`rtl-container ${className}`}
    >
      {children}
    </Component>
  );
};

interface RTLFlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number;
}

/**
 * Flex container with RTL-aware direction
 */
export const RTLFlex: React.FC<RTLFlexProps> = ({
  children,
  className = '',
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 0
}) => {
  const { isRTL } = useI18n();

  const flexClasses = [
    'flex',
    direction === 'row' 
      ? isRTL ? 'flex-row-reverse' : 'flex-row'
      : 'flex-col',
    `justify-${justify}`,
    `items-${align}`,
    wrap ? 'flex-wrap' : 'flex-nowrap',
    gap > 0 ? `gap-${gap}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`${flexClasses} ${className}`}>
      {children}
    </div>
  );
};

interface RTLTextProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'justify' | 'auto';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Text component with RTL-aware alignment
 */
export const RTLText: React.FC<RTLTextProps> = ({
  children,
  className = '',
  align = 'auto',
  as: Component = 'p'
}) => {
  const { isRTL } = useI18n();

  const getAlignmentClass = () => {
    if (align === 'auto') {
      return isRTL ? 'text-right' : 'text-left';
    }
    if (align === 'left' && isRTL) return 'text-right';
    if (align === 'right' && isRTL) return 'text-left';
    return `text-${align}`;
  };

  return (
    <Component className={`${getAlignmentClass()} ${className}`}>
      {children}
    </Component>
  );
};

interface RTLIconProps {
  icon: ReactNode;
  flip?: boolean;
  className?: string;
}

/**
 * Icon with RTL flip support
 */
export const RTLIcon: React.FC<RTLIconProps> = ({
  icon,
  flip = true,
  className = ''
}) => {
  const { isRTL } = useI18n();

  const iconClasses = [
    flip && isRTL ? 'rtl-icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={iconClasses}>
      {icon}
    </span>
  );
};

interface RTLInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Input with RTL-aware styling
 */
export const RTLInput: React.FC<RTLInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left'
}) => {
  const { isRTL } = useI18n();

  const inputClasses = [
    'rtl-input',
    'w-full px-3 py-2 border border-gray-300 rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    icon ? (isRTL && iconPosition === 'left' ? 'pr-10' : 'pl-10') : '',
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    'absolute inset-y-0 flex items-center pointer-events-none',
    iconPosition === 'left' 
      ? isRTL ? 'right-0 pr-3' : 'left-0 pl-3'
      : isRTL ? 'left-0 pl-3' : 'right-0 pr-3'
  ].join(' ');

  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputClasses}
        disabled={disabled}
        required={required}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      {icon && (
        <div className={iconClasses}>
          <RTLIcon icon={icon} flip={iconPosition === 'left'} />
        </div>
      )}
    </div>
  );
};

interface RTLCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Card component with RTL layout support
 */
export const RTLCard: React.FC<RTLCardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions
}) => {
  const { isRTL } = useI18n();

  return (
    <RTLContainer className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {(title || subtitle || actions) && (
        <RTLFlex 
          className="mb-4 pb-4 border-b border-gray-200"
          justify="between"
          align="start"
        >
          <div className={isRTL ? 'text-right' : 'text-left'}>
            {title && (
              <RTLText as="h3" className="text-lg font-semibold text-gray-900">
                {title}
              </RTLText>
            )}
            {subtitle && (
              <RTLText className="text-sm text-gray-500 mt-1">
                {subtitle}
              </RTLText>
            )}
          </div>
          {actions && (
            <div className={isRTL ? 'mr-4' : 'ml-4'}>
              {actions}
            </div>
          )}
        </RTLFlex>
      )}
      {children}
    </RTLContainer>
  );
};

interface RTLListProps {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
  ordered?: boolean;
  dividers?: boolean;
}

/**
 * List component with RTL support
 */
export const RTLList: React.FC<RTLListProps> = ({
  items,
  renderItem,
  className = '',
  ordered = false,
  dividers = false
}) => {
  const ListComponent = ordered ? 'ol' : 'ul';
  const { isRTL } = useI18n();

  return (
    <RTLContainer 
      as={ListComponent} 
      className={`${isRTL ? 'pr-0' : 'pl-0'} ${className}`}
    >
      {items.map((item, index) => (
        <li 
          key={index}
          className={`
            ${dividers && index < items.length - 1 ? 'border-b border-gray-200 pb-2 mb-2' : ''}
            ${isRTL ? 'text-right' : 'text-left'}
          `}
        >
          {renderItem(item, index)}
        </li>
      ))}
    </RTLContainer>
  );
};

interface RTLBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  className?: string;
  separator?: ReactNode;
}

/**
 * Breadcrumb component with RTL support
 */
export const RTLBreadcrumb: React.FC<RTLBreadcrumbProps> = ({
  items,
  className = '',
  separator = '/'
}) => {
  const { isRTL } = useI18n();

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      <RTLFlex className="items-center space-x-1">
        {items.map((item, index) => (
          <RTLFlex key={index} className="items-center" gap={1}>
            {index > 0 && (
              <span className={isRTL ? 'mx-2 transform scale-x-[-1]' : 'mx-2'}>
                {separator}
              </span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span 
                className={item.current ? 'text-gray-500 font-medium' : 'text-gray-700'}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </RTLFlex>
        ))}
      </RTLFlex>
    </nav>
  );
};

export default {
  RTLContainer,
  RTLFlex,
  RTLText,
  RTLIcon,
  RTLInput,
  RTLCard,
  RTLList,
  RTLBreadcrumb
};