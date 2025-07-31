'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ','
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Use Framer Motion's useSpring for smooth animation
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1
  })

  const display = useTransform(spring, (latest) => {
    const formatted = formatNumber(latest, decimals, separator)
    return `${prefix}${formatted}${suffix}`
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(value)
      setHasAnimated(true)
    }, delay)

    // Update the display value for accessibility
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest)
    })

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [value, delay, spring])

  // Format number with separators
  function formatNumber(num: number, decimals: number, separator: string): string {
    const rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
    const parts = rounded.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join('.')
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: 'easeOut'
      }}
      aria-live="polite"
      aria-label={`${prefix}${formatNumber(displayValue, decimals, separator)}${suffix}`}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  )
}

// Alternative implementation using RAF for better performance with large numbers
export function AnimatedCounterRAF({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ','
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let startValue = displayValue
    let rafId: number

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime - delay
      
      if (elapsed < 0) {
        rafId = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = startValue + (value - startValue) * easeOutQuart
      setDisplayValue(currentValue)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [value, duration, delay])

  function formatNumber(num: number, decimals: number, separator: string): string {
    const rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
    const parts = rounded.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join('.')
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: 'easeOut'
      }}
      aria-live="polite"
      aria-label={`${prefix}${formatNumber(displayValue, decimals, separator)}${suffix}`}
    >
      {prefix}{formatNumber(displayValue, decimals, separator)}{suffix}
    </motion.span>
  )
}

// Specialized counter for percentages
export function PercentageCounter({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  showSign = true
}: {
  value: number
  duration?: number
  delay?: number
  className?: string
  showSign?: boolean
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      delay={delay}
      className={className}
      suffix={showSign ? '%' : ''}
      decimals={1}
    />
  )
}

// Specialized counter for currency
export function CurrencyCounter({
  value,
  currency = '$',
  duration = 1000,
  delay = 0,
  className = ''
}: {
  value: number
  currency?: string
  duration?: number
  delay?: number
  className?: string
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      delay={delay}
      className={className}
      prefix={currency}
      separator=","
      decimals={value < 100 ? 2 : 0}
    />
  )
}

// Counter with custom easing
export function EaseAnimatedCounter({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  easing = 'easeOutCubic'
}: AnimatedCounterProps & { easing?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  const easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t: number) => t * t * t * t,
    easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInBounce: (t: number) => 1 - easingFunctions.easeOutBounce(1 - t),
    easeOutBounce: (t: number) => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
      }
    }
  }

  useEffect(() => {
    let startTime: number | null = null
    let startValue = displayValue
    let rafId: number

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime - delay
      
      if (elapsed < 0) {
        rafId = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunctions[easing as keyof typeof easingFunctions](progress)
      
      const currentValue = startValue + (value - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [value, duration, delay, easing])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: 'easeOut'
      }}
    >
      {Math.round(displayValue).toLocaleString()}
    </motion.span>
  )
}

export default AnimatedCounter
