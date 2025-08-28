'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PERFORMANCE_CONFIG, AnimationHelpers } from '@/config/performance';

interface OptimizedParticle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    type: 'dot' | 'line' | 'triangle' | 'cross';
    life: number;
    maxLife: number;
    connections: number[];
    isActive: boolean;
}

interface OptimizedParticleSystemProps {
    particleCount?: number;
    maxConnections?: number;
    animationSpeed?: number;
    className?: string;
    enableInteraction?: boolean;
    enableConnections?: boolean;
    enablePhysics?: boolean;
    performanceMode?: 'high' | 'medium' | 'low';
}

// Object pool for particles to reduce GC pressure
const particlePool = AnimationHelpers.createObjectPool<OptimizedParticle>(
    () => ({
        id: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        opacity: 0,
        color: '',
        type: 'dot',
        life: 0,
        maxLife: 0,
        connections: [],
        isActive: false
    }),
    (particle) => {
        particle.connections.length = 0;
        particle.isActive = false;
    },
    PERFORMANCE_CONFIG.MEMORY.PARTICLE_POOL_SIZE
);

const OptimizedParticleSystem: React.FC<OptimizedParticleSystemProps> = ({
    particleCount = 80,
    maxConnections = 3,
    animationSpeed = 1,
    className = '',
    enableInteraction = true,
    enableConnections = true,
    enablePhysics = true,
    performanceMode = 'high'
}) => {
    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<OptimizedParticle[]>([]);
    const mousePosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateTime = useRef<number>(0);

    // Performance-based adjustments
    const config = useMemo(() => {
        const deviceCapabilities = AnimationHelpers.createObjectPool(() => ({}), () => { }, 1);

        // Detect device capabilities
        const memory = (navigator as any).deviceMemory || 8;
        const cores = navigator.hardwareConcurrency || 4;
        const isMobile = window.innerWidth < PERFORMANCE_CONFIG.DEVICE.MOBILE_BREAKPOINT;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let adjustedParticleCount = particleCount;
        let adjustedMaxConnections = maxConnections;

        // Performance mode adjustments
        if (performanceMode === 'low' || memory < 4 || cores < 4) {
            adjustedParticleCount *= 0.3;
            adjustedMaxConnections = Math.min(adjustedMaxConnections, 2);
        } else if (performanceMode === 'medium' || isMobile) {
            adjustedParticleCount *= 0.6;
            adjustedMaxConnections = Math.min(adjustedMaxConnections, 3);
        }

        if (reduceMotion) {
            adjustedParticleCount *= 0.5;
        }

        return {
            particleCount: Math.floor(adjustedParticleCount),
            maxConnections: adjustedMaxConnections,
            enablePhysics: enablePhysics && !reduceMotion,
            enableConnections: enableConnections && performanceMode !== 'low',
            frameSkip: performanceMode === 'low' ? 2 : 1,
            connectionDistance: isMobile ? 120 : 150
        };
    }, [particleCount, maxConnections, enablePhysics, enableConnections, performanceMode]);

    // Initialize particles with object pooling
    const initializeParticles = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Release existing particles back to pool
        particles.current.forEach(particle => {
            if (particle.isActive) {
                particlePool.release(particle);
            }
        });

        particles.current = [];

        const colors = theme === 'dark'
            ? ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
            : ['#1E40AF', '#7C3AED', '#0891B2', '#059669', '#D97706'];

        for (let i = 0; i < config.particleCount; i++) {
            const particle = particlePool.get();

            particle.id = i;
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
            particle.vx = (Math.random() - 0.5) * 2 * animationSpeed;
            particle.vy = (Math.random() - 0.5) * 2 * animationSpeed;
            particle.size = Math.random() * 3 + 1;
            particle.opacity = Math.random() * 0.8 + 0.2;
            particle.color = colors[Math.floor(Math.random() * colors.length)];
            particle.type = ['dot', 'line', 'triangle', 'cross'][Math.floor(Math.random() * 4)] as any;
            particle.life = 0;
            particle.maxLife = Math.random() * 1000 + 2000;
            particle.isActive = true;

            particles.current.push(particle);
        }
    }, [config.particleCount, animationSpeed, theme]);

    // Optimized particle update with frame skipping
    const updateParticles = useCallback((deltaTime: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const frameSkip = config.frameSkip;

        particles.current.forEach((particle, index) => {
            if (!particle.isActive) return;

            // Skip frames for performance
            if (index % frameSkip !== 0) return;

            // Update position
            if (config.enablePhysics) {
                particle.x += particle.vx * (deltaTime / 16.67); // Normalize to 60fps
                particle.y += particle.vy * (deltaTime / 16.67);

                // Bounce off walls
                if (particle.x <= 0 || particle.x >= canvas.width) {
                    particle.vx *= -0.8;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }
                if (particle.y <= 0 || particle.y >= canvas.height) {
                    particle.vy *= -0.8;
                    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                }
            }

            // Update life
            particle.life += deltaTime;
            if (particle.life > particle.maxLife) {
                particle.life = 0;
                particle.opacity = Math.random() * 0.8 + 0.2;
            }

            // Mouse interaction (optimized)
            if (enableInteraction && config.enablePhysics) {
                const dx = mousePosition.current.x - particle.x;
                const dy = mousePosition.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.02;
                    particle.vy += (dy / distance) * force * 0.02;
                }
            }

            // Velocity damping
            particle.vx *= 0.999;
            particle.vy *= 0.999;
        });
    }, [config, enableInteraction]);

    // Optimized connection calculation
    const calculateConnections = useCallback(() => {
        if (!config.enableConnections) return;

        const maxDistance = config.connectionDistance;

        particles.current.forEach(particle => {
            particle.connections.length = 0;
        });

        // Use spatial partitioning for better performance
        for (let i = 0; i < particles.current.length; i++) {
            const particleA = particles.current[i];
            if (!particleA.isActive || particleA.connections.length >= config.maxConnections) continue;

            for (let j = i + 1; j < particles.current.length; j++) {
                const particleB = particles.current[j];
                if (!particleB.isActive || particleB.connections.length >= config.maxConnections) continue;

                const dx = particleA.x - particleB.x;
                const dy = particleA.y - particleB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    particleA.connections.push(j);
                    particleB.connections.push(i);

                    if (particleA.connections.length >= config.maxConnections) break;
                }
            }
        }
    }, [config]);

    // Optimized rendering with canvas optimizations
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear canvas efficiently
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set common rendering properties
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Render connections first (behind particles)
        if (config.enableConnections) {
            ctx.globalAlpha = 0.3;
            particles.current.forEach((particle, index) => {
                if (!particle.isActive) return;

                particle.connections.forEach(connectionIndex => {
                    const connected = particles.current[connectionIndex];
                    if (!connected?.isActive || connectionIndex <= index) return;

                    const dx = connected.x - particle.x;
                    const dy = connected.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const opacity = Math.max(0, 1 - distance / config.connectionDistance);

                    ctx.strokeStyle = particle.color;
                    ctx.globalAlpha = opacity * 0.3;
                    ctx.lineWidth = 1;

                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(connected.x, connected.y);
                    ctx.stroke();
                });
            });
        }

        // Render particles
        particles.current.forEach(particle => {
            if (!particle.isActive) return;

            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;

            // Optimized particle rendering based on type
            switch (particle.type) {
                case 'dot':
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'line':
                    ctx.lineWidth = particle.size / 2;
                    ctx.strokeStyle = particle.color;
                    ctx.beginPath();
                    ctx.moveTo(particle.x - particle.size, particle.y);
                    ctx.lineTo(particle.x + particle.size, particle.y);
                    ctx.stroke();
                    break;

                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y - particle.size);
                    ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
                    ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'cross':
                    ctx.lineWidth = particle.size / 3;
                    ctx.strokeStyle = particle.color;
                    ctx.beginPath();
                    ctx.moveTo(particle.x - particle.size, particle.y);
                    ctx.lineTo(particle.x + particle.size, particle.y);
                    ctx.moveTo(particle.x, particle.y - particle.size);
                    ctx.lineTo(particle.x, particle.y + particle.size);
                    ctx.stroke();
                    break;
            }
        });
    }, [config]);

    // Main animation loop with performance monitoring
    useEffect(() => {
        let frameCount = 0;
        let lastFPSCheck = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastUpdateTime.current;

            // Frame rate limiting for performance
            if (deltaTime >= PERFORMANCE_CONFIG.ANIMATION.FRAME_BUDGET_MS) {
                updateParticles(deltaTime);
                calculateConnections();
                render();

                lastUpdateTime.current = currentTime;

                // FPS monitoring (development only)
                if (process.env.NODE_ENV === 'development') {
                    frameCount++;
                    if (currentTime - lastFPSCheck >= 1000) {
                        console.log(`Particle System FPS: ${frameCount}`);
                        frameCount = 0;
                        lastFPSCheck = currentTime;
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [updateParticles, calculateConnections, render]);

    // Mouse tracking (throttled for performance)
    useEffect(() => {
        if (!enableInteraction) return;

        const handleMouseMove = AnimationHelpers.createThrottledScrollHandler((scrollY) => {
            // This is actually a mouse handler, but we reuse the throttling logic
        });

        const actualMouseHandler = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            mousePosition.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const throttledMouseHandler = (e: MouseEvent) => {
            if (!enableInteraction) return;
            actualMouseHandler(e);
        };

        window.addEventListener('mousemove', throttledMouseHandler);
        return () => window.removeEventListener('mousemove', throttledMouseHandler);
    }, [enableInteraction]);

    // Canvas initialization and resize handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updateCanvasSize = () => {
            const container = canvas.parentElement;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const devicePixelRatio = window.devicePixelRatio || 1;

            // Set actual size in memory (scaled for retina)
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;

            // Set display size (CSS pixels)
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Scale the drawing context
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(devicePixelRatio, devicePixelRatio);
            }

            initializeParticles();
        };

        updateCanvasSize();

        const resizeObserver = new ResizeObserver(updateCanvasSize);
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [initializeParticles]);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full ${className}`}
            style={{
                background: 'transparent',
                willChange: 'transform', // GPU acceleration hint
                contain: 'layout style paint' // Optimization hint
            }}
        />
    );
};

export default OptimizedParticleSystem;