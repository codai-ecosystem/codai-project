import { test, expect } from '@playwright/test';

/**
 * Test only the currently working services with their actual ports
 */

const WORKING_SERVICES = {
  ADMIN: {
    name: 'Admin Service',
    port: 4002,
    baseUrl: 'http://localhost:4002',
    pages: ['/', '/dashboard', '/users', '/systems']
  },
  HUB: {
    name: 'Hub Service', 
    port: 4003,
    baseUrl: 'http://localhost:4003',
    pages: ['/', '/dashboard', '/projects', '/analytics']
  },
  ID: {
    name: 'ID Service',
    port: 4004,
    baseUrl: 'http://localhost:4004',
    pages: ['/', '/signin', '/signup', '/dashboard']
  }
};

test.describe('🎯 Working Services Test', () => {
  
  test('Hub Service - Basic functionality', async ({ page }) => {
    await page.goto(WORKING_SERVICES.HUB.baseUrl);
    
    // Check if page loads successfully
    await expect(page).toHaveTitle(/hub/i);
    
    // Check if basic elements are present
    const response = await page.request.get(WORKING_SERVICES.HUB.baseUrl);
    expect(response.status()).toBe(200);
  });

  test('Admin Service - Basic functionality', async ({ page }) => {
    await page.goto(WORKING_SERVICES.ADMIN.baseUrl);
    
    // Check if page loads successfully  
    const response = await page.request.get(WORKING_SERVICES.ADMIN.baseUrl);
    expect(response.status()).toBe(200);
  });

  test('ID Service - Basic functionality', async ({ page }) => {
    await page.goto(WORKING_SERVICES.ID.baseUrl);
    
    // Check if page loads successfully
    const response = await page.request.get(WORKING_SERVICES.ID.baseUrl);
    expect(response.status()).toBe(200);
  });

  test('Cross-service connectivity', async ({ page }) => {
    // Test that all working services are reachable
    for (const [key, service] of Object.entries(WORKING_SERVICES)) {
      const response = await page.request.get(service.baseUrl);
      expect(response.status()).toBe(200);
      console.log(`✅ ${service.name} (${service.port}): OK`);
    }
  });

});
