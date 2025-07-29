import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AudioVisualizer - Real-time Audio Analysis & Visualization
 * 
 * Features:
 * - Real-time frequency analysis with FFT
 * - Voice activity detection and level monitoring
 * - Audio waveform visualization
 * - Integration with AstralCharacter for reactive animations
 * - Multiple visualization modes: frequency bars, waveform, circular
 */

export interface AudioAnalysis {
    volume: number;           // 0-1 overall volume level
    frequencyData: number[];  // FFT frequency analysis data
    dominantFrequency: number; // Peak frequency in Hz
    isVoiceActive: boolean;   // Voice activity detection
    averageFrequency: number; // Weighted average frequency
    energyLevel: number;      // Total energy level
}

export interface AudioVisualizerProps {
    audioStream?: MediaStream;
    isActive: boolean;
    mode?: 'bars' | 'waveform' | 'circular' | 'particles';
    onAudioAnalysis?: (analysis: AudioAnalysis) => void;
    className?: string;
    height?: number;
    width?: number;
    color?: string;
    reactive?: boolean; // Whether to show visual representation
}

export interface AudioVisualizerHandle {
    getAudioAnalysis: () => AudioAnalysis | null;
    setAnalysisMode: (mode: 'bars' | 'waveform' | 'circular') => void;
    startAnalysis: () => void;
    stopAnalysis: () => void;
}

