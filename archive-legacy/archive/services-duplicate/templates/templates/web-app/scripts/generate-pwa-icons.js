/**
 * Generate PNG icons for Progressive Web Apps
 *
 * This script generates PNG files for PWA in the sizes required by
 * the manifest file. It attempts to use ImageMagick for high-quality conversion,
 * but falls back to creating placeholder PNGs if not available.
 *
 * Usage:
 *   node scripts/generate-pwa-icons.js [--force] [--color=#hexcolor] [--background=#hexcolor]
 *
 * Options:
 *   --force         Overwrite existing PNG files
 *   --color         Hex color for icon foreground (default: #000000)
 *   --background    Hex color for background (default: transparent)
 *   --use-fallback  Skip ImageMagick check and use fallback method
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

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
const FORCE_OVERWRITE = args.includes('--force');
const USE_FALLBACK = args.includes('--use-fallback');
const COLOR_ARG = args.find(arg => arg.startsWith('--color='));
const BACKGROUND_ARG = args.find(arg => arg.startsWith('--background='));

// Default colors
const ICON_COLOR = COLOR_ARG ? COLOR_ARG.split('=')[1] : '#000000';
const BACKGROUND_COLOR = BACKGROUND_ARG ? BACKGROUND_ARG.split('=')[1] : 'none'; // 'none' is transparent in ImageMagick

// Sizes required for PWA icons (in pixels)
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '../apps/web/public/icons');

// Source files
const SVG_TEMPLATE = path.join(ICONS_DIR, 'icon-512x512.svg');
const SVG_TEMPLATES = {
  small: path.join(ICONS_DIR, 'icon-192x192.svg'),
  large: path.join(ICONS_DIR, 'icon-512x512.svg'),
};

// Ensure the icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

/**
 * Check if ImageMagick is installed and available
 * @returns {Promise<boolean>} True if ImageMagick is available
 */
