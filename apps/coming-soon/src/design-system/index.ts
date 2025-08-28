/**
 * CODAI Design System - Main Export
 * 
 * Central export for the complete CODAI design system
 * providing colors, typography, animations, and component styles
 * following 2025 best practices and accessibility standards.
 */

// Core Design System
export * from './colors';
export * from './typography';
export * from './animations';
export * from './components';

// Re-export key utilities for convenience
export {
    colors,
    semanticColors,
    gradients,
    shadows,
    colorUtils,
} from './colors';

export {
    fontFamilies,
    fontWeights,
    fontSizes,
    responsiveFontSizes,
    typographyStyles,
    typographyPresets,
    typographyUtils,
} from './typography';

export {
    durations,
    easings,
    springs,
    motionVariants,
    animationPresets,
    animationUtils,
} from './animations';

export {
    spacing,
    borderRadius,
    zIndex,
    componentStyles,
    layoutUtils,
    mediaQueries,
} from './components';

// Design System Configuration
export const designSystemConfig = {
    name: 'CODAI Design System',
    version: '1.0.0',
    description: 'Modern, accessible design system for AI/Tech applications',

    // Core principles
    principles: [
        'Mobile-first responsive design',
        'Performance optimization',
        'Accessibility compliance (WCAG 2.1 AA)',
        'Consistent visual hierarchy',
        'Professional AI/Tech aesthetic',
    ],

    // Supported breakpoints
    breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },

    // Performance targets
    performance: {
        maxBundleSize: '300KB',
        targetLighthouseScore: 90,
        firstContentfulPaint: '1.5s',
        largestContentfulPaint: '2.5s',
        cumulativeLayoutShift: '0.1',
    },

    // Accessibility standards
    accessibility: {
        wcagLevel: 'AA',
        colorContrast: '4.5:1',
        touchTargetSize: '44px',
        keyboardNavigation: true,
        screenReaderSupport: true,
    },
} as const;

// Design Token Categories
export const tokenCategories = {
    color: 'Colors, gradients, and shadows',
    typography: 'Font families, sizes, weights, and styles',
    spacing: 'Margins, padding, and layout spacing',
    animation: 'Durations, easings, and motion',
    component: 'Pre-built component styles',
    layout: 'Grid, flexbox, and positioning utilities',
} as const;

// Usage Examples
export const usageExamples = {
    colors: {
        primary: 'colors.primary[500]',
        text: 'semanticColors.text.heading',
        gradient: 'gradients.ai.main',
    },
    typography: {
        heading: 'typographyPresets.heroTitle',
        body: 'typographyStyles.body.base',
        responsive: 'responsiveFontSizes.h1',
    },
    animations: {
        entrance: 'animationPresets.entrance.fadeInUp',
        hover: 'animationPresets.hover.lift',
        spring: 'springs.gentle',
    },
    components: {
        button: 'componentStyles.button.variants.primary',
        card: 'componentStyles.card.interactive',
        layout: 'layoutUtils.flex.center',
    },
} as const;

export type DesignSystemConfig = typeof designSystemConfig;
export type TokenCategories = typeof tokenCategories;
export type UsageExamples = typeof usageExamples;