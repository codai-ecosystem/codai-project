#!/usr/bin/env node

/**
 * MemorAI Command Line Interface
 * Official CLI tool for managing memories from the command line
 */

const MemorAIClient = require('../clients/nodejs/memorai-client');
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const program = new Command();

// Configuration management
class Config {
  constructor() {
    this.configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.memorai', 'config.json');
    this.config = {};
  }

  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(data);
    } catch (error) {
      // Default config
      this.config = {
        baseURL: 'http://localhost:4006',
        apiKey: null,
        defaultLimit: 20,
        debug: false
      };
    }
  }

  async save() {
    const dir = path.dirname(this.configPath);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save config:'), error.message);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
  }
}

const config = new Config();

// Utility functions
function formatMemory(memory) {
  return {
    id: chalk.yellow(memory.id || 'N/A'),
    content: memory.content?.substring(0, 100) + (memory.content?.length > 100 ? '...' : ''),
    category: chalk.cyan(memory.category || 'uncategorized'),
    tags: memory.tags?.map(tag => chalk.green(`#${tag}`)).join(' ') || '',
    created: memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'Unknown'
  };
}

function displayMemory(memory, detailed = false) {
  const formatted = formatMemory(memory);

  if (detailed) {
    console.log(chalk.bold('\n📝 Memory Details:'));
    console.log(`${chalk.bold('ID:')} ${formatted.id}`);
    console.log(`${chalk.bold('Content:')} ${memory.content}`);
    console.log(`${chalk.bold('Category:')} ${formatted.category}`);
    console.log(`${chalk.bold('Tags:')} ${formatted.tags || 'None'}`);
    console.log(`${chalk.bold('Created:')} ${formatted.created}`);
    if (memory.metadata && Object.keys(memory.metadata).length > 0) {
      console.log(`${chalk.bold('Metadata:')} ${JSON.stringify(memory.metadata, null, 2)}`);
    }
  } else {
    console.log(`${formatted.id} | ${formatted.category} | ${formatted.content} | ${formatted.tags}`);
  }
}

async function createClient() {
  await config.load();

  return new MemorAIClient({
    baseURL: config.get('baseURL'),
    apiKey: config.get('apiKey'),
    debug: config.get('debug')
  });
}

// CLI Commands

// Configuration command
program
  .command('config')
  .description('Manage MemorAI CLI configuration')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-l, --list', 'List all configuration')
  .action(async (options) => {
    await config.load();

    if (options.set) {
      const [key, value] = options.set.split('=', 2);
      if (!key || value === undefined) {
        console.error(chalk.red('Invalid format. Use: key=value'));
        return;
      }

      config.set(key, value === 'true' ? true : value === 'false' ? false : value);
      await config.save();
      console.log(chalk.green(`✅ Set ${key} = ${value}`));
    }

    if (options.get) {
      const value = config.get(options.get);
      console.log(`${options.get}: ${value}`);
    }

    if (options.list) {
      console.log(chalk.bold('📋 Configuration:'));
      Object.entries(config.config).forEach(([key, value]) => {
        console.log(`  ${chalk.cyan(key)}: ${value}`);
      });
    }
  });

// Health check command
program
  .command('health')
  .description('Check MemorAI service health')
  .action(async () => {
    try {
      const client = await createClient();
      const health = await client.getHealth();

      console.log(chalk.green('✅ MemorAI Health Check'));
      console.log(`Status: ${chalk.bold(health.status)}`);
      console.log(`Version: ${health.version || 'Unknown'}`);
      if (health.uptime) {
        console.log(`Uptime: ${Math.floor(health.uptime / 1000)}s`);
      }

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Health check failed:'), error.message);
      process.exit(1);
    }
  });

// Create memory command
program
  .command('create')
  .description('Create a new memory')
  .option('-c, --content <content>', 'Memory content')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-g, --category <category>', 'Memory category')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (options) => {
    try {
      const client = await createClient();

      let memoryData = {};

      if (options.interactive || !options.content) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'content',
            message: 'Enter memory content:',
            default: options.content,
            validate: input => input.length > 0 || 'Content is required'
          },
          {
            type: 'input',
            name: 'category',
            message: 'Category (optional):',
            default: options.category || 'general'
          },
          {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma-separated, optional):',
            default: options.tags
          }
        ]);

        memoryData = {
          content: answers.content,
          category: answers.category,
          tags: answers.tags ? answers.tags.split(',').map(tag => tag.trim()) : []
        };
      } else {
        memoryData = {
          content: options.content,
          category: options.category || 'general',
          tags: options.tags ? options.tags.split(',').map(tag => tag.trim()) : []
        };
      }

      const memory = await client.createMemory(memoryData);

      console.log(chalk.green('✅ Memory created successfully!'));
      displayMemory(memory, true);

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Failed to create memory:'), error.message);
      process.exit(1);
    }
  });

