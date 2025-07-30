# CODAI Mobile Optimization

A comprehensive, enterprise-grade mobile optimization package that provides responsive design, PWA features, touch interfaces, and performance optimizations for modern web applications. Built specifically for the CODAI ecosystem to deliver world-class mobile user experiences.

## 🚀 Features

### Core Mobile Optimization Engine
- **Advanced Device Detection** - Real-time device capability analysis and monitoring
- **Responsive Design System** - Fluid breakpoints with adaptive layouts and typography
- **Touch Interface Optimization** - Gesture recognition and touch-friendly interactions
- **Progressive Web App (PWA)** - Complete PWA implementation with offline support
- **Performance Optimization** - Core Web Vitals optimization and lazy loading
- **Accessibility Compliance** - WCAG 2.1 AA standards with focus management

### Device Intelligence
- **Multi-Device Support** - Mobile, tablet, desktop, TV, and wearable detection
- **Capability Analysis** - Touch, hover, cursor, orientation, and hardware detection
- **Network Awareness** - Connection speed optimization and offline handling
- **Battery Optimization** - Power-aware features and background processing
- **Memory Management** - Efficient resource usage and garbage collection

### Responsive Design System
- **Fluid Breakpoints** - Mobile-first responsive design with 6 breakpoints (xs, sm, md, lg, xl, xxl)
- **Adaptive Typography** - Fluid font scaling with perfect readability across devices
- **Flexible Grid System** - CSS Grid and Flexbox with responsive columns and gutters
- **Container Management** - Automatic container sizing with max-width constraints
- **Utility Classes** - Comprehensive responsive utility classes for rapid development

### Touch & Gesture Support
- **Multi-Touch Gestures** - Tap, swipe, pan, pinch, rotate, and long press support
- **Haptic Feedback** - Native vibration and haptic feedback integration
- **Touch Areas** - WCAG-compliant touch targets with 44px minimum sizing
- **Gesture Customization** - Configurable thresholds, velocities, and directions
- **Accessibility** - Screen reader compatibility and keyboard navigation

### Progressive Web App
- **Service Worker** - Advanced caching strategies with background sync
- **App Manifest** - Complete PWA manifest with icons and metadata
- **Install Prompts** - Smart install promotion and user engagement
- **Offline Support** - Robust offline functionality with data synchronization
- **Push Notifications** - Cross-platform notification system
- **App Shell** - Instant loading with app shell architecture

### Performance Optimization
- **Core Web Vitals** - LCP, FID, CLS optimization for perfect scores
- **Lazy Loading** - Intelligent content loading with intersection observers
- **Image Optimization** - WebP/AVIF support with responsive images
- **Code Splitting** - Route-based and component-based code splitting
- **Prefetching** - Intelligent resource prefetching with network awareness
- **Caching** - Multi-tier caching with intelligent invalidation

## 📦 Installation

```bash
npm install @codai/mobile-optimization
```

## 🎯 Quick Start

### Basic Mobile Optimization

```typescript
import { MobileOptimizationEngine } from '@codai/mobile-optimization';

// Initialize the mobile optimization engine
const mobileEngine = new MobileOptimizationEngine({
  deviceDetection: {
    enabled: true,
    updateInterval: 5000,
    persistSettings: true
  },
  responsiveDesign: {
    breakpoints: {
      xs: 320, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400
    }
  },
  touchInterface: {
    enabled: true,
    gestures: [
      { type: 'tap', enabled: true, threshold: 10 },
      { type: 'swipe', enabled: true, velocity: 0.3 },
      { type: 'pinch', enabled: true, threshold: 0.1 }
    ]
  },
  pwa: {
    enabled: true,
    manifest: {
      name: 'Your App',
      shortName: 'App',
      display: 'standalone'
    }
  }
});

// Initialize and run optimization
await mobileEngine.initialize();
const result = await mobileEngine.optimize();

console.log('Optimization complete:', result);
```

### Device Detection & Capabilities

