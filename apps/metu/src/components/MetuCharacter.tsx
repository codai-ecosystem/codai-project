import React, { useEffect, useState } from 'react';

interface MetuCharacterProps {
    state: 'idle' | 'listening' | 'speaking' | 'processing';
    audioActivity?: number;
    className?: string;
}

const MetuCharacter: React.FC<MetuCharacterProps> = ({
    state,
    audioActivity = 0,
    className = ''
}) => {
    const [blinkState, setBlinkState] = useState(false);

    // Automatic blinking animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (state === 'idle' || state === 'listening') {
                setBlinkState(true);
                setTimeout(() => setBlinkState(false), 150);
            }
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(blinkInterval);
    }, [state]);

    const getGlowColor = () => {
        switch (state) {
            case 'idle': return '#6B7280';
            case 'listening': return '#3B82F6';
            case 'speaking': return '#10B981';
            case 'processing': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getCharacterClass = () => {
        const baseClass = 'transform transition-all duration-300 ease-in-out';
        switch (state) {
            case 'idle':
                return `${baseClass} animate-pulse`;
            case 'listening':
                return `${baseClass} scale-110 animate-bounce`;
            case 'speaking':
                return `${baseClass} scale-105 animate-pulse`;
            case 'processing':
                return `${baseClass} animate-spin`;
            default:
                return baseClass;
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Glow Effect */}
            <div
                className={`absolute inset-0 rounded-full blur-xl opacity-60 ${state === 'listening' ? 'animate-ping' : ''
                    }`}
                style={{
                    background: `radial-gradient(circle, ${getGlowColor()}, transparent 70%)`
                }}
            />

            {/* Main Character */}
            <div className={`relative z-10 w-48 h-48 flex items-center justify-center ${getCharacterClass()}`}>
                <svg
                    width="192"
                    height="192"
                    viewBox="0 0 192 192"
                    className="drop-shadow-2xl"
                >
                    {/* Head Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="url(#headGradient)"
                        stroke={getGlowColor()}
                        strokeWidth={state === 'listening' ? "5" : "3"}
                        className="transition-all duration-300"
                    />

                    {/* Eyes */}
                    <ellipse
                        cx="76"
                        cy="80"
                        rx="8"
                        ry={blinkState ? "2" : "12"}
                        fill="#1F2937"
                        className="transition-all duration-150"
                    />
                    <ellipse
                        cx="116"
                        cy="80"
                        rx="8"
                        ry={blinkState ? "2" : "12"}
                        fill="#1F2937"
                        className="transition-all duration-150"
                    />

                    {/* Eye Glints */}
                    {!blinkState && (
                        <>
                            <circle
                                cx="78"
                                cy="77"
                                r="2"
                                fill="white"
                                className="animate-pulse"
                            />
                            <circle
                                cx="118"
                                cy="77"
                                r="2"
                                fill="white"
                                className="animate-pulse"
                            />
                        </>
                    )}

                    {/* Mouth */}
                    <path
                        d="M 80 120 Q 96 135 112 120"
                        stroke="#1F2937"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        className={state === 'speaking' ? 'animate-pulse' : ''}
                    />

                    {/* Audio Activity Indicator */}
                    {(state === 'speaking' || state === 'listening') && (
                        <circle
                            cx="96"
                            cy="150"
                            r="6"
                            fill={getGlowColor()}
                            className="animate-pulse"
                            style={{
                                transform: `scale(${1 + audioActivity * 0.5})`
                            }}
                        />
                    )}

                    {/* Gradient Definitions */}
                    <defs>
                        <radialGradient id="headGradient" cx="50%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#F3F4F6" />
                            <stop offset="70%" stopColor="#E5E7EB" />
                            <stop offset="100%" stopColor="#D1D5DB" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* State Indicator */}
            <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-200"
                style={{
                    backgroundColor: `${getGlowColor()}20`,
                    color: getGlowColor()
                }}
            >
                {state.charAt(0).toUpperCase() + state.slice(1)}
            </div>
        </div>
    );
};

export default MetuCharacter;
