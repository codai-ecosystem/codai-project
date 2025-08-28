/**
 * CODAI Design System - Component Styles & Utilities
 * 
 * Shared component styles and utilities for consistent UI:
 * - Reusable component patterns and variants
 * - Layout utilities and spacing system
 * - Interactive states and focus management
 * - Component composition utilities
 */

import { colors, semanticColors, gradients, shadows } from './colors';
import { typographyStyles, typographyPresets } from './typography';
import { durations, easings, springs } from './animations';

// Spacing Scale - Based on 4px grid system
export const spacing = {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
} as const;

// Border Radius System
export const borderRadius = {
    none: '0',
    sm: '0.125rem',     // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
} as const;

// Z-Index Scale
export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
} as const;

// Component Base Styles
export const componentStyles = {
    // Container styles
    container: {
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: spacing[4],
        paddingRight: spacing[4],
    },

    // Section styles
    section: {
        paddingTop: spacing[20],
        paddingBottom: spacing[20],

        // Responsive padding
        '@media (min-width: 768px)': {
            paddingTop: spacing[24],
            paddingBottom: spacing[24],
        },

        '@media (min-width: 1024px)': {
            paddingTop: spacing[32],
            paddingBottom: spacing[32],
        },
    },

    // Card styles
    card: {
        base: {
            backgroundColor: semanticColors.background.card,
            borderRadius: borderRadius.lg,
            border: `1px solid ${semanticColors.border.default}`,
            boxShadow: shadows.card.md,
            padding: spacing[6],
            transition: `all ${durations.normal}s ${easings.smooth}`,
        },

        hover: {
            borderColor: semanticColors.border.hover,
            boxShadow: shadows.card.lg,
            transform: 'translateY(-2px)',
        },

        interactive: {
            cursor: 'pointer',
            '&:hover': {
                borderColor: semanticColors.border.hover,
                boxShadow: shadows.card.lg,
                transform: 'translateY(-2px)',
            },
            '&:active': {
                transform: 'translateY(0)',
                boxShadow: shadows.card.md,
            },
        },
    },

    // Button styles
    button: {
        base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.md,
            fontWeight: typographyStyles.button.base.fontWeight,
            fontSize: typographyStyles.button.base.fontSize,
            lineHeight: typographyStyles.button.base.lineHeight,
            letterSpacing: typographyStyles.button.base.letterSpacing,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: `all ${durations.fast}s ${easings.smooth}`,
            border: 'none',
            outline: 'none',
            userSelect: 'none' as const,
            touchAction: 'manipulation',

            // Focus styles
            '&:focus-visible': {
                outline: `2px solid ${semanticColors.interactive.primary}`,
                outlineOffset: '2px',
            },
        },

        // Size variants
        sizes: {
            small: {
                height: spacing[8],
                paddingLeft: spacing[3],
                paddingRight: spacing[3],
                minWidth: spacing[16],
                fontSize: typographyStyles.button.small.fontSize,
            },

            medium: {
                height: spacing[10],
                paddingLeft: spacing[4],
                paddingRight: spacing[4],
                minWidth: spacing[20],
                fontSize: typographyStyles.button.base.fontSize,
            },

            large: {
                height: spacing[12],
                paddingLeft: spacing[6],
                paddingRight: spacing[6],
                minWidth: spacing[24],
                fontSize: typographyStyles.button.large.fontSize,
            },
        },

        // Style variants
        variants: {
            primary: {
                backgroundColor: semanticColors.interactive.primary,
                color: colors.text.primary,
                boxShadow: shadows.button.default,

                '&:hover': {
                    backgroundColor: semanticColors.interactive.primaryHover,
                    boxShadow: shadows.button.hover,
                    transform: 'translateY(-1px)',
                },

                '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: shadows.button.active,
                },

                '&:disabled': {
                    backgroundColor: colors.gray[600],
                    color: colors.text.disabled,
                    cursor: 'not-allowed',
                    transform: 'none',
                    boxShadow: 'none',
                },
            },

            secondary: {
                backgroundColor: 'transparent',
                color: semanticColors.interactive.secondary,
                border: `1px solid ${semanticColors.interactive.secondary}`,

                '&:hover': {
                    backgroundColor: semanticColors.interactive.secondary,
                    color: colors.text.primary,
                    transform: 'translateY(-1px)',
                },

                '&:active': {
                    transform: 'translateY(0)',
                },

                '&:disabled': {
                    borderColor: colors.border.primary,
                    color: colors.text.disabled,
                    cursor: 'not-allowed',
                    transform: 'none',
                },
            },

            ghost: {
                backgroundColor: 'transparent',
                color: colors.text.secondary,

                '&:hover': {
                    backgroundColor: colors.gray[800],
                    color: colors.text.primary,
                },

                '&:active': {
                    backgroundColor: colors.gray[700],
                },

                '&:disabled': {
                    color: colors.text.disabled,
                    cursor: 'not-allowed',
                },
            },
        },
    },

    // Input styles
    input: {
        base: {
            width: '100%',
            height: spacing[10],
            paddingLeft: spacing[3],
            paddingRight: spacing[3],
            borderRadius: borderRadius.md,
            border: `1px solid ${semanticColors.border.default}`,
            backgroundColor: colors.background.card,
            color: colors.text.primary,
            fontSize: typographyStyles.body.base.fontSize,
            lineHeight: typographyStyles.body.base.lineHeight,
            transition: `all ${durations.fast}s ${easings.smooth}`,

            '&::placeholder': {
                color: colors.text.muted,
            },

            '&:focus': {
                outline: 'none',
                borderColor: semanticColors.interactive.primary,
                boxShadow: shadows.focus,
            },

            '&:disabled': {
                backgroundColor: colors.gray[800],
                color: colors.text.disabled,
                cursor: 'not-allowed',
            },

            '&:invalid': {
                borderColor: colors.error[500],
            },
        },

        sizes: {
            small: {
                height: spacing[8],
                fontSize: typographyStyles.body.small.fontSize,
            },

            medium: {
                height: spacing[10],
                fontSize: typographyStyles.body.base.fontSize,
            },

            large: {
                height: spacing[12],
                fontSize: typographyStyles.body.large.fontSize,
            },
        },
    },

    // Navigation styles
    navigation: {
        base: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${colors.border.primary}`,
            position: 'sticky' as const,
            top: 0,
            zIndex: zIndex.sticky,
            transition: `all ${durations.normal}s ${easings.smooth}`,
        },

        item: {
            display: 'flex',
            alignItems: 'center',
            height: spacing[12],
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
            color: colors.text.secondary,
            textDecoration: 'none',
            fontSize: typographyPresets.navItem.fontSize,
            fontWeight: typographyPresets.navItem.fontWeight,
            letterSpacing: typographyPresets.navItem.letterSpacing,
            transition: `all ${durations.fast}s ${easings.smooth}`,

            '&:hover': {
                color: colors.text.primary,
                backgroundColor: colors.gray[800],
            },

            '&:focus-visible': {
                outline: `2px solid ${semanticColors.interactive.primary}`,
                outlineOffset: '2px',
            },

            // Active state
            '&.active': {
                color: semanticColors.interactive.primary,
                backgroundColor: `${semanticColors.interactive.primary}20`,
            },
        },

        mobileMenu: {
            backgroundColor: colors.background.card,
            border: `1px solid ${colors.border.primary}`,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.card.xl,
            padding: spacing[2],
        },
    },

    // Footer styles
    footer: {
        base: {
            backgroundColor: colors.background.secondary,
            borderTop: `1px solid ${colors.border.primary}`,
            paddingTop: spacing[16],
            paddingBottom: spacing[8],
        },

        section: {
            marginBottom: spacing[8],
        },

        heading: {
            ...typographyPresets.footerHeading,
            marginBottom: spacing[4],
        },

        link: {
            ...typographyPresets.footerText,
            textDecoration: 'none',
            transition: `color ${durations.fast}s ${easings.smooth}`,

            '&:hover': {
                color: colors.text.secondary,
            },
        },
    },

    // Badge/Tag styles
    badge: {
        base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: spacing[6],
            paddingLeft: spacing[2],
            paddingRight: spacing[2],
            borderRadius: borderRadius.full,
            fontSize: typographyStyles.overline.fontSize,
            fontWeight: typographyStyles.overline.fontWeight,
            letterSpacing: typographyStyles.overline.letterSpacing,
            textTransform: 'uppercase' as const,
        },

        variants: {
            primary: {
                backgroundColor: semanticColors.interactive.primary,
                color: colors.text.primary,
            },

            secondary: {
                backgroundColor: colors.gray[700],
                color: colors.text.secondary,
            },

            success: {
                backgroundColor: colors.success[500],
                color: colors.text.primary,
            },

            warning: {
                backgroundColor: colors.warning[500],
                color: colors.background.primary,
            },

            error: {
                backgroundColor: colors.error[500],
                color: colors.text.primary,
            },
        },
    },

    // Loading states
    loading: {
        spinner: {
            width: spacing[6],
            height: spacing[6],
            border: `2px solid ${colors.gray[700]}`,
            borderTop: `2px solid ${semanticColors.interactive.primary}`,
            borderRadius: borderRadius.full,
            animation: `spin ${durations.slowest}s ${easings.linear} infinite`,
        },

        skeleton: {
            backgroundColor: colors.gray[800],
            borderRadius: borderRadius.md,
            background: `linear-gradient(90deg, ${colors.gray[800]} 25%, ${colors.gray[700]} 50%, ${colors.gray[800]} 75%)`,
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ${easings.smooth} infinite`,
        },
    },

    // Overlay styles
    overlay: {
        base: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background.overlay,
            backdropFilter: 'blur(4px)',
            zIndex: zIndex.overlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },

        modal: {
            backgroundColor: colors.background.card,
            borderRadius: borderRadius.xl,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: shadows.card.xl,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
        },
    },
} as const;

