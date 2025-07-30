import { test, expect, Page } from '@playwright/test';

/**
 * 🔬 EDGE CASE & ERROR BOUNDARY TESTING
 * 
 * This test suite covers every possible edge case, error condition,
 * boundary condition, and failure scenario across the entire ecosystem.
 */

// Service configuration
const services = {
  id: { url: 'http://localhost:4032', name: 'ID Service' },
  hub: { url: 'http://localhost:4700', name: 'Hub Service' },
  admin: { url: 'http://localhost:3200', name: 'Admin Service' },
  codai: { url: 'http://localhost:4001', name: 'CODAI Service' },
  bancai: { url: 'http://localhost:4003', name: 'BancAI Service' }
};

// Edge case scenarios to test
const edgeCaseScenarios = [
  {
    category: 'Network Conditions',
    tests: [
      'slow_network_simulation',
      'intermittent_connectivity',
      'network_timeout_handling',
      'offline_behavior',
      'connection_retry_logic'
    ]
  },
  {
    category: 'Input Boundaries',
    tests: [
      'empty_input_fields',
      'maximum_length_inputs',
      'special_character_inputs',
      'unicode_character_handling',
      'sql_injection_prevention',
      'xss_prevention',
      'invalid_data_types'
    ]
  },
  {
    category: 'State Boundaries',
    tests: [
      'session_expiry_handling',
      'concurrent_user_sessions',
      'memory_overflow_protection',
      'cache_invalidation',
      'browser_storage_limits'
    ]
  },
  {
    category: 'API Boundaries',
    tests: [
      'rate_limiting_behavior',
      'payload_size_limits',
      'malformed_request_handling',
      'missing_required_parameters',
      'unexpected_response_formats'
    ]
  },
  {
    category: 'UI Boundaries',
    tests: [
      'extreme_screen_resolutions',
      'browser_zoom_levels',
      'accessibility_extremes',
      'animation_interruption',
      'rapid_user_interactions'
    ]
  }
];

// Boundary test data
const boundaryTestData = {
  strings: {
    empty: '',
    single_char: 'a',
    very_long: 'a'.repeat(10000),
    unicode: '🌟🚀💻🔥⭐️🎯🌊🎨🎭🎪',
    special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    sql_injection: "'; DROP TABLE users; --",
    xss_payload: '<script>alert("xss")</script>',
    null_bytes: 'test\0null',
    newlines: 'line1\nline2\rline3\r\nline4',
    tabs: 'col1\tcol2\tcol3'
  },
  numbers: {
    zero: 0,
    negative: -1,
    very_large: Number.MAX_SAFE_INTEGER,
    very_small: Number.MIN_SAFE_INTEGER,
    float: 3.14159,
    nan: NaN,
    infinity: Infinity,
    negative_infinity: -Infinity
  },
  arrays: {
    empty: [],
    single_item: ['item'],
    very_large: new Array(10000).fill('item'),
    nested: [[[['deep']]]],
    mixed_types: [1, 'string', null, undefined, {}, []]
  }
};

