'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScrollProgressProps {
  className?: string
}

export default function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform-gpu z-50 ${className}`}
      style={{ scaleX, transformOrigin: '0%' }}
    />
  )
}

// Enhanced scroll progress with sections
interface SectionScrollProgressProps {
  sections: Array<{ id: string; label: string }>
  className?: string
}

export function SectionScrollProgress({ sections, className = '' }: SectionScrollProgressProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateActiveSection = () => {
      const sectionElements = sections.map(section => {
        const element = document.getElementById(section.id)
        return element ? {
          id: section.id,
          top: element.offsetTop,
          bottom: element.offsetTop + element.offsetHeight
        } : null
      }).filter(Boolean)

      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (const section of sectionElements) {
        if (section && scrollPosition >= section.top && scrollPosition < section.bottom) {
          setActiveSection(section.id)
          break
        }
      }
    }

    const unsubscribe = scrollY.on('change', updateActiveSection)
    updateActiveSection() // Initial check

    return unsubscribe
  }, [sections, scrollY])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 ${className}`}>
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group relative w-3 h-3 rounded-full border-2 transition-colors ${activeSection === section.id
                ? 'border-white bg-white'
                : 'border-white/40 hover:border-white/60'
              }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="absolute left-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: activeSection === section.id ? 1 : 0,
                x: activeSection === section.id ? 0 : -10
              }}
              transition={{ duration: 0.2 }}
            >
              {section.label}
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}