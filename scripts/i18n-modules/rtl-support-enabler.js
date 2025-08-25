/**
 * @fileoverview RTL Support Enabler
 * @description Enables comprehensive right-to-left language support
 */

import fs from 'fs';
import path from 'path';

export default function enableRTLSupport(dirs, appName) {
    createRTLStyles(dirs.stylesDir || dirs.srcDir, appName);
    createRTLComponents(dirs.componentsDir, appName);
    createRTLUtils(dirs.utilsDir, appName);
    createRTLHooks(dirs.utilsDir, appName);
    console.log(`↔️ RTL support enabled for ${appName}`);
}

function createRTLStyles(stylesDir, appName) {
    const rtlStylesContent = `/**
 * @fileoverview RTL (Right-to-Left) Styles
 * @description Comprehensive RTL language support styles
 */

/* RTL Base Styles */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* RTL Typography */
[dir="rtl"] h1,
[dir="rtl"] h2,
[dir="rtl"] h3,
[dir="rtl"] h4,
[dir="rtl"] h5,
[dir="rtl"] h6 {
  text-align: right;
}

[dir="rtl"] p {
  text-align: right;
}

/* RTL Margins and Paddings */
[dir="rtl"] .ml-1 { margin-right: 0.25rem; margin-left: 0; }
[dir="rtl"] .ml-2 { margin-right: 0.5rem; margin-left: 0; }
[dir="rtl"] .ml-3 { margin-right: 0.75rem; margin-left: 0; }
[dir="rtl"] .ml-4 { margin-right: 1rem; margin-left: 0; }
[dir="rtl"] .ml-5 { margin-right: 1.25rem; margin-left: 0; }
[dir="rtl"] .ml-6 { margin-right: 1.5rem; margin-left: 0; }

[dir="rtl"] .mr-1 { margin-left: 0.25rem; margin-right: 0; }
[dir="rtl"] .mr-2 { margin-left: 0.5rem; margin-right: 0; }
[dir="rtl"] .mr-3 { margin-left: 0.75rem; margin-right: 0; }
[dir="rtl"] .mr-4 { margin-left: 1rem; margin-right: 0; }
[dir="rtl"] .mr-5 { margin-left: 1.25rem; margin-right: 0; }
[dir="rtl"] .mr-6 { margin-left: 1.5rem; margin-right: 0; }

[dir="rtl"] .pl-1 { padding-right: 0.25rem; padding-left: 0; }
[dir="rtl"] .pl-2 { padding-right: 0.5rem; padding-left: 0; }
[dir="rtl"] .pl-3 { padding-right: 0.75rem; padding-left: 0; }
[dir="rtl"] .pl-4 { padding-right: 1rem; padding-left: 0; }
[dir="rtl"] .pl-5 { padding-right: 1.25rem; padding-left: 0; }
[dir="rtl"] .pl-6 { padding-right: 1.5rem; padding-left: 0; }

[dir="rtl"] .pr-1 { padding-left: 0.25rem; padding-right: 0; }
[dir="rtl"] .pr-2 { padding-left: 0.5rem; padding-right: 0; }
[dir="rtl"] .pr-3 { padding-left: 0.75rem; padding-right: 0; }
[dir="rtl"] .pr-4 { padding-left: 1rem; padding-right: 0; }
[dir="rtl"] .pr-5 { padding-left: 1.25rem; padding-right: 0; }
[dir="rtl"] .pr-6 { padding-left: 1.5rem; padding-right: 0; }

/* RTL Flexbox */
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .flex-row-reverse {
  flex-direction: row;
}

/* RTL Text Alignment */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

/* RTL Borders */
[dir="rtl"] .border-l { border-right-width: 1px; border-left-width: 0; }
[dir="rtl"] .border-r { border-left-width: 1px; border-right-width: 0; }

[dir="rtl"] .border-l-2 { border-right-width: 2px; border-left-width: 0; }
[dir="rtl"] .border-r-2 { border-left-width: 2px; border-right-width: 0; }

[dir="rtl"] .border-l-4 { border-right-width: 4px; border-left-width: 0; }
[dir="rtl"] .border-r-4 { border-left-width: 4px; border-right-width: 0; }

/* RTL Rounded Corners */
[dir="rtl"] .rounded-l { border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; border-top-left-radius: 0; border-bottom-left-radius: 0; }
[dir="rtl"] .rounded-r { border-top-left-radius: 0.25rem; border-bottom-left-radius: 0.25rem; border-top-right-radius: 0; border-bottom-right-radius: 0; }

[dir="rtl"] .rounded-tl { border-top-right-radius: 0.25rem; border-top-left-radius: 0; }
[dir="rtl"] .rounded-tr { border-top-left-radius: 0.25rem; border-top-right-radius: 0; }

[dir="rtl"] .rounded-bl { border-bottom-right-radius: 0.25rem; border-bottom-left-radius: 0; }
[dir="rtl"] .rounded-br { border-bottom-left-radius: 0.25rem; border-bottom-right-radius: 0; }

/* RTL Positioning */
[dir="rtl"] .left-0 { right: 0; left: auto; }
[dir="rtl"] .right-0 { left: 0; right: auto; }

[dir="rtl"] .left-1 { right: 0.25rem; left: auto; }
[dir="rtl"] .right-1 { left: 0.25rem; right: auto; }

[dir="rtl"] .left-2 { right: 0.5rem; left: auto; }
[dir="rtl"] .right-2 { left: 0.5rem; right: auto; }

[dir="rtl"] .left-4 { right: 1rem; left: auto; }
[dir="rtl"] .right-4 { left: 1rem; right: auto; }

/* RTL Transforms */
[dir="rtl"] .transform {
  --tw-scale-x: -1;
}

/* RTL Icons */
[dir="rtl"] .icon-flip {
  transform: scaleX(-1);
}

/* RTL Navigation */
[dir="rtl"] .nav-arrow::before {
  content: "◀";
}

[dir="ltr"] .nav-arrow::before {
  content: "▶";
}

/* RTL Forms */
[dir="rtl"] input[type="text"],
[dir="rtl"] input[type="email"],
[dir="rtl"] input[type="password"],
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
  padding-right: 0.75rem;
  padding-left: 2.5rem;
}

[dir="rtl"] input[type="text"]:focus,
[dir="rtl"] input[type="email"]:focus,
[dir="rtl"] input[type="password"]:focus,
[dir="rtl"] textarea:focus,
[dir="rtl"] select:focus {
  padding-right: 0.75rem;
}

/* RTL Dropdowns */
[dir="rtl"] .dropdown-menu {
  right: 0;
  left: auto;
}

/* RTL Tooltips */
[dir="rtl"] .tooltip {
  direction: ltr;
  text-align: center;
}

[dir="rtl"] .tooltip-arrow {
  transform: scaleX(-1);
}

/* RTL Tables */
[dir="rtl"] table {
  direction: rtl;
}

[dir="rtl"] th,
[dir="rtl"] td {
  text-align: right;
}

[dir="rtl"] th:first-child,
[dir="rtl"] td:first-child {
  text-align: right;
}

/* RTL Lists */
[dir="rtl"] ul,
[dir="rtl"] ol {
  padding-right: 1.5rem;
  padding-left: 0;
}

/* RTL Breadcrumbs */
[dir="rtl"] .breadcrumb {
  direction: rtl;
}

[dir="rtl"] .breadcrumb-separator::before {
  content: "\\\\";
}

[dir="ltr"] .breadcrumb-separator::before {
  content: "/";
}

/* RTL Progress Bars */
[dir="rtl"] .progress-bar {
  direction: rtl;
}

/* RTL Animations */
[dir="rtl"] .slide-in-left {
  animation: slideInRight 0.3s ease-out;
}

[dir="rtl"] .slide-in-right {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* RTL Print Styles */
@media print {
  [dir="rtl"] {
    direction: rtl;
    text-align: right;
  }
}

/* RTL Mobile Specific */
@media (max-width: 640px) {
  [dir="rtl"] .mobile-nav {
    right: 0;
    left: auto;
  }
}

/* RTL High Contrast Mode */
@media (prefers-contrast: high) {
  [dir="rtl"] {
    font-weight: 600;
  }
}

/* RTL Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  [dir="rtl"] * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`;

    if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(stylesDir, 'rtl-styles.css'), rtlStylesContent);

    // Create Tailwind RTL plugin
    const tailwindRTLContent = `/**
 * @fileoverview Tailwind CSS RTL Plugin
 * @description Custom Tailwind plugin for RTL support
 */

const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities, addComponents, theme }) {
  // RTL Utilities
  addUtilities({
    '.rtl\\\\:text-right': {
      '[dir="rtl"] &': {
        'text-align': 'right',
      },
    },
    '.rtl\\\\:text-left': {
      '[dir="rtl"] &': {
        'text-align': 'left',
      },
    },
    '.rtl\\\\:ml-auto': {
      '[dir="rtl"] &': {
        'margin-right': 'auto',
        'margin-left': '0',
      },
    },
    '.rtl\\\\:mr-auto': {
      '[dir="rtl"] &': {
        'margin-left': 'auto',
        'margin-right': '0',
      },
    },
    '.rtl\\\\:pl-0': {
      '[dir="rtl"] &': {
        'padding-right': '0',
      },
    },
    '.rtl\\\\:pr-0': {
      '[dir="rtl"] &': {
        'padding-left': '0',
      },
    },
    '.rtl\\\\:flex-row-reverse': {
      '[dir="rtl"] &': {
        'flex-direction': 'row-reverse',
      },
    },
    '.rtl\\\\:space-x-reverse > :not([hidden]) ~ :not([hidden])': {
      '[dir="rtl"] &': {
        '--tw-space-x-reverse': '1',
      },
    },
  });

  // RTL Components
  addComponents({
    '.rtl-container': {
      '[dir="rtl"] &': {
        direction: 'rtl',
        textAlign: 'right',
      },
      '[dir="ltr"] &': {
        direction: 'ltr',
        textAlign: 'left',
      },
    },
    '.rtl-input': {
      '[dir="rtl"] &': {
        textAlign: 'right',
        paddingRight: theme('spacing.3'),
        paddingLeft: theme('spacing.10'),
      },
      '[dir="ltr"] &': {
        textAlign: 'left',
        paddingLeft: theme('spacing.3'),
        paddingRight: theme('spacing.10'),
      },
    },
    '.rtl-icon': {
      '[dir="rtl"] &': {
        transform: 'scaleX(-1)',
      },
    },
  });
});`;

    fs.writeFileSync(path.join(stylesDir, 'tailwind-rtl-plugin.js'), tailwindRTLContent);
}

