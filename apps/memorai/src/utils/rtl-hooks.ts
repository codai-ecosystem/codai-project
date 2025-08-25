/**
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
    return `${actualSide}-${size}`;
  }, [isRTL]);

  const getPadding = useCallback((side: 'start' | 'end', size: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'pr' : 'pl')
      : (isRTL ? 'pl' : 'pr');
    return `${actualSide}-${size}`;
  }, [isRTL]);

  const getBorder = useCallback((side: 'start' | 'end', size?: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'border-r' : 'border-l')
      : (isRTL ? 'border-l' : 'border-r');
    return size ? `${actualSide}-${size}` : actualSide;
  }, [isRTL]);

  const getPosition = useCallback((side: 'start' | 'end', value: string) => {
    const actualSide = side === 'start' 
      ? (isRTL ? 'right' : 'left')
      : (isRTL ? 'left' : 'right');
    return `${actualSide}-${value}`;
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
    if (direction.includes('col')) return `flex-${direction}`;
    
    const actualDirection = isRTL && direction === 'row' ? 'row-reverse' : 
                            isRTL && direction === 'row-reverse' ? 'row' : direction;
    return `flex-${actualDirection}`;
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
    return `slide-in-${actualDirection}`;
  }, [isRTL]);

  const getTransformOrigin = useCallback((origin: 'left' | 'right' | 'center') => {
    if (origin === 'center') return 'transform-origin-center';
    const actualOrigin = isRTL && origin === 'left' ? 'right' :
                         isRTL && origin === 'right' ? 'left' : origin;
    return `transform-origin-${actualOrigin}`;
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

    return `${baseClasses} ${iconSpacing}`;
  }, [isRTL, spacing]);

  const getIconPosition = useCallback((position: 'start' | 'end') => {
    const actualPosition = position === 'start'
      ? (isRTL ? 'right-0 pr-3' : 'left-0 pl-3')
      : (isRTL ? 'left-0 pl-3' : 'right-0 pr-3');
    return `absolute inset-y-0 flex items-center pointer-events-none ${actualPosition}`;
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
    
    return baseClasses.split(' ').map(cls => `${rtlModifier}${cls}`).join(' ');
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
};