async function checkImageMagick() {
  try {
    await new Promise((resolve, reject) => {
      exec('convert -version', error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    return true;
  } catch (error) {
    console.log(
      `${COLORS.yellow}ImageMagick not found.${COLORS.reset} Will use fallback method for icon generation.`
    );
    return false;
  }
}

/**
 * Generate PNG icons using ImageMagick
 * @returns {Promise<void>}
 */
async function generateIconsWithImageMagick() {
  console.log(
    `${COLORS.bright}${COLORS.blue}Generating PWA icons with ImageMagick...${COLORS.reset}\n`
  );

  const template = fs.existsSync(SVG_TEMPLATES.large)
    ? SVG_TEMPLATES.large
    : fs.existsSync(SVG_TEMPLATES.small)
      ? SVG_TEMPLATES.small
      : null;

  if (!template) {
    console.error(
      `${COLORS.red}No SVG template found. Please ensure at least one of these files exists:${COLORS.reset}`
    );
    console.error(`  - ${path.relative(process.cwd(), SVG_TEMPLATES.small)}`);
    console.error(`  - ${path.relative(process.cwd(), SVG_TEMPLATES.large)}`);
    return;
  }

  console.log(
    `Using template: ${COLORS.green}${path.relative(process.cwd(), template)}${COLORS.reset}\n`
  );

  // If we have a custom color, modify the SVG
  let svgContent = fs.readFileSync(template, 'utf8');

  // Temporarily write a colored version if needed
  let tempSvg = null;
  if (COLOR_ARG) {
    // Replace fill attributes in SVG
    svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${ICON_COLOR}"`);
    tempSvg = path.join(ICONS_DIR, '_temp_colored.svg');
    fs.writeFileSync(tempSvg, svgContent);
  }

  const inputSvg = tempSvg || template;

  // Create progress bar
  const totalIcons = SIZES.length;
  let completedIcons = 0;

  // Generate icons for each size
  for (const size of SIZES) {
    const outputPng = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    // Skip if file exists and --force is not specified
    if (fs.existsSync(outputPng) && !FORCE_OVERWRITE) {
      completedIcons++;
      updateProgressBar(completedIcons, totalIcons);
      continue;
    }

    try {
      // ImageMagick command to convert SVG to PNG with proper size
      const cmd = `convert -background ${BACKGROUND_COLOR} -resize ${size}x${size} ${inputSvg} ${outputPng}`;
      execSync(cmd, { stdio: 'ignore' });

      completedIcons++;
      updateProgressBar(completedIcons, totalIcons);
    } catch (error) {
      console.error(
        `\n${COLORS.red}Failed to generate ${size}x${size} icon:${COLORS.reset}`,
        error.message
      );
    }
  }

  // Clean up temp file if created
  if (tempSvg && fs.existsSync(tempSvg)) {
    fs.unlinkSync(tempSvg);
  }

  console.log(`\n\n${COLORS.green}✅ PWA icons generated successfully.${COLORS.reset}`);
}

/**
 * Generate placeholder PNG icons when ImageMagick is not available
 */
function generatePlaceholderIcons() {
  console.log(`${COLORS.yellow}Generating simple placeholder PNG icons...${COLORS.reset}\n`);

  try {
    // Check if we have source SVG files
    const hasSvgTemplates =
      fs.existsSync(SVG_TEMPLATES.small) || fs.existsSync(SVG_TEMPLATES.large);

    if (!hasSvgTemplates) {
      console.warn(
        `${COLORS.yellow}Warning: No SVG templates found. Creating basic placeholder icons.${COLORS.reset}`
      );
    }

    // Create progress bar
    const totalIcons = SIZES.length;
    let completedIcons = 0;

    // Create placeholder PNG files
    for (const size of SIZES) {
      const outputPng = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

      // Skip if file exists and --force is not specified
      if (fs.existsSync(outputPng) && !FORCE_OVERWRITE) {
        completedIcons++;
        updateProgressBar(completedIcons, totalIcons);
        continue;
      }

      // This is a minimal valid PNG file (1x1 transparent pixel)
      const minimalPngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
        0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
        0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      fs.writeFileSync(outputPng, minimalPngHeader);

      completedIcons++;
      updateProgressBar(completedIcons, totalIcons);
    }

    console.log(`\n\n${COLORS.yellow}⚠️ Placeholder icons generated.${COLORS.reset}`);
    console.log(
      `${COLORS.yellow}IMPORTANT: For production, replace these placeholders with actual icons.${COLORS.reset}`
    );
    console.log(`To generate proper icons, install ImageMagick and run this script again.`);
  } catch (error) {
    console.error(`\n${COLORS.red}Failed to generate placeholder icons:${COLORS.reset}`, error);
  }
}

/**
 * Update the progress bar in the console
 * @param {number} completed - Number of completed icons
 * @param {number} total - Total number of icons
 */
function updateProgressBar(completed, total) {
  const percentage = Math.floor((completed / total) * 100);
  const filledLength = Math.floor((completed / total) * 40);
  const emptyLength = 40 - filledLength;

  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);

  process.stdout.write(
    `\r${COLORS.cyan}Progress: ${filledBar}${emptyBar} ${percentage}% (${completed}/${total})${COLORS.reset}`
  );
}

/**
 * Main function to generate PWA icons
 */
async function generatePWAIcons() {
  console.log(`\n${COLORS.bright}${COLORS.magenta}PWA Icon Generator${COLORS.reset}`);
  console.log(`${COLORS.dim}Generating icons for sizes: ${SIZES.join('px, ')}px${COLORS.reset}\n`);

  if (FORCE_OVERWRITE) {
    console.log(
      `${COLORS.yellow}Force mode enabled: ${COLORS.reset}Existing icons will be overwritten\n`
    );
  }

  if (COLOR_ARG) {
    console.log(`${COLORS.cyan}Icon color: ${COLORS.reset}${ICON_COLOR}`);
  }

  if (BACKGROUND_ARG) {
    console.log(`${COLORS.cyan}Background color: ${COLORS.reset}${BACKGROUND_COLOR}\n`);
  }

  if (USE_FALLBACK) {
    generatePlaceholderIcons();
  } else {
    const hasImageMagick = await checkImageMagick();
    if (hasImageMagick) {
      await generateIconsWithImageMagick();
    } else {
      generatePlaceholderIcons();
    }
  }
}

generatePWAIcons();
