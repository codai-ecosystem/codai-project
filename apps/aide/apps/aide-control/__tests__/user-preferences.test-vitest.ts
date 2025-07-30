/**
 * @vitest-environment jsdom
 */

import './setup';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userPreferences, type UserPreferences, type ThemeMode } from '../lib/user-preferences'

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => {
			return store[key] || null;
		},
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		}
	};
})();

describe('userPreferences utility', () => {

	beforeEach(() => {
		// Set up localStorage mock for this test
		Object.defineProperty(window, 'localStorage', { value: localStorageMock });
		// Clear localStorage before each test
		window.localStorage.clear();
		// Reset all mocks
		vi.clearAllMocks();
	});

	describe('getAll', () => {
		it('should return default preferences when localStorage is empty', () => {
			const prefs = userPreferences.getAll();

			expect(prefs).toEqual({
				theme: 'system',
				sidebarCollapsed: false,
				recentCommands: [],
				dismissedNotifications: [],
				accessibilityPreferences: {
					reducedMotion: false,
					highContrast: false,
					largeText: false
				}
			});
		});

		it('should return stored preferences from localStorage', () => {
			const mockPrefs: UserPreferences = {
				theme: 'dark',
				sidebarCollapsed: true,
				recentCommands: [{ id: 'test-command', timestamp: 1000 }],
				dismissedNotifications: ['notification-1'],
				accessibilityPreferences: {
					reducedMotion: true,
					highContrast: false,
					largeText: true
				}
			};

			window.localStorage.setItem('codai_user_preferences', JSON.stringify(mockPrefs));

			const prefs = userPreferences.getAll();
			expect(prefs).toEqual(mockPrefs);
		});

		it('should return default preferences if localStorage throws error', () => {
			// Mock a localStorage error
			vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
				throw new Error('localStorage error');
			});

			const prefs = userPreferences.getAll();

			expect(prefs).toEqual({
				theme: 'system',
				sidebarCollapsed: false,
				recentCommands: [],
				dismissedNotifications: [],
				accessibilityPreferences: {
					reducedMotion: false,
					highContrast: false,
					largeText: false
				}
			});
		});
	});

	describe('get', () => {
		it('should get a specific preference', () => {
			const mockPrefs: UserPreferences = {
				theme: 'dark',
				sidebarCollapsed: true,
				recentCommands: [],
				dismissedNotifications: [],
				accessibilityPreferences: {
					reducedMotion: false,
					highContrast: false,
					largeText: false
				}
			};

			window.localStorage.setItem('codai_user_preferences', JSON.stringify(mockPrefs));

			const theme = userPreferences.get('theme');
			expect(theme).toBe('dark');

			const sidebarCollapsed = userPreferences.get('sidebarCollapsed');
			expect(sidebarCollapsed).toBe(true);
		});

		it('should return default value if preference does not exist', () => {
			const theme = userPreferences.get('theme');
			expect(theme).toBe('system');
		});
	});

	describe('set', () => {
		it('should set a specific preference', () => {
			userPreferences.set('theme', 'dark');

			const storedPrefs = JSON.parse(window.localStorage.getItem('codai_user_preferences') || '{}');
			expect(storedPrefs.theme).toBe('dark');
		});

		it('should keep other preferences unchanged', () => {
			const mockPrefs: UserPreferences = {
				theme: 'light',
				sidebarCollapsed: false,
				recentCommands: [],
				dismissedNotifications: [],
				accessibilityPreferences: {
					reducedMotion: false,
					highContrast: false,
					largeText: false
				}
			};

			window.localStorage.setItem('codai_user_preferences', JSON.stringify(mockPrefs));

			userPreferences.set('sidebarCollapsed', true);

			const storedPrefs = JSON.parse(window.localStorage.getItem('codai_user_preferences') || '{}');
			expect(storedPrefs.theme).toBe('light');
			expect(storedPrefs.sidebarCollapsed).toBe(true);
		});

		it('should handle localStorage errors gracefully', () => {
			vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
				throw new Error('localStorage error');
			});

			// Should not throw
			expect(() => userPreferences.set('theme', 'dark')).not.toThrow();
		});
	});

	describe('update', () => {
		it('should update multiple preferences at once', () => {
			userPreferences.update({
				theme: 'dark',
				sidebarCollapsed: true
			});

			const storedPrefs = JSON.parse(window.localStorage.getItem('codai_user_preferences') || '{}');
			expect(storedPrefs.theme).toBe('dark');
			expect(storedPrefs.sidebarCollapsed).toBe(true);
		});

		it('should return the updated preferences', () => {
			const result = userPreferences.update({
				theme: 'dark',
				sidebarCollapsed: true
			});

			expect(result.theme).toBe('dark');
			expect(result.sidebarCollapsed).toBe(true);
		});
	});

	describe('reset', () => {
		it('should reset preferences to default values', () => {
			const mockPrefs: UserPreferences = {
				theme: 'dark',
				sidebarCollapsed: true,
				recentCommands: [{ id: 'test-command', timestamp: 1000 }],
				dismissedNotifications: ['notification-1'],
				accessibilityPreferences: {
					reducedMotion: true,
					highContrast: true,
					largeText: true
				}
			};

			window.localStorage.setItem('codai_user_preferences', JSON.stringify(mockPrefs));

			userPreferences.reset();

			const storedPrefs = JSON.parse(window.localStorage.getItem('codai_user_preferences') || '{}');
			expect(storedPrefs).toEqual({
				theme: 'system',
				sidebarCollapsed: false,
				recentCommands: [],
				dismissedNotifications: [],
				accessibilityPreferences: {
					reducedMotion: false,
					highContrast: false,
					largeText: false
				}
			});
		});
	});

	describe('addRecentCommand', () => {
		it('should add command to recent commands', () => {
			// Mock Date.now()
			vi.spyOn(Date, 'now').mockImplementation(() => 1000);

			userPreferences.addRecentCommand('test-command');

			const prefs = userPreferences.getAll();
			expect(prefs.recentCommands).toEqual([
				{ id: 'test-command', timestamp: 1000 }
			]);
		});

		it('should avoid duplicate commands', () => {
			// Mock different timestamps
			vi.spyOn(Date, 'now')
				.mockImplementationOnce(() => 1000)
				.mockImplementationOnce(() => 2000);

			userPreferences.addRecentCommand('test-command');
			userPreferences.addRecentCommand('test-command');

			const prefs = userPreferences.getAll();
			expect(prefs.recentCommands).toEqual([
				{ id: 'test-command', timestamp: 2000 }
			]);
		});

		it('should limit number of recent commands', () => {
			// Create initial state with 10 commands
			const commands = Array.from({ length: 10 }, (_, i) => ({
				id: `command-${i}`,
				timestamp: i
			}));

			userPreferences.update({ recentCommands: commands });

			// Mock timestamp for new command
			vi.spyOn(Date, 'now').mockImplementation(() => 1000);

			userPreferences.addRecentCommand('new-command');

			const prefs = userPreferences.getAll();
			expect(prefs.recentCommands.length).toBe(10);
			expect(prefs.recentCommands[0].id).toBe('new-command');
			expect(prefs.recentCommands[0].timestamp).toBe(1000);
			// The oldest command should be removed
			expect(prefs.recentCommands.find(cmd => cmd.id === 'command-0')).toBeUndefined();
		});
	});

	describe('dismissNotification', () => {
		it('should add notification ID to dismissed notifications', () => {
			userPreferences.dismissNotification('notification-1');

			const prefs = userPreferences.getAll();
			expect(prefs.dismissedNotifications).toContain('notification-1');
		});

		it('should not add duplicate notification IDs', () => {
			userPreferences.dismissNotification('notification-1');
			userPreferences.dismissNotification('notification-1');

			const prefs = userPreferences.getAll();
			expect(prefs.dismissedNotifications.filter(id => id === 'notification-1').length).toBe(1);
		});
	});

	describe('isNotificationDismissed', () => {
		it('should return true for dismissed notifications', () => {
			userPreferences.dismissNotification('notification-1');

			const isDismissed = userPreferences.isNotificationDismissed('notification-1');
			expect(isDismissed).toBe(true);
		});

		it('should return false for notifications that are not dismissed', () => {
			const isDismissed = userPreferences.isNotificationDismissed('notification-2');
			expect(isDismissed).toBe(false);
		});
	});

	describe('updateAccessibility', () => {
		it('should update accessibility preferences', () => {
			userPreferences.updateAccessibility({
				reducedMotion: true,
				highContrast: true
			});

			const prefs = userPreferences.getAll();
			expect(prefs.accessibilityPreferences).toEqual({
				reducedMotion: true,
				highContrast: true,
				largeText: false
			});
		});

		it('should return updated accessibility preferences', () => {
			const result = userPreferences.updateAccessibility({
				reducedMotion: true
			});

			expect(result).toEqual({
				reducedMotion: true,
				highContrast: false,
				largeText: false
			});
		});

		it('should keep existing values when updating partially', () => {
			userPreferences.updateAccessibility({
				highContrast: true,
				largeText: true
			});

			const result = userPreferences.updateAccessibility({
				reducedMotion: true
			});

			expect(result).toEqual({
				reducedMotion: true,
				highContrast: true,
				largeText: true
			});
		});
	});
});
