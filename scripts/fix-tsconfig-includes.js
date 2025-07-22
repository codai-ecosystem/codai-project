import { promises as fs } from 'fs';
import path from 'path';

const fixTsConfigIncludePaths = async () => {
    const packageDirs = [
        'packages',
        'libs'
    ];

    const fixes = [];

    for (const baseDir of packageDirs) {
        try {
            const dirs = await fs.readdir(baseDir);

            for (const dir of dirs) {
                const packagePath = path.join(baseDir, dir);
                const tsconfigPath = path.join(packagePath, 'tsconfig.json');

                try {
                    const content = await fs.readFile(tsconfigPath, 'utf8');
                    const hasWrongInclude = content.includes('"src*"') || content.includes('"locales*"');

                    if (hasWrongInclude) {
                        let newContent = content
                            .replace('"src*"', '"src/**/*"')
                            .replace('"locales*"', '"locales/**/*"');

                        await fs.writeFile(tsconfigPath, newContent);
                        fixes.push(`Fixed ${tsconfigPath}`);
                    }
                } catch (e) {
                    // Skip if no tsconfig.json
                }
            }
        } catch (e) {
            // Skip if directory doesn't exist
        }
    }

    console.log(`Fixed ${fixes.length} tsconfig files:`);
    fixes.forEach(fix => console.log(`  - ${fix}`));
};

fixTsConfigIncludePaths().catch(console.error);
