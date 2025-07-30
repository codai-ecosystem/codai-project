
import { createCodaiTailwindConfig } from '@codai/shared-ui/tailwind-master'

/**
 * Tailwind CSS configuration for CODAI
 * 
 * This configuration extends the CODAI master design system with codai-specific branding.
 * Brand theme: codai
 * 
 * @see {@link https://tailwindcss.com/docs/configuration} for configuration options
 */

const config = createCodaiTailwindConfig('codai', {
  // Add codai-specific color overrides here if needed
  // Example:
  // 'custom-blue': '#1e40af',
  // 'custom-red': '#dc2626',
}, {
  // Add codai-specific Tailwind extensions here
  // Example:
  // theme: {
  //   extend: {
  //     fontFamily: {
  //       'custom': ['Custom Font', 'sans-serif'],
  //     },
  //   },
  // },
})

export default config