'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/contexts/I18nContext'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'mobile' | 'footer'
}

export default function LanguageSwitcher({ 
  className = '', 
  variant = 'default' 
}: LanguageSwitcherProps) {
  const { t, language, changeLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode)
    setIsOpen(false)
  }

  const baseStyles = {
    default: 'relative',
    mobile: 'w-full',
    footer: 'text-sm',
  }

  const buttonStyles = {
    default: 'flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200',
    mobile: 'flex items-center justify-between w-full px-4 py-3 rounded-lg bg-background/50 hover:bg-background/70 border border-border/50 transition-all duration-200',
    footer: 'flex items-center gap-2 px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors',
  }

  const dropdownStyles = {
    default: 'absolute top-full left-0 mt-2 min-w-[180px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50',
    mobile: 'absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border border-border/50 overflow-hidden z-50',
    footer: 'absolute bottom-full left-0 mb-2 min-w-[160px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50',
  }

  return (
    <div className={`${baseStyles[variant]} ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyles[variant]}
        aria-label={t('language.toggle')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center gap-2">
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs opacity-60"
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: variant === 'footer' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: variant === 'footer' ? 10 : -10 }}
              transition={{ duration: 0.15 }}
              className={dropdownStyles[variant]}
              role="listbox"
            >
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    lang.code === language ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  role="option"
                  aria-selected={lang.code === language}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {lang.code === language && (
                    <span className="ml-auto text-blue-500 text-xs">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}