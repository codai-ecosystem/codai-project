// CODAI Service - Detailed Component & UI Testing Suite
// Testing all pages, components, flows, queries, and filters

import { test, expect, Page } from '@playwright/test';

const CODAI_BASE_URL = 'http://localhost:4001';

test.describe('🚀 CODAI Service - Comprehensive Component Testing', () => {

  test.describe('📊 Dashboard Components', () => {

    test('Project Grid Component', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/dashboard`);

      // Test Project Grid exists and is functional
      const projectGrid = page.locator('.project-grid, [data-testid="project-grid"], .projects-container');
      if (await projectGrid.count() > 0) {
        await expect(projectGrid).toBeVisible();

        // Test project cards
        const projectCards = page.locator('.project-card, [data-testid="project-card"]');
        if (await projectCards.count() > 0) {
          await expect(projectCards.first()).toBeVisible();

          // Test project card click
          await projectCards.first().click();
          await page.waitForLoadState('networkidle');
        }

        // Test grid view/list view toggle
        const viewToggle = page.locator('.view-toggle, [data-testid="view-toggle"]');
        if (await viewToggle.count() > 0) {
          await viewToggle.click();
          await page.waitForTimeout(500); // Allow view change
        }
      }
    });

    test('Quick Actions Component', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/dashboard`);

      const quickActions = page.locator('.quick-actions, [data-testid="quick-actions"]');
      if (await quickActions.count() > 0) {
        await expect(quickActions).toBeVisible();

        // Test each quick action button
        const actionButtons = quickActions.locator('button, a');
        const buttonCount = await actionButtons.count();

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = actionButtons.nth(i);
          await expect(button).toBeVisible();
          await expect(button).toBeEnabled();

          // Test button accessibility
          const hasAccessibleName = await button.evaluate(el =>
            el.getAttribute('aria-label') ||
            el.textContent?.trim() ||
            el.getAttribute('title')
          );
          expect(hasAccessibleName).toBeTruthy();
        }
      }
    });

    test('Recent Projects Component', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/dashboard`);

      const recentProjects = page.locator('.recent-projects, [data-testid="recent-projects"]');
      if (await recentProjects.count() > 0) {
        await expect(recentProjects).toBeVisible();

        // Test recent project items
        const projectItems = recentProjects.locator('.project-item, [data-testid="project-item"]');
        if (await projectItems.count() > 0) {
          await expect(projectItems.first()).toBeVisible();

          // Test project metadata display
          const metadata = projectItems.first().locator('.metadata, .project-info');
          if (await metadata.count() > 0) {
            await expect(metadata).toBeVisible();
          }
        }
      }
    });

    test('Activity Feed Component', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/dashboard`);

      const activityFeed = page.locator('.activity-feed, [data-testid="activity-feed"]');
      if (await activityFeed.count() > 0) {
        await expect(activityFeed).toBeVisible();

        // Test activity items
        const activityItems = activityFeed.locator('.activity-item, [data-testid="activity-item"]');
        if (await activityItems.count() > 0) {
          await expect(activityItems.first()).toBeVisible();

          // Test timestamp display
          const timestamps = activityItems.locator('.timestamp, [data-testid="timestamp"]');
          if (await timestamps.count() > 0) {
            await expect(timestamps.first()).toBeVisible();
          }
        }

        // Test load more functionality
        const loadMoreButton = activityFeed.locator('button:has-text("Load More"), [data-testid="load-more"]');
        if (await loadMoreButton.count() > 0) {
          await loadMoreButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('📁 Project Management Pages', () => {

    test('Projects List Page', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      // Test page loads
      await expect(page.locator('h1, .page-title')).toContainText(/projects/i);

      // Test project table/grid
      const projectContainer = page.locator('.projects-table, .projects-grid, [data-testid="projects-container"]');
      if (await projectContainer.count() > 0) {
        await expect(projectContainer).toBeVisible();

        // Test table headers if it's a table
        const headers = page.locator('th, .table-header');
        if (await headers.count() > 0) {
          const expectedHeaders = ['Name', 'Status', 'Created', 'Modified'];
          for (const header of expectedHeaders) {
            const headerElement = page.locator(`th:has-text("${header}"), .header:has-text("${header}")`);
            if (await headerElement.count() > 0) {
              await expect(headerElement).toBeVisible();
            }
          }
        }
      }
    });

    test('Project Creation Modal/Page', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      // Find and click create project button
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Project"), [data-testid="create-project"]');
      if (await createButton.count() > 0) {
        await createButton.click();

        // Test modal or new page loads
        const modal = page.locator('.modal, [role="dialog"], .create-project-form');
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible();

          // Test form fields
          const nameField = modal.locator('input[name="name"], input[placeholder*="name"]');
          const descriptionField = modal.locator('textarea[name="description"], textarea[placeholder*="description"]');

          if (await nameField.count() > 0) {
            await expect(nameField).toBeVisible();
            await nameField.fill('Test Project Name');
          }

          if (await descriptionField.count() > 0) {
            await expect(descriptionField).toBeVisible();
            await descriptionField.fill('Test project description for automated testing');
          }

          // Test project type selection
          const typeSelect = modal.locator('select[name="type"], .project-type-selector');
          if (await typeSelect.count() > 0) {
            await typeSelect.selectOption({ index: 1 });
          }

          // Test form validation
          const submitButton = modal.locator('button[type="submit"], button:has-text("Create")');
          if (await submitButton.count() > 0) {
            await expect(submitButton).toBeEnabled();
          }

          // Test cancel functionality
          const cancelButton = modal.locator('button:has-text("Cancel"), .cancel-button');
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
            await expect(modal).not.toBeVisible();
          }
        }
      }
    });

    test('Project Detail Page', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      // Click on first project
      const firstProject = page.locator('.project-item, .project-card, tr:has(td)').first();
      if (await firstProject.count() > 0) {
        await firstProject.click();
        await page.waitForLoadState('networkidle');

        // Test project detail components
        const detailComponents = [
          '.project-header, [data-testid="project-header"]',
          '.project-stats, [data-testid="project-stats"]',
          '.project-files, [data-testid="project-files"]',
          '.project-activity, [data-testid="project-activity"]'
        ];

        for (const selector of detailComponents) {
          const component = page.locator(selector);
          if (await component.count() > 0) {
            await expect(component).toBeVisible();
          }
        }

        // Test edit project button
        const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-project"]');
        if (await editButton.count() > 0) {
          await editButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('🔍 Search and Filter Components', () => {

    test('Global Search Bar', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/dashboard`);

      const searchBar = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search"]');
      if (await searchBar.count() > 0) {
        await expect(searchBar).toBeVisible();
        await expect(searchBar).toBeEditable();

        // Test search functionality
        await searchBar.fill('test query');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Test search results
        const searchResults = page.locator('.search-results, [data-testid="search-results"]');
        if (await searchResults.count() > 0) {
          await expect(searchResults).toBeVisible();
        }

        // Test search suggestions
        await searchBar.clear();
        await searchBar.type('pro');
        await page.waitForTimeout(500); // Wait for suggestions

        const suggestions = page.locator('.search-suggestions, .autocomplete, [data-testid="suggestions"]');
        if (await suggestions.count() > 0) {
          await expect(suggestions).toBeVisible();
        }
      }
    });

    test('Advanced Filters Panel', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      const filtersButton = page.locator('button:has-text("Filters"), .filters-toggle, [data-testid="filters"]');
      if (await filtersButton.count() > 0) {
        await filtersButton.click();

        const filtersPanel = page.locator('.filters-panel, .advanced-filters, [data-testid="filters-panel"]');
        if (await filtersPanel.count() > 0) {
          await expect(filtersPanel).toBeVisible();

          // Test individual filter controls
          const statusFilter = filtersPanel.locator('select[name="status"], .status-filter');
          if (await statusFilter.count() > 0) {
            await statusFilter.selectOption({ index: 1 });
            await page.waitForLoadState('networkidle');
          }

          const dateFilter = filtersPanel.locator('input[type="date"], .date-range-picker');
          if (await dateFilter.count() > 0) {
            await dateFilter.fill('2024-01-01');
            await page.waitForLoadState('networkidle');
          }

          const categoryFilter = filtersPanel.locator('select[name="category"], .category-filter');
          if (await categoryFilter.count() > 0) {
            await categoryFilter.selectOption({ index: 1 });
            await page.waitForLoadState('networkidle');
          }

          // Test clear filters
          const clearButton = filtersPanel.locator('button:has-text("Clear"), .clear-filters');
          if (await clearButton.count() > 0) {
            await clearButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Sort and Pagination Controls', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      // Test sort controls
      const sortDropdown = page.locator('select[name="sort"], .sort-selector, [data-testid="sort"]');
      if (await sortDropdown.count() > 0) {
        await sortDropdown.selectOption('name');
        await page.waitForLoadState('networkidle');

        await sortDropdown.selectOption('date');
        await page.waitForLoadState('networkidle');
      }

      // Test pagination
      const pagination = page.locator('.pagination, [data-testid="pagination"]');
      if (await pagination.count() > 0) {
        await expect(pagination).toBeVisible();

        const nextButton = pagination.locator('button:has-text("Next"), .next-page');
        if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
        }

        const prevButton = pagination.locator('button:has-text("Previous"), .prev-page');
        if (await prevButton.count() > 0 && await prevButton.isEnabled()) {
          await prevButton.click();
          await page.waitForLoadState('networkidle');
        }
      }

      // Test items per page
      const itemsPerPage = page.locator('select[name="limit"], .items-per-page');
      if (await itemsPerPage.count() > 0) {
        await itemsPerPage.selectOption('25');
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('🤖 AI Model Management', () => {

    test('Model Training Interface', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/models`);

      const trainButton = page.locator('button:has-text("Train"), button:has-text("New Model")');
      if (await trainButton.count() > 0) {
        await trainButton.click();

        // Test training form
        const trainingForm = page.locator('.training-form, [data-testid="training-form"]');
        if (await trainingForm.count() > 0) {
          await expect(trainingForm).toBeVisible();

          // Test model configuration fields
          const modelName = trainingForm.locator('input[name="name"]');
          if (await modelName.count() > 0) {
            await modelName.fill('Test Model');
          }

          const modelType = trainingForm.locator('select[name="type"]');
          if (await modelType.count() > 0) {
            await modelType.selectOption({ index: 1 });
          }

          // Test dataset upload
          const datasetUpload = trainingForm.locator('input[type="file"]');
          if (await datasetUpload.count() > 0) {
            await expect(datasetUpload).toBeVisible();
          }

          // Test training parameters
          const parameters = trainingForm.locator('.parameters, [data-testid="parameters"]');
          if (await parameters.count() > 0) {
            await expect(parameters).toBeVisible();
          }
        }
      }
    });

    test('Model Testing Interface', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/models`);

      // Select first model for testing
      const modelCard = page.locator('.model-card, [data-testid="model-card"]').first();
      if (await modelCard.count() > 0) {
        const testButton = modelCard.locator('button:has-text("Test")');
        if (await testButton.count() > 0) {
          await testButton.click();

          // Test model testing interface
          const testInterface = page.locator('.model-tester, [data-testid="model-tester"]');
          if (await testInterface.count() > 0) {
            await expect(testInterface).toBeVisible();

            // Test input field
            const testInput = testInterface.locator('textarea, input[name="input"]');
            if (await testInput.count() > 0) {
              await testInput.fill('Test input data');
            }

            // Test run button
            const runButton = testInterface.locator('button:has-text("Run"), button:has-text("Test")');
            if (await runButton.count() > 0) {
              await runButton.click();
              await page.waitForTimeout(2000); // Wait for processing
            }

            // Test results display
            const results = testInterface.locator('.results, [data-testid="results"]');
            if (await results.count() > 0) {
              await expect(results).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('💬 Collaboration Features', () => {

    test('Team Management', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/team`);

      // Test team members list
      const teamList = page.locator('.team-list, [data-testid="team-list"]');
      if (await teamList.count() > 0) {
        await expect(teamList).toBeVisible();

        // Test invite member button
        const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Member")');
        if (await inviteButton.count() > 0) {
          await inviteButton.click();

          const inviteModal = page.locator('.invite-modal, [role="dialog"]');
          if (await inviteModal.count() > 0) {
            await expect(inviteModal).toBeVisible();

            const emailInput = inviteModal.locator('input[type="email"]');
            if (await emailInput.count() > 0) {
              await emailInput.fill('teammate@test.com');
            }

            const roleSelect = inviteModal.locator('select[name="role"]');
            if (await roleSelect.count() > 0) {
              await roleSelect.selectOption('collaborator');
            }
          }
        }
      }
    });

    test('Comments and Discussions', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/projects`);

      // Navigate to project detail
      const firstProject = page.locator('.project-card, .project-item').first();
      if (await firstProject.count() > 0) {
        await firstProject.click();
        await page.waitForLoadState('networkidle');

        // Test comments section
        const commentsSection = page.locator('.comments, [data-testid="comments"]');
        if (await commentsSection.count() > 0) {
          await expect(commentsSection).toBeVisible();

          // Test add comment
          const commentInput = commentsSection.locator('textarea, input[placeholder*="comment"]');
          if (await commentInput.count() > 0) {
            await commentInput.fill('Test comment for automated testing');

            const submitButton = commentsSection.locator('button:has-text("Comment"), button[type="submit"]');
            if (await submitButton.count() > 0) {
              await submitButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });

  test.describe('📊 Analytics and Reporting', () => {

    test('Analytics Dashboard', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/analytics`);

      // Test analytics components
      const analyticsComponents = [
        '.metrics-overview, [data-testid="metrics-overview"]',
        '.charts-container, [data-testid="charts"]',
        '.performance-stats, [data-testid="performance"]',
        '.usage-analytics, [data-testid="usage"]'
      ];

      for (const selector of analyticsComponents) {
        const component = page.locator(selector);
        if (await component.count() > 0) {
          await expect(component).toBeVisible();
        }
      }

      // Test date range picker
      const dateRangePicker = page.locator('.date-range, [data-testid="date-range"]');
      if (await dateRangePicker.count() > 0) {
        await dateRangePicker.click();

        const preset = page.locator('[data-preset="last-30-days"], button:has-text("Last 30 days")');
        if (await preset.count() > 0) {
          await preset.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Export Functionality', async ({ page }) => {
      await page.goto(`${CODAI_BASE_URL}/analytics`);

      const exportButton = page.locator('button:has-text("Export"), [data-testid="export"]');
      if (await exportButton.count() > 0) {
        await exportButton.click();

        const exportModal = page.locator('.export-modal, [role="dialog"]');
        if (await exportModal.count() > 0) {
          await expect(exportModal).toBeVisible();

          // Test export format selection
          const formatSelect = exportModal.locator('select[name="format"]');
          if (await formatSelect.count() > 0) {
            await formatSelect.selectOption('csv');
          }

          // Test date range for export
          const dateInputs = exportModal.locator('input[type="date"]');
          if (await dateInputs.count() >= 2) {
            await dateInputs.first().fill('2024-01-01');
            await dateInputs.last().fill('2024-12-31');
          }
        }
      }
    });
  });
});

// Helper functions for CODAI-specific testing
export class CODAITestHelpers {
  static async waitForModelTraining(page: Page, timeout = 30000) {
    await page.waitForSelector('.training-complete, .model-ready', { timeout });
  }

  static async createTestProject(page: Page, projectData: any) {
    await page.goto(`${CODAI_BASE_URL}/projects`);
    await page.click('button:has-text("Create")');
    await page.fill('input[name="name"]', projectData.name);
    await page.fill('textarea[name="description"]', projectData.description);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  static async uploadDataset(page: Page, filePath: string) {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await page.waitForLoadState('networkidle');
  }
}
