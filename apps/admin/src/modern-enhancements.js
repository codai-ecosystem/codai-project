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
            throw new Error(`HTTP error! status: ${response.status}`);
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

function handleAction(action, element) {
    switch (action) {
        case 'toggle':
            element.classList.toggle('active');
            break;
        case 'modal-open':
            const modalId = element.dataset.target;
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('open');
            break;
        case 'modal-close':
            const openModal = document.querySelector('.modal.open');
            if (openModal) openModal.classList.remove('open');
            break;
        default:
            console.warn(`Unknown action: ${action}`);
    }
}

// Progressive Enhancement Detection
function checkModernFeatures() {
    const features = {
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        modules: typeof import !== 'undefined',
        grid: CSS.supports('display: grid'),
        flexbox: CSS.supports('display: flex'),
        customProperties: CSS.supports('color', 'var(--test)')
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

    if (!features.customProperties) {
        loadScript('https://polyfill.io/v3/polyfill.min.js?features=CSS.supports');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
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
        this.element.setAttribute('data-initialized', 'true');
    }

    bindEvents() {
        this.element.addEventListener('click', this.handleClick.bind(this));
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    handleClick(event) {
        // Modern event handling with accessibility
        this.element.setAttribute('aria-pressed',
            this.element.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'
        );
    }

    handleKeydown(event) {
        // Support Enter and Space for accessibility
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleClick(event);
        }
    }
}

// Performance optimization with intersection observer
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadPolyfills().then(() => {
        setupEventDelegation();
        setupLazyLoading();

        // Initialize modern components
        document.querySelectorAll('[data-component]:not([data-initialized])').forEach(element => {
            new ModernComponent(element);
        });
    }).catch(error => {
        console.warn('Polyfill loading failed:', error);
        // Continue without polyfills
        setupEventDelegation();
        setupLazyLoading();
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        modernFetch,
        ModernComponent,
        checkModernFeatures,
        loadPolyfills
    };
}
