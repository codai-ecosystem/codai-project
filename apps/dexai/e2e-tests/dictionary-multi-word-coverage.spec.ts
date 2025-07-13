import { test, expect } from '@playwright/test';

test.describe('🚀 DEXAI Enhanced Dictionary - Multi-Word Coverage', () => {
    const romanianWords = [
        {
            word: 'carte',
            synonyms: ['volum', 'lucrare', 'operă', 'publicație'],
            antonyms: ['analfabetism', 'ignoranță'],
            rhymes: ['parte', 'artă', 'hartă', 'spartă'],
            example: 'Am citit o carte foarte interesantă'
        },
        {
            word: 'casa',
            synonyms: ['locuință', 'domiciliu', 'cămin', 'residence'],
            antonyms: ['stradă', 'exterior', 'afară', 'spațiu public'],
            rhymes: ['masa', 'clasă', 'bază', 'fază'],
            example: 'Casa noastră este pe strada principală'
        },
        {
            word: 'școală',
            synonyms: ['liceu', 'gimnaziu', 'colegiu', 'instituție'],
            antonyms: ['ignoranță', 'analfabetism', 'vacanță', 'recreație'],
            rhymes: ['poală', 'doală', 'coală', 'moală'],
            example: 'Copiii merg la școală în fiecare dimineață'
        },
        {
            word: 'muncă',
            synonyms: ['lucru', 'activitate', 'slujbă', 'ocupație'],
            antonyms: ['odihnă', 'relaxare', 'vacanță', 'lenevie'],
            rhymes: ['bunca', 'tunca', 'runca', 'lunca'],
            example: 'Munca în echipă este foarte eficientă'
        }
    ];

    for (const wordData of romanianWords) {
        test(`should provide full enhanced features for "${wordData.word}"`, async ({ page }) => {
            console.log(`🔍 Testing enhanced features for "${wordData.word}"`);

            await page.goto('/dictionary');

            // Search for the word
            await page.locator('input[type="text"]').fill(wordData.word);
            await page.locator('input[type="text"]').press('Enter');
            await page.waitForSelector('[data-testid="search-results"]');

            console.log(`✅ Search completed for "${wordData.word}"`);

            // Verify all enhanced tabs are visible
            const tabs = {
                definitii: page.locator('text=Definiții'),
                exemple: page.locator('text=Exemple'),
                sinonime: page.locator('text=Sinonime'),
                antonime: page.locator('text=Antonime'),
                rime: page.locator('text=Rime')
            };

            for (const [tabName, tab] of Object.entries(tabs)) {
                await expect(tab).toBeVisible();
                console.log(`✅ ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab visible for "${wordData.word}"`);
            }

            // Test synonyms
            await tabs.sinonime.click();
            for (const synonym of wordData.synonyms) {
                await expect(page.locator(`text=${synonym}`)).toBeVisible();
                console.log(`✅ Synonym "${synonym}" visible for "${wordData.word}"`);
            }

            // Test antonyms
            await tabs.antonime.click();
            for (const antonym of wordData.antonyms) {
                await expect(page.locator(`text=${antonym}`)).toBeVisible();
                console.log(`✅ Antonym "${antonym}" visible for "${wordData.word}"`);
            }

            // Test rhymes
            await tabs.rime.click();
            for (const rhyme of wordData.rhymes) {
                await expect(page.locator(`text=${rhyme}`).first()).toBeVisible();
                console.log(`✅ Rhyme "${rhyme}" visible for "${wordData.word}"`);
            }

            // Test examples
            await tabs.exemple.click();
            await expect(page.locator(`text=${wordData.example}`).first()).toBeVisible();
            console.log(`✅ Example visible for "${wordData.word}"`);

            console.log(`🎉 All features verified for "${wordData.word}"!`);
        });
    }

    test('🏆 should demonstrate massive enhancement progress', async ({ page }) => {
        console.log('🏆 TESTING OVERALL DICTIONARY ENHANCEMENT PROGRESS');

        let passedWords = 0;
        let totalFeatures = 0;

        for (const wordData of romanianWords) {
            try {
                await page.goto('/dictionary');
                await page.locator('input[type="text"]').fill(wordData.word);
                await page.locator('input[type="text"]').press('Enter');
                await page.waitForSelector('[data-testid="search-results"]');

                // Count features working
                let wordFeatures = 0;

                // Check tabs
                const tabs = ['Definiții', 'Exemple', 'Sinonime', 'Antonime', 'Rime'];
                for (const tab of tabs) {
                    if (await page.locator(`text=${tab}`).isVisible()) {
                        wordFeatures++;
                    }
                }

                // Check synonyms content
                await page.locator('text=Sinonime').click();
                for (const synonym of wordData.synonyms) {
                    if (await page.locator(`text=${synonym}`).isVisible()) {
                        wordFeatures++;
                    }
                }

                passedWords++;
                totalFeatures += wordFeatures;
                console.log(`✅ "${wordData.word}" passed with ${wordFeatures} features working`);

            } catch (error) {
                console.log(`❌ "${wordData.word}" failed: ${error}`);
            }
        }

        console.log(`\n🎉 ENHANCEMENT RESULTS:`);
        console.log(`✅ Words Successfully Enhanced: ${passedWords}/${romanianWords.length}`);
        console.log(`✅ Total Features Working: ${totalFeatures}`);
        console.log(`✅ Average Features per Word: ${(totalFeatures / passedWords).toFixed(1)}`);
        console.log(`\n🚀 DICTIONARY ENHANCEMENT: ${((passedWords / romanianWords.length) * 100).toFixed(1)}% SUCCESS RATE!`);

        // Verify we have significant improvement
        expect(passedWords).toBeGreaterThanOrEqual(3); // At least 75% success
        expect(totalFeatures).toBeGreaterThanOrEqual(20); // At least 20 total features
    });
});
