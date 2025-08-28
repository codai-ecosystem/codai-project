const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function debugDuckDuckGo() {
  console.log('🔍 Debugging DuckDuckGo Search...');
  
  const searchUrl = 'https://html.duckduckgo.com/html/?q=Microsoft+Azure+2024&kl=us-en&safe=moderate&t=hb&ia=web';
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        'Connection': 'keep-alive',
      },
      timeout: 10000
    });

    console.log('✅ Response Status:', response.status);
    
    const html = await response.text();
    console.log('📄 HTML Length:', html.length);
    
    if (html.includes('result')) {
      console.log('✅ Contains "result" - likely has search results');
    } else {
      console.log('❌ No "result" found - might be blocked or changed');
    }
    
    // Parse with Cheerio to check selectors
    const $ = cheerio.load(html);
    
    const resultSelectors = [
      '.result',
      '.results_links',
      '.web-result',
      '.result__body',
      '[data-testid="result"]'
    ];
    
    console.log('\n🔍 Testing selectors:');
    for (const selector of resultSelectors) {
      const elements = $(selector);
      console.log(`${selector}: ${elements.length} elements found`);
    }
    
    // Try to find any elements that might be results
    console.log('\n🔍 Looking for potential result patterns:');
    const potentialSelectors = [
      'div[class*="result"]',
      'div[id*="result"]',
      'a[href^="http"]'
    ];
    
    for (const selector of potentialSelectors) {
      const elements = $(selector);
      console.log(`${selector}: ${elements.length} elements found`);
      if (elements.length > 0 && elements.length < 50) {
        elements.each((i, el) => {
          if (i < 3) { // Show first 3
            const $el = $(el);
            console.log(`  [${i}] Class: ${$el.attr('class')} | Text: ${$el.text().substring(0, 100)}...`);
          }
        });
      }
    }
    
    // Check if there are any obvious search result indicators
    if (html.includes('No results found')) {
      console.log('❌ "No results found" message detected');
    }
    
    if (html.includes('Your search')) {
      console.log('✅ "Your search" text found - looks like search results page');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugDuckDuckGo();