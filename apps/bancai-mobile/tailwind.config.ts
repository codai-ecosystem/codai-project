import { createCodaiTailwindConfig } from '../../packages/shared-ui/tailwind-master.config';

export default createCodaiTailwindConfig(
  'bancai-mobile',
  undefined, // Use default brand colors for bancai-mobile
  {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
      './utils/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  }
);
