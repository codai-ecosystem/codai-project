import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock the RealVoiceService since it uses browser APIs
vi.mock('../services/RealVoiceService', () => ({
    RealVoiceService: vi.fn().mockImplementation(() => ({
        isSupported: true,
        isListening: false,
        initialize: vi.fn(),
        startListening: vi.fn(),
        stopListening: vi.fn(),
        testVoice: vi.fn(),
        destroy: vi.fn(),
    })),
}));

// Mock the SettingsPanel component
vi.mock('../components/SettingsPanel', () => {
    const MockSettingsPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
        isOpen ? (
            <div data-testid="settings-panel">
                <h2>METU Settings</h2>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null
    );

    return {
        default: MockSettingsPanel,
        SettingsPanel: MockSettingsPanel,
    };
});

// Import the App component after mocking
import App from '../App';

describe('METU App', () => {
    test('renders main app title', () => {
        render(<App />);
        expect(screen.getByText('METU Voice AI')).toBeInTheDocument();
    });

    test('renders voice controls section', () => {
        render(<App />);
        expect(screen.getByText('METU')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    test('renders conversation section', () => {
        render(<App />);
        expect(screen.getByRole('heading', { name: /conversation/i })).toBeInTheDocument();
        expect(screen.getByText('Start a conversation with METU')).toBeInTheDocument();
    });

    test('renders audio activity section', () => {
        render(<App />);
        expect(screen.getByText('Audio Activity')).toBeInTheDocument();
    });
});
