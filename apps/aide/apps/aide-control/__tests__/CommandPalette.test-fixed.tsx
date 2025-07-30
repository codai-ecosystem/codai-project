import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from '../components/ui/CommandPalette';

// Mock the userPreferences utility
const mockUserPreferences = {
	get: vi.fn(),
	set: vi.fn(),
	getAll: vi.fn(),
	update: vi.fn(),
	reset: vi.fn(),
	addRecentCommand: vi.fn(),
	dismissNotification: vi.fn(),
	isNotificationDismissed: vi.fn(),
	updateAccessibility: vi.fn(),
};

vi.mock('../lib/user-preferences', () => ({
	userPreferences: mockUserPreferences,
}));

// Mock next-themes
vi.mock('next-themes', () => ({
	useTheme: () => ({
		theme: 'system',
		setTheme: vi.fn(),
		resolvedTheme: 'light',
	}),
}));

const mockCommands = [
	{
		id: 'new-file',
		name: 'New File',
		category: 'File',
		action: vi.fn(),
		keywords: ['create', 'file'],
	},
	{
		id: 'open-file',
		name: 'Open File',
		category: 'File',
		action: vi.fn(),
		keywords: ['open'],
	},
	{
		id: 'toggle-theme',
		name: 'Toggle Theme',
		category: 'View',
		action: vi.fn(),
		keywords: ['theme', 'dark', 'light'],
	},
];

describe('CommandPalette', () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		commands: mockCommands,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Set up default mock return values
		mockUserPreferences.get.mockImplementation((key: string) => {
			if (key === 'recentCommands') {
				return [];
			}
			return null;
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly when open', () => {
		render(<CommandPalette {...defaultProps} />);

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
		expect(screen.getByText('New File')).toBeInTheDocument();
		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.getByText('Toggle Theme')).toBeInTheDocument();
	});

	it('does not render when closed', () => {
		render(<CommandPalette {...defaultProps} isOpen={false} />);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('filters commands when searching', async () => {
		const user = userEvent.setup();
		render(<CommandPalette {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search commands...');

		await user.type(searchInput, 'file');

		expect(screen.getByText('New File')).toBeInTheDocument();
		expect(screen.getByText('Open File')).toBeInTheDocument();
		expect(screen.queryByText('Toggle Theme')).not.toBeInTheDocument();
	});

	it('shows "no commands found" message when search has no matches', async () => {
		const user = userEvent.setup();
		render(<CommandPalette {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search commands...');

		await user.type(searchInput, 'nonexistent');

		expect(screen.getByText('No commands found')).toBeInTheDocument();
	});

	it('executes command action when clicked', async () => {
		const user = userEvent.setup();
		render(<CommandPalette {...defaultProps} />);

		const newFileCommand = screen.getByText('New File');

		await user.click(newFileCommand);

		expect(mockCommands[0].action).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('shows recent commands when they exist', () => {
		// Mock recent commands
		const recentCommands = [
			{ id: 'new-file', timestamp: Date.now() - 1000 },
			{ id: 'open-file', timestamp: Date.now() - 2000 },
		];

		mockUserPreferences.get.mockImplementation((key: string) => {
			if (key === 'recentCommands') {
				return recentCommands;
			}
			return null;
		});

		render(<CommandPalette {...defaultProps} />);

		expect(screen.getByText('Recent')).toBeInTheDocument();
		expect(screen.getByText('All Commands')).toBeInTheDocument();
	});

	it('navigates commands with keyboard arrows', async () => {
		render(<CommandPalette {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search commands...');

		// Arrow down should highlight first command
		fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

		const firstCommand = screen.getByText('New File').closest('button');
		expect(firstCommand).toHaveAttribute('data-headlessui-state', expect.stringContaining('active'));
	});

	it('executes command with Enter key', async () => {
		render(<CommandPalette {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search commands...');

		// Arrow down to select first command and press Enter
		fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
		fireEvent.keyDown(searchInput, { key: 'Enter' });

		expect(mockCommands[0].action).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('closes when Escape key is pressed', async () => {
		render(<CommandPalette {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search commands...');

		fireEvent.keyDown(searchInput, { key: 'Escape' });

		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('has the proper accessibility attributes', () => {
		render(<CommandPalette {...defaultProps} />);

		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-labelledby');

		const searchInput = screen.getByPlaceholderText('Search commands...');
		expect(searchInput).toHaveAttribute('aria-label', 'Search commands');

		const commandList = screen.getByRole('listbox');
		expect(commandList).toBeInTheDocument();
	});
});
