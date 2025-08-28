'use client'

import { useState, useEffect, useRef } from 'react'

interface CursorEffectsOptions {
    size?: number
    glowSize?: number
    color?: string
    trailLength?: number
}

interface CursorState {
    x: number
    y: number
    clicked: boolean
    hidden: boolean
    linkHovered: boolean
    size: number
    glowSize: number
}

export const useCursor = (options: CursorEffectsOptions = {}) => {
    const {
        size = 20,
        glowSize = 40,
        color = '#3B82F6',
        trailLength = 5
    } = options

    const [cursor, setCursor] = useState<CursorState>({
        x: 0,
        y: 0,
        clicked: false,
        hidden: false,
        linkHovered: false,
        size,
        glowSize
    })

    const trailRef = useRef<Array<{ x: number; y: number; opacity: number }>>([])
    const requestRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        const updateCursor = (e: MouseEvent) => {
            setCursor(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY
            }))

            // Update trail
            trailRef.current = [
                { x: e.clientX, y: e.clientY, opacity: 1 },
                ...trailRef.current.slice(0, trailLength - 1).map((point, index) => ({
                    ...point,
                    opacity: 1 - (index + 1) / trailLength
                }))
            ]
        }

        const onMouseDown = () => setCursor(prev => ({ ...prev, clicked: true, size: prev.size * 0.8 }))
        const onMouseUp = () => setCursor(prev => ({ ...prev, clicked: false, size }))

        const onMouseEnter = () => setCursor(prev => ({ ...prev, hidden: false }))
        const onMouseLeave = () => setCursor(prev => ({ ...prev, hidden: true }))

        // Handle link hover effects
        const handleLinkHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isLink = target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')

            setCursor(prev => ({
                ...prev,
                linkHovered: !!isLink,
                size: isLink ? size * 1.5 : size,
                glowSize: isLink ? glowSize * 1.3 : glowSize
            }))
        }

        document.addEventListener('mousemove', updateCursor)
        document.addEventListener('mousemove', handleLinkHover)
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mouseenter', onMouseEnter)
        document.addEventListener('mouseleave', onMouseLeave)

        return () => {
            document.removeEventListener('mousemove', updateCursor)
            document.removeEventListener('mousemove', handleLinkHover)
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('mouseenter', onMouseEnter)
            document.removeEventListener('mouseleave', onMouseLeave)
        }
    }, [size, glowSize, trailLength])

    // Animate trail fade
    useEffect(() => {
        const animate = () => {
            trailRef.current = trailRef.current.map(point => ({
                ...point,
                opacity: Math.max(0, point.opacity - 0.02)
            })).filter(point => point.opacity > 0.01)

            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
        }
    }, [])

    return {
        cursor,
        trail: trailRef.current,
        color
    }
}