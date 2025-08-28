'use client'

import { useCursor } from '@/hooks/useCursor'

interface CursorEffectsProps {
    size?: number
    glowSize?: number
    color?: string
    trailLength?: number
    mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion'
}

export default function CursorEffects({
    size = 20,
    glowSize = 40,
    color = '#3B82F6',
    trailLength = 5,
    mixBlendMode = 'difference'
}: CursorEffectsProps) {
    const { cursor, trail } = useCursor({ size, glowSize, color, trailLength })

    return (
        <div className="fixed top-0 left-0 pointer-events-none z-50" style={{ mixBlendMode }}>
            {/* Main cursor */}
            <div
                className="absolute rounded-full transition-all duration-150 ease-out"
                style={{
                    left: cursor.x - cursor.size / 2,
                    top: cursor.y - cursor.size / 2,
                    width: cursor.size,
                    height: cursor.size,
                    backgroundColor: color,
                    transform: `scale(${cursor.hidden ? 0 : 1})`,
                    opacity: cursor.linkHovered ? 0.8 : 0.6
                }}
            />

            {/* Glow effect */}
            <div
                className="absolute rounded-full transition-all duration-200 ease-out"
                style={{
                    left: cursor.x - cursor.glowSize / 2,
                    top: cursor.y - cursor.glowSize / 2,
                    width: cursor.glowSize,
                    height: cursor.glowSize,
                    background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                    transform: `scale(${cursor.hidden ? 0 : cursor.linkHovered ? 1.2 : 1})`,
                    opacity: cursor.linkHovered ? 0.6 : 0.3
                }}
            />

            {/* Trail effect */}
            {trail.map((point, index) => (
                <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        left: point.x - size * 0.3 / 2,
                        top: point.y - size * 0.3 / 2,
                        width: size * 0.3,
                        height: size * 0.3,
                        backgroundColor: color,
                        opacity: point.opacity * 0.3,
                        transform: `scale(${cursor.hidden ? 0 : 1})`
                    }}
                />
            ))}
        </div>
    )
}