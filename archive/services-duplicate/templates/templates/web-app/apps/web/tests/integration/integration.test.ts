/**
 * Integration Test Examples for METU Template
 * End-to-end testing scenarios for complete user workflows
 */

import { expect, test } from '@playwright/test';

import {
  AccessibilityHelpers,
  AuthHelpers,
  PerformanceHelpers,
} from '../advanced-test-utils';

// Authentication flow tests
test.describe('Authentication Integration', () => {
  test('complete signup and login flow', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');

    // Fill registration form
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@test.com');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirmPassword"]', 'SecurePassword123!');
    await page.check('[data-testid="acceptTerms"]');

    // Submit registration
    await page.click('[data-testid="register-submit"]');

    // Should redirect to verification page
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(
      page.locator('[data-testid="verification-message"]')
    ).toBeVisible();

    // For testing, simulate email verification
    await page.goto('/login');

    // Login with new credentials
    await page.fill('[data-testid="email"]', 'john.doe@test.com');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-welcome"]')).toContainText(
      'Welcome, John'
    );
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Request password reset
    await page.fill('[data-testid="email"]', 'user@test.com');
    await page.click('[data-testid="reset-submit"]');

    // Should show confirmation
    await expect(
      page.locator('[data-testid="reset-confirmation"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="reset-confirmation"]')
    ).toContainText('reset link sent');

    // Simulate clicking reset link (would normally come from email)
    await page.goto('/reset-password?token=test-token');

    // Set new password
    await page.fill('[data-testid="newPassword"]', 'NewSecurePassword123!');
    await page.fill('[data-testid="confirmPassword"]', 'NewSecurePassword123!');
    await page.click('[data-testid="update-password-submit"]');

    // Should redirect to login with success message
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Password updated'
    );
  });

  test('social authentication flow', async ({ page }) => {
    await page.goto('/login');

    // Mock Google OAuth (in real tests, you'd use OAuth test credentials)
    await page.route('**/auth/google', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: {
            id: 'google-user-id',
            email: 'user@gmail.com',
            displayName: 'Google User',
            photoURL: 'https://example.com/photo.jpg',
          },
        }),
      });
    });

    await page.click('[data-testid="google-login"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });
});

// User profile and settings tests
test.describe('User Profile Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await AuthHelpers.signInAsUser(page);
    await page.goto('/profile');
  });

  test('profile update flow', async ({ page }) => {
    // Update profile information
    await page.fill('[data-testid="firstName"]', 'Updated');
    await page.fill('[data-testid="lastName"]', 'Name');
    await page.fill('[data-testid="bio"]', 'Updated bio information');
    await page.fill('[data-testid="location"]', 'New Location');

    // Upload profile picture
    await page.setInputFiles(
      '[data-testid="photo-upload"]',
      'tests/fixtures/test-avatar.jpg'
    );

    // Save changes
    await page.click('[data-testid="save-profile"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Reload page and verify changes persisted
    await page.reload();
    await expect(page.locator('[data-testid="firstName"]')).toHaveValue(
      'Updated'
    );
    await expect(page.locator('[data-testid="lastName"]')).toHaveValue('Name');
  });

  test('password change flow', async ({ page }) => {
    await page.goto('/settings/security');

    // Change password
    await page.fill('[data-testid="currentPassword"]', 'CurrentPassword123!');
    await page.fill('[data-testid="newPassword"]', 'NewPassword123!');
    await page.fill('[data-testid="confirmNewPassword"]', 'NewPassword123!');

    await page.click('[data-testid="change-password-submit"]');

    // Should show success message
    await expect(
      page.locator('[data-testid="password-success"]')
    ).toBeVisible();

    // Should require re-authentication for sensitive actions
    await page.goto('/settings/delete-account');
    await expect(
      page.locator('[data-testid="reauthenticate-prompt"]')
    ).toBeVisible();
  });
});

// Data management tests
test.describe('Data Management Integration', () => {
  test.beforeEach(async ({ page }) => {
    await AuthHelpers.signInAsUser(page);
  });

  test('create, edit, and delete content flow', async ({ page }) => {
    await page.goto('/dashboard');

    // Create new post
    await page.click('[data-testid="create-post"]');
    await page.fill('[data-testid="post-title"]', 'Test Post Title');
    await page.fill(
      '[data-testid="post-content"]',
      'This is test post content'
    );
    await page.selectOption('[data-testid="post-category"]', 'technology');
    await page.click('[data-testid="publish-post"]');

    // Should redirect to post view
    await expect(page).toHaveURL(/\/posts\/[\w-]+/);
    await expect(page.locator('[data-testid="post-title"]')).toContainText(
      'Test Post Title'
    );

    // Edit post
    await page.click('[data-testid="edit-post"]');
    await page.fill('[data-testid="post-title"]', 'Updated Post Title');
    await page.click('[data-testid="save-post"]');

    // Verify update
    await expect(page.locator('[data-testid="post-title"]')).toContainText(
      'Updated Post Title'
    );

    // Delete post
    await page.click('[data-testid="delete-post"]');
    await page.click('[data-testid="confirm-delete"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.locator('[data-testid="no-posts-message"]')
    ).toBeVisible();
  });

  test('file upload and management', async ({ page }) => {
    await page.goto('/dashboard/files');

    // Upload multiple files
    await page.setInputFiles('[data-testid="file-upload"]', [
      'tests/fixtures/test-document.pdf',
      'tests/fixtures/test-image.jpg',
    ]);

    // Wait for uploads to complete
    await expect(page.locator('[data-testid="upload-progress"]')).toHaveCount(
      0
    );

    // Verify files appear in list
    await expect(page.locator('[data-testid="file-item"]')).toHaveCount(2);

    // Test file operations
    await page.click('[data-testid="file-options"]:first-child');
    await page.click('[data-testid="rename-file"]');
    await page.fill('[data-testid="new-filename"]', 'renamed-document.pdf');
    await page.click('[data-testid="confirm-rename"]');

    // Verify rename
    await expect(
      page.locator('[data-testid="filename"]').first()
    ).toContainText('renamed-document.pdf');
  });
});

