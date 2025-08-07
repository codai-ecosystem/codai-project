'use client'

import React from 'react';

import { useCallback } from 'react';

// Simple mock translation function
export function useTranslation() {
  const t = useCallback((key: string, options?: Record<string, any>) => {
    // Mock translation - just return the key for now
    return key;
  }, []);

  return { t };
}

