#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 SIMPLIFYING COMPLEX COMPONENTS');
console.log('=================================');

function simplifyComponent(filePath) {
    if (!fs.existsSync(filePath)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace Select components with simple HTML selects
        content = content.replace(
            /<Select[^>]*value={([^}]+)}[^>]*onValueChange={([^}]+)}[^>]*>([\s\S]*?)<\/Select>/g,
            (match, value, onChange, children) => {
                // Extract options from SelectItem components
                const optionMatches = children.match(/<SelectItem[^>]*value="([^"]*)"[^>]*>([^<]*)<\/SelectItem>/g);
                const options = optionMatches ? optionMatches.map(option => {
                    const valueMatch = option.match(/value="([^"]*)"/);
                    const textMatch = option.match(/>([^<]*)<\/SelectItem>/);
                    return `<option value="${valueMatch ? valueMatch[1] : ''}">${textMatch ? textMatch[1] : ''}</option>`;
                }).join('\n            ') : '';

                return `<select 
            value={${value}} 
            onChange={(e) => ${onChange}(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            ${options}
          </select>`;
            }
        );

        // Remove import statements for Select components
        content = content.replace(/import.*{[^}]*Select[^}]*}.*from[^;]*;?\n?/g, '');

        // Replace Tabs components with simple div-based tabs
        content = content.replace(
            /<Tabs[^>]*value={([^}]+)}[^>]*onValueChange={([^}]+)}[^>]*>/g,
            '<div>'
        );
        content = content.replace(/<\/Tabs>/g, '</div>');

        content = content.replace(
            /<TabsList[^>]*>/g,
            '<div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">'
        );
        content = content.replace(/<\/TabsList>/g, '</div>');

        content = content.replace(
            /<TabsTrigger[^>]*value="([^"]*)"[^>]*>/g,
            '<button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium" onClick={() => setActiveTab("$1")}>'
        );
        content = content.replace(/<\/TabsTrigger>/g, '</button>');

        content = content.replace(
            /<TabsContent[^>]*value="([^"]*)"[^>]*>/g,
            '<div className={activeTab === "$1" ? "block" : "hidden"}>'
        );
        content = content.replace(/<\/TabsContent>/g, '</div>');

        // Remove import statements for Tabs components
        content = content.replace(/import.*{[^}]*Tab[^}]*}.*from[^;]*;?\n?/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Simplified components in ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`  ❌ Error simplifying ${filePath}:`, error.message);
    }
}

// Fix the component files
const componentFiles = [
    'services/bancai/components/options/OptionsTrading.tsx'
];

for (const file of componentFiles) {
    const fullPath = path.join(process.cwd(), file);
    simplifyComponent(fullPath);
}

console.log('🎖️ COMPONENT SIMPLIFICATION COMPLETE');
