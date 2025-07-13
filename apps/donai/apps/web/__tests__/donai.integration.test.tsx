import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DonAIPage from '../app/page';

describe('DonAI Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the main DonAI application', () => {
        render(<DonAIPage />);

        // Use getAllByText since DonAI appears multiple times (header and footer)
        const donaiElements = screen.getAllByText('DonAI');
        expect(donaiElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Blockchain Donations')).toBeInTheDocument();
    });

    it('displays the hero section with blockchain donation messaging', () => {
        render(<DonAIPage />);

        expect(screen.getByText(/Donații Transparente cu/)).toBeInTheDocument();
        expect(screen.getByText('Blockchain')).toBeInTheDocument();
        // Use getAllByText since this text appears in both hero and footer
        const platformTexts = screen.getAllByText(/Platforma românească pentru donații transparente/);
        expect(platformTexts.length).toBeGreaterThan(0);
    });

    it('shows platform statistics', () => {
        render(<DonAIPage />);

        expect(screen.getByText('2,847,950 RON')).toBeInTheDocument();
        expect(screen.getByText('Total Donat')).toBeInTheDocument();
        expect(screen.getByText('12,450')).toBeInTheDocument();
        expect(screen.getByText('Donatori Activi')).toBeInTheDocument();
        expect(screen.getByText('1,285')).toBeInTheDocument();
        expect(screen.getByText('Cauze Finalizate')).toBeInTheDocument();
        expect(screen.getByText('45,672')).toBeInTheDocument();
        expect(screen.getByText('Blocuri Validate')).toBeInTheDocument();
    });

    it('displays navigation menu', () => {
        render(<DonAIPage />);

        // Use getAllByText since navigation items appear in both header and footer
        const cauzeElements = screen.getAllByText('Cauze');
        expect(cauzeElements.length).toBeGreaterThan(0);
        const votareElements = screen.getAllByText('Votare');
        expect(votareElements.length).toBeGreaterThan(0);
        const statisticiElements = screen.getAllByText('Statistici');
        expect(statisticiElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Despre')).toBeInTheDocument();
    });

    it('shows wallet connection button', () => {
        render(<DonAIPage />);

        expect(screen.getByText('Conectează Wallet')).toBeInTheDocument();
    });

    it('displays featured causes with AI recommendations', () => {
        render(<DonAIPage />);

        expect(screen.getByText('Cauze Recomandate de AI')).toBeInTheDocument();
        expect(screen.getByText('Educație pentru Copii din Mediul Rural')).toBeInTheDocument();
        expect(screen.getByText('Sprijin pentru Vârstnici Singuri')).toBeInTheDocument();
        expect(screen.getByText('Mediu Curat - Plantare Păduri')).toBeInTheDocument();
    });

    it('shows cause verification badges', () => {
        render(<DonAIPage />);

        const verificationBadges = screen.getAllByText('Verificat');
        expect(verificationBadges.length).toBeGreaterThan(0);
    });

    it('displays voting section for community decisions', () => {
        render(<DonAIPage />);

        expect(screen.getByText('Votare Comunitate')).toBeInTheDocument();
        expect(screen.getByText('Prioritizarea Cauzelor de Sănătate')).toBeInTheDocument();
        expect(screen.getByText('Finanțarea Proiectelor Educaționale')).toBeInTheDocument();
    });

    it('shows platform features with blockchain and AI benefits', () => {
        render(<DonAIPage />);

        expect(screen.getByText('De ce DonAI?')).toBeInTheDocument();
        expect(screen.getByText('Transparență Totală')).toBeInTheDocument();
        expect(screen.getByText('AI Matching')).toBeInTheDocument();
        expect(screen.getByText('Impact Măsurabil')).toBeInTheDocument();
    });

    it('renders action buttons for donation and voting', () => {
        render(<DonAIPage />);

        expect(screen.getByText('Începe să Donezi')).toBeInTheDocument();
        expect(screen.getByText('Participă la Votare')).toBeInTheDocument();
    });

    it('displays footer with ecosystem links', () => {
        render(<DonAIPage />);

        expect(screen.getByText('CODAI Ecosystem')).toBeInTheDocument();
        expect(screen.getByText(/© 2025 DonAI - CODAI Ecosystem/)).toBeInTheDocument();
        expect(screen.getByText('RomAI')).toBeInTheDocument();
        expect(screen.getByText('DexAI')).toBeInTheDocument();
        expect(screen.getByText('ConversAI')).toBeInTheDocument();
    });

    it('shows progress bars for donation goals', () => {
        render(<DonAIPage />);

        // Check for progress indicators in the DOM
        const progressBars = document.querySelectorAll('.bg-gradient-to-r.from-blue-500.to-purple-500');
        expect(progressBars.length).toBeGreaterThan(0);
    });
});