// Performance testing integration
test.describe('Performance Integration', () => {
  test('page load performance', async ({ page }) => {
    const performanceData = await PerformanceHelpers.measurePageLoad(page, '/');

    expect(performanceData.firstContentfulPaint).toBeLessThan(1200);
    expect(performanceData.largestContentfulPaint).toBeLessThan(2500);
    expect(performanceData.cumulativeLayoutShift).toBeLessThan(0.25);
  });

  test('navigation performance', async ({ page }) => {
    await page.goto('/');

    // Measure navigation timing
    const startTime = Date.now();
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - startTime;

    expect(navigationTime).toBeLessThan(2000);
  });

  test('form submission performance', async ({ page }) => {
    await page.goto('/contact');

    // Fill and submit form, measure response time
    await page.fill('[data-testid="name"]', 'Test User');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="message"]', 'Test message content');

    const startTime = Date.now();
    await page.click('[data-testid="submit-contact"]');
    await page.waitForSelector('[data-testid="success-message"]');
    const submissionTime = Date.now() - startTime;

    expect(submissionTime).toBeLessThan(3000);
  });
});

// Accessibility integration tests
test.describe('Accessibility Integration', () => {
  test('keyboard navigation throughout app', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Navigate through main menu
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Should be able to activate focused elements with Enter/Space
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Verify navigation worked
    expect(page.url()).not.toBe('/');
  });
  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/'); // Check for proper ARIA labels and roles
    const accessibilityReport = await AccessibilityHelpers.runAxeCheck(page);
    expect(accessibilityReport.violations).toHaveLength(0);

    // Test specific screen reader scenarios
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('color contrast and visual accessibility', async ({ page }) => {
    await page.goto('/');

    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(1000); // Allow theme to apply

    const contrastReport = await AccessibilityHelpers.checkColorContrast(page);
    expect(contrastReport.failures).toHaveLength(0);
  });
});

// Error handling integration tests
test.describe('Error Handling Integration', () => {
  test('network error recovery', async ({ page }) => {
    await page.goto('/dashboard'); // Simulate network failure
    await page.context().setOffline(true);
    await page.click('[data-testid="refresh-data"]');

    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

    // Restore network and retry
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-connection"]');

    // Should recover and show data
    await expect(
      page.locator('[data-testid="offline-message"]')
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="dashboard-content"]')
    ).toBeVisible();
  });

  test('form validation error recovery', async ({ page }) => {
    await page.goto('/register');

    // Submit form with invalid data
    await page.click('[data-testid="register-submit"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Fix errors and resubmit
    await page.fill('[data-testid="email"]', 'valid@email.com');
    await page.fill('[data-testid="password"]', 'ValidPassword123!');

    // Errors should clear as user types
    await expect(page.locator('[data-testid="email-error"]')).not.toBeVisible();
    await expect(
      page.locator('[data-testid="password-error"]')
    ).not.toBeVisible();
  });

  test('session expiration handling', async ({ page }) => {
    await AuthHelpers.signInAsUser(page);
    await page.goto('/dashboard');

    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.removeItem('auth-token');
      sessionStorage.clear();
    });

    // Make authenticated request
    await page.click('[data-testid="user-profile"]');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.locator('[data-testid="session-expired-message"]')
    ).toBeVisible();
  });
});

// Mobile responsive integration tests
test.describe('Mobile Integration', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('mobile navigation and interactions', async ({ page }) => {
    await page.goto('/');

    // Mobile menu should be collapsed
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Navigate via mobile menu
    await page.click('[data-testid="mobile-menu-dashboard"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Mobile menu should close after navigation
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('mobile form interactions', async ({ page }) => {
    await page.goto('/contact');

    // Test mobile-friendly form inputs
    await page.fill('[data-testid="name"]', 'Mobile User');
    await page.fill('[data-testid="email"]', 'mobile@test.com');

    // Test mobile keyboard behavior
    const emailInput = page.locator('[data-testid="email"]');
    await emailInput.focus();

    // Email input should have email keyboard on mobile
    await expect(emailInput).toHaveAttribute('inputmode', 'email');
  });
});