```typescript
import { DeviceDetector } from '@codai/mobile-optimization';

const deviceDetector = new DeviceDetector({
  updateInterval: 3000,
  persistSettings: true,
  enableNetworkInfo: true,
  enableBatteryInfo: true
});

await deviceDetector.initialize();

// Get comprehensive device information
const capabilities = deviceDetector.getCapabilities();
console.log('Device Info:', {
  type: capabilities.type,           // 'mobile', 'tablet', 'desktop'
  screenSize: `${capabilities.screenWidth}x${capabilities.screenHeight}`,
  orientation: capabilities.orientation, // 'portrait', 'landscape'
  touchCapability: capabilities.touchCapability, // 'none', 'coarse', 'fine'
  pixelRatio: capabilities.pixelRatio,
  connectionType: capabilities.connectionType,
  batteryLevel: capabilities.batteryLevel
});

// Check device capabilities
if (deviceDetector.isMobile()) {
  console.log('Optimizing for mobile device');
}

if (deviceDetector.hasTouch()) {
  console.log('Touch interface available');
}

if (deviceDetector.prefersReducedMotion()) {
  console.log('User prefers reduced motion');
}

// Listen for device changes
deviceDetector.on('device:changed', (capabilities) => {
  console.log('Device capabilities changed:', capabilities);
});
```

### Responsive Design System

```typescript
import { ResponsiveManager } from '@codai/mobile-optimization';

const responsiveManager = new ResponsiveManager({
  breakpoints: {
    xs: 320, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400
  },
  containerMaxWidths: {
    sm: 540, md: 720, lg: 960, xl: 1140, xxl: 1320
  },
  gridColumns: {
    xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 8
  },
  baseFontSize: {
    xs: 14, sm: 15, md: 16, lg: 16, xl: 16, xxl: 16
  }
});

await responsiveManager.initialize();

// Get current responsive values
const currentBreakpoint = responsiveManager.getCurrentBreakpoint();
const gridColumns = responsiveManager.getGridColumns();
const containerWidth = responsiveManager.getContainerMaxWidth();

console.log('Current breakpoint:', currentBreakpoint);
console.log('Grid columns:', gridColumns);
console.log('Container max width:', containerWidth);

// Responsive values with breakpoint-specific overrides
const responsivePadding = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40
};

const currentPadding = responsiveManager.getResponsiveValue(responsivePadding);
console.log('Current padding:', currentPadding);

// Generate fluid typography
const headingSize = responsiveManager.getFluidFontSize(2);
console.log('Fluid heading size:', headingSize); // clamp(18px, 1.5rem + 2vw, 32px)

// Listen for breakpoint changes
responsiveManager.on('responsive:breakpoint-changed', ({ previous, current }) => {
  console.log(`Breakpoint changed from ${previous} to ${current}`);
});
```

### Touch Gesture Handling

```typescript
// Register custom gestures
mobileEngine.registerGesture({
  type: 'swipe',
  enabled: true,
  threshold: 50,
  velocity: 0.5,
  direction: ['left', 'right'],
  preventDefault: true
});

mobileEngine.registerGesture({
  type: 'longPress',
  enabled: true,
  duration: 800,
  threshold: 10
});

// Listen for gesture events
mobileEngine.on('gesture:detected', (event) => {
  console.log('Gesture detected:', {
    type: event.type,
    direction: event.direction,
    velocity: event.velocity,
    duration: event.duration
  });
  
  switch (event.type) {
    case 'swipe':
      if (event.direction === 'left') {
        // Handle swipe left (next page)
        navigateToNext();
      } else if (event.direction === 'right') {
        // Handle swipe right (previous page)
        navigateToPrevious();
      }
      break;
      
    case 'pinch':
      // Handle pinch to zoom
      if (event.scale > 1) {
        zoomIn(event.scale);
      } else {
        zoomOut(event.scale);
      }
      break;
      
    case 'longPress':
      // Show context menu
      showContextMenu(event.center.x, event.center.y);
      break;
  }
});
```

### Progressive Web App Setup

```typescript
// Configure PWA features
mobileEngine.updateManifest({
  name: 'CODAI Mobile',
  shortName: 'CODAI',
  description: 'AI-powered development platform',
  startUrl: '/',
  display: 'standalone',
  orientation: 'any',
  themeColor: '#007acc',
  backgroundColor: '#ffffff',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
});

// Install service worker
const swInstalled = await mobileEngine.installServiceWorker();
console.log('Service worker installed:', swInstalled);

// Show install prompt
mobileEngine.on('pwa:install-ready', async () => {
  const installed = await mobileEngine.showInstallPrompt();
  if (installed) {
    console.log('PWA installed successfully');
  }
});

// Handle app updates
mobileEngine.on('pwa:update-available', () => {
  // Notify user about available update
  showUpdateNotification();
});
```

