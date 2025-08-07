'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Import all the animated components dynamically
export const AnimatedDiv = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.AnimatedDiv })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const PageWrapper = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.PageWrapper })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const FadeIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.FadeIn })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const SlideIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.SlideIn })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const ScaleIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.ScaleIn })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const StaggerContainer = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.StaggerContainer })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const StaggerItem = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.StaggerItem })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const HoverScale = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.HoverScale })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const Pulse = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.Pulse })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

