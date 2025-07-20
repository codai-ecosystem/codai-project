const axios = require('axios');

class DirectVercelAutomation {
    constructor() {
        this.glassMcpUrl = 'http://localhost:8001';
        this.edgeWindowHandle = 2297444; // From previous detection
    }

    async sendGlassRequest(endpoint, data) {
        try {
            const response = await axios.post(`${this.glassMcpUrl}${endpoint}`, data);
            return response.data;
        } catch (error) {
            console.error(`Glass MCP request failed: ${error.message}`);
            return null;
        }
    }

    async focusEdgeWindow() {
        console.log('🎯 Focusing Edge browser window...');
        return await this.sendGlassRequest('/window/focus', {
            windowHandle: this.edgeWindowHandle
        });
    }

    async sendKeysToWindow(text, delay = 100) {
        console.log(`⌨️ Sending keys: ${text}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.sendGlassRequest('/window/sendText', {
            windowHandle: this.edgeWindowHandle,
            text: text
        });
    }

    async executeJavaScript(script) {
        console.log('🔧 Executing JavaScript in browser...');
        return await this.sendGlassRequest('/window/executeScript', {
            windowHandle: this.edgeWindowHandle,
            script: script
        });
    }

    async clickAddEnvironmentVariableButton() {
        console.log('🔍 Looking for Add Environment Variable button...');

        const script = `
      // Find and click the Add Environment Variable button
      function findAndClickAddButton() {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        
        // Look for buttons with text containing "Add" and environment-related terms
        const addButtons = buttons.filter(btn => {
          const text = (btn.textContent || btn.innerText || '').toLowerCase();
          return (text.includes('add') && (text.includes('environment') || text.includes('variable'))) ||
                 text.includes('new environment') ||
                 text === 'add' ||
                 btn.getAttribute('aria-label')?.toLowerCase().includes('add environment');
        });
        
        console.log('Found potential add buttons:', addButtons.length);
        addButtons.forEach((btn, i) => console.log(\`Button \${i}: \${btn.textContent || btn.innerText}\`));
        
        if (addButtons.length > 0) {
          addButtons[0].click();
          return { success: true, message: 'Clicked add button', buttonText: addButtons[0].textContent };
        }
        
        // Try alternative approach - look for plus icons or "+" buttons
        const plusButtons = buttons.filter(btn => {
          const text = (btn.textContent || btn.innerText || '').toLowerCase();
          return text.includes('+') || text.includes('plus') || 
                 btn.querySelector('svg[data-testid*="plus"]') ||
                 btn.className.includes('add') ||
                 btn.getAttribute('data-testid')?.includes('add');
        });
        
        if (plusButtons.length > 0) {
          plusButtons[0].click();
          return { success: true, message: 'Clicked plus button', buttonText: plusButtons[0].textContent };
        }
        
        return { success: false, message: 'No add button found' };
      }
      
      return findAndClickAddButton();
    `;

        const result = await this.executeJavaScript(script);
        return result;
    }

    async fillEnvironmentVariable(name, value, environments = ['Production', 'Preview', 'Development']) {
        console.log(`📝 Filling environment variable: ${name}`);

        const script = `
      function fillEnvironmentVariableForm(name, value, environments) {
        try {
          // Find input fields
          const nameInputs = Array.from(document.querySelectorAll('input')).filter(input => {
            const placeholder = input.placeholder?.toLowerCase() || '';
            const label = input.getAttribute('aria-label')?.toLowerCase() || '';
            const name = input.name?.toLowerCase() || '';
            return placeholder.includes('name') || placeholder.includes('key') || 
                   label.includes('name') || label.includes('key') ||
                   name.includes('name') || name.includes('key');
          });
          
          const valueInputs = Array.from(document.querySelectorAll('input, textarea')).filter(input => {
            const placeholder = input.placeholder?.toLowerCase() || '';
            const label = input.getAttribute('aria-label')?.toLowerCase() || '';
            const name = input.name?.toLowerCase() || '';
            return placeholder.includes('value') || label.includes('value') || 
                   name.includes('value');
          });
          
          console.log('Found name inputs:', nameInputs.length);
          console.log('Found value inputs:', valueInputs.length);
          
          // Fill name field
          if (nameInputs.length > 0) {
            const nameInput = nameInputs[0];
            nameInput.focus();
            nameInput.value = name;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Filled name field with:', name);
          }
          
          // Fill value field
          if (valueInputs.length > 0) {
            const valueInput = valueInputs[0];
            valueInput.focus();
            valueInput.value = value;
            valueInput.dispatchEvent(new Event('input', { bubbles: true }));
            valueInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Filled value field');
          }
          
          // Find and check environment checkboxes
          const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
          environments.forEach(env => {
            const checkbox = checkboxes.find(cb => {
              const label = cb.parentElement?.textContent || '';
              const nextSibling = cb.nextElementSibling?.textContent || '';
              const prevSibling = cb.previousElementSibling?.textContent || '';
              return label.includes(env) || nextSibling.includes(env) || prevSibling.includes(env);
            });
            
            if (checkbox && !checkbox.checked) {
              checkbox.click();
              console.log('Checked environment:', env);
            }
          });
          
          return { success: true, message: 'Form filled successfully' };
          
        } catch (error) {
          console.error('Error filling form:', error);
          return { success: false, message: error.message };
        }
      }
      
      return fillEnvironmentVariableForm('${name}', '${value}', ${JSON.stringify(environments)});
    `;

        const result = await this.executeJavaScript(script);
        return result;
    }

    async clickSaveButton() {
        console.log('💾 Looking for Save/Add button...');

        const script = `
      function findAndClickSaveButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        // Look for save, add, or submit buttons
        const saveButtons = buttons.filter(btn => {
          const text = (btn.textContent || btn.innerText || '').toLowerCase();
          return text.includes('save') || text.includes('add') || text.includes('submit') || 
                 text.includes('create') || text === 'ok';
        });
        
        console.log('Found potential save buttons:', saveButtons.length);
        saveButtons.forEach((btn, i) => console.log(\`Save button \${i}: \${btn.textContent}\`));
        
        if (saveButtons.length > 0) {
          saveButtons[0].click();
          return { success: true, message: 'Clicked save button', buttonText: saveButtons[0].textContent };
        }
        
        return { success: false, message: 'No save button found' };
      }
      
      return findAndClickSaveButton();
    `;

        const result = await this.executeJavaScript(script);
        return result;
    }

    async addEnvironmentVariable(name, value, environments = ['Production', 'Preview', 'Development']) {
        console.log(`\n🔧 Adding environment variable: ${name}`);
        console.log('========================================');

        // Focus the window
        await this.focusEdgeWindow();
        await new Promise(resolve => setTimeout(resolve, 500));

        // Click Add Environment Variable button
        const addResult = await this.clickAddEnvironmentVariableButton();
        console.log('Add button result:', addResult);

        if (!addResult || !addResult.success) {
            console.log('⚠️ Could not find Add button, trying keyboard shortcut...');
            await this.sendKeysToWindow('{TAB}');
            await this.sendKeysToWindow('{ENTER}');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fill the form
        const fillResult = await this.fillEnvironmentVariable(name, value, environments);
        console.log('Fill result:', fillResult);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Click Save/Add button
        const saveResult = await this.clickSaveButton();
        console.log('Save result:', saveResult);

        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: fillResult?.success && saveResult?.success,
            addResult,
            fillResult,
            saveResult
        };
    }

    async addAllEnvironmentVariables() {
        console.log('🚀 Starting to add all environment variables...');
        console.log('================================================\n');

        const envVars = [
            {
                name: 'AZURE_OPENAI_ENDPOINT',
                value: 'https://your-azure-openai-endpoint.openai.azure.com/',
            },
            {
                name: 'AZURE_OPENAI_API_KEY',
                value: 'your-azure-openai-api-key-here',
            },
            {
                name: 'GITHUB_CLIENT_SECRET',
                value: 'your-github-client-secret-here',
            },
            {
                name: 'NEXTAUTH_SECRET',
                value: 'your-nextauth-secret-here',
            },
            {
                name: 'STRIPE_SECRET_KEY',
                value: 'your-stripe-secret-key-here',
            }
        ];

        const results = [];

        for (let i = 0; i < envVars.length; i++) {
            const envVar = envVars[i];
            console.log(`\n📋 Processing ${i + 1}/${envVars.length}: ${envVar.name}`);

            try {
                const result = await this.addEnvironmentVariable(
                    envVar.name,
                    envVar.value,
                    ['Production', 'Preview', 'Development']
                );

                results.push({
                    name: envVar.name,
                    success: result.success,
                    result
                });

                if (result.success) {
                    console.log(`✅ Successfully added: ${envVar.name}`);
                } else {
                    console.log(`❌ Failed to add: ${envVar.name}`);
                }

                // Wait between variables
                if (i < envVars.length - 1) {
                    console.log('⏳ Waiting 3 seconds before next variable...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error(`❌ Error adding ${envVar.name}:`, error.message);
                results.push({
                    name: envVar.name,
                    success: false,
                    error: error.message
                });
            }
        }

        console.log('\n🎯 Summary Results:');
        console.log('==================');
        results.forEach(result => {
            console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
        });

        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Added ${successCount}/${envVars.length} environment variables successfully`);

        if (successCount < envVars.length) {
            console.log('\n📋 Manual steps for remaining variables:');
            results.filter(r => !r.success).forEach(result => {
                console.log(`- Add ${result.name} manually in Vercel dashboard`);
            });
        }

        return results;
    }
}

async function main() {
    const automation = new DirectVercelAutomation();
    await automation.addAllEnvironmentVariables();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { DirectVercelAutomation };