### Performance Monitoring & Optimization

```typescript
// Enable performance optimizations
await mobileEngine.optimizeImages();
await mobileEngine.enableLazyLoading();

// Monitor performance metrics
const metrics = await mobileEngine.measurePerformance();
console.log('Performance Metrics:', {
  lcp: metrics.lcp,  // Largest Contentful Paint
  fid: metrics.fid,  // First Input Delay
  cls: metrics.cls,  // Cumulative Layout Shift
  fcp: metrics.fcp,  // First Contentful Paint
  ttfb: metrics.ttfb // Time to First Byte
});

// Performance thresholds
import { PERFORMANCE_THRESHOLDS } from '@codai/mobile-optimization';

if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.good) {
  console.log('LCP needs improvement');
}

if (metrics.fid > PERFORMANCE_THRESHOLDS.fid.good) {
  console.log('FID needs improvement');
}

// Listen for performance updates
mobileEngine.on('performance:updated', (metrics) => {
  updatePerformanceDashboard(metrics);
});
```

## 🎨 Component Integration

### React Component Example

```tsx
import React, { useEffect, useState } from 'react';
import { MobileOptimizationEngine, hasTouch, getViewportDimensions } from '@codai/mobile-optimization';

const MobileOptimizedComponent: React.FC = () => {
  const [mobileEngine, setMobileEngine] = useState<MobileOptimizationEngine | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    hasTouch: false,
    orientation: 'landscape' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const engine = new MobileOptimizationEngine();
    
    engine.initialize().then(() => {
      setMobileEngine(engine);
      
      const capabilities = engine.getDeviceInfo();
      setDeviceInfo({
        isMobile: capabilities.type === 'mobile',
        hasTouch: capabilities.touchCapability !== 'none',
        orientation: capabilities.orientation
      });
    });

    // Cleanup
    return () => {
      engine?.shutdown();
    };
  }, []);

  return (
    <div 
      className={`mobile-optimized ${deviceInfo.isMobile ? 'mobile' : 'desktop'}`}
      data-orientation={deviceInfo.orientation}
      style={{
        padding: deviceInfo.isMobile ? '16px' : '24px',
        touchAction: deviceInfo.hasTouch ? 'manipulation' : 'auto'
      }}
    >
      <h1>Mobile Optimized Content</h1>
      <p>Device Type: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</p>
      <p>Touch Support: {deviceInfo.hasTouch ? 'Yes' : 'No'}</p>
      <p>Orientation: {deviceInfo.orientation}</p>
    </div>
  );
};
```

### CSS Integration

```css
/* Mobile-first responsive design */
.mobile-optimized {
  /* Base mobile styles */
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
}

/* Tablet styles */
@media (min-width: 768px) {
  .mobile-optimized {
    font-size: 16px;
    padding: 24px;
  }
}

/* Desktop styles */
@media (min-width: 992px) {
  .mobile-optimized {
    font-size: 16px;
    padding: 32px;
    max-width: 960px;
    margin: 0 auto;
  }
}

/* Touch-optimized styles */
.mobile-optimized[data-touch="true"] {
  /* Larger touch targets */
}

.mobile-optimized[data-touch="true"] button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Orientation-specific styles */
.mobile-optimized[data-orientation="landscape"] {
  /* Landscape-specific optimizations */
}

.mobile-optimized[data-orientation="portrait"] {
  /* Portrait-specific optimizations */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .mobile-optimized * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mobile-optimized {
    background-color: #1a1a1a;
    color: #ffffff;
  }
}
```

## 🛠️ Advanced Configuration

### Custom Breakpoints

```typescript
const customBreakpoints = {
  mobile: 320,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  ultrawide: 1920
};

const responsiveManager = new ResponsiveManager({
  breakpoints: customBreakpoints,
  containerMaxWidths: {
    tablet: 720,
    laptop: 960,
    desktop: 1200,
    ultrawide: 1400
  }
});
```

### Advanced PWA Configuration

