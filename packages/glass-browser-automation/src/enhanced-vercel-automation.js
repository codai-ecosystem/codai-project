"use strict";
/**
 * Enhanced Vercel Dashboard Automation
 * Uses advanced DOM inspection and smart element interaction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedVercelAutomation = void 0;
const enhanced_glass_browser_1 = require("./enhanced-glass-browser");
class EnhancedVercelAutomation {
    browser;
    isInitialized = false;
    constructor() {
        this.browser = new enhanced_glass_browser_1.EnhancedGlassBrowser();
    }
    /**
     * Initialize the Vercel automation with browser connection
     */
    async initialize() {
        try {
            // Initialize the enhanced browser with Vercel-specific window detection
            const pageState = await this.browser.initializeBrowserAutomation('vercel');
            this.isInitialized = true;
            return {
                success: true,
                message: 'Vercel automation initialized successfully',
                details: {
                    url: pageState.url,
                    title: pageState.title,
                    windowHandle: pageState.windowHandle
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to initialize Vercel automation',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Navigate to environment variables page for a specific project
     */
    async navigateToEnvironmentVariables(projectName) {
        if (!this.isInitialized) {
            const initResult = await this.initialize();
            if (!initResult.success) {
                return initResult;
            }
        }
        try {
            const url = `https://vercel.com/codai-ro/${projectName}/settings/environment-variables`;
            const pageState = await this.browser.navigateToUrl(url, true);
            // Analyze the page to confirm we're on the right page
            const analysis = await this.browser.analyzeCurrentPage();
            const isOnEnvVarsPage = analysis.pageState.url.includes('environment-variables') ||
                analysis.pageState.title.toLowerCase().includes('environment');
            if (!isOnEnvVarsPage) {
                return {
                    success: false,
                    message: 'Failed to navigate to environment variables page',
                    details: analysis.pageState
                };
            }
            return {
                success: true,
                message: `Successfully navigated to environment variables page for ${projectName}`,
                details: {
                    url: pageState.url,
                    title: pageState.title,
                    elementAnalysis: analysis.elementAnalysis,
                    actionableElements: analysis.actionableElements.slice(0, 5)
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to navigate to environment variables page',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Find and analyze the "Add Environment Variable" interface
     */
    async findAddEnvironmentVariableInterface() {
        try {
            // Search for various patterns that might indicate the add button
            const searchPatterns = [
                { text: 'Add' },
                { text: 'Add Environment Variable' },
                { text: 'Create' },
                { text: 'New' },
                { containsText: 'add', clickable: true },
                { tag: 'button', containsText: 'add' },
                { role: 'button', containsText: 'add' }
            ];
            const bestResults = [];
            for (const pattern of searchPatterns) {
                const searchResult = await this.browser.searchForElements(pattern);
                if (searchResult.found && searchResult.elements.length > 0) {
                    bestResults.push({
                        pattern,
                        result: searchResult,
                        confidence: searchResult.suggestions[0]?.confidence || 0
                    });
                }
            }
            // Sort by confidence
            bestResults.sort((a, b) => b.confidence - a.confidence);
            if (bestResults.length === 0) {
                // Analyze the entire page for debugging
                const pageAnalysis = await this.browser.analyzeCurrentPage();
                return {
                    success: false,
                    message: 'No "Add Environment Variable" interface found',
                    details: {
                        totalElements: pageAnalysis.elementAnalysis.totalElements,
                        clickableElements: pageAnalysis.elementAnalysis.clickableElements,
                        buttons: pageAnalysis.elementAnalysis.buttons,
                        actionableElements: pageAnalysis.actionableElements.slice(0, 10),
                        searchPatternsAttempted: searchPatterns
                    }
                };
            }
            const bestResult = bestResults[0];
            return {
                success: true,
                message: 'Found potential "Add Environment Variable" interface elements',
                details: {
                    bestMatch: bestResult.result.bestMatch,
                    allMatches: bestResult.result.elements,
                    searchPattern: bestResult.pattern,
                    confidence: bestResult.confidence,
                    suggestions: bestResult.result.suggestions.slice(0, 3)
                },
                elementsFound: bestResult.result.elements
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error while searching for add environment variable interface',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Attempt to click the "Add Environment Variable" button
     */
    async clickAddEnvironmentVariable() {
        try {
            // First, find the interface
            const findResult = await this.findAddEnvironmentVariableInterface();
            if (!findResult.success || !findResult.elementsFound) {
                return {
                    success: false,
                    message: 'Cannot click add button: interface not found',
                    details: findResult.details
                };
            }
            // Try to click the best match
            const bestElement = findResult.details?.bestMatch;
            if (!bestElement) {
                return {
                    success: false,
                    message: 'No suitable element found to click'
                };
            }
            const clickResult = await this.browser.smartClickElement({
                text: bestElement.text,
                selector: bestElement.selector
            }, {
                retryCount: 3,
                scrollToElement: true,
                timeout: 10000
            });
            if (clickResult.success) {
                // Wait for the form to appear
                await this.delay(2000);
                // Analyze the page again to see if a form appeared
                const newAnalysis = await this.browser.analyzeCurrentPage();
                return {
                    success: true,
                    message: 'Successfully clicked add environment variable button',
                    details: {
                        clickedElement: bestElement,
                        clickMethod: clickResult.method,
                        newPageState: newAnalysis.pageState,
                        formsFound: newAnalysis.elementAnalysis.formElements,
                        inputsFound: newAnalysis.elementAnalysis.inputs
                    }
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to click add environment variable button',
                    details: {
                        element: bestElement,
                        clickError: clickResult.error,
                        method: clickResult.method
                    }
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Error while clicking add environment variable button',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Fill environment variable form
     */
    async fillEnvironmentVariableForm(envVar) {
        try {
            // Look for form fields
            const nameFieldSearch = await this.browser.searchForElements({
                tag: 'input',
                attributes: { type: 'text', placeholder: 'Name' }
            });
            const valueFieldSearch = await this.browser.searchForElements({
                tag: 'input',
                attributes: { type: 'text', placeholder: 'Value' }
            });
            // Also search by common field names
            const alternativeNameSearch = await this.browser.searchForElements({
                tag: 'input',
                containsText: 'name'
            });
            const alternativeValueSearch = await this.browser.searchForElements({
                tag: 'input',
                containsText: 'value'
            });
            // Try to fill the form using the smart fill functionality
            const formData = {
                name: envVar.name,
                value: envVar.value,
                key: envVar.name, // Some forms use 'key' instead of 'name'
                variable: envVar.name,
                secret: envVar.value
            };
            const fillResult = await this.browser.fillForm(formData);
            if (fillResult.success) {
                return {
                    success: true,
                    message: `Successfully filled environment variable form for ${envVar.name}`,
                    details: {
                        filledFields: fillResult.filledFields,
                        formData: { name: envVar.name, valueLength: envVar.value.length }
                    }
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to fill environment variable form',
                    details: {
                        filledFields: fillResult.filledFields,
                        failedFields: fillResult.failedFields,
                        nameFieldsFound: nameFieldSearch.elements.length,
                        valueFieldsFound: valueFieldSearch.elements.length,
                        alternativeNameFields: alternativeNameSearch.elements.length,
                        alternativeValueFields: alternativeValueSearch.elements.length
                    }
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Error while filling environment variable form',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Complete the environment variable creation process
     */
    async saveEnvironmentVariable() {
        try {
            // Look for save/submit buttons
            const saveButtonSearch = await this.browser.searchForElements({
                containsText: 'save',
                clickable: true
            });
            const submitButtonSearch = await this.browser.searchForElements({
                tag: 'button',
                attributes: { type: 'submit' }
            });
            const addButtonSearch = await this.browser.searchForElements({
                containsText: 'add',
                clickable: true
            });
            // Find the most likely save button
            const allButtons = [
                ...saveButtonSearch.elements,
                ...submitButtonSearch.elements,
                ...addButtonSearch.elements
            ];
            if (allButtons.length === 0) {
                return {
                    success: false,
                    message: 'No save/submit button found',
                    details: {
                        saveButtons: saveButtonSearch.elements.length,
                        submitButtons: submitButtonSearch.elements.length,
                        addButtons: addButtonSearch.elements.length
                    }
                };
            }
            // Sort by confidence and try clicking
            const sortedButtons = allButtons.sort((a, b) => {
                const aScore = this.calculateButtonScore(a);
                const bScore = this.calculateButtonScore(b);
                return bScore - aScore;
            });
            const bestButton = sortedButtons[0];
            const clickResult = await this.browser.smartClickElement({
                selector: bestButton.selector,
                text: bestButton.text
            });
            if (clickResult.success) {
                // Wait for the save to complete
                await this.delay(3000);
                return {
                    success: true,
                    message: 'Successfully saved environment variable',
                    details: {
                        savedButton: bestButton,
                        clickMethod: clickResult.method
                    }
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to save environment variable',
                    details: {
                        button: bestButton,
                        clickError: clickResult.error
                    }
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Error while saving environment variable',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Complete workflow to add an environment variable
     */
    async addEnvironmentVariable(projectName, envVar) {
        try {
            // Step 1: Navigate to environment variables page
            const navResult = await this.navigateToEnvironmentVariables(projectName);
            if (!navResult.success) {
                return navResult;
            }
            // Step 2: Click add environment variable
            const clickResult = await this.clickAddEnvironmentVariable();
            if (!clickResult.success) {
                return clickResult;
            }
            // Step 3: Fill the form
            const fillResult = await this.fillEnvironmentVariableForm(envVar);
            if (!fillResult.success) {
                return fillResult;
            }
            // Step 4: Save the variable
            const saveResult = await this.saveEnvironmentVariable();
            if (!saveResult.success) {
                return saveResult;
            }
            return {
                success: true,
                message: `Successfully added environment variable ${envVar.name} to project ${projectName}`,
                details: {
                    project: projectName,
                    variableName: envVar.name,
                    steps: ['navigate', 'click_add', 'fill_form', 'save']
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error in complete add environment variable workflow',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Add multiple environment variables to a project
     */
    async addMultipleEnvironmentVariables(projectName, envVars) {
        const results = [];
        for (const envVar of envVars) {
            console.log(`Adding environment variable: ${envVar.name}`);
            const result = await this.addEnvironmentVariable(projectName, envVar);
            results.push(result);
            if (!result.success) {
                console.log(`Failed to add ${envVar.name}, stopping process`);
                break;
            }
            // Wait between additions
            await this.delay(2000);
        }
        return results;
    }
    /**
     * Calculate button relevance score for save/submit actions
     */
    calculateButtonScore(button) {
        let score = 0;
        const text = button.text.toLowerCase();
        if (text.includes('save'))
            score += 50;
        if (text.includes('submit'))
            score += 40;
        if (text.includes('add'))
            score += 30;
        if (text.includes('create'))
            score += 25;
        if (button.attributes.type === 'submit')
            score += 20;
        if (button.tagName === 'BUTTON')
            score += 15;
        if (button.isVisible)
            score += 10;
        return score;
    }
    /**
     * Utility delay method
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current page analysis for debugging
     */
    async getPageAnalysis() {
        if (!this.isInitialized) {
            throw new Error('Automation not initialized');
        }
        return await this.browser.analyzeCurrentPage();
    }
}
exports.EnhancedVercelAutomation = EnhancedVercelAutomation;
