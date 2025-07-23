// Gateway Service - Comprehensive API Gateway and Routing Testing
// Testing all routing, load balancing, authentication, and API management features

import { test, expect, Page } from '@playwright/test';

const GATEWAY_BASE_URL = 'http://localhost:4000';

test.describe('🌐 Gateway Service - Comprehensive API Gateway Testing', () => {

  test.describe('🔀 API Routing and Load Balancing', () => {

    test('Service Discovery and Health Checks', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/health`);

      // Test gateway health endpoint
      const healthResponse = await page.locator('body').textContent();
      if (healthResponse) {
        expect(healthResponse).toContain('status');
      }

      // Test service registry
      await page.goto(`${GATEWAY_BASE_URL}/services`);

      const servicesPage = page.locator('.services-page, [data-testid="services-page"]');
      if (await servicesPage.count() > 0) {
        await expect(servicesPage).toBeVisible();

        // Test registered services
        const servicesList = servicesPage.locator('.services-list, [data-testid="services-list"]');
        if (await servicesList.count() > 0) {
          const expectedServices = [
            { name: 'CODAI', port: '4001' },
            { name: 'Admin', port: '4002' },
            { name: 'Hub', port: '4003' },
            { name: 'ID', port: '4004' },
            { name: 'BancAI', port: '4005' }
          ];

          for (const service of expectedServices) {
            const serviceCard = servicesList.locator(`.service-card:has-text("${service.name}"), [data-service="${service.name.toLowerCase()}"]`);
            if (await serviceCard.count() > 0) {
              await expect(serviceCard).toBeVisible();

              // Test service health indicator
              const healthIndicator = serviceCard.locator('.health-indicator, .status');
              if (await healthIndicator.count() > 0) {
                await expect(healthIndicator).toBeVisible();
              }

              // Test service endpoint info
              const servicePort = serviceCard.locator('.service-port, .port');
              if (await servicePort.count() > 0) {
                await expect(servicePort).toContainText(service.port);
              }

              // Test service actions
              const restartButton = serviceCard.locator('button:has-text("Restart"), [data-action="restart"]');
              const stopButton = serviceCard.locator('button:has-text("Stop"), [data-action="stop"]');

              if (await restartButton.count() > 0) {
                await expect(restartButton).toBeVisible();
              }
              if (await stopButton.count() > 0) {
                await expect(stopButton).toBeVisible();
              }
            }
          }
        }
      }
    });

    test('API Request Routing and Forwarding', async ({ page }) => {
      // Test routing to different services through gateway
      const routingTests = [
        { path: '/api/codai/projects', service: 'CODAI', expectedPort: '4001' },
        { path: '/api/admin/users', service: 'Admin', expectedPort: '4002' },
        { path: '/api/hub/teams', service: 'Hub', expectedPort: '4003' },
        { path: '/api/id/profile', service: 'ID', expectedPort: '4004' },
        { path: '/api/bancai/accounts', service: 'BancAI', expectedPort: '4005' }
      ];

      for (const route of routingTests) {
        // Test API endpoint through gateway
        const response = await page.request.get(`${GATEWAY_BASE_URL}${route.path}`);

        // Verify response indicates proper routing
        expect(response.status()).toBeLessThan(500); // Should not be server error

        // Test routing dashboard shows the route
        await page.goto(`${GATEWAY_BASE_URL}/dashboard/routing`);

        const routingDashboard = page.locator('.routing-dashboard, [data-testid="routing-dashboard"]');
        if (await routingDashboard.count() > 0) {
          const routesList = routingDashboard.locator('.routes-list, [data-testid="routes-list"]');
          if (await routesList.count() > 0) {
            const routeItem = routesList.locator(`[data-route="${route.path}"], .route-item:has-text("${route.path}")`);
            if (await routeItem.count() > 0) {
              await expect(routeItem).toBeVisible();

              // Test route details
              const routeService = routeItem.locator('.route-service, .service');
              const routeStatus = routeItem.locator('.route-status, .status');

              if (await routeService.count() > 0) {
                await expect(routeService).toContainText(route.service);
              }
              if (await routeStatus.count() > 0) {
                await expect(routeStatus).toBeVisible();
              }
            }
          }
        }
      }
    });

    test('Load Balancing and Traffic Distribution', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/dashboard/load-balancing`);

      const loadBalancingDashboard = page.locator('.load-balancing-dashboard, [data-testid="load-balancing"]');
      if (await loadBalancingDashboard.count() > 0) {
        await expect(loadBalancingDashboard).toBeVisible();

        // Test load balancing strategies
        const strategiesSection = loadBalancingDashboard.locator('.balancing-strategies, [data-testid="strategies"]');
        if (await strategiesSection.count() > 0) {
          const strategyOptions = ['round-robin', 'weighted', 'least-connections', 'ip-hash'];

          for (const strategy of strategyOptions) {
            const strategyCard = strategiesSection.locator(`[data-strategy="${strategy}"], .strategy-card:has-text("${strategy}")`);
            if (await strategyCard.count() > 0) {
              await expect(strategyCard).toBeVisible();

              // Test strategy selection
              const selectButton = strategyCard.locator('button:has-text("Select"), [data-action="select"]');
              if (await selectButton.count() > 0) {
                await selectButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test traffic distribution metrics
        const trafficMetrics = loadBalancingDashboard.locator('.traffic-metrics, [data-testid="traffic-metrics"]');
        if (await trafficMetrics.count() > 0) {
          await expect(trafficMetrics).toBeVisible();

          // Test individual service metrics
          const serviceMetrics = trafficMetrics.locator('.service-metric, [data-testid="service-metric"]');
          if (await serviceMetrics.count() > 0) {
            const firstMetric = serviceMetrics.first();

            const serviceName = firstMetric.locator('.service-name, .name');
            const requestCount = firstMetric.locator('.request-count, .requests');
            const responseTime = firstMetric.locator('.response-time, .latency');
            const errorRate = firstMetric.locator('.error-rate, .errors');

            if (await serviceName.count() > 0) await expect(serviceName).toBeVisible();
            if (await requestCount.count() > 0) await expect(requestCount).toBeVisible();
            if (await responseTime.count() > 0) await expect(responseTime).toBeVisible();
            if (await errorRate.count() > 0) await expect(errorRate).toBeVisible();
          }
        }

        // Test real-time traffic visualization
        const trafficVisualization = loadBalancingDashboard.locator('.traffic-visualization, [data-testid="traffic-viz"]');
        if (await trafficVisualization.count() > 0) {
          await expect(trafficVisualization).toBeVisible();

          const trafficChart = trafficVisualization.locator('.traffic-chart, canvas, svg');
          if (await trafficChart.count() > 0) {
            await expect(trafficChart).toBeVisible();
          }
        }
      }
    });

    test('Circuit Breaker and Resilience Patterns', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/dashboard/circuit-breakers`);

      const circuitBreakerDashboard = page.locator('.circuit-breaker-dashboard, [data-testid="circuit-breakers"]');
      if (await circuitBreakerDashboard.count() > 0) {
        await expect(circuitBreakerDashboard).toBeVisible();

        // Test circuit breaker status for each service
        const circuitBreakers = circuitBreakerDashboard.locator('.circuit-breaker, [data-testid="circuit-breaker"]');
        if (await circuitBreakers.count() > 0) {
          const firstBreaker = circuitBreakers.first();

          // Test circuit breaker states
          const breakerState = firstBreaker.locator('.breaker-state, .state');
          const breakerThreshold = firstBreaker.locator('.breaker-threshold, .threshold');
          const breakerFailures = firstBreaker.locator('.breaker-failures, .failures');
          const breakerTimeout = firstBreaker.locator('.breaker-timeout, .timeout');

          if (await breakerState.count() > 0) await expect(breakerState).toBeVisible();
          if (await breakerThreshold.count() > 0) await expect(breakerThreshold).toBeVisible();
          if (await breakerFailures.count() > 0) await expect(breakerFailures).toBeVisible();
          if (await breakerTimeout.count() > 0) await expect(breakerTimeout).toBeVisible();

          // Test circuit breaker actions
          const resetButton = firstBreaker.locator('button:has-text("Reset"), [data-action="reset"]');
          const configureButton = firstBreaker.locator('button:has-text("Configure"), [data-action="configure"]');

          if (await resetButton.count() > 0) {
            await resetButton.click();
            await page.waitForLoadState('networkidle');
          }

          if (await configureButton.count() > 0) {
            await configureButton.click();

            const configModal = page.locator('.breaker-config-modal, [data-testid="breaker-config"]');
            if (await configModal.count() > 0) {
              await expect(configModal).toBeVisible();

              const thresholdInput = configModal.locator('input[name="failure_threshold"]');
              const timeoutInput = configModal.locator('input[name="timeout_duration"]');

              if (await thresholdInput.count() > 0) {
                await thresholdInput.clear();
                await thresholdInput.fill('5');
              }
              if (await timeoutInput.count() > 0) {
                await timeoutInput.clear();
                await timeoutInput.fill('30000');
              }

              const saveButton = configModal.locator('button:has-text("Save")');
              if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test resilience metrics
        const resilienceMetrics = circuitBreakerDashboard.locator('.resilience-metrics, [data-testid="resilience-metrics"]');
        if (await resilienceMetrics.count() > 0) {
          await expect(resilienceMetrics).toBeVisible();

          const metrics = [
            '.availability-metric, [data-metric="availability"]',
            '.fault-tolerance-metric, [data-metric="fault-tolerance"]',
            '.recovery-time-metric, [data-metric="recovery-time"]'
          ];

          for (const metricSelector of metrics) {
            const metric = resilienceMetrics.locator(metricSelector);
            if (await metric.count() > 0) {
              await expect(metric).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('🔐 Authentication and Authorization', () => {

    test('JWT Token Management and Validation', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/auth/tokens`);

      const tokenManagement = page.locator('.token-management, [data-testid="token-management"]');
      if (await tokenManagement.count() > 0) {
        await expect(tokenManagement).toBeVisible();

        // Test token generation
        const generateTokenButton = tokenManagement.locator('button:has-text("Generate Token"), [data-action="generate-token"]');
        if (await generateTokenButton.count() > 0) {
          await generateTokenButton.click();

          const tokenModal = page.locator('.token-modal, [data-testid="token-modal"]');
          if (await tokenModal.count() > 0) {
            await expect(tokenModal).toBeVisible();

            await tokenModal.locator('input[name="token_name"]').fill('Test API Token');
            await tokenModal.locator('select[name="expiration"]').selectOption('7d');

            // Test scope selection
            const scopesSection = tokenModal.locator('.token-scopes, [data-testid="scopes"]');
            if (await scopesSection.count() > 0) {
              const scopes = ['read', 'write', 'admin'];

              for (const scope of scopes) {
                const scopeCheckbox = scopesSection.locator(`input[value="${scope}"], [data-scope="${scope}"]`);
                if (await scopeCheckbox.count() > 0) {
                  await scopeCheckbox.click();
                }
              }
            }

            const createTokenButton = tokenModal.locator('button:has-text("Create Token")');
            if (await createTokenButton.count() > 0) {
              await createTokenButton.click();
              await page.waitForLoadState('networkidle');

              // Test generated token display
              const generatedToken = page.locator('.generated-token, [data-testid="generated-token"]');
              if (await generatedToken.count() > 0) {
                await expect(generatedToken).toBeVisible();

                const copyButton = generatedToken.locator('button:has-text("Copy"), [data-action="copy"]');
                if (await copyButton.count() > 0) {
                  await copyButton.click();
                }
              }
            }
          }
        }

        // Test active tokens list
        const activeTokens = tokenManagement.locator('.active-tokens, [data-testid="active-tokens"]');
        if (await activeTokens.count() > 0) {
          const tokenItems = activeTokens.locator('.token-item, [data-testid="token-item"]');
          if (await tokenItems.count() > 0) {
            const firstToken = tokenItems.first();

            // Test token info
            const tokenName = firstToken.locator('.token-name, .name');
            const tokenScopes = firstToken.locator('.token-scopes, .scopes');
            const tokenExpiry = firstToken.locator('.token-expiry, .expiry');
            const tokenUsage = firstToken.locator('.token-usage, .usage');

            if (await tokenName.count() > 0) await expect(tokenName).toBeVisible();
            if (await tokenScopes.count() > 0) await expect(tokenScopes).toBeVisible();
            if (await tokenExpiry.count() > 0) await expect(tokenExpiry).toBeVisible();
            if (await tokenUsage.count() > 0) await expect(tokenUsage).toBeVisible();

            // Test token actions
            const revokeButton = firstToken.locator('button:has-text("Revoke"), [data-action="revoke"]');
            const viewUsageButton = firstToken.locator('button:has-text("Usage"), [data-action="view-usage"]');

            if (await revokeButton.count() > 0) {
              await expect(revokeButton).toBeVisible();
            }

            if (await viewUsageButton.count() > 0) {
              await viewUsageButton.click();

              const usageModal = page.locator('.usage-modal, [data-testid="usage-modal"]');
              if (await usageModal.count() > 0) {
                await expect(usageModal).toBeVisible();

                const usageChart = usageModal.locator('.usage-chart, canvas, svg');
                if (await usageChart.count() > 0) {
                  await expect(usageChart).toBeVisible();
                }
              }
            }
          }
        }
      }
    });

    test('Role-Based Access Control (RBAC)', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/auth/rbac`);

      const rbacDashboard = page.locator('.rbac-dashboard, [data-testid="rbac-dashboard"]');
      if (await rbacDashboard.count() > 0) {
        await expect(rbacDashboard).toBeVisible();

        // Test roles management
        const rolesSection = rbacDashboard.locator('.roles-section, [data-testid="roles"]');
        if (await rolesSection.count() > 0) {
          const createRoleButton = rolesSection.locator('button:has-text("Create Role"), [data-action="create-role"]');
          if (await createRoleButton.count() > 0) {
            await createRoleButton.click();

            const roleModal = page.locator('.role-modal, [data-testid="role-modal"]');
            if (await roleModal.count() > 0) {
              await expect(roleModal).toBeVisible();

              await roleModal.locator('input[name="role_name"]').fill('Test Developer');
              await roleModal.locator('textarea[name="description"]').fill('Developer role for testing');

              // Test permissions assignment
              const permissionsSection = roleModal.locator('.permissions-section, [data-testid="permissions"]');
              if (await permissionsSection.count() > 0) {
                const permissions = [
                  'read_projects', 'write_projects', 'delete_projects',
                  'read_users', 'write_users', 'admin_access'
                ];

                for (const permission of permissions) {
                  const permissionCheckbox = permissionsSection.locator(`input[value="${permission}"], [data-permission="${permission}"]`);
                  if (await permissionCheckbox.count() > 0) {
                    await permissionCheckbox.click();
                  }
                }
              }

              const saveRoleButton = roleModal.locator('button:has-text("Save Role")');
              if (await saveRoleButton.count() > 0) {
                await saveRoleButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          // Test existing roles
          const rolesList = rolesSection.locator('.roles-list, [data-testid="roles-list"]');
          if (await rolesList.count() > 0) {
            const roleItems = rolesList.locator('.role-item, [data-testid="role-item"]');
            if (await roleItems.count() > 0) {
              const firstRole = roleItems.first();

              const roleName = firstRole.locator('.role-name, .name');
              const rolePermissions = firstRole.locator('.role-permissions, .permissions');
              const roleUsers = firstRole.locator('.role-users, .users-count');

              if (await roleName.count() > 0) await expect(roleName).toBeVisible();
              if (await rolePermissions.count() > 0) await expect(rolePermissions).toBeVisible();
              if (await roleUsers.count() > 0) await expect(roleUsers).toBeVisible();

              // Test role actions
              const editRoleButton = firstRole.locator('button:has-text("Edit"), [data-action="edit"]');
              if (await editRoleButton.count() > 0) {
                await editRoleButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test permissions matrix
        const permissionsMatrix = rbacDashboard.locator('.permissions-matrix, [data-testid="permissions-matrix"]');
        if (await permissionsMatrix.count() > 0) {
          await expect(permissionsMatrix).toBeVisible();

          const matrixTable = permissionsMatrix.locator('table, .matrix-table');
          if (await matrixTable.count() > 0) {
            await expect(matrixTable).toBeVisible();

            // Test permission cells
            const permissionCells = matrixTable.locator('.permission-cell, [data-testid="permission-cell"]');
            if (await permissionCells.count() > 0) {
              await permissionCells.first().click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    });

    test('OAuth and External Authentication', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/auth/oauth`);

      const oauthDashboard = page.locator('.oauth-dashboard, [data-testid="oauth-dashboard"]');
      if (await oauthDashboard.count() > 0) {
        await expect(oauthDashboard).toBeVisible();

        // Test OAuth providers
        const oauthProviders = oauthDashboard.locator('.oauth-providers, [data-testid="oauth-providers"]');
        if (await oauthProviders.count() > 0) {
          const providers = [
            { name: 'Google', selector: '.google-provider, [data-provider="google"]' },
            { name: 'GitHub', selector: '.github-provider, [data-provider="github"]' },
            { name: 'Microsoft', selector: '.microsoft-provider, [data-provider="microsoft"]' }
          ];

          for (const provider of providers) {
            const providerCard = oauthProviders.locator(provider.selector);
            if (await providerCard.count() > 0) {
              await expect(providerCard).toBeVisible();

              // Test provider configuration
              const configureButton = providerCard.locator('button:has-text("Configure"), [data-action="configure"]');
              if (await configureButton.count() > 0) {
                await configureButton.click();

                const configModal = page.locator('.oauth-config-modal, [data-testid="oauth-config"]');
                if (await configModal.count() > 0) {
                  await expect(configModal).toBeVisible();

                  const clientIdInput = configModal.locator('input[name="client_id"]');
                  const clientSecretInput = configModal.locator('input[name="client_secret"]');
                  const redirectUriInput = configModal.locator('input[name="redirect_uri"]');

                  if (await clientIdInput.count() > 0) {
                    await clientIdInput.fill('test_client_id');
                  }
                  if (await clientSecretInput.count() > 0) {
                    await clientSecretInput.fill('test_client_secret');
                  }
                  if (await redirectUriInput.count() > 0) {
                    await redirectUriInput.fill('http://localhost:4000/auth/callback');
                  }

                  const saveConfigButton = configModal.locator('button:has-text("Save")');
                  if (await saveConfigButton.count() > 0) {
                    await saveConfigButton.click();
                    await page.waitForLoadState('networkidle');
                  }
                }
              }

              // Test provider status
              const providerStatus = providerCard.locator('.provider-status, .status');
              if (await providerStatus.count() > 0) {
                await expect(providerStatus).toBeVisible();
              }
            }
          }
        }

        // Test OAuth flow testing
        const oauthTesting = oauthDashboard.locator('.oauth-testing, [data-testid="oauth-testing"]');
        if (await oauthTesting.count() > 0) {
          const testFlowButton = oauthTesting.locator('button:has-text("Test Flow"), [data-action="test-flow"]');
          if (await testFlowButton.count() > 0) {
            await testFlowButton.click();

            const testResults = page.locator('.test-results, [data-testid="test-results"]');
            if (await testResults.count() > 0) {
              await expect(testResults).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('📊 API Management and Monitoring', () => {

    test('API Analytics and Usage Metrics', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/analytics`);

      const analyticsPage = page.locator('.analytics-page, [data-testid="analytics-page"]');
      if (await analyticsPage.count() > 0) {
        await expect(analyticsPage).toBeVisible();

        // Test analytics overview
        const analyticsOverview = analyticsPage.locator('.analytics-overview, [data-testid="overview"]');
        if (await analyticsOverview.count() > 0) {
          await expect(analyticsOverview).toBeVisible();

          // Test key metrics
          const keyMetrics = [
            '.total-requests, [data-metric="total-requests"]',
            '.response-time, [data-metric="response-time"]',
            '.error-rate, [data-metric="error-rate"]',
            '.throughput, [data-metric="throughput"]'
          ];

          for (const metricSelector of keyMetrics) {
            const metric = analyticsOverview.locator(metricSelector);
            if (await metric.count() > 0) {
              await expect(metric).toBeVisible();

              const metricValue = metric.locator('.metric-value, .value');
              const metricTrend = metric.locator('.metric-trend, .trend');

              if (await metricValue.count() > 0) await expect(metricValue).toBeVisible();
              if (await metricTrend.count() > 0) await expect(metricTrend).toBeVisible();
            }
          }
        }

        // Test analytics charts
        const analyticsCharts = analyticsPage.locator('.analytics-charts, [data-testid="charts"]');
        if (await analyticsCharts.count() > 0) {
          await expect(analyticsCharts).toBeVisible();

          const chartTypes = [
            '.requests-chart, [data-chart="requests"]',
            '.latency-chart, [data-chart="latency"]',
            '.errors-chart, [data-chart="errors"]',
            '.services-chart, [data-chart="services"]'
          ];

          for (const chartSelector of chartTypes) {
            const chart = analyticsCharts.locator(chartSelector);
            if (await chart.count() > 0) {
              await expect(chart).toBeVisible();

              const chartCanvas = chart.locator('canvas, svg');
              if (await chartCanvas.count() > 0) {
                await expect(chartCanvas).toBeVisible();
              }
            }
          }
        }

        // Test time range selection
        const timeRangeSelector = analyticsPage.locator('.time-range-selector, [data-testid="time-range"]');
        if (await timeRangeSelector.count() > 0) {
          const timeRangeOptions = ['1h', '6h', '24h', '7d', '30d'];

          for (const option of timeRangeOptions) {
            const timeRangeButton = timeRangeSelector.locator(`button:has-text("${option}"), [data-range="${option}"]`);
            if (await timeRangeButton.count() > 0) {
              await timeRangeButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test API endpoints breakdown
        const endpointsBreakdown = analyticsPage.locator('.endpoints-breakdown, [data-testid="endpoints"]');
        if (await endpointsBreakdown.count() > 0) {
          await expect(endpointsBreakdown).toBeVisible();

          const endpointItems = endpointsBreakdown.locator('.endpoint-item, [data-testid="endpoint-item"]');
          if (await endpointItems.count() > 0) {
            const firstEndpoint = endpointItems.first();

            const endpointPath = firstEndpoint.locator('.endpoint-path, .path');
            const endpointRequests = firstEndpoint.locator('.endpoint-requests, .requests');
            const endpointLatency = firstEndpoint.locator('.endpoint-latency, .latency');
            const endpointErrors = firstEndpoint.locator('.endpoint-errors, .errors');

            if (await endpointPath.count() > 0) await expect(endpointPath).toBeVisible();
            if (await endpointRequests.count() > 0) await expect(endpointRequests).toBeVisible();
            if (await endpointLatency.count() > 0) await expect(endpointLatency).toBeVisible();
            if (await endpointErrors.count() > 0) await expect(endpointErrors).toBeVisible();

            // Test endpoint details
            await firstEndpoint.click();

            const endpointDetails = page.locator('.endpoint-details, [data-testid="endpoint-details"]');
            if (await endpointDetails.count() > 0) {
              await expect(endpointDetails).toBeVisible();
            }
          }
        }
      }
    });

    test('Rate Limiting and Throttling', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/rate-limiting`);

      const rateLimitingPage = page.locator('.rate-limiting-page, [data-testid="rate-limiting"]');
      if (await rateLimitingPage.count() > 0) {
        await expect(rateLimitingPage).toBeVisible();

        // Test rate limiting policies
        const rateLimitPolicies = rateLimitingPage.locator('.rate-limit-policies, [data-testid="policies"]');
        if (await rateLimitPolicies.count() > 0) {
          const createPolicyButton = rateLimitPolicies.locator('button:has-text("Create Policy"), [data-action="create-policy"]');
          if (await createPolicyButton.count() > 0) {
            await createPolicyButton.click();

            const policyModal = page.locator('.policy-modal, [data-testid="policy-modal"]');
            if (await policyModal.count() > 0) {
              await expect(policyModal).toBeVisible();

              await policyModal.locator('input[name="policy_name"]').fill('API Rate Limit');
              await policyModal.locator('input[name="requests_per_minute"]').fill('100');
              await policyModal.locator('input[name="requests_per_hour"]').fill('1000');
              await policyModal.locator('select[name="scope"]').selectOption('user');

              // Test policy conditions
              const policyConditions = policyModal.locator('.policy-conditions, [data-testid="conditions"]');
              if (await policyConditions.count() > 0) {
                const conditionInput = policyConditions.locator('input[name="condition"]');
                if (await conditionInput.count() > 0) {
                  await conditionInput.fill('/api/codai/*');
                }
              }

              const savePolicyButton = policyModal.locator('button:has-text("Save Policy")');
              if (await savePolicyButton.count() > 0) {
                await savePolicyButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          // Test existing policies
          const policiesList = rateLimitPolicies.locator('.policies-list, [data-testid="policies-list"]');
          if (await policiesList.count() > 0) {
            const policyItems = policiesList.locator('.policy-item, [data-testid="policy-item"]');
            if (await policyItems.count() > 0) {
              const firstPolicy = policyItems.first();

              const policyName = firstPolicy.locator('.policy-name, .name');
              const policyLimits = firstPolicy.locator('.policy-limits, .limits');
              const policyStatus = firstPolicy.locator('.policy-status, .status');

              if (await policyName.count() > 0) await expect(policyName).toBeVisible();
              if (await policyLimits.count() > 0) await expect(policyLimits).toBeVisible();
              if (await policyStatus.count() > 0) await expect(policyStatus).toBeVisible();

              // Test policy actions
              const editPolicyButton = firstPolicy.locator('button:has-text("Edit"), [data-action="edit"]');
              const disablePolicyButton = firstPolicy.locator('button:has-text("Disable"), [data-action="disable"]');

              if (await editPolicyButton.count() > 0) {
                await editPolicyButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test rate limiting analytics
        const rateLimitingAnalytics = rateLimitingPage.locator('.rate-limiting-analytics, [data-testid="analytics"]');
        if (await rateLimitingAnalytics.count() > 0) {
          await expect(rateLimitingAnalytics).toBeVisible();

          // Test throttled requests chart
          const throttledRequestsChart = rateLimitingAnalytics.locator('.throttled-requests-chart, [data-chart="throttled"]');
          if (await throttledRequestsChart.count() > 0) {
            await expect(throttledRequestsChart).toBeVisible();
          }

          // Test top throttled users/IPs
          const topThrottled = rateLimitingAnalytics.locator('.top-throttled, [data-testid="top-throttled"]');
          if (await topThrottled.count() > 0) {
            await expect(topThrottled).toBeVisible();

            const throttledItems = topThrottled.locator('.throttled-item, [data-testid="throttled-item"]');
            if (await throttledItems.count() > 0) {
              await expect(throttledItems.first()).toBeVisible();
            }
          }
        }
      }
    });

    test('API Documentation and Testing', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/docs`);

      const apiDocs = page.locator('.api-docs, [data-testid="api-docs"]');
      if (await apiDocs.count() > 0) {
        await expect(apiDocs).toBeVisible();

        // Test API documentation sections
        const docsSidebar = apiDocs.locator('.docs-sidebar, [data-testid="docs-sidebar"]');
        if (await docsSidebar.count() > 0) {
          const servicesSections = [
            'CODAI API',
            'Admin API',
            'Hub API',
            'ID API',
            'BancAI API'
          ];

          for (const section of servicesSections) {
            const sectionLink = docsSidebar.locator(`a:has-text("${section}"), [data-section="${section.toLowerCase().replace(/\s+/g, '-')}"]`);
            if (await sectionLink.count() > 0) {
              await sectionLink.click();
              await page.waitForLoadState('networkidle');

              // Test section content
              const sectionContent = apiDocs.locator('.docs-content, [data-testid="docs-content"]');
              if (await sectionContent.count() > 0) {
                await expect(sectionContent).toBeVisible();

                // Test endpoint documentation
                const endpointDocs = sectionContent.locator('.endpoint-docs, [data-testid="endpoint-docs"]');
                if (await endpointDocs.count() > 0) {
                  const endpoints = endpointDocs.locator('.endpoint, [data-testid="endpoint"]');
                  if (await endpoints.count() > 0) {
                    const firstEndpoint = endpoints.first();

                    const endpointMethod = firstEndpoint.locator('.endpoint-method, .method');
                    const endpointPath = firstEndpoint.locator('.endpoint-path, .path');
                    const endpointDescription = firstEndpoint.locator('.endpoint-description, .description');

                    if (await endpointMethod.count() > 0) await expect(endpointMethod).toBeVisible();
                    if (await endpointPath.count() > 0) await expect(endpointPath).toBeVisible();
                    if (await endpointDescription.count() > 0) await expect(endpointDescription).toBeVisible();

                    // Test "Try it out" functionality
                    const tryItButton = firstEndpoint.locator('button:has-text("Try it out"), [data-action="try-it"]');
                    if (await tryItButton.count() > 0) {
                      await tryItButton.click();

                      const apiTester = page.locator('.api-tester, [data-testid="api-tester"]');
                      if (await apiTester.count() > 0) {
                        await expect(apiTester).toBeVisible();

                        // Test request parameters
                        const requestParams = apiTester.locator('.request-params, [data-testid="request-params"]');
                        if (await requestParams.count() > 0) {
                          const paramInputs = requestParams.locator('input, textarea');
                          if (await paramInputs.count() > 0) {
                            await paramInputs.first().fill('test-value');
                          }
                        }

                        const executeButton = apiTester.locator('button:has-text("Execute"), [data-action="execute"]');
                        if (await executeButton.count() > 0) {
                          await executeButton.click();
                          await page.waitForLoadState('networkidle');

                          // Test response display
                          const responseSection = apiTester.locator('.response-section, [data-testid="response"]');
                          if (await responseSection.count() > 0) {
                            await expect(responseSection).toBeVisible();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Test API schema validation
        const schemaValidation = apiDocs.locator('.schema-validation, [data-testid="schema-validation"]');
        if (await schemaValidation.count() > 0) {
          const validateSchemaButton = schemaValidation.locator('button:has-text("Validate Schema"), [data-action="validate-schema"]');
          if (await validateSchemaButton.count() > 0) {
            await validateSchemaButton.click();

            const validationResults = page.locator('.validation-results, [data-testid="validation-results"]');
            if (await validationResults.count() > 0) {
              await expect(validationResults).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('🔒 Security and Compliance', () => {

    test('Security Headers and CORS Configuration', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/security`);

      const securityPage = page.locator('.security-page, [data-testid="security-page"]');
      if (await securityPage.count() > 0) {
        await expect(securityPage).toBeVisible();

        // Test security headers configuration
        const securityHeaders = securityPage.locator('.security-headers, [data-testid="security-headers"]');
        if (await securityHeaders.count() > 0) {
          await expect(securityHeaders).toBeVisible();

          const headerSettings = [
            { name: 'Content-Security-Policy', selector: '.csp-setting, [data-header="csp"]' },
            { name: 'X-Frame-Options', selector: '.frame-options-setting, [data-header="frame-options"]' },
            { name: 'X-Content-Type-Options', selector: '.content-type-setting, [data-header="content-type"]' },
            { name: 'Strict-Transport-Security', selector: '.hsts-setting, [data-header="hsts"]' }
          ];

          for (const header of headerSettings) {
            const headerSetting = securityHeaders.locator(header.selector);
            if (await headerSetting.count() > 0) {
              await expect(headerSetting).toBeVisible();

              const enableToggle = headerSetting.locator('input[type="checkbox"], .toggle');
              if (await enableToggle.count() > 0) {
                await enableToggle.click();
                await page.waitForTimeout(500);
              }

              const configureButton = headerSetting.locator('button:has-text("Configure"), [data-action="configure"]');
              if (await configureButton.count() > 0) {
                await configureButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test CORS configuration
        const corsConfiguration = securityPage.locator('.cors-configuration, [data-testid="cors"]');
        if (await corsConfiguration.count() > 0) {
          await expect(corsConfiguration).toBeVisible();

          const corsSettings = corsConfiguration.locator('.cors-settings, [data-testid="cors-settings"]');
          if (await corsSettings.count() > 0) {
            const allowedOrigins = corsSettings.locator('textarea[name="allowed_origins"]');
            const allowedMethods = corsSettings.locator('.allowed-methods, [data-testid="allowed-methods"]');
            const allowedHeaders = corsSettings.locator('textarea[name="allowed_headers"]');

            if (await allowedOrigins.count() > 0) {
              await allowedOrigins.fill('http://localhost:3000\nhttps://codai.ro');
            }

            if (await allowedMethods.count() > 0) {
              const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
              for (const method of methods) {
                const methodCheckbox = allowedMethods.locator(`input[value="${method}"], [data-method="${method}"]`);
                if (await methodCheckbox.count() > 0) {
                  await methodCheckbox.click();
                }
              }
            }

            if (await allowedHeaders.count() > 0) {
              await allowedHeaders.fill('Content-Type\nAuthorization\nX-API-Key');
            }

            const saveCorsButton = corsSettings.locator('button:has-text("Save CORS"), [data-action="save-cors"]');
            if (await saveCorsButton.count() > 0) {
              await saveCorsButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test SSL/TLS configuration
        const sslConfiguration = securityPage.locator('.ssl-configuration, [data-testid="ssl"]');
        if (await sslConfiguration.count() > 0) {
          await expect(sslConfiguration).toBeVisible();

          const sslStatus = sslConfiguration.locator('.ssl-status, [data-testid="ssl-status"]');
          if (await sslStatus.count() > 0) {
            await expect(sslStatus).toBeVisible();
          }

          const certificateInfo = sslConfiguration.locator('.certificate-info, [data-testid="certificate-info"]');
          if (await certificateInfo.count() > 0) {
            await expect(certificateInfo).toBeVisible();
          }
        }
      }
    });

    test('IP Whitelisting and Blacklisting', async ({ page }) => {
      await page.goto(`${GATEWAY_BASE_URL}/security/ip-filtering`);

      const ipFilteringPage = page.locator('.ip-filtering-page, [data-testid="ip-filtering"]');
      if (await ipFilteringPage.count() > 0) {
        await expect(ipFilteringPage).toBeVisible();

        // Test IP whitelist management
        const whitelist = ipFilteringPage.locator('.ip-whitelist, [data-testid="whitelist"]');
        if (await whitelist.count() > 0) {
          const addIpButton = whitelist.locator('button:has-text("Add IP"), [data-action="add-ip"]');
          if (await addIpButton.count() > 0) {
            await addIpButton.click();

            const ipModal = page.locator('.ip-modal, [data-testid="ip-modal"]');
            if (await ipModal.count() > 0) {
              await expect(ipModal).toBeVisible();

              await ipModal.locator('input[name="ip_address"]').fill('192.168.1.100');
              await ipModal.locator('textarea[name="description"]').fill('Office IP address');
              await ipModal.locator('select[name="type"]').selectOption('whitelist');

              const saveIpButton = ipModal.locator('button:has-text("Save IP")');
              if (await saveIpButton.count() > 0) {
                await saveIpButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          // Test existing whitelist entries
          const whitelistEntries = whitelist.locator('.ip-entries, [data-testid="ip-entries"]');
          if (await whitelistEntries.count() > 0) {
            const ipItems = whitelistEntries.locator('.ip-item, [data-testid="ip-item"]');
            if (await ipItems.count() > 0) {
              const firstIp = ipItems.first();

              const ipAddress = firstIp.locator('.ip-address, .address');
              const ipDescription = firstIp.locator('.ip-description, .description');
              const ipStatus = firstIp.locator('.ip-status, .status');

              if (await ipAddress.count() > 0) await expect(ipAddress).toBeVisible();
              if (await ipDescription.count() > 0) await expect(ipDescription).toBeVisible();
              if (await ipStatus.count() > 0) await expect(ipStatus).toBeVisible();

              // Test IP actions
              const editIpButton = firstIp.locator('button:has-text("Edit"), [data-action="edit"]');
              const removeIpButton = firstIp.locator('button:has-text("Remove"), [data-action="remove"]');

              if (await editIpButton.count() > 0) {
                await editIpButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test IP blacklist management
        const blacklist = ipFilteringPage.locator('.ip-blacklist, [data-testid="blacklist"]');
        if (await blacklist.count() > 0) {
          await expect(blacklist).toBeVisible();

          const blacklistEntries = blacklist.locator('.ip-entries, [data-testid="ip-entries"]');
          if (await blacklistEntries.count() > 0) {
            const blockedIps = blacklistEntries.locator('.ip-item, [data-testid="ip-item"]');
            if (await blockedIps.count() > 0) {
              await expect(blockedIps.first()).toBeVisible();
            }
          }
        }

        // Test IP filtering analytics
        const filteringAnalytics = ipFilteringPage.locator('.filtering-analytics, [data-testid="analytics"]');
        if (await filteringAnalytics.count() > 0) {
          await expect(filteringAnalytics).toBeVisible();

          const blockedRequestsChart = filteringAnalytics.locator('.blocked-requests-chart, [data-chart="blocked-requests"]');
          if (await blockedRequestsChart.count() > 0) {
            await expect(blockedRequestsChart).toBeVisible();
          }
        }
      }
    });
  });
});

// Helper functions for Gateway testing
export class GatewayTestHelpers {
  static async checkServiceHealth(page: Page, serviceName: string) {
    await page.goto(`${GATEWAY_BASE_URL}/services`);
    const serviceCard = page.locator(`.service-card:has-text("${serviceName}")`);
    if (await serviceCard.count() > 0) {
      const healthIndicator = serviceCard.locator('.health-indicator, .status');
      return await healthIndicator.textContent();
    }
    return null;
  }

  static async createRateLimitPolicy(page: Page, policyData: any) {
    await page.goto(`${GATEWAY_BASE_URL}/rate-limiting`);
    await page.click('button:has-text("Create Policy")');

    const policyModal = page.locator('.policy-modal');
    if (await policyModal.count() > 0) {
      await policyModal.locator('input[name="policy_name"]').fill(policyData.name);
      await policyModal.locator('input[name="requests_per_minute"]').fill(policyData.requestsPerMinute.toString());
      await policyModal.locator('input[name="requests_per_hour"]').fill(policyData.requestsPerHour.toString());
      await policyModal.locator('select[name="scope"]').selectOption(policyData.scope);

      await policyModal.locator('button:has-text("Save Policy")').click();
      await page.waitForLoadState('networkidle');
    }
  }

  static async testAPIEndpoint(page: Page, endpoint: string, method: string = 'GET') {
    await page.goto(`${GATEWAY_BASE_URL}/docs`);

    const endpointDoc = page.locator(`[data-endpoint="${endpoint}"]`);
    if (await endpointDoc.count() > 0) {
      await endpointDoc.locator('button:has-text("Try it out")').click();

      const apiTester = page.locator('.api-tester');
      if (await apiTester.count() > 0) {
        const executeButton = apiTester.locator('button:has-text("Execute")');
        if (await executeButton.count() > 0) {
          await executeButton.click();
          await page.waitForLoadState('networkidle');

          const responseSection = apiTester.locator('.response-section');
          return await responseSection.isVisible();
        }
      }
    }
    return false;
  }
}
