import { readFile, writeFile } from 'fs/promises';

async function fixChalkReferences() {
    const filePath = 'scripts/test-infrastructure.js';
    let content = await readFile(filePath, 'utf8');

    // Replace all chalk references
    content = content.replace(/chalk\.red/g, 'colors.red');
    content = content.replace(/chalk\.blue/g, 'colors.blue');
    content = content.replace(/chalk\.green/g, 'colors.green');
    content = content.replace(/chalk\.yellow/g, 'colors.yellow');
    content = content.replace(/chalk\.orange/g, 'colors.yellow');

    await writeFile(filePath, content, 'utf8');
    console.log('Fixed all chalk references');
}

fixChalkReferences().catch(console.error);
