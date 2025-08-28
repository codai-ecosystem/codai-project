declare module '*.json' {
  const value: any;
  export default value;
}

// i18next type augmentation
import 'react-i18next'
import type { resources } from '../lib/i18n'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: typeof resources['en']
  }
}