// Dynamic Theming Engine - Advanced Theme Management
export class DynamicThemingEngine {
  constructor() {
    this.themes = new Map();
    this.activeTheme = null;
    this.observers = new Set();
    this.preferences = new Map();
  }
  
  async initializeTheming() {
    console.log('🎨 Initializing Dynamic Theming Engine...');
    
    // Setup theme detection
    await this.setupThemeDetection();
    
    // Load custom themes
    await this.loadCustomThemes();
    
    // Initialize user preferences
    await this.loadUserPreferences();
    
    // Setup auto-switching
    await this.setupAutoSwitching();
    
    console.log('✅ Dynamic Theming Engine ready');
  }
  
  async setupThemeDetection() {
    // System theme detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.preferences.get('theme-mode') === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // High contrast detection
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.applyAccessibilityEnhancements();
      }
    });
    
    // Reduced motion detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.reduceAnimations();
      }
    });
  }
  
  async loadCustomThemes() {
    const customThemes = {
      'oceanic': {
        name: 'Oceanic',
        colors: {
          primary: '#00d4aa',
          secondary: '#0084ff',
          background: '#263238',
          surface: '#37474f',
          text: '#eeffff'
        },
        personality: 'calm-professional'
      },
      
      'sunset': {
        name: 'Sunset',
        colors: {
          primary: '#ff6b6b',
          secondary: '#ffd93d',
          background: '#2d1b69',
          surface: '#42286e',
          text: '#ffffff'
        },
        personality: 'warm-creative'
      },
      
      'forest': {
        name: 'Forest',
        colors: {
          primary: '#27ae60',
          secondary: '#2ecc71',
          background: '#1b5e20',
          surface: '#2e7d32',
          text: '#e8f5e8'
        },
        personality: 'natural-calming'
      },
      
      'corporate': {
        name: 'Corporate',
        colors: {
          primary: '#1565c0',
          secondary: '#424242',
          background: '#fafafa',
          surface: '#ffffff',
          text: '#212121'
        },
        personality: 'professional-trustworthy'
      }
    };
    
    for (const [themeId, theme] of Object.entries(customThemes)) {
      this.registerTheme(themeId, theme);
    }
  }
  
  registerTheme(themeId, themeConfig) {
    this.themes.set(themeId, {
      ...themeConfig,
      id: themeId,
      cssVariables: this.generateThemeVariables(themeConfig),
      registered: new Date()
    });
  }
  
  generateThemeVariables(themeConfig) {
    const variables = {};
    
    // Color variables
    for (const [colorName, colorValue] of Object.entries(themeConfig.colors)) {
      variables[`--color-${colorName}`] = colorValue;
      
      // Generate color variants
      variables[`--color-${colorName}-50`] = this.lighten(colorValue, 0.95);
      variables[`--color-${colorName}-100`] = this.lighten(colorValue, 0.9);
      variables[`--color-${colorName}-200`] = this.lighten(colorValue, 0.75);
      variables[`--color-${colorName}-300`] = this.lighten(colorValue, 0.6);
      variables[`--color-${colorName}-400`] = this.lighten(colorValue, 0.4);
      variables[`--color-${colorName}-500`] = colorValue;
      variables[`--color-${colorName}-600`] = this.darken(colorValue, 0.1);
      variables[`--color-${colorName}-700`] = this.darken(colorValue, 0.2);
      variables[`--color-${colorName}-800`] = this.darken(colorValue, 0.3);
      variables[`--color-${colorName}-900`] = this.darken(colorValue, 0.4);
    }
    
    return variables;
  }
  
  async applyTheme(themeId) {
    const theme = this.themes.get(themeId);
    if (!theme) return;
    
    // Apply CSS variables
    const root = document.documentElement;
    for (const [property, value] of Object.entries(theme.cssVariables)) {
      root.style.setProperty(property, value);
    }
    
    // Update active theme
    this.activeTheme = themeId;
    
    // Save preference
    this.preferences.set('active-theme', themeId);
    localStorage.setItem('theme-preference', themeId);
    
    // Notify observers
    this.notifyThemeChange(themeId, theme);
    
    // Apply personality-based adjustments
    await this.applyPersonalityAdjustments(theme.personality);
  }
  
  async applyPersonalityAdjustments(personality) {
    const adjustments = {
      'calm-professional': {
        animations: 'subtle',
        spacing: 'comfortable',
        roundness: 'moderate'
      },
      'warm-creative': {
        animations: 'playful',
        spacing: 'cozy',
        roundness: 'rounded'
      },
      'natural-calming': {
        animations: 'organic',
        spacing: 'natural',
        roundness: 'soft'
      },
      'professional-trustworthy': {
        animations: 'minimal',
        spacing: 'precise',
        roundness: 'sharp'
      }
    };
    
    const adjustment = adjustments[personality];
    if (adjustment) {
      await this.applyStyleAdjustments(adjustment);
    }
  }
  
  async setupAutoSwitching() {
    // Time-based auto-switching
    const timeBasedSwitching = this.preferences.get('time-based-switching');
    if (timeBasedSwitching) {
      this.setupTimeBasedSwitching();
    }
    
    // Context-based switching
    const contextBasedSwitching = this.preferences.get('context-based-switching');
    if (contextBasedSwitching) {
      this.setupContextBasedSwitching();
    }
    
    // Environment-based switching
    const environmentSwitching = this.preferences.get('environment-switching');
    if (environmentSwitching) {
      this.setupEnvironmentSwitching();
    }
  }
  
  setupTimeBasedSwitching() {
    const checkTime = () => {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 18) {
        // Daytime (6 AM - 6 PM)
        this.applyTheme('light');
      } else {
        // Nighttime (6 PM - 6 AM)
        this.applyTheme('dark');
      }
    };
    
    // Check initially
    checkTime();
    
    // Check every hour
    setInterval(checkTime, 60 * 60 * 1000);
  }
  
  setupContextBasedSwitching() {
    // Switch based on app context
    const contextObserver = new MutationObserver((mutations) => {
      const currentApp = this.detectCurrentApp();
      const recommendedTheme = this.getRecommendedTheme(currentApp);
      
      if (recommendedTheme && recommendedTheme !== this.activeTheme) {
        this.applyTheme(recommendedTheme);
      }
    });
    
    contextObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-app', 'class']
    });
  }
  
  detectCurrentApp() {
    const appAttribute = document.body.getAttribute('data-app');
    if (appAttribute) return appAttribute;
    
    const pathname = window.location.pathname;
    if (pathname.includes('/codai')) return 'codai';
    if (pathname.includes('/memorai')) return 'memorai';
    if (pathname.includes('/bancai')) return 'bancai';
    if (pathname.includes('/stocai')) return 'stocai';
    
    return 'default';
  }
  
  getRecommendedTheme(app) {
    const recommendations = {
      'codai': 'dark', // Better for coding
      'memorai': 'oceanic', // Calm for memory work
      'bancai': 'corporate', // Professional for finance
      'stocai': 'dark', // Focus for trading
      'talentai': 'corporate', // Professional for HR
      'prezentai': 'sunset' // Creative for presentations
    };
    
    return recommendations[app];
  }
  
  lighten(color, amount) {
    // Utility function to lighten colors
    return color; // Simplified for example
  }
  
  darken(color, amount) {
    // Utility function to darken colors
    return color; // Simplified for example
  }
  
  notifyThemeChange(themeId, theme) {
    this.observers.forEach(observer => {
      observer({ themeId, theme });
    });
    
    // Dispatch global event
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { themeId, theme }
    }));
  }
}

export default DynamicThemingEngine;
