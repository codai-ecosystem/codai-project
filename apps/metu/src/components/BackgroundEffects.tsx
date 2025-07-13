import React from 'react';

interface BackgroundEffectsProps {
    state: 'idle' | 'listening' | 'speaking' | 'processing';
    className?: string;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
    state,
    className = ''
}) => {
    const getGradientColors = () => {
        switch (state) {
            case 'idle':
                return 'from-gray-100 via-blue-50 to-purple-50';
            case 'listening':
                return 'from-blue-100 via-blue-200 to-cyan-100';
            case 'speaking':
                return 'from-green-100 via-emerald-200 to-teal-100';
            case 'processing':
                return 'from-yellow-100 via-orange-200 to-red-100';
            default:
                return 'from-gray-100 via-blue-50 to-purple-50';
        }
    };

    const getAnimationClass = () => {
        switch (state) {
            case 'listening':
                return 'animate-pulse';
            case 'speaking':
                return 'animate-bounce';
            case 'processing':
                return 'animate-spin';
            default:
                return '';
        }
    };

    return (
        <div className={`fixed inset-0 -z-10 ${className}`}>
            {/* Main Gradient Background */}
            <div
                className={`
          absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out
          ${getGradientColors()}
          ${getAnimationClass()}
        `}
            />

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large Orb */}
                <div
                    className={`
            absolute w-96 h-96 rounded-full blur-3xl opacity-20
            bg-gradient-to-r from-blue-400 to-transparent
            top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2
            transition-all duration-2000 ease-in-out animate-float
            ${state === 'listening' ? 'scale-150 opacity-30' : 'scale-100'}
            ${state === 'speaking' ? 'from-green-400' : 'from-blue-400'}
          `}
                />

                {/* Medium Orb */}
                <div
                    className={`
            absolute w-64 h-64 rounded-full blur-2xl opacity-15
            bg-gradient-to-r from-purple-400 to-transparent
            top-3/4 right-1/4 transform translate-x-1/2 translate-y-1/2
            transition-all duration-2000 ease-in-out
            ${state === 'processing' ? 'scale-125 opacity-25' : 'scale-100'}
          `}
                    style={{
                        animation: 'float 6s ease-in-out infinite reverse'
                    }}
                />

                {/* Small Orb */}
                <div
                    className={`
            absolute w-32 h-32 rounded-full blur-xl opacity-10
            bg-gradient-to-r from-cyan-400 to-transparent
            top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2
            transition-all duration-2000 ease-in-out animate-float
            ${state === 'speaking' ? 'scale-200 opacity-20' : 'scale-100'}
          `}
                    style={{
                        animationDuration: '4s'
                    }}
                />
            </div>

            {/* Breathing Effect Overlay */}
            <div
                className={`
          absolute inset-0 bg-white/5 
          transition-opacity duration-1000 ease-in-out
          ${state === 'idle' ? 'opacity-100 animate-pulse' : 'opacity-0'}
        `}
            />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    );
};

export default BackgroundEffects;
