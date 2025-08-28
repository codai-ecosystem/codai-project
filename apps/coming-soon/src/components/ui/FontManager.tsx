'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { designSystem } from '@/lib/design-system'
import { cn } from '@/lib/utils'
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

// Font Loading and Management System
interface FontConfig {
  family: string
  weights: string[]
  styles: string[]
  display: string
  preload: boolean
}

interface FontManagerProps {
  className?: string
}

// Google Fonts Configuration for CODAI
const CODAI_FONTS: FontConfig[] = [
  {
    family: 'Inter',
    weights: ['300', '400', '500', '600', '700', '800', '900'],
    styles: ['normal', 'italic'],
    display: 'swap',
    preload: true
  },
  {
    family: 'JetBrains Mono',
    weights: ['300', '400', '500', '600', '700', '800'],
    styles: ['normal', 'italic'],
    display: 'swap',
    preload: false
  },
  {
    family: 'Cal Sans',
    weights: ['400', '600'],
    styles: ['normal'],
    display: 'swap',
    preload: true
  }
]

// Font Loading Hook
export const useFontLoader = () => {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())
  const [failedFonts, setFailedFonts] = useState<Set<string>>(new Set())

  const loadFont = async (fontConfig: FontConfig) => {
    const fontKey = `${fontConfig.family}-${fontConfig.weights.join('-')}`

    if (loadedFonts.has(fontKey) || loadingFonts.has(fontKey)) {
      return
    }

    setLoadingFonts(prev => new Set(prev).add(fontKey))

    try {
      // Create Google Fonts URL
      const weightsParam = fontConfig.weights.map(weight => `${fontConfig.styles.includes('italic') ? 'ital,' : ''}wght@${fontConfig.styles.includes('italic') ? '0,' : ''}${weight}${fontConfig.styles.includes('italic') ? ';1,' + weight : ''}`).join(';')
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontConfig.family.replace(' ', '+')}:${weightsParam}&display=${fontConfig.display}`

      // Load font CSS
      const link = document.createElement('link')
      link.href = fontUrl
      link.rel = 'stylesheet'
      link.crossOrigin = 'anonymous'

      document.head.appendChild(link)

      // Wait for font to load
      await document.fonts.ready

      // Verify font loaded
      const testFont = new FontFace(fontConfig.family, `url(${fontUrl})`)
      await testFont.load()

      setLoadedFonts(prev => new Set(prev).add(fontKey))
      setLoadingFonts(prev => {
        const newSet = new Set(prev)
        newSet.delete(fontKey)
        return newSet
      })
    } catch (error) {
      console.warn(`Failed to load font: ${fontConfig.family}`, error)
      setFailedFonts(prev => new Set(prev).add(fontKey))
      setLoadingFonts(prev => {
        const newSet = new Set(prev)
        newSet.delete(fontKey)
        return newSet
      })
    }
  }

  const loadCODAIFonts = async () => {
    for (const fontConfig of CODAI_FONTS.filter(f => f.preload)) {
      await loadFont(fontConfig)
    }
  }

  useEffect(() => {
    loadCODAIFonts()
  }, [])

  return {
    loadedFonts,
    loadingFonts,
    failedFonts,
    loadFont
  }
}

// Font Preview Component
interface FontPreviewProps {
  fontFamily: string
  text?: string
  sizes?: string[]
  weights?: string[]
  className?: string
}

export const FontPreview: React.FC<FontPreviewProps> = ({
  fontFamily,
  text = 'The quick brown fox jumps over the lazy dog',
  sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  weights = ['font-normal', 'font-medium', 'font-semibold', 'font-bold'],
  className = ''
}) => {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const copyFontFamily = () => {
    navigator.clipboard.writeText(`font-family: ${fontFamily};`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      'p-6 rounded-2xl border space-y-6',
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={cn(
          'text-xl font-semibold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )} style={{ fontFamily }}>
          {fontFamily}
        </h3>

        <button
          onClick={copyFontFamily}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          )}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CheckIcon className="w-5 h-5 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Font Sizes Preview */}
      <div className="space-y-4">
        <h4 className={cn(
          'text-sm font-medium',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        )}>
          Size Variations
        </h4>
        <div className="space-y-3">
          {sizes.map((size) => (
            <div
              key={size}
              className={cn(
                size,
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              )}
              style={{ fontFamily }}
            >
              {text} <span className="text-xs text-gray-500">({size})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights Preview */}
      <div className="space-y-4">
        <h4 className={cn(
          'text-sm font-medium',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        )}>
          Weight Variations
        </h4>
        <div className="space-y-3">
          {weights.map((weight) => (
            <div
              key={weight}
              className={cn(
                'text-lg',
                weight,
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              )}
              style={{ fontFamily }}
            >
              {text} <span className="text-xs font-normal text-gray-500">({weight})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Font Manager Component
export const FontManager: React.FC<FontManagerProps> = ({ className = '' }) => {
  const { theme } = useTheme()
  const { loadedFonts, loadingFonts, failedFonts } = useFontLoader()

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className={cn(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          CODAI Typography System
        </h2>
        <p className={cn(
          'text-lg max-w-2xl mx-auto',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Our carefully selected typefaces ensure optimal readability and brand consistency across all applications.
        </p>
      </div>

      {/* Font Status */}
      <div className={cn(
        'p-4 rounded-xl border',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      )}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{loadedFonts.size}</div>
            <div className={cn(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>Loaded Fonts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{loadingFonts.size}</div>
            <div className={cn(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>Loading Fonts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{failedFonts.size}</div>
            <div className={cn(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>Failed Fonts</div>
          </div>
        </div>
      </div>

      {/* Font Previews */}
      <div className="grid grid-cols-1 gap-8">
        <FontPreview
          fontFamily="Inter, system-ui, sans-serif"
          text="CODAI - The future of artificial intelligence development"
          sizes={['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl']}
          weights={['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold']}
        />

        <FontPreview
          fontFamily="JetBrains Mono, monospace"
          text="const codai = { status: 'revolutionary', impact: 'global' };"
          sizes={['text-xs', 'text-sm', 'text-base', 'text-lg']}
          weights={['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold']}
        />

        <FontPreview
          fontFamily="Cal Sans, Inter, system-ui, sans-serif"
          text="Experience the Next Generation AI Platform"
          sizes={['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl']}
          weights={['font-normal', 'font-semibold']}
        />
      </div>

      {/* Typography Scale */}
      <div className={cn(
        'p-6 rounded-2xl border',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <h3 className={cn(
          'text-xl font-semibold mb-6',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Typography Scale
        </h3>

        <div className="space-y-6">
          {Object.entries(designSystem.typography.fontSize).map(([size, [fontSize, config]]) => (
            <div key={size} className="flex items-center gap-6">
              <div className="w-20 text-sm font-mono text-gray-500">
                {size}
              </div>
              <div className="w-16 text-sm font-mono text-gray-500">
                {fontSize}
              </div>
              <div
                className={cn(
                  'flex-1 font-sans',
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                )}
                style={{ fontSize, lineHeight: config?.lineHeight || '1.5' }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Loading Performance */}
      <div className={cn(
        'p-6 rounded-2xl border',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <h3 className={cn(
          'text-xl font-semibold mb-4',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Font Loading Strategy
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            )}>
              <h4 className="font-semibold text-green-600 mb-2">✓ Preload Strategy</h4>
              <ul className={cn(
                'text-sm space-y-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <li>• Inter (Primary UI font) - Preloaded</li>
                <li>• Cal Sans (Display font) - Preloaded</li>
                <li>• font-display: swap for smooth loading</li>
              </ul>
            </div>

            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            )}>
              <h4 className="font-semibold text-blue-600 mb-2">⚡ Performance</h4>
              <ul className={cn(
                'text-sm space-y-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <li>• Lazy loading for monospace fonts</li>
                <li>• Subset loading for unused characters</li>
                <li>• Critical font paths optimized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FontManager