import { createCodaiTailwindConfig } from '../../packages/shared-ui/tailwind-master.config';

export default createCodaiTailwindConfig(
  'marketai',
  undefined, // Use default brand colors for marketai
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

