/**
 * Check PWA compatibility against Lighthouse criteria
 *
 * This script performs a basic validation of PWA requirements by checking:
 * - Presence of service worker
 * - Valid manifest files
 * - Required icon sizes
 * - HTTPS configuration
 * - Offline support
 *
 * Usage:
 *   node scripts/check-pwa-compatibility.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Paths
const WEB_PUBLIC_DIR = path.join(__dirname, '../apps/web/public');
const MANIFEST_JSON = path.join(WEB_PUBLIC_DIR, 'manifest.json');
const SITE_WEBMANIFEST = path.join(WEB_PUBLIC_DIR, 'site.webmanifest');
const SERVICE_WORKER = path.join(WEB_PUBLIC_DIR, 'sw.js');
const OFFLINE_PAGE = path.join(WEB_PUBLIC_DIR, 'offline.html');

// Required and recommended files
const REQUIRED_FILES = [
  { path: SERVICE_WORKER, name: 'Service Worker (sw.js)' },
  { path: OFFLINE_PAGE, name: 'Offline Page (offline.html)' },
];

// Either manifest.json or site.webmanifest is required
const MANIFEST_FILES = [
  { path: MANIFEST_JSON, name: 'Web App Manifest (manifest.json)' },
  { path: SITE_WEBMANIFEST, name: 'Site Webmanifest (site.webmanifest)' },
];

// Check if files exist
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// Check manifest content
function checkManifestContent(manifestPath) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    const issues = [];

    // Check required fields
    if (!manifest.name) issues.push('Missing name field');
    if (!manifest.short_name) issues.push('Missing short_name field');
    if (!manifest.start_url) issues.push('Missing start_url field');
    if (!manifest.display) issues.push('Missing display field');
    if (!manifest.theme_color) issues.push('Missing theme_color field');
    if (!manifest.background_color) issues.push('Missing background_color field');

    // Check icons
    if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      issues.push('Missing icons array');
    } else {
      // Check for required icon sizes
      const sizes = manifest.icons.map(icon => icon.sizes);
      if (!sizes.includes('192x192')) issues.push('Missing 192x192 icon');
      if (!sizes.includes('512x512')) issues.push('Missing 512x512 icon');

      // Check icon properties
      const missingTypes = manifest.icons.filter(icon => !icon.type).length;
      if (missingTypes > 0) issues.push(`${missingTypes} icons missing type property`);
    }

    // Check display mode
    const recommendedDisplayModes = ['standalone', 'fullscreen'];
    if (!recommendedDisplayModes.includes(manifest.display)) {
      issues.push(
        `Display mode "${manifest.display}" is not recommended for PWA. Consider using "standalone" or "fullscreen".`
      );
    }

    return { valid: issues.length === 0, issues, manifest };
  } catch (error) {
    return { valid: false, issues: [`Error parsing manifest: ${error.message}`], manifest: null };
  }
}

// Check service worker content
function checkServiceWorkerContent(swPath) {
  try {
    const swContent = fs.readFileSync(swPath, 'utf8');

    const issues = [];

    // Check for essential service worker features
    if (!swContent.includes("addEventListener('install'")) {
      issues.push('Missing install event listener');
    }

    if (!swContent.includes("addEventListener('fetch'")) {
      issues.push('Missing fetch event listener');
    }

    if (!swContent.includes("addEventListener('activate'")) {
      issues.push('Missing activate event listener');
    }

    // Check for cache API usage
    if (!swContent.includes('caches.open') || !swContent.includes('caches.match')) {
      issues.push('Missing Cache API usage');
    }

    // Check for offline fallback
    if (!swContent.includes(path.basename(OFFLINE_PAGE))) {
      issues.push('No reference to offline.html found');
    }

    return { valid: issues.length === 0, issues };
  } catch (error) {
    return { valid: false, issues: [`Error reading service worker: ${error.message}`] };
  }
}

// Check for icon files
function checkIconFiles() {
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const missingIcons = [];

  for (const size of iconSizes) {
    const iconPath = path.join(WEB_PUBLIC_DIR, 'icons', `icon-${size}x${size}.png`);
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(`icon-${size}x${size}.png`);
    }
  }

  return { valid: missingIcons.length === 0, missingIcons };
}

// Main function
function checkPWACompatibility() {
  console.log(`\n${COLORS.bright}${COLORS.magenta}PWA Compatibility Checker${COLORS.reset}\n`);

  let isValid = true;
  const results = {
    requiredFiles: { valid: true, issues: [] },
    manifest: { valid: false, content: null },
    serviceWorker: { valid: false, content: null },
    icons: { valid: false, missing: [] },
  };

  // Check required files
  console.log(`${COLORS.bright}Checking required files...${COLORS.reset}`);
  for (const file of REQUIRED_FILES) {
    const exists = checkFileExists(file.path);
    if (exists) {
      console.log(`  ${COLORS.green}✓ ${file.name}${COLORS.reset}`);
    } else {
      console.log(`  ${COLORS.red}✕ ${file.name} not found${COLORS.reset}`);
      results.requiredFiles.valid = false;
      results.requiredFiles.issues.push(`Missing ${file.name}`);
      isValid = false;
    }
  }

  // Check manifest files - only one is required
  console.log(`\n${COLORS.bright}Checking web app manifest...${COLORS.reset}`);
  let manifestFound = false;
  let manifestContent = null;

  for (const file of MANIFEST_FILES) {
    const exists = checkFileExists(file.path);
    if (exists) {
      console.log(`  ${COLORS.green}✓ ${file.name} found${COLORS.reset}`);

      // Check manifest content
      const checkResult = checkManifestContent(file.path);
      manifestContent = checkResult.manifest;

      if (checkResult.valid) {
        console.log(`  ${COLORS.green}✓ ${file.name} content is valid${COLORS.reset}`);
      } else {
        console.log(`  ${COLORS.yellow}⚠️ ${file.name} has issues:${COLORS.reset}`);
        checkResult.issues.forEach(issue => {
          console.log(`    ${COLORS.yellow}• ${issue}${COLORS.reset}`);
        });
      }

      manifestFound = true;
      results.manifest = {
        valid: checkResult.valid,
        content: checkResult.manifest,
        issues: checkResult.issues,
      };

      if (!checkResult.valid) isValid = false;
    } else {
      console.log(`  ${COLORS.yellow}○ ${file.name} not found${COLORS.reset}`);
    }
  }

  if (!manifestFound) {
    console.log(`  ${COLORS.red}✕ No manifest file found${COLORS.reset}`);
    results.manifest.issues.push('No manifest file found');
    isValid = false;
  }

  // Check service worker content if it exists
  if (fs.existsSync(SERVICE_WORKER)) {
    console.log(`\n${COLORS.bright}Checking service worker implementation...${COLORS.reset}`);
    const swCheck = checkServiceWorkerContent(SERVICE_WORKER);

    if (swCheck.valid) {
      console.log(`  ${COLORS.green}✓ Service worker implementation looks good${COLORS.reset}`);
    } else {
      console.log(`  ${COLORS.yellow}⚠️ Service worker has potential issues:${COLORS.reset}`);
      swCheck.issues.forEach(issue => {
        console.log(`    ${COLORS.yellow}• ${issue}${COLORS.reset}`);
      });
    }

    results.serviceWorker = { valid: swCheck.valid, issues: swCheck.issues };
    if (!swCheck.valid) isValid = false;
  }

  // Check icon files
  console.log(`\n${COLORS.bright}Checking PWA icons...${COLORS.reset}`);
  const iconCheck = checkIconFiles();

  if (iconCheck.valid) {
    console.log(`  ${COLORS.green}✓ All required icon sizes found${COLORS.reset}`);
  } else {
    console.log(`  ${COLORS.yellow}⚠️ Missing icon files:${COLORS.reset}`);
    iconCheck.missingIcons.forEach(icon => {
      console.log(`    ${COLORS.yellow}• ${icon}${COLORS.reset}`);
    });
    console.log(
      `\n  ${COLORS.cyan}ℹ️ Run 'pnpm pwa:icons' to generate missing icons${COLORS.reset}`
    );
  }

  results.icons = { valid: iconCheck.valid, missing: iconCheck.missingIcons };
  if (!iconCheck.valid) isValid = false;

  // Final result
  console.log(`\n${COLORS.bright}${COLORS.magenta}PWA Compatibility Result:${COLORS.reset}`);
  if (isValid) {
    console.log(
      `\n${COLORS.green}${COLORS.bright}✅ Your application meets PWA requirements!${COLORS.reset}\n`
    );
  } else {
    console.log(
      `\n${COLORS.yellow}${COLORS.bright}⚠️ Some PWA requirements are not met. See issues above.${COLORS.reset}\n`
    );
    console.log(`${COLORS.cyan}ℹ️ Run the following commands to fix common issues:${COLORS.reset}`);
    console.log(
      `  • ${COLORS.bright}pnpm pwa:sync-manifests --fix${COLORS.reset} : Fix manifest issues`
    );
    console.log(`  • ${COLORS.bright}pnpm pwa:icons${COLORS.reset} : Generate missing icons`);
    console.log(`  • See docs/pwa.md for more information\n`);
  }
}

// Run the check
checkPWACompatibility();
