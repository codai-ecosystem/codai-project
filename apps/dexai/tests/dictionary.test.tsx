import React from 'react'
/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DictionaryPage from '@/app/dictionary/page';

// Mock the Firebase dictionary service
jest.mock('@/services/firebase-dictionary', () => ({
    FirebaseDictionaryService: {
        searchEntries: jest.fn().mockResolvedValue([
            {
                id: 'test-entry',
                word: 'test',
                language: 'ro',
                definitions: [
                    {
                        id: 'def-1',
                        text: 'A test definition',
                        language: 'ro',
                        source: 'DEX',
                        verified: true,
                        votes: { upvotes: 5, downvotes: 0, score: 5 }
                    }
                ],
                pronunciation: { ipa: '[test]', verified: true },
                etymology: { origin: 'Test origin', historicalDevelopment: [], relatedLanguages: {} },
                examples: [],
                synonyms: [],
                antonyms: [],
                rhymes: [],
                relatedWords: [],
                partOfSpeech: ['substantiv'],
                frequency: 'common',
                difficulty: 'beginner',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system',
                status: 'approved',
                votes: { upvotes: 5, downvotes: 0, score: 5 }
            }
        ])
    }
}));

describe('Dictionary Page', () => {
    it('should render dictionary search form', () => {
        render(<DictionaryPage />);

        // Check for main heading
        expect(screen.getByText('DEXAI')).toBeInTheDocument();
        expect(screen.getByText('Dicționarul explicativ al limbii române cu AI')).toBeInTheDocument();

        // Check for search input
        expect(screen.getByPlaceholderText(/caută un cuvânt/i)).toBeInTheDocument();

        // Check for search button
        expect(screen.getByText('Căutare')).toBeInTheDocument();
    });

    it('should display search results when searching', async () => {
        render(<DictionaryPage />);

        // Find search input and enter a search term
        const searchInput = screen.getByPlaceholderText(/caută un cuvânt/i);
        fireEvent.change(searchInput, { target: { value: 'test' } });

        // Click search button
        const searchButton = screen.getByText('Căutare');
        fireEvent.click(searchButton);

        // Wait for results to appear
        await waitFor(() => {
            expect(screen.getByText(/rezultate pentru/i)).toBeInTheDocument();
        });
    });
});

