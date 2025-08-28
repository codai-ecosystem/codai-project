'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { MotionPreference } from '@/components/types';

interface MotionContextType {
    motionPreference: MotionPreference;
    prefersReducedMotion: boolean;
    setMotionPreference: (preference: MotionPreference) => void;
    enableMotion: () => void;
    disableMotion: () => void;
    respectSystemPreference: () => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function useMotion() {
    const context = useContext(MotionContext);
    if (context === undefined) {
        throw new Error('useMotion must be used within a MotionProvider');
    }
    return context;
}

interface MotionProviderProps {
    children: ReactNode;
    defaultMotionPreference?: MotionPreference;
}

export function MotionProvider({ 
    children, 
    defaultMotionPreference = 'respect-system' 
}: MotionProviderProps) {
    const [motionPreference, setMotionPreferenceState] = useState<MotionPreference>(defaultMotionPreference);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Initialize motion preference from localStorage and system preferences
    useEffect(() => {
        try {
            // Check localStorage first
            const stored = localStorage.getItem('motion-preference') as MotionPreference | null;
            if (stored && ['enabled', 'disabled', 'respect-system'].includes(stored)) {
                setMotionPreferenceState(stored);
            }

            // Check system preference
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);

            // Listen for system preference changes
            const handleChange = (e: MediaQueryListEvent) => {
                setPrefersReducedMotion(e.matches);
            };
            
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } catch (error) {
            console.error('Error initializing motion preferences:', error);
        }
    }, []);

    // Update document attributes when preferences change
    useEffect(() => {
        try {
            let shouldDisableMotion = false;

            if (motionPreference === 'disabled') {
                shouldDisableMotion = true;
            } else if (motionPreference === 'respect-system' && prefersReducedMotion) {
                shouldDisableMotion = true;
            }

            // Set data attributes on document for CSS
            document.documentElement.setAttribute('data-motion-preference', motionPreference);
            document.documentElement.setAttribute('data-prefers-reduced-motion', prefersReducedMotion.toString());
            document.documentElement.setAttribute('data-disable-motion', shouldDisableMotion.toString());

            // Set CSS custom property for animation duration scaling
            const durationScale = shouldDisableMotion ? '0.01' : '1';
            document.documentElement.style.setProperty('--motion-duration-scale', durationScale);
        } catch (error) {
            console.error('Error updating motion preferences:', error);
        }
    }, [motionPreference, prefersReducedMotion]);

    const setMotionPreference = (preference: MotionPreference) => {
        try {
            setMotionPreferenceState(preference);
            localStorage.setItem('motion-preference', preference);
        } catch (error) {
            console.error('Error saving motion preference:', error);
            setMotionPreferenceState(preference);
        }
    };

    const enableMotion = () => setMotionPreference('enabled');
    const disableMotion = () => setMotionPreference('disabled');
    const respectSystemPreference = () => setMotionPreference('respect-system');

    const value: MotionContextType = {
        motionPreference,
        prefersReducedMotion,
        setMotionPreference,
        enableMotion,
        disableMotion,
        respectSystemPreference,
    };

    return (
        <MotionContext.Provider value={value}>
            {children}
        </MotionContext.Provider>
    );
}

export { MotionContext, type MotionContextType };