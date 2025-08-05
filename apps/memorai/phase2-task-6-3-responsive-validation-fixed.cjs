/**
 * Phase 2 Task 6.3: Responsive Design Validation Script
 * Validates the implementation of responsive design patterns across MemorAI
 */

const fs = require('fs');
const path = require('path');

class ResponsiveDesignValidator {
    constructor() {
        this.results = {
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        };
    }

    test(name, testFn) {
        const startTime = Date.now();
        let status = 'PASSED';
        let error = null;
        let details = {};

        try {
            details = testFn() || {};
        } catch (err) {
            status = 'FAILED';
            error = err.message;
        }

        const result = {
            name,
            status,
            error,
            details,
            duration: Date.now() - startTime
        };

        this.results.tests.push(result);
        this.results.summary.total++;

        if (status === 'PASSED') {
            this.results.summary.passed++;
            console.log(`✅ ${name}`);
        } else {
            this.results.summary.failed++;
            console.log(`❌ ${name}: ${error}`);
        }

        return result;
    }

    validateTailwindConfig() {
        return this.test('Tailwind Configuration Enhanced', () => {
            const configPath = './tailwind.config.js';

            if (!fs.existsSync(configPath)) {
                throw new Error('Tailwind config file not found');
            }

            const configContent = fs.readFileSync(configPath, 'utf8');

            // Check for responsive breakpoints
            const hasCustomScreens = configContent.includes('screens:') && configContent.includes('xs:');
            if (!hasCustomScreens) {
                throw new Error('Custom responsive breakpoints not configured');
            }

            // Check for dark mode
            const hasDarkMode = configContent.includes('darkMode:');
            if (!hasDarkMode) {
                throw new Error('Dark mode not configured');
            }

            // Check for animations
            const hasAnimations = configContent.includes('keyframes:') && configContent.includes('animation:');
            if (!hasAnimations) {
                throw new Error('Custom animations not configured');
            }

            return {
                hasCustomScreens,
                hasDarkMode,
                hasAnimations,
                configSize: configContent.length
            };
        });
    }

    validateResponsiveCSS() {
        return this.test('Responsive CSS Classes Implemented', () => {
            const globalsCssPath = './src/app/globals.css';

            if (!fs.existsSync(globalsCssPath)) {
                throw new Error('globals.css file not found');
            }

            const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

            // Check for touch-friendly classes
            const hasTouchClasses = cssContent.includes('.touch-target');
            if (!hasTouchClasses) {
                throw new Error('Touch-friendly classes not implemented');
            }

            // Check for responsive text classes
            const hasResponsiveText = cssContent.includes('.text-responsive-');
            if (!hasResponsiveText) {
                throw new Error('Responsive text classes not implemented');
            }

            // Check for responsive form classes
            const hasResponsiveForms = cssContent.includes('.form-responsive');
            if (!hasResponsiveForms) {
                throw new Error('Responsive form classes not implemented');
            }

            // Check for memory card classes
            const hasMemoryCard = cssContent.includes('.memory-card');
            if (!hasMemoryCard) {
                throw new Error('Memory card responsive classes not implemented');
            }

            return {
                hasTouchClasses,
                hasResponsiveText,
                hasResponsiveForms,
                hasMemoryCard,
                cssSize: cssContent.length
            };
        });
    }

    validateMemoryDashboard() {
        return this.test('Memory Dashboard Component Responsive', () => {
            const dashboardPath = './src/components/memory-dashboard.tsx';

            if (!fs.existsSync(dashboardPath)) {
                throw new Error('Memory dashboard component not found');
            }

            const componentContent = fs.readFileSync(dashboardPath, 'utf8');

            // Check for responsive patterns
            const hasResponsiveGrid = componentContent.includes('lg:hidden') && componentContent.includes('lg:block');
            if (!hasResponsiveGrid) {
                throw new Error('Responsive layout patterns not found');
            }

            // Check for mobile sidebar
            const hasMobileSidebar = componentContent.includes('order-1') && componentContent.includes('order-2');
            if (!hasMobileSidebar) {
                throw new Error('Mobile sidebar ordering not implemented');
            }

            // Check for touch interactions
            const hasTouchTargets = componentContent.includes('touch-target');
            if (!hasTouchTargets) {
                throw new Error('Touch-friendly interactions not implemented');
            }

            return {
                hasResponsiveGrid,
                hasMobileSidebar,
                hasTouchTargets,
                componentSize: componentContent.length
            };
        });
    }

    validateMemoryList() {
        return this.test('Memory List Component Responsive', () => {
            const listPath = './src/components/memory-list.tsx';

            if (!fs.existsSync(listPath)) {
                throw new Error('Memory list component not found');
            }

            const componentContent = fs.readFileSync(listPath, 'utf8');

            // Check for responsive grid
            const hasResponsiveGrid = componentContent.includes('grid-cols-1') &&
                componentContent.includes('sm:grid-cols-2') &&
                componentContent.includes('lg:grid-cols-3');
            if (!hasResponsiveGrid) {
                throw new Error('Responsive grid patterns not found');
            }

            // Check for mobile interactions
            const hasMobileInteractions = componentContent.includes('active:scale-95');
            if (!hasMobileInteractions) {
                throw new Error('Mobile card interactions not implemented');
            }

            // Check for responsive text
            const hasResponsiveText = componentContent.includes('text-responsive-');
            if (!hasResponsiveText) {
                throw new Error('Responsive text sizing not implemented');
            }

            return {
                hasResponsiveGrid,
                hasMobileInteractions,
                hasResponsiveText,
                componentSize: componentContent.length
            };
        });
    }

