import { test, expect } from '@playwright/test';

test.describe('AIDE Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('chat interface loads correctly', async ({ page }) => {
    // Check main chat elements
    await expect(page.getByPlaceholder(/Type your message/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send/i })).toBeVisible();

    // Check projects sidebar
    await expect(page.getByText(/Projects/)).toBeVisible();
    await expect(page.getByText(/New Project/)).toBeVisible();
  });

  test('can send a message', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/Type your message/);
    const sendButton = page.getByRole('button', { name: /Send/i });

    // Type a test message
    await messageInput.fill('Hello AIDE, can you help me with a test project?');
    await sendButton.click();

    // Check that message appears in chat
    await expect(page.getByText(/Hello AIDE, can you help me with a test project?/)).toBeVisible();

    // Wait for AI response
    await expect(page.getByText(/I'd be happy to help/)).toBeVisible({ timeout: 5000 });
  });

  test('can create a new project', async ({ page }) => {
    // Click new project button
    await page.getByText(/New Project/).click();

    // Should open project creation modal or form
    await expect(page.getByText(/Create New Project/)).toBeVisible();

    // Fill project details
    await page.getByPlaceholder(/Project name/).fill('Test Project');
    await page.getByRole('button', { name: /Create/i }).click();

    // Project should appear in sidebar
    await expect(page.getByText(/Test Project/)).toBeVisible();
  });

  test('project sidebar navigation', async ({ page }) => {
    // Check if there are existing projects
    const projectItems = page.locator('[data-testid="project-item"]');
    const projectCount = await projectItems.count();

    if (projectCount > 0) {
      // Click on first project
      await projectItems.first().click();

      // Should load project context
      await expect(page.getByText(/Project:/)).toBeVisible();
    }
  });

  test('real-time message updates', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/Type your message/);

    // Send multiple messages quickly
    await messageInput.fill('Message 1');
    await page.getByRole('button', { name: /Send/i }).click();

    await messageInput.fill('Message 2');
    await page.getByRole('button', { name: /Send/i }).click();

    // Both messages should be visible
    await expect(page.getByText(/Message 1/)).toBeVisible();
    await expect(page.getByText(/Message 2/)).toBeVisible();
  });

  test('chat interface responsive design', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });

    // Chat input should still be accessible
    await expect(page.getByPlaceholder(/Type your message/)).toBeVisible();

    // Projects sidebar might be collapsed on mobile
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      await expect(page.getByText(/Projects/)).toBeVisible();
    }
  });

  test('message history persistence', async ({ page }) => {
    // Send a message
    await page.getByPlaceholder(/Type your message/).fill('Test persistence');
    await page.getByRole('button', { name: /Send/i }).click();

    // Reload page
    await page.reload();

    // Message should still be visible
    await expect(page.getByText(/Test persistence/)).toBeVisible();
  });
});
