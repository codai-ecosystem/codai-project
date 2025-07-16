// Advanced Design System Core
export class AdvancedDesignSystem {
  constructor() {
    this.themes = new Map();
    this.components = new Map();
    this.tokens = new Map();
    this.adaptations = new Map();
  }
  
  async initialize() {
    console.log('🎨 Initializing Advanced Design System...');
    
    // Load design tokens
    await this.loadDesignTokens();
    
    // Setup theme system
    await this.initializeThemeSystem();
    
    // Register components
    await this.registerComponents();
    
    // Setup adaptive behavior
    await this.initializeAdaptiveBehavior();
    
    console.log('✅ Design System ready');
  }
  
  async loadDesignTokens() {
    const tokens = {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        adaptive: {
          surface: 'var(--surface)',
          text: 'var(--text)',
          border: 'var(--border)'
        }
      },
      
      typography: {
        fonts: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
          serif: ['Merriweather', 'serif']
        },
        scales: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        }
      },
      
      spacing: {
        px: '1px',
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem'
      },
      
      animations: {
        subtle: {
          duration: '150ms',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        smooth: {
          duration: '300ms',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        bouncy: {
          duration: '500ms',
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
      }
    };
    
    this.tokens.set('core', tokens);
  }
  
  async initializeThemeSystem() {
    const themes = {
      light: {
        name: 'Light',
        variables: {
          '--surface': '#ffffff',
          '--surface-secondary': '#f8fafc',
          '--text': '#0f172a',
          '--text-secondary': '#64748b',
          '--border': '#e2e8f0'
        }
      },
      
      dark: {
        name: 'Dark',
        variables: {
          '--surface': '#0f172a',
          '--surface-secondary': '#1e293b',
          '--text': '#f8fafc',
          '--text-secondary': '#94a3b8',
          '--border': '#334155'
        }
      },
      
      system: {
        name: 'System',
        adaptive: true,
        variables: {
          light: {
            '--surface': '#ffffff',
            '--text': '#0f172a'
          },
          dark: {
            '--surface': '#0f172a',
            '--text': '#f8fafc'
          }
        }
      },
      
      highContrast: {
        name: 'High Contrast',
        accessibility: true,
        variables: {
          '--surface': '#000000',
          '--text': '#ffffff',
          '--border': '#ffffff'
        }
      }
    };
    
    for (const [themeId, theme] of Object.entries(themes)) {
      this.themes.set(themeId, theme);
    }
  }
  
  async registerComponents() {
    const componentRegistry = {
      'Button': {
        variants: ['primary', 'secondary', 'ghost', 'destructive'],
        sizes: ['sm', 'md', 'lg'],
        states: ['default', 'hover', 'active', 'disabled'],
        accessibility: ['keyboard-navigation', 'screen-reader', 'high-contrast']
      },
      
      'Input': {
        types: ['text', 'email', 'password', 'number', 'search'],
        states: ['default', 'focus', 'error', 'disabled'],
        features: ['validation', 'autocomplete', 'assistive-text']
      },
      
      'Card': {
        variants: ['elevated', 'outlined', 'filled'],
        interactions: ['hover', 'click', 'focus'],
        responsive: ['mobile', 'tablet', 'desktop']
      },
      
      'Modal': {
        types: ['dialog', 'drawer', 'popover', 'tooltip'],
        behaviors: ['focus-trap', 'escape-close', 'backdrop-close'],
        animations: ['fade', 'scale', 'slide']
      },
      
      'DataTable': {
        features: ['sorting', 'filtering', 'pagination', 'selection'],
        virtualization: true,
        accessibility: ['keyboard-navigation', 'screen-reader-support']
      }
    };
    
    for (const [componentName, config] of Object.entries(componentRegistry)) {
      this.components.set(componentName, {
        ...config,
        tokens: this.getComponentTokens(componentName),
        specifications: this.generateComponentSpecs(componentName, config)
      });
    }
  }
  
  getComponentTokens(componentName) {
    const baseTokens = this.tokens.get('core');
    
    return {
      spacing: baseTokens.spacing,
      colors: baseTokens.colors,
      typography: baseTokens.typography,
      animations: baseTokens.animations
    };
  }
  
  generateComponentSpecs(componentName, config) {
    return {
      cssVariables: this.generateCSSVariables(componentName),
      responsiveBreakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      accessibilityRequirements: this.getAccessibilityRequirements(componentName),
      performanceTargets: {
        firstPaint: '100ms',
        interaction: '16ms',
        bundleSize: '10kb'
      }
    };
  }
  
  generateCSSVariables(componentName) {
    const prefix = componentName.toLowerCase();
    
    return {
      [`--${prefix}-bg`]: 'var(--surface)',
      [`--${prefix}-text`]: 'var(--text)',
      [`--${prefix}-border`]: 'var(--border)',
      [`--${prefix}-hover`]: 'var(--surface-secondary)',
      [`--${prefix}-focus`]: 'var(--primary-500)',
      [`--${prefix}-disabled`]: 'var(--text-secondary)'
    };
  }
  
  getAccessibilityRequirements(componentName) {
    const requirements = {
      'Button': [
        'ARIA label or text content',
        'Keyboard navigation (Enter/Space)',
        'Focus indicator',
        'High contrast support',
        'Screen reader compatibility'
      ],
      'Input': [
        'Label association',
        'Error state announcement',
        'Validation feedback',
        'Placeholder text accessibility',
        'Required field indication'
      ],
      'Modal': [
        'Focus management',
        'Escape key handling',
        'ARIA role and properties',
        'Content accessibility',
        'Background interaction prevention'
      ]
    };
    
    return requirements[componentName] || ['Basic accessibility compliance'];
  }
  
  async applyTheme(themeId, element = document.documentElement) {
    const theme = this.themes.get(themeId);
    if (!theme) return;
    
    if (theme.adaptive && themeId === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const variables = prefersDark ? theme.variables.dark : theme.variables.light;
      
      for (const [property, value] of Object.entries(variables)) {
        element.style.setProperty(property, value);
      }
    } else {
      for (const [property, value] of Object.entries(theme.variables)) {
        element.style.setProperty(property, value);
      }
    }
    
    // Trigger theme change event
    element.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: themeId }
    }));
  }
  
  async generateComponentCSS(componentName) {
    const component = this.components.get(componentName);
    if (!component) return '';
    
    const css = [];
    
    // Base styles
    css.push(`
      .${componentName.toLowerCase()} {
        ${Object.entries(component.tokens.cssVariables || {})
          .map(([prop, value]) => `${prop}: ${value};`)
          .join('\n        ')}
      }
    `);
    
    // Variant styles
    if (component.variants) {
      component.variants.forEach(variant => {
        css.push(`
          .${componentName.toLowerCase()}--${variant} {
            /* ${variant} variant styles */
          }
        `);
      });
    }
    
    // Responsive styles
    if (component.responsive) {
      component.responsive.forEach(breakpoint => {
        css.push(`
          @media (min-width: var(--breakpoint-${breakpoint})) {
            .${componentName.toLowerCase()} {
              /* ${breakpoint} responsive styles */
            }
          }
        `);
      });
    }
    
    return css.join('\n');
  }
}

export default AdvancedDesignSystem;
