import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userPreferences } from '../lib/user-preferences';

describe('userPreferences debug', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		window.localStorage.clear();
		vi.clearAllMocks();

		// Check initial state
		console.log('Initial localStorage:', window.localStorage.getItem('codai_user_preferences'));
	});

	it('should reset preferences correctly', () => {
		// Check initial state
		console.log('1. Initial prefs:', userPreferences.getAll());

		// Set some non-default preferences first
		userPreferences.set('theme', 'dark');
		userPreferences.set('sidebarCollapsed', true);
		console.log('2. After setting prefs:', userPreferences.getAll());

		// Reset to defaults
		userPreferences.reset();
		console.log('3. After reset:', userPreferences.getAll());

		// Get fresh preferences after reset
		const prefs = userPreferences.getAll();
		console.log('4. Final prefs:', prefs);

		expect(prefs.theme).toBe('system');
		expect(prefs.sidebarCollapsed).toBe(false);
	});

	it('should handle accessibility correctly', () => {
		console.log('5. Initial state:', userPreferences.getAll());

		const result = userPreferences.updateAccessibility({
			reducedMotion: true,
			largeText: true
		});

		console.log('6. After update:', result);
		console.log('7. Full prefs:', userPreferences.getAll());

		expect(result).toEqual({
			reducedMotion: true,
			highContrast: false,
			largeText: true
		});
	});
});
