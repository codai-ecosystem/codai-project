import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import { formatError, formatSuccess, formatInfo } from '../utils/format.js';

const config = new Conf({
    projectName: 'memorai-cli'
});

export function loginCommand(): Command {
    const command = new Command('login');

    command
        .description('Authenticate with MemorAI')
        .option('--api-key <key>', 'API key for authentication')
        .option('--endpoint <url>', 'MemorAI API endpoint', 'https://api.memorai.ro')
        .action(async (options) => {
            try {
                let apiKey = options.apiKey;

                // If no API key provided, prompt for it
                if (!apiKey) {
                    console.log(formatInfo('Please provide your MemorAI API key.'));
                    console.log(chalk.gray('You can find your API key at: https://memorai.ro/dashboard/api-keys'));
                    console.log('');

                    // In a real implementation, we'd use inquirer to securely prompt for the key
                    console.log(chalk.yellow('Please use: memorai login --api-key <your-api-key>'));
                    return;
                }

                const spinner = ora('Verifying API key...').start();

                // Test the API key by making a simple request
                try {
                    const response = await fetch(`${options.endpoint}/health`, {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    spinner.succeed('API key verified!');

                } catch (error) {
                    spinner.fail('Failed to verify API key');
                    throw error;
                }

                // Save configuration
                config.set('apiKey', apiKey);
                config.set('endpoint', options.endpoint);

                // Update environment variables for current session
                process.env.MEMORAI_API_KEY = apiKey;
                process.env.MEMORAI_ENDPOINT = options.endpoint;

                console.log('');
                console.log(formatSuccess('Successfully logged in to MemorAI!'));
                console.log('');
                console.log(chalk.gray('Configuration saved:'));
                console.log(`  Endpoint: ${chalk.cyan(options.endpoint)}`);
                console.log(`  API Key: ${chalk.green('***saved***')}`);
                console.log('');
                console.log(chalk.yellow('💡 You can now use all MemorAI CLI commands'));
                console.log(chalk.yellow('   Try: memorai stats'));

            } catch (error) {
                console.error(formatError('Login failed:'), error instanceof Error ? error.message : error);
                console.log('');
                console.log(chalk.yellow('Please check:'));
                console.log(chalk.yellow('  1. Your API key is correct'));
                console.log(chalk.yellow('  2. You have internet connectivity'));
                console.log(chalk.yellow('  3. The MemorAI service is available'));
                process.exit(1);
            }
        });

    // Logout command
    command
        .command('logout')
        .description('Remove stored authentication')
        .action(() => {
            try {
                config.delete('apiKey');
                delete process.env.MEMORAI_API_KEY;

                console.log(formatSuccess('Successfully logged out'));
                console.log(chalk.gray('API key removed from local storage'));

            } catch (error) {
                console.error(formatError('Logout failed:'), error instanceof Error ? error.message : error);
            }
        });

    // Status command
    command
        .command('status')
        .description('Show authentication status')
        .action(() => {
            const apiKey = config.get('apiKey') || process.env.MEMORAI_API_KEY;
            const endpoint = config.get('endpoint') || process.env.MEMORAI_ENDPOINT || 'https://api.memorai.ro';

            console.log(formatInfo('Authentication Status:'));
            console.log('');
            console.log(`API Key: ${apiKey ? chalk.green('✅ Set') : chalk.red('❌ Not set')}`);
            console.log(`Endpoint: ${chalk.cyan(endpoint)}`);
            console.log('');

            if (!apiKey) {
                console.log(chalk.yellow('You are not logged in. Use "memorai login" to authenticate.'));
            } else {
                console.log(chalk.green('You are logged in and ready to use MemorAI CLI.'));
            }
        });

    return command;
}
