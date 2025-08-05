// Accessibility Enhancements
// WCAG 2.1 AA compliance improvements

// Add missing ARIA attributes
function enhanceAccessibility() {
    // Fix buttons without labels
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
        if (button.textContent.trim()) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });

    // Add landmark roles
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main && !main.getAttribute('role')) {
        main.setAttribute('role', 'main');
    }

    // Fix heading hierarchy
    fixHeadingHierarchy();

    // Add skip links
    addSkipLinks();

    // Enhance form accessibility
    enhanceFormAccessibility();
}

function fixHeadingHierarchy() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let h1Count = 0;

    headings.forEach(heading => {
        if (heading.tagName === 'H1') {
            h1Count++;
            if (h1Count > 1) {
                // Convert extra H1s to H2s
                const h2 = document.createElement('h2');
                h2.innerHTML = heading.innerHTML;
                h2.className = heading.className;
                heading.parentNode.replaceChild(h2, heading);
            }
        }
    });
}

function addSkipLinks() {
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #3b82f6;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 9999;
      transition: top 0.3s;
    `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

function enhanceFormAccessibility() {
    // Associate labels with inputs
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        if (label && !input.getAttribute('aria-label')) {
            input.setAttribute('aria-labelledby', label.id || (label.id = `label-${Math.random().toString(36).substr(2, 9)}`));
        }
    });

    // Add required field indicators
    document.querySelectorAll('input[required]').forEach(input => {
        if (!input.getAttribute('aria-required')) {
            input.setAttribute('aria-required', 'true');
        }
    });
}

// Keyboard navigation enhancement
function enhanceKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', () => {
    enhanceAccessibility();
    enhanceKeyboardNavigation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enhanceAccessibility,
        enhanceKeyboardNavigation,
        fixHeadingHierarchy
    };
}
