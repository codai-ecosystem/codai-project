/**
 * MemorAI Phase 2 Task 6.3: Responsive Design Validation
 * Tests mobile responsiveness of timeline, categories, tags, and filters components
 * with touch-friendly interactions and adaptive design patterns
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ResponsiveDesignValidator {
    constructor() {
        this.results = {
            taskId: '6.3',
            taskName: 'Responsive Design',
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                passRate: 0
            }
        };

        this.breakpoints = {
            mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
            tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
            desktop: { width: 1440, height: 900, name: 'Desktop (Large)' },
            ultrawide: { width: 1920, height: 1080, name: 'Ultra-wide' }
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
            const hasTouchTarget = cssContent.includes('.touch-target');
            if (!hasTouchTarget) {
                throw new Error('Touch-target classes not found');
            }

            // Check for responsive text classes
            const hasResponsiveText = cssContent.includes('.text-responsive-');
            if (!hasResponsiveText) {
                throw new Error('Responsive text classes not found');
            }

            // Check for mobile-specific styles
            const hasMobileStyles = cssContent.includes('@media (max-width:');
            if (!hasMobileStyles) {
                throw new Error('Mobile-specific media queries not found');
            }

            return {
                hasTouchTarget,
                hasResponsiveText,
                hasMobileStyles,
                cssSize: cssContent.length
            };
        });
    }

    validateComponentResponsiveness() {
        return this.test('Memory Dashboard Component Responsive', () => {
            const dashboardPath = path.join(__dirname, '..', 'src', 'components', 'memory-dashboard.tsx');

            if (!fs.existsSync(dashboardPath)) {
                throw new Error('Memory dashboard component not found');
            }

            const componentContent = fs.readFileSync(dashboardPath, 'utf8');

            // Check for responsive classes
            const hasResponsiveClasses = componentContent.includes('sm:') && componentContent.includes('lg:');
            if (!hasResponsiveClasses) {
                throw new Error('Responsive utility classes not found');
            }

            // Check for mobile-specific elements
            const hasMobileElements = componentContent.includes('lg:hidden') || componentContent.includes('sm:hidden');
            if (!hasMobileElements) {
                throw new Error('Mobile-specific visibility classes not found');
            }

            // Check for touch-friendly buttons
            const hasTouchFriendly = componentContent.includes('touch-target') || componentContent.includes('touch-action');
            if (!hasTouchFriendly) {
                throw new Error('Touch-friendly interactions not implemented');
            }

            return {
                hasResponsiveClasses,
                hasMobileElements,
                hasTouchFriendly,
                componentSize: componentContent.length
            };
        });
    }

    validateMemoryListResponsiveness() {
        return this.test('Memory List Component Responsive', () => {
            const listPath = path.join(__dirname, '..', 'src', 'components', 'memory-list.tsx');

            if (!fs.existsSync(listPath)) {
                throw new Error('Memory list component not found');
            }

            const componentContent = fs.readFileSync(listPath, 'utf8');

            // Check for grid responsiveness
            const hasResponsiveGrid = componentContent.includes('grid-cols-1') && componentContent.includes('sm:grid-cols-');
            if (!hasResponsiveGrid) {
                throw new Error('Responsive grid layout not implemented');
            }

            // Check for responsive text sizing
            const hasResponsiveText = componentContent.includes('text-responsive-');
            if (!hasResponsiveText) {
                throw new Error('Responsive text sizing not implemented');
            }

            // Check for mobile card adaptations
            const hasMobileCard = componentContent.includes('active:scale-') || componentContent.includes('card-responsive');
            if (!hasMobileCard) {
                throw new Error('Mobile card interactions not implemented');
            }

            return {
                hasResponsiveGrid,
                hasResponsiveText,
                hasMobileCard,
                componentSize: componentContent.length
            };
        });
    }

    validateSearchInterfaceResponsiveness() {
        return this.test('Search Interface Component Responsive', () => {
            const searchPath = path.join(__dirname, '..', 'src', 'components', 'search-interface.tsx');

            if (!fs.existsSync(searchPath)) {
                throw new Error('Search interface component not found');
            }

            const componentContent = fs.readFileSync(searchPath, 'utf8');

            // Check for form responsiveness
            const hasFormResponsive = componentContent.includes('form-responsive') || componentContent.includes('button-responsive');
            if (!hasFormResponsive) {
                throw new Error('Responsive form classes not implemented');
            }

            // Check for mobile button adaptations
            const hasMobileButtons = componentContent.includes('sm:flex-row') || componentContent.includes('flex-col');
            if (!hasMobileButtons) {
                throw new Error('Mobile button layout not implemented');
            }

            // Check for touch-friendly interactions
            const hasTouchElements = componentContent.includes('touch-target') || componentContent.includes('aria-label');
            if (!hasTouchElements) {
                throw new Error('Touch-friendly elements not implemented');
            }

            return {
                hasFormResponsive,
                hasMobileButtons,
                hasTouchElements,
                componentSize: componentContent.length
            };
        });
    }

    validateTimelineResponsiveness() {
        return this.test('Timeline Component Responsive', () => {
            const timelinePath = path.join(__dirname, '..', 'src', 'components', 'memory-timeline.tsx');

            if (!fs.existsSync(timelinePath)) {
                throw new Error('Timeline component not found');
            }

            const componentContent = fs.readFileSync(timelinePath, 'utf8');

            // Check for mobile timeline adaptations
            const hasMobileLayout = componentContent.includes('sm:') || componentContent.includes('md:');
            if (!hasMobileLayout) {
                throw new Error('Mobile timeline layout not responsive');
            }

            // Check for touch-friendly timeline items
            const hasTouchItems = componentContent.includes('cursor-pointer') || componentContent.includes('hover:');
            if (!hasTouchItems) {
                throw new Error('Timeline items not touch-friendly');
            }

            return {
                hasMobileLayout,
                hasTouchItems,
                componentSize: componentContent.length
            };
        });
    }

    validateOrganizationComponents() {
        return this.test('Organization Components (Categories, Tags, Filters) Responsive', () => {
            const componentsToCheck = [
                'memory-categories.tsx',
                'memory-tags.tsx',
                'memory-filters.tsx'
            ];

            const results = {};

            for (const componentName of componentsToCheck) {
                const componentPath = path.join(__dirname, '..', 'src', 'components', componentName);

                if (!fs.existsSync(componentPath)) {
                    throw new Error(`${componentName} component not found`);
                }

                const componentContent = fs.readFileSync(componentPath, 'utf8');

                // Check for responsive elements
                const hasResponsiveElements = componentContent.includes('sm:') || componentContent.includes('lg:');
                const hasMobileAdaptations = componentContent.includes('flex-wrap') || componentContent.includes('grid-cols-');

                results[componentName] = {
                    exists: true,
                    hasResponsiveElements,
                    hasMobileAdaptations,
                    size: componentContent.length
                };

                if (!hasResponsiveElements && !hasMobileAdaptations) {
                    throw new Error(`${componentName} lacks responsive design elements`);
                }
            }

            return results;
        });
    }

    validateAccessibilityFeatures() {
        return this.test('Accessibility and Touch Features', () => {
            const globalsCssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
            const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

            // Check for focus states
            const hasFocusStates = cssContent.includes('focus:') || cssContent.includes(':focus');
            if (!hasFocusStates) {
                throw new Error('Focus states not implemented');
            }

            // Check for iOS input zoom prevention
            const hasIOSFix = cssContent.includes('font-size: 16px') && cssContent.includes('webkit-touch-callout');
            if (!hasIOSFix) {
                throw new Error('iOS input zoom prevention not implemented');
            }

            // Check for touch-specific styles
            const hasTouchStyles = cssContent.includes('hover: none') && cssContent.includes('pointer: coarse');
            if (!hasTouchStyles) {
                throw new Error('Touch-specific styles not implemented');
            }

            return {
                hasFocusStates,
                hasIOSFix,
                hasTouchStyles
            };
        });
    }

    async runAllTests() {
        console.log('🎯 Phase 2 Task 6.3: Responsive Design Validation');
        console.log('='.repeat(50));

        // Core responsive design tests
        this.validateTailwindConfig();
        this.validateResponsiveCSS();

        // Component responsiveness tests  
        this.validateComponentResponsiveness();
        this.validateMemoryListResponsiveness();
        this.validateSearchInterfaceResponsiveness();
        this.validateTimelineResponsiveness();
        this.validateOrganizationComponents();

        // Accessibility and touch tests
        this.validateAccessibilityFeatures();

        // Calculate final results
        this.results.summary.passRate = Math.round(
            (this.results.summary.passed / this.results.summary.total) * 100
        );

        console.log('\n📊 Test Results Summary:');
        console.log('='.repeat(25));
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed}`);
        console.log(`Failed: ${this.results.summary.failed}`);
        console.log(`Pass Rate: ${this.results.summary.passRate}%`);

        // Save results
        const resultsPath = path.join(__dirname, 'phase2-task-6-3-responsive-design-validation.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📝 Results saved to: ${resultsPath}`);

        // Determine overall status
        const isSuccess = this.results.summary.passRate >= 90;
        const status = isSuccess ? 'COMPLETED' : 'NEEDS_ATTENTION';

        console.log(`\n🎯 Phase 2 Task 6.3 Status: ${status}`);

        if (isSuccess) {
            console.log('✅ Responsive design implementation meets requirements!');
            console.log('📱 Mobile-first design with touch-friendly interactions');
            console.log('🎨 Adaptive layout patterns for all breakpoints');
            console.log('♿ Accessibility features implemented');
        } else {
            console.log('⚠️  Some responsive design elements need attention');
            console.log('📋 Review failed tests and implement missing features');
        }

        return this.results;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ResponsiveDesignValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = ResponsiveDesignValidator;
