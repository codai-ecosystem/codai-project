// BancAI Service - Comprehensive Banking AI and Financial Testing
// Testing all financial AI features, banking integrations, and Romanian banking system

import { test, expect, Page } from '@playwright/test';

const BANCAI_BASE_URL = 'http://localhost:4005';

test.describe('💰 BancAI Service - Comprehensive Banking AI Testing', () => {

  test.describe('🏦 Romanian Banking Integration', () => {

    test('Romanian Bank Connections Management', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/banks`);

      const banksPage = page.locator('.banks-page, [data-testid="banks-page"]');
      if (await banksPage.count() > 0) {
        await expect(banksPage).toBeVisible();

        // Test Romanian bank list
        const romanianBanks = banksPage.locator('.romanian-banks, [data-testid="romanian-banks"]');
        if (await romanianBanks.count() > 0) {
          await expect(romanianBanks).toBeVisible();

          // Test major Romanian banks
          const majorBanks = [
            'BCR', 'BRD', 'ING Bank România', 'Raiffeisen Bank', 'UniCredit Bank',
            'Alpha Bank', 'CEC Bank', 'Banca Transilvania', 'Garanti BBVA'
          ];

          for (const bankName of majorBanks) {
            const bankCard = romanianBanks.locator(`.bank-card:has-text("${bankName}"), [data-bank="${bankName.toLowerCase().replace(/\s+/g, '-')}"]`);
            if (await bankCard.count() > 0) {
              await expect(bankCard).toBeVisible();

              // Test bank connection features
              const connectButton = bankCard.locator('button:has-text("Connect"), [data-action="connect"]');
              const statusIndicator = bankCard.locator('.status-indicator, .connection-status');

              if (await connectButton.count() > 0) {
                await expect(connectButton).toBeVisible();
              }
              if (await statusIndicator.count() > 0) {
                await expect(statusIndicator).toBeVisible();
              }
            }
          }

          // Test bank connection flow
          const firstBankCard = romanianBanks.locator('.bank-card').first();
          if (await firstBankCard.count() > 0) {
            const connectButton = firstBankCard.locator('button:has-text("Connect")');
            if (await connectButton.count() > 0) {
              await connectButton.click();

              const connectionModal = page.locator('.bank-connection-modal, [data-testid="connection-modal"]');
              if (await connectionModal.count() > 0) {
                await expect(connectionModal).toBeVisible();

                // Test secure connection form
                const secureForm = connectionModal.locator('.secure-connection-form, [data-testid="secure-form"]');
                if (await secureForm.count() > 0) {
                  // Note: These would be test credentials in a real testing environment
                  const userIdField = secureForm.locator('input[name="user_id"], input[name="username"]');
                  const passwordField = secureForm.locator('input[name="password"], input[type="password"]');

                  if (await userIdField.count() > 0) {
                    await userIdField.fill('test_user_id');
                  }
                  if (await passwordField.count() > 0) {
                    await passwordField.fill('test_password');
                  }

                  // Test security warnings
                  const securityWarning = connectionModal.locator('.security-warning, [data-testid="security-warning"]');
                  if (await securityWarning.count() > 0) {
                    await expect(securityWarning).toBeVisible();
                  }

                  const authorizeButton = secureForm.locator('button:has-text("Authorize"), button[type="submit"]');
                  if (await authorizeButton.count() > 0) {
                    await authorizeButton.click();
                    await page.waitForLoadState('networkidle');
                  }
                }
              }
            }
          }
        }
      }
    });

    test('Account Aggregation and Balance Overview', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/accounts`);

      const accountsOverview = page.locator('.accounts-overview, [data-testid="accounts-overview"]');
      if (await accountsOverview.count() > 0) {
        await expect(accountsOverview).toBeVisible();

        // Test total balance display
        const totalBalance = accountsOverview.locator('.total-balance, [data-testid="total-balance"]');
        if (await totalBalance.count() > 0) {
          await expect(totalBalance).toBeVisible();

          const balanceAmount = totalBalance.locator('.balance-amount, .amount');
          const balanceCurrency = totalBalance.locator('.balance-currency, .currency');

          if (await balanceAmount.count() > 0) await expect(balanceAmount).toBeVisible();
          if (await balanceCurrency.count() > 0) await expect(balanceCurrency).toContainText('RON');
        }

        // Test individual accounts
        const accountsList = accountsOverview.locator('.accounts-list, [data-testid="accounts-list"]');
        if (await accountsList.count() > 0) {
          const accountItems = accountsList.locator('.account-item, [data-testid="account-item"]');
          if (await accountItems.count() > 0) {
            const firstAccount = accountItems.first();

            // Test account details
            const accountName = firstAccount.locator('.account-name, .name');
            const accountNumber = firstAccount.locator('.account-number, .number');
            const accountBalance = firstAccount.locator('.account-balance, .balance');
            const accountType = firstAccount.locator('.account-type, .type');
            const bankLogo = firstAccount.locator('.bank-logo, .logo');

            if (await accountName.count() > 0) await expect(accountName).toBeVisible();
            if (await accountNumber.count() > 0) await expect(accountNumber).toBeVisible();
            if (await accountBalance.count() > 0) await expect(accountBalance).toBeVisible();
            if (await accountType.count() > 0) await expect(accountType).toBeVisible();
            if (await bankLogo.count() > 0) await expect(bankLogo).toBeVisible();

            // Test account actions
            const viewDetailsButton = firstAccount.locator('button:has-text("Details"), [data-action="view-details"]');
            const transactionsButton = firstAccount.locator('button:has-text("Transactions"), [data-action="transactions"]');

            if (await viewDetailsButton.count() > 0) {
              await viewDetailsButton.click();
              await page.waitForLoadState('networkidle');

              const accountDetailsModal = page.locator('.account-details-modal, [data-testid="account-details"]');
              if (await accountDetailsModal.count() > 0) {
                await expect(accountDetailsModal).toBeVisible();

                // Test detailed account information
                const accountInfo = accountDetailsModal.locator('.account-info, [data-testid="account-info"]');
                if (await accountInfo.count() > 0) {
                  const iban = accountInfo.locator('.iban, [data-field="iban"]');
                  const bic = accountInfo.locator('.bic, [data-field="bic"]');
                  const openDate = accountInfo.locator('.open-date, [data-field="open-date"]');

                  if (await iban.count() > 0) await expect(iban).toBeVisible();
                  if (await bic.count() > 0) await expect(bic).toBeVisible();
                  if (await openDate.count() > 0) await expect(openDate).toBeVisible();
                }
              }
            }
          }
        }

        // Test account filters
        const accountFilters = accountsOverview.locator('.account-filters, [data-testid="filters"]');
        if (await accountFilters.count() > 0) {
          const bankFilter = accountFilters.locator('select[name="bank"], .bank-filter');
          const typeFilter = accountFilters.locator('select[name="type"], .type-filter');
          const statusFilter = accountFilters.locator('select[name="status"], .status-filter');

          if (await bankFilter.count() > 0) {
            await bankFilter.selectOption('bcr');
            await page.waitForLoadState('networkidle');
          }
          if (await typeFilter.count() > 0) {
            await typeFilter.selectOption('checking');
            await page.waitForLoadState('networkidle');
          }
          if (await statusFilter.count() > 0) {
            await statusFilter.selectOption('active');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Transaction History and Analysis', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/transactions`);

      const transactionsPage = page.locator('.transactions-page, [data-testid="transactions-page"]');
      if (await transactionsPage.count() > 0) {
        await expect(transactionsPage).toBeVisible();

        // Test transaction filters
        const transactionFilters = transactionsPage.locator('.transaction-filters, [data-testid="filters"]');
        if (await transactionFilters.count() > 0) {
          const dateRangeFilter = transactionFilters.locator('.date-range-filter, [data-filter="date-range"]');
          const categoryFilter = transactionFilters.locator('select[name="category"], .category-filter');
          const amountFilter = transactionFilters.locator('.amount-filter, [data-filter="amount"]');
          const bankFilter = transactionFilters.locator('select[name="bank"], .bank-filter');

          if (await dateRangeFilter.count() > 0) {
            const startDate = dateRangeFilter.locator('input[name="start_date"]');
            const endDate = dateRangeFilter.locator('input[name="end_date"]');

            if (await startDate.count() > 0) await startDate.fill('2024-01-01');
            if (await endDate.count() > 0) await endDate.fill('2024-12-31');
          }

          if (await categoryFilter.count() > 0) {
            await categoryFilter.selectOption('groceries');
            await page.waitForLoadState('networkidle');
          }

          if (await amountFilter.count() > 0) {
            const minAmount = amountFilter.locator('input[name="min_amount"]');
            const maxAmount = amountFilter.locator('input[name="max_amount"]');

            if (await minAmount.count() > 0) await minAmount.fill('100');
            if (await maxAmount.count() > 0) await maxAmount.fill('1000');
          }
        }

        // Test transactions list
        const transactionsList = transactionsPage.locator('.transactions-list, [data-testid="transactions-list"]');
        if (await transactionsList.count() > 0) {
          const transactionItems = transactionsList.locator('.transaction-item, [data-testid="transaction-item"]');
          if (await transactionItems.count() > 0) {
            const firstTransaction = transactionItems.first();

            // Test transaction details
            const transactionDate = firstTransaction.locator('.transaction-date, .date');
            const transactionDescription = firstTransaction.locator('.transaction-description, .description');
            const transactionAmount = firstTransaction.locator('.transaction-amount, .amount');
            const transactionCategory = firstTransaction.locator('.transaction-category, .category');
            const merchantLogo = firstTransaction.locator('.merchant-logo, .logo');

            if (await transactionDate.count() > 0) await expect(transactionDate).toBeVisible();
            if (await transactionDescription.count() > 0) await expect(transactionDescription).toBeVisible();
            if (await transactionAmount.count() > 0) await expect(transactionAmount).toBeVisible();
            if (await transactionCategory.count() > 0) await expect(transactionCategory).toBeVisible();
            if (await merchantLogo.count() > 0) await expect(merchantLogo).toBeVisible();

            // Test transaction actions
            const viewDetailsButton = firstTransaction.locator('button:has-text("Details"), [data-action="view-details"]');
            const categorizeButton = firstTransaction.locator('button:has-text("Categorize"), [data-action="categorize"]');
            const addNoteButton = firstTransaction.locator('button:has-text("Note"), [data-action="add-note"]');

            if (await viewDetailsButton.count() > 0) {
              await viewDetailsButton.click();

              const transactionModal = page.locator('.transaction-modal, [data-testid="transaction-modal"]');
              if (await transactionModal.count() > 0) {
                await expect(transactionModal).toBeVisible();

                // Test detailed transaction info
                const transactionDetails = [
                  '.reference-number, [data-field="reference"]',
                  '.merchant-details, [data-field="merchant"]',
                  '.payment-method, [data-field="payment-method"]',
                  '.location, [data-field="location"]'
                ];

                for (const detailSelector of transactionDetails) {
                  const detail = transactionModal.locator(detailSelector);
                  if (await detail.count() > 0) {
                    await expect(detail).toBeVisible();
                  }
                }
              }
            }
          }
        }

        // Test transaction export
        const exportButton = transactionsPage.locator('button:has-text("Export"), [data-action="export"]');
        if (await exportButton.count() > 0) {
          await exportButton.click();

          const exportModal = page.locator('.export-modal, [data-testid="export-modal"]');
          if (await exportModal.count() > 0) {
            await expect(exportModal).toBeVisible();

            const formatSelect = exportModal.locator('select[name="format"]');
            if (await formatSelect.count() > 0) {
              await formatSelect.selectOption('csv');
            }

            const downloadButton = exportModal.locator('button:has-text("Download")');
            if (await downloadButton.count() > 0) {
              await downloadButton.click();
            }
          }
        }
      }
    });
  });

  test.describe('🤖 AI-Powered Financial Insights', () => {

    test('Spending Analysis and Categorization', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/insights/spending`);

      const spendingAnalysis = page.locator('.spending-analysis, [data-testid="spending-analysis"]');
      if (await spendingAnalysis.count() > 0) {
        await expect(spendingAnalysis).toBeVisible();

        // Test spending overview charts
        const spendingCharts = spendingAnalysis.locator('.spending-charts, [data-testid="charts"]');
        if (await spendingCharts.count() > 0) {
          const chartTypes = [
            '.pie-chart, [data-chart="pie"]',
            '.bar-chart, [data-chart="bar"]',
            '.line-chart, [data-chart="line"]',
            '.trend-chart, [data-chart="trend"]'
          ];

          for (const chartSelector of chartTypes) {
            const chart = spendingCharts.locator(chartSelector);
            if (await chart.count() > 0) {
              await expect(chart).toBeVisible();
            }
          }
        }

        // Test spending categories
        const categoriesBreakdown = spendingAnalysis.locator('.categories-breakdown, [data-testid="categories"]');
        if (await categoriesBreakdown.count() > 0) {
          const categoryItems = categoriesBreakdown.locator('.category-item, [data-testid="category-item"]');
          if (await categoryItems.count() > 0) {
            const firstCategory = categoryItems.first();

            // Test category details
            const categoryName = firstCategory.locator('.category-name, .name');
            const categoryAmount = firstCategory.locator('.category-amount, .amount');
            const categoryPercentage = firstCategory.locator('.category-percentage, .percentage');
            const categoryTrend = firstCategory.locator('.category-trend, .trend');

            if (await categoryName.count() > 0) await expect(categoryName).toBeVisible();
            if (await categoryAmount.count() > 0) await expect(categoryAmount).toBeVisible();
            if (await categoryPercentage.count() > 0) await expect(categoryPercentage).toBeVisible();
            if (await categoryTrend.count() > 0) await expect(categoryTrend).toBeVisible();

            // Test category drill-down
            await firstCategory.click();
            await page.waitForLoadState('networkidle');

            const categoryDetails = page.locator('.category-details, [data-testid="category-details"]');
            if (await categoryDetails.count() > 0) {
              await expect(categoryDetails).toBeVisible();

              const subcategories = categoryDetails.locator('.subcategories, [data-testid="subcategories"]');
              if (await subcategories.count() > 0) {
                await expect(subcategories).toBeVisible();
              }
            }
          }
        }

        // Test spending insights
        const spendingInsights = spendingAnalysis.locator('.spending-insights, [data-testid="insights"]');
        if (await spendingInsights.count() > 0) {
          await expect(spendingInsights).toBeVisible();

          const insightCards = spendingInsights.locator('.insight-card, [data-testid="insight-card"]');
          if (await insightCards.count() > 0) {
            const firstInsight = insightCards.first();

            const insightTitle = firstInsight.locator('.insight-title, .title');
            const insightDescription = firstInsight.locator('.insight-description, .description');
            const insightRecommendation = firstInsight.locator('.insight-recommendation, .recommendation');

            if (await insightTitle.count() > 0) await expect(insightTitle).toBeVisible();
            if (await insightDescription.count() > 0) await expect(insightDescription).toBeVisible();
            if (await insightRecommendation.count() > 0) await expect(insightRecommendation).toBeVisible();
          }
        }

        // Test period comparison
        const periodComparison = spendingAnalysis.locator('.period-comparison, [data-testid="comparison"]');
        if (await periodComparison.count() > 0) {
          const periodSelect = periodComparison.locator('select[name="period"], .period-select');
          if (await periodSelect.count() > 0) {
            await periodSelect.selectOption('month');
            await page.waitForLoadState('networkidle');

            await periodSelect.selectOption('quarter');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Budget Management and Tracking', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/budgets`);

      const budgetsPage = page.locator('.budgets-page, [data-testid="budgets-page"]');
      if (await budgetsPage.count() > 0) {
        await expect(budgetsPage).toBeVisible();

        // Test create new budget
        const createBudgetButton = budgetsPage.locator('button:has-text("Create Budget"), [data-action="create-budget"]');
        if (await createBudgetButton.count() > 0) {
          await createBudgetButton.click();

          const budgetModal = page.locator('.budget-modal, [data-testid="budget-modal"]');
          if (await budgetModal.count() > 0) {
            await expect(budgetModal).toBeVisible();

            const budgetForm = budgetModal.locator('.budget-form, [data-testid="budget-form"]');
            if (await budgetForm.count() > 0) {
              await budgetForm.locator('input[name="name"]').fill('Monthly Groceries Budget');
              await budgetForm.locator('select[name="category"]').selectOption('groceries');
              await budgetForm.locator('input[name="amount"]').fill('1000');
              await budgetForm.locator('select[name="period"]').selectOption('monthly');

              // Test budget alerts
              const alertsSection = budgetForm.locator('.budget-alerts, [data-section="alerts"]');
              if (await alertsSection.count() > 0) {
                const alert50 = alertsSection.locator('input[name="alert_50"]');
                const alert75 = alertsSection.locator('input[name="alert_75"]');
                const alert90 = alertsSection.locator('input[name="alert_90"]');

                if (await alert50.count() > 0) await alert50.click();
                if (await alert75.count() > 0) await alert75.click();
                if (await alert90.count() > 0) await alert90.click();
              }

              const saveBudgetButton = budgetForm.locator('button:has-text("Save Budget")');
              if (await saveBudgetButton.count() > 0) {
                await saveBudgetButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test existing budgets
        const budgetsList = budgetsPage.locator('.budgets-list, [data-testid="budgets-list"]');
        if (await budgetsList.count() > 0) {
          const budgetItems = budgetsList.locator('.budget-item, [data-testid="budget-item"]');
          if (await budgetItems.count() > 0) {
            const firstBudget = budgetItems.first();

            // Test budget display
            const budgetName = firstBudget.locator('.budget-name, .name');
            const budgetProgress = firstBudget.locator('.budget-progress, .progress');
            const budgetAmount = firstBudget.locator('.budget-amount, .amount');
            const budgetSpent = firstBudget.locator('.budget-spent, .spent');
            const budgetRemaining = firstBudget.locator('.budget-remaining, .remaining');

            if (await budgetName.count() > 0) await expect(budgetName).toBeVisible();
            if (await budgetProgress.count() > 0) await expect(budgetProgress).toBeVisible();
            if (await budgetAmount.count() > 0) await expect(budgetAmount).toBeVisible();
            if (await budgetSpent.count() > 0) await expect(budgetSpent).toBeVisible();
            if (await budgetRemaining.count() > 0) await expect(budgetRemaining).toBeVisible();

            // Test budget status indicators
            const budgetStatus = firstBudget.locator('.budget-status, .status');
            if (await budgetStatus.count() > 0) {
              await expect(budgetStatus).toBeVisible();

              // Status could be 'on-track', 'warning', 'over-budget'
              const statusClasses = ['on-track', 'warning', 'over-budget'];
              let hasStatusClass = false;

              for (const statusClass of statusClasses) {
                if (await budgetStatus.locator(`.${statusClass}`).count() > 0) {
                  hasStatusClass = true;
                  break;
                }
              }

              expect(hasStatusClass).toBeTruthy();
            }

            // Test budget actions
            const editBudgetButton = firstBudget.locator('button:has-text("Edit"), [data-action="edit"]');
            const viewDetailsButton = firstBudget.locator('button:has-text("Details"), [data-action="details"]');

            if (await editBudgetButton.count() > 0) {
              await editBudgetButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test budget overview
        const budgetOverview = budgetsPage.locator('.budget-overview, [data-testid="overview"]');
        if (await budgetOverview.count() > 0) {
          await expect(budgetOverview).toBeVisible();

          const totalBudget = budgetOverview.locator('.total-budget, [data-metric="total"]');
          const totalSpent = budgetOverview.locator('.total-spent, [data-metric="spent"]');
          const totalRemaining = budgetOverview.locator('.total-remaining, [data-metric="remaining"]');

          if (await totalBudget.count() > 0) await expect(totalBudget).toBeVisible();
          if (await totalSpent.count() > 0) await expect(totalSpent).toBeVisible();
          if (await totalRemaining.count() > 0) await expect(totalRemaining).toBeVisible();
        }
      }
    });

    test('AI Financial Advisor and Recommendations', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/advisor`);

      const advisorPage = page.locator('.advisor-page, [data-testid="advisor-page"]');
      if (await advisorPage.count() > 0) {
        await expect(advisorPage).toBeVisible();

        // Test AI advisor chat interface
        const advisorChat = advisorPage.locator('.advisor-chat, [data-testid="advisor-chat"]');
        if (await advisorChat.count() > 0) {
          await expect(advisorChat).toBeVisible();

          // Test chat input
          const chatInput = advisorChat.locator('.chat-input, [data-testid="chat-input"]');
          if (await chatInput.count() > 0) {
            await chatInput.fill('Care sunt cele mai bune modalități de a-mi economisi banii?');
            await page.keyboard.press('Enter');
            await page.waitForLoadState('networkidle');

            // Test AI response
            const chatMessages = advisorChat.locator('.chat-messages, [data-testid="messages"]');
            if (await chatMessages.count() > 0) {
              const messages = chatMessages.locator('.message, [data-testid="message"]');
              if (await messages.count() > 0) {
                await expect(messages.last()).toBeVisible();

                // Test message features
                const aiMessage = messages.last();
                const messageText = aiMessage.locator('.message-text, .text');
                const messageActions = aiMessage.locator('.message-actions, [data-testid="actions"]');

                if (await messageText.count() > 0) await expect(messageText).toBeVisible();
                if (await messageActions.count() > 0) {
                  const likeButton = messageActions.locator('button:has-text("👍"), [data-action="like"]');
                  const dislikeButton = messageActions.locator('button:has-text("👎"), [data-action="dislike"]');

                  if (await likeButton.count() > 0) await likeButton.click();
                }
              }
            }
          }

          // Test quick questions
          const quickQuestions = advisorChat.locator('.quick-questions, [data-testid="quick-questions"]');
          if (await quickQuestions.count() > 0) {
            const questionButtons = quickQuestions.locator('.question-button, [data-testid="question-button"]');
            if (await questionButtons.count() > 0) {
              await questionButtons.first().click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test financial recommendations
        const recommendations = advisorPage.locator('.recommendations, [data-testid="recommendations"]');
        if (await recommendations.count() > 0) {
          await expect(recommendations).toBeVisible();

          const recommendationCards = recommendations.locator('.recommendation-card, [data-testid="recommendation-card"]');
          if (await recommendationCards.count() > 0) {
            const firstRecommendation = recommendationCards.first();

            const recommendationTitle = firstRecommendation.locator('.recommendation-title, .title');
            const recommendationDescription = firstRecommendation.locator('.recommendation-description, .description');
            const recommendationImpact = firstRecommendation.locator('.recommendation-impact, .impact');
            const recommendationPriority = firstRecommendation.locator('.recommendation-priority, .priority');

            if (await recommendationTitle.count() > 0) await expect(recommendationTitle).toBeVisible();
            if (await recommendationDescription.count() > 0) await expect(recommendationDescription).toBeVisible();
            if (await recommendationImpact.count() > 0) await expect(recommendationImpact).toBeVisible();
            if (await recommendationPriority.count() > 0) await expect(recommendationPriority).toBeVisible();

            // Test recommendation actions
            const applyButton = firstRecommendation.locator('button:has-text("Apply"), [data-action="apply"]');
            const dismissButton = firstRecommendation.locator('button:has-text("Dismiss"), [data-action="dismiss"]');
            const learnMoreButton = firstRecommendation.locator('button:has-text("Learn More"), [data-action="learn-more"]');

            if (await applyButton.count() > 0) {
              await applyButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test financial goals
        const financialGoals = advisorPage.locator('.financial-goals, [data-testid="goals"]');
        if (await financialGoals.count() > 0) {
          const createGoalButton = financialGoals.locator('button:has-text("Create Goal"), [data-action="create-goal"]');
          if (await createGoalButton.count() > 0) {
            await createGoalButton.click();

            const goalModal = page.locator('.goal-modal, [data-testid="goal-modal"]');
            if (await goalModal.count() > 0) {
              await goalModal.locator('input[name="goal_name"]').fill('Emergency Fund');
              await goalModal.locator('input[name="target_amount"]').fill('10000');
              await goalModal.locator('select[name="goal_type"]').selectOption('savings');
              await goalModal.locator('input[name="target_date"]').fill('2025-12-31');

              const saveGoalButton = goalModal.locator('button:has-text("Save Goal")');
              if (await saveGoalButton.count() > 0) {
                await saveGoalButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }
      }
    });

    test('Investment Analysis and Portfolio Tracking', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/investments`);

      const investmentsPage = page.locator('.investments-page, [data-testid="investments-page"]');
      if (await investmentsPage.count() > 0) {
        await expect(investmentsPage).toBeVisible();

        // Test portfolio overview
        const portfolioOverview = investmentsPage.locator('.portfolio-overview, [data-testid="portfolio-overview"]');
        if (await portfolioOverview.count() > 0) {
          await expect(portfolioOverview).toBeVisible();

          // Test portfolio metrics
          const portfolioMetrics = [
            '.total-value, [data-metric="total-value"]',
            '.daily-change, [data-metric="daily-change"]',
            '.total-return, [data-metric="total-return"]',
            '.portfolio-performance, [data-metric="performance"]'
          ];

          for (const metricSelector of portfolioMetrics) {
            const metric = portfolioOverview.locator(metricSelector);
            if (await metric.count() > 0) {
              await expect(metric).toBeVisible();
            }
          }

          // Test portfolio allocation chart
          const allocationChart = portfolioOverview.locator('.allocation-chart, [data-chart="allocation"]');
          if (await allocationChart.count() > 0) {
            await expect(allocationChart).toBeVisible();
          }
        }

        // Test individual investments
        const investmentsList = investmentsPage.locator('.investments-list, [data-testid="investments-list"]');
        if (await investmentsList.count() > 0) {
          const investmentItems = investmentsList.locator('.investment-item, [data-testid="investment-item"]');
          if (await investmentItems.count() > 0) {
            const firstInvestment = investmentItems.first();

            // Test investment details
            const investmentName = firstInvestment.locator('.investment-name, .name');
            const investmentSymbol = firstInvestment.locator('.investment-symbol, .symbol');
            const investmentPrice = firstInvestment.locator('.investment-price, .price');
            const investmentChange = firstInvestment.locator('.investment-change, .change');
            const investmentValue = firstInvestment.locator('.investment-value, .value');

            if (await investmentName.count() > 0) await expect(investmentName).toBeVisible();
            if (await investmentSymbol.count() > 0) await expect(investmentSymbol).toBeVisible();
            if (await investmentPrice.count() > 0) await expect(investmentPrice).toBeVisible();
            if (await investmentChange.count() > 0) await expect(investmentChange).toBeVisible();
            if (await investmentValue.count() > 0) await expect(investmentValue).toBeVisible();

            // Test investment actions
            const viewDetailsButton = firstInvestment.locator('button:has-text("Details"), [data-action="details"]');
            const buyButton = firstInvestment.locator('button:has-text("Buy"), [data-action="buy"]');
            const sellButton = firstInvestment.locator('button:has-text("Sell"), [data-action="sell"]');

            if (await viewDetailsButton.count() > 0) {
              await viewDetailsButton.click();

              const investmentModal = page.locator('.investment-modal, [data-testid="investment-modal"]');
              if (await investmentModal.count() > 0) {
                await expect(investmentModal).toBeVisible();

                // Test detailed investment info
                const priceChart = investmentModal.locator('.price-chart, [data-chart="price"]');
                const fundamentals = investmentModal.locator('.fundamentals, [data-section="fundamentals"]');
                const news = investmentModal.locator('.investment-news, [data-section="news"]');

                if (await priceChart.count() > 0) await expect(priceChart).toBeVisible();
                if (await fundamentals.count() > 0) await expect(fundamentals).toBeVisible();
                if (await news.count() > 0) await expect(news).toBeVisible();
              }
            }
          }
        }

        // Test Romanian stock market focus
        const romanianStocks = investmentsPage.locator('.romanian-stocks, [data-testid="romanian-stocks"]');
        if (await romanianStocks.count() > 0) {
          await expect(romanianStocks).toBeVisible();

          // Test BVB (Bucharest Stock Exchange) integration
          const bvbStocks = romanianStocks.locator('.bvb-stocks, [data-exchange="bvb"]');
          if (await bvbStocks.count() > 0) {
            const stockItems = bvbStocks.locator('.stock-item, [data-testid="stock-item"]');
            if (await stockItems.count() > 0) {
              await expect(stockItems.first()).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('💳 Romanian Banking Regulations and Compliance', () => {

    test('GDPR and Data Privacy Compliance', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/privacy`);

      const privacyPage = page.locator('.privacy-page, [data-testid="privacy-page"]');
      if (await privacyPage.count() > 0) {
        await expect(privacyPage).toBeVisible();

        // Test GDPR compliance features
        const gdprSection = privacyPage.locator('.gdpr-section, [data-testid="gdpr"]');
        if (await gdprSection.count() > 0) {
          await expect(gdprSection).toBeVisible();

          // Test data access request
          const dataAccessButton = gdprSection.locator('button:has-text("Request Data"), [data-action="data-access"]');
          if (await dataAccessButton.count() > 0) {
            await dataAccessButton.click();

            const dataAccessModal = page.locator('.data-access-modal, [data-testid="data-access"]');
            if (await dataAccessModal.count() > 0) {
              await expect(dataAccessModal).toBeVisible();

              const requestButton = dataAccessModal.locator('button:has-text("Submit Request")');
              if (await requestButton.count() > 0) {
                await requestButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          // Test data deletion request
          const dataDeleteButton = gdprSection.locator('button:has-text("Delete Data"), [data-action="data-deletion"]');
          if (await dataDeleteButton.count() > 0) {
            await dataDeleteButton.click();

            const confirmDialog = page.locator('.confirm-dialog, [role="alertdialog"]');
            if (await confirmDialog.count() > 0) {
              const cancelButton = confirmDialog.locator('button:has-text("Cancel")');
              if (await cancelButton.count() > 0) {
                await cancelButton.click();
              }
            }
          }
        }

        // Test privacy settings
        const privacySettings = privacyPage.locator('.privacy-settings, [data-testid="privacy-settings"]');
        if (await privacySettings.count() > 0) {
          const settingOptions = [
            'data_processing_consent',
            'marketing_consent',
            'analytics_consent',
            'third_party_sharing'
          ];

          for (const setting of settingOptions) {
            const settingToggle = privacySettings.locator(`input[name="${setting}"], [data-setting="${setting}"]`);
            if (await settingToggle.count() > 0) {
              await settingToggle.click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    });

    test('Romanian Financial Regulations (BNR) Compliance', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/compliance`);

      const compliancePage = page.locator('.compliance-page, [data-testid="compliance-page"]');
      if (await compliancePage.count() > 0) {
        await expect(compliancePage).toBeVisible();

        // Test BNR (Romanian National Bank) compliance
        const bnrCompliance = compliancePage.locator('.bnr-compliance, [data-testid="bnr-compliance"]');
        if (await bnrCompliance.count() > 0) {
          await expect(bnrCompliance).toBeVisible();

          // Test compliance status indicators
          const complianceIndicators = [
            '.kyc-status, [data-compliance="kyc"]',
            '.aml-status, [data-compliance="aml"]',
            '.pci-status, [data-compliance="pci"]',
            '.gdpr-status, [data-compliance="gdpr"]'
          ];

          for (const indicatorSelector of complianceIndicators) {
            const indicator = bnrCompliance.locator(indicatorSelector);
            if (await indicator.count() > 0) {
              await expect(indicator).toBeVisible();
            }
          }
        }

        // Test compliance reports
        const complianceReports = compliancePage.locator('.compliance-reports, [data-testid="reports"]');
        if (await complianceReports.count() > 0) {
          const generateReportButton = complianceReports.locator('button:has-text("Generate Report"), [data-action="generate-report"]');
          if (await generateReportButton.count() > 0) {
            await generateReportButton.click();

            const reportModal = page.locator('.report-modal, [data-testid="report-modal"]');
            if (await reportModal.count() > 0) {
              await expect(reportModal).toBeVisible();

              const reportType = reportModal.locator('select[name="report_type"]');
              if (await reportType.count() > 0) {
                await reportType.selectOption('monthly');
              }

              const generateButton = reportModal.locator('button:has-text("Generate")');
              if (await generateButton.count() > 0) {
                await generateButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }
      }
    });

    test('Security and Anti-Fraud Measures', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/security`);

      const securityPage = page.locator('.security-page, [data-testid="security-page"]');
      if (await securityPage.count() > 0) {
        await expect(securityPage).toBeVisible();

        // Test fraud detection system
        const fraudDetection = securityPage.locator('.fraud-detection, [data-testid="fraud-detection"]');
        if (await fraudDetection.count() > 0) {
          await expect(fraudDetection).toBeVisible();

          // Test fraud alerts
          const fraudAlerts = fraudDetection.locator('.fraud-alerts, [data-testid="fraud-alerts"]');
          if (await fraudAlerts.count() > 0) {
            const alertItems = fraudAlerts.locator('.alert-item, [data-testid="alert-item"]');
            if (await alertItems.count() > 0) {
              const firstAlert = alertItems.first();

              const alertType = firstAlert.locator('.alert-type, .type');
              const alertSeverity = firstAlert.locator('.alert-severity, .severity');
              const alertDescription = firstAlert.locator('.alert-description, .description');

              if (await alertType.count() > 0) await expect(alertType).toBeVisible();
              if (await alertSeverity.count() > 0) await expect(alertSeverity).toBeVisible();
              if (await alertDescription.count() > 0) await expect(alertDescription).toBeVisible();

              // Test alert actions
              const reviewButton = firstAlert.locator('button:has-text("Review"), [data-action="review"]');
              const dismissButton = firstAlert.locator('button:has-text("Dismiss"), [data-action="dismiss"]');

              if (await reviewButton.count() > 0) {
                await reviewButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test security settings
        const securitySettings = securityPage.locator('.security-settings, [data-testid="security-settings"]');
        if (await securitySettings.count() > 0) {
          const settingOptions = [
            'transaction_notifications',
            'login_alerts',
            'unusual_activity_alerts',
            'device_registration_required'
          ];

          for (const setting of settingOptions) {
            const settingToggle = securitySettings.locator(`input[name="${setting}"], [data-setting="${setting}"]`);
            if (await settingToggle.count() > 0) {
              await settingToggle.click();
              await page.waitForTimeout(500);
            }
          }
        }

        // Test transaction limits
        const transactionLimits = securityPage.locator('.transaction-limits, [data-testid="transaction-limits"]');
        if (await transactionLimits.count() > 0) {
          const dailyLimitInput = transactionLimits.locator('input[name="daily_limit"]');
          const monthlyLimitInput = transactionLimits.locator('input[name="monthly_limit"]');

          if (await dailyLimitInput.count() > 0) {
            await dailyLimitInput.clear();
            await dailyLimitInput.fill('5000');
          }

          if (await monthlyLimitInput.count() > 0) {
            await monthlyLimitInput.clear();
            await monthlyLimitInput.fill('50000');
          }

          const saveLimitsButton = transactionLimits.locator('button:has-text("Save Limits")');
          if (await saveLimitsButton.count() > 0) {
            await saveLimitsButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });

  test.describe('📊 Financial Reporting and Analytics', () => {

    test('Comprehensive Financial Reports', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/reports`);

      const reportsPage = page.locator('.reports-page, [data-testid="reports-page"]');
      if (await reportsPage.count() > 0) {
        await expect(reportsPage).toBeVisible();

        // Test report templates
        const reportTemplates = reportsPage.locator('.report-templates, [data-testid="templates"]');
        if (await reportTemplates.count() > 0) {
          const templateItems = reportTemplates.locator('.template-item, [data-testid="template-item"]');
          if (await templateItems.count() > 0) {
            const incomeStatementTemplate = templateItems.filter({ hasText: 'Income Statement' });
            if (await incomeStatementTemplate.count() > 0) {
              await incomeStatementTemplate.click();

              const reportGenerator = page.locator('.report-generator, [data-testid="report-generator"]');
              if (await reportGenerator.count() > 0) {
                await expect(reportGenerator).toBeVisible();

                // Test report parameters
                const dateRange = reportGenerator.locator('.date-range, [data-param="date-range"]');
                if (await dateRange.count() > 0) {
                  await dateRange.locator('input[name="start_date"]').fill('2024-01-01');
                  await dateRange.locator('input[name="end_date"]').fill('2024-12-31');
                }

                const accountFilter = reportGenerator.locator('select[name="accounts"]');
                if (await accountFilter.count() > 0) {
                  await accountFilter.selectOption('all');
                }

                const generateButton = reportGenerator.locator('button:has-text("Generate Report")');
                if (await generateButton.count() > 0) {
                  await generateButton.click();
                  await page.waitForLoadState('networkidle');

                  // Test generated report
                  const generatedReport = page.locator('.generated-report, [data-testid="generated-report"]');
                  if (await generatedReport.count() > 0) {
                    await expect(generatedReport).toBeVisible();

                    const reportData = generatedReport.locator('.report-data, [data-testid="report-data"]');
                    if (await reportData.count() > 0) {
                      await expect(reportData).toBeVisible();
                    }

                    // Test report export
                    const exportButton = generatedReport.locator('button:has-text("Export"), [data-action="export"]');
                    if (await exportButton.count() > 0) {
                      await exportButton.click();

                      const exportOptions = page.locator('.export-options, [data-testid="export-options"]');
                      if (await exportOptions.count() > 0) {
                        const pdfOption = exportOptions.locator('button:has-text("PDF")');
                        if (await pdfOption.count() > 0) {
                          await pdfOption.click();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Test custom reports
        const customReportButton = reportsPage.locator('button:has-text("Custom Report"), [data-action="custom-report"]');
        if (await customReportButton.count() > 0) {
          await customReportButton.click();

          const customReportBuilder = page.locator('.custom-report-builder, [data-testid="custom-builder"]');
          if (await customReportBuilder.count() > 0) {
            await expect(customReportBuilder).toBeVisible();

            // Test report builder features
            const fieldSelector = customReportBuilder.locator('.field-selector, [data-testid="field-selector"]');
            if (await fieldSelector.count() > 0) {
              const availableFields = fieldSelector.locator('.available-fields, [data-testid="available-fields"]');
              if (await availableFields.count() > 0) {
                const fields = availableFields.locator('.field-item, [data-testid="field-item"]');
                if (await fields.count() > 0) {
                  await fields.first().click();
                  await fields.nth(1).click();
                  await fields.nth(2).click();
                }
              }
            }

            const buildReportButton = customReportBuilder.locator('button:has-text("Build Report")');
            if (await buildReportButton.count() > 0) {
              await buildReportButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('Romanian Tax Reporting Integration', async ({ page }) => {
      await page.goto(`${BANCAI_BASE_URL}/tax-reports`);

      const taxReportsPage = page.locator('.tax-reports-page, [data-testid="tax-reports-page"]');
      if (await taxReportsPage.count() > 0) {
        await expect(taxReportsPage).toBeVisible();

        // Test Romanian tax forms
        const romanianTaxForms = taxReportsPage.locator('.romanian-tax-forms, [data-testid="romanian-tax-forms"]');
        if (await romanianTaxForms.count() > 0) {
          await expect(romanianTaxForms).toBeVisible();

          // Test specific Romanian tax forms
          const taxForms = [
            'Declarația de venit (Income Declaration)',
            'Declarația 394 (Investment Income)',
            'Formularul 200 (Profit Tax)',
            'Declarația TVA (VAT Declaration)'
          ];

          for (const formName of taxForms) {
            const formButton = romanianTaxForms.locator(`button:has-text("${formName}"), [data-form="${formName.toLowerCase().replace(/\s+/g, '-')}"]`);
            if (await formButton.count() > 0) {
              await formButton.click();
              await page.waitForLoadState('networkidle');

              const taxForm = page.locator('.tax-form, [data-testid="tax-form"]');
              if (await taxForm.count() > 0) {
                await expect(taxForm).toBeVisible();

                // Test auto-fill from transaction data
                const autoFillButton = taxForm.locator('button:has-text("Auto-Fill"), [data-action="auto-fill"]');
                if (await autoFillButton.count() > 0) {
                  await autoFillButton.click();
                  await page.waitForLoadState('networkidle');
                }

                // Test form validation
                const validateButton = taxForm.locator('button:has-text("Validate"), [data-action="validate"]');
                if (await validateButton.count() > 0) {
                  await validateButton.click();
                  await page.waitForLoadState('networkidle');
                }

                // Go back to forms list
                const backButton = page.locator('button:has-text("Back"), [data-action="back"]');
                if (await backButton.count() > 0) {
                  await backButton.click();
                }
              }
            }
          }
        }

        // Test tax optimization suggestions
        const taxOptimization = taxReportsPage.locator('.tax-optimization, [data-testid="tax-optimization"]');
        if (await taxOptimization.count() > 0) {
          await expect(taxOptimization).toBeVisible();

          const optimizationSuggestions = taxOptimization.locator('.optimization-suggestions, [data-testid="suggestions"]');
          if (await optimizationSuggestions.count() > 0) {
            const suggestionItems = optimizationSuggestions.locator('.suggestion-item, [data-testid="suggestion-item"]');
            if (await suggestionItems.count() > 0) {
              const firstSuggestion = suggestionItems.first();

              const suggestionTitle = firstSuggestion.locator('.suggestion-title, .title');
              const suggestionSavings = firstSuggestion.locator('.suggestion-savings, .savings');
              const suggestionComplexity = firstSuggestion.locator('.suggestion-complexity, .complexity');

              if (await suggestionTitle.count() > 0) await expect(suggestionTitle).toBeVisible();
              if (await suggestionSavings.count() > 0) await expect(suggestionSavings).toBeVisible();
              if (await suggestionComplexity.count() > 0) await expect(suggestionComplexity).toBeVisible();

              const learnMoreButton = firstSuggestion.locator('button:has-text("Learn More")');
              if (await learnMoreButton.count() > 0) {
                await learnMoreButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }
      }
    });
  });
});

// Helper functions for BancAI testing
export class BancAITestHelpers {
  static async connectBank(page: Page, bankName: string, credentials: any) {
    await page.goto(`${BANCAI_BASE_URL}/banks`);
    const bankCard = page.locator(`.bank-card:has-text("${bankName}")`);
    if (await bankCard.count() > 0) {
      await bankCard.locator('button:has-text("Connect")').click();

      const connectionModal = page.locator('.bank-connection-modal');
      if (await connectionModal.count() > 0) {
        await connectionModal.locator('input[name="user_id"]').fill(credentials.userId);
        await connectionModal.locator('input[name="password"]').fill(credentials.password);
        await connectionModal.locator('button[type="submit"]').click();
        await page.waitForLoadState('networkidle');
      }
    }
  }

  static async createBudget(page: Page, budgetData: any) {
    await page.goto(`${BANCAI_BASE_URL}/budgets`);
    await page.click('button:has-text("Create Budget")');

    const budgetModal = page.locator('.budget-modal');
    if (await budgetModal.count() > 0) {
      await budgetModal.locator('input[name="name"]').fill(budgetData.name);
      await budgetModal.locator('select[name="category"]').selectOption(budgetData.category);
      await budgetModal.locator('input[name="amount"]').fill(budgetData.amount.toString());
      await budgetModal.locator('select[name="period"]').selectOption(budgetData.period);

      await budgetModal.locator('button:has-text("Save Budget")').click();
      await page.waitForLoadState('networkidle');
    }
  }

  static async getChatAdvice(page: Page, question: string) {
    await page.goto(`${BANCAI_BASE_URL}/advisor`);
    const chatInput = page.locator('.chat-input');
    if (await chatInput.count() > 0) {
      await chatInput.fill(question);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Wait for AI response
      await page.waitForSelector('.message:last-child .message-text', { timeout: 10000 });
    }
  }
}
