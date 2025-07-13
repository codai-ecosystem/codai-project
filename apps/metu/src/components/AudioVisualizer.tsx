import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
    audioData?: number[];
    isListening?: boolean;
    isSpeaking?: boolean;
    className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    audioData = [],
    isListening = false,
    isSpeaking = false,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / bars.length;
            const centerY = canvas.height / 2;

            bars.forEach((height, index) => {
                const x = index * barWidth;
                const barHeight = height * (canvas.height / 2);

                // Create gradient based on activity
                const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);

                if (isSpeaking) {
                    gradient.addColorStop(0, '#10B981');
                    gradient.addColorStop(0.5, '#34D399');
                    gradient.addColorStop(1, '#6EE7B7');
                } else if (isListening) {
                    gradient.addColorStop(0, '#3B82F6');
                    gradient.addColorStop(0.5, '#60A5FA');
                    gradient.addColorStop(1, '#93C5FD');
                } else {
                    gradient.addColorStop(0, '#6B7280');
                    gradient.addColorStop(0.5, '#9CA3AF');
                    gradient.addColorStop(1, '#D1D5DB');
                }

                ctx.fillStyle = gradient;

                // Draw symmetric bars
                ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight);
                ctx.fillRect(x, centerY, barWidth - 2, barHeight);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [bars, isListening, isSpeaking]);

    // Update bars based on audio data or generate fake data for demo
    useEffect(() => {
        if (audioData.length > 0) {
            // Use real audio data
            setBars(audioData.slice(0, 32));
            return;
        }

        if (isListening || isSpeaking) {
            // Generate fake animation data
            const interval = setInterval(() => {
                setBars(prev => prev.map((_, index) => {
                    const baseIntensity = isListening ? 0.3 : 0.5;
                    const randomFactor = Math.random() * 0.7;
                    const waveFactor = Math.sin(Date.now() * 0.01 + index * 0.5) * 0.3;
                    return Math.max(0, Math.min(1, baseIntensity + randomFactor + waveFactor));
                }));
            }, 50);

            return () => clearInterval(interval);
        } else {
            // Fade to idle
            setBars(prev => prev.map(bar => Math.max(0, bar * 0.9)));
            return;
        }
    }, [audioData, isListening, isSpeaking]);

    return (
        <div className={`relative ${className}`}>
            <canvas
                ref={canvasRef}
                width={256}
                height={80}
                className="w-full h-full rounded-lg opacity-80"
            />

            {/* Activity Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {(isListening || isSpeaking) && (
                    <div className={`
            px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm
            ${isListening
                            ? 'bg-blue-500/20 text-blue-600'
                            : 'bg-green-500/20 text-green-600'
                        }
          `}>
                        {isListening ? '🎤 Listening' : '🔊 Speaking'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioVisualizer;
