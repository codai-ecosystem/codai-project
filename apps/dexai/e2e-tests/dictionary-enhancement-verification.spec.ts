import { test, expect } from '@playwright/test';

test.describe('DEXAI Dictionary Enhancement Verification', () => {
    test('should verify all enhanced dictionary features work correctly', async ({ page }) => {
        console.log('🔍 Testing ENHANCED dictionary functionality');

        await page.goto('/dictionary');

        // Test basic search functionality
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('input[type="text"]').press('Enter');
        await page.waitForSelector('[data-testid="search-results"]');

        console.log('✅ Basic search working');

        // Verify enhanced tab structure
        const tabs = {
            definitii: page.locator('text=Definiții'),
            exemple: page.locator('text=Exemple'),
            sinonime: page.locator('text=Sinonime'),
            antonime: page.locator('text=Antonime'),
            rime: page.locator('text=Rime')
        };

        // Verify all enhanced tabs are visible
        for (const [name, tab] of Object.entries(tabs)) {
            await expect(tab).toBeVisible();
            console.log(`✅ ${name.charAt(0).toUpperCase() + name.slice(1)} tab visible`);
        }

        // Test enhanced synonyms functionality
        await tabs.sinonime.click();
        const synonyms = ['volum', 'lucrare', 'operă', 'publicație'];
        for (const synonym of synonyms) {
            await expect(page.locator(`text=${synonym}`)).toBeVisible();
            console.log(`✅ Synonym "${synonym}" visible`);
        }

        // Test enhanced antonyms functionality
        await tabs.antonime.click();
        const antonyms = ['analfabetism', 'ignoranță'];
        for (const antonym of antonyms) {
            await expect(page.locator(`text=${antonym}`)).toBeVisible();
            console.log(`✅ Antonym "${antonym}" visible`);
        }

        // Test enhanced rhymes functionality
        await tabs.rime.click();
        const rhymes = ['parte', 'artă', 'hartă', 'spartă'];
        for (const rhyme of rhymes) {
            if (rhyme === 'artă') {
                await expect(page.locator(`text=${rhyme}`).first()).toBeVisible();
            } else {
                await expect(page.locator(`text=${rhyme}`)).toBeVisible();
            }
            console.log(`✅ Rhyme "${rhyme}" visible`);
        }

        // Test enhanced examples functionality
        await tabs.exemple.click();
        const examples = [
            'Am citit o carte foarte interesantă',
            'I read a very interesting book',
            'Cartea aceasta conține informații valoroase',
            'This book contains valuable information'
        ];
        for (const example of examples) {
            await expect(page.locator(`text=${example}`)).toBeVisible();
            console.log(`✅ Example "${example.substring(0, 30)}..." visible`);
        }

        // Test enhanced definitions functionality  
        await tabs.definitii.click();
        await expect(page.locator('text=Lucrare tipărită și legată, formată din mai multe file')).toBeVisible();
        console.log('✅ Enhanced definition visible');

        console.log('🎉 ALL DICTIONARY ENHANCEMENTS VERIFIED SUCCESSFULLY!');
    });

    test('should verify API returns enhanced data structure', async ({ page }) => {
        console.log('🔍 Testing enhanced API data structure');

        await page.goto('/dictionary');

        // Capture network requests
        const responses = [];
        page.on('response', response => {
            if (response.url().includes('/api/dictionary/search')) {
                responses.push(response);
            }
        });

        // Perform search
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('input[type="text"]').press('Enter');
        await page.waitForSelector('[data-testid="search-results"]');

        // Verify API response structure
        expect(responses.length).toBeGreaterThan(0);
        const response = responses[0];
        expect(response.status()).toBe(200);

        // Get response data
        const data = await response.json();
        console.log('📡 API Response received');

        // Verify enhanced data structure
        expect(data.results).toBeDefined();
        expect(data.results.length).toBeGreaterThan(0);

        const entry = data.results[0];
        expect(entry.word).toBe('carte');
        expect(entry.synonyms).toBeDefined();
        expect(entry.antonyms).toBeDefined();
        expect(entry.rhymes).toBeDefined();
        expect(entry.examples).toBeDefined();

        // Verify specific enhanced content
        expect(entry.synonyms).toContain('volum');
        expect(entry.synonyms).toContain('lucrare');
        expect(entry.antonyms).toContain('analfabetism');
        expect(entry.rhymes).toContain('parte');
        expect(entry.rhymes).toContain('artă');

        console.log('✅ Enhanced API data structure verified');
        console.log(`✅ Synonyms: ${entry.synonyms.length} items`);
        console.log(`✅ Antonyms: ${entry.antonyms.length} items`);
        console.log(`✅ Rhymes: ${entry.rhymes.length} items`);
        console.log(`✅ Examples: ${entry.examples.length} items`);
    });
});