// List memories command
program
  .command('list')
  .alias('ls')
  .description('List memories')
  .option('-l, --limit <number>', 'Number of memories to retrieve', config.get('defaultLimit') || 20)
  .option('-o, --offset <number>', 'Offset for pagination', 0)
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .action(async (options) => {
    try {
      const client = await createClient();

      const params = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset)
      };

      if (options.category) params.category = options.category;
      if (options.tags) params.tags = options.tags.split(',').map(tag => tag.trim());

      const result = await client.listMemories(params);
      const memories = result.memories || result;

      if (!memories || memories.length === 0) {
        console.log(chalk.yellow('📭 No memories found'));
        return;
      }

      console.log(chalk.bold(`📚 Found ${memories.length} memories:`));
      console.log(chalk.gray('ID | Category | Content | Tags'));
      console.log(chalk.gray('─'.repeat(80)));

      memories.forEach(memory => displayMemory(memory));

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Failed to list memories:'), error.message);
      process.exit(1);
    }
  });

// Search memories command
program
  .command('search <query>')
  .description('Search memories')
  .option('-a, --algorithm <algorithm>', 'Search algorithm (semantic, exact, fuzzy)', 'semantic')
  .option('-l, --limit <number>', 'Number of results', 20)
  .option('-t, --threshold <number>', 'Similarity threshold (0-1)', 0.5)
  .action(async (query, options) => {
    try {
      const client = await createClient();

      const searchOptions = {
        algorithm: options.algorithm,
        limit: parseInt(options.limit),
        threshold: parseFloat(options.threshold)
      };

      const result = await client.searchMemories(query, searchOptions);

      if (!result.memories || result.memories.length === 0) {
        console.log(chalk.yellow(`🔍 No results found for "${query}"`));
        return;
      }

      console.log(chalk.bold(`🔍 Found ${result.memories.length} results for "${query}":`));
      console.log(chalk.gray(`Algorithm: ${result.algorithm_used}, Query time: ${result.query_time}ms`));
      console.log(chalk.gray('─'.repeat(80)));

      result.memories.forEach(memory => displayMemory(memory));

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Search failed:'), error.message);
      process.exit(1);
    }
  });

// Get memory command
program
  .command('get <id>')
  .description('Get a specific memory by ID')
  .action(async (id) => {
    try {
      const client = await createClient();

      const memory = await client.getMemory(id);
      displayMemory(memory, true);

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Failed to get memory:'), error.message);
      process.exit(1);
    }
  });

// Delete memory command
program
  .command('delete <id>')
  .alias('rm')
  .description('Delete a memory')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id, options) => {
    try {
      const client = await createClient();

      if (!options.force) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete memory ${id}?`,
          default: false
        }]);

        if (!confirm) {
          console.log(chalk.yellow('🚫 Deletion cancelled'));
          return;
        }
      }

      await client.deleteMemory(id);
      console.log(chalk.green(`✅ Memory ${id} deleted successfully`));

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Failed to delete memory:'), error.message);
      process.exit(1);
    }
  });

// Analytics command
program
  .command('analytics')
  .alias('stats')
  .description('Show analytics and statistics')
  .action(async () => {
    try {
      const client = await createClient();

      try {
        const analytics = await client.getAnalytics();

        console.log(chalk.bold('📊 MemorAI Analytics:'));

        if (analytics.totalMemories !== undefined) {
          console.log(`Total Memories: ${chalk.yellow(analytics.totalMemories)}`);
        }

        if (analytics.categories) {
          console.log(`\n${chalk.bold('Categories:')}`);
          Object.entries(analytics.categories).forEach(([category, count]) => {
            console.log(`  ${chalk.cyan(category)}: ${count}`);
          });
        }

        if (analytics.searchStats) {
          console.log(`\n${chalk.bold('Search Statistics:')}`);
          console.log(`  Total Searches: ${analytics.searchStats.totalSearches || 0}`);
          if (analytics.searchStats.averageQueryTime) {
            console.log(`  Average Query Time: ${analytics.searchStats.averageQueryTime}ms`);
          }
        }

      } catch (analyticsError) {
        console.log(chalk.yellow('⚠️  Analytics not available'));
      }

      // Show performance metrics
      const metrics = client.getPerformanceMetrics();
      if (metrics.length > 0) {
        const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
        console.log(`\n${chalk.bold('Performance:')}`);
        console.log(`  Average Response Time: ${avgDuration.toFixed(2)}ms`);
        console.log(`  Total Requests: ${metrics.length}`);
      }

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Failed to get analytics:'), error.message);
      process.exit(1);
    }
  });

// Export/Import commands
program
  .command('export [file]')
  .description('Export memories to JSON file')
  .option('-c, --category <category>', 'Export specific category')
  .action(async (file, options) => {
    try {
      const client = await createClient();

      const params = { limit: 1000 }; // Export more records
      if (options.category) params.category = options.category;

      const result = await client.listMemories(params);
      const memories = result.memories || result;

      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        memories: memories
      };

      const filename = file || `memorai-export-${Date.now()}.json`;
      await fs.writeFile(filename, JSON.stringify(exportData, null, 2));

      console.log(chalk.green(`✅ Exported ${memories.length} memories to ${filename}`));

      client.close();
    } catch (error) {
      console.error(chalk.red('❌ Export failed:'), error.message);
      process.exit(1);
    }
  });

// Program setup
program
  .name('memorai')
  .description('MemorAI Command Line Interface')
  .version('1.0.0');

// Parse arguments
if (process.argv.length === 2) {
  program.help();
} else {
  program.parse();
}