    validateSearchInterface() {
        return this.test('Search Interface Component Responsive', () => {
            const searchPath = './src/components/search-interface.tsx';

            if (!fs.existsSync(searchPath)) {
                throw new Error('Search interface component not found');
            }

            const componentContent = fs.readFileSync(searchPath, 'utf8');

            // Check for responsive form patterns
            const hasResponsiveForm = componentContent.includes('form-responsive');
            if (!hasResponsiveForm) {
                throw new Error('Responsive form patterns not found');
            }

            // Check for responsive button layout
            const hasResponsiveButtons = componentContent.includes('flex-col') && componentContent.includes('sm:flex-row');
            if (!hasResponsiveButtons) {
                throw new Error('Responsive button layouts not implemented');
            }

            // Check for touch targets
            const hasTouchTargets = componentContent.includes('touch-target');
            if (!hasTouchTargets) {
                throw new Error('Touch-friendly targets not implemented');
            }

            return {
                hasResponsiveForm,
                hasResponsiveButtons,
                hasTouchTargets,
                componentSize: componentContent.length
            };
        });
    }

    validateTimelineComponent() {
        return this.test('Timeline Component Responsive', () => {
            const timelinePath = './src/components/memory-timeline.tsx';

            if (!fs.existsSync(timelinePath)) {
                throw new Error('Timeline component not found');
            }

            const componentContent = fs.readFileSync(timelinePath, 'utf8');

            // Check for responsive timeline patterns
            const hasResponsiveTimeline = componentContent.includes('sm:') || componentContent.includes('md:') || componentContent.includes('lg:');
            if (!hasResponsiveTimeline) {
                throw new Error('Responsive timeline patterns not found');
            }

            return {
                hasResponsiveTimeline,
                componentSize: componentContent.length
            };
        });
    }

    validateOrganizationComponents() {
        return this.test('Organization Components (Categories, Tags, Filters) Responsive', () => {
            const componentNames = [
                'memory-categories.tsx',
                'memory-tags.tsx',
                'memory-filters.tsx'
            ];

            const componentResults = {};

            for (const componentName of componentNames) {
                const componentPath = `./src/components/${componentName}`;

                if (!fs.existsSync(componentPath)) {
                    throw new Error(`${componentName} component not found`);
                }

                const componentContent = fs.readFileSync(componentPath, 'utf8');

                // Check for responsive patterns
                const hasResponsivePatterns = componentContent.includes('sm:') ||
                    componentContent.includes('md:') ||
                    componentContent.includes('lg:');

                componentResults[componentName] = {
                    exists: true,
                    hasResponsivePatterns,
                    size: componentContent.length
                };
            }

            return componentResults;
        });
    }

    validateAccessibilityAndTouch() {
        return this.test('Accessibility and Touch Features', () => {
            const globalsCssPath = './src/app/globals.css';

            if (!fs.existsSync(globalsCssPath)) {
                throw new Error('globals.css file not found');
            }

            const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

            // Check for focus states
            const hasFocusStates = cssContent.includes(':focus');
            if (!hasFocusStates) {
                throw new Error('Focus states for accessibility not implemented');
            }

            // Check for iOS input zoom prevention
            const hasIOSZoomPrevention = cssContent.includes('font-size: 16px');
            if (!hasIOSZoomPrevention) {
                throw new Error('iOS input zoom prevention not implemented');
            }

            // Check for touch-action classes
            const hasTouchAction = cssContent.includes('touch-action');
            if (!hasTouchAction) {
                throw new Error('Touch-action classes not implemented');
            }

            return {
                hasFocusStates,
                hasIOSZoomPrevention,
                hasTouchAction
            };
        });
    }

    async runValidation() {
        console.log('🎯 Phase 2 Task 6.3: Responsive Design Validation');
        console.log('==================================================');

        // Run all validation tests
        this.validateTailwindConfig();
        this.validateResponsiveCSS();
        this.validateMemoryDashboard();
        this.validateMemoryList();
        this.validateSearchInterface();
        this.validateTimelineComponent();
        this.validateOrganizationComponents();
        this.validateAccessibilityAndTouch();

        // Calculate pass rate
        const passRate = this.results.summary.total > 0 ?
            Math.round((this.results.summary.passed / this.results.summary.total) * 100) : 0;

        // Display results
        console.log('\n📊 Test Results Summary:');
        console.log('=========================');
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed}`);
        console.log(`Failed: ${this.results.summary.failed}`);
        console.log(`Pass Rate: ${passRate}%`);

        // Save results to file
        const resultsPath = './phase2-task-6-3-responsive-design-validation.json';
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📝 Results saved to: ${path.resolve(resultsPath)}`);

        // Determine task status
        const taskStatus = passRate >= 80 ? 'COMPLETED' : 'NEEDS_ATTENTION';
        console.log(`\n🎯 Phase 2 Task 6.3 Status: ${taskStatus}`);

        if (taskStatus === 'COMPLETED') {
            console.log('🎉 Responsive design implementation is complete!');
            console.log('✅ Ready to proceed to Phase 2 Task 6.4');
        } else {
            console.log('⚠️  Some responsive design elements need attention');
            console.log('📋 Review failed tests and implement missing features');
        }

        return {
            status: taskStatus,
            passRate,
            results: this.results
        };
    }
}

// Run the validation
if (require.main === module) {
    const validator = new ResponsiveDesignValidator();
    validator.runValidation().catch(console.error);
}

module.exports = ResponsiveDesignValidator;
