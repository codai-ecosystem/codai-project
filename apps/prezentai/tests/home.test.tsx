import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../app/page';

describe('PREZENTAI Home Page', () => {
    it('should render without crashing', () => {
        render(<Home />);
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should display hero section', () => {
        render(<Home />);
        expect(screen.getByText(/AI Portfolio/i)).toBeInTheDocument();
    });

    it('should render navigation bar', () => {
        render(<Home />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
});
