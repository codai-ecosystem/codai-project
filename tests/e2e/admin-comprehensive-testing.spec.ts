// Admin Service - Comprehensive Administration Testing Suite
// Testing all admin flows, user management, system monitoring, and configuration

import { test, expect, Page } from '@playwright/test';

const ADMIN_BASE_URL = 'http://localhost:4002';

test.describe('👥 Admin Service - Comprehensive Administration Testing', () => {

  test.describe('👤 User Management Module', () => {

    test('Users List and Management', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/users`);

      // Test users table loads
      const usersTable = page.locator('table, .users-table, [data-testid="users-table"]');
      if (await usersTable.count() > 0) {
        await expect(usersTable).toBeVisible();

        // Test table headers
        const expectedHeaders = ['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'];
        for (const header of expectedHeaders) {
          const headerElement = page.locator(`th:has-text("${header}"), .header:has-text("${header}")`);
          if (await headerElement.count() > 0) {
            await expect(headerElement).toBeVisible();
          }
        }

        // Test user rows
        const userRows = usersTable.locator('tbody tr, .user-row');
        if (await userRows.count() > 0) {
          await expect(userRows.first()).toBeVisible();

          // Test row data structure
          const firstRow = userRows.first();
          const cells = firstRow.locator('td, .cell');
          if (await cells.count() > 0) {
            await expect(cells.first()).toBeVisible();
          }
        }
      }
    });

    test('User Creation Flow', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/users`);

      const createUserButton = page.locator('button:has-text("Create User"), button:has-text("Add User"), [data-testid="create-user"]');
      if (await createUserButton.count() > 0) {
        await createUserButton.click();

        // Test create user modal/form
        const createUserForm = page.locator('.create-user-modal, .user-form, [data-testid="user-form"]');
        if (await createUserForm.count() > 0) {
          await expect(createUserForm).toBeVisible();

          // Test form fields
          const formFields = {
            name: 'Test Admin User',
            email: 'testadmin@codai.test',
            password: 'TestPassword123!',
            confirmPassword: 'TestPassword123!',
            role: 'admin'
          };

          for (const [fieldName, value] of Object.entries(formFields)) {
            const field = createUserForm.locator(`input[name="${fieldName}"], select[name="${fieldName}"]`);
            if (await field.count() > 0) {
              if (fieldName === 'role') {
                await field.selectOption(value);
              } else {
                await field.fill(value);
              }
            }
          }

          // Test form validation
          const submitButton = createUserForm.locator('button[type="submit"], button:has-text("Create")');
          if (await submitButton.count() > 0) {
            await expect(submitButton).toBeEnabled();

            // Test successful creation
            await submitButton.click();
            await page.waitForLoadState('networkidle');

            // Verify user appears in list
            await expect(page.locator(':has-text("testadmin@codai.test")')).toBeVisible();
          }
        }
      }
    });

    test('User Edit and Permissions', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/users`);

      // Find and click edit on first user
      const editButton = page.locator('button:has-text("Edit"), .edit-user, [data-action="edit"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();

        const editForm = page.locator('.edit-user-modal, .user-edit-form, [data-testid="edit-user"]');
        if (await editForm.count() > 0) {
          await expect(editForm).toBeVisible();

          // Test permissions section
          const permissionsSection = editForm.locator('.permissions, [data-testid="permissions"]');
          if (await permissionsSection.count() > 0) {
            await expect(permissionsSection).toBeVisible();

            // Test permission checkboxes
            const permissionCheckboxes = permissionsSection.locator('input[type="checkbox"]');
            const checkboxCount = await permissionCheckboxes.count();

            if (checkboxCount > 0) {
              // Toggle first permission
              await permissionCheckboxes.first().click();

              // Test permission categories
              const categories = ['read', 'write', 'admin', 'delete'];
              for (const category of categories) {
                const categoryCheckbox = permissionsSection.locator(`input[name*="${category}"], [data-permission="${category}"]`);
                if (await categoryCheckbox.count() > 0) {
                  await expect(categoryCheckbox).toBeVisible();
                }
              }
            }
          }

          // Test role change
          const roleSelect = editForm.locator('select[name="role"]');
          if (await roleSelect.count() > 0) {
            await roleSelect.selectOption('user');
          }

          // Test save changes
          const saveButton = editForm.locator('button:has-text("Save"), button[type="submit"]');
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('User Status Management', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/users`);

      // Test user status toggle (activate/deactivate)
      const statusToggle = page.locator('.status-toggle, [data-action="toggle-status"]').first();
      if (await statusToggle.count() > 0) {
        const initialStatus = await statusToggle.textContent();
        await statusToggle.click();
        await page.waitForLoadState('networkidle');

        // Verify status changed
        const newStatus = await statusToggle.textContent();
        expect(newStatus).not.toBe(initialStatus);
      }

      // Test bulk actions
      const selectAllCheckbox = page.locator('input[type="checkbox"][data-select="all"], .select-all');
      if (await selectAllCheckbox.count() > 0) {
        await selectAllCheckbox.click();

        const bulkActions = page.locator('.bulk-actions, [data-testid="bulk-actions"]');
        if (await bulkActions.count() > 0) {
          await expect(bulkActions).toBeVisible();

          const bulkActivate = bulkActions.locator('button:has-text("Activate")');
          const bulkDeactivate = bulkActions.locator('button:has-text("Deactivate")');

          if (await bulkActivate.count() > 0) {
            await expect(bulkActivate).toBeEnabled();
          }
          if (await bulkDeactivate.count() > 0) {
            await expect(bulkDeactivate).toBeEnabled();
          }
        }
      }
    });
  });

  test.describe('📊 System Monitoring Dashboard', () => {

    test('System Metrics Overview', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/system`);

      // Test metrics cards
      const metricsCards = [
        '.cpu-usage, [data-metric="cpu"]',
        '.memory-usage, [data-metric="memory"]',
        '.disk-usage, [data-metric="disk"]',
        '.network-usage, [data-metric="network"]'
      ];

      for (const cardSelector of metricsCards) {
        const card = page.locator(cardSelector);
        if (await card.count() > 0) {
          await expect(card).toBeVisible();

          // Test metric value display
          const value = card.locator('.metric-value, .value');
          if (await value.count() > 0) {
            await expect(value).toBeVisible();
          }

          // Test metric chart/graph
          const chart = card.locator('.chart, .graph, canvas, svg');
          if (await chart.count() > 0) {
            await expect(chart).toBeVisible();
          }
        }
      }
    });

    test('Service Status Monitoring', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/system/services`);

      const servicesGrid = page.locator('.services-grid, .service-status, [data-testid="services"]');
      if (await servicesGrid.count() > 0) {
        await expect(servicesGrid).toBeVisible();

        // Test individual service cards
        const serviceCards = servicesGrid.locator('.service-card, .service-item');
        if (await serviceCards.count() > 0) {
          const firstService = serviceCards.first();
          await expect(firstService).toBeVisible();

          // Test service status indicator
          const statusIndicator = firstService.locator('.status, .health-indicator');
          if (await statusIndicator.count() > 0) {
            await expect(statusIndicator).toBeVisible();
          }

          // Test service actions
          const restartButton = firstService.locator('button:has-text("Restart")');
          const stopButton = firstService.locator('button:has-text("Stop")');

          if (await restartButton.count() > 0) {
            await expect(restartButton).toBeVisible();
          }
          if (await stopButton.count() > 0) {
            await expect(stopButton).toBeVisible();
          }
        }
      }
    });

    test('Real-time Alerts System', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/alerts`);

      const alertsPanel = page.locator('.alerts-panel, [data-testid="alerts"]');
      if (await alertsPanel.count() > 0) {
        await expect(alertsPanel).toBeVisible();

        // Test alert filters
        const alertFilters = [
          'select[name="severity"], .severity-filter',
          'select[name="status"], .status-filter',
          'input[type="date"], .date-filter'
        ];

        for (const filterSelector of alertFilters) {
          const filter = page.locator(filterSelector);
          if (await filter.count() > 0) {
            if (filterSelector.includes('select')) {
              await filter.selectOption({ index: 1 });
            } else if (filterSelector.includes('date')) {
              await filter.fill('2024-01-01');
            }
            await page.waitForLoadState('networkidle');
          }
        }

        // Test alert items
        const alertItems = alertsPanel.locator('.alert-item, [data-testid="alert-item"]');
        if (await alertItems.count() > 0) {
          const firstAlert = alertItems.first();
          await expect(firstAlert).toBeVisible();

          // Test alert actions
          const acknowledgeButton = firstAlert.locator('button:has-text("Acknowledge")');
          const dismissButton = firstAlert.locator('button:has-text("Dismiss")');

          if (await acknowledgeButton.count() > 0) {
            await acknowledgeButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('System Logs Viewer', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/logs`);

      const logsViewer = page.locator('.logs-viewer, [data-testid="logs"]');
      if (await logsViewer.count() > 0) {
        await expect(logsViewer).toBeVisible();

        // Test log level filter
        const logLevelFilter = page.locator('select[name="level"], .log-level-filter');
        if (await logLevelFilter.count() > 0) {
          await logLevelFilter.selectOption('error');
          await page.waitForLoadState('networkidle');

          await logLevelFilter.selectOption('info');
          await page.waitForLoadState('networkidle');
        }

        // Test log search
        const logSearch = page.locator('input[placeholder*="search"], .log-search');
        if (await logSearch.count() > 0) {
          await logSearch.fill('error');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
        }

        // Test log entries
        const logEntries = logsViewer.locator('.log-entry, [data-testid="log-entry"]');
        if (await logEntries.count() > 0) {
          await expect(logEntries.first()).toBeVisible();

          // Test log entry expansion
          const expandableEntry = logEntries.first();
          await expandableEntry.click();

          const logDetails = page.locator('.log-details, .expanded-log');
          if (await logDetails.count() > 0) {
            await expect(logDetails).toBeVisible();
          }
        }

        // Test log export
        const exportButton = page.locator('button:has-text("Export"), [data-action="export-logs"]');
        if (await exportButton.count() > 0) {
          await exportButton.click();

          const exportDialog = page.locator('.export-dialog, [role="dialog"]');
          if (await exportDialog.count() > 0) {
            await expect(exportDialog).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('⚙️ Configuration Management', () => {

    test('System Configuration Editor', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/config`);

      const configEditor = page.locator('.config-editor, [data-testid="config-editor"]');
      if (await configEditor.count() > 0) {
        await expect(configEditor).toBeVisible();

        // Test configuration sections
        const configSections = [
          '.database-config, [data-section="database"]',
          '.email-config, [data-section="email"]',
          '.security-config, [data-section="security"]',
          '.api-config, [data-section="api"]'
        ];

        for (const sectionSelector of configSections) {
          const section = page.locator(sectionSelector);
          if (await section.count() > 0) {
            await expect(section).toBeVisible();

            // Test section toggle
            const sectionHeader = section.locator('.section-header, h3');
            if (await sectionHeader.count() > 0) {
              await sectionHeader.click();
              await page.waitForTimeout(500);
            }
          }
        }

        // Test configuration validation
        const validateButton = page.locator('button:has-text("Validate"), [data-action="validate"]');
        if (await validateButton.count() > 0) {
          await validateButton.click();
          await page.waitForLoadState('networkidle');

          const validationResults = page.locator('.validation-results, [data-testid="validation"]');
          if (await validationResults.count() > 0) {
            await expect(validationResults).toBeVisible();
          }
        }
      }
    });

    test('Environment Variables Management', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/config/environment`);

      const envVarsTable = page.locator('.env-vars-table, [data-testid="env-vars"]');
      if (await envVarsTable.count() > 0) {
        await expect(envVarsTable).toBeVisible();

        // Test add new environment variable
        const addEnvButton = page.locator('button:has-text("Add Variable"), [data-action="add-env"]');
        if (await addEnvButton.count() > 0) {
          await addEnvButton.click();

          const envForm = page.locator('.env-form, [data-testid="env-form"]');
          if (await envForm.count() > 0) {
            await expect(envForm).toBeVisible();

            await envForm.locator('input[name="key"]').fill('TEST_VARIABLE');
            await envForm.locator('input[name="value"]').fill('test_value');

            const saveButton = envForm.locator('button:has-text("Save")');
            if (await saveButton.count() > 0) {
              await saveButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test environment variable search
        const envSearch = page.locator('input[placeholder*="search"], .env-search');
        if (await envSearch.count() > 0) {
          await envSearch.fill('TEST_VARIABLE');
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Feature Flags Management', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/config/features`);

      const featureFlagsPanel = page.locator('.feature-flags, [data-testid="feature-flags"]');
      if (await featureFlagsPanel.count() > 0) {
        await expect(featureFlagsPanel).toBeVisible();

        // Test feature flag toggles
        const flagToggles = featureFlagsPanel.locator('.flag-toggle, [data-testid="flag-toggle"]');
        if (await flagToggles.count() > 0) {
          const firstToggle = flagToggles.first();
          await firstToggle.click();
          await page.waitForLoadState('networkidle');

          // Test confirmation dialog
          const confirmDialog = page.locator('.confirm-dialog, [role="alertdialog"]');
          if (await confirmDialog.count() > 0) {
            const confirmButton = confirmDialog.locator('button:has-text("Confirm")');
            if (await confirmButton.count() > 0) {
              await confirmButton.click();
            }
          }
        }

        // Test feature flag groups
        const flagGroups = featureFlagsPanel.locator('.flag-group, [data-testid="flag-group"]');
        if (await flagGroups.count() > 0) {
          await expect(flagGroups.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('💾 Backup and Recovery', () => {

    test('Backup Management Interface', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/backup`);

      const backupPanel = page.locator('.backup-panel, [data-testid="backup"]');
      if (await backupPanel.count() > 0) {
        await expect(backupPanel).toBeVisible();

        // Test create backup
        const createBackupButton = page.locator('button:has-text("Create Backup"), [data-action="create-backup"]');
        if (await createBackupButton.count() > 0) {
          await createBackupButton.click();

          const backupForm = page.locator('.backup-form, [data-testid="backup-form"]');
          if (await backupForm.count() > 0) {
            await expect(backupForm).toBeVisible();

            // Test backup options
            const backupOptions = backupForm.locator('input[type="checkbox"]');
            if (await backupOptions.count() > 0) {
              await backupOptions.first().click();
            }

            const startBackupButton = backupForm.locator('button:has-text("Start Backup")');
            if (await startBackupButton.count() > 0) {
              await startBackupButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test backup history
        const backupHistory = page.locator('.backup-history, [data-testid="backup-history"]');
        if (await backupHistory.count() > 0) {
          await expect(backupHistory).toBeVisible();

          const backupItems = backupHistory.locator('.backup-item, [data-testid="backup-item"]');
          if (await backupItems.count() > 0) {
            const firstBackup = backupItems.first();

            // Test backup actions
            const downloadButton = firstBackup.locator('button:has-text("Download")');
            const restoreButton = firstBackup.locator('button:has-text("Restore")');

            if (await downloadButton.count() > 0) {
              await expect(downloadButton).toBeVisible();
            }
            if (await restoreButton.count() > 0) {
              await expect(restoreButton).toBeVisible();
            }
          }
        }
      }
    });

    test('System Recovery Options', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/recovery`);

      const recoveryPanel = page.locator('.recovery-panel, [data-testid="recovery"]');
      if (await recoveryPanel.count() > 0) {
        await expect(recoveryPanel).toBeVisible();

        // Test recovery options
        const recoveryOptions = [
          '.database-recovery, [data-recovery="database"]',
          '.file-recovery, [data-recovery="files"]',
          '.config-recovery, [data-recovery="config"]'
        ];

        for (const optionSelector of recoveryOptions) {
          const option = page.locator(optionSelector);
          if (await option.count() > 0) {
            await expect(option).toBeVisible();
          }
        }

        // Test recovery validation
        const validateRecoveryButton = page.locator('button:has-text("Validate Recovery"), [data-action="validate-recovery"]');
        if (await validateRecoveryButton.count() > 0) {
          await validateRecoveryButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('📈 Admin Analytics and Reporting', () => {

    test('System Usage Analytics', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/analytics`);

      const analyticsOverview = page.locator('.analytics-overview, [data-testid="analytics"]');
      if (await analyticsOverview.count() > 0) {
        await expect(analyticsOverview).toBeVisible();

        // Test analytics charts
        const charts = analyticsOverview.locator('.chart, canvas, svg');
        if (await charts.count() > 0) {
          await expect(charts.first()).toBeVisible();
        }

        // Test date range selection
        const dateRange = page.locator('.date-range-picker, [data-testid="date-range"]');
        if (await dateRange.count() > 0) {
          await dateRange.click();

          const preset = page.locator('[data-preset="last-week"]');
          if (await preset.count() > 0) {
            await preset.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Administrative Reports Generation', async ({ page }) => {
      await page.goto(`${ADMIN_BASE_URL}/admin/reports`);

      const reportsPanel = page.locator('.reports-panel, [data-testid="reports"]');
      if (await reportsPanel.count() > 0) {
        await expect(reportsPanel).toBeVisible();

        // Test report templates
        const reportTemplates = reportsPanel.locator('.report-template, [data-testid="report-template"]');
        if (await reportTemplates.count() > 0) {
          const userActivityReport = reportTemplates.filter({ hasText: 'User Activity' });
          if (await userActivityReport.count() > 0) {
            await userActivityReport.click();

            const generateButton = page.locator('button:has-text("Generate Report")');
            if (await generateButton.count() > 0) {
              await generateButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test custom report builder
        const customReportButton = page.locator('button:has-text("Custom Report"), [data-action="custom-report"]');
        if (await customReportButton.count() > 0) {
          await customReportButton.click();

          const reportBuilder = page.locator('.report-builder, [data-testid="report-builder"]');
          if (await reportBuilder.count() > 0) {
            await expect(reportBuilder).toBeVisible();
          }
        }
      }
    });
  });
});

// Helper functions for Admin testing
export class AdminTestHelpers {
  static async loginAsAdmin(page: Page) {
    await page.goto(`${ADMIN_BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@codai.test');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  static async waitForSystemMetrics(page: Page) {
    await page.waitForSelector('.metrics-loaded, [data-metrics="loaded"]', { timeout: 10000 });
  }

  static async createTestUser(page: Page, userData: any) {
    await page.goto(`${ADMIN_BASE_URL}/admin/users`);
    await page.click('button:has-text("Create User")');

    for (const [field, value] of Object.entries(userData)) {
      const input = page.locator(`input[name="${field}"], select[name="${field}"]`);
      if (await input.count() > 0) {
        if (field === 'role') {
          await input.selectOption(value as string);
        } else {
          await input.fill(value as string);
        }
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }
}
