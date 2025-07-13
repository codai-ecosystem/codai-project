import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomePage from '../app/index';

describe('BANCAI Mobile Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the main BANCAI Mobile application', () => {
        render(<HomePage />);

        expect(screen.getByText('CODAI Mobile')).toBeTruthy();
        expect(screen.getByText('Welcome to')).toBeTruthy();
    });

    it('displays the hero section with AI-powered messaging', () => {
        render(<HomePage />);

        expect(screen.getByText(/Build the Future with/)).toBeTruthy();
        expect(screen.getByText('AI-Powered')).toBeTruthy();
        expect(screen.getByText('Mobile Apps')).toBeTruthy();
    });

    it('shows the CODAI ecosystem template badge', () => {
        render(<HomePage />);

        expect(screen.getByText('CODAI Ecosystem Template - Mobile Edition')).toBeTruthy();
    });

    it('displays platform statistics', () => {
        render(<HomePage />);

        expect(screen.getByText('1M+')).toBeTruthy();
        expect(screen.getByText('Active Users')).toBeTruthy();
        expect(screen.getByText('99.9%')).toBeTruthy();
        expect(screen.getByText('Uptime')).toBeTruthy();
        expect(screen.getByText('50ms')).toBeTruthy();
        expect(screen.getByText('Response')).toBeTruthy();
        expect(screen.getByText('24/7')).toBeTruthy();
        expect(screen.getByText('Support')).toBeTruthy();
    });

    it('shows action buttons for navigation', () => {
        render(<HomePage />);

        expect(screen.getByText('Get Started')).toBeTruthy();
        expect(screen.getByText('Learn More')).toBeTruthy();
    });

    it('displays feature cards with AI capabilities', () => {
        render(<HomePage />);

        expect(screen.getByText('Powerful Features for Mobile')).toBeTruthy();
        expect(screen.getByText('AI-Powered')).toBeTruthy();
        expect(screen.getByText('Lightning Fast')).toBeTruthy();
        expect(screen.getByText('Secure')).toBeTruthy();
        expect(screen.getByText('Global Scale')).toBeTruthy();
    });

    it('shows feature descriptions', () => {
        render(<HomePage />);

        expect(screen.getByText('Advanced intelligence with real-time processing')).toBeTruthy();
        expect(screen.getByText('Optimized performance and edge computing')).toBeTruthy();
        expect(screen.getByText('Bank-grade security and encryption')).toBeTruthy();
        expect(screen.getByText('Worldwide infrastructure with 99.99% uptime')).toBeTruthy();
    });

    it('displays quick action cards', () => {
        render(<HomePage />);

        expect(screen.getByText('Quick Actions')).toBeTruthy();
        expect(screen.getByText('Analytics')).toBeTruthy();
        expect(screen.getByText('Settings')).toBeTruthy();
        expect(screen.getByText('Help')).toBeTruthy();
        expect(screen.getByText('Profile')).toBeTruthy();
    });

    it('shows quick action descriptions', () => {
        render(<HomePage />);

        expect(screen.getByText('View insights')).toBeTruthy();
        expect(screen.getByText('Customize app')).toBeTruthy();
        expect(screen.getByText('Get support')).toBeTruthy();
        expect(screen.getByText('Your account')).toBeTruthy();
    });

    it('displays the main app description', () => {
        render(<HomePage />);

        expect(screen.getByText(/A comprehensive ecosystem of interconnected AI tools/)).toBeTruthy();
        expect(screen.getByText(/designed for enterprise scale and mobile excellence/)).toBeTruthy();
    });

    it('renders proper component structure', () => {
        const { toJSON } = render(<HomePage />);

        expect(toJSON()).toMatchSnapshot();
    });
});
