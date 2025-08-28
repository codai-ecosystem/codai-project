/**
 * @fileoverview UI Showcase Page
 * @description Test page for demonstrating all UI components
 */

import { UIShowcase } from '@/components/showcase/UIShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UI Showcase - MemorAI Design System',
  description: 'Comprehensive demonstration of MemorAI UI components and design system',
};

export default function UIShowcasePage() {
  return <UIShowcase />;
}