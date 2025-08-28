'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { designSystem } from '@/lib/design-system'
import { cn } from '@/lib/utils'

// Color Palette Component Types
interface ColorPaletteProps {
  colors: Record<string, string | Record<string, string>>
  title?: string
  className?: string
  showHex?: boolean
  interactive?: boolean
}

interface ColorSwatchProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showHex?: boolean
  interactive?: boolean
  onClick?: (color: string) => void
}

// Individual Color Swatch Component
export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  name,
  color,
  size = 'md',
  showHex = false,
  interactive = false,
  onClick
}) => {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const handleClick = () => {
    if (interactive && onClick) {
      onClick(color)
      // Copy to clipboard
      navigator.clipboard.writeText(color)
    }
  }

  return (
    <motion.div
      className={cn(
        'group flex flex-col items-center gap-2 cursor-pointer',
        interactive && 'hover:scale-105 transition-transform duration-200'
      )}
      onClick={handleClick}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      {/* Color Circle */}
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full border-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300',
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        )}
        style={{ backgroundColor: color }}
      >
        {interactive && (
          <div className="w-full h-full rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Copy
            </span>
          </div>
        )}
      </div>

      {/* Color Info */}
      <div className="text-center">
        <div className={cn(
          'text-sm font-medium',
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        )}>
          {name}
        </div>
        {showHex && (
          <div className={cn(
            'text-xs font-mono',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {color.toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Color Palette Component
export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  title,
  className = '',
  showHex = true,
  interactive = true
}) => {
  const { theme } = useTheme()

  const renderColorGroup = (groupName: string, colorGroup: Record<string, string>) => (
    <div key={groupName} className="space-y-4">
      <h4 className={cn(
        'text-lg font-semibold capitalize',
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      )}>
        {groupName.replace(/([A-Z])/g, ' $1').trim()}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {Object.entries(colorGroup).map(([shade, colorValue]) => (
          <ColorSwatch
            key={`${groupName}-${shade}`}
            name={shade}
            color={colorValue}
            showHex={showHex}
            interactive={interactive}
          />
        ))}
      </div>
    </div>
  )

  const renderSingleColor = (colorName: string, colorValue: string) => (
    <ColorSwatch
      key={colorName}
      name={colorName}
      color={colorValue}
      showHex={showHex}
      interactive={interactive}
    />
  )

  return (
    <div className={cn('space-y-8', className)}>
      {title && (
        <h3 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          {title}
        </h3>
      )}
      
      <div className="space-y-8">
        {Object.entries(colors).map(([key, value]) => {
          if (typeof value === 'string') {
            return renderSingleColor(key, value)
          } else {
            return renderColorGroup(key, value)
          }
        })}
      </div>
    </div>
  )
}

// Comprehensive CODAI Brand Color Palette
export const CODAIColorPalette: React.FC = () => {
  const brandColors = {
    primary: designSystem.colors.primary,
    secondary: designSystem.colors.secondary,
    accent: {
      'AI Platform': designSystem.colors.accent.ai,
      'Development': designSystem.colors.accent.development,
      'Enterprise': designSystem.colors.accent.enterprise,
      'Infrastructure': designSystem.colors.accent.infrastructure,
      'Specialized': designSystem.colors.accent.specialized,
      'Success': designSystem.colors.accent.success,
      'Warning': designSystem.colors.accent.warning,
      'Error': designSystem.colors.accent.error,
      'Info': designSystem.colors.accent.info,
    },
    neutral: designSystem.colors.neutral
  }

  return (
    <div className="space-y-12">
      <ColorPalette
        title="CODAI Brand Colors"
        colors={brandColors}
        showHex
        interactive
      />
    </div>
  )
}

// Color Context Provider for global color management
interface ColorContextType {
  selectedColors: string[]
  selectColor: (color: string) => void
  removeColor: (color: string) => void
  clearColors: () => void
}

const ColorContext = React.createContext<ColorContextType | undefined>(undefined)

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedColors, setSelectedColors] = React.useState<string[]>([])

  const selectColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev : [...prev, color]
    )
  }

  const removeColor = (color: string) => {
    setSelectedColors(prev => prev.filter(c => c !== color))
  }

  const clearColors = () => {
    setSelectedColors([])
  }

  return (
    <ColorContext.Provider value={{ selectedColors, selectColor, removeColor, clearColors }}>
      {children}
    </ColorContext.Provider>
  )
}

export const useColorSelection = () => {
  const context = React.useContext(ColorContext)
  if (context === undefined) {
    throw new Error('useColorSelection must be used within a ColorProvider')
  }
  return context
}

// Gradient Generator Component
export const GradientGenerator: React.FC = () => {
  const { theme } = useTheme()
  const [startColor, setStartColor] = React.useState('#3b82f6')
  const [endColor, setEndColor] = React.useState('#6366f1')
  const [direction, setDirection] = React.useState('135deg')

  const gradientStyle = {
    background: `linear-gradient(${direction}, ${startColor}, ${endColor})`
  }

  const gradientCSS = `background: linear-gradient(${direction}, ${startColor}, ${endColor});`

  const copyGradient = () => {
    navigator.clipboard.writeText(gradientCSS)
  }

  return (
    <div className={cn(
      'p-6 rounded-2xl border',
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      <h3 className={cn(
        'text-xl font-semibold mb-6',
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      )}>
        Gradient Generator
      </h3>

      {/* Gradient Preview */}
      <div
        className="w-full h-32 rounded-xl mb-6 border-2 border-gray-200 dark:border-gray-600"
        style={gradientStyle}
      />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          )}>
            Start Color
          </label>
          <input
            type="color"
            value={startColor}
            onChange={(e) => setStartColor(e.target.value)}
            className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          )}>
            End Color
          </label>
          <input
            type="color"
            value={endColor}
            onChange={(e) => setEndColor(e.target.value)}
            className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          )}>
            Direction
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className={cn(
              'w-full h-10 rounded-lg border-2 px-3',
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-900'
            )}
          >
            <option value="0deg">To Top</option>
            <option value="45deg">To Top Right</option>
            <option value="90deg">To Right</option>
            <option value="135deg">To Bottom Right</option>
            <option value="180deg">To Bottom</option>
            <option value="225deg">To Bottom Left</option>
            <option value="270deg">To Left</option>
            <option value="315deg">To Top Left</option>
          </select>
        </div>
      </div>

      {/* CSS Output */}
      <div className="space-y-3">
        <label className={cn(
          'block text-sm font-medium',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        )}>
          CSS Code
        </label>
        <div className={cn(
          'p-3 rounded-lg font-mono text-sm border',
          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'
        )}>
          {gradientCSS}
        </div>
        <button
          onClick={copyGradient}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Copy CSS
        </button>
      </div>
    </div>
  )
}

export default ColorPalette