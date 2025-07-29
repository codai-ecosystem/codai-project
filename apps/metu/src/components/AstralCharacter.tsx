import React, { useEffect, useRef, useState } from 'react';
import type { AudioAnalysis } from './AudioVisualization';

/**
 * Astral Character - Animated AI Voice Assistant Entity
 * 
 * Features:
 * - Fluid animated astral form with particle effects
 * - Reactive animations synchronized with voice output
 * - Emotional expressions based on conversation context
 * - Idle animations with subtle energy flows
 * - Loading/thinking states with cosmic visuals
 * - Advanced audio synchronization with real-time FFT data
 */

export interface AstralCharacterProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking' | 'processing';
  emotion?: 'neutral' | 'happy' | 'focused' | 'excited' | 'calm';
  volume?: number; // 0-1 for voice activity visualization
  audioAnalysis?: AudioAnalysis; // Advanced audio data for frequency-reactive effects
  size?: 'small' | 'medium' | 'large';
  showParticles?: boolean;
  className?: string;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export const AstralCharacter: React.FC<AstralCharacterProps> = ({
  state = 'idle',
  emotion = 'neutral',
  volume = 0,
  audioAnalysis,
  size = 'medium',
  showParticles = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 120, height: 120, coreSize: 30 },
    medium: { width: 200, height: 200, coreSize: 50 },
    large: { width: 300, height: 300, coreSize: 80 }
  };

  const config = sizeConfig[size];

  // Color schemes based on state and emotion
  const getColorScheme = () => {
    const schemes = {
      idle: { primary: [120, 180, 255], secondary: [60, 120, 200], accent: [200, 150, 255] },
      listening: { primary: [100, 255, 150], secondary: [50, 200, 100], accent: [150, 255, 200] },
      speaking: { primary: [255, 120, 180], secondary: [200, 80, 140], accent: [255, 150, 200] },
      thinking: { primary: [255, 200, 100], secondary: [200, 150, 50], accent: [255, 220, 150] },
      processing: { primary: [180, 120, 255], secondary: [140, 80, 200], accent: [200, 150, 255] }
    };

    const emotionModifiers = {
      neutral: 1.0,
      happy: 1.2,
      focused: 0.8,
      excited: 1.5,
      calm: 0.6
    };

    const scheme = schemes[state];
    const modifier = emotionModifiers[emotion];

    return {
      primary: scheme.primary.map(c => Math.min(255, c * modifier)),
      secondary: scheme.secondary.map(c => Math.min(255, c * modifier)),
      accent: scheme.accent.map(c => Math.min(255, c * modifier))
    };
  };

  // Create particle
  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;

    return {
      id: Math.random().toString(36),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      opacity: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: Math.random() * 60 + 30,
      size: Math.random() * 3 + 1,
      hue: Math.random() * 60 + (state === 'listening' ? 120 : state === 'speaking' ? 300 : 240)
    };
  };

  // Update particles with frequency-reactive behavior
  const updateParticles = () => {
    const particles = particlesRef.current;

    // Extract frequency analysis data
    const frequencyIntensity = audioAnalysis?.dominantFrequency ?
      (audioAnalysis.dominantFrequency / 2000) * (audioAnalysis.volume || 0) : 0;
    const frequencyHue = audioAnalysis?.dominantFrequency ?
      (audioAnalysis.dominantFrequency % 360) : 240;
    const bassResponse = audioAnalysis?.frequencyData ?
      (audioAnalysis.frequencyData[0] + audioAnalysis.frequencyData[1]) / 2 : 0;
    const trebleResponse = audioAnalysis?.frequencyData ?
      (audioAnalysis.frequencyData[audioAnalysis.frequencyData.length - 2] +
        audioAnalysis.frequencyData[audioAnalysis.frequencyData.length - 1]) / 2 : 0;

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Fade out as particle ages
      particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));

      // Apply frequency-based particle behavior
      if (audioAnalysis && state === 'speaking') {
        // Make particles dance to frequency data
        const frequencyPush = frequencyIntensity * 2;
        particle.vx += (Math.random() - 0.5) * frequencyPush;
        particle.vy += (Math.random() - 0.5) * frequencyPush;

        // Update particle color based on dominant frequency
        particle.hue = frequencyHue + (Math.random() - 0.5) * 60;

        // Size modulation based on frequency bands
        const sizeModulation = (bassResponse + trebleResponse) / 2;
        particle.size = Math.max(1, particle.size * (1 + sizeModulation * 0.5));
      }

      // Apply gentle drift towards center for cosmic effect
      const centerX = config.width / 2;
      const centerY = config.height / 2;
      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > config.coreSize * 2) {
        particle.vx += (dx / distance) * 0.02;
        particle.vy += (dy / distance) * 0.02;
      }

      // Remove dead particles
      if (particle.life >= particle.maxLife || particle.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    // Add new particles based on state and frequency analysis
    let particleCount = {
      idle: 2,
      listening: 4 + Math.floor(volume * 6),
      speaking: 6 + Math.floor(volume * 10),
      thinking: 3,
      processing: 8
    }[state] || 2;

    // Boost particle generation based on audio activity
    if (audioAnalysis && (state === 'speaking' || state === 'listening')) {
      const audioBoost = Math.floor(frequencyIntensity * 15);
      particleCount += audioBoost;
    }

    if (showParticles && particles.length < particleCount * 3) {
      const centerX = config.width / 2;
      const centerY = config.height / 2;
      const radius = config.coreSize + Math.random() * 20;

      // Create frequency-based particle spawn patterns
      let angle: number;
      if (audioAnalysis && state === 'speaking') {
        // Spawn particles in patterns based on frequency
        const frequencyAngle = (audioAnalysis.dominantFrequency / 2000) * Math.PI * 2;
        angle = frequencyAngle + (Math.random() - 0.5) * Math.PI;
      } else {
        angle = Math.random() * Math.PI * 2;
      }

      const newParticle = createParticle(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );

      // Apply frequency-based properties to new particles
      if (audioAnalysis && state === 'speaking') {
        newParticle.hue = frequencyHue + (Math.random() - 0.5) * 90;
        newParticle.size *= (1 + frequencyIntensity);
        newParticle.maxLife = Math.max(30, newParticle.maxLife * (1 + bassResponse));
      }

      particles.push(newParticle);
    }
  };

  // Draw astral core with frequency-reactive effects
  const drawAstralCore = (ctx: CanvasRenderingContext2D, time: number) => {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const colors = getColorScheme();

    // Base pulsing effect enhanced with frequency data
    const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;
    const volumePulse = state === 'speaking' ? (1 + volume * 0.5) : 1;

    // Frequency-reactive size modulation
    const frequencyPulse = audioAnalysis?.energyLevel ?
      (1 + audioAnalysis.energyLevel * 0.3) : 1;

    const coreRadius = config.coreSize * pulse * volumePulse * frequencyPulse;

    // Frequency-reactive color shifts
    let coreColors = colors;
    if (audioAnalysis && state === 'speaking') {
      const frequencyHue = (audioAnalysis.dominantFrequency / 2000) * 360;
      const hueShift = Math.floor(frequencyHue % 360);

      // Create frequency-influenced color palette
      coreColors = {
        primary: [
          Math.min(255, colors.primary[0] + Math.sin(hueShift * Math.PI / 180) * 50),
          Math.min(255, colors.primary[1] + Math.cos(hueShift * Math.PI / 180) * 50),
          Math.min(255, colors.primary[2] + Math.sin((hueShift + 120) * Math.PI / 180) * 50)
        ],
        secondary: colors.secondary,
        accent: [
          Math.min(255, colors.accent[0] + Math.cos(hueShift * Math.PI / 180) * 40),
          Math.min(255, colors.accent[1] + Math.sin(hueShift * Math.PI / 180) * 40),
          Math.min(255, colors.accent[2] + Math.cos((hueShift + 240) * Math.PI / 180) * 40)
        ]
      };
    }

    // Create radial gradient for astral core
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreRadius * 1.5
    );

    gradient.addColorStop(0, `rgba(${coreColors.accent.join(',')}, 0.9)`);
    gradient.addColorStop(0.4, `rgba(${coreColors.primary.join(',')}, 0.7)`);
    gradient.addColorStop(0.8, `rgba(${coreColors.secondary.join(',')}, 0.4)`);
    gradient.addColorStop(1, `rgba(${coreColors.secondary.join(',')}, 0.1)`);

    // Draw main astral form
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add frequency-reactive energy rings for active states
    if (state === 'speaking' || state === 'processing') {
      const ringCount = audioAnalysis?.isVoiceActive ? 5 : 3;
      const frequencyIntensity = audioAnalysis?.energyLevel || 0;

      for (let i = 0; i < ringCount; i++) {
        const ringRadius = coreRadius + (i + 1) * (15 + frequencyIntensity * 10);
        const ringOpacity = (0.3 - i * 0.1) * pulse * (1 + frequencyIntensity * 0.5);

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${coreColors.primary.join(',')}, ${ringOpacity})`;
        ctx.lineWidth = 2 + frequencyIntensity * 2;
        ctx.stroke();

        // Add frequency-reactive ring distortions
        if (audioAnalysis && audioAnalysis.frequencyData.length > 0) {
          const segments = 12;
          ctx.beginPath();
          for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const freqIndex = Math.floor((j / segments) * audioAnalysis.frequencyData.length);
            const freqValue = audioAnalysis.frequencyData[freqIndex] / 255;
            const distortion = freqValue * 5;

            const x = centerX + Math.cos(angle) * (ringRadius + distortion);
            const y = centerY + Math.sin(angle) * (ringRadius + distortion);

            if (j === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.strokeStyle = `rgba(${coreColors.accent.join(',')}, ${ringOpacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Add inner glow for focused states
    if (state === 'thinking' || state === 'listening') {
      const innerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreRadius * 0.6
      );

      const glowIntensity = audioAnalysis?.isVoiceActive ? 1.2 : 0.8;
      innerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * glowIntensity})`);
      innerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
    }
  };

  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;

    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;

      // Create particle gradient
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );

      gradient.addColorStop(0, `hsl(${particle.hue}, 80%, 70%)`);
      gradient.addColorStop(1, `hsl(${particle.hue}, 60%, 50%)`);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add particle glow
      ctx.shadowColor = `hsl(${particle.hue}, 80%, 70%)`;
      ctx.shadowBlur = particle.size * 2;
      ctx.fill();

      ctx.restore();
    });
  };

  // Animation loop
  const animate = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Update and draw particles
    updateParticles();
    drawParticles(ctx);

    // Draw astral core
    drawAstralCore(ctx, currentTime);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Initialize animation
  useEffect(() => {
    setIsAnimating(true);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsAnimating(false);
    };
  }, [state, emotion, volume, size, showParticles]);

  // Clean up particles when state changes dramatically
  useEffect(() => {
    if (state === 'idle') {
      particlesRef.current = particlesRef.current.slice(0, 5);
    }
  }, [state]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="rounded-full"
        style={{
          filter: `drop-shadow(0 0 20px rgba(${getColorScheme().primary.join(',')}, 0.3))`,
          animation: state === 'thinking' ? 'pulse 2s infinite' : undefined
        }}
      />

      {/* State indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${state === 'idle' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
            state === 'listening' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
              state === 'speaking' ? 'bg-pink-500/20 border-pink-500/30 text-pink-300' :
                state === 'thinking' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                  'bg-purple-500/20 border-purple-500/30 text-purple-300'
          }`}>
          {state.charAt(0).toUpperCase() + state.slice(1)}
        </div>
      </div>

      {/* Emotion indicator (optional debug info) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
          {emotion} • {Math.round(volume * 100)}%
        </div>
      )}
    </div>
  );
};

export default AstralCharacter;
