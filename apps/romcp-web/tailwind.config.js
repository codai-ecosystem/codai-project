import { tailwindConfig } from '@codai/cautai-config/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  ...tailwindConfig,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../packages/cautai-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};