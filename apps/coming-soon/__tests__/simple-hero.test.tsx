/**
 * Simple Hero Component Test - Vitest Version
 * Basic smoke test to verify Vitest configuration works
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test component to avoid canvas dependencies
const SimpleHero = () => {
    return (
        <section role="banner" data-testid="hero-section">
            <h1>CODAI - Coming Soon</h1>
            <p>Revolutionary AI Ecosystem</p>
            <button>Get Started</button>
        </section>
    );
};

describe('Simple Hero Component', () => {
    it('should render without crashing', () => {
        render(<SimpleHero />);
        expect(screen.getByRole('banner')).toBeDefined();
    });

    it('should display the main heading', () => {
        render(<SimpleHero />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeDefined();
        expect(heading.textContent).toMatch(/codai/i);
    });

    it('should display call-to-action button', () => {
        render(<SimpleHero />);
        const button = screen.getByRole('button');
        expect(button).toBeDefined();
        expect(button.textContent).toBe('Get Started');
    });
});