function createRTLComponents(componentsDir, appName) {
    const rtlComponentsContent = `/**
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
      className={\`rtl-container \${className}\`}
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
    \`justify-\${justify}\`,
    \`items-\${align}\`,
    wrap ? 'flex-wrap' : 'flex-nowrap',
    gap > 0 ? \`gap-\${gap}\` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={\`\${flexClasses} \${className}\`}>
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
    return \`text-\${align}\`;
  };

  return (
    <Component className={\`\${getAlignmentClass()} \${className}\`}>
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
    <RTLContainer className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
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
      className={\`\${isRTL ? 'pr-0' : 'pl-0'} \${className}\`}
    >
      {items.map((item, index) => (
        <li 
          key={index}
          className={\`
            \${dividers && index < items.length - 1 ? 'border-b border-gray-200 pb-2 mb-2' : ''}
            \${isRTL ? 'text-right' : 'text-left'}
          \`}
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
    <nav className={\`breadcrumb \${className}\`} aria-label="Breadcrumb">
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
};`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'RTLComponents.tsx'), rtlComponentsContent);
}

function createRTLUtils(utilsDir, appName) {
    const rtlUtilsContent = `/**
 * @fileoverview RTL Utility Functions
 * @description Utilities for RTL layout and text handling
 */

import { RTL_LOCALES } from '../../../../i18n/shared-config';

/**
 * Check if a locale is RTL
 */
export const isRTLLocale = (locale: string): boolean => {
  return RTL_LOCALES.includes(locale);
};

/**
 * Get direction for a locale
 */
export const getDirection = (locale: string): 'rtl' | 'ltr' => {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
};

/**
 * Get opposite direction
 */
export const getOppositeDirection = (direction: 'rtl' | 'ltr'): 'rtl' | 'ltr' => {
  return direction === 'rtl' ? 'ltr' : 'rtl';
};

/**
 * RTL-aware class name utilities
 */
export class RTLClassNames {
  private isRTL: boolean;

  constructor(isRTL: boolean) {
    this.isRTL = isRTL;
  }

  /**
   * Get margin class (left/right)
   */
  margin(side: 'left' | 'right', size: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                      this.isRTL && side === 'right' ? 'left' : side;
    return \`m\${actualSide[0]}-\${size}\`;
  }

  /**
   * Get padding class (left/right)
   */
  padding(side: 'left' | 'right', size: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return \`p\${actualSide[0]}-\${size}\`;
  }

  /**
   * Get text alignment class
   */
  textAlign(align: 'left' | 'right' | 'center'): string {
    if (align === 'center') return 'text-center';
    const actualAlign = this.isRTL && align === 'left' ? 'right' : 
                        this.isRTL && align === 'right' ? 'left' : align;
    return \`text-\${actualAlign}\`;
  }

  /**
   * Get border class (left/right)
   */
  border(side: 'left' | 'right', width: string = ''): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return width ? \`border-\${actualSide[0]}-\${width}\` : \`border-\${actualSide[0]}\`;
  }

  /**
   * Get rounded corner class
   */
  rounded(corner: 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r', size: string = ''): string {
    let actualCorner = corner;
    
    if (this.isRTL) {
      const cornerMap: Record<string, string> = {
        'tl': 'tr',
        'tr': 'tl',
        'bl': 'br',
        'br': 'bl',
        'l': 'r',
        'r': 'l'
      };
      actualCorner = cornerMap[corner] || corner;
    }
    
    return size ? \`rounded-\${actualCorner}-\${size}\` : \`rounded-\${actualCorner}\`;
  }

  /**
   * Get position class (left/right)
   */
  position(side: 'left' | 'right', value: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return \`\${actualSide}-\${value}\`;
  }

  /**
   * Get flex direction class
   */
  flexDirection(direction: 'row' | 'row-reverse' | 'col' | 'col-reverse'): string {
    if (direction.includes('col')) return \`flex-\${direction}\`;
    
    const actualDirection = this.isRTL && direction === 'row' ? 'row-reverse' : 
                            this.isRTL && direction === 'row-reverse' ? 'row' : direction;
    return \`flex-\${actualDirection}\`;
  }
}

/**
 * RTL-aware CSS property utilities
 */
export class RTLCSSProperties {
  private isRTL: boolean;

  constructor(isRTL: boolean) {
    this.isRTL = isRTL;
  }

  /**
   * Get logical property for margin/padding
   */
  logicalProperty(property: 'margin' | 'padding', side: 'start' | 'end', value: string): Record<string, string> {
    const actualSide = side === 'start' 
      ? (this.isRTL ? 'right' : 'left')
      : (this.isRTL ? 'left' : 'right');
    
    return { [\`\${property}-\${actualSide}\`]: value };
  }

  /**
   * Get transform for RTL
   */
  transform(transforms: string[]): Record<string, string> {
    const rtlTransforms = this.isRTL 
      ? ['scaleX(-1)', ...transforms]
      : transforms;
    
    return { transform: rtlTransforms.join(' ') };
  }

  /**
   * Get text direction properties
   */
  textDirection(): Record<string, string> {
    return {
      direction: this.isRTL ? 'rtl' : 'ltr',
      textAlign: this.isRTL ? 'right' : 'left'
    };
  }
}

/**
 * Text processing utilities for RTL
 */
export class RTLTextUtils {
  /**
   * Detect if text contains RTL characters
   */
  static hasRTLCharacters(text: string): boolean {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlRegex.test(text);
  }

  /**
   * Auto-detect text direction
   */
  static detectTextDirection(text: string): 'rtl' | 'ltr' {
    return this.hasRTLCharacters(text) ? 'rtl' : 'ltr';
  }

  /**
   * Wrap text with directional marks
   */
  static wrapWithDirectionalMarks(text: string, direction?: 'rtl' | 'ltr'): string {
    const detectedDirection = direction || this.detectTextDirection(text);
    const lrm = '\\u200E'; // Left-to-right mark
    const rlm = '\\u200F'; // Right-to-left mark
    
    if (detectedDirection === 'rtl') {
      return rlm + text + rlm;
    } else {
      return lrm + text + lrm;
    }
  }

  /**
   * Remove directional marks from text
   */
  static removeDirectionalMarks(text: string): string {
    return text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
  }

  /**
   * Normalize text for consistent display
   */
  static normalizeText(text: string): string {
    return this.removeDirectionalMarks(text).trim();
  }

  /**
   * Get appropriate quote marks for locale
   */
  static getQuoteMarks(locale: string): { open: string; close: string } {
    const quoteMaps: Record<string, { open: string; close: string }> = {
      ar: { open: '«', close: '»' },
      he: { open: '"', close: '"' },
      fa: { open: '«', close: '»' },
      ur: { open: '"', close: '"' }
    };

    return quoteMaps[locale] || { open: '"', close: '"' };
  }

  /**
   * Format text with proper quotes
   */
  static formatWithQuotes(text: string, locale: string): string {
    const quotes = this.getQuoteMarks(locale);
    return \`\${quotes.open}\${text}\${quotes.close}\`;
  }
}

/**
 * Number formatting utilities for RTL locales
 */
export class RTLNumberUtils {
  /**
   * Format number for RTL display
   */
  static formatNumber(
    number: number, 
    locale: string, 
    options?: Intl.NumberFormatOptions
  ): string {
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      console.warn('Error formatting number:', error);
      return number.toString();
    }
  }

  /**
   * Format percentage for RTL display
   */
  static formatPercentage(number: number, locale: string): string {
    return this.formatNumber(number, locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /**
   * Format currency for RTL display
   */
  static formatCurrency(
    amount: number, 
    locale: string, 
    currency: string
  ): string {
    return this.formatNumber(amount, locale, {
      style: 'currency',
      currency: currency
    });
  }

  /**
   * Convert Western Arabic numerals to Eastern Arabic numerals
   */
  static toEasternArabicNumerals(text: string): string {
    const westernToEastern: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };

    return text.replace(/[0-9]/g, digit => westernToEastern[digit] || digit);
  }

  /**
   * Convert Eastern Arabic numerals to Western Arabic numerals
   */
  static toWesternArabicNumerals(text: string): string {
    const easternToWestern: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    return text.replace(/[٠-٩]/g, digit => easternToWestern[digit] || digit);
  }
}

/**
 * Date formatting utilities for RTL locales
 */
export class RTLDateUtils {
  /**
   * Format date for RTL display
   */
  static formatDate(
    date: Date | string | number,
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ): string {
    try {
      return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    } catch (error) {
      console.warn('Error formatting date:', error);
      return new Date(date).toLocaleDateString();
    }
  }

  /**
   * Get calendar system for locale
   */
  static getCalendarSystem(locale: string): string {
    const calendarSystems: Record<string, string> = {
      ar: 'islamic',
      he: 'hebrew',
      fa: 'persian',
      th: 'buddhist'
    };

    return calendarSystems[locale] || 'gregorian';
  }

  /**
   * Format date with appropriate calendar system
   */
  static formatDateWithCalendar(
    date: Date | string | number,
    locale: string,
    calendar?: string
  ): string {
    const calendarSystem = calendar || this.getCalendarSystem(locale);
    
    return this.formatDate(date, locale, {
      calendar: calendarSystem,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Create RTL utility functions for a given locale/direction
 */
export const createRTLUtils = (isRTL: boolean) => ({
  classNames: new RTLClassNames(isRTL),
  cssProperties: new RTLCSSProperties(isRTL),
  isRTL,
  direction: isRTL ? 'rtl' as const : 'ltr' as const
});

export default {
  isRTLLocale,
  getDirection,
  getOppositeDirection,
  RTLClassNames,
  RTLCSSProperties,
  RTLTextUtils,
  RTLNumberUtils,
  RTLDateUtils,
  createRTLUtils
};`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'rtl-utils.ts'), rtlUtilsContent);
}

