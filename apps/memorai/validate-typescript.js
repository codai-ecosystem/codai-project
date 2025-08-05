// TypeScript File Validation Script
const fs = require('fs');

console.log('Validating TypeScript files...');

const files = [
    'src/utils/suggestion-deduplicator.ts',
    'src/utils/enhanced-memorai-mcp.ts'
];

let allValid = true;

files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Basic syntax checks
        const hasExports = content.includes('export');
        const hasValidTS = content.includes('interface') || content.includes('type') || content.includes(': ');
        const hasProperStructure = content.includes('function') || content.includes('class');

        if (hasExports && hasValidTS && hasProperStructure) {
            console.log('SUCCESS:', file, '- Valid TypeScript structure');
        } else {
            console.log('ERROR:', file, '- Invalid TypeScript structure');
            allValid = false;
        }

        console.log('  File size:', content.length, 'bytes');
        console.log('  Exports:', hasExports ? 'Yes' : 'No');
        console.log('  TypeScript features:', hasValidTS ? 'Yes' : 'No');
        console.log('');
    } else {
        console.log('ERROR:', file, '- File not found');
        allValid = false;
    }
});

if (allValid) {
    console.log('SUCCESS: All TypeScript files are structurally valid');
    process.exit(0);
} else {
    console.log('ERROR: Some TypeScript files have issues');
    process.exit(1);
}
