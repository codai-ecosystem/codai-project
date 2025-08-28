# Design System & Visual Language

## Overview

A unified design system for CODAI's cinematic scrollytelling experience, designed for maximum visual impact while maintaining accessibility and performance standards.

---

## Typography Scale

### Font Stack
```css
--font-primary: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
--font-display: 'Inter Display', 'Inter', sans-serif; /* For headlines */
```

### Type Scale (Fluid Typography)
```css
/* Headlines - Cinematic Scale */
--text-hero: clamp(3.5rem, 8vw, 8rem);        /* 56px → 128px */
--text-h1: clamp(2.5rem, 5vw, 4.5rem);       /* 40px → 72px */
--text-h2: clamp(2rem, 4vw, 3.5rem);         /* 32px → 56px */
--text-h3: clamp(1.5rem, 3vw, 2.5rem);       /* 24px → 40px */
--text-h4: clamp(1.25rem, 2.5vw, 2rem);      /* 20px → 32px */

/* Body Text */
--text-xl: clamp(1.25rem, 2vw, 1.5rem);      /* 20px → 24px */
--text-lg: clamp(1.125rem, 1.5vw, 1.25rem);  /* 18px → 20px */
--text-base: clamp(1rem, 1vw, 1.125rem);     /* 16px → 18px */
--text-sm: clamp(0.875rem, 0.8vw, 1rem);     /* 14px → 16px */
--text-xs: clamp(0.75rem, 0.6vw, 0.875rem);  /* 12px → 14px */

/* Micro Text */
--text-micro: 0.6875rem; /* 11px - Fixed for UI elements */
```

### Font Weights & Line Heights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;

--leading-tight: 1.1;    /* Headlines */
--leading-snug: 1.3;     /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.6;  /* Long form content */
```

---

## Color System

### Base Palette (Neutral Foundation)
```css
/* Light Mode */
--gray-50: #fafafa;
--gray-100: #f4f4f5;
--gray-200: #e4e4e7;
--gray-300: #d4d4d8;
--gray-400: #a1a1aa;
--gray-500: #71717a;
--gray-600: #52525b;
--gray-700: #3f3f46;
--gray-800: #27272a;
--gray-900: #18181b;
--gray-950: #09090b;

