/**
 * @vitest-environment jsdom
 */

import './setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette, useCommandPalette } from '../components/ui/CommandPalette'
import { userPreferences } from '../lib/user-preferences'

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
	})
}));

// Mock userPreferences
vi.mock('../lib/user-preferences', () => ({
	userPreferences: {
		addRecentCommand: vi.fn(),
		get: vi.fn(() => []),
	}
}));

describe('CommandPalette', () => {
	const mockCommands = [
		{
			id: 'command-1',
			name: 'Command 1',
			description: 'This is command 1',
			category: 'Category A'
		},
		{
			id: 'command-2',
			name: 'Command 2',
			description: 'This is command 2',
			category: 'Category B'
		},
		{
			id: 'command-3',
			name: 'Command 3',
			description: 'This is command 3',
			category: 'Category A',
			action: vi.fn()
		},
	];

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		// Mock user preferences to return empty recent commands
		vi.mocked(userPreferences.get).mockReturnValue([]);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders correctly when open', () => {
		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		// Check if command palette is rendered
		expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();

		// Check if categories are rendered
		expect(screen.getByText('Category A')).toBeInTheDocument();
		expect(screen.getByText('Category B')).toBeInTheDocument();

		// Check if commands are rendered
		expect(screen.getByText('Command 1')).toBeInTheDocument();
		expect(screen.getByText('Command 2')).toBeInTheDocument();
		expect(screen.getByText('Command 3')).toBeInTheDocument();
	});

	it('filters commands when searching', () => {
		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		// Type in search box
		fireEvent.change(screen.getByPlaceholderText('Search commands...'), {
			target: { value: 'command 1' },
		});

		// Should show only Command 1
		expect(screen.getByText('Command 1')).toBeInTheDocument();
		expect(screen.queryByText('Command 2')).not.toBeInTheDocument();
		expect(screen.queryByText('Command 3')).not.toBeInTheDocument();
	});

	it('executes command action when clicked', () => {
		const mockAction = vi.fn();
		const mockOnClose = vi.fn();

		render(
			<CommandPalette
				commands={[
					{
						id: 'command-with-action',
						name: 'Command With Action',
						action: mockAction,
						category: 'Test'
					},
				]}
				isOpen={true}
				onClose={mockOnClose}
			/>
		);

		// Click on command
		fireEvent.click(screen.getByText('Command With Action'));

		// Action should be called
		expect(mockAction).toHaveBeenCalled();

		// onClose should be called
		expect(mockOnClose).toHaveBeenCalled();

		// Recent command should be saved
		expect(userPreferences.addRecentCommand).toHaveBeenCalledWith('command-with-action');
	});

	it('shows recent commands when they exist', () => {
		// Mock recent commands
		const mockRecentCommands = [
			{ id: 'command-1', timestamp: 1000 },
			{ id: 'command-3', timestamp: 2000 }
		];

		vi.mocked(userPreferences.get).mockReturnValue(mockRecentCommands);

		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		// Check for recent commands section
		expect(screen.getByText('Recent Commands')).toBeInTheDocument();

		// Should show Command 1 and Command 3 in recent commands
		const recentCommandElements = screen.getAllByText(/(Command 1|Command 3)/);
		expect(recentCommandElements.length).toBeGreaterThanOrEqual(2);
	});

	it('shows "no commands found" message when search has no matches', () => {
		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		// Type non-matching search query
		fireEvent.change(screen.getByPlaceholderText('Search commands...'), {
			target: { value: 'nonexistent command' },
		});

		// Should show no matches message
		expect(screen.getByText(/No commands found for/)).toBeInTheDocument();
	});

	it('navigates commands with keyboard arrows', async () => {
		const user = userEvent.setup();

		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		const searchInput = screen.getByPlaceholderText('Search commands...');
		searchInput.focus();

		// Press down arrow to select first command
		await user.keyboard('{ArrowDown}');

		// Verify the first command is highlighted
		const firstCommand = screen.getByText('Command 1').closest('li');
		expect(firstCommand).toHaveAttribute('data-highlighted', 'true');

		// Press down arrow again to select second command
		await user.keyboard('{ArrowDown}');

		// Verify the second command is highlighted
		const secondCommand = screen.getByText('Command 2').closest('li');
		expect(secondCommand).toHaveAttribute('data-highlighted', 'true');

		// Press up arrow to go back to first command
		await user.keyboard('{ArrowUp}');
		expect(firstCommand).toHaveAttribute('data-highlighted', 'true');
	});

	it('executes command with Enter key', async () => {
		const mockAction = vi.fn();
		const mockOnClose = vi.fn();
		const user = userEvent.setup();

		render(
			<CommandPalette
				commands={[
					{
						id: 'test-command',
						name: 'Test Command',
						action: mockAction,
						category: 'Test'
					}
				]}
				isOpen={true}
				onClose={mockOnClose}
			/>
		);

		const searchInput = screen.getByPlaceholderText('Search commands...');
		searchInput.focus();

		// Press down arrow to select the command
		await user.keyboard('{ArrowDown}');

		// Press Enter to execute the command
		await user.keyboard('{Enter}');

		// Action should be called
		expect(mockAction).toHaveBeenCalled();

		// onClose should be called
		expect(mockOnClose).toHaveBeenCalled();
	});

	it('closes when Escape key is pressed', async () => {
		const mockOnClose = vi.fn();
		const user = userEvent.setup();

		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={mockOnClose}
			/>
		);

		// Press Escape
		await user.keyboard('{Escape}');

		// onClose should be called
		expect(mockOnClose).toHaveBeenCalled();
	});

	it('has the proper accessibility attributes', () => {
		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={true}
				onClose={vi.fn()}
			/>
		);

		// Check dialog role
		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		// Check label for search input
		const searchInput = screen.getByPlaceholderText('Search commands...');
		expect(searchInput).toHaveAttribute('aria-expanded', 'true');

		// Check for listbox role
		const listbox = screen.getAllByRole('listbox');
		expect(listbox.length).toBeGreaterThan(0);
	});

	it('does not render when closed', () => {
		render(
			<CommandPalette
				commands={mockCommands}
				isOpen={false}
				onClose={vi.fn()}
			/>
		);

		// Command palette should not be rendered
		expect(screen.queryByPlaceholderText('Search commands...')).not.toBeInTheDocument();
		expect(screen.queryByText('Category A')).not.toBeInTheDocument();
		expect(screen.queryByText('Command 1')).not.toBeInTheDocument();
	});
});

