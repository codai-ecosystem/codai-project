import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { formatError, formatSuccess, formatBytes } from '../utils/format.js';

export function statsCommand(): Command {
    const command = new Command('stats');

    command
        .description('Show memory statistics')
        .option('-a, --agent-id <id>', 'Show stats for specific agent')
        .option('--format <type>', 'Output format (table|json)', 'table')
        .action(async (options) => {
            try {
                const client = await getClient();
                const spinner = ora('Fetching statistics...').start();

                const stats = await client.getStats(options.agentId);

                spinner.succeed('Statistics retrieved');

                if (options.format === 'json') {
                    console.log(JSON.stringify(stats, null, 2));
                    return;
                }

                // Display formatted statistics
                console.log('');
                console.log(formatSuccess(`MemorAI Statistics${options.agentId ? ` for agent "${options.agentId}"` : ''}`));
                console.log('');

                // Basic counts
                console.log(chalk.bold('📊 Memory Counts:'));
                console.log(`   Total Memories: ${chalk.cyan(stats.totalMemories?.toLocaleString() || '0')}`);
                console.log(`   Unique Agents: ${chalk.yellow(stats.uniqueAgents?.toLocaleString() || '0')}`);
                console.log(`   Storage Size: ${chalk.magenta(formatBytes(stats.storageSize || 0))}`);
                console.log(`   Average Size: ${chalk.green(formatBytes(stats.averageMemorySize || 0))}`);

                // Common entity types
                if (stats.commonEntityTypes && stats.commonEntityTypes.length > 0) {
                    console.log('');
                    console.log(chalk.bold('📈 Common Entity Types:'));
                    stats.commonEntityTypes.slice(0, 5).forEach(({ entityType, count }: { entityType: string; count: number }) => {
                        console.log(`   ${entityType}: ${chalk.green(count.toLocaleString())}`);
                    });
                }

                // Creation trends  
                if (stats.creationTrends && stats.creationTrends.length > 0) {
                    console.log('');
                    console.log(chalk.bold('� Creation Trends (Recent):'));
                    stats.creationTrends.slice(-7).forEach(({ date, count }: { date: string; count: number }) => {
                        console.log(`   ${date}: ${chalk.blue(count.toLocaleString())}`);
                    });
                }

                console.log('');

            } catch (error) {
                console.error(formatError('Failed to fetch statistics:'), error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });

    return command;
}