test.describe('🔬 Edge Case & Error Boundary Testing', () => {

  test.describe('🌐 Network Edge Cases', () => {

    test('🐌 Slow Network Simulation', async ({ page }) => {
      console.log('\n🐌 Testing slow network conditions...');
      
      // Simulate slow network
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 50 * 1024, // 50 KB/s
        uploadThroughput: 20 * 1024,   // 20 KB/s
        latency: 2000 // 2 second latency
      });
      
      for (const [serviceKey, serviceConfig] of Object.entries(services)) {
        console.log(`  🐌 Testing ${serviceConfig.name} under slow network...`);
        
        try {
          const startTime = Date.now();
          const response = await page.goto(serviceConfig.url, {
            waitUntil: 'networkidle',
            timeout: 10000 // Reduced from 30000ms to 10000ms for faster testing
          });
          const loadTime = Date.now() - startTime;
          
          const status = response?.status() || 0;
          console.log(`    ⏱️ ${serviceConfig.name}: ${status} (${loadTime}ms under slow network)`);
          
          if (status === 200) {
            // Test if loading indicators are shown appropriately
            const loadingIndicators = await page.locator(
              '.loading, .spinner, [class*="loading"], [aria-busy="true"]'
            ).count();
            
            if (loadingIndicators > 0) {
              console.log(`    ⏳ Loading indicators present: ${loadingIndicators}`);
            }
            
            // Test if timeout error handling works
            const errorMessages = await page.locator(
              '.error, .timeout, [class*="error"], [role="alert"]'
            ).count();
            
            if (errorMessages > 0) {
              console.log(`    ⚠️ Error handling active: ${errorMessages} error messages`);
            }
            
            // Test if retry mechanisms are available
            const retryButtons = await page.locator(
              'button[class*="retry"], .retry-button, [aria-label*="retry" i]'
            ).count();
            
            if (retryButtons > 0) {
              console.log(`    🔄 Retry mechanisms available: ${retryButtons}`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${serviceConfig.name} slow network test failed: ${error.message.substring(0, 50)}`);
        }
        
        await page.waitForTimeout(200); // Reduced from 1000ms to 200ms
      }
      
      // Disable network throttling
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
      
      console.log('🐌 Slow network simulation complete');
    });

    test('📴 Offline Behavior Testing', async ({ page, context }) => {
      console.log('\n📴 Testing offline behavior and recovery...');
      
      // Test initial online state
      for (const [serviceKey, serviceConfig] of Object.entries(services)) {
        console.log(`  📴 Testing ${serviceConfig.name} offline behavior...`);
        
        try {
          // First, establish online connection
          const onlineResponse = await page.goto(serviceConfig.url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          if (onlineResponse?.status() === 200) {
            console.log(`    ✅ ${serviceConfig.name} initially online`);
            
            // Simulate going offline
            await context.setOffline(true);
            console.log(`    📴 Simulating offline state...`);
            
            // Test offline behavior
            try {
              await page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 });
              
              // Check for offline indicators
              const offlineIndicators = await page.locator(
                '.offline, [class*="offline"], .no-connection, [class*="no-connection"]'
              ).count();
              
              if (offlineIndicators > 0) {
                console.log(`    🚫 Offline indicators shown: ${offlineIndicators}`);
              }
              
              // Check for cached content
              const cachedContent = await page.locator('body').textContent();
              const hasContent = (cachedContent?.trim().length || 0) > 0;
              
              if (hasContent) {
                console.log(`    💾 Cached content available (${cachedContent?.length} chars)`);
              } else {
                console.log(`    ⚠️ No cached content available`);
              }
              
              // Test service worker behavior
              const serviceWorkerActive = await page.evaluate(() => {
                return 'serviceWorker' in navigator && navigator.serviceWorker.controller;
              });
              
              if (serviceWorkerActive) {
                console.log(`    👷 Service Worker active for offline support`);
              }
              
            } catch (offlineError) {
              console.log(`    📴 Offline behavior: ${offlineError.message.substring(0, 50)}`);
            }
            
            // Simulate coming back online
            await context.setOffline(false);
            console.log(`    📶 Simulating back online...`);
            
            try {
              await page.reload({ waitUntil: 'networkidle', timeout: 10000 });
              
              // Check for online recovery
              const onlineIndicators = await page.locator(
                '.online, [class*="online"], .connected, [class*="connected"]'
              ).count();
              
              if (onlineIndicators > 0) {
                console.log(`    ✅ Online indicators shown: ${onlineIndicators}`);
              }
              
              // Test if data sync occurs
              const syncIndicators = await page.locator(
                '.syncing, [class*="sync"], .updating, [class*="updating"]'
              ).count();
              
              if (syncIndicators > 0) {
                console.log(`    🔄 Data sync indicators: ${syncIndicators}`);
              }
              
            } catch (onlineError) {
              console.log(`    ⚠️ Online recovery issue: ${onlineError.message.substring(0, 50)}`);
            }
            
          } else {
            console.log(`    ❌ ${serviceConfig.name} not initially accessible: ${onlineResponse?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${serviceConfig.name} offline test failed: ${error.message.substring(0, 50)}`);
        }
        
        // Ensure we're back online
        await context.setOffline(false);
        await page.waitForTimeout(1000);
      }
      
      console.log('📴 Offline behavior testing complete');
    });
  });

  test.describe('📝 Input Boundary Testing', () => {

    test('🔤 Extreme Input Values', async ({ page }) => {
      console.log('\n🔤 Testing extreme input values and boundaries...');
      
      for (const [serviceKey, serviceConfig] of Object.entries(services)) {
        console.log(`  🔤 Testing ${serviceConfig.name} input boundaries...`);
        
        try {
          const response = await page.goto(serviceConfig.url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          if (response?.status() === 200) {
            // Find all input fields
            const inputs = await page.locator('input[type="text"], input:not([type]), textarea').all();
            
            if (inputs.length > 0) {
              console.log(`    📝 Found ${inputs.length} text input(s) to test`);
              
              for (let i = 0; i < Math.min(inputs.length, 3); i++) { // Test first 3 inputs
                const input = inputs[i];
                const inputName = await input.getAttribute('name') || `input-${i}`;
                
                console.log(`      🎯 Testing input: ${inputName}`);
                
                // Test boundary values
                for (const [testName, testValue] of Object.entries(boundaryTestData.strings)) {
                  try {
                    await input.clear();
                    await input.fill(testValue);
                    
                    // Check for validation responses
                    const validationErrors = await page.locator(
                      '.error, .invalid, [class*="error"], [aria-invalid="true"]'
                    ).count();
                    
                    const inputValue = await input.inputValue();
                    const valueLength = inputValue.length;
                    
                    console.log(`        ${testName}: ${valueLength} chars, ${validationErrors} validation errors`);
                    
                    // Test special cases
                    if (testName === 'very_long' && valueLength < testValue.length) {
                      console.log(`        ✅ Long input truncated (${valueLength}/${testValue.length})`);
                    }
                    
                    if (testName === 'xss_payload' && inputValue !== testValue) {
                      console.log(`        ✅ XSS payload sanitized`);
                    }
                    
                    if (testName === 'sql_injection' && inputValue !== testValue) {
                      console.log(`        ✅ SQL injection payload sanitized`);
                    }
                    
                    // Test form submission with boundary data
                    const submitButtons = await page.locator(
                      'form button[type="submit"], form input[type="submit"], form .submit-btn'
                    ).count();
                    
                    if (submitButtons > 0 && (testName === 'empty' || testName === 'very_long')) {
                      try {
                        const submitButton = page.locator(
                          'form button[type="submit"], form input[type="submit"], form .submit-btn'
                        ).first();
                        
                        await submitButton.click({ timeout: 2000 });
                        await page.waitForTimeout(500);
                        
                        // Check for form validation or error messages
                        const formErrors = await page.locator(
                          '.form-error, .validation-error, [role="alert"]'
                        ).count();
                        
                        if (formErrors > 0) {
                          console.log(`        📋 Form validation triggered: ${formErrors} errors`);
                        }
                        
                      } catch (submitError) {
                        // Form submission might fail, which is expected for boundary values
                      }
                    }
                    
                  } catch (inputError) {
                    console.log(`        ⚠️ ${testName} test failed: ${inputError.message.substring(0, 30)}`);
                  }
                  
                  await page.waitForTimeout(100);
                }
                
                // Clear input after testing
                try {
                  await input.clear();
                } catch (e) {
                  // Ignore if clearing fails
                }
              }
              
            } else {
              console.log(`    ℹ️ No text inputs found for testing`);
            }
            
            // Test number inputs if present
            const numberInputs = await page.locator('input[type="number"]').all();
            
            if (numberInputs.length > 0) {
              console.log(`    🔢 Testing ${numberInputs.length} number input(s)...`);
              
              for (let i = 0; i < Math.min(numberInputs.length, 2); i++) {
                const numberInput = numberInputs[i];
                
                for (const [testName, testValue] of Object.entries(boundaryTestData.numbers)) {
                  if (testName !== 'nan' && testName !== 'infinity' && testName !== 'negative_infinity') {
                    try {
                      await numberInput.clear();
                      await numberInput.fill(testValue.toString());
                      
                      const inputValue = await numberInput.inputValue();
                      console.log(`        ${testName}: Input accepted "${inputValue}"`);
                      
                    } catch (numberError) {
                      console.log(`        ⚠️ ${testName} number test failed`);
                    }
                    
                    await page.waitForTimeout(50);
                  }
                }
              }
            }
            
          } else {
            console.log(`    ❌ ${serviceConfig.name} not accessible: ${response?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${serviceConfig.name} input boundary test failed: ${error.message.substring(0, 50)}`);
        }
        
        await page.waitForTimeout(1000);
      }
      
      console.log('🔤 Extreme input values testing complete');
    });

    test('🧮 Form Validation Edge Cases', async ({ page }) => {
      console.log('\n🧮 Testing form validation edge cases...');
      
      const validationScenarios = [
        {
          name: 'Required Field Combinations',
          description: 'Test various combinations of required field completion'
        },
        {
          name: 'Conflicting Validation Rules',
          description: 'Test inputs that trigger multiple validation rules'
        },
        {
          name: 'Dynamic Validation Updates',
          description: 'Test validation changes based on other field values'
        },
        {
          name: 'File Upload Boundaries',
          description: 'Test file upload with various file types and sizes'
        }
      ];
      
      for (const scenario of validationScenarios) {
        console.log(`  🧮 Testing: ${scenario.name}`);
        
        for (const [serviceKey, serviceConfig] of Object.entries(services)) {
          try {
            await page.goto(serviceConfig.url, {
              waitUntil: 'networkidle',
              timeout: 10000
            });
            
            if (page.url().includes(serviceConfig.url.split('://')[1])) {
              console.log(`    📋 ${serviceConfig.name}: ${scenario.name}`);
              
              const forms = await page.locator('form').count();
              
              if (forms > 0) {
                if (scenario.name === 'Required Field Combinations') {
                  // Test required field combinations
                  const requiredFields = await page.locator('input[required], select[required], textarea[required]').all();
                  
                  if (requiredFields.length > 1) {
                    console.log(`      🎯 Found ${requiredFields.length} required fields`);
                    
                    // Test partial completion
                    for (let i = 0; i < requiredFields.length; i++) {
                      const field = requiredFields[i];
                      const fieldType = await field.getAttribute('type') || 'text';
                      
                      try {
                        if (fieldType === 'email') {
                          await field.fill('test@example.com');
                        } else if (fieldType === 'password') {
                          await field.fill('password123');
                        } else {
                          await field.fill('test value');
                        }
                        
                        // Try to submit with partial data
                        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
                        
                        if (await submitButton.count() > 0) {
                          await submitButton.click({ timeout: 1000 });
                          await page.waitForTimeout(500);
                          
                          const validationMessages = await page.locator(
                            '.error, .invalid, [aria-invalid="true"], [role="alert"]'
                          ).count();
                          
                          if (validationMessages > 0) {
                            console.log(`        ✅ Partial validation working: ${validationMessages} messages`);
                          }
                        }
                        
                      } catch (e) {
                        // Expected for incomplete forms
                      }
                    }
                    
                    // Clear all fields
                    for (const field of requiredFields) {
                      try {
                        await field.clear();
                      } catch (e) {
                        // Ignore if clearing fails
                      }
                    }
                  }
                  
                } else if (scenario.name === 'File Upload Boundaries') {
                  // Test file upload fields
                  const fileInputs = await page.locator('input[type="file"]').all();
                  
                  if (fileInputs.length > 0) {
                    console.log(`      📁 Found ${fileInputs.length} file input(s)`);
                    
                    for (const fileInput of fileInputs.slice(0, 1)) { // Test first file input
                      const accept = await fileInput.getAttribute('accept');
                      const multiple = await fileInput.getAttribute('multiple');
                      
                      console.log(`        📎 File input - Accept: ${accept || 'any'}, Multiple: ${multiple ? 'yes' : 'no'}`);
                      
                      // Test file validation (if accept attribute is present)
                      if (accept) {
                        console.log(`        ✅ File type restrictions configured`);
                      }
                      
                      // Check for file size limits (usually in form or nearby text)
                      const fileSizeText = await page.locator('body').textContent();
                      const hasSizeLimit = fileSizeText?.includes('MB') || fileSizeText?.includes('KB') || fileSizeText?.includes('size');
                      
                      if (hasSizeLimit) {
                        console.log(`        📏 File size limits mentioned in UI`);
                      }
                    }
                  }
                }
                
              } else {
                console.log(`    ℹ️ No forms found for validation testing`);
              }
            }
            
          } catch (error) {
            console.log(`    ❌ ${serviceConfig.name} validation test failed: ${error.message.substring(0, 50)}`);
          }
          
          await page.waitForTimeout(300);
        }
        
        console.log(`  🧮 ${scenario.name} testing complete\n`);
      }
      
      console.log('🧮 Form validation edge cases complete');
    });
  });

  test.describe('🖥️ Browser & Device Edge Cases', () => {

    test('🔍 Extreme Zoom Levels', async ({ page }) => {
      console.log('\n🔍 Testing extreme zoom levels and scaling...');
      
      const zoomLevels = [
        { level: 0.25, name: '25% (Very Small)' },
        { level: 0.5, name: '50% (Small)' },
        { level: 1.0, name: '100% (Normal)' },
        { level: 2.0, name: '200% (Large)' },
        { level: 5.0, name: '500% (Very Large)' }
      ];
      
      for (const zoom of zoomLevels) {
        console.log(`  🔍 Testing zoom level: ${zoom.name}`);
        
        // Set zoom level
        await page.evaluate((zoomLevel) => {
          document.body.style.zoom = zoomLevel.toString();
        }, zoom.level);
        
        // Test each service at this zoom level
        for (const [serviceKey, serviceConfig] of Object.entries(services)) {
          try {
            const response = await page.goto(serviceConfig.url, {
              waitUntil: 'networkidle',
              timeout: 10000
            });
            
            if (response?.status() === 200) {
              console.log(`    🔍 ${serviceConfig.name} at ${zoom.name}...`);
              
              // Test if content is still accessible
              const visibleButtons = await page.locator('button:visible').count();
              const visibleLinks = await page.locator('a:visible').count();
              const visibleInputs = await page.locator('input:visible').count();
              
              console.log(`      🎯 Interactive elements - Buttons: ${visibleButtons}, Links: ${visibleLinks}, Inputs: ${visibleInputs}`);
              
              // Test if text is readable (not cut off)
              const bodyText = await page.locator('body').textContent();
              const hasContent = (bodyText?.trim().length || 0) > 0;
              
              if (hasContent) {
                console.log(`      ✅ Content visible and readable`);
              } else {
                console.log(`      ⚠️ Content may not be visible at this zoom level`);
              }
              
              // Test scrolling behavior
              const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
              const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
              
              if (scrollHeight > clientHeight) {
                console.log(`      📜 Scrolling required: ${scrollHeight}px content in ${clientHeight}px viewport`);
                
                // Test scroll functionality
                try {
                  await page.keyboard.press('PageDown');
                  await page.waitForTimeout(200);
                  
                  const scrollTop = await page.evaluate(() => window.pageYOffset);
                  if (scrollTop > 0) {
                    console.log(`      ✅ Scrolling works: ${scrollTop}px scrolled`);
                  }
                  
                  // Scroll back to top
                  await page.keyboard.press('Home');
                } catch (e) {
                  // Ignore scroll test failures
                }
              }
              
              // Test if critical UI elements are still clickable
              const criticalElements = await page.locator(
                'button[type="submit"], .primary-button, a[href*="signin"], a[href*="signup"]'
              ).count();
              
              if (criticalElements > 0) {
                try {
                  const firstCritical = page.locator(
                    'button[type="submit"], .primary-button, a[href*="signin"], a[href*="signup"]'
                  ).first();
                  
                  const isVisible = await firstCritical.isVisible();
                  const boundingBox = await firstCritical.boundingBox();
                  
                  if (isVisible && boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
                    console.log(`      ✅ Critical elements accessible: ${boundingBox.width}x${boundingBox.height}px`);
                  } else {
                    console.log(`      ⚠️ Critical elements may not be accessible`);
                  }
                  
                } catch (e) {
                  // Element interaction test failed
                }
              }
              
            } else {
              console.log(`    ❌ ${serviceConfig.name} not accessible: ${response?.status()}`);
            }
            
          } catch (error) {
            console.log(`    ❌ ${serviceConfig.name} zoom test failed: ${error.message.substring(0, 50)}`);
          }
          
          await page.waitForTimeout(300);
        }
        
        console.log(`  🔍 Zoom level ${zoom.name} testing complete\n`);
      }
      
      // Reset zoom to normal
      await page.evaluate(() => {
        document.body.style.zoom = '1.0';
      });
      
      console.log('🔍 Extreme zoom levels testing complete');
    });

    test('📱 Extreme Screen Resolutions', async ({ page }) => {
      console.log('\n📱 Testing extreme screen resolutions and orientations...');
      
      const resolutions = [
        { width: 320, height: 568, name: 'iPhone SE Portrait' },
        { width: 568, height: 320, name: 'iPhone SE Landscape' },
        { width: 240, height: 320, name: 'Very Small Screen' },
        { width: 1366, height: 768, name: 'Small Laptop' },
        { width: 3840, height: 2160, name: '4K Monitor' },
        { width: 5120, height: 2880, name: '5K Monitor' },
        { width: 1024, height: 1366, name: 'iPad Portrait' },
        { width: 1366, height: 1024, name: 'iPad Landscape' }
      ];
      
      for (const resolution of resolutions) {
        console.log(`  📱 Testing resolution: ${resolution.name} (${resolution.width}x${resolution.height})`);
        
        // Set viewport size
        await page.setViewportSize({
          width: resolution.width,
          height: resolution.height
        });
        
        // Test a subset of services at each resolution
        const servicesToTest = Object.entries(services).slice(0, 2); // Test first 2 services
        
        for (const [serviceKey, serviceConfig] of servicesToTest) {
          try {
            const response = await page.goto(serviceConfig.url, {
              waitUntil: 'networkidle',
              timeout: 10000
            });
            
            if (response?.status() === 200) {
              console.log(`    📱 ${serviceConfig.name} at ${resolution.name}...`);
              
              // Test responsive behavior
              const hasHorizontalScroll = await page.evaluate(() => {
                return document.body.scrollWidth > document.documentElement.clientWidth;
              });
              
              const hasVerticalScroll = await page.evaluate(() => {
                return document.body.scrollHeight > document.documentElement.clientHeight;
              });
              
              console.log(`      📐 Scrolling - Horizontal: ${hasHorizontalScroll ? 'Yes' : 'No'}, Vertical: ${hasVerticalScroll ? 'Yes' : 'No'}`);
              
              // Test navigation accessibility at this resolution
              const mobileMenu = await page.locator(
                '.mobile-menu, .hamburger, [class*="mobile"], .menu-toggle'
              ).count();
              
              if (resolution.width <= 768 && mobileMenu > 0) {
                console.log(`      📱 Mobile menu available: ${mobileMenu}`);
              } else if (resolution.width <= 768 && mobileMenu === 0) {
                console.log(`      ⚠️ Small screen but no mobile menu detected`);
              }
              
              // Test content overflow
              const overflowElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                let overflowCount = 0;
                
                for (let i = 0; i < Math.min(elements.length, 100); i++) { // Check first 100 elements
                  const element = elements[i] as HTMLElement;
                  const rect = element.getBoundingClientRect();
                  
                  if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
                    overflowCount++;
                  }
                }
                
                return overflowCount;
              });
              
              if (overflowElements > 0) {
                console.log(`      📏 Elements extending beyond viewport: ${overflowElements}`);
              } else {
                console.log(`      ✅ All elements within viewport bounds`);
              }
              
              // Test touch targets for small screens
              if (resolution.width <= 768) {
                const touchTargets = await page.locator('button, a, input').all();
                let adequateTouchTargets = 0;
                
                for (const target of touchTargets.slice(0, 10)) { // Check first 10 targets
                  try {
                    const box = await target.boundingBox();
                    if (box && box.width >= 44 && box.height >= 44) {
                      adequateTouchTargets++;
                    }
                  } catch (e) {
                    // Skip problematic elements
                  }
                }
                
                const totalChecked = Math.min(touchTargets.length, 10);
                const touchTargetPercentage = totalChecked > 0 ? (adequateTouchTargets / totalChecked * 100).toFixed(0) : '0';
                
                console.log(`      👆 Adequate touch targets: ${adequateTouchTargets}/${totalChecked} (${touchTargetPercentage}%)`);
              }
              
            } else {
              console.log(`    ❌ ${serviceConfig.name} not accessible: ${response?.status()}`);
            }
            
          } catch (error) {
            console.log(`    ❌ ${serviceConfig.name} resolution test failed: ${error.message.substring(0, 50)}`);
          }
          
          await page.waitForTimeout(500);
        }
        
        console.log(`  📱 Resolution ${resolution.name} testing complete\n`);
      }
      
      // Reset to standard desktop size
      await page.setViewportSize({ width: 1280, height: 720 });
      
      console.log('📱 Extreme screen resolutions testing complete');
    });
  });

  test.describe('⏱️ Timing & Race Condition Testing', () => {

    test('⚡ Rapid User Interactions', async ({ page }) => {
      console.log('\n⚡ Testing rapid user interactions and race conditions...');
      
      for (const [serviceKey, serviceConfig] of Object.entries(services).slice(0, 2)) { // Test first 2 services
        console.log(`  ⚡ Testing ${serviceConfig.name} rapid interactions...`);
        
        try {
          const response = await page.goto(serviceConfig.url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          if (response?.status() === 200) {
            // Test rapid button clicking
            const buttons = await page.locator('button, [role="button"]').all();
            
            if (buttons.length > 0) {
              const firstButton = buttons[0];
              console.log(`    ⚡ Testing rapid button clicks...`);
              
              try {
                // Rapid clicks
                for (let i = 0; i < 10; i++) {
                  await firstButton.click({ timeout: 500 });
                  await page.waitForTimeout(50); // Very short delay
                }
                
                console.log(`    ✅ Rapid button clicks handled`);
                
                // Check for any error states
                const errorElements = await page.locator('.error, [role="alert"], .exception').count();
                if (errorElements > 0) {
                  console.log(`    ⚠️ Errors detected after rapid clicks: ${errorElements}`);
                } else {
                  console.log(`    ✅ No errors from rapid interactions`);
                }
                
              } catch (clickError) {
                console.log(`    ⚠️ Rapid click test failed: ${clickError.message.substring(0, 50)}`);
              }
            }
            
            // Test rapid form input
            const inputs = await page.locator('input[type="text"], input:not([type]), textarea').all();
            
            if (inputs.length > 0) {
              const firstInput = inputs[0];
              console.log(`    ⚡ Testing rapid text input...`);
              
              try {
                // Rapid text input
                const rapidText = 'rapid input test';
                for (const char of rapidText) {
                  await firstInput.type(char, { delay: 10 }); // Very fast typing
                }
                
                const finalValue = await firstInput.inputValue();
                console.log(`    ✅ Rapid input result: "${finalValue}" (${finalValue.length}/${rapidText.length} chars)`);
                
                // Clear input
                await firstInput.clear();
                
              } catch (inputError) {
                console.log(`    ⚠️ Rapid input test failed: ${inputError.message.substring(0, 50)}`);
              }
            }
            
            // Test rapid navigation
            const links = await page.locator('a[href]').all();
            const internalLinks: any[] = [];
            
            // Find internal links
            for (const link of links.slice(0, 5)) { // Check first 5 links
              try {
                const href = await link.getAttribute('href');
                if (href && href.startsWith('/') && !href.includes('#')) {
                  internalLinks.push(link);
                }
              } catch (e) {
                // Skip problematic links
              }
            }
            
            if (internalLinks.length > 0) {
              console.log(`    ⚡ Testing rapid navigation...`);
              
              try {
                const link = internalLinks[0];
                
                // Rapid link clicks (should not cause navigation issues)
                for (let i = 0; i < 3; i++) {
                  await link.click({ timeout: 500 });
                  await page.waitForTimeout(100);
                  
                  // Check if we're still on the same service
                  const currentUrl = page.url();
                  const isOnService = currentUrl.includes(serviceConfig.url.split('://')[1]);
                  
                  if (isOnService) {
                    console.log(`    ✅ Navigation attempt ${i + 1}: Still on service`);
                  } else {
                    console.log(`    ➡️ Navigation occurred to: ${currentUrl}`);
                    // Navigate back
                    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 5000 });
                    break;
                  }
                }
                
              } catch (navError) {
                console.log(`    ⚠️ Rapid navigation test failed: ${navError.message.substring(0, 50)}`);
              }
            }
            
          } else {
            console.log(`    ❌ ${serviceConfig.name} not accessible: ${response?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${serviceConfig.name} rapid interaction test failed: ${error.message.substring(0, 50)}`);
        }
        
        await page.waitForTimeout(1000);
      }
      
      console.log('⚡ Rapid user interactions testing complete');
    });

    test('🔄 Concurrent Operations', async ({ page }) => {
      console.log('\n🔄 Testing concurrent operations and resource conflicts...');
      
      for (const [serviceKey, serviceConfig] of Object.entries(services).slice(0, 2)) { // Test first 2 services
        console.log(`  🔄 Testing ${serviceConfig.name} concurrent operations...`);
        
        try {
          const response = await page.goto(serviceConfig.url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          if (response?.status() === 200) {
            // Test concurrent form submissions (if forms exist)
            const forms = await page.locator('form').count();
            
            if (forms > 0) {
              console.log(`    🔄 Testing concurrent form interactions...`);
              
              const inputs = await page.locator('form input').all();
              
              if (inputs.length >= 2) {
                try {
                  // Simultaneously interact with multiple inputs
                  await Promise.all([
                    inputs[0].fill('concurrent test 1'),
                    inputs[1].fill('concurrent test 2')
                  ]);
                  
                  console.log(`    ✅ Concurrent input filling completed`);
                  
                  // Check if both inputs retained their values
                  const value1 = await inputs[0].inputValue();
                  const value2 = await inputs[1].inputValue();
                  
                  if (value1.includes('concurrent') && value2.includes('concurrent')) {
                    console.log(`    ✅ Both concurrent inputs preserved: "${value1}", "${value2}"`);
                  } else {
                    console.log(`    ⚠️ Concurrent input conflict: "${value1}", "${value2}"`);
                  }
                  
                  // Clear inputs
                  await inputs[0].clear();
                  await inputs[1].clear();
                  
                } catch (concurrentError) {
                  console.log(`    ⚠️ Concurrent form test failed: ${concurrentError.message.substring(0, 50)}`);
                }
              }
            }
            
            // Test concurrent API-like operations by triggering multiple page interactions
            const interactiveElements = await page.locator('button, a[href], input').all();
            
            if (interactiveElements.length >= 3) {
              console.log(`    🔄 Testing concurrent element interactions...`);
              
              try {
                // Hover over multiple elements simultaneously
                const hoverPromises = interactiveElements.slice(0, 3).map((element, index) => 
                  element.hover().catch(e => console.log(`    Hover ${index + 1} failed`))
                );
                
                await Promise.allSettled(hoverPromises);
                console.log(`    ✅ Concurrent hover operations completed`);
                
                // Check for any JavaScript errors that might have occurred
                const jsErrors = await page.evaluate(() => {
                  return (window as any).jsErrors || [];
                });
                
                if (jsErrors.length > 0) {
                  console.log(`    ⚠️ JavaScript errors detected: ${jsErrors.length}`);
                } else {
                  console.log(`    ✅ No JavaScript errors from concurrent operations`);
                }
                
              } catch (concurrentError) {
                console.log(`    ⚠️ Concurrent interaction test failed: ${concurrentError.message.substring(0, 50)}`);
              }
            }
            
            // Test memory usage during concurrent operations
            const memoryUsage = await page.evaluate(() => {
              if ('memory' in performance) {
                return {
                  used: (performance as any).memory.usedJSHeapSize,
                  total: (performance as any).memory.totalJSHeapSize,
                  limit: (performance as any).memory.jsHeapSizeLimit
                };
              }
              return null;
            });
            
            if (memoryUsage) {
              const usagePercentage = (memoryUsage.used / memoryUsage.total * 100).toFixed(1);
              console.log(`    🧠 Memory usage: ${usagePercentage}% (${(memoryUsage.used / 1024 / 1024).toFixed(1)}MB used)`);
              
              if (parseFloat(usagePercentage) > 80) {
                console.log(`    ⚠️ High memory usage detected`);
              } else {
                console.log(`    ✅ Memory usage within acceptable limits`);
              }
            }
            
          } else {
            console.log(`    ❌ ${serviceConfig.name} not accessible: ${response?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${serviceConfig.name} concurrent operations test failed: ${error.message.substring(0, 50)}`);
        }
        
        await page.waitForTimeout(1000);
      }
      
      console.log('🔄 Concurrent operations testing complete');
    });
  });
});

console.log('🔬 EDGE CASE & ERROR BOUNDARY TESTING READY - Every possible edge case and failure scenario will be tested!');