// Test useCommandPalette hook
describe('useCommandPalette', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Mock window event listener
		vi.spyOn(document, 'addEventListener').mockImplementation(vi.fn());
		vi.spyOn(document, 'removeEventListener').mockImplementation(vi.fn());
	});

	it('registers keyboard shortcut for Ctrl+K', () => {
		// Setup a simple component using the hook
		const TestComponent = () => {
			const commandPalette = useCommandPalette();
			return null;
		};

		// Render the test component
		render(<TestComponent />);

		// Check if event listener was added
		expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
	});

	it('adds command to collection', () => {
		let testCommandPalette: ReturnType<typeof useCommandPalette>;

		// Setup a component that exposes the hook result
		const TestComponent = () => {
			const commandPalette = useCommandPalette();
			testCommandPalette = commandPalette;
			return null;
		};

		// Render the test component
		render(<TestComponent />);

		// Add a new command
		testCommandPalette!.addCommand({
			id: 'new-command',
			name: 'New Command',
			category: 'Test'
		});

		// Check if command was added
		expect(testCommandPalette!.commands).toContainEqual({
			id: 'new-command',
			name: 'New Command',
			category: 'Test'
		});
	});

	it('executes command and records it in history', () => {
		let testCommandPalette: ReturnType<typeof useCommandPalette>;
		const mockAction = vi.fn();

		// Setup a component that exposes the hook result
		const TestComponent = () => {
			const commandPalette = useCommandPalette([
				{ id: 'test-command', name: 'Test Command', action: mockAction }
			]);
			testCommandPalette = commandPalette;
			return null;
		};

		// Render the test component
		render(<TestComponent />);

		// Execute command
		testCommandPalette!.executeCommand(testCommandPalette!.commands[0]);

		// Action should be called
		expect(mockAction).toHaveBeenCalled();

		// Recent command should be saved
		expect(userPreferences.addRecentCommand).toHaveBeenCalledWith('test-command');
	});

	it('opens and closes command palette', () => {
		let testCommandPalette: ReturnType<typeof useCommandPalette>;

		// Setup a component that exposes the hook result
		const TestComponent = () => {
			const commandPalette = useCommandPalette();
			testCommandPalette = commandPalette;
			return null;
		};

		// Render the test component
		render(<TestComponent />);

		// Initially closed
		expect(testCommandPalette!.isOpen).toBe(false);

		// Open command palette
		testCommandPalette!.open();
		expect(testCommandPalette!.isOpen).toBe(true);

		// Close command palette
		testCommandPalette!.close();
		expect(testCommandPalette!.isOpen).toBe(false);
	});
	it('toggles command palette state', () => {
		let testCommandPalette: ReturnType<typeof useCommandPalette>;

		// Setup a component that exposes the hook result
		const TestComponent = () => {
			const commandPalette = useCommandPalette();
			testCommandPalette = commandPalette;
			return null;
		};

		// Render the test component
		render(<TestComponent />);

		// Initially closed
		expect(testCommandPalette!.isOpen).toBe(false);

		// Open command palette
		testCommandPalette!.open();
		expect(testCommandPalette!.isOpen).toBe(true);

		// Close command palette
		testCommandPalette!.close();
		expect(testCommandPalette!.isOpen).toBe(false);
	});

	it('cleans up event listeners on unmount', () => {
		// Setup a simple component using the hook
		const TestComponent = () => {
			useCommandPalette();
			return null;
		};

		// Render the test component
		const { unmount } = render(<TestComponent />);

		// Unmount the component
		unmount();

		// Check if event listener was removed
		expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
	});
});
