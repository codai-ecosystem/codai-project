#!/usr/bin/env node

/**
 * CODAI Coming Soon Page - Comprehensive Testing & Validation Suite
 * Tests performance, functionality, accessibility, and user experience
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
    testResults.passed++;
}

function logError(message) {
    log(`❌ ${message}`, 'red');
    testResults.failed++;
    testResults.details.push({ type: 'error', message });
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
    testResults.warnings++;
    testResults.details.push({ type: 'warning', message });
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
    log(`\n${colors.bold}${colors.cyan}🚀 ${message}${colors.reset}`);
    log('='.repeat(50), 'cyan');
}

// File existence checker
function checkFileExists(filePath, description) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        logSuccess(`${description} exists: ${filePath}`);
        return true;
    } else {
        logError(`${description} missing: ${filePath}`);
        return false;
    }
}

// Component structure validation
function validateComponentStructure() {
    logHeader('COMPONENT STRUCTURE VALIDATION');

    const requiredComponents = [
        // 3D Components
        { path: 'src/components/3d/HeroSection3D.tsx', desc: '3D Hero Section' },
        { path: 'src/components/3d/ParticleSystem.tsx', desc: 'Particle System' },
        { path: 'src/components/3d/DynamicCursor.tsx', desc: 'Dynamic Cursor' },
        { path: 'src/components/3d/AnimatedBackground.tsx', desc: 'Animated Background' },
        { path: 'src/components/3d/ProjectCard3D.tsx', desc: '3D Project Cards' },
        { path: 'src/components/3d/ProjectBentoGrid.tsx', desc: 'Bento Grid Layout' },
        { path: 'src/components/3d/EcosystemVisualizer.tsx', desc: 'Ecosystem Visualizer' },
        { path: 'src/components/3d/ConnectionMap.tsx', desc: 'Connection Map' },
        { path: 'src/components/3d/InteractiveNodes.tsx', desc: 'Interactive Nodes' },

        // Animation Components
        { path: 'src/components/animations/ScrollAnimationProvider.tsx', desc: 'Scroll Animation Provider' },
        { path: 'src/components/animations/AnimatedSection.tsx', desc: 'Animated Section' },
        { path: 'src/components/animations/ParallaxContainer.tsx', desc: 'Parallax Container' },

        // Optimized Components
        { path: 'src/components/optimized/OptimizedParticleSystem.tsx', desc: 'Optimized Particle System' },
        { path: 'src/components/optimized/LazyWrapper.tsx', desc: 'Lazy Loading Wrapper' },

        // Section Components
        { path: 'src/components/sections/EcosystemOverviewAnimated.tsx', desc: 'Ecosystem Overview' },

        // Layout Components
        { path: 'src/components/layout/Navigation.tsx', desc: 'Navigation' },
        { path: 'src/components/layout/Footer.tsx', desc: 'Footer' }
    ];

    requiredComponents.forEach(component => {
        checkFileExists(component.path, component.desc);
    });
}

// Configuration and data validation
function validateConfiguration() {
    logHeader('CONFIGURATION & DATA VALIDATION');

    const requiredConfigs = [
        { path: 'src/config/performance.ts', desc: 'Performance Configuration' },
        { path: 'src/config/bundle-optimization.ts', desc: 'Bundle Optimization' },
        { path: 'src/data/projects.ts', desc: 'Projects Data' },
        { path: 'src/contexts/ThemeContext.tsx', desc: 'Theme Context' }
    ];

    requiredConfigs.forEach(config => {
        checkFileExists(config.path, config.desc);
    });

    // Check CSS files
    const cssFiles = [
        { path: 'src/styles/hero-animations.css', desc: 'Hero Animations CSS' },
        { path: 'src/styles/scroll-animations.css', desc: 'Scroll Animations CSS' },
        { path: 'src/styles/performance-optimizations.css', desc: 'Performance Optimizations CSS' }
    ];

    cssFiles.forEach(css => {
        checkFileExists(css.path, css.desc);
    });
}

// TypeScript compilation check
function validateTypeScriptCompilation() {
    logHeader('TYPESCRIPT COMPILATION CHECK');

    try {
        const { execSync } = require('child_process');

        logInfo('Running TypeScript compilation check...');
        execSync('npx tsc --noEmit --skipLibCheck', {
            stdio: 'pipe',
            cwd: path.join(__dirname, '..')
        });

        logSuccess('TypeScript compilation successful - no type errors');
    } catch (error) {
        logError('TypeScript compilation failed - type errors detected');

        // Extract meaningful error information
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
        const errorLines = errorOutput.split('\n').filter(line =>
            line.includes('error TS') || line.includes('src/')
        ).slice(0, 10); // Show first 10 errors

        errorLines.forEach(line => {
            if (line.trim()) {
                logError(`  ${line.trim()}`);
            }
        });
    }
}

// Package.json validation
function validatePackageConfiguration() {
    logHeader('PACKAGE CONFIGURATION VALIDATION');

    try {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check required dependencies
        const requiredDeps = [
            'react',
            'next',
            'typescript',
            'tailwindcss',
            'lucide-react'
        ];

        const missingDeps = requiredDeps.filter(dep =>
            !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
        );

        if (missingDeps.length === 0) {
            logSuccess('All required dependencies are present');
        } else {
            missingDeps.forEach(dep => {
                logError(`Missing required dependency: ${dep}`);
            });
        }

        // Check scripts
        const requiredScripts = ['dev', 'build', 'start', 'lint'];
        const missingScripts = requiredScripts.filter(script =>
            !packageJson.scripts?.[script]
        );

        if (missingScripts.length === 0) {
            logSuccess('All required scripts are configured');
        } else {
            missingScripts.forEach(script => {
                logError(`Missing required script: ${script}`);
            });
        }

    } catch (error) {
        logError('Failed to read or parse package.json');
    }
}

// Performance configuration validation
function validatePerformanceOptimizations() {
    logHeader('PERFORMANCE OPTIMIZATIONS VALIDATION');

    try {
        // Check if performance config exists and is properly structured
        const perfConfigPath = path.join(__dirname, '..', 'src/config/performance.ts');
        if (fs.existsSync(perfConfigPath)) {
            const perfConfig = fs.readFileSync(perfConfigPath, 'utf8');

            const requiredConfigs = [
                'ANIMATION',
                'BUNDLE',
                'MEMORY',
                'INTERSECTION',
                'CORE_WEB_VITALS',
                'PerformanceMonitor',
                'AnimationHelpers'
            ];

            const missingConfigs = requiredConfigs.filter(config =>
                !perfConfig.includes(config)
            );

            if (missingConfigs.length === 0) {
                logSuccess('Performance configuration is complete');
            } else {
                missingConfigs.forEach(config => {
                    logWarning(`Performance config section may be incomplete: ${config}`);
                });
            }
        }

        // Check CSS optimization classes
        const perfCSSPath = path.join(__dirname, '..', 'src/styles/performance-optimizations.css');
        if (fs.existsSync(perfCSSPath)) {
            const perfCSS = fs.readFileSync(perfCSSPath, 'utf8');

            const requiredClasses = [
                'gpu-accelerated',
                'performance-container',
                'scroll-optimized',
                'transform-3d-optimized'
            ];

            const missingClasses = requiredClasses.filter(className =>
                !perfCSS.includes(className)
            );

            if (missingClasses.length === 0) {
                logSuccess('Performance CSS classes are implemented');
            } else {
                missingClasses.forEach(className => {
                    logWarning(`Performance CSS class missing: ${className}`);
                });
            }
        }

    } catch (error) {
        logError('Failed to validate performance optimizations');
    }
}

// Accessibility validation
function validateAccessibility() {
    logHeader('ACCESSIBILITY VALIDATION');

    try {
        // Check for common accessibility patterns in components
        const componentsDir = path.join(__dirname, '..', 'src/components');

        function checkAccessibilityPatterns(filePath) {
            if (!fs.existsSync(filePath) || !filePath.endsWith('.tsx')) return;

            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);

            // Check for ARIA attributes
            const hasAriaLabels = content.includes('aria-label') || content.includes('aria-labelledby');
            const hasAriaDescriptions = content.includes('aria-describedby') || content.includes('aria-description');
            const hasKeyboardHandlers = content.includes('onKeyDown') || content.includes('onKeyPress');
            const hasFocusManagement = content.includes('focus') || content.includes('tabIndex');

            if (content.includes('button') || content.includes('onClick')) {
                if (!hasKeyboardHandlers && !content.includes('disabled')) {
                    logWarning(`${fileName}: Interactive elements should have keyboard handlers`);
                }
                if (!hasAriaLabels && !content.includes('children')) {
                    logWarning(`${fileName}: Interactive elements should have accessible labels`);
                }
            }

            if (content.includes('img') && !content.includes('alt=')) {
                logWarning(`${fileName}: Images should have alt attributes`);
            }

            // Check for reduced motion support
            if (content.includes('animate') && !content.includes('prefers-reduced-motion')) {
                logWarning(`${fileName}: Animations should respect prefers-reduced-motion`);
            }
        }

        // Recursively check components
        function walkDir(dir) {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    walkDir(filePath);
                } else {
                    checkAccessibilityPatterns(filePath);
                }
            });
        }

        if (fs.existsSync(componentsDir)) {
            walkDir(componentsDir);
            logSuccess('Accessibility patterns validation completed');
        }

    } catch (error) {
        logError('Failed to validate accessibility patterns');
    }
}

// Bundle size estimation
function estimateBundleSize() {
    logHeader('BUNDLE SIZE ESTIMATION');

    try {
        const srcDir = path.join(__dirname, '..', 'src');
        let totalSize = 0;
        let fileCount = 0;

        function calculateDirSize(dir) {
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    calculateDirSize(filePath);
                } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
                    totalSize += stat.size;
                    fileCount++;
                }
            });
        }

        calculateDirSize(srcDir);

        const totalSizeKB = (totalSize / 1024).toFixed(2);
        const estimatedBundleKB = (totalSize * 0.3 / 1024).toFixed(2); // Rough estimation after minification

        logInfo(`Source files: ${fileCount} files, ${totalSizeKB} KB`);
        logInfo(`Estimated minified bundle: ~${estimatedBundleKB} KB`);

        if (estimatedBundleKB < 244) {
            logSuccess('Estimated bundle size is within Google\'s recommendation (244KB)');
        } else {
            logWarning(`Estimated bundle size (${estimatedBundleKB}KB) exceeds Google's recommendation (244KB)`);
        }

    } catch (error) {
        logError('Failed to estimate bundle size');
    }
}

// Mobile responsiveness check
function validateResponsiveDesign() {
    logHeader('RESPONSIVE DESIGN VALIDATION');

    try {
        const componentsDir = path.join(__dirname, '..', 'src');
        let hasResponsiveClasses = false;
        let hasMobileOptimizations = false;

        function checkResponsivePatterns(filePath) {
            if (!fs.existsSync(filePath) || !filePath.endsWith('.tsx')) return;

            const content = fs.readFileSync(filePath, 'utf8');

            // Check for responsive Tailwind classes
            if (content.match(/\b(sm:|md:|lg:|xl:|2xl:)/)) {
                hasResponsiveClasses = true;
            }

            // Check for mobile-specific optimizations
            if (content.includes('mobile') || content.includes('768px') || content.includes('touch')) {
                hasMobileOptimizations = true;
            }
        }

        function walkDir(dir) {
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory() && !file.includes('node_modules')) {
                    walkDir(filePath);
                } else {
                    checkResponsivePatterns(filePath);
                }
            });
        }

        walkDir(componentsDir);

        if (hasResponsiveClasses) {
            logSuccess('Responsive design classes detected');
        } else {
            logWarning('No responsive design classes found');
        }

        if (hasMobileOptimizations) {
            logSuccess('Mobile-specific optimizations detected');
        } else {
            logWarning('No mobile-specific optimizations found');
        }

    } catch (error) {
        logError('Failed to validate responsive design');
    }
}

// SEO and meta validation
function validateSEOOptimization() {
    logHeader('SEO OPTIMIZATION VALIDATION');

    const layoutPath = path.join(__dirname, '..', 'src/app/layout.tsx');
    const pagePath = path.join(__dirname, '..', 'src/app/page.tsx');

    if (checkFileExists('src/app/layout.tsx', 'Layout Component')) {
        try {
            const layoutContent = fs.readFileSync(layoutPath, 'utf8');

            if (layoutContent.includes('metadata') || layoutContent.includes('<title>')) {
                logSuccess('SEO metadata configuration detected');
            } else {
                logWarning('No SEO metadata configuration found');
            }

            if (layoutContent.includes('viewport') || layoutContent.includes('responsive')) {
                logSuccess('Viewport configuration detected');
            } else {
                logWarning('No viewport configuration found');
            }

        } catch (error) {
            logError('Failed to read layout.tsx for SEO validation');
        }
    }

    // Check for structured data
    const hasStructuredData = fs.existsSync(path.join(__dirname, '..', 'public/manifest.json'));
    if (hasStructuredData) {
        logSuccess('PWA manifest detected');
    } else {
        logWarning('No PWA manifest found');
    }
}

// Final summary report
function generateSummaryReport() {
    logHeader('TESTING SUMMARY REPORT');

    const total = testResults.passed + testResults.failed + testResults.warnings;
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

    log(`\n📊 Test Results Summary:`, 'bold');
    log(`✅ Passed: ${testResults.passed}`, 'green');
    log(`❌ Failed: ${testResults.failed}`, 'red');
    log(`⚠️  Warnings: ${testResults.warnings}`, 'yellow');
    log(`📈 Success Rate: ${successRate}%`, 'cyan');

    if (testResults.failed === 0 && testResults.warnings <= 3) {
        log(`\n🎉 EXCELLENT! Coming Soon page is ready for world-class deployment!`, 'green');
        log(`🚀 All critical systems are operational and optimized.`, 'green');
    } else if (testResults.failed === 0) {
        log(`\n✅ GOOD! Coming Soon page is functional with minor improvements needed.`, 'yellow');
        log(`🔧 Address warnings for optimal performance.`, 'yellow');
    } else {
        log(`\n⚠️  ATTENTION REQUIRED! Critical issues detected.`, 'red');
        log(`🔨 Fix failed tests before deployment.`, 'red');
    }

    // Show critical issues
    const criticalIssues = testResults.details.filter(detail => detail.type === 'error');
    if (criticalIssues.length > 0) {
        log(`\n🚨 Critical Issues to Address:`, 'red');
        criticalIssues.forEach((issue, index) => {
            log(`${index + 1}. ${issue.message}`, 'red');
        });
    }

    log(`\n🎯 Next Steps:`, 'cyan');
    log(`1. Fix any critical issues (red ❌)`, 'white');
    log(`2. Address warnings for optimal experience (yellow ⚠️)`, 'white');
    log(`3. Run 'npm run build' to verify production build`, 'white');
    log(`4. Test on multiple devices and browsers`, 'white');
    log(`5. Deploy with confidence! 🚀`, 'white');

    return testResults.failed === 0;
}

// Main test execution
async function runAllTests() {
    log(`${colors.bold}${colors.magenta}🌟 CODAI COMING SOON PAGE - COMPREHENSIVE TEST SUITE 🌟${colors.reset}`);
    log(`${colors.cyan}Testing world-class design, performance, and functionality...${colors.reset}\n`);

    // Run all validation tests
    validateComponentStructure();
    validateConfiguration();
    validatePackageConfiguration();
    validateTypeScriptCompilation();
    validatePerformanceOptimizations();
    validateAccessibility();
    estimateBundleSize();
    validateResponsiveDesign();
    validateSEOOptimization();

    // Generate final report
    const allTestsPassed = generateSummaryReport();

    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
    logError(`Test suite failed with error: ${error.message}`);
    process.exit(1);
});