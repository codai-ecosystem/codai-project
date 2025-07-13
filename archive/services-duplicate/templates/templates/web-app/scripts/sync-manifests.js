/**
 * Synchronize manifest.json with site.webmanifest
 *
 * This script ensures that both manifest files have the same content,
 * as some browsers look for manifest.json while others expect site.webmanifest.
 * It also validates the manifest content against PWA requirements.
 *
 * Usage:
 *   node scripts/sync-manifests.js [--validate-only] [--create-missing]
 *
 * Options:
 *   --validate-only    Only validate manifests without syncing
 *   --create-missing   Create missing manifest files
 *   --fix              Fix common issues in manifest files
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

// Parse command line arguments
const args = process.argv.slice(2);
const VALIDATE_ONLY = args.includes('--validate-only');
const CREATE_MISSING = args.includes('--create-missing');
const FIX_ISSUES = args.includes('--fix');

// Paths to manifest files
const WEB_PUBLIC_DIR = path.join(__dirname, '../apps/web/public');
const MANIFEST_JSON = path.join(WEB_PUBLIC_DIR, 'manifest.json');
const SITE_WEBMANIFEST = path.join(WEB_PUBLIC_DIR, 'site.webmanifest');

// Default manifest template
const DEFAULT_MANIFEST = {
  name: 'METU Template',
  short_name: 'METU',
  description: 'Modern Next.js 15 template with Firebase integration',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#000000',
  orientation: 'portrait-primary',
  scope: '/',
  lang: 'en',
  categories: ['productivity', 'business'],
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable any',
    },
  ],
};

/**
 * Validate the manifest content against PWA requirements
 * @param {Object} manifest - The manifest object to validate
 * @returns {Object} Validation result with errors and warnings
 */
function validateManifest(manifest) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    fixes: [],
  };

  // Required fields
  const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      result.valid = false;
      result.errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate icons
  if (manifest.icons && Array.isArray(manifest.icons)) {
    const iconSizes = manifest.icons.map(icon => icon.sizes);

    // Check for minimum icon sizes
    const requiredSizes = ['192x192', '512x512'];
    for (const size of requiredSizes) {
      if (!iconSizes.includes(size)) {
        result.valid = false;
        result.errors.push(`Missing required icon size: ${size}`);
      }
    }

    // Check icon formats
    const hasPngIcons = manifest.icons.some(icon => icon.type === 'image/png');
    if (!hasPngIcons) {
      result.valid = false;
      result.errors.push('No PNG icons found. At least one icon should be in PNG format.');
    }

    // Check for maskable icons
    const hasMaskableIcons = manifest.icons.some(
      icon => icon.purpose && icon.purpose.includes('maskable')
    );
    if (!hasMaskableIcons) {
      result.warnings.push(
        'No maskable icons found. Consider adding purpose: "maskable any" to your icons.'
      );
      if (FIX_ISSUES) {
        result.fixes.push('Adding "maskable any" purpose to icons');
        manifest.icons = manifest.icons.map(icon => ({
          ...icon,
          purpose: 'maskable any',
        }));
      }
    }
  }

  // Check display mode (standalone or fullscreen recommended)
  const recommendedDisplayModes = ['standalone', 'fullscreen'];
  if (!recommendedDisplayModes.includes(manifest.display)) {
    result.warnings.push(
      `Display mode "${manifest.display}" is not optimal for PWA. Consider using "standalone" or "fullscreen".`
    );
    if (FIX_ISSUES) {
      result.fixes.push('Setting display mode to "standalone"');
      manifest.display = 'standalone';
    }
  }

  // Check colors
  if (!manifest.background_color) {
    result.warnings.push('Missing background_color');
    if (FIX_ISSUES) {
      result.fixes.push('Setting background_color to #ffffff');
      manifest.background_color = '#ffffff';
    }
  }

  if (!manifest.theme_color) {
    result.warnings.push('Missing theme_color');
    if (FIX_ISSUES) {
      result.fixes.push('Setting theme_color to #000000');
      manifest.theme_color = '#000000';
    }
  }

  return { result, manifest };
}

/**
 * Synchronize manifest.json and site.webmanifest files
 */