/* Dark Mode */
--dark-50: #fafafa;
--dark-100: #f4f4f5;
--dark-200: #e4e4e7;
--dark-300: #d4d4d8;
--dark-400: #a1a1aa;
--dark-500: #71717a;
--dark-600: #52525b;
--dark-700: #3f3f46;
--dark-800: #18181b;
--dark-900: #0a0a0a;
--dark-950: #000000;
```

### Chapter-Specific Color Palettes

#### Chapter 1: INTRO - Ethereal
```css
--intro-primary: #8b5cf6;      /* Purple-500 */
--intro-secondary: #a78bfa;    /* Purple-400 */
--intro-accent: #c084fc;       /* Purple-300 */
--intro-gradient: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
--intro-glow: rgba(139, 92, 246, 0.3);
```

#### Chapter 2: FOUNDATION - Professional Trust
```css
--foundation-primary: #3b82f6;    /* Blue-500 */
--foundation-secondary: #60a5fa;  /* Blue-400 */
--foundation-accent: #93c5fd;     /* Blue-300 */
--foundation-gradient: linear-gradient(135deg, #1e40af, #3b82f6, #6366f1);
--foundation-glow: rgba(59, 130, 246, 0.25);
```

#### Chapter 3: REVOLUTION - Bold Energy
```css
--revolution-primary: #ef4444;    /* Red-500 */
--revolution-secondary: #f87171;  /* Red-400 */
--revolution-accent: #fca5a5;     /* Red-300 */
--revolution-gradient: linear-gradient(135deg, #dc2626, #ef4444, #f97316);
--revolution-glow: rgba(239, 68, 68, 0.3);
```

#### Chapter 4: INFRASTRUCTURE - Technical Precision
```css
--infrastructure-primary: #6b7280;    /* Gray-500 */
--infrastructure-secondary: #9ca3af;  /* Gray-400 */
--infrastructure-accent: #d1d5db;     /* Gray-300 */
--infrastructure-gradient: linear-gradient(135deg, #374151, #6b7280, #1f2937);
--infrastructure-glow: rgba(107, 114, 128, 0.2);
```

#### Chapter 5: DEVELOPERS - Creative Coding
```css
--developers-primary: #10b981;    /* Emerald-500 */
--developers-secondary: #34d399;  /* Emerald-400 */
--developers-accent: #6ee7b7;     /* Emerald-300 */
--developers-gradient: linear-gradient(135deg, #059669, #10b981, #06b6d4);
--developers-glow: rgba(16, 185, 129, 0.25);
```

#### Chapter 6: FINANCE - Luxury Gold
```css
--finance-primary: #f59e0b;    /* Amber-500 */
--finance-secondary: #fbbf24;  /* Amber-400 */
--finance-accent: #fcd34d;     /* Amber-300 */
--finance-gradient: linear-gradient(135deg, #d97706, #f59e0b, #eab308);
--finance-glow: rgba(245, 158, 11, 0.3);
```

#### Chapter 7: BLOCKCHAIN - Crypto Blue
```css
--blockchain-primary: #06b6d4;    /* Cyan-500 */
--blockchain-secondary: #22d3ee;  /* Cyan-400 */
--blockchain-accent: #67e8f9;     /* Cyan-300 */
--blockchain-gradient: linear-gradient(135deg, #0891b2, #06b6d4, #3b82f6);
--blockchain-glow: rgba(6, 182, 212, 0.25);
```

#### Chapter 8: SOCIETY - Human Warmth
```css
--society-primary: #f97316;    /* Orange-500 */
--society-secondary: #fb923c;  /* Orange-400 */
--society-accent: #fdba74;     /* Orange-300 */
--society-gradient: linear-gradient(135deg, #ea580c, #f97316, #fbbf24);
--society-glow: rgba(249, 115, 22, 0.25);
```

#### Chapter 9: CREATIVITY - Artistic Purple
```css
--creativity-primary: #a855f7;    /* Purple-500 */
--creativity-secondary: #c084fc;  /* Purple-400 */
--creativity-accent: #d8b4fe;     /* Purple-300 */
--creativity-gradient: linear-gradient(135deg, #9333ea, #a855f7, #ec4899);
--creativity-glow: rgba(168, 85, 247, 0.3);
```

#### Chapter 10: LIFESTYLE - Natural Green
```css
--lifestyle-primary: #22c55e;    /* Green-500 */
--lifestyle-secondary: #4ade80;  /* Green-400 */
--lifestyle-accent: #86efac;     /* Green-300 */
--lifestyle-gradient: linear-gradient(135deg, #16a34a, #22c55e, #65a30d);
--lifestyle-glow: rgba(34, 197, 94, 0.25);
```

#### Chapter 11: CONSTELLATION - Cosmic Deep
```css
--constellation-primary: #1e1b4b;    /* Indigo-900 */
--constellation-secondary: #3730a3;  /* Indigo-700 */
--constellation-accent: #6366f1;     /* Indigo-500 */
--constellation-gradient: linear-gradient(135deg, #0f0f23, #1e1b4b, #312e81);
--constellation-glow: rgba(99, 102, 241, 0.4);
```

#### Chapter 12: FUTURE - Success Green
```css
--future-primary: #059669;    /* Emerald-600 */
--future-secondary: #10b981;  /* Emerald-500 */
--future-accent: #34d399;     /* Emerald-400 */
--future-gradient: linear-gradient(135deg, #047857, #059669, #0891b2);
--future-glow: rgba(5, 150, 105, 0.3);
```

---

## Spacing Scale

### Base Units
```css
--space-px: 1px;
--space-0: 0;
--space-0_5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1_5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2_5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3_5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-11: 2.75rem;    /* 44px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-28: 7rem;       /* 112px */
--space-32: 8rem;       /* 128px */
--space-36: 9rem;       /* 144px */
--space-40: 10rem;      /* 160px */
--space-44: 11rem;      /* 176px */
--space-48: 12rem;      /* 192px */
--space-52: 13rem;      /* 208px */
--space-56: 14rem;      /* 224px */
--space-60: 15rem;      /* 240px */
--space-64: 16rem;      /* 256px */
--space-72: 18rem;      /* 288px */
--space-80: 20rem;      /* 320px */
--space-96: 24rem;      /* 384px */
```

### Contextual Spacing
```css
/* Layout */
--layout-padding: clamp(1rem, 5vw, 6rem);
--layout-margin: clamp(2rem, 8vw, 12rem);
--section-gap: clamp(4rem, 12vw, 16rem);
--chapter-gap: clamp(6rem, 15vw, 20rem);

/* Components */
--component-padding: clamp(1rem, 3vw, 2rem);
--component-gap: clamp(0.5rem, 2vw, 1.5rem);
--button-padding: clamp(0.75rem, 2vw, 1.25rem);
```

---

## Border Radius & Shadows

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-3xl: 2rem;      /* 32px */
--radius-full: 9999px;   /* Full round */
```

### Shadows
```css
/* Elevation System */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Glow Effects */
--glow-sm: 0 0 10px var(--current-glow, rgba(139, 92, 246, 0.3));
--glow-md: 0 0 20px var(--current-glow, rgba(139, 92, 246, 0.4));
--glow-lg: 0 0 30px var(--current-glow, rgba(139, 92, 246, 0.5));
```

---

## Motion System

### Timing Functions
```css
/* Easing Curves */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Custom Curves */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-back: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-circ: cubic-bezier(0.85, 0, 0.15, 1);
--ease-expo: cubic-bezier(0.95, 0.05, 0.795, 0.035);
```

### Duration Scale
```css
--duration-75: 75ms;     /* Micro interactions */
--duration-100: 100ms;   /* Hover effects */
--duration-150: 150ms;   /* Button clicks */
--duration-200: 200ms;   /* Small animations */
--duration-300: 300ms;   /* Medium animations */
--duration-500: 500ms;   /* Large animations */
--duration-700: 700ms;   /* Chapter transitions */
--duration-1000: 1000ms; /* Section reveals */
--duration-1500: 1500ms; /* Dramatic effects */
--duration-2000: 2000ms; /* Long storytelling */
```

### Animation Presets
```css
/* Fade Animations */
--anim-fade-in: opacity var(--duration-300) var(--ease-out);
--anim-fade-out: opacity var(--duration-200) var(--ease-in);

/* Transform Animations */
--anim-slide-up: transform var(--duration-500) var(--ease-out);
--anim-slide-down: transform var(--duration-500) var(--ease-out);
--anim-scale-in: transform var(--duration-300) var(--ease-back);
--anim-scale-out: transform var(--duration-200) var(--ease-in);

/* Complex Animations */
--anim-morph: all var(--duration-700) var(--ease-elastic);
--anim-float: transform var(--duration-2000) var(--ease-in-out) infinite alternate;
```

---

## Grid System

### Container Widths
```css
--container-xs: 20rem;    /* 320px */
--container-sm: 24rem;    /* 384px */
--container-md: 28rem;    /* 448px */
--container-lg: 32rem;    /* 512px */
--container-xl: 36rem;    /* 576px */
--container-2xl: 42rem;   /* 672px */
--container-3xl: 48rem;   /* 768px */
--container-4xl: 56rem;   /* 896px */
--container-5xl: 64rem;   /* 1024px */
--container-6xl: 72rem;   /* 1152px */
--container-7xl: 80rem;   /* 1280px */
--container-full: 100%;
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
--bp-xs: 475px;   /* Small phones */
--bp-sm: 640px;   /* Large phones */
--bp-md: 768px;   /* Tablets */
--bp-lg: 1024px;  /* Small laptops */
--bp-xl: 1280px;  /* Large laptops */
--bp-2xl: 1536px; /* Desktops */
```

---

## Component Styles

### Buttons
```css
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 text-base font-medium 
         rounded-lg transition-all duration-200 ease-out
         bg-current text-white hover:shadow-lg hover:scale-105 active:scale-95;
  background: var(--current-gradient);
  box-shadow: var(--glow-sm);
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-6 py-3 text-base font-medium 
         rounded-lg transition-all duration-200 ease-out border-2
         border-current text-current hover:bg-current hover:text-white;
}

.btn-ghost {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium 
         rounded-md transition-all duration-150 ease-out
         text-current hover:bg-current hover:bg-opacity-10;
}
```

### Cards
```css
.card {
  @apply bg-white dark:bg-gray-900 rounded-xl shadow-md 
         border border-gray-200 dark:border-gray-700
         transition-all duration-300 ease-out
         hover:shadow-xl hover:-translate-y-1;
}

.card-glow {
  @apply card;
  box-shadow: var(--shadow-lg), var(--glow-sm);
}
```

### Input Fields
```css
.input {
  @apply w-full px-4 py-3 text-base rounded-lg border border-gray-300 
         dark:border-gray-600 bg-white dark:bg-gray-800
         text-gray-900 dark:text-gray-100 placeholder-gray-500
         focus:ring-2 focus:ring-current focus:border-transparent
         transition-all duration-200 ease-out;
}
```

---

## Dark Mode System

### Color Overrides
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Override light mode colors */
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-400);
    --bg-primary: var(--gray-900);
    --bg-secondary: var(--gray-800);
    --border-color: var(--gray-700);
  }
}

[data-theme="dark"] {
  /* Manual dark mode toggle */
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-400);
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --border-color: var(--gray-700);
}
```

---

## Accessibility Features

### Focus States
```css
.focus-visible {
  @apply outline-none ring-2 ring-offset-2 ring-current ring-offset-white 
         dark:ring-offset-gray-900 transition-all duration-150;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-75: 0ms;
    --duration-100: 0ms;
    --duration-150: 0ms;
    --duration-200: 0ms;
    --duration-300: 0ms;
    --duration-500: 100ms;
    --duration-700: 150ms;
    --duration-1000: 200ms;
    --duration-1500: 250ms;
    --duration-2000: 300ms;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --border-width: 2px;
    --outline-width: 3px;
  }
  
  .btn-primary {
    border: 2px solid currentColor;
  }
}
```

## Usage Guidelines

### Chapter Theme Activation
```typescript
// Activate chapter theme
function activateChapterTheme(chapterName: string) {
  document.documentElement.style.setProperty('--current-primary', `var(--${chapterName}-primary)`);
  document.documentElement.style.setProperty('--current-gradient', `var(--${chapterName}-gradient)`);
  document.documentElement.style.setProperty('--current-glow', `var(--${chapterName}-glow)`);
}
```

### Responsive Design Patterns
```css
/* Mobile-first responsive text */
.responsive-text {
  font-size: clamp(var(--text-lg), 4vw, var(--text-xl));
  line-height: var(--leading-normal);
}

/* Flexible spacing */
.responsive-spacing {
  padding: clamp(var(--space-4), 5vw, var(--space-12));
  margin: clamp(var(--space-8), 8vw, var(--space-20)) 0;
}
```

This design system provides a comprehensive foundation for the CODAI scrollytelling experience while maintaining flexibility, accessibility, and visual consistency across all chapters.