```typescript
const advancedPWAConfig = {
  enabled: true,
  manifest: {
    name: 'Advanced PWA',
    shortName: 'AdvPWA',
    description: 'Advanced Progressive Web Application',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    themeColor: '#007acc',
    backgroundColor: '#ffffff',
    categories: ['productivity', 'utilities'],
    screenshots: [
      {
        src: '/screenshots/mobile-1.png',
        sizes: '640x1136',
        type: 'image/png',
        platform: 'narrow'
      },
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1280x720',
        type: 'image/png',
        platform: 'wide'
      }
    ],
    shortcuts: [
      {
        name: 'Quick Action',
        shortName: 'Quick',
        description: 'Quick action shortcut',
        url: '/quick-action',
        icons: [
          {
            src: '/icons/quick-action.png',
            sizes: '96x96'
          }
        ]
      }
    ]
  },
  serviceWorker: {
    enabled: true,
    scriptUrl: '/advanced-sw.js',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.example\.com/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 300
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 86400
          }
        }
      }
    ],
    backgroundSync: [
      {
        name: 'background-sync',
        options: {
          maxRetentionTime: 24 * 60 * 60 * 1000 // 24 hours
        }
      }
    ]
  }
};
```

### Touch Gesture Customization

```typescript
const advancedGestures = [
  {
    type: 'swipe' as const,
    enabled: true,
    threshold: 30,
    velocity: 0.2,
    direction: ['up', 'down', 'left', 'right'] as const,
    preventDefault: true,
    stopPropagation: false
  },
  {
    type: 'pinch' as const,
    enabled: true,
    threshold: 0.05,
    preventDefault: true
  },
  {
    type: 'rotate' as const,
    enabled: true,
    threshold: 5, // degrees
    preventDefault: true
  },
  {
    type: 'longPress' as const,
    enabled: true,
    duration: 500,
    threshold: 15
  }
];

mobileEngine.updateConfig({
  touchInterface: {
    enabled: true,
    gestures: advancedGestures,
    touchAreas: {
      minWidth: 48,
      minHeight: 48,
      padding: 12,
      margin: 8,
      accessible: true,
      hapticFeedback: true
    }
  }
});
```

## 📊 Performance Monitoring

### Core Web Vitals Tracking

```typescript
import { PERFORMANCE_THRESHOLDS } from '@codai/mobile-optimization';

// Continuous performance monitoring
mobileEngine.on('performance:updated', (metrics) => {
  // Core Web Vitals analysis
  const vitals = {
    lcp: {
      value: metrics.lcp,
      status: metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.good ? 'good' : 
              metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.needsImprovement ? 'needs-improvement' : 'poor'
    },
    fid: {
      value: metrics.fid,
      status: metrics.fid <= PERFORMANCE_THRESHOLDS.fid.good ? 'good' : 
              metrics.fid <= PERFORMANCE_THRESHOLDS.fid.needsImprovement ? 'needs-improvement' : 'poor'
    },
    cls: {
      value: metrics.cls,
      status: metrics.cls <= PERFORMANCE_THRESHOLDS.cls.good ? 'good' : 
              metrics.cls <= PERFORMANCE_THRESHOLDS.cls.needsImprovement ? 'needs-improvement' : 'poor'
    }
  };
  
  // Send to analytics
  analytics.track('core-web-vitals', vitals);
  
  // Update performance dashboard
  updateDashboard(vitals);
});
```

### Real User Monitoring (RUM)

```typescript
// Track real user performance
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      analytics.track('navigation-timing', {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart,
        firstByte: entry.responseStart - entry.requestStart
      });
    }
    
    if (entry.entryType === 'paint') {
      analytics.track('paint-timing', {
        metric: entry.name,
        value: entry.startTime
      });
    }
  }
});

performanceObserver.observe({ 
  entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
});
```

## 🔧 Utility Functions

```typescript
import {
  isMobileDevice,
  isTabletDevice,
  hasTouch,
  hasHover,
  getPixelRatio,
  getViewportDimensions,
  getScreenOrientation,
  prefersReducedMotion,
  prefersDarkMode,
  isSlowConnection,
  formatBytes,
  debounce,
  throttle
} from '@codai/mobile-optimization';

// Device detection utilities
const deviceChecks = {
  isMobile: isMobileDevice(),
  isTablet: isTabletDevice(),
  hasTouch: hasTouch(),
  hasHover: hasHover(),
  pixelRatio: getPixelRatio(),
  viewport: getViewportDimensions(),
  orientation: getScreenOrientation(),
  reducedMotion: prefersReducedMotion(),
  darkMode: prefersDarkMode(),
  slowConnection: isSlowConnection()
};

// Performance utilities
const debouncedResize = debounce(() => {
  // Handle resize
}, 250);

const throttledScroll = throttle(() => {
  // Handle scroll
}, 16); // ~60fps

// Memory usage
const memoryUsage = performance.memory?.usedJSHeapSize;
console.log('Memory usage:', formatBytes(memoryUsage));
```

