// Main CLI exports for programmatic usage
export { createMemoryCommand } from './commands/create.js';
export { searchCommand } from './commands/search.js';
export { listCommand } from './commands/list.js';
export { deleteCommand } from './commands/delete.js';
export { configCommand } from './commands/config.js';
export { exportCommand } from './commands/export.js';
export { importCommand } from './commands/import.js';
export { statsCommand } from './commands/stats.js';
export { loginCommand } from './commands/auth.js';

// Utility exports
export { getClient, resetClient } from './utils/client.js';
export {
    formatError,
    formatSuccess,
    formatWarning,
    formatInfo,
    formatMemory,
    formatBytes,
    formatDuration
} from './utils/format.js';

// CLI version
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

export const version = packageJson.version;
