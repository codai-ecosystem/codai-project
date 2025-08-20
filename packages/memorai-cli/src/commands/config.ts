import { Command } from 'commander';
import chalk from 'chalk';
import Conf from 'conf';
import { formatError, formatSuccess, formatInfo } from '../utils/format.js';

const config = new Conf({
    projectName: 'memorai-cli',
    schema: {
        apiKey: {
            type: 'string'
        },
        endpoint: {
            type: 'string',
            default: 'https://api.memorai.ro'
        },
        defaultAgentId: {
            type: 'string',
            default: 'default'
        }
    }
});

export function configCommand(): Command {
    const command = new Command('config');

    command
        .description('Manage CLI configuration')
        .action(() => {
            // Show current config when no subcommand is provided
            showConfig();
        });

    // Set configuration
    command
        .command('set')
        .description('Set configuration values')
        .argument('<key>', 'Configuration key (apiKey|endpoint|defaultAgentId)')
        .argument('<value>', 'Configuration value')
        .action((key, value) => {
            try {
                const validKeys = ['apiKey', 'endpoint', 'defaultAgentId'];

                if (!validKeys.includes(key)) {
                    console.error(formatError(`Invalid configuration key: ${key}`));
                    console.log(formatInfo(`Valid keys: ${validKeys.join(', ')}`));
                    process.exit(1);
                }

                config.set(key, value);
                console.log(formatSuccess(`Set ${key} = ${key === 'apiKey' ? '***hidden***' : value}`));

                // Update environment variables for current session
                if (key === 'apiKey') {
                    process.env.MEMORAI_API_KEY = value;
                } else if (key === 'endpoint') {
                    process.env.MEMORAI_ENDPOINT = value;
                }

            } catch (error) {
                console.error(formatError('Failed to set configuration:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    // Get configuration value
    command
        .command('get')
        .description('Get configuration value')
        .argument('<key>', 'Configuration key')
        .action((key) => {
            try {
                const value = config.get(key);

                if (value === undefined) {
                    console.log(chalk.yellow(`Configuration key "${key}" is not set`));
                } else {
                    const displayValue = key === 'apiKey' ? '***hidden***' : value;
                    console.log(`${key} = ${displayValue}`);
                }

            } catch (error) {
                console.error(formatError('Failed to get configuration:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    // Delete configuration value
    command
        .command('delete')
        .alias('del')
        .description('Delete configuration value')
        .argument('<key>', 'Configuration key')
        .action((key) => {
            try {
                if (config.has(key)) {
                    config.delete(key);
                    console.log(formatSuccess(`Deleted configuration key: ${key}`));
                } else {
                    console.log(chalk.yellow(`Configuration key "${key}" does not exist`));
                }

            } catch (error) {
                console.error(formatError('Failed to delete configuration:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    // Reset all configuration
    command
        .command('reset')
        .description('Reset all configuration to defaults')
        .option('--confirm', 'Skip confirmation prompt')
        .action((options) => {
            try {
                if (!options.confirm) {
                    console.log(chalk.red('This will delete all saved configuration. Use --confirm to proceed.'));
                    return;
                }

                config.clear();
                console.log(formatSuccess('Configuration reset to defaults'));

            } catch (error) {
                console.error(formatError('Failed to reset configuration:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    // Show configuration path
    command
        .command('path')
        .description('Show configuration file path')
        .action(() => {
            console.log(config.path);
        });

    return command;
}

function showConfig(): void {
    console.log(formatInfo('Current Configuration:'));
    console.log('');

    const apiKey = config.get('apiKey');
    const endpoint = config.get('endpoint');
    const defaultAgentId = config.get('defaultAgentId');

    console.log(`API Key: ${apiKey ? chalk.green('***set***') : chalk.red('not set')}`);
    console.log(`Endpoint: ${chalk.cyan(endpoint)}`);
    console.log(`Default Agent ID: ${chalk.yellow(defaultAgentId)}`);
    console.log('');
    console.log(chalk.gray(`Config file: ${config.path}`));
    console.log('');

    if (!apiKey) {
        console.log(chalk.yellow('💡 Set your API key with: memorai config set apiKey <your-key>'));
        console.log(chalk.yellow('   Or use: memorai login'));
    }
}
