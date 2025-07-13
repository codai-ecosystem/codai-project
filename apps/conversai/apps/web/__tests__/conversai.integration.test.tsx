import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../app/page';

describe('ConversAI Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the main ConversAI application', () => {
        render(<HomePage />);

        expect(screen.getByText('ConversAI')).toBeInTheDocument();
        expect(screen.getByText('Professional Email with AI')).toBeInTheDocument();
    });

    it('displays the welcome section with Romanian content', () => {
        render(<HomePage />);

        expect(screen.getByText('Bun venit la ConversAI!')).toBeInTheDocument();
        expect(screen.getByText(/Serviciul profesional de email cu inteligență artificială/)).toBeInTheDocument();
    });

    it('shows the sidebar navigation with email folders', () => {
        render(<HomePage />);

        expect(screen.getByText('Compune Email')).toBeInTheDocument();
        expect(screen.getByText('Primite')).toBeInTheDocument();
        expect(screen.getByText('Trimise')).toBeInTheDocument();
        expect(screen.getByText('Marcate')).toBeInTheDocument();
        expect(screen.getByText('Arhivate')).toBeInTheDocument();
        expect(screen.getByText('Șters')).toBeInTheDocument();
    });

    it('displays unread email count in header notification', () => {
        render(<HomePage />);

        // Check for unread count in notification badge and sidebar
        const unreadBadges = screen.getAllByText('12');
        expect(unreadBadges.length).toBeGreaterThan(0);
    });

    it('shows current time in header', async () => {
        render(<HomePage />);

        await waitFor(() => {
            // Check if time is displayed (format: HH:MM:SS)
            const timeElement = screen.getByText(/\d{2}:\d{2}:\d{2}/);
            expect(timeElement).toBeInTheDocument();
        });
    });

    it('renders search functionality', () => {
        render(<HomePage />);

        const searchInput = screen.getByPlaceholderText('Caută în emailuri...');
        expect(searchInput).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'test search' } });
        expect(searchInput).toHaveValue('test search');
    });

    it('displays feature cards with AI capabilities', () => {
        render(<HomePage />);

        expect(screen.getByText('Email Profesional')).toBeInTheDocument();
        expect(screen.getByText('Asistență AI')).toBeInTheDocument();
        expect(screen.getByText('Management Avansat')).toBeInTheDocument();

        expect(screen.getByText(/Adrese email @codai.ro/)).toBeInTheDocument();
        expect(screen.getByText(/Compunere inteligentă/)).toBeInTheDocument();
        expect(screen.getByText(/Organizare inteligentă/)).toBeInTheDocument();
    });

    it('shows action buttons for getting started', () => {
        render(<HomePage />);

        expect(screen.getByText('Începe să folosești ConversAI')).toBeInTheDocument();
        expect(screen.getByText('Învață mai multe')).toBeInTheDocument();
    });

    it('displays header navigation icons', () => {
        render(<HomePage />);

        // Check for header icons (they should be rendered as svg elements)
        const headerSection = screen.getByRole('banner');
        expect(headerSection).toBeInTheDocument();

        // Check for notification bell with unread badge - use getAllByText since there are multiple "12" elements
        const unreadBadges = screen.getAllByText('12');
        expect(unreadBadges.length).toBeGreaterThan(0);
        // Check if one of them has the red notification badge style
        const notificationBadge = unreadBadges.find(badge => badge.classList.contains('bg-red-500'));
        expect(notificationBadge).toBeTruthy();
    });

    it('renders footer with ecosystem information', () => {
        render(<HomePage />);

        expect(screen.getByText('ConversAI - Parte din ecosistemul CODAI')).toBeInTheDocument();
        expect(screen.getByText(/© 2025 CODAI/)).toBeInTheDocument();
        expect(screen.getByText(/Email profesional cu inteligență artificială/)).toBeInTheDocument();
    });

    it('applies correct styling classes for glassmorphism design', () => {
        render(<HomePage />);

        const header = screen.getByRole('banner');
        expect(header).toHaveClass('bg-white/80', 'backdrop-blur-md');

        // Check the main page container (root div)
        const bodyElement = document.body;
        const mainDiv = bodyElement.querySelector('.min-h-screen');
        expect(mainDiv).toHaveClass('bg-gradient-to-br', 'from-blue-50');
    });
});