// Layout utilities
export const layoutUtils = {
    // Flexbox utilities
    flex: {
        center: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },

        between: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        column: {
            display: 'flex',
            flexDirection: 'column' as const,
        },

        columnCenter: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
        },
    },

    // Grid utilities
    grid: {
        responsive: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: spacing[6],

            '@media (min-width: 768px)': {
                gridTemplateColumns: 'repeat(2, 1fr)',
            },

            '@media (min-width: 1024px)': {
                gridTemplateColumns: 'repeat(3, 1fr)',
            },
        },

        autoFit: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing[6],
        },
    },

    // Position utilities
    position: {
        absoluteCenter: {
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        },

        fixedCenter: {
            position: 'fixed' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        },
    },

    // Accessibility utilities
    accessibility: {
        visuallyHidden: {
            position: 'absolute' as const,
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap' as const,
            borderWidth: '0',
        },

        focusVisible: {
            '&:focus-visible': {
                outline: `2px solid ${semanticColors.interactive.primary}`,
                outlineOffset: '2px',
            },
        },

        skipLink: {
            position: 'absolute' as const,
            top: '-40px',
            left: '6px',
            backgroundColor: semanticColors.interactive.primary,
            color: colors.text.primary,
            padding: `${spacing[2]} ${spacing[4]}`,
            textDecoration: 'none',
            zIndex: zIndex.skipLink,

            '&:focus': {
                top: '6px',
            },
        },
    },
} as const;

// Animation keyframes for CSS animations
export const keyframes = {
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },

    '@keyframes shimmer': {
        '0%': { backgroundPosition: '200% 0' },
        '100%': { backgroundPosition: '-200% 0' },
    },

    '@keyframes fadeIn': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
    },

    '@keyframes slideInUp': {
        '0%': { opacity: '0', transform: 'translateY(2rem)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
    },

    '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
    },
} as const;

// Media queries
export const mediaQueries = {
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',

    // Touch device detection
    touch: '@media (pointer: coarse)',
    hover: '@media (hover: hover)',

    // Motion preferences
    reduceMotion: '@media (prefers-reduced-motion: reduce)',
    allowMotion: '@media (prefers-reduced-motion: no-preference)',

    // Color scheme preferences
    darkMode: '@media (prefers-color-scheme: dark)',
    lightMode: '@media (prefers-color-scheme: light)',
} as const;

// Export types
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type ZIndex = typeof zIndex;
export type ComponentStyles = typeof componentStyles;
export type LayoutUtils = typeof layoutUtils;