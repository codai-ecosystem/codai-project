/**
 * @fileoverview Tailwind CSS RTL Plugin
 * @description Custom Tailwind plugin for RTL support
 */

const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities, addComponents, theme }) {
  // RTL Utilities
  addUtilities({
    '.rtl\\:text-right': {
      '[dir="rtl"] &': {
        'text-align': 'right',
      },
    },
    '.rtl\\:text-left': {
      '[dir="rtl"] &': {
        'text-align': 'left',
      },
    },
    '.rtl\\:ml-auto': {
      '[dir="rtl"] &': {
        'margin-right': 'auto',
        'margin-left': '0',
      },
    },
    '.rtl\\:mr-auto': {
      '[dir="rtl"] &': {
        'margin-left': 'auto',
        'margin-right': '0',
      },
    },
    '.rtl\\:pl-0': {
      '[dir="rtl"] &': {
        'padding-right': '0',
      },
    },
    '.rtl\\:pr-0': {
      '[dir="rtl"] &': {
        'padding-left': '0',
      },
    },
    '.rtl\\:flex-row-reverse': {
      '[dir="rtl"] &': {
        'flex-direction': 'row-reverse',
      },
    },
    '.rtl\\:space-x-reverse > :not([hidden]) ~ :not([hidden])': {
      '[dir="rtl"] &': {
        '--tw-space-x-reverse': '1',
      },
    },
  });

  // RTL Components
  addComponents({
    '.rtl-container': {
      '[dir="rtl"] &': {
        direction: 'rtl',
        textAlign: 'right',
      },
      '[dir="ltr"] &': {
        direction: 'ltr',
        textAlign: 'left',
      },
    },
    '.rtl-input': {
      '[dir="rtl"] &': {
        textAlign: 'right',
        paddingRight: theme('spacing.3'),
        paddingLeft: theme('spacing.10'),
      },
      '[dir="ltr"] &': {
        textAlign: 'left',
        paddingLeft: theme('spacing.3'),
        paddingRight: theme('spacing.10'),
      },
    },
    '.rtl-icon': {
      '[dir="rtl"] &': {
        transform: 'scaleX(-1)',
      },
    },
  });
});