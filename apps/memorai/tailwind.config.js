
import { createCodaiTailwindConfig } from '@codai/shared-ui/tailwind-master'

/**
 * Tailwind CSS configuration for MEMORAI
 * 
 * This configuration extends the CODAI master design system with memorai-specific branding.
 * Brand theme: memorai (purple/magenta palette)
 * 
 * @see {@link https://tailwindcss.com/docs/configuration} for configuration options
 */

const config = createCodaiTailwindConfig('memorai', {
  // Add memorai-specific color overrides here if needed
  // Example:
  // 'memory-purple': '#d946ef',
  // 'neural-blue': '#3b82f6',
}, {
  // Add memorai-specific Tailwind extensions here
  // Example:
  // theme: {
  //   extend: {
  //     animation: {
  //       'memory-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  //     },
  //   },
  // },
})

export default config