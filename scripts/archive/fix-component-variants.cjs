#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING COMPONENT VARIANT CONFLICTS');
console.log('====================================');

function fixBadgeVariants(content) {
    // Replace destructive with error
    content = content.replace(/variant="destructive"/g, 'variant="error"');
    content = content.replace(/variant={[^}]*destructive[^}]*}/g, match => {
        return match.replace(/destructive/g, 'error');
    });

    // Replace secondary with default for badges
    content = content.replace(/Badge.*variant="secondary"/g, 'Badge variant="default"');
    content = content.replace(/variant={[^}]*secondary[^}]*}/g, match => {
        if (match.includes('Badge')) {
            return match.replace(/secondary/g, 'default');
        }
        return match;
    });

    return content;
}

function fixButtonVariants(content) {
    // Replace default with primary for buttons
    content = content.replace(/Button.*variant="default"/g, 'Button variant="primary"');

    return content;
}

function fixComponent(filePath) {
    if (!fs.existsSync(filePath)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = fixBadgeVariants(content);
        content = fixButtonVariants(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed variants in ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
}

// Fix the component files
const componentFiles = [
    'services/bancai/components/investment/PortfolioManager.tsx',
    'services/bancai/components/trading/TradingInterface.tsx',
    'services/bancai/components/risk/RiskManagement.tsx'
];

for (const file of componentFiles) {
    const fullPath = path.join(process.cwd(), file);
    fixComponent(fullPath);
}

console.log('🎖️ VARIANT FIXES COMPLETE');
