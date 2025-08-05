'use client'

import React from 'react'

interface TranslationProviderProps {
  children: React.ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  // TODO: Implement proper i18n when @codai/translations package is available
  return <>{children}</>
}
