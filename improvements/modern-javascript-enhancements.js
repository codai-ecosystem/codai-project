// JavaScript Modernization Improvements
// Modern ES6+ patterns and browser compatibility

// Modern Fetch with Error Handling
async function modernFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(HTTP error! status: );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Modern Event Handling with Delegation
function setupEventDelegation() {
  document.addEventListener('click', (event) => {
    if (event.target.matches('[data-action]')) {
      const action = event.target.dataset.action;
      handleAction(action, event.target);
    }
  });
}

// Progressive Enhancement Detection
function checkModernFeatures() {
  const features = {
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    modules: typeof import !== 'undefined',
    grid: CSS.supports('display: grid'),
    flexbox: CSS.supports('display: flex')
  };
  
  return features;
}

// Polyfill Loading for Older Browsers
function loadPolyfills() {
  const features = checkModernFeatures();
  
  if (!features.fetch) {
    loadScript('https://polyfill.io/v3/polyfill.min.js?features=fetch');
  }
  
  if (!features.promises) {
    loadScript('https://polyfill.io/v3/polyfill.min.js?features=Promise');
  }
}

function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
}

// Modern Component Patterns
class ModernComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.element.classList.add('modern-component');
  }
  
  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    // Modern event handling
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadPolyfills();
  setupEventDelegation();
  
  // Initialize modern components
  document.querySelectorAll('[data-component]').forEach(element => {
    new ModernComponent(element);
  });
});