## 🧪 Testing & Development

### Testing Mobile Optimizations

```typescript
import { createTestEngine } from '@codai/mobile-optimization/testing';

const testEngine = createTestEngine({
  mockDevice: {
    type: 'mobile',
    screenWidth: 375,
    screenHeight: 812,
    pixelRatio: 3,
    touchCapability: 'coarse'
  },
  recordInteractions: true
});

// Test mobile-specific features
describe('Mobile Optimization', () => {
  it('should optimize for mobile devices', async () => {
    const result = await testEngine.optimize();
    
    expect(result.success).toBe(true);
    expect(result.optimizations).toContain('Applied mobile-first responsive design');
    expect(result.optimizations).toContain('Enabled touch-optimized interface');
  });
  
  it('should handle touch gestures', async () => {
    testEngine.simulateGesture({
      type: 'swipe',
      direction: 'left',
      velocity: 0.5
    });
    
    const interactions = testEngine.getRecordedInteractions();
    expect(interactions).toHaveLength(1);
    expect(interactions[0].type).toBe('swipe');
  });
});
```

### Development Tools

```typescript
// Development mode with detailed logging
const devMobileEngine = new MobileOptimizationEngine({
  // ... configuration
}, {
  development: true,
  verbose: true,
  debugMode: true
});

// Performance profiling
devMobileEngine.on('profile:start', (operation) => {
  console.time(operation);
});

devMobileEngine.on('profile:end', (operation, duration) => {
  console.timeEnd(operation);
  console.log(`${operation} took ${duration}ms`);
});
```

## 📚 API Reference

### MobileOptimizationEngine

#### Methods
- `initialize()` - Initialize the mobile optimization engine
- `optimize()` - Run comprehensive mobile optimization
- `getDeviceInfo()` - Get current device capabilities
- `updateConfig(config)` - Update engine configuration
- `getCurrentBreakpoint()` - Get current responsive breakpoint
- `getResponsiveValue(value)` - Get responsive value for current breakpoint
- `measurePerformance()` - Get current performance metrics
- `registerGesture(config)` - Register custom touch gesture
- `enableAccessibility()` - Enable accessibility features
- `shutdown()` - Gracefully shutdown the engine

#### Events
- `engine:initialized` - Engine initialization complete
- `device:changed` - Device capabilities changed
- `breakpoint:changed` - Responsive breakpoint changed
- `gesture:detected` - Touch gesture detected
- `performance:updated` - Performance metrics updated
- `pwa:install-ready` - PWA installation available
- `optimization:completed` - Optimization cycle complete

### DeviceDetector

#### Methods
- `initialize()` - Initialize device detection
- `getCapabilities()` - Get current device capabilities
- `updateCapabilities()` - Refresh device capabilities
- `isMobile()` - Check if device is mobile
- `isTablet()` - Check if device is tablet
- `hasTouch()` - Check for touch capability
- `getNetworkInfo()` - Get network connection information
- `getBatteryInfo()` - Get battery status information

### ResponsiveManager

#### Methods
- `initialize()` - Initialize responsive system
- `getCurrentBreakpoint()` - Get current breakpoint
- `isBreakpoint(breakpoint)` - Check specific breakpoint
- `getResponsiveValue(value)` - Compute responsive value
- `getFluidFontSize(level)` - Generate fluid typography
- `generateMediaQueries()` - Create CSS media queries

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/codai/mobile-optimization.git
cd mobile-optimization

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Start development
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern Web APIs and standards
- Inspired by Google's Web Vitals and PWA best practices
- Follows WCAG accessibility guidelines
- Optimized for Core Web Vitals performance metrics

---

**CODAI Mobile Optimization** - Enterprise-grade mobile experience optimization for modern web applications.

For more examples and detailed documentation, visit our [Documentation Site](https://docs.codai.dev/mobile-optimization).