function syncManifestFiles() {
  console.log(`\n${COLORS.bright}${COLORS.magenta}PWA Manifest Synchronizer${COLORS.reset}\n`);

  try {
    // Check if both files exist
    const manifestExists = fs.existsSync(MANIFEST_JSON);
    const webmanifestExists = fs.existsSync(SITE_WEBMANIFEST);

    if (!manifestExists && !webmanifestExists) {
      console.error(
        `${COLORS.red}Neither manifest.json nor site.webmanifest files found.${COLORS.reset}`
      );

      if (CREATE_MISSING) {
        console.log(`${COLORS.yellow}Creating default manifest files...${COLORS.reset}`);
        const defaultContent = JSON.stringify(DEFAULT_MANIFEST, null, 2);
        fs.writeFileSync(MANIFEST_JSON, defaultContent);
        fs.writeFileSync(SITE_WEBMANIFEST, defaultContent);
        console.log(`${COLORS.green}✅ Created default manifest files${COLORS.reset}`);
        return;
      } else {
        console.log(
          `${COLORS.yellow}Use --create-missing flag to create default manifest files${COLORS.reset}`
        );
        process.exit(1);
      }
    }

    // Determine which file to use as the source
    let sourceFile, targetFile, manifestContent;

    if (manifestExists && webmanifestExists) {
      // Both files exist, check which is newer
      const manifestStats = fs.statSync(MANIFEST_JSON);
      const webmanifestStats = fs.statSync(SITE_WEBMANIFEST);

      if (manifestStats.mtimeMs > webmanifestStats.mtimeMs) {
        sourceFile = MANIFEST_JSON;
        targetFile = SITE_WEBMANIFEST;
        console.log(`${COLORS.cyan}Using manifest.json as the source (newer)${COLORS.reset}`);
      } else {
        sourceFile = SITE_WEBMANIFEST;
        targetFile = MANIFEST_JSON;
        console.log(`${COLORS.cyan}Using site.webmanifest as the source (newer)${COLORS.reset}`);
      }
    } else if (manifestExists) {
      sourceFile = MANIFEST_JSON;
      targetFile = SITE_WEBMANIFEST;
      console.log(`${COLORS.cyan}Using manifest.json as the source${COLORS.reset}`);
    } else {
      sourceFile = SITE_WEBMANIFEST;
      targetFile = MANIFEST_JSON;
      console.log(`${COLORS.cyan}Using site.webmanifest as the source${COLORS.reset}`);
    }

    // Read source content
    const sourceContent = fs.readFileSync(sourceFile, 'utf8');

    // Parse and validate
    let contentObject;
    try {
      contentObject = JSON.parse(sourceContent);
    } catch (error) {
      console.error(
        `${COLORS.red}Error parsing ${path.basename(sourceFile)}:${COLORS.reset}`,
        error.message
      );
      return;
    }

    // Validate the manifest
    const { result, manifest } = validateManifest(contentObject);
    contentObject = manifest; // Use potentially fixed manifest

    // Display validation results
    if (!result.valid) {
      console.log(`${COLORS.red}⚠️ Manifest validation failed with errors:${COLORS.reset}`);
      result.errors.forEach(error => console.log(`  ${COLORS.red}• ${error}${COLORS.reset}`));
    } else {
      console.log(`${COLORS.green}✓ Manifest passes essential validation${COLORS.reset}`);
    }

    if (result.warnings.length > 0) {
      console.log(`${COLORS.yellow}⚠️ Warnings:${COLORS.reset}`);
      result.warnings.forEach(warning =>
        console.log(`  ${COLORS.yellow}• ${warning}${COLORS.reset}`)
      );
    }

    if (result.fixes.length > 0) {
      console.log(`${COLORS.green}✓ Applied fixes:${COLORS.reset}`);
      result.fixes.forEach(fix => console.log(`  ${COLORS.green}• ${fix}${COLORS.reset}`));
    }

    if (VALIDATE_ONLY) {
      console.log(`${COLORS.blue}Validation only mode - not syncing files${COLORS.reset}`);
      return;
    }

    // Format and write the content
    const formattedContent = JSON.stringify(contentObject, null, 2);

    // Write to both files to ensure they're identical
    fs.writeFileSync(MANIFEST_JSON, formattedContent);
    fs.writeFileSync(SITE_WEBMANIFEST, formattedContent);

    console.log(`\n${COLORS.green}✅ Successfully synchronized manifest files${COLORS.reset}`);
    console.log(`  • ${MANIFEST_JSON.replace(process.cwd(), '')}`);
    console.log(`  • ${SITE_WEBMANIFEST.replace(process.cwd(), '')}`);
  } catch (error) {
    console.error(`\n${COLORS.red}Failed to synchronize manifest files:${COLORS.reset}`, error);
    process.exit(1);
  }
}

syncManifestFiles();
