import { test, expect } from '@playwright/test';

test('Debug BancAI responsive classes', async ({ page }) => {
  await page.goto('http://localhost:4005');

  // Check page content immediately
  const pageContent = await page.content();
  console.log('Page contains "BANCAI":', pageContent.includes('BANCAI'));
  console.log('Page contains loading spinner:', pageContent.includes('animate-spin'));
  console.log('Page contains responsive classes:', pageContent.includes('sm:'));

  // Wait for any initial loads
  await page.waitForLoadState('networkidle');

  // Try to wait for the main content without timeout
  try {
    await page.waitForSelector('div[class*="min-h-screen"]', { timeout: 5000 });
    console.log('Found main content div');
  } catch (e) {
    console.log('Main content div not found, continuing...');
  }

  // Get all classes from HTML content directly
  const htmlContent = await page.content();
  const classMatches = htmlContent.match(/class="([^"]*)"/g) || [];
  const allClasses = new Set();

  classMatches.forEach(match => {
    const classStr = match.replace(/class="([^"]*)"/, '$1');
    classStr.split(' ').forEach(cls => {
      if (cls.trim()) allClasses.add(cls.trim());
    });
  });

  console.log('Classes from HTML:', Array.from(allClasses).sort());

  // Filter responsive classes
  const responsiveClasses = Array.from(allClasses).filter((cls) =>
    typeof cls === 'string' && (cls.includes('sm:') || cls.includes('md:') || cls.includes('lg:') || cls.includes('xl:'))
  );

  console.log('Responsive classes found:', responsiveClasses);

  // Take a screenshot regardless
  await page.screenshot({ path: 'debug-bancai-responsive.png', fullPage: true });
});
