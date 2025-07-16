// Adaptive Layout Engine - Intelligent Interface Adaptation
export class AdaptiveLayoutEngine {
  constructor() {
    this.layouts = new Map();
    this.adaptations = new Map();
    this.context = new Map();
    this.preferences = new Map();
  }
  
  async initialize() {
    console.log('🤖 Initializing Adaptive Layout Engine...');
    
    // Setup viewport monitoring
    await this.setupViewportMonitoring();
    
    // Initialize context detection
    await this.initializeContextDetection();
    
    // Load adaptation rules
    await this.loadAdaptationRules();
    
    // Start adaptive behavior
    await this.startAdaptiveBehavior();
    
    console.log('✅ Adaptive Layout Engine ready');
  }
  
  async setupViewportMonitoring() {
    const viewportObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        this.handleViewportChange(width, height);
      });
    });
    
    viewportObserver.observe(document.documentElement);
    
    // Device orientation monitoring
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }
  
  handleViewportChange(width, height) {
    const breakpoint = this.getBreakpoint(width);
    const aspectRatio = width / height;
    
    this.context.set('viewport', { width, height, breakpoint, aspectRatio });
    this.triggerAdaptation('viewport-change');
  }
  
  getBreakpoint(width) {
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    if (width < 1280) return 'xl';
    return '2xl';
  }
  
  async initializeContextDetection() {
    // User context detection
    this.detectUserContext();
    
    // App context detection
    this.detectAppContext();
    
    // Usage pattern detection
    this.detectUsagePatterns();
    
    // Performance context
    this.detectPerformanceContext();
  }
  
  detectUserContext() {
    const context = {
      deviceType: this.getDeviceType(),
      inputMethods: this.getInputMethods(),
      capabilities: this.getDeviceCapabilities(),
      preferences: this.getUserPreferences()
    };
    
    this.context.set('user', context);
  }
  
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
    if (/tv/.test(userAgent)) return 'tv';
    return 'desktop';
  }
  
  getInputMethods() {
    const methods = [];
    
    if ('ontouchstart' in window) methods.push('touch');
    if (navigator.maxTouchPoints > 0) methods.push('touch');
    if (window.PointerEvent) methods.push('pointer');
    methods.push('mouse', 'keyboard');
    
    return methods;
  }
  
  getDeviceCapabilities() {
    return {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      connection: navigator.connection?.effectiveType || '4g',
      reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      high_contrast: window.matchMedia('(prefers-contrast: high)').matches
    };
  }
  
  async loadAdaptationRules() {
    const rules = {
      'viewport-small': {
        trigger: (ctx) => ctx.viewport?.breakpoint === 'sm',
        adaptations: [
          { type: 'layout', action: 'single-column' },
          { type: 'navigation', action: 'collapse' },
          { type: 'typography', action: 'increase-size' },
          { type: 'spacing', action: 'reduce' }
        ]
      },
      
      'touch-device': {
        trigger: (ctx) => ctx.user?.inputMethods.includes('touch'),
        adaptations: [
          { type: 'targets', action: 'increase-size' },
          { type: 'spacing', action: 'increase' },
          { type: 'gestures', action: 'enable' },
          { type: 'feedback', action: 'haptic' }
        ]
      },
      
      'low-performance': {
        trigger: (ctx) => ctx.user?.capabilities.memory < 4 || ctx.user?.capabilities.cores < 4,
        adaptations: [
          { type: 'animations', action: 'reduce' },
          { type: 'images', action: 'optimize' },
          { type: 'components', action: 'lazy-load' },
          { type: 'effects', action: 'disable' }
        ]
      },
      
      'high-contrast': {
        trigger: (ctx) => ctx.user?.capabilities.high_contrast,
        adaptations: [
          { type: 'colors', action: 'high-contrast' },
          { type: 'borders', action: 'emphasize' },
          { type: 'focus', action: 'enhance' },
          { type: 'text', action: 'increase-weight' }
        ]
      },
      
      'reduced-motion': {
        trigger: (ctx) => ctx.user?.capabilities.reduced_motion,
        adaptations: [
          { type: 'animations', action: 'disable' },
          { type: 'transitions', action: 'instant' },
          { type: 'parallax', action: 'disable' },
          { type: 'autoscroll', action: 'disable' }
        ]
      }
    };
    
    for (const [ruleId, rule] of Object.entries(rules)) {
      this.adaptations.set(ruleId, rule);
    }
  }
  
  async triggerAdaptation(reason) {
    console.log(`🔄 Triggering adaptation: ${reason}`);
    
    const activeAdaptations = [];
    
    // Check all adaptation rules
    for (const [ruleId, rule] of this.adaptations) {
      if (rule.trigger(Object.fromEntries(this.context))) {
        activeAdaptations.push({ ruleId, rule });
      }
    }
    
    // Apply adaptations
    for (const { ruleId, rule } of activeAdaptations) {
      await this.applyAdaptations(ruleId, rule.adaptations);
    }
    
    // Store adaptation state
    this.storeAdaptationState(activeAdaptations);
  }
  
  async applyAdaptations(ruleId, adaptations) {
    for (const adaptation of adaptations) {
      switch (adaptation.type) {
        case 'layout':
          await this.applyLayoutAdaptation(adaptation);
          break;
        case 'navigation':
          await this.applyNavigationAdaptation(adaptation);
          break;
        case 'typography':
          await this.applyTypographyAdaptation(adaptation);
          break;
        case 'spacing':
          await this.applySpacingAdaptation(adaptation);
          break;
        case 'targets':
          await this.applyTargetAdaptation(adaptation);
          break;
        case 'animations':
          await this.applyAnimationAdaptation(adaptation);
          break;
        case 'colors':
          await this.applyColorAdaptation(adaptation);
          break;
        default:
          console.log(`Unknown adaptation type: ${adaptation.type}`);
      }
    }
  }
  
  async applyLayoutAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'single-column':
        root.style.setProperty('--layout-columns', '1');
        root.classList.add('layout-single-column');
        break;
      case 'multi-column':
        root.style.setProperty('--layout-columns', 'auto');
        root.classList.remove('layout-single-column');
        break;
    }
  }
  
  async applyNavigationAdaptation(adaptation) {
    const navigation = document.querySelector('[data-navigation]');
    if (!navigation) return;
    
    switch (adaptation.action) {
      case 'collapse':
        navigation.classList.add('navigation-collapsed');
        break;
      case 'expand':
        navigation.classList.remove('navigation-collapsed');
        break;
    }
  }
  
  async applyTypographyAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'increase-size':
        root.style.setProperty('--text-scale', '1.125');
        break;
      case 'decrease-size':
        root.style.setProperty('--text-scale', '0.875');
        break;
      case 'reset-size':
        root.style.setProperty('--text-scale', '1');
        break;
    }
  }
  
  async applySpacingAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'increase':
        root.style.setProperty('--spacing-scale', '1.25');
        break;
      case 'reduce':
        root.style.setProperty('--spacing-scale', '0.8');
        break;
      case 'reset':
        root.style.setProperty('--spacing-scale', '1');
        break;
    }
  }
  
  async applyTargetAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'increase-size':
        root.style.setProperty('--target-size', '44px');
        root.classList.add('large-targets');
        break;
      case 'reset-size':
        root.style.setProperty('--target-size', '32px');
        root.classList.remove('large-targets');
        break;
    }
  }
  
  async applyAnimationAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'reduce':
        root.style.setProperty('--animation-duration', '0.1s');
        root.classList.add('reduced-motion');
        break;
      case 'disable':
        root.style.setProperty('--animation-duration', '0s');
        root.classList.add('no-motion');
        break;
      case 'enable':
        root.style.setProperty('--animation-duration', '0.3s');
        root.classList.remove('reduced-motion', 'no-motion');
        break;
    }
  }
  
  async applyColorAdaptation(adaptation) {
    const root = document.documentElement;
    
    switch (adaptation.action) {
      case 'high-contrast':
        root.classList.add('high-contrast');
        break;
      case 'normal-contrast':
        root.classList.remove('high-contrast');
        break;
    }
  }
  
  storeAdaptationState(adaptations) {
    const state = {
      timestamp: new Date(),
      adaptations: adaptations.map(a => a.ruleId),
      context: Object.fromEntries(this.context)
    };
    
    localStorage.setItem('adaptive-layout-state', JSON.stringify(state));
  }
}

export default AdaptiveLayoutEngine;
