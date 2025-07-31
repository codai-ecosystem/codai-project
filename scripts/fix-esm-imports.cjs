const fs = require('fs');
const path = require('path');

function fixEsmImports(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory() && item !== 'node_modules') {
      fixEsmImports(itemPath);
    } else if (item.endsWith('.js')) {
      let content = fs.readFileSync(itemPath, 'utf8');

      // Fix relative imports - add /index.js to directory imports
      content = content.replace(
        /from '\.\.?\/([^']*)'(?=;|\s)/g,
        (match, importPath) => {
          // If the import doesn't end with .js and doesn't include a file extension, add /index.js
          if (!importPath.endsWith('.js') && !importPath.includes('.') && !importPath.includes('/')) {
            return match.replace(`'${importPath}'`, `'${importPath}/index.js'`);
          }
          return match;
        }
      );

      // Fix export statements
      content = content.replace(
        /export \* from '\.\.?\/([^']*)'(?=;|\s)/g,
        (match, importPath) => {
          // If the export doesn't end with .js and doesn't include a file extension, add /index.js
          if (!importPath.endsWith('.js') && !importPath.includes('.') && !importPath.includes('/')) {
            return match.replace(`'${importPath}'`, `'${importPath}/index.js'`);
          }
          return match;
        }
      );

      fs.writeFileSync(itemPath, content);
      console.log(`Fixed: ${itemPath}`);
    }
  }
}

const esmDir = path.join(__dirname, '..', 'packages', 'sdk', 'dist', 'esm');
console.log(`Fixing ES module imports in: ${esmDir}`);
fixEsmImports(esmDir);
console.log('ES module imports fixed!');