function createRTLHooks(utilsDir, appName) {
    const rtlHooksContent = `/**
 * @fileoverview RTL React Hooks
 * @description Custom hooks for RTL support
 */

import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../components/I18nProvider';
import { createRTLUtils, RTLTextUtils } from './rtl-utils';

/**
 * Hook for RTL utilities
 */
export const useRTL = () => {
  const { isRTL, currentLocale } = useI18n();
  
  const rtlUtils = createRTLUtils(isRTL);

  return {
    ...rtlUtils,
    locale: currentLocale.code
  };
};

/**
 * Hook for RTL-aware class names
 */
export const useRTLClassNames = () => {
  const { classNames } = useRTL();
  return classNames;
};

/**
 * Hook for RTL-aware CSS properties
 */
export const useRTLCSS = () => {
  const { cssProperties } = useRTL();
  return cssProperties;
};

/**
 * Hook for directional margins and paddings
 */
export const useDirectionalSpacing = () => {
  const { isRTL } = useRTL();

  const getMargin = useCallback((side: 'start' | 'end', size: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'mr' : 'ml')
      : (isRTL ? 'ml' : 'mr');
    return \`\${actualSide}-\${size}\`;
  }, [isRTL]);

  const getPadding = useCallback((side: 'start' | 'end', size: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'pr' : 'pl')
      : (isRTL ? 'pl' : 'pr');
    return \`\${actualSide}-\${size}\`;
  }, [isRTL]);

  const getBorder = useCallback((side: 'start' | 'end', size?: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'border-r' : 'border-l')
      : (isRTL ? 'border-l' : 'border-r');
    return size ? \`\${actualSide}-\${size}\` : actualSide;
  }, [isRTL]);

  const getPosition = useCallback((side: 'start' | 'end', value: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'right' : 'left')
      : (isRTL ? 'left' : 'right');
    return \`\${actualSide}-\${value}\`;
  }, [isRTL]);

  return {
    marginStart: (size: string) => getMargin('start', size),
    marginEnd: (size: string) => getMargin('end', size),
    paddingStart: (size: string) => getPadding('start', size),
    paddingEnd: (size: string) => getPadding('end', size),
    borderStart: (size?: string) => getBorder('start', size),
    borderEnd: (size?: string) => getBorder('end', size),
    positionStart: (value: string) => getPosition('start', value),
    positionEnd: (value: string) => getPosition('end', value),
  };
};

/**
 * Hook for RTL-aware text alignment
 */
export const useTextAlignment = () => {
  const { isRTL } = useRTL();

  const getAlignment = useCallback((align: 'start' | 'end' | 'center' | 'justify') => {
    switch (align) {
      case 'start': return isRTL ? 'text-right' : 'text-left';
      case 'end': return isRTL ? 'text-left' : 'text-right';
      case 'center': return 'text-center';
      case 'justify': return 'text-justify';
      default: return isRTL ? 'text-right' : 'text-left';
    }
  }, [isRTL]);

  return {
    textStart: getAlignment('start'),
    textEnd: getAlignment('end'),
    textCenter: getAlignment('center'),
    textJustify: getAlignment('justify'),
    getAlignment
  };
};

/**
 * Hook for RTL-aware flex direction
 */
export const useFlexDirection = () => {
  const { isRTL } = useRTL();

  const getFlexDirection = useCallback((direction: 'row' | 'row-reverse' | 'col' | 'col-reverse') => {
    if (direction.includes('col')) return \`flex-\${direction}\`;
    
    const actualDirection = isRTL && direction === 'row' ? 'row-reverse' : 
                            isRTL && direction === 'row-reverse' ? 'row' : direction;
    return \`flex-\${actualDirection}\`;
  }, [isRTL]);

  return {
    flexRow: getFlexDirection('row'),
    flexRowReverse: getFlexDirection('row-reverse'),
    flexCol: getFlexDirection('col'),
    flexColReverse: getFlexDirection('col-reverse'),
    getFlexDirection
  };
};

/**
 * Hook for automatic text direction detection
 */
export const useTextDirection = (text?: string) => {
  const [detectedDirection, setDetectedDirection] = useState<'rtl' | 'ltr'>('ltr');

  useEffect(() => {
    if (text) {
      const direction = RTLTextUtils.detectTextDirection(text);
      setDetectedDirection(direction);
    }
  }, [text]);

  return {
    direction: detectedDirection,
    isRTL: detectedDirection === 'rtl',
    hasRTLCharacters: text ? RTLTextUtils.hasRTLCharacters(text) : false
  };
};

/**
 * Hook for RTL-aware icon handling
 */
export const useRTLIcons = () => {
  const { isRTL } = useRTL();

  const getIconTransform = useCallback((shouldFlip: boolean = true) => {
    return shouldFlip && isRTL ? 'scale-x-[-1]' : '';
  }, [isRTL]);

  const getIconClass = useCallback((shouldFlip: boolean = true, additionalClasses: string = '') => {
    const flipClass = getIconTransform(shouldFlip);
    return [flipClass, additionalClasses].filter(Boolean).join(' ');
  }, [getIconTransform]);

  return {
    getIconTransform,
    getIconClass,
    shouldFlip: isRTL
  };
};

/**
 * Hook for RTL-aware animations
 */
export const useRTLAnimations = () => {
  const { isRTL } = useRTL();

  const getSlideAnimation = useCallback((direction: 'left' | 'right') => {
    const actualDirection = isRTL && direction === 'left' ? 'right' :
                            isRTL && direction === 'right' ? 'left' : direction;
    return \`slide-in-\${actualDirection}\`;
  }, [isRTL]);

  const getTransformOrigin = useCallback((origin: 'left' | 'right' | 'center') => {
    if (origin === 'center') return 'transform-origin-center';
    const actualOrigin = isRTL && origin === 'left' ? 'right' :
                         isRTL && origin === 'right' ? 'left' : origin;
    return \`transform-origin-\${actualOrigin}\`;
  }, [isRTL]);

  return {
    slideInStart: getSlideAnimation('left'),
    slideInEnd: getSlideAnimation('right'),
    originStart: getTransformOrigin('left'),
    originEnd: getTransformOrigin('right'),
    originCenter: getTransformOrigin('center'),
    getSlideAnimation,
    getTransformOrigin
  };
};

/**
 * Hook for RTL-aware form handling
 */
export const useRTLForm = () => {
  const { isRTL } = useRTL();
  const spacing = useDirectionalSpacing();

  const getInputClasses = useCallback((hasIcon: boolean = false, iconPosition: 'start' | 'end' = 'start') => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    if (!hasIcon) return baseClasses;

    const iconSpacing = iconPosition === 'start' 
      ? spacing.paddingStart('10')
      : spacing.paddingEnd('10');

    return \`\${baseClasses} \${iconSpacing}\`;
  }, [isRTL, spacing]);

  const getIconPosition = useCallback((position: 'start' | 'end') => {
    const actualPosition = position === 'start'
      ? (isRTL ? 'right-0 pr-3' : 'left-0 pl-3')
      : (isRTL ? 'left-0 pl-3' : 'right-0 pr-3');
    return \`absolute inset-y-0 flex items-center pointer-events-none \${actualPosition}\`;
  }, [isRTL]);

  return {
    getInputClasses,
    getIconPosition,
    direction: isRTL ? 'rtl' : 'ltr'
  };
};

/**
 * Hook for RTL-aware dropdown positioning
 */
export const useRTLDropdown = () => {
  const { isRTL } = useRTL();

  const getDropdownPosition = useCallback((position: 'start' | 'end' | 'center') => {
    switch (position) {
      case 'start': return isRTL ? 'right-0' : 'left-0';
      case 'end': return isRTL ? 'left-0' : 'right-0';
      case 'center': return 'left-1/2 transform -translate-x-1/2';
      default: return isRTL ? 'right-0' : 'left-0';
    }
  }, [isRTL]);

  return {
    dropdownStart: getDropdownPosition('start'),
    dropdownEnd: getDropdownPosition('end'),
    dropdownCenter: getDropdownPosition('center'),
    getDropdownPosition
  };
};

/**
 * Custom hook for RTL-aware responsive design
 */
export const useRTLResponsive = () => {
  const { isRTL } = useRTL();
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveClasses = useCallback((classes: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  }) => {
    const baseClasses = classes[screenSize] || '';
    const rtlModifier = isRTL ? 'rtl:' : '';
    
    return baseClasses.split(' ').map(cls => \`\${rtlModifier}\${cls}\`).join(' ');
  }, [isRTL, screenSize]);

  return {
    screenSize,
    isRTL,
    getResponsiveClasses
  };
};

export default {
  useRTL,
  useRTLClassNames,
  useRTLCSS,
  useDirectionalSpacing,
  useTextAlignment,
  useFlexDirection,
  useTextDirection,
  useRTLIcons,
  useRTLAnimations,
  useRTLForm,
  useRTLDropdown,
  useRTLResponsive
};`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'rtl-hooks.ts'), rtlHooksContent);
}