export const AudioVisualizer = React.forwardRef<AudioVisualizerHandle, AudioVisualizerProps>(({
    audioStream,
    isActive = false,
    mode = 'bars',
    onAudioAnalysis,
    className = '',
    height = 200,
    width = 400,
    color = '#8B5CF6',
    reactive = true
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [currentAnalysis, setCurrentAnalysis] = useState<AudioAnalysis | null>(null);
    const [analysisMode, setAnalysisMode] = useState<'bars' | 'waveform' | 'circular'>(mode === 'particles' ? 'bars' : mode);

    // Audio analysis parameters
    const FFT_SIZE = 512;
    const SMOOTHING = 0.8;
    const MIN_DECIBELS = -90;
    const MAX_DECIBELS = -10;

    /**
     * Initialize Web Audio API components
     */
    const initializeAudio = useCallback(async () => {
        if (!audioStream || audioContextRef.current) return;

        try {
            // Create audio context
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create analyser node
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = FFT_SIZE;
            analyserRef.current.smoothingTimeConstant = SMOOTHING;
            analyserRef.current.minDecibels = MIN_DECIBELS;
            analyserRef.current.maxDecibels = MAX_DECIBELS;

            // Create source from media stream
            sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
            sourceRef.current.connect(analyserRef.current);

            console.log('🎵 AudioVisualizer: Initialized audio analysis');
        } catch (error) {
            console.error('❌ AudioVisualizer: Failed to initialize audio:', error);
        }
    }, [audioStream]);

    /**
     * Perform real-time audio analysis
     */
    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current) return null;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const waveformData = new Uint8Array(bufferLength);

        // Get frequency and waveform data
        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(waveformData);

        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < waveformData.length; i++) {
            const sample = (waveformData[i] - 128) / 128;
            sum += sample * sample;
        }
        const volume = Math.sqrt(sum / waveformData.length);

        // Find dominant frequency
        let maxValue = 0;
        let dominantIndex = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] > maxValue) {
                maxValue = frequencyData[i];
                dominantIndex = i;
            }
        }

        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const dominantFrequency = (dominantIndex * sampleRate) / (2 * bufferLength);

        // Calculate average frequency (weighted by amplitude)
        let weightedSum = 0;
        let totalWeight = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const frequency = (i * sampleRate) / (2 * bufferLength);
            const amplitude = frequencyData[i];
            weightedSum += frequency * amplitude;
            totalWeight += amplitude;
        }
        const averageFrequency = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Calculate total energy
        const energyLevel = frequencyData.reduce((sum, value) => sum + value, 0) / (frequencyData.length * 255);

        // Voice activity detection (simple threshold-based)
        const isVoiceActive = volume > 0.01 && dominantFrequency > 80 && dominantFrequency < 3000;

        const analysis: AudioAnalysis = {
            volume: Math.min(volume * 10, 1), // Amplify and clamp
            frequencyData: Array.from(frequencyData),
            dominantFrequency,
            isVoiceActive,
            averageFrequency,
            energyLevel
        };

        return analysis;
    }, []);

    /**
     * Render frequency bars visualization
     */
    const renderFrequencyBars = useCallback((ctx: CanvasRenderingContext2D, analysis: AudioAnalysis) => {
        const { frequencyData } = analysis;
        const barCount = Math.min(frequencyData.length / 4, 64); // Reduce bars for better visual
        const barWidth = width / barCount;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(0.5, color + '80');
        gradient.addColorStop(1, color + 'FF');
        ctx.fillStyle = gradient;

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * 4); // Sample every 4th frequency bin
            const amplitude = frequencyData[dataIndex] || 0;
            const barHeight = (amplitude / 255) * height * 0.8;

            const x = i * barWidth;
            const y = height - barHeight;

            // Draw bar with rounded top
            ctx.beginPath();
            ctx.roundRect(x + 1, y, barWidth - 2, barHeight, [2, 2, 0, 0]);
            ctx.fill();

            // Add glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }, [width, height, color]);

    /**
     * Render waveform visualization
     */
    const renderWaveform = useCallback((ctx: CanvasRenderingContext2D, analysis: AudioAnalysis) => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.fftSize;
        const waveformData = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(waveformData);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;

        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = waveformData[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
    }, [width, height, color]);

    /**
     * Render circular visualization
     */
    const renderCircular = useCallback((ctx: CanvasRenderingContext2D, analysis: AudioAnalysis) => {
        const { frequencyData, volume } = analysis;
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) / 4;

        // Draw base circle
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw frequency peaks as radial lines
        const angleStep = (2 * Math.PI) / Math.min(frequencyData.length / 4, 64);

        for (let i = 0; i < Math.min(frequencyData.length / 4, 64); i++) {
            const dataIndex = i * 4;
            const amplitude = frequencyData[dataIndex] || 0;
            const normalizedAmplitude = amplitude / 255;

            const angle = i * angleStep;
            const innerRadius = baseRadius + 10;
            const outerRadius = innerRadius + normalizedAmplitude * (baseRadius / 2);

            const innerX = centerX + Math.cos(angle) * innerRadius;
            const innerY = centerY + Math.sin(angle) * innerRadius;
            const outerX = centerX + Math.cos(angle) * outerRadius;
            const outerY = centerY + Math.sin(angle) * outerRadius;

            // Create gradient for radial line
            const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
            gradient.addColorStop(0, color + '80');
            gradient.addColorStop(1, color + 'FF');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;

            ctx.beginPath();
            ctx.moveTo(innerX, innerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
        }

        // Draw volume indicator in center
        const volumeRadius = volume * (baseRadius / 3);
        const volumeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, volumeRadius);
        volumeGradient.addColorStop(0, color + 'FF');
        volumeGradient.addColorStop(1, color + '20');

        ctx.fillStyle = volumeGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, volumeRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0;
    }, [width, height, color]);

    /**
     * Animation loop
     */
    const animate = useCallback(() => {
        if (!isActive || !canvasRef.current) return;

        const analysis = analyzeAudio();
        if (!analysis) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
        }

        setCurrentAnalysis(analysis);
        onAudioAnalysis?.(analysis);

        if (reactive) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Render based on mode
            switch (analysisMode) {
                case 'bars':
                    renderFrequencyBars(ctx, analysis);
                    break;
                case 'waveform':
                    renderWaveform(ctx, analysis);
                    break;
                case 'circular':
                    renderCircular(ctx, analysis);
                    break;
            }
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isActive, reactive, analysisMode, analyzeAudio, renderFrequencyBars, renderWaveform, renderCircular, onAudioAnalysis]);

    /**
     * Start analysis
     */
    const startAnalysis = useCallback(() => {
        if (animationFrameRef.current) return;
        animate();
    }, [animate]);

    /**
     * Stop analysis
     */
    const stopAnalysis = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
        getAudioAnalysis: () => currentAnalysis,
        setAnalysisMode: (newMode: 'bars' | 'waveform' | 'circular') => setAnalysisMode(newMode),
        startAnalysis,
        stopAnalysis
    }), [currentAnalysis, startAnalysis, stopAnalysis]);

    // Initialize audio when stream is available
    useEffect(() => {
        if (audioStream && isActive) {
            initializeAudio();
        }
    }, [audioStream, isActive, initializeAudio]);

    // Start/stop analysis based on active state
    useEffect(() => {
        if (isActive) {
            startAnalysis();
        } else {
            stopAnalysis();
        }

        return () => stopAnalysis();
    }, [isActive, startAnalysis, stopAnalysis]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAnalysis();

            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stopAnalysis]);

    if (!reactive) {
        return null; // Invisible component for analysis only
    }

    return (
        <div className={`audio-visualizer ${className}`}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded-lg shadow-lg"
                style={{
                    background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
            />
        </div>
    );
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;
