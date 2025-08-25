/**
 * @fileoverview Cultural Configuration
 * @description Cultural preferences and adaptations for different locales
 */

export interface CulturalPreferences {
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  timeFormat: '12' | '24';
  weekStart: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  currency: string;
  currencyPosition: 'before' | 'after';
  currencySymbol: string;
  decimalSeparator: '.' | ',';
  thousandsSeparator: ',' | '.' | ' ' | '';
  numberGrouping: number[];
  phoneFormat: string;
  addressFormat: string[];
  nameOrder: 'first-last' | 'last-first';
  honorifics: string[];
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    warning: string;
    success: string;
  };
  icons: {
    direction?: 'rtl' | 'ltr';
    style?: 'outline' | 'solid' | 'cultural';
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      large: string;
    };
    lineHeight: {
      base: string;
      large: string;
    };
  };
  calendar: {
    type: 'gregorian' | 'islamic' | 'hebrew' | 'persian' | 'buddhist' | 'chinese';
    era?: boolean;
    weekendDays: number[];
  };
}

export const CULTURAL_PREFERENCES: Record<string, CulturalPreferences> = {
  en: {
    dateFormat: 'mdy',
    timeFormat: '12',
    weekStart: 0,
    currency: 'USD',
    currencyPosition: 'before',
    currencySymbol: '$',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3],
    phoneFormat: '+1 (###) ###-####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },
  
  es: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+34 ### ### ###',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  ar: {
    dateFormat: 'dmy',
    timeFormat: '12',
    weekStart: 6,
    currency: 'SAR',
    currencyPosition: 'after',
    currencySymbol: 'ر.س',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3],
    phoneFormat: '+966 ## ### ####',
    addressFormat: ['street', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['الأستاذ', 'الدكتور', 'المهندس', 'الشيخ'],
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'rtl',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Cairo, Amiri, system-ui, sans-serif',
      fontSize: {
        base: '18px',
        large: '20px'
      },
      lineHeight: {
        base: '1.8',
        large: '1.9'
      }
    },
    calendar: {
      type: 'islamic',
      era: true,
      weekendDays: [5, 6]
    }
  },

  zh: {
    dateFormat: 'ymd',
    timeFormat: '24',
    weekStart: 1,
    currency: 'CNY',
    currencyPosition: 'before',
    currencySymbol: '¥',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [4], // Chinese uses 4-digit grouping
    phoneFormat: '+86 ### #### ####',
    addressFormat: ['country', 'city', 'street'],
    nameOrder: 'last-first',
    honorifics: ['先生', '女士', '博士', '教授'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.6',
        large: '1.7'
      }
    },
    calendar: {
      type: 'chinese',
      era: true,
      weekendDays: [0, 6]
    }
  },

  ja: {
    dateFormat: 'ymd',
    timeFormat: '24',
    weekStart: 0,
    currency: 'JPY',
    currencyPosition: 'before',
    currencySymbol: '¥',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [4],
    phoneFormat: '+81 ## #### ####',
    addressFormat: ['country', 'zipcode', 'city', 'street'],
    nameOrder: 'last-first',
    honorifics: ['さん', '様', '博士', '教授'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Hiragino Sans, Yu Gothic, Meiryo, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.7',
        large: '1.8'
      }
    },
    calendar: {
      type: 'gregorian',
      era: true,
      weekendDays: [0, 6]
    }
  },

  de: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+49 ### ### ####',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Herr', 'Frau', 'Dr.', 'Prof.'],
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  fr: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    numberGrouping: [3],
    phoneFormat: '+33 # ## ## ## ##',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['M.', 'Mme', 'Dr.', 'Prof.'],
    colors: {
      primary: '#1e40af',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  hi: {
    dateFormat: 'dmy',
    timeFormat: '12',
    weekStart: 0,
    currency: 'INR',
    currencyPosition: 'before',
    currencySymbol: '₹',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3, 2], // Indian numbering system (lakh/crore)
    phoneFormat: '+91 ##### #####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['श्री', 'श्रीमती', 'डॉ.', 'प्रो.'],
    colors: {
      primary: '#f97316',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Noto Sans Devanagari, system-ui, sans-serif',
      fontSize: {
        base: '17px',
        large: '19px'
      },
      lineHeight: {
        base: '1.6',
        large: '1.7'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0]
    }
  },

  pt: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 0,
    currency: 'BRL',
    currencyPosition: 'before',
    currencySymbol: 'R$',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+55 ## #####-####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.'],
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  ru: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'RUB',
    currencyPosition: 'after',
    currencySymbol: '₽',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    numberGrouping: [3],
    phoneFormat: '+7 ### ###-##-##',
    addressFormat: ['country', 'zipcode', 'city', 'street'],
    nameOrder: 'first-last',
    honorifics: ['г-н', 'г-жа', 'д-р', 'проф.'],
    colors: {
      primary: '#1e40af',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  }
};

/**
 * Get cultural preferences for a locale
 */
export const getCulturalPreferences = (locale: string): CulturalPreferences => {
  return CULTURAL_PREFERENCES[locale] || CULTURAL_PREFERENCES.en;
};

/**
 * Get supported cultural locales
 */
export const getSupportedCulturalLocales = (): string[] => {
  return Object.keys(CULTURAL_PREFERENCES);
};

export default {
  CULTURAL_PREFERENCES,
  getCulturalPreferences,
  getSupportedCulturalLocales
};